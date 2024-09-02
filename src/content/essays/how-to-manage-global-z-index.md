---
title: z-index를 전역에서 관리하기
publishedDate: Jul 28 2024
slug: how-to-manage-global-z-index
---

복잡한 웹 어플리케이션의 경우, UI 간 우선순위 관리가 중요해진다. 그 과정에서 CSS의 z-index 속성을 쓰는 것이 필수다. 어플리케이션의 여러 요소의 z-index를 부여하다보면 통합해서 관리하고픈 욕구가 나오게 된다. 하지만 z-index에 컨벤션을 적용하는 과정에서 많은 문제가 생기기 마련이다.

우리 회사에서 만들고 있는 제품도 '노션과 같은 문서 생성'과 'IDE를 활용한 코드 작성'이 핵심적인 기능 중 하나다. 복잡한 프로덕트를 다루다보니 동적인 UI를 만들어야 할 일이 많았고 그에 따라 z축 높이를 조정해줄 일도 많았다.

예를 들어 이런 요구사항이 있다고 해보자.
  - 코드 에디터 내에는 코드를 편하게 작성할 수 있게 해주는 자동 완성 창이 있다.
  - 자동 완성 창은 코드 에디터 하단에 있는 결과 탭보다 높은 z축 높이를 가져야한다.
  - 하지만 사이드바 메뉴에 있는 메뉴에 마우스를 갖다대면 뜨는 툴팁보다는 낮아야 한다.

이를 코드로 나타낸다면 이렇게 만들 수 있다.

```css
:root {
  --z-index-workflow-result-tab: 100,
  --z-index-code-auto-complete: 200,
  --z-index-tooltip: 300,
}
```

혹은 JavaScript를 통해 관리해준다면

```jsx
const Z_INDEX = {
  WORKFLOW_RESULT_TAB: 100,
  CODE_AUTO_COMPLETE: 200,
  TOOLTIP: 300,
};
```

이렇게도 나타낼 수 있다.

특정 UI 요소마다 z-index 값을 만들어서, 전역 변수로 등록해두는 것이다. 사용하는 CSS 방식에 따라 다르지만, 보통 CSS의 variables나 Javascript의 Object 형태로 만들기 마련이다. 근데 **이렇게 하면 대부분 실패한다.** 나도 처음 z-index의 위계를 정할 때 했던 실수인데, 이렇게 단순히 값으로만 z-index를 제어하려는 시도는 보통 실패하기 마련이다.

이유는 간단한데, **Stacking Context 때문이다**. Stacking Context(쌓임 맥락)는 z축의 우선도를 정하는 한 기준이다. 특정 조건에 의해서 Stacking Context를 형성하는 경우 자식 요소는 해당 Context 내에서만 유효하게 된다. 따라서 Context 바깥의 요소보다 아무리 z-index가 높아도 우선되어 나올 수 없는 것이다.[^1]

```html
<div id="auto-complete" style="position: relative; z-index: 100"></div> <!-- div#tooltip보다 높게 위치한다 -->
<div style="position: relative; z-index: 1;"> <!-- Stacking Context를 형성한다 -->
  <div id="tooltip" style="position: relative; z-index: 300;"></div> <!-- div#auto-complete보다 낮게 위치한다 -->
</div>
```

z-index는 그 값보다 element의 구조에 영향을 받는 경우가 많다. 단순히 값으로만 z축을 제어하는 것은 불가능하다. 그러면 어떻게 동적인 요소들의 z축 위계를 관리할 수 있을까? 나는 세 가지 정도를 생각해보았다.

1. HTML의 구조를 가진 z-index 구조 갖기

```jsx
const Z_INDEX = {
  AUTO_COMPLETE: 200,
  DIALOGUE_WRAPPER: 300,
};
```

z-index가 HTML 구조의 한계에 부딪힌다면 반대로 HTML 구조에 맞게 바꿔줄 수 있다. z-index가 축소판 HTML 같은 역할을 하는 것이다. 꽤 그럴듯한 생각이지만 정답이라고 할 수는 없다. 왜냐하면 z-index 구조를 HTML에 맞게 관리해주는건 힘든 일이다. 기능이 추가되고 새로운 UI가 추가될 수록 그에 맞게 적절한 z-index 구조를 갖추는 건, 개발 세계에서 너무나 팔자좋은 일이기 때문에 좋은 방법은 아닌 것 같다.


2. Stacking Context를 형성하지 않기

불필요하게 Stacking Context를 형성하지 않으면 z-index가 무시될 일이 없다. 불필요하게 Stacking Context를 발생시키지만 않으면 하나의 Stacking Context안에 위치하게 되므로 z-index 위계를 쉽게 관리할 수 도 있다.

하지만 생각해보면 이것도 답이 될 수가 없다. 예를 들어 모달 내에서 추가적인 UI가 표시되는 경우라면? UI 요소가 모달의 z-index에 갇혀버릴 수 밖에 없다. 이 아이디어는 기본적으로 z-index를 가지는 요소 내에서 또 다른 요소를 렌더링하지 않아야 한다는 가정에 기댈 수 밖에 없다.

또 Stacking Context를 형성하는 속성을 쓰지 않기도 힘든 일이다. Stacking Context는 `opacity`, `transform`, `will-change` 등을 적용하면 생기기도 한다. 필수적인 속성은 아니지만 이들 없이 작성하는 것은 가끔 상당히 피곤하다.

3. 속박과 굴레에서 벗어나기

세 번째 아이디어는 아예 Context의 영향을 받지 않는 곳으로 보내버리는 전략이다. `body` 의 자식 요소에 렌더링시켜 다 같은 위계 안에서 우선순위를 정하는 것이다. 보통 웹을 렌더링할 수 있는 라이브러리에는 요소의 위치를 지정할 수 있는 옵션이 있는데, 대표적으로 react의 portal이 있다.[^2] 또 Mui, CodeMirror와 같은 라이브러리에서는 플러그인으로 특정 UI 요소의 렌더링 위치를 정할 수 있다.

1번의 방법에서 구조에 얽매이는 문제도 없고, 2번 방법 같이 수도승같은 코드를 작성하지 않아도 된다. 그저 위계를 관리해줄 UI 요소들을 body로 밀어넣으면 되는 것이다.

단점이라면, 부모 요소에 영향을 받는 경우 대응하기 힘든 점이다. `position`이 `absolute`인 요소의 경우 부모 요소의 위치에 영향을 받는다. 세 번째 방법을 쓰면 부모가 `body`가 되어버려 요소의 위치값을 잃게 되어버린다. 특히나 그런 동적인 UI 요소일 수록 부모 요소 위치값이 필요한 경우가 많다.

나 또한 그런 일을 겪고 별도의 해결책을 찾다가 floating-ui[^3]라는 라이브러리를 적용했다. 엘리먼트의 style 속성을 JavaScript를 통해 제어해 마치 `position: absolute;` 가 적용된 것 처럼 만들어준다. 우리 회사는 리액트를 사용하므로 floating-ui와 portal을 결합해 `FloatingPortal`이라는 컴포넌트를 만들게 되었다.

```jsx
<FloatingPortal anchorEl={parentEl}>
  <AutoComplete />
</FloatingPortal>
```

물론 아직 완벽한 형태는 아니지만 현재 필요로 하는 케이스에서는 만족스럽게 구현할 수 있었다. 사실 동적 UI 간 z-index 겹침은 흔히 일어나는 일은 아니므로 어느정도 엣지케이스에 대응하는 것이 z-index를 관리하는데 어느정도 만족스러운 방향이었던 것 같다.

[^1]: 자세한 내용은 [MDN](https://developer.mozilla.org/ko/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)을 참조하자.

[^2]: 자세한 내용은 [공식 문서](https://react.dev/reference/react-dom/createPortal)를 참조하자.

[^3]: popper.js라는 이름이었다가 [floating-ui](https://floating-ui.com/)로 바뀌었다.
