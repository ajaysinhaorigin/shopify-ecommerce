"use client"
import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import Loader from "../../../shared/components/UI/Loader"
import ErrorMessage from "../../../shared/components/UI/ErrorMessage"
import ApiErrorMessage from "../../../shared/components/UI/ApiErrorMessage"
import { getProductByHandle } from "../../../lib/shopify"
import { addToCart } from "../../../store/cartSlice"
import Layout from "@/shared/components/Layout/Layout"
import { useParams } from "next/navigation"

export default function ProductPage() {
  const { handle } = useParams()
  const dispatch = useDispatch()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isApiConfigError, setIsApiConfigError] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [quantity, setQuantity] = useState(1)

  // Fetch product data when the handle is available
  useEffect(() => {
    if (!handle) return

    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if API config is available
        if (
          !process.env.NEXT_PUBLIC_SHOPIFY_API_URL ||
          !process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN
        ) {
          console.error(
            "API configuration error: Missing Shopify API credentials"
          )
          setIsApiConfigError(true)
          return
        }

        const productData = await getProductByHandle(handle)

        if (!productData) {
          setError("Product not found")
          return
        }

        setProduct(productData)

        // Initialize with the first available variant
        if (productData.variants && productData.variants.length > 0) {
          const defaultVariant =
            productData.variants.find((v) => v.availableForSale) ||
            productData.variants[0]
          setSelectedVariant(defaultVariant)

          // Initialize selected options based on the default variant
          const initialOptions = {}
          defaultVariant.selectedOptions.forEach((option) => {
            initialOptions[option.name] = option.value
          })
          setSelectedOptions(initialOptions)
        }
      } catch (err: any) {
        console.error("Error fetching product:", err)

        // Detect API configuration errors
        const networkError = err?.networkError
        const statusCode = networkError?.statusCode

        if (statusCode === 404 || statusCode === 401 || statusCode === 403) {
          setIsApiConfigError(true)
        } else {
          setError("Failed to load product. Please try again later.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [handle])

  // Find the appropriate variant when selectedOptions change
  useEffect(() => {
    if (!product || !product.variants) return

    // Function to check if a variant matches the selected options
    const findVariantByOptions = (variants, selectedOptions) => {
      return variants.find((variant) => {
        return variant.selectedOptions.every(
          (option) => selectedOptions[option.name] === option.value
        )
      })
    }

    const matchedVariant = findVariantByOptions(
      product.variants,
      selectedOptions
    )
    if (matchedVariant) {
      setSelectedVariant(matchedVariant)
    }
  }, [selectedOptions, product])

  // Handle option changes (e.g., size, color)
  const handleOptionChange = (optionName, optionValue) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: optionValue,
    }))
  }

  // Handle adding product to cart
  const handleAddToCart = () => {
    if (!selectedVariant || !product) return

    const mainImage = product.images[0]?.url || ""

    dispatch(
      addToCart({
        id: selectedVariant.id,
        productId: product.id,
        title: product.title,
        handle: product.handle,
        variantTitle:
          selectedVariant.title === "Default Title"
            ? null
            : selectedVariant.title,
        price: parseFloat(selectedVariant.priceV2.amount),
        currencyCode: selectedVariant.priceV2.currencyCode,
        imageUrl: mainImage,
        quantity,
      })
    )

    // Optional: Show a success message or redirect to cart
  }

  // Format price
  const formatPrice = (amount, currencyCode) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
    }).format(amount)
  }

  // Handle quantity changes
  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))

  if (isApiConfigError) {
    return (
      <>
        <ApiErrorMessage apiUrl={process.env.NEXT_PUBLIC_SHOPIFY_API_URL} />
      </>
    )
  }

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-12">
          <Loader />
        </div>
    )
  }

  if (error || !product) {
    return (
        <div className="container mx-auto px-4 py-12">
          <ErrorMessage
            message={error || "Product not found"}
            action={() => {}}
            actionText="Go Back"
          />
        </div>
    )
  }

  // Extract product details
  const {
    title,
    description,
    descriptionHtml,
    images,
    options,
    vendor,
    productType,
  } = product

  // Get price information
  const price = selectedVariant ? parseFloat(selectedVariant.priceV2.amount) : 0
  const compareAtPrice = selectedVariant?.compareAtPriceV2
    ? parseFloat(selectedVariant.compareAtPriceV2.amount)
    : null
  const currencyCode = selectedVariant?.priceV2.currencyCode || "USD"
  const isOnSale = compareAtPrice && compareAtPrice > price
  const isInStock = selectedVariant?.availableForSale

  return (
    <>
      <Head>
        <meta
          name="description"
          content={description || `${title} - ShopApp Product`}
        />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            Home
          </Link>
          {" / "}
          <Link
            href="/collections/all"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            All Products
          </Link>
          {" / "}
          <span className="text-sm text-gray-700">{title}</span>
        </div>

        <div className="flex flex-col md:flex-row -mx-4">
          {/* Product Images */}
          <div className="md:w-1/2 px-4 mb-6 md:mb-0">
            <div
              className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden"
              style={{ minHeight: "400px" }}
            >
              {images && images.length > 0 ? (
                <div
                  className="relative w-full aspect-square"
                  style={{ position: "relative" }}
                >
                  <Image
                    src={images[activeImage]?.url || ""}
                    alt={images[activeImage]?.altText || title}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="rounded-lg"
                    onLoad={() => {}}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-12 bg-gray-100 text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {images && images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    className={`relative w-16 h-16 rounded border-2 overflow-hidden flex-shrink-0 ${
                      index === activeImage
                        ? "border-indigo-500"
                        : "border-gray-200"
                    }`}
                    onClick={() => setActiveImage(index)}
                    style={{ position: "relative" }}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `${title} - Image ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="64px"
                      className="rounded"
                      onLoad={() => {}}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 px-4">
            {vendor && (
              <div className="text-sm text-gray-500 mb-2">{vendor}</div>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {title}
            </h1>

            <div className="mb-6">
              <div className="flex items-center">
                {isOnSale ? (
                  <>
                    <span className="text-lg md:text-xl font-semibold text-gray-900">
                      {formatPrice(price, currencyCode)}
                    </span>
                    <span className="ml-2 text-sm line-through text-gray-500">
                      {formatPrice(compareAtPrice, currencyCode)}
                    </span>
                    <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
                      SALE
                    </span>
                  </>
                ) : (
                  <span className="text-lg md:text-xl font-semibold text-gray-900">
                    {formatPrice(price, currencyCode)}
                  </span>
                )}
              </div>

              <div className="mt-2">
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    isInStock
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isInStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Product Options */}
            {options && options.length > 0 && options[0].name !== "Title" && (
              <div className="mb-6 space-y-4">
                {options.map((option) => (
                  <div key={option.id}>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {option.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const isSelected =
                          selectedOptions[option.name] === value

                        // Find if this option value is available
                        const hasAvailableVariant = product.variants.some(
                          (variant) =>
                            variant.availableForSale &&
                            variant.selectedOptions.some(
                              (opt) =>
                                opt.name === option.name && opt.value === value
                            )
                        )

                        return (
                          <button
                            key={`${option.name}-${value}`}
                            className={`px-3 py-2 text-sm rounded-md border ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                : !hasAvailableVariant
                                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                            onClick={() =>
                              hasAvailableVariant &&
                              handleOptionChange(option.name, value)
                            }
                            disabled={!hasAvailableVariant}
                          >
                            {value}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Quantity
              </h3>
              <div className="flex">
                <button
                  className="bg-gray-100 px-3 py-1 border border-gray-300 rounded-l-md"
                  onClick={decrementQuantity}
                  disabled={!isInStock}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  readOnly
                  className="w-16 text-center border-t border-b border-gray-300"
                />
                <button
                  className="bg-gray-100 px-3 py-1 border border-gray-300 rounded-r-md"
                  onClick={incrementQuantity}
                  disabled={!isInStock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mb-6">
              <button
                className={`w-full py-3 px-6 rounded-md text-white font-medium ${
                  isInStock
                    ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                onClick={handleAddToCart}
                disabled={!isInStock}
              >
                {isInStock ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>

            {/* Product Description */}
            {description && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Description
                </h3>
                {descriptionHtml ? (
                  <div
                    className="prose prose-sm max-w-none text-gray-500"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                ) : (
                  <p className="text-gray-500">{description}</p>
                )}
              </div>
            )}

            {/* Product Type & Tags*/}
            {productType && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {productType && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Category
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {productType}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
      </>
  )
}
