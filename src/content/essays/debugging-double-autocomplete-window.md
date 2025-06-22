---
title: 디버깅 - 왜 자동 완성 창이 두 개가 뜰까
publishedDate: Jun 12 2025
slug: debugging-double-autocomplete-window
---

버그의 원인을 찾아 디버깅하는 과정을 남겨보면 좋을 것 같아 작성해본다.

어느 날 코드 에디터에서 자동완성 창이 두 개가 뜨는 현상이 발생했다. 특정 입력 조건에 의해서 두 번 뜨는게 아니라, 자동 완성 창 자체가 두 번 뜨는 문제였다. 최근 몇 달간은 관련 코드를 수정한 사항이 없었기에 원인을 알 수가 없는 문제였다.

![double-autocomplete-window](/images/debugging-double-autocomplete-window/double-autocomplete-window.png)_문제가 발생했던 상황_

참고로 우리는 코드 에디터를 렌더링하기 위해 CodeMirror라는 라이브러리를 사용하고 있다. 그리고 CodeMirror의 React 바인딩을 위해 @uiw/react-codemirror 라이브러리를 사용하고 있다.

### 변경점 조사

보통 문제가 발생했을 때는 최근 변경이력을 살펴보면 쉽게 찾아낼 수 있지만, 이번에는 최근 몇 달간은 자동완성과 관련해 변경된 사항이 없었다. 그렇다면 간접적인 영향을 의심해봐야한다. 가장 의심되는건 패키지 의존성과 관련된 부분이었다. 패키지 버전이 바뀌면서 버그가 발생하는 경우가 아닐까 싶었다. 우리 회사는 yarn을 쓰므로, `yarn.lock` 파일이 변경된 사항이 있었는 지 확인했다.

관련해서 최근에 변경된 이력이 확인되었다. 얼마 전 패키지 의존성을 개선하는 작업을 하면서 유령 의존성을 제거하고, 패키지 의존성을 명확하게 해주는 작업을 했다. 암시적으로 `@codemirror/autocomplete` 패키지를 import하고 있어, 명확하게 package.json 의존성에 추가해준 것이다.

```json
// package.json
{
  "dependencies": {
    "@codemirror/autocomplete": "^6.18.0"
  }
}
```

### semver Caret(^) Range

패키지 의존성을 명시적으로 추가해줬을 뿐인데, 다른 버전의 패키지가 설치될 수 있을까? 그럴 수 있다. semver의 유의적 버전 규칙에는 캐럿 범위 규칙이 있다.[^1]. npm은 기본적으로 install할 때 캐럿(^)을 붙여 추가한다. 캐럿 범위는 주(Major) 버전을 올리지 않는 범위에서, 가장 높은 버전을 나타낸다.

정확하게 어떤 버전으로 Resolution 되었는 지는 `yarn.lock`과 같은 .lock 파일을 확인해도 좋지만, `yarn why (패키지 명)` 혹은 `npm explain`, `pnpm why`를 사용해 확인하면 편하다.

```bash
$ yarn why @codemirror/autocomplete
├─ @codemirror/lang-javascript@npm:6.1.4
│  └─ @codemirror/autocomplete@npm:6.18.0 [1a94b] (via npm:^6.0.0 [1a94b])
│
├─ @codemirror/lang-sql@npm:6.4.0
│  └─ @codemirror/autocomplete@npm:6.18.0 [f599d] (via npm:^6.0.0 [f599d])
│
├─ @uiw/codemirror-extensions-basic-setup@npm:4.19.9 [ab1ad]
│  └─ @codemirror/autocomplete@npm:6.18.0 [1a94b] (via npm:^6.0.0 [1a94b])
│
└─ codemirror@npm:6.0.1
   └─ @codemirror/autocomplete@npm:6.18.0 [1a94b] (via npm:^6.0.0 [1a94b])
```

해당 커밋 이전에서는 autocomplete@6.18.0 버전을 사용하고 있었다. `^6.18.0`으로 설치한 커밋에서는 6.18.6 버전이 설치된다.

6.18.0 버전에서 빌드해 개발서버에서 확인해보면 문제가 발생하지 않는 것을 확인할 수 있다. 반면 6.18.6으로 설치된 버전에서는 문제가 발생한다.

그러면 6.18.0에서는 문제가 안됐던 것이, 왜 6.18.6에서는 문제가 생겼던걸까. @codemirror/autocomplete 패키지의 변경사항을 추적하다가 6.18.2 버전의 changelog에서 의심되는 부분을 찾았다.[^2]

```md
## 6.18.2 (2024-10-30)

### Bug fixes

Don't immediately show synchronously updated completions when there are some sources that still need to return.
```

위의 패치사항이 가장 의심됐다. 여러 자동완성 소스들 중, 하나만 완료되었을 때 바로 보여지지 않고 나머지 소스들도 기다리도록 한 버그 수정이다. 기존에는 여러 자동완성 소스 중 가장 먼저 완료된 소스만 떴다가 위의 버그가 수정되면서 모든 자동완성 소스를 기다리게 된다면? 두 개가 한 번에 뜰 수도 있게 된다.

### 해결하기

우리는 CodeMirror에 익스텐션을 추가해 사용한다. JavsScript Language Pack에 외부 변수들을 추가해주어 사용하고, 에디터 내에서 사용되는 전용 템플릿 언어를 위한 Language Pack, 그리고 자동완성 기능을 활성화시켜주는 AutoComplete Extention 등을 사용한다.

처음에는 Language Pack과 Autocomplete Extention을 중복으로 설정한게 문제인가 싶어 Autocomplete를 제거해봤다. 신기하게 절반의 문제만 해결되었다. 에디터는 multiline 모드 그리고 singleline 모드가 있다. multiline 모드에서는 자동완성 창이 하나만 떠 문제가 해결되었는데, singleline 모드에서 자동완성이 아예 안뜨는 문제가 생겼다.

### 다시 제대로 해결하기

우리가 사용하는 CodeMirror 컴포넌트, 그러니까 @uiw/react-codemirror 라이브러리에서 제공하는 `<CodeMirror />` 컴포넌트에는 `basicSetup` prop을 통해 기본 설정들을 따로 설정하지 않아도 되도록 해준다. multiline 모드에서는 `true`로 설정되어있어 기본 Autocomplete Extention이 설정되어있는데, 이 때문에 multiline 모드에서는 Autocomplete Extention이 두 번 설정되고 있었다. 그 이전에는 별 문제없었지만 버전이 업그레이드 된 시점에서 두 개의 Autocomplete Extention이 문제를 일으키게 되었다.

다행히 `basicSetup`은 특정 설정만 제외할 수 있었다. `true`에서 `{ autocompletion: false }` 옵션으로 바꿔 기본 Autocomplete Extention이 적용되지 않도록 설정했다. 어떤 경우든 우리가 설정한 Autocomplete Extention 하나만 설정될 것이다. 곧바로 개발 서버를 띄워 확인해보니 multiline 모드와 singleline 모드 둘 다 자동완성 창이 하나만 뜨는걸 확인할 수가 있었다.

패키지의 변경은 예민하다. 사소한 변경사항 하나가 기존에 암시적으로 동작하게 만들던 버그를 해결해 새로운 문제를 드러내도록했다. 해당 버그는 발견된 후 금방 고쳐져 다행이었지만, 자동완성이 두 번 뜨는 문제같은 경우 테스트로 잡아내기 힘든 종류였어서 직접 써보면서 인지하지 않는 이상 정적으로 잡아내기 힘든 버그였다. .lock 파일이 변경되어 패키지 변경사항이 생기는 경우 좀 더 신경써서 챙기는 수 밖에 없을까 고민이 된다.

[^1]: https://github.com/npm/node-semver?tab=readme-ov-file#versions
[^2]: https://github.com/codemirror/autocomplete/blob/main/CHANGELOG.md#6182-2024-10-30
