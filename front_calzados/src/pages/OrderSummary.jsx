import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

function OrderSummary() {
  const [orden, setOrden] = useState(null);
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    const stored = localStorage.getItem('ultimaOrden');
    if (stored) {
      const parsed = JSON.parse(stored);
      setOrden(parsed);

      // ✅ Esperamos brevemente antes de limpiar carrito y borrar orden
      setTimeout(() => {
        clearCart();
        localStorage.removeItem('ultimaOrden');
      }, 500);
    } else {
      toast.info('No se encontró una orden reciente.');
      navigate('/products');
    }
  }, []);

  if (!orden) return null;

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h1 className="text-3xl font-bold text-green-600 mb-6">Resumen de tu Orden 🧾</h1>

      <div className="mb-4 text-gray-700">
        <p><span className="font-semibold">Fecha:</span> {orden.fecha}</p>
        <p><span className="font-semibold">Total:</span> S/. {orden.total}</p>
      </div>

      <div className="grid gap-6 mt-6">
        {orden.productos.map((item, idx) => (
          <div
            key={item.sku + idx}
            className="flex flex-col md:flex-row items-center bg-gray-100 p-4 rounded-lg shadow-sm"
          >
            <img
              src={`http://localhost:5000${item.imagen}` || 'https://placehold.co/120x120'}
              alt={item.nombre}
              className="w-24 h-24 object-cover rounded-md mr-4"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/120x120?text=No+Image';
              }}
            />

            <div className="flex-1">
              <h2 className="text-xl font-semibold">{item.nombre}</h2>
              <p className="text-sm text-gray-600">Talla: {item.talla} - Color: {item.color}</p>
              <p className="text-lg text-gray-800 font-medium">Cantidad: {item.cantidad}</p>
              <p className="text-md text-gray-700">Precio unitario: S/. {item.precio.toFixed(2)}</p>
              <p className="text-md text-gray-700">
                Subtotal: S/. {(item.precio * item.cantidad).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/products"
          className="bg-blue-600 text-white text-lg font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition"
        >
          Seguir Comprando
        </Link>
      </div>
    </div>
  );
}

export default OrderSummary;
