'use client';

import { useSearchParams,useRouter,usePathname } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams=useSearchParams();
const pathname = usePathname();
const {replace} = useRouter()

  const handleSearch=useDebouncedCallback((term:string)=>{
    const params= new URLSearchParams(searchParams)
    params.set("page","1")
   if(term){
    params.set('query',term)
   }else{
    params.delete('query')
   }
   replace(`${pathname}?${params.toString()}`)
  },500);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e)=>handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
