import { Metadata } from "next"
import { Suspense } from "react";

import { fetchFilteredCustomers } from "@/app/lib/data";
import CustomersTable from "@/app/ui/customers/table";

export const metadata:Metadata={
  title:"Customers"
}

export default async function CustomersPage({searchParams}:{searchParams:{
  query?:string;
  page?:string;
}}) {
  const query = searchParams?.query || "";
  const customers = await fetchFilteredCustomers(query);
  return (
    <Suspense >
        <CustomersTable customers={customers} />
    </Suspense>
  )
}
