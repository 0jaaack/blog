---
title: React에서 Tree를 다루는 더 쉬운 방법
publishedDate: Apr 07 2025
slug: tree-in-react
---

얼마 전 사이드바 관련 작업의 코드를 리뷰하면서 깨달았던 것과 느꼈던 점들을 정리했다. 전통적으로 사이드바에서 중첩 목록을 렌더링 할 때는 보통 트리(Tree) 자료 구조로 표현되는 경우가 많다. 근데 Tree 구조 그대로 표현하기보다는 배열이 더 편한 것 같다.

![Side Bar Example](/images/tree-in-react/side-bar-example.png)_dnd-kit의 SortableTree 예시_


코드를 리뷰하면서 dnd-kit 라이브러리의 SortableTree 컴포넌트 구현[^1]을 살펴보게 되었는데, 특이한 부분 한 가지가 눈에 띄었다. 외부에서 정의한 Tree 형태의 데이터를 연산하면서 1차 배열 형태로 가공해 사용하고, 변경된 배열을 다시 Tree 형태로 build해 저장했다. 코드 리뷰를 하면서 의문이 들었는데 몇 번의 생각을 거쳐 나름대로의 그 이유를 추측할 수 있었다.

## 연산이 단순해진다

Tree 구조에서는 특정 노드를 탐색하기 위해 재귀적인 탐색 과정이 필수지만, 배열은 그렇지 않다. `find()`, `findIndex()`와 같은 내장 메서드를 더 쉽게 활용할 수도 있다.

전체 Tree 내에서 두 항목의 전후 관계를 비교하는 데에도 더 편했는데, 배열은 단순히 index만 비교해주면 되는 반면 Tree는 복잡한 탐색 과정을 필요로 했다.

## 렌더링하기 더 편하다

드래그 앤 드랍 기능은 각 항목 간의 탐색과 연산이 많아 배열이 더 효율적인 순간이 많았다. 하지만 연산의 용이성을 제외하고서라도 배열이 지닌 이점이 또 존재한다.

바로 **불변성**을 지키기 편리하다는 점이다. 예를 들어 다음과 같은 Tree의 구조가 있다고 생각해보자.

```tsx
const tree = [
  {
    id: 1,
    isCollapsed: false,
    children: [
      {
        id: 2,
        isCollapsed: false,
        children: [],
      },
      {
        id: 3,
        isCollapsed: false,
        children: [
          {
            id: 4,
            isCollapsed: true,
            children: [],
          },
        ],
      },
    ],
  },
];
```

여기서 `id`가 `4`인 노드의 자식 노드들이 보이지 않도록 `isCollapsed` 값을 수정한다면, id가 3인 노드 그리고 id가 1인 노드의 참조를 변경해야 한다는 점이다.

```tsx
const tree = [
  {
    id: 1, // 새로운 참조값을 가져야 함
    isCollapsed: false,
    children: [
      {
        id: 2,
        isCollapsed: false,
        children: [],
      },
      {
        id: 3, // 새로운 참조값을 가져야 함
        isCollapsed: false,
        children: [
          {
            id: 4, // 새로운 참조값을 가져야 함
            isCollapsed: false, // 값이 변경됨
            children: [],
          },
        ],
      },
    ],
  },
];
```

만약 상위 노드의 참조값이 변경되지 않으면 Tree의 재귀적 렌더링 구조에서 상위 노드의 리렌더링이 발생하지 않을 수 있다. 컴포넌트의 props 구조와 메모이제이션 여부를 따져봐야한다. 좀 더 머리가 아파지고 예상치못한 이슈가 발생하기 쉬운 조건이 된다.

반면 배열 구조는 개별 아이템만 변경하면 되므로 불변성을 유지하는 것이 간편하다. 해당 노드 그리고 목록 전체의 참조만 신경써주면 노드 상태가 반영될 여지가 많다.

## 중첩 객체 구조에서 불필요한 리렌더링을 줄이고 싶다면

위에서 살펴봤듯이 중첩 객체 구조에서는 때에 따라 리렌더링이 발생하지 않을 수도 있다. 반대로 리렌더링이 너무 많이 일어날 수도 있는데, 노드를 렌더링하는 데 관련이 없는 값이 자주 바뀌는 경우에 그렇다.

내가 겪었던 상황은 페이지의 내용이 바뀔 때마다 사이드바 전체가 리렌더링되는 현상이었다. 페이지 목록을 렌더링하는 데 다음과 같은 과정을 거치게 된다고 생각해보자.

```tsx
function buildPageNodeTree() {
  return {
    id: page.id,
    name: pages.title,
    children: pages.children.map(buildPageNodeTree),
  };
}

function PageList({ pages }) {
  // pages를 기반으로 tree 객체를 만들어낸다.
  const pageList = pages.map(buildPageNodeTree);

  // render
  return pageList.map((pageNode) => (
    <PageListItem key={pageNode.id} pageNode={pageNode} /> // pageNode가 그대로 props로 전달된다
  ));
}

function PageListItem({ node }) {
  const name = node.name;

  // ...render
}
```

페이지의 내용이 바뀔 때마다 `pages`도 새로운 참조를 갖게 되는데, 그 때마다 `pageList` 내부의 모든 `pageNode`가 새로운 참조를 갖게 된다.

중첩 객체에서 하위의 객체를 그대로 prop으로 전달하다보니 참조가 새로워지면 보통 전체가 리렌더링되기 쉬운 구조가 된다.


```tsx
function List() {
  const pageList = pages.map(buildPageNodeTree);

  // render
  return pageList.map((pageNode) => (
    <PageListItem key={pageNode.id} pageId={pageNode.id} /> // 메모이제이션이 적용된 컴포넌트일 경우
  ));
}

function PageListItem({ pageId }) {
  const name = useSelector((store) => store.pages.find((page) => page.id === pageId)?.title);

  // ...render
}
```

이를 위해 내가 생각한 방법은 노드를 표현할 수 있는 간접적인 원시값으로 props를 구성하는 것이다. 이 가정은 컴포넌트에 메모이제이션이 적용되었음을 가정한 상태에서만 동작한다.

각 아이템에서는 부여받은 값을 이용해 context 혹은 store에서 값을 가져와 사용할 수 있다. 그러면 렌더링과 관련되지 않은 값이 변경 돼 불필요한 리렌더링이 발생할 여지가 적다.

객체를 중첩해 전달할 때는 객체 자체를 전달하기보다 간접적인 전달 방식이 불필요한 리렌더링을 줄이는데 유리하다고 생각한다.

[^1]: https://github.com/clauderic/dnd-kit/blob/master/stories/3%20-%20Examples/Tree/SortableTree.tsx
