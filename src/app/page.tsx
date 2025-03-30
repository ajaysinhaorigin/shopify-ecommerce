import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>ShopApp - Mobile-optimized Shopify Store</title>
        <meta name="description" content="Discover the latest products and collections at ShopApp" />
      </Head>

      {/* Hero Section */}
      <section className="relative">
        <div className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center z-10">
            <div className="text-center px-4 sm:px-6 lg:px-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                Shop the Latest Trends
              </h1>
              <p className="mt-6 max-w-lg mx-auto text-xl text-white">
                Discover our curated collection of premium products
              </p>
              <div className="mt-10 sm:flex sm:justify-center">
                <div className="rounded-md shadow">
                  <Link href="/collections/all" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                    Shop Now
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link href="/search" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                    Search Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0">
            {/* We're using a div with background image instead of Next.js Image component for the hero section */}
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80')"
              }}
            />
          </div>
        </div>
      </section>



    </>
  );
}
