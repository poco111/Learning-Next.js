## Streaming

- 이전 장에서는 동적 렌더링을 사용하지만, 데이터를 가져오는데 가장 느린 데이터가 애플리케이션 성능에 영향을 미치는 것을 해결하는 방법에 대해서 살펴본다.

### What is streaming?

- 스트리밍(streaming)은 서버에서 클라이언트로 데이터를 전송하는 기술이다.

- 이 방법을 사용하면 라우트를 더 작은 조각으로 나누고 이 조각들이 준비되는 대로 점진적으로 서버에서 클라이언트로 스트리밍 할 수 있다.

- 스트리밍을 사용하면 느린 데이터 요청으로 인해 전체 페이지가 차단되는 것을 방지할 수 있다.

- 즉, 사용자가 요청하는 페이지의 데이터를 조각으로 나누어 서버에서 점진적으로 로드할 수 있고, 전체 페이지의 데이터를 한 번에 로드하는 대신 필요한 부분만 빠르게 로드하여 사용자 경험을 향상시킬 수 있다.

- Next.js에서 스트리밍을 구현하는 방법에는 두 가지가 있다.
  - 1. 페이지 수준에서 loading.tsx 파일을 사용한다.
  - 2. 특정 컴포넌트의 경우 <Suspense>를 사용한다.

### Streaming a whole page with loading.tsx

- loading.tsx는 Suspense 위에 구축된 특별한 Next.js 파일로, 페이지 콘텐츠가 로드되는 동안 대체로 표시할 풀백 UI를 만들 수 있다.

- loading.tsx와 별개로 정적인 데이터들은 동적 콘텐츠가 로드되는 동안 즉시 표시되며 상호작용도 가능하다.

### Adding loading skeletons

- 로딩 스켈레톤은 UI의 단순화된 버전이다.

- loading.tsx에 포함되는 모든 UI는 정적 파일의 일부로 포함되어 먼저 전송되고, 나머지 동적 콘텐츠는 서버에서 클라이언트로 스트리밍된다.

### Fixing the loading skeleton bug with route groups

- 만약 loading.tsx 파일을 customers, invoices 페이지를 제외하고 dashboard 페이지에만 적용하고 싶다면 아래와 같이 적용할 수 있다.

  ![스크린샷 2023-12-17 오전 12 33 00](https://github.com/This-Year-MyCut/FE/assets/101160636/0a217685-121c-4875-b20d-6335b44e9a9a)

- 위 이미지와 같이 route를 작성하면 URL 구조에 영향을 주지 않고 파일을 논리적인 그룹으로 구성할 수 있다.
- 즉, dashboard 페이지의 URL은 기존과 동일하게 /dashboard로 접근 가능하며 (overview)는 제외된다.

### Streaming a component

- 지금까지는 dashboard 페이지 전체를 스트리밍 했지만, React Suspense를 사용하면 페이지를 세분화하여 특정 컴포넌트를 스트리밍할 수 있다.

- suspense를 사용하면 특정 조건(예: 데이터가 로드될 때까지)이 충족될 때까지 애플리케이션의 일부 렌더링을 지연시킬 수 있다.

- 동적 컴포넌트를 Suspense로 래핑하고 동적 컴포넌트가 로드되는 동안 표시할 폴백 컴포넌트를 전달할 수 있다.

```tsx
import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { fetchLatestInvoices, fetchCardData } from '@/app/lib/data';
import { Suspense } from 'react';
import { RevenueChartSkeleton } from '@/app/ui/skeletons';

export default async function Page() {
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
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <LatestInvoices latestInvoices={latestInvoices} />
      </div>
    </main>
  );
}
```

- 위 예제와 같이 데이터 로드가 오래 걸리는 RevenueChart 컴포넌트를 Suspense로 묶고 fallback으로 표시할 UI를 지정하였을 때, dashboard의 정보가 거의 즉시 표시되고, RevenueChart에 대한 대체 스켈레톤만 표시된다.

### Grouping components

- 여러 컴포넌트가 동시에 로드되도록 하려는 경우, Wrapper를 사용할 수 있다.

```tsx
import CardWrapper from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import {
  RevenueChartSkeleton,
  LatestInvoicesSkeleton,
  CardsSkeleton,
} from '@/app/ui/skeletons';
export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}
```

- 위 예제와 같이 각각의 Card 컴포넌트들을 CardWrapper 컴포넌트로 묶고 Suspense로 감싸면, 모든 Card 컴포넌트가 동시에 로드되는 것을 확인할 수 있다.

### Deciding where to place your Suspense boundaries

- Suspense 경계를 어디에 설정할지는 몇 가지 요소에 따라 달라질 수 있다.

  - 사용자가 페이지가 스트리밍되는 동안 어떤 경험을 하길 원하는지
  - 우선 순위를 지정할 콘텐츠
  - 컴포넌트가 데이터를 가져오는 것에 의존하는 경우

- 하지만, 정답은 없다. Suspense 경계를 설정하는 위치는 애플리케이션에 따라 달라질 수 있고, 일반적으로 데이터 가져오기가 필요한 컴포넌트로 이동한 다음 해당 컴포넌트를 Suspense로 감싸는 것이 좋다.
- 그렇다고, 섹션과 전체 페이지를 스트리밍하는 것이 잘못된 것은 아니다, 결국 애플리케이션에 따라 Suspense 경계는 달라질 수 있다.
