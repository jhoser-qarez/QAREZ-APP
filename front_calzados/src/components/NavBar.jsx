import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/useCartHook';

function Navbar() {
  const { cartItems } = useCart();

  return (
    <nav className="bg-gray-800 py-3 px-4 text-white shadow-md md:p-4">
      <div className="container mx-auto flex flex-wrap justify-center items-center gap-y-2 md:justify-between md:flex-nowrap">

        {/* Sección Izquierda: Logo o Nombre de la Tienda */}
        <Link to="/" className="text-xl font-bold text-white hover:text-blue-300 transition-colors duration-200 md:text-2xl">
          👟 Calzados Yeremi
        </Link>

        {/* Sección Central: Enlaces de Navegación (centrados en desktop) */}
        {/* En móvil, estos enlaces se centran y pueden envolverse */}
        <div className="flex items-center space-x-2 text-base md:space-x-6 md:text-lg flex-grow justify-center order-last md:order-none w-full md:w-auto">
          <Link to="/" className="font-medium hover:text-blue-300 transition-colors duration-200">
            Inicio
          </Link>
          <Link to="/products" className="font-medium hover:text-blue-300 transition-colors duration-200">
            Productos
          </Link>
        </div>

        {/* Sección Derecha: Íconos de Usuario y Carrito */}
        <div className="flex items-center space-x-2 text-base md:space-x-4 md:text-lg">
          <Link to="/login" className="font-medium hover:text-blue-300 transition-colors duration-200">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="font-medium hover:text-blue-300 transition-colors duration-200">
            Registrarse
          </Link>

          {/* Ícono del Carrito con badge dinámico */}
          <Link to="/cart" className="relative font-medium hover:text-blue-300 transition-colors duration-200">
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
