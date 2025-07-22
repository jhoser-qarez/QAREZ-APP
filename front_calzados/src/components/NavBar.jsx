// src/components/Navbar.jsx
    import React from 'react';
    import { Link } from 'react-router-dom'; // Importamos Link para la navegación

    function Navbar() {
      return (
        <nav className="bg-gray-800 p-4 text-white shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            {/* Logo o Nombre de la Tienda */}
            <Link to="/" className="text-2xl font-bold text-white hover:text-blue-300 transition-colors duration-200">
              👟 i QAREZ
            </Link>
        

            {/* Enlaces de Navegación */}
            <div className="space-x-6 flex items-center">
              <Link to="/" className="text-lg font-medium hover:text-blue-300 transition-colors duration-200">Inicio</Link>
              <Link to="/products" className="text-lg font-medium hover:text-blue-300 transition-colors duration-200">Productos</Link>
              {/* Aquí podrías añadir más enlaces como Categorías, Contacto, etc. */}
            </div>

            {/* Íconos de Usuario y Carrito */}
            <div className="space-x-4 flex items-center">
              <Link to="/login" className="text-lg font-medium hover:text-blue-300 transition-colors duration-200">Iniciar Sesión</Link>
              <Link to="/register" className="text-lg font-medium hover:text-blue-300 transition-colors duration-200">Registrarse</Link>
              <Link to="/cart" className="text-lg font-medium hover:text-blue-300 transition-colors duration-200">
                🛒 Carrito (0) {/* Aquí mostraremos el número de ítems en el carrito */}
              </Link>
            </div>
          </div>
        </nav>
      );
    }

    export default Navbar;
    