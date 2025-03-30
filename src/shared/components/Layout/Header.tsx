"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import CartSidebar from '../Cart/CartSidebar';

const Header = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const cartItems = useSelector((state:any) => state.cart.items);
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

    // Debug key handler
    useEffect(() => {
      const handleKeyDown = (e) => {
        // Toggle debug mode with Alt+D
        if (e.altKey && e.key === 'd') {
          setDebugMode(prev => !prev);
          console.log('Debug mode:', !debugMode);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [debugMode]);

  return (
    <header className={`fixed w-full z-30 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-md'} ${debugMode ? 'border-4 border-red-500' : ''}`}>
    <div className="container mx-auto px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold cursor-pointer">
          ShopApp {debugMode && <span className="text-xs text-red-500">[Debug Mode]</span>}
        </Link>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-4 md:hidden">
          <button 
            aria-label="Search"
            // onClick={() => router.push('/search')}
            className="p-2 text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <button 
            aria-label="Cart"
            onClick={() => setShowCart(true)}
            className="p-2 text-gray-700 relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
          
          <button
            aria-label="Menu"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          <Link href="/" className={`text-gray-700 hover:text-gray-900 ${pathname === '/' ? 'font-semibold' : ''}`}>
            Home
          </Link>
          <Link href="/collections/all" className={`text-gray-700 hover:text-gray-900 ${pathname.includes('/collections') ? 'font-semibold' : ''}`}>
            Collections
          </Link>
          
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-100 rounded-full px-4 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          
          <button 
            aria-label="Cart"
            onClick={() => setShowCart(true)}
            className="relative text-gray-700 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
        <nav className="flex flex-col space-y-3 py-3">
          <Link href="/" className={`block px-4 py-2 rounded-md ${pathname === '/' ? 'bg-gray-100 font-medium' : ''}`}>
            Home
          </Link>
          <Link href="/collections/all" className={`block px-4 py-2 rounded-md ${pathname.includes('/collections') ? 'bg-gray-100 font-medium' : ''}`}>
            Collections
          </Link>
          <Link href="/search" className={`block px-4 py-2 rounded-md ${pathname === '/search' ? 'bg-gray-100 font-medium' : ''}`}>
            Search
          </Link>
          <Link href="/cart" className={`block px-4 py-2 rounded-md ${pathname === '/cart' ? 'bg-gray-100 font-medium' : ''}`}>
            Cart
          </Link>
        </nav>

        <form onSubmit={handleSearch} className="mt-3 relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-100 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>
    </div>

    {/* Cart Sidebar */}
    <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
  </header>
  )
}

export default Header