"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Head from "next/head"
import ProductGrid from "../../shared/components/Product/ProductGrid"
import Loader from "../../shared/components/UI/Loader"
import ErrorMessage from "../../shared/components/UI/ErrorMessage"
import EmptyState from "../../shared/components/UI/EmptyState"
import { searchProducts } from "../../lib/shopify"

export default function Search() {
    const router: any = useRouter()
    const searchParams = useSearchParams();
    const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearched, setIsSearched] = useState(false)

  // Update the search query when the URL parameter changes
  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam)
      performSearch(queryParam)
    }
  }, [queryParam])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Update the URL parameter
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`, undefined, {
        shallow: true,
      })
      performSearch(searchQuery)
    }
  }

  const performSearch = async (query) => {
    try {
      setLoading(true)
      setIsSearched(true)
      const results = await searchProducts(query)
      setProducts(results)
      setError(null)
    } catch (err) {
      console.error("Error searching products:", err)
      setError("Failed to search products. Please try again later.")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>
          {queryParam
            ? `Search results for "${queryParam}"`
            : "Search Products"}{" "}
          | ShopApp
        </title>
        <meta name="description" content="Search for products in our store" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Search Products</h1>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-grow">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </form>

        {/* Search results */}
        {error ? (
          <ErrorMessage
            message={error}
            action={() => performSearch(searchQuery)}
            actionText="Try Again"
          />
        ) : (
          <>
            {isSearched && !loading && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-1">
                  {products.length > 0
                    ? `Search results for "${queryParam || searchQuery}"`
                    : `No results found for "${queryParam || searchQuery}"`}
                </h2>
                <p className="text-gray-600">
                  {products.length > 0
                    ? `Found ${products.length} product${
                        products.length !== 1 ? "s" : ""
                      }`
                    : "Try a different search term or browse our collections"}
                </p>
              </div>
            )}

            {loading ? (
              <Loader />
            ) : (
              <>
                {!isSearched ? (
                  <div className="text-center py-16">
                    <p className="text-gray-600 text-lg mb-8">
                      Enter a search term to find products
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                      <div className="aspect-square bg-gray-100 rounded-md animate-pulse"></div>
                      <div className="aspect-square bg-gray-100 rounded-md animate-pulse"></div>
                      <div className="aspect-square bg-gray-100 rounded-md animate-pulse"></div>
                      <div className="aspect-square bg-gray-100 rounded-md animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <ProductGrid
                    products={products}
                    loading={false}
                    emptyMessage="No products found. Try a different search term."
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
