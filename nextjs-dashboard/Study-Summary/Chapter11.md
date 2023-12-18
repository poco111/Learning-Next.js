## Adding Search and Pagination

- 이번 챕터에서는 검색 및 페이지 매김을 추가하는 방법에 대해서 알아보자.

### Starting code

```tsx
import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';

export default async function Page() {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
      {/*  <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense> */}
      <div className="mt-5 flex w-full justify-center">
        {/* <Pagination totalPages={totalPages} /> */}
      </div>
    </div>
  );
}
```

- 위 예제에서 사용자가 invoice를 검색하면 URL 매개변수가 업데이트되고 서버에서 데이터를 가져온 다음 새 데이터가 포함된 테이블이 서버에서 다시 렌더링된다.

### Why use URL search params?

- 그렇다면 위 예제에서 URL 검색 매개변수를 사용하여 검색 상태를 관리하는 이유는 무엇일까?
- URL 매개변수로 검색을 구현하면 아래와 같은 이점이 있다.
  1. 북마크 및 공유 가능한 URL : 검색 매개변수가 URL에 있으므로 사용자는 검색 쿼리 및 필터를 포함한 애플리케이션의 현재 상태를 북마크에 추가하여 나중에 참조하거나 공유할 수 있다.
  2. 서버 측 렌더링 및 초기 로드 : URL 매개변수를 직접 사용하여 초기 상태를 렌더링할 수 있으므로 서버 렌더링을 더 쉽게 처리할 수 있다.
  3. 분석 및 추척 : 검색 쿼리와 필터를 URL에 직접 넣으면 추가적인 클라이언트 측 로직 없이도 사용자 행동을 더 쉽게 추적할 수 있다.

### Adding the search functionality

- 다음은 검색과 페이지 네이션 기능 구현을 위해 사용할 Next.js의 훅이다.
- useSearchParams : 현재 URL의 매개변수를 반환
  - /dashboard/invoices?page=1&query=pending인 경우 '{page:1, query:'pending'} 반환
- usePathname : 현재 URL의 경로이름을 반환
  - /dashboard/invoice인 경우 '/dashboard/invoice' 반환
- useRouter : 클라이언트 구성요소 내에서 프로그래밍 방식으로 경로 간 탐색을 활성화

- defaultValue vs. value / Controlled vs. Uncontrolled

  - state를 사용하여 입력의 값을 관리하는 경우, value 속성을 사용하여 제어되는 컴포넌트로 만들 수 있습니다. 이는 React가 입력의 상태를 관리한다는 뜻입니다.

  - 하지만 state를 사용하지 않는다면 defaultValue를 사용할 수 있습니다. 이는 네이티브 입력이 자체 상태를 관리한다는 뜻입니다. 상태 대신 URL에 검색 쿼리를 저장하기 때문에 괜찮습니다.

```tsx
// search.text
'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  // replace는 현재 보고 있는 페이지를 새 페이지로 교체하는 기능을 제공한다

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    // URLSearchParams : URL 쿼리 매개변수를 조작하기 위한 유틸리티 메서드를 제공하는 웹 API이다.
    // 복잡한 문자열 리터럴을 만드는 대신 이 메서드를 사용하여 ?page=1&query=a와 같은 파라미터 문자열을 가져올 수 있다.
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
    // URL을 업데이트 한다
    // 페이지를 다시 로드하지 않고도 URL을 업데이트할 수 있다.
  }
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()}
        // input 필드가 URL과 동기화되고 공유할 때 입력 필드가 채워지도록 하기 위해 defaultValue를 사용한다.
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
```

- 사용자의 입력으로 URL을 업데이트하고, useSearchParams 훅을 사용하여 URL을 읽는.
- replace 메서드가 리렌더링을 발생시키는 듯 하다.(?) -> 추가 학습 필요

```tsx
// page.text

import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        {/* <Pagination totalPages={totalPages} /> */}
      </div>
    </div>
  );
}
```

- invoice page 컴포넌트에서 searchParams를 prop으로 가져오고, query를 Table에 전달한다.
- Table 컴포넌트 내부에서는 fetch 함수로 데이터를 가져온다.

### Best practice: Debouncing

- 위 예제에서 한 가지 최적화를 위해 수행할 것이 있다.
- 현재 사용자의 입력에 따라 URL을 업데이트하므로 키를 누를때마다 데이터베이스에 쿼리를 하고 있다.
- 이에 `디바운싱`을 활용해서 최적화를 할 수 있다.
  - 디바운싱이란 함수가 실행될 수 있는 속도를 제한하는 프로그래밍 방식이다.
  - 우리의 에제에서는 사용자가 입력을 중단한 경우에만 데이터베이스를 쿼리할 수 있다.
- 디바운싱 기능은 수동으로 생성하는 방법도 있지만, 단순한 작업을 위해서 다음과 같이 라이브러리를 사용할 수도 있다.
  - `npm i use-debounce`

```tsx
// search.tsx
import { useDebouncedCallback } from 'use-debounce';

const handleSearch = useDebouncedCallback((term) => {
  const params = new URLSearchParams(searchParams);
  if (term) {
    params.set('query', term);
  } else {
    params.delete('query');
  }
  replace(`${pathname}?${params.toString()}`);
}, 300);
```

- handleSearch 함수를 useDebouncedCallback으로 래핑하고 사용자가 입력을 중지한 후 특정시간(300ms) 후에만 코드를 실행한다.

### Adding pagination

- 현재 fetchFilteredInvoices() 함수는 페이지당 최대 6개의 결과를 반환하고 있기 때문에, invoice 검색 결과에 6개의 결과값만 표시되는 것을 볼 수 있다.

- 이에 페이지 매김을 추가하면 사용자가 여러 페이지를 탐색하여 모든 청구서를 보게 할 수 있고, 검색과 마찬가지로 URL 매개변수를 사용하여 페이지 매김을 구현할 수 있다.

- 현재 <Pagination /> 구성요소는 클라이언트 구성 요소인데, 데이터베이스 보호를 위해 서버에서 데이터를 가져와서 구성요소에 prop으로 전달할 수 있다.

```tsx
//pagination.tsx

export default function Pagination({ totalPages }: { totalPages: number }) {
  // NOTE: comment in this code when you get to this point in the course

  // const allPages = generatePagination(currentPage, totalPages);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // ...
```

- <Pagination /> 컴포넌트에서는 먼저 다음과 같은 작업을 한다.
  - createPageURL : 현재 검색 매개변수의 인스턴스를 생성한다.
  - 페이지를 업데이트하고, 매개변수를 제공된 페이지 번호에 추가한다.
  - 경로 이름과 업데이트된 검색 매개변수를 사용하여 전제 URL을 구성한다.

```tsx
// search.tsx
const handleSearch = useDebouncedCallback((term) => {
  console.log('searching...', term);
  const params = new URLSearchParams(searchParams);
  params.set('page', '1');
  // 새로운 검색어 입력이 있을때, page를 1로 변경한다.
  if (term) {
    params.set('query', term);
  } else {
    params.delete('query');
  }
  replace(`${pathname}?${params.toString()}`);
}, 500);
```

- <Pagination />의 전체 작업은 추후 챕터에서 이어서 진행한다.
