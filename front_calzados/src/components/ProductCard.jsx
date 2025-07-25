// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function ProductCard({ product }) {
  // Construcción de la URL de imagen correctamente
  const imageUrl =
  product.imagenes && product.imagenes.length > 0
    ? `${API_BASE_URL}${product.imagenes[0]}` // <-- CAMBIO AQUÍ
    : 'https://placehold.co/400x300/cccccc/333333?text=No+Image';

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105">
      <Link to={`/products/${product._id}`}>
        <img
          src={imageUrl}
          alt={product.nombre}
          className="w-full h-48 object-cover object-center"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x300/cccccc/333333?text=No+Image';
          }}
        />
      </Link>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">
          {product.nombre}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.descripcion}
        </p>
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-900 font-bold text-lg">
            S/. {product.precio.toFixed(2)}
          </p>
          <span className="text-sm text-gray-500">
            Stock: {product.variantes.reduce((acc, variant) => acc + variant.stock, 0)}
          </span>
        </div>
        <Link
          to={`/products/${product._id}`}
          className="block w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md text-center transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
