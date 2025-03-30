import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createCheckout } from '../lib/shopify';

// Load cart from localStorage if available
const loadCartFromStorage = () => {
  if (typeof window === 'undefined') {
    return { items: [], checkoutUrl: null };
  }
  
  try {
    const savedCart = localStorage.getItem('shopApp.cart');
    return savedCart ? JSON.parse(savedCart) : { items: [], checkoutUrl: null };
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return { items: [], checkoutUrl: null };
  }
};

// Save cart to localStorage
const saveCartToStorage = (cart) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('shopApp.cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Create checkout async thunk
export const checkout = createAsyncThunk(
  'cart/checkout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { cart } = getState();
      
      // Format line items for Shopify checkout
      const lineItems = cart.items.map(item => ({
        variantId: item.id,
        quantity: item.quantity,
      }));
      
      // Create checkout in Shopify
      const checkoutData = await createCheckout(lineItems);
      
      // Redirect to checkout URL
      if (checkoutData.webUrl) {
        window.location.href = checkoutData.webUrl;
      }
      
      return checkoutData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  ...loadCartFromStorage(),
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      
      saveCartToStorage(state);
    },
    
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        item.quantity = quantity;
      }
      
      saveCartToStorage(state);
    },
    
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      
      saveCartToStorage(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.checkoutUrl = null;
      
      saveCartToStorage(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutUrl = action.payload.webUrl;
        saveCartToStorage(state);
      })
      .addCase(checkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create checkout';
      });
  },
});

export const { addToCart, updateCartItem, removeFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
