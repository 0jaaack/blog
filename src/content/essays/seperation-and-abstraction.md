---
title: 함수, 분리하지 말고 추출하자
publishedDate: Jun 2 2024
slug: seperation-and-abstraction
---

개발을 하면서 들었던 인상적인 조언은 ‘분리하기보다는 추출하라’는 말이다. 처음 이 말을 들었을 때부터 항상 마음 속에 간직하고 있었는데, 단순한 조언이지만 파급력이 매우 컸었고, 또 그렇기에 다른 사람들에게도 전하고 싶었다.

코드는 필연적으로 비대해지고 복잡해진다. 복잡한 코드는 읽기도 싫을 뿐더러 고치기도 힘들다. 테스트하기는 더더욱 힘들다. 만약 내가 어떤 코드를 읽었을 때 로직을 읽는게 아니라 코드를 해석하고있다면 그건 그 코드가 복잡하다는 뜻이 된다. 코드가 복잡해지는 이유는 로직이 표현하고 싶은 바가 감춰져있기 때문이다. 정확히 얘기하면 파묻혀있다는 말이 더 맞을 수도 있다.

간단하게 예시를 들어보자. 사용자들의 배열을 받아 나이가 65세 이상인 사용자들을 반환하는 함수를 작성한다고 하자. 그러면 이렇게 나타낼 수 있다.

```jsx
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

로직은 **의사[^1]를 이루는 요소**들과 그것들을 성공적으로 실행시키기 위한 **문법적 요소**로 구성된다. 로직의 의사적 요소, 즉 로직이 나타내고자 하는 바는 “**users에서 age가 65세 이상인 user를 걸러낸다**"는 점이다. for loop와 배열의 push 메소드 등은 문법적 요소다. 로직에서 문법적 요소가 많아질수록 코드는 읽기 어려워진다. 우리의 뇌가 로직의 흐름을 읽는게 아니라 코드를 해석해내야 하기 때문이다. 그래서 우리는 순전히 의사를 표현하는 데 집중할 수 있도록 문법적 요소를 줄여볼 것이다. 문법적 요소들은 보통 일정한 패턴을 보이며 반복되기도 한다. 반복되는 보일러 플레이트, 특정 자료구조에 종속된 문법들을 추상화하여 로직에 의사만 남길 수 있도록 해볼 것이다.

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
  return filter( // 걸러내고 반환한다
    users, // users에서
    (user) => user.age >= 65 // age가 65 이상인 경우에
  );
}
```

로직을 `filter`라는 함수로 추출했다. `filter`라는 메소드 덕분에 나머지 로직은 거의 핵심적인 요소만 남게 되었다. 이게 바로 추출하기의 방법이다. 복잡한 문법이나 구현의 세부사항을 감추고 함수명으로 동작을 간결하게 설명한다. 추출하기를 통해 더욱 표현력있는 로직을 작성할 수 있게 된다.

위 예제에서 배열의 `filter` 메소드를 쓰면 안되나?라고 할 수도 있다. 추출하기의 예제를 보여주고 싶어 이렇게 한 것이지, 배열의`filter`를 써도 된다. 다만 주의할 점은, 그렇게되면 `users`는 `filter` 메소드를 가진 데이터에만 적용할 수 있게 된다. 그보다는 `users`가 단순히 순회가능한 값(iterable)이라는 가정으로도 해결할 수 있기에, 뒤의 가정이 앞으로 조금 더 너그러운 함수로 발전될 수 있다[^2]. 추출한 함수가 더 폭넓은 형태의 값을 받아들일 수 있게되면, 더 넓은 범위에서 사용할 수 있게 된다[^3].

추출하기에 대해 알아보았다. 추출하기의 반대로 분리하기 방식으로도 풀어나갈 수 있다. 분리하는 것은 말 그대로 덩어리째 멀리 떨어뜨려 놓는 것이다. 코드를 여러 부분으로 나누어서, 각 부분이 할당하는 일 같은 것을 정해두고 거기에 맞는 코드를 적재한다. 추출은 위에서도 보았듯이, 핵심만 뽑아내 남기는 것이다. 코드에서 의사를 이루는 부분을 드러내도록 하게 만든다. 다른 말로는 추상화라고도 한다. 거대하고 복잡한 로직을 풀어나갈 때 어떤 방식을 택하느냐에 따라 큰 차이를 불러일으킨다.

두 방식의 차이를 예제를 통해 비교해보자. 계좌 이체를 수행하는 로직 `transferBank` 함수를 간단하게 만들어보았다[^4].

```jsx
function transferBank(fromAccountBankCode, toAccountBankCode, amount) {
  let fromAccount = null;

  for (let i = 0; i <= accounts.length; i++) {
    const account = accounts[i];

    if (account.bankCode === fromAccountBankCode) {
      fromAccount = account;
    }
  }

  if (fromAccount == null) {
    throw new Error('출금하는 계좌를 찾을 수 없습니다');
  }

  let toAccount = null;

  for (let i = 0; i <= accounts.length; i++) {
    const account = accounts[i];

    if (account.bankCode === toAccountBankCode) {
      toAccount = account;
    }
  }

  if (toAccount == null) {
    throw new Error('입금하는 계좌를 찾을 수 없습니다');
  }

  let fromAccountBalance = 0;

  for (let j = 0; j <= fromAccount.transferHistory.length; j++) {
    const transfer = fromAccount.transferHistory[j];
    switch (transfer.type) {
      case '입금':
        fromAccountBalance += transfer.amount;
        break;
      case '출금':
        fromAccountBalance -= transfer.amount;
        break;
    }
  }

  if (fromAccountBalance < amount) {
    throw new Error('보내는 계좌의 잔액이 부족합니다');
  }

  fromAccount.bankHistory.push({
    type: '출금',
    amount,
  });

  toAccount.bankHistory.push({
    type: '입금',
    amount,
  });

  return {
    result: 'success',
  };
}
```

먼저 '분리하기'를 해보자. 계좌 이체는 1. 두 계좌를 확인 2. 출금하는 계좌에서 출금 3. 입금하는 계좌로 입금 단계로 나눌 수 있다. 각 단계를 함수로 분리할 수 있어보인다.

```jsx
function getAccount(accountBankCode) {
  let account = null;

  for (let i = 0; i <= accounts.length; i++) {
    const account = accounts[i];

    if (account.bankCode === fromAccountBankCode) {
      fromAccount = account;
    }
  }

  if (account == null) {
    throw new Error('계좌를 찾을 수 없습니다');
  }

  return account;
}

function getAccountBalance(account) {
  let accountBalance = 0;

  for (let i = 0; i <= fromAccount.transferHistory.length; i++) {
    const transfer = fromAccount.transferHistory[i];
    switch (transfer.type) {
      case '입금':
        accountBalance += transfer.amount;
        break;
      case '출금':
        accountBalance -= transfer.amount;
        break;
    }
  }

  return accountBalance;
}

function withDraw(account, amount) {
  const accountBalance = getAccountBalance(account);

  if (accountBalance < amount) {
    throw new Error('계좌의 잔액이 부족합니다.');
  }

  account.bankHistory.push({
    type: '출금',
    amount,
  });
}

function desposit(account, amount) {
  account.bankHistory.push({
    type: '입금',
    amount,
  });
}

function transferBank(fromAccountBankCode, toAccountBankCode, amount) {
  checkAccountExist(fromAccountBankCode);
  checkAccountExist(toAccountBankCode);

  withDraw(
    fromAccountBankCode,
    amount,
  );
  desposit(
    toAccountBankCode,
    amount,
  );
}
```

분리한 코드들을 자세히 보면, 하나의 공통점을 발견할 수 있다. 입금과 출금, 그리고 계좌 잔액 같은 작업들은 모두 계좌에 관한 작업이라는 것이다. 이들을 공통된 개념을 가지고 있으므로 묶어줄 수 있어보인다. 분리하기 기법은 자연스럽게 묶어주기로 이어진다. 분리하기는 위에서 보았던 추출하기와는 다르게, 의사적 요소까지 가져가게 되는 경우가 많다. 이렇게 흩어지는 의사적 요소는 특정 영역에서의 의사적 요소로 다시 모여지게 된다.

이번에는 추출을 해보자. 다시 원래의 코드로 돌아왔다. 추출에서는 배열에서 특정 요소를 찾는 동작, 더하는 동작, 비교하는 동작 등을 함수로 추출해볼 예정이다. 이전 예제에서 `filter`를 만들어준 것과 비슷하게 말이다.

```jsx
function find(arr, callback, eff) {
  for (let i = 0; i <= arr.length; i++) {
    if (callback(arr[i])) {
      return result;
    }
  }

  eff.none?.();
}

function sum(arr) {
  let result = 0;

  for (let i = 0; i <= arr.lenght; i++) {
    result += arr[i];
  }

  return result;
}

function map(arr, callback) {
  const result = [];

  for (let i = 0; i <= arr.lenght; i++) {
    result.push(arr[i]);
  }

  return result;
}

function compare(a, b, eff) {
  if (a < b) {
    eff.less?.();
  } else if (a > b) {
    eff.greater?.();
  } else if (a === b) {
    eff.equal?.();
  }
}

function append(arr, item) {
  arr.push(item);
  return;
}

function transferBank(fromAccountBankCode, toAccountBankCode, amount) {
  const fromAccount = find(
    accounts,
    (account) => account.bankCode === fromAccountBankCode,
    {
      none: () => throw new Error('출금하는 계좌를 찾을 수 없습니다'),
    }
  );

  const fromAccountBalance = sum(
    map(
      fromAccount.transferHistory,
      (transfer) => {
        switch (transfer.type) {
          case '입금':
            return transfer.amount;
          case '출금':
            return transfer.amount * -1;
        }
      },
    ),
  );

  compare(fromAccountBalance, amount, {
    less: () => throw new Error('보내는 계좌의 잔액이 부족합니다'),
  });

  append(
    fromAccount.bankHistory,
    { type: '출금', amount },
  );
  append(
    fromAccount.bankHistory,
    { type: '입금', amount },
  );
}
```

이렇게 추출을 완료했다. 이번에도 문법적 요소를 줄이고 의사적 요소가 남도록 만들었다. 여기서 추출한 코드들을 더 자세히 살펴보자. 추출한 코드 내에서도 또 추출해줄 수 있어 보이는 부분이 생긴다. 예를들어 함수를 순회하면서 특정 동작을 하는 부분을 추출해줄 수 있다. 추출에서 추출을 다시 하게되는 셈이다. 추출한 함수들을 조합해 새로운 방식의 함수를 만들어내 줄 수 있다. 분리하기가 묶어주는 것으로 이어지는 것처럼, 추출하기는 합성하기로 이어질 수 있다. 추출에서 합성으로 이어지는 패턴들은 재사용성의 핵심이다.

```jsx

function iterate(arr, callback, eff) {
  for (let i = 0; i <= arr.length; i++) {
    callback(arr[i]);
  }
}

function find(arr, callback, eff) {
  let result = null;

  iterate(
    arr,
    (item) => {
      if (callback(item)) {
        result = item;
      }
    },
  );

  if (result == null) {
    eff.none?.();
  }

  return result;
}

function sum(arr) {
  let result = 0;

  iterate(arr, (item) => result += item);

  return result;
}

function map(arr, callback) {
  const result = [];

  iterate(arr, (item) => result.push(callback(item)));

  return result;
}
```

위의 `transferBank` 함수는 간단한 로직으로 이루어져있어 여기서 더 무언가를 파악하기는 쉽지 않다. 하지만 일종의 방향성을 엿볼 수 있는데, 예를 들어 분리하기를 적용한 코드는 기능이 더 추가되면서 복잡해지는 코드를 더 적절하게 분리하고 묶어주는 방식으로 진행될 공산이 크다. 코드가 더 복잡해질 수록 어디에 어떤 역할의 코드를 나누고 분리시키느냐가 복잡도를 줄이는 핵심이 된다. 반대로 추출하기를 보자. 추출하기를 적용하는 코드는 코드가 더해질 수록 로직을 추출할 함수가 기하급수적으로 늘어날 수 있다. 여기서는 추출된 함수를 깔끔하게 만들고 조합할 수 있도록 만든다. 얼마나 더 함수를 재사용성있게 만들고, 수많은 데이터 타입에 적용될 수 있게 만들 것인가가 핵심이 된다.

추출하는 것의 가장 큰 장점이라면, 코드에서 의사적 요소만 남긴다는 것이다. 바꿔 말하면 내가 프로그램에게 명령하듯이 코드를 작성할 수도 있다는 뜻이다. 이를 선언적 프로그래밍이라고도 하는데, 추출하기 기법이 발전된 형태로 이루게 된다. 의사만 남게되는 코드는 디버깅하기가 쉬워지고, 버그를 발견하기도 쉽다. 추출한 코드는 테스트하기 쉽다. 나중에 이것이 극적으로 발전하게 되면 프로그램이 표현하려는 도메인에 관한 부분을 마치 새로운 언어를 작성하듯이 만들 수 있다. 그쯤되면 단순히 추출하는 것보다 한 차원은 더 나아간 단계인 셈이다.

그렇지만 로직을 분리하는 것이 필요없다고 할 수는 없다. 분리하기 방식도 유용하며 우리가 흔히 많이 사용하는 방식이다. 두 가지 다 각자의 유용한 시점이 있기 마련이다. 예를 들어, ‘추출하기’로 분리한 코드를 어디에 위치시키게 될까? 프로그램이 점점 더 커지다보면 이들을 적절한 곳에 분리해야할텐데, 각 코드들을 모듈 혹은 네임스페이스로 적절하게 나누는 것도 결국 분리하기의 개념이다. 그렇지만 코드의 복잡성을 줄이거나 재사용할 수 있는 함수들을 만들 수 있다는 점에서는 추출하는 것이 더 바람직하다.

[^1]: 意思
[^2]: 예시와 설명은 모두 자바스크립트를 기준으로 한다.
[^3]: Array는 Iterable의 한 종류이므로, Iterable이 더 폭넓은 형태이다.
[^4]: 요즘과는 작성하는 스타일이 조금 다르나 분리하기와 추출하기의 대비를 위해서 작성된 코드라 감안하고 봐주기를 바란다. 요즘 스타일로 작성하는 코드는 이미 언어상에서 혹은 라이브러리에서 분리와 추출이 미리 이뤄지는 경우가 많다.
