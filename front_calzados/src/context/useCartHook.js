// src/context/useCartHook.js
import { useContext } from 'react';
import { CartContext } from './CartContext'; // Importa el contexto de su archivo original

export function useCart() {
  return useContext(CartContext);
}