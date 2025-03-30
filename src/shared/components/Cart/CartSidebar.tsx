"use client"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import CartItem from "./CartItem"
import { checkout } from "../../../store/cartSlice"
import { usePathname, useRouter } from "next/navigation"
import EmptyState from "../UI/EmptyState"

export default function CartSidebar({ isOpen, onClose }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch()
  const { items, checkoutUrl, loading } = useSelector(
    (state: any) => state.cart
  )

  // Calculate cart totals
  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  const formattedCartTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: items[0]?.currencyCode || "USD",
  }).format(cartTotal)

  // Close the sidebar when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      onClose()
    }

    // router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      // router.events.off('routeChangeStart', handleRouteChange);
    }
  }, [onClose])

  // Handle checkout
  const handleCheckout = () => {
    // dispatch(checkout() as any)
  }

  // Navigate to cart page
  const goToCart = () => {
    router.push('/cart');
    onClose()
  }

  return (
    <>
      {/* Background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full h-full sm:w-96 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Shopping Cart ({itemCount})
            </h2>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-hidden p-4">
            {items.length === 0 ? (
              <EmptyState message="Your cart is empty" />
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>{formattedCartTotal}</p>
              </div>
              <p className="text-sm text-gray-500">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-900 focus:outline-none"
                >
                  {loading ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Checkout"
                  )}
                </button>
                <button
                  type="button"
                  onClick={goToCart}
                  className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  View Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
