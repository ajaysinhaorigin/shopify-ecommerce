"use client"
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Head from 'next/head';
import Link from 'next/link';
import CartItem from '../../shared/components/Cart/CartItem';
import EmptyState from '../../shared/components/UI/EmptyState';
import { checkout } from '../../store/cartSlice';

export default function Cart() {
  const dispatch:any = useDispatch();
  const { items, checkoutUrl, loading } = useSelector((state:any) => state.cart);
  
  // Calculate cart totals
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const currencyCode = items[0]?.currencyCode || 'USD';
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };
  
  // Handle checkout
  const handleCheckout = () => {
    dispatch(checkout());
  };
  
  // Calculate any additional costs
  const estimatedTax = subtotal * 0.05;
  const shippingEstimate = subtotal > 50 ? 0 : 5.99;
  const totalEstimate = subtotal + estimatedTax + shippingEstimate;
  
  return (
    <>
      <Head>
        <title>Shopping Cart | ShopApp</title>
        <meta name="description" content="View and manage your shopping cart" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Shopping Cart</h1>
        
        {items.length === 0 ? (
          <EmptyState message="Your cart is empty">
            <Link href="/collections/all" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Start Shopping
            </Link>
          </EmptyState>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6 lg:mb-0">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Items in Your Cart</h2>
                  
                  <div className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden sticky top-20">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <p className="text-gray-600">Subtotal</p>
                      <p className="font-medium text-gray-900">{formatCurrency(subtotal)}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className="text-gray-600">Shipping estimate</p>
                      <p className="font-medium text-gray-900">
                        {shippingEstimate === 0 ? 'Free' : formatCurrency(shippingEstimate)}
                      </p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className="text-gray-600">Tax estimate</p>
                      <p className="font-medium text-gray-900">{formatCurrency(estimatedTax)}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 flex justify-between">
                      <p className="text-base font-medium text-gray-900">Order total</p>
                      <p className="text-base font-medium text-gray-900">{formatCurrency(totalEstimate)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-900 focus:outline-none"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : "Proceed to Checkout"}
                    </button>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      or <Link href="/collections/all" className="text-indigo-600 font-medium hover:text-indigo-500">Continue Shopping</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
