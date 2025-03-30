"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCollections } from '../../lib/shopify';
import Loader from './UI/Loader';
import ErrorMessage from './UI/ErrorMessage';
import ApiErrorMessage from './UI/ApiErrorMessage';

export default function CollectionList() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiConfigError, setIsApiConfigError] = useState(false);
  
  useEffect(() => {
    const loadCollections = async () => {
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
        
        const collectionList = await getCollections();
        setCollections(collectionList);
        setError(null);
        
        // Check if we might have an API configuration error based on empty response
        if (collectionList.length === 0) {
          console.warn('No collections returned - could indicate API configuration issues or empty store');
        }
        
      } catch (err:any) {
        console.error('Error loading collections:', err);
        
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
          setError('Failed to load collections. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadCollections();
  }, []);
    
    console.log('collections',collections)
  
  if (isApiConfigError) {
    return <ApiErrorMessage apiUrl={process.env.NEXT_PUBLIC_SHOPIFY_API_URL} />;
  }
  
  if (error) {
    return <ErrorMessage message={error} action={() => window.location.reload()} actionText="Try Again" />;
  }
  
  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Shop Collections</h2>
          <Loader />
        </div>
      </section>
    );
  }
  
  if (collections.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Shop Collections</h2>
          <div className="py-12 text-center">
            <p className="text-gray-500">No collections available at this time.</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Shop Collections</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection:any) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionCard({ collection }) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  const { title, handle, image } = collection;
  const imageUrl = image?.url;
  const imageAlt = image?.altText || title;
  
  return (
    <Link 
      href={`/collections/${handle}`}
      className="block group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative aspect-[3/2]">
        {imageUrl && !imageError ? (
          <div 
            className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            style={{ position: 'relative', height: '100%', width: '100%' }}
          >
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 group-hover:scale-105"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setImageError(true);
                setIsLoading(false);
              }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-4xl font-bold text-gray-300 uppercase tracking-wider">
              {title.slice(0, 2)}
            </div>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <svg className="w-10 h-10 text-gray-300 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent">
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-white/80 group-hover:text-white transition-colors duration-200 flex items-center">
              Shop now 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
