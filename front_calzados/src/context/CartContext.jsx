import React, { createContext,useEffect, useReducer } from 'react';

// ✅ Estado inicial con datos persistidos desde localStorage
const initialState = {
  cartItems: JSON.parse(localStorage.getItem('cart')) || [],
};

// ✅ Reducer central que maneja las acciones del carrito
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.cartItems.find(item => item.sku === action.payload.sku);

      if (existing) {
        // Si ya existe, actualizamos cantidad
        const updatedItems = state.cartItems.map(item =>
          item.sku === action.payload.sku
            ? { ...item, cantidad: item.cantidad + action.payload.cantidad }
            : item
        );
        return { ...state, cartItems: updatedItems };
      }

      // Si es nuevo, lo agregamos
      return { ...state, cartItems: [...state.cartItems, action.payload] };
    }

    case 'REMOVE_ITEM': {
      const filtered = state.cartItems.filter(item => item.sku !== action.payload);
      return { ...state, cartItems: filtered };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.cartItems.map(item =>
        item.sku === action.payload.sku
          ? { ...item, cantidad: action.payload.cantidad }
          : item
      );
      return { ...state, cartItems: updatedItems };
    }

    case 'CLEAR_CART':
      return { ...state, cartItems: [] };

    default:
      return state;
  }
}

// ✅ Crear contexto
const CartContext = createContext();
export { CartContext };

// ✅ Hook personalizado para consumir el contexto


// ✅ Proveedor del contexto
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // ✅ Guardamos cada cambio del carrito en localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  // ✅ Acciones disponibles desde cualquier componente
  const addToCart = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeFromCart = (sku) => {
    dispatch({ type: 'REMOVE_ITEM', payload: sku });
  };

  const updateQuantity = (sku, cantidad) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { sku, cantidad } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      cartItems: state.cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart, // ✅ disponible en CartPage y otras vistas
    }}>
      {children}
    </CartContext.Provider>
  );
}
