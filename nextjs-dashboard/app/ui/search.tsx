'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  // replace는 현재 보고 있는 페이지를 새 페이지로 교체하는 기능을 제공한다

  const handleSearch = useDebouncedCallback((term) => {
    console.log('searching...', term);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 500);
  // function handleSearch(term: string) {
  //   const params = new URLSearchParams(searchParams);
  //   // URLSearchParams : URL 쿼리 매개변수를 조작하기 위한 유틸리티 메서드를 제공하는 웹 API이다.
  //   // 복잡한 문자열 리터럴을 만드는 대신 이 메서드를 사용하여 ?page=1&query=a와 같은 파라미터 문자열을 가져올 수 있다.
  //   if (term) {
  //     params.set('query', term);
  //   } else {
  //     params.delete('query');
  //   }
  //   replace(`${pathname}?${params.toString()}`);
  //   // URL을 업데이트 한다
  //   // 페이지를 다시 로드하지 않고도 URL을 업데이트할 수 있다.
  // }
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

// 사용자의 입력으로 URL을 업데이트하고, useSearchParams 훅을 사용하여 URL을 읽는다.
