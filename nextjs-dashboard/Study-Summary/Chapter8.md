## Static and Dynamic Rendering

- 앞선 장에서 대시보드 개요 페이지에 대한 데이터를 가져왔다.
- 하지만, 아직 두 가지의 제한 사항이 있다.

1. 데이터 요청이 의도치 않은 waterfall을 만들고 있다.
2. 대시보드는 정적이므로 모든 데이터 업데이트가 애플리케이션에 반영되지 않는다.

### What is Static Rendering?

- 정적 렌더링이란, 빌드 시간(배포할 때) 또는 재검증 중에 서버에서 데이터를 가져오기 및 렌더링이 이루어지기 때문에, 결과물을 배포하고 CDN에 캐시할 수 있다.
- 사용자에게는 애플리케이션을 방문할 때마다 캐시된 결과가 제공된다.
- 정적 렌더링에는 다음과 같은 이점이 있다.
  1. 더 빠른 웹사이트 : 미리 렌더링된 콘텐츠를 캐시하여 전 세계에 배포할 수 있기 때문에 사용자가 더 빠르고 안정적으로 엑세스할 수 있다.
  2. 서버 부하 감소 : 콘텐츠가 캐시되므로 서버에서 각 사용자 요청에 대해 콘텐츠를 동적으로 생성할 필요가 없다.
  3. SEO : 미리 렌더링된 콘텐츠는 페이지가 로드될 때, 이미 콘텐츠를 사용할 수 있으므로 검색 엔진 크롤러가 색인을 생성하기가 더 쉽다.
- 정적 렌더링은 정적 블로그 게시물이나 제품 페이지와 같이 사용자 간에 공유되는 데이터나 데이터가 없는 UI에 유용하며 정기적으로 업데이트되는 개인화된 데이터가 있는 대시보드에는 적합하지 않을 수 있다.

### What is Dynamic Rendering?

- 동적 렌더링이란, 사용자가 페이지를 방문할 때, 각 사용자에 대한 콘텐츠가 서버에서 렌더링되는 것을 말한다.
- 동적 렌더링에는 다음과 같은 이점이 있다.
  1. 실시간 데이터 : 동적 렌더링을 사용하면 애플리케이션에서 실시간 또는 자주 업데이트되는 데이터를 표시할 수 있다. 데이터가 자주 변경되는 애플리케이션에 이상적이다.
  2. 사용자별 콘텐츠 : 대시보드나 사용자 프로필과 같은 개인화된 콘텐츠를 제공하고 사용자 상호 작용에 따라 데이터를 업데이트하는 것이 더 쉽다.
  3. 요청 시간 정보 : 동적 렌더링을 사용하면 쿠키나 URL 검색 매개변수와 같이 요청 시점에만 알 수 있는 정보에 액세스할 수 있다.

### Making the dashboard dynamic

- 기본적으로 @vercel/postgres는 자체 캐싱 시맨틱을 설정하지 않고, 프레임워크가 자체 정적 및 동적 동작을 설정할 수 있다.
- 서버 컴포넌트 또는 데이터 불러오기 함수 내에서 unstable_noStore라는 Next.js API를 사용하여 정적 렌더링을 사용하지 않도록 선택할 수 있다.
- 먼저 data.ts에서 next/cache에서 unstable_noStore를 가져와서 데이터 불러오기 함수의 맨 위에 호출한다.

```ts
// /app/lib/data.ts
// ...
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRevenue() {
  // Add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();

  // ...
}

export async function fetchLatestInvoices() {
  noStore();
  // ...
}

export async function fetchCardData() {
  noStore();
  // ...
}

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  noStore();
  // ...
}

export async function fetchInvoicesPages(query: string) {
  noStore();
  // ...
}

export async function fetchFilteredCustomers(query: string) {
  noStore();
  // ...
}

export async function fetchInvoiceById(query: string) {
  noStore();
  // ...
}
```

- unstable_noStore는 현재 실험적인 API이며 향후 변경될 수 있다.
- 대신 export const dynamic = "force-dynamic"을 사용할 수 있다.

### Simulating a Slow Data Fetch

- 대시보드를 동적으로 만드는 것은 좋지만, 이전 장에서 언급한 것처럼 하나의 데이터 요청이 다른 모든 데이터 요청보다 느린 경우에는 개발자에게 동적 렌더링을 사용했을 때, 애플리케이션의 속도는 여러 데이터 요청 중 가장 느린 데이터 요청 속도만큼만 빨리지는 문제가 남는다.
