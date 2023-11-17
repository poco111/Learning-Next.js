## Creating Layouts and Pages

- 이번 챕터에서는 레이아웃과 페이지로 더 많은 경로를 만드는 방법을 배운다.

- Next.js는 폴더가 중첩 경로를 생성하는 데 사용되는 파일 시스템 라우팅을 사용한다.
- 각 폴더는 URL 세그먼트에 매핑되는 경로 세그먼트를 나타낸다.

![스크린샷 2023-11-17 오후 6 52 37](https://github.com/second-hand-team-01/second-hand/assets/101160636/2d572b89-2397-4118-8064-7a8d83c8a8c4)

- layout.tsx 및 page.tsx 파일을 사용하여 각 경로에 대해 별도의 UI를 만들 수 있다.

- page.tsx는 React 컴포넌트를 내보내는 특별한 Next.js 파일로, 경로에 접근하기 위해 필요하다.

- 중첩된 경로를 만들려면 폴더를 서로 중첩하고 그 안에 page.tsx 파일을 추가하면 된다.

![스크린샷 2023-11-17 오후 6 58 13](https://github.com/second-hand-team-01/second-hand/assets/101160636/cf53f89c-8ee8-4493-9162-919cb0f2610a)

- /app/dashboard/page.tsx는 /dashboard의 경로에 연결된다.

### Creating the dashboard layout

- Next.js에서는 특별한 layout.tsx 파일을 사용하여 여러 페이지 간에 공유되는 UI를 만들 수 있다.

- 이렇게 layout 컴포넌트를 만들게 되면, /dashboard 내부의 페이지는 <Layout /> 안에 자동으로 중첩된다.

![스크린샷 2023-11-17 오후 7 08 52](https://github.com/second-hand-team-01/second-hand/assets/101160636/6a2cda7d-a68f-4d84-9ca5-97c3c592928c)

- Next.js에서 레이아웃을 사용하면 탐색 시 페이지 구성 요소만 업데이트되고 레이아웃은 다시 렌더링되지 않는다는 이점이 있다. 이를 부분 렌더링이라고 한다.

### Root layout

- 루트 레이아웃에 추가하는 모든 UI는 애플리케이션의 모든 페이지에서 공유된다.
- 루트 레이아웃을 사용하여 <html> 및 <body> 태그를 수정하고 메타데이터를 추가할 수 있다.

```tsx
// /app/layout.tsx
import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
```
