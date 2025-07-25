import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/useCartHook';;
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  // Calcular total del carrito
  const total = cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  // Cambiar cantidad
  const handleQuantityChange = (sku, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(sku, newQuantity);
    }
  };

  // Quitar producto del carrito
  const handleRemove = (sku) => {
    removeFromCart(sku);
    toast.success('Producto eliminado del carrito 🗑️');
  };

  // Redirigir al checkout
  const handleCheckout = () => {
    navigate('/checkout'); // ✅ Redirección actualizada
  };

  // Carrito vacío
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-6 text-center text-xl text-gray-600">
        Tu carrito está vacío.
        <Link to="/products" className="block mt-4 text-blue-500 hover:underline">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Carrito de Compras</h1>

      {/* Lista de productos */}
      <div className="grid gap-6">
        {cartItems.map((item) => (
          <div
            key={item.sku}
            className="flex flex-col md:flex-row items-center md:items-start bg-white p-4 rounded-lg shadow-md"
          >
            <img
              src={item.imagen ? `${API_BASE_URL}/${item.imagen}` : 'https://placehold.co/120x120'}
              alt={item.nombre}
              className="w-28 h-28 object-cover rounded-md mr-4"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/120x120/cccccc/333333?text=No+Image';
              }}
            />

            <div className="flex-1 w-full">
              <h2 className="text-xl font-semibold text-gray-800">{item.nombre}</h2>
              <p className="text-sm text-gray-600">Talla: {item.talla} - Color: {item.color}</p>
              <p className="text-lg font-medium text-gray-700 mt-2">S/. {item.precio.toFixed(2)}</p>

              {/* Cambiar cantidad */}
              <div className="mt-3 flex items-center space-x-2">
                <button
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => handleQuantityChange(item.sku, item.cantidad - 1)}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) => handleQuantityChange(item.sku, parseInt(e.target.value))}
                  className="w-16 text-center border rounded p-1"
                />
                <button
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => handleQuantityChange(item.sku, item.cantidad + 1)}
                >
                  +
                </button>
              </div>

              {/* Botón eliminar */}
              <button
                onClick={() => handleRemove(item.sku)}
                className="mt-3 text-red-500 text-sm hover:underline"
              >
                Quitar del carrito
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total y botón finalizar */}
      <div className="mt-8 text-right">
        <p className="text-2xl font-bold text-gray-800 mb-4">Total: S/. {total.toFixed(2)}</p>
        <button
          onClick={handleCheckout}
          className="bg-green-600 text-white text-lg font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          Finalizar Compra
        </button>
      </div>
    </div>
  );
}

export default CartPage;

