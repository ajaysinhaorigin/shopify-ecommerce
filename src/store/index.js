import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  // Enable Redux DevTools extension in development
  devTools: process.env.NODE_ENV !== 'production',
});
