"use client"
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { updateCartItem, removeFromCart } from '../../../store/cartSlice';

export default function CartItem({ item }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const dispatch = useDispatch();
  
  const { id, title, handle, variantTitle, price, currencyCode, imageUrl } = item;
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD'
  }).format(price);
  
  const totalPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD'
  }).format(price * quantity);
  
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0) {
      setQuantity(newQuantity);
      dispatch(updateCartItem({
        id,
        quantity: newQuantity
      }));
    }
  };
  
  const handleRemove = () => {
    dispatch(removeFromCart(id));
  };
  
  return (
    <div className="flex py-6 border-b border-gray-200">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <div className="relative h-full w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              layout="fill"
              objectFit="cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xs">No image</span>
            </div>
          )}
        </div>
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-gray-900">
            <h3>
              <Link href={`/products/${handle}`} className="cursor-pointer">
                {title}
              </Link>
            </h3>
            <p className="ml-4">{totalPrice}</p>
          </div>
          {variantTitle && (
            <p className="mt-1 text-sm text-gray-500">{variantTitle}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">{formattedPrice} each</p>
        </div>
        
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center">
            <label htmlFor={`quantity-${id}`} className="mr-2 text-gray-500">Qty</label>
            <select
              id={`quantity-${id}`}
              value={quantity}
              onChange={handleQuantityChange}
              className="rounded-md border border-gray-300 py-1 text-base sm:text-sm"
            >
              {[...Array(10).keys()].map(num => (
                <option key={num + 1} value={num + 1}>
                  {num + 1}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
