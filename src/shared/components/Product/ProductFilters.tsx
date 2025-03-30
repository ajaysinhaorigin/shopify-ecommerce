import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

export default function ProductFilters({ 
  availableFilters = [], 
  activeFilters = {},
  onFilterChange 
}:any) {
  // const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  // Reset price range when filters change
  useEffect(() => {
    if (activeFilters.priceMin && activeFilters.priceMax) {
      setPriceRange([
        parseInt(activeFilters.priceMin), 
        parseInt(activeFilters.priceMax)
      ]);
    }
  }, [activeFilters]);

  const applyFilters = (newFilters) => {
    onFilterChange(newFilters);
  };

  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value);
    let newPriceRange;
    
    if (type === 'min') {
      newPriceRange = [value, priceRange[1]];
    } else {
      newPriceRange = [priceRange[0], value];
    }
    
    setPriceRange(newPriceRange);
  };

  const handlePriceRangeApply = () => {
    applyFilters({
      ...activeFilters,
      priceMin: priceRange[0].toString(),
      priceMax: priceRange[1].toString()
    });
  };

  const handleCheckboxChange = (filterType, value) => {
    const currentValues = activeFilters[filterType] || [];
    let newValues;

    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }

    if (newValues.length === 0) {
      const newFilters = { ...activeFilters };
      delete newFilters[filterType];
      applyFilters(newFilters);
    } else {
      applyFilters({
        ...activeFilters,
        [filterType]: newValues
      });
    }
  };

  const clearAllFilters = () => {
    applyFilters({});
  };
  
  // Check if any filters are applied
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="w-full mb-6">
      {/* Mobile filter dialog */}
      <div className="md:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between p-4 bg-white rounded-md shadow-sm border border-gray-200"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          <span className="text-base font-medium text-gray-900">Filters</span>
          <svg
            className={`h-5 w-5 text-gray-500 transform ${mobileFiltersOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${mobileFiltersOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <div className="p-4 border border-gray-200 border-t-0 rounded-b-md bg-white">
            {/* Mobile filter content */}
            <FilterContent 
              availableFilters={availableFilters}
              activeFilters={activeFilters}
              priceRange={priceRange}
              onPriceChange={handlePriceChange}
              onPriceRangeApply={handlePriceRangeApply}
              onCheckboxChange={handleCheckboxChange}
            />
            
            {/* Filter actions */}
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                className="text-sm text-gray-500"
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
              >
                Clear all
              </button>
              <button
                type="button"
                className="bg-black text-white py-2 px-4 rounded-md text-sm font-medium"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop filters */}
      <div className="hidden md:block">
        <div className="bg-white p-5 rounded-md shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            {hasActiveFilters && (
              <button
                type="button"
                className="text-sm text-gray-500"
                onClick={clearAllFilters}
              >
                Clear all
              </button>
            )}
          </div>
          
          <FilterContent 
            availableFilters={availableFilters}
            activeFilters={activeFilters}
            priceRange={priceRange}
            onPriceChange={handlePriceChange}
            onPriceRangeApply={handlePriceRangeApply}
            onCheckboxChange={handleCheckboxChange}
          />
        </div>
      </div>
    </div>
  );
}

function FilterContent({ 
  availableFilters, 
  activeFilters, 
  priceRange, 
  onPriceChange, 
  onPriceRangeApply, 
  onCheckboxChange 
}) {
  return (
    <div className="space-y-6">
      {/* Price range filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="price-min" className="sr-only">Minimum price</label>
            <input
              type="number"
              id="price-min"
              value={priceRange[0]}
              onChange={(e) => onPriceChange(e, 'min')}
              min="0"
              className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
              placeholder="Min"
            />
          </div>
          <span className="text-gray-500">-</span>
          <div className="flex-1">
            <label htmlFor="price-max" className="sr-only">Maximum price</label>
            <input
              type="number"
              id="price-max"
              value={priceRange[1]}
              onChange={(e) => onPriceChange(e, 'max')}
              min="0"
              className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm"
              placeholder="Max"
            />
          </div>
          <button
            type="button"
            onClick={onPriceRangeApply}
            className="bg-gray-100 text-gray-800 py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Apply
          </button>
        </div>
      </div>
      
      {/* Other filters */}
      {availableFilters.map((filter) => (
        <div key={filter.id}>
          <h3 className="text-sm font-medium text-gray-900 mb-3">{filter.label}</h3>
          <div className="space-y-2">
            {filter.values.map((value) => (
              <div key={`${filter.id}-${value}`} className="flex items-center">
                <input
                  id={`${filter.id}-${value}`}
                  name={`${filter.id}[]`}
                  value={value}
                  type="checkbox"
                  checked={(activeFilters[filter.id] || []).includes(value)}
                  onChange={() => onCheckboxChange(filter.id, value)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor={`${filter.id}-${value}`}
                  className="ml-3 text-sm text-gray-600"
                >
                  {value}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
