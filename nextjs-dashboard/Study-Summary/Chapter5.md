## Navigating Between Pages

- 이번 챕터에서는 사용자가 대시보드 경로를 탐색할 수 있도록 몇 가지 링크를 추가해본다.
- 페이지 사이를 연결하려면 기존에 HTML의 <a> 태그를 사용했었지만, <a> 태그의 경우 페이지를 탐색할 때 페이지의 전체 페이지 새로고침이 발생하는 문제가 있다.
- Next.js에서는 <Link /> 컴포넌트를 사용하여 애플리케이션의 페이지 간에 링크를 연결할 수 있다.

### The <Link> component

```tsx
// /app/ui/dashboard/nav-links.tsx
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
];

export default function NavLinks() {
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <a
            key={link.name}
            href={link.href}
            className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </a>
        );
      })}
    </>
  );
}
```

- 위 코드는 기존의 페이지간의 이동을 <a> 태그를 사용하는 방식이다.

```tsx
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
];

export default function NavLinks() {
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          // next의 Link 태그로 수정
          <Link
            key={link.name}
            href={link.href}
            className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
```

- 이제 전체 새로고침 없이 페이지 사이를 탐색할 수 있다.
- 그런데 애플리케이션의 일부가 서버에서 렌더링되지만 전체 페이지 새로고고침이 없기 때문에 웹앱처럼 느껴진다.
- 그 이유는 Next.js는 경로 세그먼트별로 애플리케이션을 자동으로 코드 분할을 한다.
- 즉, 브라우저가 최초 로드 시 모든 애플리케이션 코드를 로드하는 기존 React SPA와는 달리, 페이지가 분리된다는 것을 의미한다.
- 프로덕션 환경에서 만약 <Link> 컴포넌트가 브라우저의 뷰포트에 표시되면 Next.js는 링크된 경로에 대한 코드를 백그라운드에서 자동으로 프리패치 해둔다. 따라서, 사용자가 <Link>를 클릭할 때마다 페이지 전환이 즉각적으로 이루어진다.
- Next.js는 현재 보고 있는 페이지 (예: a 페이지)에 연결된 링크 (예: b 페이지와 c 페이지)가 뷰포트 내에 나타나면 해당 연결된 페이지의 코드를 백그라운드에서 미리 로드한다.
- 이것은 사용자가 실제로 링크를 클릭하기 전에 이미 다음 페이지 (b 페이지 또는 c 페이지)의 코드를 로드하여 페이지 전환 속도를 향상시키고 빠르게 페이지를 렌더링할 수 있도록 도와준다.
- 이렇게 함으로써 사용자 경험을 최적화하고 페이지 간의 전환이 더 부드럽게 이루어진다.

### Pattern : Showing active links

- Next.js는 URL에서 사용자의 현재 경로를 확인하고 사용자에게 제공하기 위해 `usePathname()`이라는 훅을 제공한다.
- `usePathname()`은 훅이므로 사용하는 컴포넌트를 Client Component로 변경해야 한다.(서버 사이드 렌더링이 아닌 클라이언트 사이드 렌더링을 해야한다는 의미)

- 다음은 `usePathname()` 훅과 clsx 라이브러리를 사용해서 현재 경로와 link.href가 일치하는 경우 링크를 파란색 텍스트와 하늘색 배경으로 표시하는 코드이다.

```tsx
// /app/ui/dashboard/nav-links.tsx
'use client';

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              { 'bg-sky-100 text-blue-600': pathname === link.href },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
```
