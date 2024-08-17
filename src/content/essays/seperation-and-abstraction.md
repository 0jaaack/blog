---
title: 함수, 분리말고 추출하자
publishedDate: Jun 2 2024
slug: seperation-and-abstraction
---

개발을 하면서 들었던 인상적인 조언은 ‘분리하기보다는 추출하라’는 말이다. 처음 이 말을 들었을 때부터 항상 마음 속에 간직하고 있었는데, 단순한 조언이지만 파급력이 매우 컸었고, 또 그렇기에 다른 사람들에게도 전하고 싶어서 쓰게 되었다.

코드는 필연적으로 비대해지고 복잡해진다. 프로그램이 발전할수록 기능이 점점 더 추가되고 요구사항도 많아진다. 처음에는 단순하게 작성했던 기능도 몇 달이 지나고 여러 사람의 손을 거치면 순식간에 어마무시한 코드 베이스가 만들어진다.

보통은 이런 상황에서 복잡한 **로직을 분리**하게 된다. 개인적으로는 분리하는 것과 추출하는 것은 엄연히 다른 개념이라고 생각한다.[^1] 두 개의 개념을 하나의 개념으로 뭉뚱그려서 생각하기 쉽지만 분리와 추출을 구분지어서 생각하게되면 추상화하는 방식이 달라지고, 프로그램의 복잡도도 완전히 달라질 수 있다.

간단하게 예시를 들어보자. 사용자들 중에서 나이가 65세 이상인 사용자들을 반환하는 함수를 작성한다고 하자. 그러면 아래처럼 나타낼 수 있다.

```js
function getSilverUsers(users) {
  const result = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    if (user.age >= 65) {
      result.push(user);
    }
  }

  return result;
}
```
여기서 로직을 추출해보면, 아래 코드처럼 해볼 수 있다.

```jsx
function filter(arr, callback) {
  const result = [];

  for (let i = 0; i < arr.length; i++) {
    if (callback(arr[i])) {
      result.push(arr[i]);
    }
  }

  return result;
}

function getSilverUsers(users) {
  return filter(
    users,
    (user) => user.age >= 65,
  );
}
```

`filter`라는 함수를 만들어 추출해보았다. 추출은 로직의 복잡도를 줄이는데 아주 좋은 수단이라고 생각한다. `getSilverUsers` 함수에서 하고 싶었던 일은 결국 특정 조건의 유저를 걸러내어 반환하는 일인데, 조금 더 간결하게 이해할 수 있게 됐다.

추출의 핵심은 딱 필요한 것만 남기는 것이다. `getSilverUsers`에서는 **users에서 특정 조건의 유저를 걸러내기** 이외에는 불필요하다고 볼 수 있다. 주로 배열의 문법적인 요소들이다. 그래서 의사적인 요소만 남도록 추출해준 것이다.

반면 분리는 그냥 코드를 밖으로 빼내는 것이다. 분리하는 코드가 로직의 의사적인 요소인지를 구분하지 않고, 단순히 코드를 분리하기만 하면 복잡도는 오히려 증가한다. 로직의 응집도가 떨어지게 되기 때문이다. 나는 단순히 코드를 분리하는 건 추출을 잘못 한 것이라고 생각한다.

그렇다면 추출의 장점인 간결함을 조금 더 확실하게 느끼기 위해서 조금 더 장황한 코드를 간결하게 해보자. 틱택토 게임[^2]을 간단하게 만들어보았다. 어느정도 의도적으로 장황하게 작성한 면이 있으므로 코드를 하나하나 세세하게 이해할 필요는 없다. 대신에 어떤 로직인지 간략하게 주석을 적어두었다.

복잡성을 줄이는 것 뿐만 아니라, 추출을 할 때의 또 다른 장점들도 있는데 그건 차차 얘기해보려고 한다.

```jsx
function runGame() {
  let turn = 0;
  const board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  while (turn < board.length * board.length) {
    // 현재 플레이어 판별하기
    const player = turn % 2 === 0 ? 'x' : 'o';
    console.log(`${player}'s turn`);

    // 보드의 랜덤한 곳에 수 놓기
    const targetIndex = Math.floor(Math.random() * (board.length * board.length - turn));
    let unmarkedIndex = 0;

    for (let i = 0; i < board.length * board.length; i++) {
      const rowIndex = Math.floor(i / board.length);
      const cellIndex = i % board.length;
      const cell = board[rowIndex][cellIndex];

      if (cell !== null) {
        continue;
      }
      if (unmarkedIndex === targetIndex) {
        board[rowIndex][cellIndex] = player;

        break;
      }

      unmarkedIndex += 1;
    }

    console.log(board);

    // 가로 검사
    for (const row of board) {
      let isAllCellsMarked = true;

      for (const cell of row) {
        if (cell !== player) {
          isAllCellsMarked = false;
          break;
        }
      }

      if (isAllCellsMarked) {
        console.log(`${player} win!`);
        return;
      }
    }

    // 세로 검사
    for (let j = 0; j < board.length; j++) {
      let isAllCellsMarked = true;

      for (const row of board) {
        const cell = row[j];

        if (cell !== player) {
          isAllCellsMarked = false;
          break;
        }
      }

      if (isAllCellsMarked) {
        console.log(`${player} win!`);
        return;
      }
    }

    // (0, 0) -> (2, 2) 검사
    {
      let isAllCellsMarked = true;

      for (let k = 0; k < board.length; k++) {
        const cell = board[k][k];

        if (cell !== player) {
          isAllCellsMarked = false;
          break;
        }
      }

      if (isAllCellsMarked) {
        console.log(`${player} win!`);
        return;
      }
    }

    // (0, 2) -> (2, 0) 검사
    {
      let isAllCellsMarked = true;

      for (let l = 0; l < board.length; l++) {
        const cell = board[l][board.length - 1 - l];

        if (cell !== player) {
          isAllCellsMarked = false;
          break;
        }
      }

      if (isAllCellsMarked) {
        console.log(`${player} win!`);
        return;
      }
    }

    turn += 1;
  }

  // 무승부 시 처리 로직
  console.log('draw');
}

runGame();
```

위의 로직을 단순하게 만들어보자. 가장 먼저 눈에 띄는 점은 가로, 세로, 대각선 라인을 검사하는 로직이 복잡해보인다. 전체 로직에서 많은 부분이 검사 로직에 할애된다. 추출을 하는 기준이 무조건 라인 수로 결정되는 것은 아니지만, 검사 로직들은 비슷한 로직이 너무 많이 반복되고 단순 문법적인 요소들이 너무나 많이 보인다.

로직이 반복되는 이유는 행, 열, 대각선 줄을 검사하는 로직 만들기가 다 제각각이라서 그렇다. 각 경우를 순회하는 방법이 다 달라 비슷하지만 다른 로직들이 반복되는 것이다. 사실 핵심적인 부분인, 모든 셀이 마크되었는지 검사하는 로직은 동일하다.

게임 보드에서 행과 열, 대각선을 가져오는 로직을 추출하면, 반복되는 로직들을 줄일 수 있을 것 같다.

```jsx
function rows(board) {
  const rows = [];

  for (const row of board) {
    rows.push(row);
  }

  return rows;
}

function columns(board) {
  const columns = [];

  for (let i = 0; i < board.length; i++) {
    const column = [];

    for (const row of board) {
      column.push(row[i]);
    }

    columns.push(column);
  }

  return columns;
}

function diagonals(board) {
  const mainDiagonal = [];
  const antiDiagonal = [];

  for (let i = 0; i < board.length; i++) {
    mainDiagonal.push(board[i][i]);
  }
  for (let j = 0; j < board.length; j++) {
    antiDiagonal.push(board[j][board.length - 1 - j]);
  }

  return [mainDiagonal, antiDiagonal];
}

function some(iterable, callback) {
  for (const element of iterable) {
    if (callback(element)) {
      return true;
    }
  }

  return false;
}

function every(iterable, callback) {
  for (const element of iterable) {
    if (!callback(element)) {
      return false;
    }
  }

  return true;
}

function runGame() {
  // ...이전 로직 생략...

  // 가로, 세로, 대각선 검사
  const isGameOver = some(
    [
      ...rows(board),
      ...columns(board),
      ...diagonals(board),
    ],
    (row) => every(
      row,
      (cell) => cell === player
    ),
  );

  if (isGameOver) {
    console.log(`${player} win!`);
    return;
  }

  // ...이후 로직 생략...
}

runGame();
```

게임 보드에서 행과 열, 대각선 줄을 가져올 수 있는 `rows`, `columns`, `diagonals`를 정의해서 간결하게 로직을 만들었다. 여기에 내가 추가로 `some`, `every`를 정의해보았는데, `Array.prototype.some`, `Array.prototype.every`과 거의 동일한 역할을 한다[^3].

위 함수들로 복잡하고 반복되었던 검사 로직을 간결하게 만들었다. 그런데 사실 간결하게 만들면서 로직이 조금 더 이해하기 힘들어진 느낌도 어느정도 있다. 익숙한 방식의 문법이 아니기도 하고 의사 요소들이 읽기 편한 순서가 아니기도 해서 그렇다. 추출이 항상 옳다기 보다는, 때에 따라 적절하게 이루어져야 하는 것 같다[^4].

다른 로직들, 랜덤으로 보드에 마크하는 로직도 이런 식으로 추출해볼 수 있다. 이제 굳이 더 추출하는 예시를 보여주는 것은 의미가 없을 것 같다. 대신 추출이 가지는 다른 장점들을 얘기해보자. 지금까지 알아본 추출의 장점은 복잡성을 줄이거나 반복되는 로직들을 묶어줄 수 있다는 점이었다.

다른 장점도 있다. 예를 들어 `board`는 지금 이중 배열의 구조로 이루어져있다. 그리고 로직을 검사하거나 마크하는 로직도 `board`의 데이터 구조에 맞게 구성된다. 그런데 `board`의 데이터 구조가 바뀌게 된다면 어떻게 될까? 예를 들어 1차원 배열이라면? 아니면 플레이어들이 둔 수들이 저장된 객체 형태일 수도 있다. 이렇게 데이터 구조가 바뀌게되면 이와 관련된 로직이 전부 망가지게 된다. 이걸 다르게 표현한다면, `runGame`이라는 함수는 `board`의 세부 구현에 의존성을 갖게 된다.

여기서 만약 `board`에 관한 로직들이 추출되었다면, `board`의 구조가 바뀌게 되더라도 `runGame` 함수 내에서 딱히 건드릴 부분이 없다. `board`와 관련된 함수만 조금씩 바꿔주면 되고, 이건 로직 전체를 확인해서 수정하는 것보다 쉽다. 이렇게 추출을 통해 특정 데이터의 세부 구현에 의존성을 줄여주는 걸 추상화의 벽(abstraction barrier)이라고 한다. 여기서 세부 구현이라 함은 데이터의 구조도 될 수 있고, 외부 라이브러리를 활용하는 로직도 될 수 있다.

```jsx
// board의 구조에 의존성을 가지므로 추출해주었다.
function emptyBoard() {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

// board의 구조, 빈 셀을 표시하는 방식에 의존성을 가진다.
// 사실 여기서 빈 셀을 판별하는 로직과 board를 순회하는 로직을 추출한다면, unmarkedCells는 의존성을 위해 추출해줄 필요는 없다.
function unmarkedCells(board) {
  const cells = [];

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === null) {
        cells.push([i, j]);
      }
    }
  }

  return cells;
}

// 마찬가지로 board의 구조에 의존성을 가진다.
// 무승부를 일찍 확인하는 더 좋은 방법이 있지만, 그건 나중에 이 함수를 고쳐서 해결할 수 있다.
function isGameDraw(board) {
  return unmarkedCells(board).length === 0;
}

// 마찬가지로 board의 구조에 의존성을 가진다.
function markBoard(board, player, coordinate) {
  const markedBoard = structuredClone(board);
  const [rowIndex, columnIndex] = coordinate;

  markedBoard[rowIndex][columnIndex] = player;

  return markedBoard;
}

function runGame() {
  let turn = 0;
  let board = emptyBoard();

  while (isGameDraw(board, turn)) {
    // 현재 플레이어 판별하기 (이전과 동일)
    const player = turn % 2 === 0 ? 'x' : 'o';
    console.log(`${player}'s turn`);

    // 보드의 랜덤한 곳에 수 놓기
    // random index를 얻는 로직은 board의 구조와 상관이 없기 때문에 추출하지 않았다.
    const unmarkedCellCount = unmarkedCells(board);
    const randomIndex = Math.floor(Math.random() * unmarkedCells.length);
    board = markBoard(board, player, unmarkedCells[randomIndex]);

    console.log(board);

    // 가로, 세로, 대각선 검사
    // isAllCellsMarked로 추출했기 때문에 board의 세부 구현에 대한 의존성이 없다.
    const isGameOver = some(
      [
        ...rows(board),
        ...columns(board),
        ...diagonals(board),
      ],
      (row) => isAllCellsMarked(row),
    );

    if (isGameOver) {
      console.log(`${player} win!`);
      return;
    }

    turn += 1;
  }

  // 무승부 시 처리 로직 (이전과 동일)
  console.log('draw');
}

runGame();
```

이렇게 추출이 가지는 장점들을 알아보았다. 여기서는 단순히 함수로 추출하는 방법만 소개했는데 추출, 혹은 추상화하는 방식에는 여러 가지가 있을 수 있다. 단순히 함수가 아닌 디자인 패턴과 같은 패턴 형식으로 해볼 수도 있고 더 높은 수준에서 구조적인 측면으로 해결할 수도 있다.

추상화가 잘 이루어지면 최상위 계층의 로직은 나타내고 싶은 핵심적인 부분만 나타낼 수 있게 되는, 선언적인 구조로 작성할 수 있다.

[^1]: 물론 이 말의 저의가 추출하지말고 분리하자는 의미는 아닐 것이다. 로직을 분리하자는 코드 리뷰를 받았을 때 '아니요, 추출을 해야합니다'라고 할 필요는 없다..
[^2]: 3x3 보드에서 이루어지는 오목같은 게임이다. 먼저 한 줄을 마크하는 경우 승리하게 된다.
[^3]: 추출의 효과를 보여주기 위해서 이렇게 한 것일뿐, 배열 메소드를 써도 상관없다. 다만 내가 정의한 함수들은 array 타입 뿐만 아니라 iterable 값을 모두 받아들일 수 있다는 차이점이 있다.
[^4]: 이와 관련해서 리액트의 개발자 중 한 명인 [댄 아브라모프의 블로그 글](https://overreacted.io/goodbye-clean-code/)을 읽어보면 좋을 것 같다.
