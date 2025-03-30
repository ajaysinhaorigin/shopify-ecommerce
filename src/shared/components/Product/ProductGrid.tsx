import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import EmptyState from '../UI/EmptyState';
import Loader from '../UI/Loader';

export default function ProductGrid({ products, loading, emptyMessage = "No products found" }) {
  const [columns, setColumns] = useState(4);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(2);
      } else if (width < 1024) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    // Use skeleton loader for better UX
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-${columns} lg:grid-cols-${columns} gap-4 md:gap-6 py-4`}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 aspect-square w-full rounded-lg mb-2"></div>
            <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  const gridClasses = {
    2: 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 py-4',
    3: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 py-4',
    4: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 py-4'
  };

  return (
    <div className={gridClasses[columns]}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
