"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductGrid from './Product/ProductGrid';
import Loader from './UI/Loader';
import ErrorMessage from './UI/ErrorMessage';
import ApiErrorMessage from './UI/ApiErrorMessage';
import { getFeaturedProducts } from '../../lib/shopify';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string |null>(null);
  const [isApiConfigError, setIsApiConfigError] = useState(false);
  
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        
        // Check if we have the necessary API configuration
        if (!process.env.NEXT_PUBLIC_SHOPIFY_API_URL || !process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN) {
          console.error('API configuration error: Missing Shopify API credentials');
          setIsApiConfigError(true);
          return;
        }
        
        // Note: We don't need to do URL validation here anymore since we've added
        // auto-correction for swapped credentials in lib/shopify.js
        // The Apollo client will automatically handle and correct swapped credentials
        
        // Our updated Shopify client will detect and swap credentials if needed
        // So we don't need to validate them here, it will happen in the client
        
        const featuredProducts = await getFeaturedProducts();
        setProducts(featuredProducts);
        setError(null);
        
        // Check if we might have an API configuration error based on empty response
        if (featuredProducts.length === 0) {
          console.warn('No featured products returned - could indicate API configuration issues');
        }
        
      } catch (err:any) {
        console.error('Error loading featured products:', err);
        
        // Extract network error details if available
        const networkError = err?.networkError;
        const statusCode = networkError?.statusCode;
        
        // Check for common API configuration errors
        if (statusCode === 404 || statusCode === 401 || statusCode === 403) {
          setIsApiConfigError(true);
          setError('Unable to connect to Shopify API. Please check your API URL and access token.');
        } else if (networkError) {
          setError(`Network error (${statusCode || 'unknown'}): Unable to connect to Shopify API.`);
        } else if (err?.graphQLErrors?.length > 0) {
          // Extract the first GraphQL error message
          const graphQLError = err.graphQLErrors[0].message || 'GraphQL error occurred';
          setError(`API Error: ${graphQLError}`);
        } else {
          setError('Failed to load featured products. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadFeaturedProducts();
  }, []);
  
  if (isApiConfigError) {
    return <ApiErrorMessage apiUrl={process.env.NEXT_PUBLIC_SHOPIFY_API_URL} />;
  }
  
  if (error) {
    return <ErrorMessage message={error} action={() => window.location.reload()} actionText="Try Again" />;
  }
  
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-0">Featured Products</h2>
          <Link 
            href="/collections/all" 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            View all products
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        {loading ? (
          <Loader />
        ) : products.length > 0 ? (
          <ProductGrid products={products} loading={false} />
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No featured products available at this time.</p>
          </div>
        )}
      </div>
    </section>
  );
}
