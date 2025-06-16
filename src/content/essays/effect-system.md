---
title: 발표 - Effect System으로 효과적인 프로그램을 만들기
publishedDate: Sep 29 2024
slug: effect-system
---

> 제가 참여 중인 스터디에서 발표했던 자료의 스크립트로, 구어체로 작성되었습니다.

오늘 발표는 ‘어떻게 프로그램의 코어를 탄탄히 만들 수 있을까’에 관한 이야기입니다. 웹 어플리케이션, 프로그램에서 이런 저런 표현 방식을 제외하면 그 속에 프로그램의 본질, 컨셉이 드러나게 됩니다. 모두 탄탄한 코어 로직 혹은 비즈니스 로직, 혹은 도메인 모델이라고 불리는 코어에서 출발한다고 생각합니다.

저는 회사에서 만드는 제품이 어려운 동작, 그리고 모듈과 시스템 간의 얽히고 섥힌 관계들을 가지고 있어 이들을 풀어내는데 노력을 많이 했습니다. 복잡한 의존성 계산이나 코드 실행, 전용 템플릿 문법들을 풀어내면서 이전부터 코어 로직의 중요성을 느꼈고, 어떻게 더 탄탄한 코어를 구축할 수 있을까에 대해서 고민했습니다. 오늘 얘기할 Effect도 그런 점에서 느낀 제 답변 중 하나일 것 같아요.

## 우리 모두가 외면하는 복잡성

우리가 프로그램을 작성하는 방식에는 여러가지 문제점들이 따라와요. 그 중에서도 오늘은 복잡성에 대해서 집중적으로 얘기해봅시다. 저는 ‘복잡함’이 프로그램의 주요 특성들 중 하나라고 생각해요. 하지만 의외로 복잡성에 대해 간과하고 있는 것 같아요. 모두가 지저분한 코드를 좋아하지 않지만, 사실 그렇다고 적극적으로 개선하지는 않습니다. 왜냐면 굳이 당장 잘 돌아가는 코드를 파헤칠 필요도 없고, 괜히 파헤쳤다가 돌이킬 수 없는 늪에 빠질 수도 있으니까요.

그렇게 코드들은 한 번 작성되면, 별 일 없는 이상 얌전히 놔둬지고 방치됩니다. 그러다가 코드가 점점 달라붙고 복잡해지기 시작하면 ‘기술 부채’라벨을 붙여주기도 하고요, 언젠가 리팩토링이라는 걸로 해결해야 한다고도 말합니다.

## 복잡성을 이겨낸다면

사실 복잡성을 제어하면 더 높은 단계로 가는 길이 될 수도 있어요. 지금까지 해낸 일로 더 복잡한 일, 더 고차원의 일을 해낼 수 있는 거죠. (다른 분이 발표하셨던) 도커, 쿠버네티스 발표를 떠올려봅시다. 쿠버네티스가 자유롭게 노드를 관리하는 건, 어플리케이션이 실행되는 런타임이 ‘컨테이너’라는 도구로 단순화되어있기에 가능한 일이라고 생각해요. 컨테이너의 라이프사이클 관리와 유기적인 생성, 복제, 로드 밸런싱 같은 어려운 일들은, 컨테이너라는 개념이라는 토대 위에 세워졌어요.

웹 개발도 비슷해요. 10여년 전만 해도 널리 쓰이던 jQuery를 이제는 대부분 쓰지 않고, 리액트와 웹 프레임워크들을 사용하는 이유는, 최근의 웹 프레임워크들이 더 높은 복잡성을 감당할 수 있어서가 아닐까요? UI를 컴포넌트 단위로 선언해 조합해 나타내는 방식은 그 전에 비해 훨씬 효과적인 방식이죠. 네트워크도 적절한 예시가 될 것 같은데, 네트워크 7계층의 각 계층은, 다음 계층을 위해 복잡한 네트워크 로직과 물리적인 부분들을 켜켜이 추상화한 결과입니다. 덕분에 라우터와 허브, TCP/IP 같은 것들에 대한 전문적인 지식이 없어도 네트워크 요청을 손쉽게 할 수 있죠.

복잡성을 제어하는 건 단순히 ‘유지 보수를 용이하게 할 수 있다’라는 명목에서 떠나 더 높은 수준의 프로그램을 만들 수 있는 일이기도 합니다. 개발자가 더 복잡한 일, 더 어려운 일들을 해낼 수 있도록 만드는 건 어쩌면 더 높은 복잡성을 다룰 수 있는 개발을 해낼 수 있느냐에 달려있지 않을까 생각해요.

## 왜 복잡한걸까요?

왜 프로그램이 복잡해지는 걸까요? 변수명을 깔끔하게 짓지 못해서, 혹은 깔끔한 코드 스타일이 아니라서 복잡해지는 걸까요? 그런 것들이 문제가 될 수 있겠지만, 그게 전부는 아닐 것 같아요. 프로그램의 복잡성의 원인은 여러가지가 있을 것 같은데요. 오늘 발표에서는 두 가지 정도를 꼽아보려고 해요.

1. 프로그램의 숨겨진 입력과 숨겨진 출력

   ```tsx
   function square(x: number): number {
     return x * x;
   }
   ```

   함수에는 매개변수와 반환값이라는 일반적인 입력과 출력이 있죠. `x` 는 함수 `square` 의 매개변수이며 `number` 타입입니다. 출력은 마찬가지로 `number` 을 반환하네요. 이와 반대로 숨겨진 입력 그리고 출력이 존재하기도 합니다.

   ```tsx
   function processNext(): void {
     const message = inboxQueue.popMessage();

     if (message != null) {
       process(message);
     }
   }
   ```

   위의 함수에는 매개변수도 없고 반환값도 없지만, 숨겨진 입력(`inboxQueue`)과 숨겨진 출력(`process`)이 있습니다. 이런 사이드 이펙트들은 타입으로 잡아낼 수도 없고, 추적하기도 어렵죠. 명시적이지 않은 입력과 출력이 모여 복잡성이 형성됩니다. 함수 시그니처(타입 선언) 아래에서 나타나는 많은 일들을 나타낼 수가 없기 때문이죠. 보통 부작용을 가진 함수들을 표면 아래에 거대한 얼음이 숨겨져있는 빙산에 비유하기도 합니다.

2. 프로그램을 설명하기에 부족한 프로그래밍 모델

   프로그래밍 모델이 적절하지 않거나 너무 단순한 경우에는 프로그램의 복잡도가 더해지게 됩니다. 간단하게 React로 설명하자면, 상태를 단순히 `useState` hook으로 관리할 수도 있고, 조금 더 복잡한 상태 관리 같은 경우 `useReducer`, `Redux`와 같은 reducer로 관리해줄 수도 있죠. 여기서 조금 더 복잡해지면 `XState` 같은 유한 상태 머신을 쓸 수도 있을 것 같아요. 아주 복잡한 상태를 단순히 `useState`로 관리한다면 꽤나 복잡한 로직들이 더해지겠죠.

   사람들이 객체 지향 프로그래밍 아니면 도메인 주도 개발 같은 것들을 따르는 것도 큰 틀에서 프로그램을 모델링하는 방식의 하나라고 봐요. 프로그램을 모듈과 모듈 간의 상호작용으로 해석해 복잡한 프로그램을 풀어나가는 것이죠. 단순한 함수, 그리고 class로는 점차 높아지는 복잡성을 감당하지 못하게 됩니다. 점점 기법들과 새로운 개념들이 나오게 되죠. 프로그램이 실행되는 구조 혹은 코드의 구조에 비해 기능이 복잡하거나 많은 코드들은 쉽게 복잡해지기 쉽습니다.

## 그래서 Effect 등장

이제 Effect 이야기를 할 때가 된 것 같네요. Effect는 프로그래밍에서 발생하는 복잡함을 해소할 수 있는 좋은 도구입니다. 앞에서 도커(컨테이너)와 쿠버네티스(컨테이너 오케스트레이션)에 대해서 얘기했는데 이펙트도 이와 약간 비슷해요. 코드의 실행과 계산을 Effect라는 단위로 단순화하고 이를 이용해 효율적인 프로그래밍을 할 수 있도록 만드는 개념입니다. 함수와 유사하다고 느끼실 수도 있어요. Effect는 함수보다 조금 더 명시적이고 효과적인 프로그래밍 모델이라고 생각해주시면 좋을 것 같습니다.

Effect, 그리고 Effect System은 Scala라는 언어의 개발 진영에서 발달한 개념인데요. 저희는 TypeScript 진영에서 사용되는 Effect System 라이브러리인 Effect-TS를 사용해볼 예정입니다.

Effect는 기본적으로 세 가지 타입으로 구성됩니다. 예제를 통해 하나씩 알아볼게요.

```tsx
function getUser(id: string): User {
  return db.users.findById(id);
}
```

우선 위의 함수에서 user 정보를 가져오는 작업이 성공했을 때, 기대할 수 있는 타입은 `User`겠죠. 이걸 Effect에서는

```ts
type getUser = Effect<User>;
```

로 간단하게 표현해볼 수 있어요.

다음으로 user 정보를 가져오는데 실패한다고 생각해볼게요. 만약 `UserNotFoundError` 를 throw 한다면 이걸 Effect에서는 이렇게 표현해볼 수 있어요.

```tsx
type getUser = Effect<User, UserNotFoundError>;
```

두 번째 타입으로 예상되는 오류의 타입을 넣어줄 수 있어요. 기존 타입 시스템에서는 적을 일이 없는 타입이죠. Effect에서는 오류 유형을 보다 명시적으로 나타내기 위해 Error 타입을 나타내도록 합니다. 덕분에 프로그램에서 예상되는 에러를 쉽게 포착하게 해주고, 버그의 발생이 훨씬 줄어들 수 있게 되겠죠.

마지막으로 함수 안에 숨겨진 입력을 드러낼 수도 있어요. 사실 이건 기존에도 가능했던 것이긴 한데요. 위의 함수는

```tsx
function getUser(id: string, db: DatabaseService): User {
  return db.users.findById(id);
}
```

이렇게 db를 직접 인자로 넣어주게 만들 수도 있어요. 숨겨진 입력을 드러내는, 조금 더 명시적인 개발 방식이라고 할 수 있어요. Effect는 이와 비슷하게, Effect가 실행될 때 필요한 컨텍스트를 타입으로 나타낼 수 있어요.

```tsx
type getUser = Effect<User, UserNotFoundError, DatabaseService>;
```

이렇게 Effect는 세 가지 종류의 타입으로 구성된 타입입니다. 각각 `Success`, `Error`, `Requirements` 라고 하며 간단하게 `<R, E, A>`로 나타내기도 해요. `A`가 `Success` 입니다.

앞서 살펴보았던 숨겨진 입력과 출력 문제에서 Effect는 조금 더 유리한 입장입니다. 기존의 타입 시스템에서는 동작이 실패했을 때의 경우(Exception)는 표현하지 못하는데 반해, Effect는 Error를 명시적으로 선언하고 관리할 수 있게 하죠. 별 것 아니라고 생각할 수도 있지만, 명시적으로 나타내는 부분들이 모여 전체 프로그램을 예측 가능하고 안정적으로 만들어줄 수 있어요.

지금까지 설명한 걸로는 Effect에 대해 아직 감이 잘 오지 않으셨을 것 같아요. 그럼 이제 Effect를 만들고 실행하기까지 해봅시다.

## Effect를 만들고 실행해보기

간단한 Effect를 만들어봅시다. 예제로 어떤게 좋을까 고민해봤는데, 웹 페이지에서 DOM을 가져오는, 아주 간단한 프로그램을 만들어보려고해요.

```tsx
// Effect<Element | null, never, never>
const getElement = (selector: string) =>
  Effect.sync(() => document.querySelector(selector));
```

`Effect.sync` 로 간단하게 Effect를 만들어볼 수 있습니다. 여기서 Effect는 `Effect<Element | null, never, never>` 타입을 가지는데요. `Success`, 그러니까 성공했을 때의 값이 `Element | null` 이 된다는 걸 알 수 있어요.

`Error` 타입도 `never`인데요, `Effect.sync`는 기본적으로 에러가 발생하지 않는 동작임을 가정합니다..! 에러가 발생할 수 있는 경우에는 다른 함수를 써줄 수도 있어요.

마지막으로 `Requirements` 타입도 `never`입니다. 아무런 의존성이 필요하지 않다는 의미이기도 합니다.

```tsx
class ElementNotFoundError {
  // Tag는 Effect에서 에러를 판단하도록 돕는 필드입니다
  readonly _tag = "ElementNotFoundError";
}

// Effect<Element, ElementNotFoundError, never>
const getElement = (selector: string) =>
  Effect.try({
    try: () => {
      const element = document.querySelector(selector);
      if (element == null) {
        throw new ElementNotFoundError();
      }
      return element;
    },
    catch: () => new ElementNotFoundError(),
  });
```

아까와 비슷한 역할을 하는 `getElement` Effect인데, 조금 다른 방식으로 만들어보았습니다. 이번에는 `Error` 타입이 추가되었는데요. 만약 `selector`로 `element`를 가져올 수 없을 경우, 프로그램을 종료시키고 싶다는 가정을 해볼 수 있을 것 같아요. 그럴 때는 `Effect.try`를 이용해 만들어볼 수 있어요.

이렇게 만든 Effect를 실행하려면 `Effect.runSync` 를 쓰면 돼요.

```tsx
const result = Effect.runSync(getElement("#form"));
```

앞서 처리해줬던 에러를 처리해주려면, 이런 식으로 Tag를 처리하는 기능을 붙여줄 수도 있죠.

```tsx
const result = getElement("#form").pipe(
  Effect.catchTag("ElementNotFoundError", () =>
    // Error를 throw 해줍니다
    Effect.fail("Element not found")
  ),
  Effect.runSync
);
```

여기서 조금 더 나아가서, 컨텍스트를 주입하는 것도 해볼게요! 뭐 이런 기능도 있다 정도로 알고 넘어가시면 좋아요.

```tsx
class ElementNotFoundError extends Data.TaggedError("ElementNotFoundErro2")<{
  message: string;
}> {}

class Document extends Context.Tag("DocumentService")<Document, ParentNode>() {}

// Effect<Element, ElementNotFoundError, Document>
const getElement = (selector: string) =>
  // Service를 사용하기 위해서 기존 Effect 대신 새로운 방식으로 생성했습니다 ㅜ
  Effect.gen(function* () {
    const document = yield* Document;
    const element = document.querySelector(selector);
    if (element == null) {
      yield* new ElementNotFoundError({ message: "element not found" });
    }
    return element;
  });

const result = getElement("#form").pipe(
  Effect.catchTag("ElementNotFoundError", ({ message }) =>
    Effect.fail(message)
  ),
  Effect.provideService(
    Document,
    document.querySelector("form")! // 다른 Element 혹은 jsdom을 넣어줘도 됨
  ),
  Effect.runSync
);
```

여기까지 Effect System에 대해서 알아보았는데요. 사실 Effect는 많은 사람들에게 낯선 개념일테고, 이걸 배워서 현업에 적용할 수 있을까? 싶기도 한 개념일수도 있을 것 같아요. 하지만 단순히 사용하기 위해서 배운다기보다는, 새로운 패러다임을 학습하면서 프로그램을 조금 더 구조적인 방식으로 이해하는 데 도움이 될 수 있을거라 생각합니다.
