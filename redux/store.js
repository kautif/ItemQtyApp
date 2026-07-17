import { configureStore } from '@reduxjs/toolkit';
import itemReducer from './itemSlice';

export const store = configureStore({
  reducer: { 
    items: itemReducer
  },
});