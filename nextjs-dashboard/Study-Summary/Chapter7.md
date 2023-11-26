## Fetching Data

- 이번 챕터에서는 애플리케이션에서 데이터베이스의 데이터를 가져올 수 있는 방법에 대해서 논의하고 대시보드 개요 페이지를 작성한다.

### Using Server Components to fetch data

- 기본적으로 Next.js 애플리케이션은 React Server 컴포넌트를 사용한다.
- 서버 컴포넌트는 서버에서 실행되므로 비용이 많이 드는 데이터 가져오기 및 로직은 서버에 남겨두고 결과만 클라이언트로 전송할 수 있다.
- 서버 컴포넌트는 서버에서 실행되므로 추가 API 계층 없이 데이터베이스를 직접 쿼리할 수 있다.

- /app/lib/data.ts 파일을 보면 @vercel/postgres에서 sql 함수를 가져오는 것을 볼 수 있다.

```ts
// /app/lib/data.ts
import { sql } from '@vercel/postgres';
```

- 이어 모든 서버 컴포넌트에서 sql을 호출할 수 있지만, 구성 요소를 더 쉽게 탐색할 수 있도록 모든 데이터 쿼리를 data.ts 파일에서 보관하고 있는 것이다.

### Fetching data for the dashboard overview page

```tsx
// /app/dashboard/page.tsx
import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* <Card title="Collected" value={totalPaidInvoices} type="collected" /> */}
        {/* <Card title="Pending" value={totalPendingInvoices} type="pending" /> */}
        {/* <Card title="Total Invoices" value={numberOfInvoices} type="invoices" /> */}
        {/* <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        /> */}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        {/* <RevenueChart revenue={revenue}  /> */}
        {/* <LatestInvoices latestInvoices={latestInvoices} /> */}
      </div>
    </main>
  );
}
```

- 위 코드는 dashboard의 page 컴포넌트에서 data fetching을 하기 위한 기본 코드이다.
- 현재 page 컴포넌트는 비동기로 컴포넌트이며 이를 통해 데이터를 가져오는데 await를 사용할 수 있다.

### Fetching data for <RevenueChart/>

- <RevenueChart/> 컴포넌트에 대한 데이터를 가져오려면 data.ts 파일에서 fetchRevenue 함수를 가져와 컴포넌트 내에서 호출해야 한다.

```tsx
// /app/dashboard/page.tsx
import { fetchRevenue } from '@/app/lib/data';

export default async function Page() {
  const revenue = await fetchRevenue();
  // ...
}
```

### Fetching data for <LatestInvoices/>

- <LatestInvoices> 컴포넌트의 경우 날짜별로 정렬된 최신 인보이스 5개를 가져와야 한다.
- 모든 데이터를 가져와서 javascript로 정렬할 수도 있지만, 데이터가 커지는 경우 전송되는 데이터양과 이를 정렬하는데 필요한 javascript가 커질 수 있다.
- 따라서, 최신 데이터를 인메모리에서 정렬하는 대신 SQL 쿼리를 사용하여 최신 5개 인보이스만 가져올 수 있다.

```ts
// /app/lib/data.ts
// Fetch the last 5 invoices, sorted by date
const data = await sql<LatestInvoiceRaw>`
  SELECT invoices.amount, customers.name, customers.image_url, customers.email
  FROM invoices
  JOIN customers ON invoices.customer_id = customers.id
  ORDER BY invoices.date DESC
  LIMIT 5`;
```

```tsx
// /app/dashboard/page.tsx
import { fetchRevenue, fetchLatestInvoices } from '@/app/lib/data';

export default async function Page() {
  const revenue = await fetchRevenue();
  const latestInvoices = await fetchLatestInvoices();
  // ...
}
```

- 아래 코드는 dashboard의 page.tsx에서 <Card> 컴포넌트까지 필요한 데이터를 fetch하는 코드이다.

```tsx
// /app/dashboard/page.tsx
import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import {
  fetchRevenue,
  fetchLatestInvoices,
  fetchCardData,
} from '@/app/lib/data';

export default async function Page() {
  const revenue = await fetchRevenue();
  const latestInvoices = await fetchLatestInvoices();
  const {
    numberOfCustomers,
    numberOfInvoices,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <RevenueChart revenue={revenue} />
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}
```

- 위 패턴이 나쁜것은 아니지만, 아래와 같은 내용을 인지해야 한다.
- 1. 데이터 요청이 의도치 않게 서로를 차단하여 request waterfall을 발생시키고 있다.
- 2. Next.js는 기본적으로 성능을 개선하기 위해 routes를 미리 렌더링하는데, 이를 정적 렌더링이라고 한다. 따라서, 데이터가 변경되면 대시보드에 반영되지 않을 수 있다.

* waterfalls란?

- waterfall이란 이전 요청의 완료에 따라 달라지는 일련의 네트워크 요청을 의미한다.
- 데이터 가져오기의 경우, 각 요청은 이전 요청이 데이터를 반환한 후에만 시작할 수 있다.

```tsx
const revenue = await fetchRevenue();
const latestInvoices = await fetchLatestInvoices();
const {
  numberOfCustomers,
  numberOfInvoices,
  totalPaidInvoices,
  totalPendingInvoices,
} = await fetchCardData();
```

- 예를 들어, 위 코드에서 `fetchLatestInvoices()`가 실행을 시작하기 전에 `fetchRevenue()`가 실행될 때까지 기다려야 한다.
- 물론 사용자의 ID와 프로필을 가져오고 다음에 해당 ID의 친구목록을 가져올 수 있는 상황처럼 waterfall이 필요한 상황이 있지만, waterfall은 의도치 않게 성능에 영향을 미칠 수 있다.

### Parallel data fetching

- waterfall을 피하는 일반적인 방법은 모든 데이터 요청을 동시에 병렬적으로 시작하는 것이다.
- javascript에서는 Promise.all() 또는 Promise.allSettled() 함수를 사용하여 모든 프로미스를 동시에 시작할 수 있다.

```ts
// /app/lib/data.ts
export async function fetchCardData() {
  try {
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);
    // ...
  }
}
```

- 위 패턴을 사용하면 모든 데이터 가져오기를 동시에 실행하여 성능을 향상시킬 수 있다.
- 하지만, 하나의 데이터 요청이 다른 모든 데이터 요청보다 느리면 어떻게 될까?
