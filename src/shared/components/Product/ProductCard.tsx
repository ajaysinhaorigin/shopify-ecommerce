import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../store/cartSlice';

export default function ProductCard({ product }) {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  
  // Extract product information
  const { id, title, handle, images, priceRange, availableForSale, variants } = product;
  
  // Get the first image or use a placeholder
  const imageUrl = images?.edges[0]?.node?.url || 'https://via.placeholder.com/300';
  const imageAlt = images?.edges[0]?.node?.altText || title;
  
  // Get the price to display
  const price = priceRange?.minVariantPrice?.amount || 0;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: priceRange?.minVariantPrice?.currencyCode || 'USD'
  }).format(price);
  
  // Get variant information for add to cart
  const firstVariant = variants?.edges[0]?.node || null;
  
  const handleAddToCart = () => {
    if (firstVariant && availableForSale) {
      dispatch(addToCart({
        id: firstVariant.id,
        productId: id,
        title,
        handle,
        variantTitle: firstVariant.title === 'Default Title' ? null : firstVariant.title,
        price: parseFloat(firstVariant.priceV2.amount),
        currencyCode: firstVariant.priceV2.currencyCode,
        imageUrl,
        quantity: 1
      }));
    }
  };
  
  return (
    <div className="group relative">
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Link href={`/products/${handle}`} className="relative h-full w-full cursor-pointer block">
          {imageUrl && (
            <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`} style={{ position: 'relative', height: '100%' }}>
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-300 group-hover:scale-105"
                onLoad={() => setIsLoading(false)}
              />
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
        </Link>
      </div>
      
      <div className="mt-3 flex justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-800">
            <Link href={`/products/${handle}`} className="cursor-pointer">
              {title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {formattedPrice}
          </p>
        </div>
        
        {availableForSale ? (
          <button
            type="button"
            aria-label="Add to cart"
            onClick={handleAddToCart}
            className="text-gray-700 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        ) : (
          <span className="text-xs text-red-500">Out of stock</span>
        )}
      </div>
    </div>
  );
}
