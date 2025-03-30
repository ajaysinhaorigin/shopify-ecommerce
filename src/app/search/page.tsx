// app/search/page.tsx or app/search/page.js
"use client"

import { Suspense } from "react"
import SearchComponent from "../../shared/components/SearchComponent"

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchComponent />
    </Suspense>
  )
}
