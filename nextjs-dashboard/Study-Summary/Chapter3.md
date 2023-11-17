## Optimizing Fonts and Images

### Fonts

- 글꼴은 웹 사이트 디자인에서 중요한 역할을 하지만 프로젝트에서 사용자 정의 글꼴을 사용하면 글꼴 파일을 가져와서 로드해야 하는 경우 성능에 영향을 미칠 수 있다.
- 글꼴을 사용하면 브라우저가 처음 대체 글꼴이나 시스템 글꼴로 텍스트를 렌더링한 다음 로드된 후 사용자 지정 글꼴로 교체할 때 레이아웃 변경이 발생하고, 이 교체로 인해 텍스트 크기, 간격 또는 레이아웃이 변경되고 그 주위의 요소가 이동될 수 있기 때문이다.
- Next.js는 모듈을 사용할 때 애플리케이션의 글꼴을 자동으로 최적화 한다.
- next/font 빌드 시 글꼴 파일을 다운로드하고 다른 정적 자산과 함께 호스팅한다.
- 따라서, 성능에 영향을 미칠 수 있는 글꼴에 대한 추가 네트워크 요청이 없음을 의미한다.

- 먼저 app/ui 폴더에 fonts.ts라는 새로운 파일을 만든다.
- 이 파일을 사용하여 애플리케이션 전체에서 사용할 글꼴을 보관할 수 있다.
- 다음 /font/google 모듈에서 Inter 글꼴을 가져오면 기본 글꼴이 된다.

```ts
import { Inter } from 'next/font/google';
```

- 그런 다음 로드할 하위 집합을 지정한다.(이 예제에서는 "라틴어")

```ts
export const inter = Inter({ subsets: ['latin'] });
```

- 마지막으로 /app/layout.tsx의 <body> 요소에 글꼴을 추가한다.
- 글꼴을 부드럽게 처리하는 Tailwind 앤티앨리어싱 클래스도 추가한다.

```ts
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

### Images

- Next.js는 이미지와 같은 정적 에셋을 최상위 폴더인 /public 폴더에서 제공할 수 있다.
- public 폴더에 있는 파일은 애플리케이션에서 참조할 수 있다.

```HTML

```

- 하지만 위와 같은 방법은 다음과 같은 내용을 수동으로 처리해야함을 의미한다.

1. 이미지가 다양한 화면 크기에서 반응하는지 확인
2. 다양한 디바이스에 맞는 이미지 크기를 지정
3. 이미지가 로드될 때 레이아웃이 이동하지 않도록 하기
4. 사용자 뷰포트 외부에 있는 이미지를 지연 로드

- 이미지 최적화는 그 자체로 전문 분야라고 할 수 있을 정도로 웹 개발에서 큰 주제이다.
- 따라서, 이러한 최적화를 수동으로 구현하는 대신 다음/이미지 컴포넌트를 사용하여 이미지를 자동으로 최적화할 수 있습니다.

- <Image> 컴포넌트는 HTML의 <img> 태그의 확장으로, 다음과 같은 자동 이미지 최적화 기능을 제공한다.

1. 이미지가 로드될 때 레이아웃이 자동으로 바뀌는 것을 방지한다.
2. 뷰포트가 작은 기기에 큰 이미지가 전송되지 않도록 이미지 크기 조정
3. 기본적으로 이미지 지연 로딩(이미지가 뷰포트에 들어올 때 로드됨)
4. 브라우저에서 지원하는 경우 WebP 및 AVIF와 같은 최신 형식의 이미지 제공

- 실습
- 먼저 현재 public 폴더 내부에서는 "hero-desktop.png"와 "hero-mobile.png"라는 두 개의 이미지가 있고 이 두 이미지는 완전히 다르게 사용자의 기기가 데스트톱인지 모바일인지에 따라 표시된다.

- Image 컴포넌트 import

```tsx
import Image from 'next/image';
```

- Image 컴포넌트 추가
- 너비 1000, 높이 760 픽셀로 설정 및 모바일 화면의 DOM에서 이미지를 제거하기 위해 hidden class를 사용하고 데스크톱 화면에서 이미지를 표시하기 위해 md:block을 사용
- md : 중간 크기의 화면(md: medium) 이상을 의미함.

```tsx
<Image
  src="/hero-desktop.png"
  width={1000}
  height={760}
  className="hidden md:block"
  alt="Screenshots of the dashboard project showing desktop version"
/>
```

- 모바일 환경에서 표시될 <Image> 컴포넌트 추가

```tsx
<Image
  src="/hero-mobile.png"
  width={560}
  height={620}
  className="block md:hidden"
  alt="Screenshot of the dashboard project showing mobile version"
/>
```
