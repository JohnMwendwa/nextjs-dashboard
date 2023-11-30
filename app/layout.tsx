import { Metadata } from "next";

import "@/app/ui/global.css"
import {inter} from "@/app/ui/fonts"


export const metadata:Metadata={
title:{
  template:"%s | Acme Dashboard",
  default:"Acme Dashboard"
},
description:"An admin dashboard built using Next.js framework",
metadataBase:new URL("https://dashboard-v1-ashy.vercel.app/")
};

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
