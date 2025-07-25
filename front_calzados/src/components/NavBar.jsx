import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCartHook'; // ✅ Importamos el contexto del carrito

function Navbar() {
  const { cartItems } = useCart(); // ✅ Accedemos al carrito global

  return (
    <nav className="bg-gray-800 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo o Nombre de la Tienda */}
        <Link to="/" className="text-2xl font-bold text-white hover:text-blue-300 transition-colors duration-200">
          👟 Calzados Yeremi
        </Link>

        {/* Enlaces de Navegación */}
        <div className="space-x-6 flex items-center">
          <Link to="/" className="text-lg font-medium hover:text-blue-300 transition-colors duration-200">
            Inicio
          </Link>
          <Link to="/products" className="text-lg font-medium hover:text-blue-300 transition-colors duration-200">
            Productos
          </Link>
        </div>

        {/* Íconos de Usuario y Carrito */}
        <div className="space-x-4 flex items-center">
          <Link to="/login" className="text-lg font-medium hover:text-blue-300 transition-colors duration-200">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="text-lg font-medium hover:text-blue-300 transition-colors duration-200">
            Registrarse
          </Link>

          {/* ✅ Ícono del Carrito con badge dinámico */}
          <Link to="/cart" className="relative text-lg font-medium hover:text-blue-300 transition-colors duration-200">
            🛒
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItems.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
