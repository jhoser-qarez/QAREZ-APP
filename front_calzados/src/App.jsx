// src/App.jsx
    import React from 'react';
    import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Importamos componentes de React Router
    // Importamos nuestros componentes
    import Navbar from './components/NavBar';
    import ProductList from './pages/ProductList';

    function App() {
      return (
        <Router> {/* Router envuelve toda la aplicación para habilitar la navegación */}
          <div className="min-h-screen bg-gray-100 flex flex-col"> {/* Usamos flex-col para que el footer (si lo hubiera) quede abajo */}
            <Navbar /> {/* La barra de navegación se mostrará en todas las páginas */}

            <main className="flex-grow p-4"> {/* Contenedor principal para el contenido de las páginas, flex-grow para ocupar espacio */}
              <Routes> {/* Routes define las diferentes rutas de la aplicación */}
                {/* Ruta para la página de inicio */}
                <Route path="/" element={
                  <div className="text-center py-20">
                    <h1 className="text-5xl font-extrabold text-blue-600 mb-4">
                      ¡Bienvenido a tu Tienda de Calzados! 👟
                    </h1>
                    <p className="text-xl text-gray-700">Explora nuestra colección y encuentra tu par perfecto.</p>
                    <Link
                      to="/products"
                      className="mt-8 inline-block bg-blue-600 text-white text-lg font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Ver Productos
                    </Link>
                  </div>
                } />

                {/* Ruta para la página de lista de productos */}
                <Route path="/products" element={<ProductList />} />

                {/* Aquí se añadirán más rutas en el futuro (ej. /cart, /login, /register, /product/:id) */}
                {/* Ruta de ejemplo para una página no encontrada (404) */}
                <Route path="*" element={
                  <div className="text-center p-8">
                    <h2 className="text-4xl font-bold text-red-600 mb-4">404 - Página no encontrada</h2>
                    <p className="text-lg text-gray-700">Lo sentimos, la página que buscas no existe.</p>
                    <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">Volver al inicio</Link>
                  </div>
                } />

              </Routes>
            </main>
          </div>
        </Router>
      );
    }

    export default App;