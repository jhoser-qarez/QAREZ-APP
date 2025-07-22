// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// Importamos nuestros componentes
import Navbar from './components/NavBar';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail'; // Importamos el nuevo componente de detalle
import UploadImage from "./pages/UploadImage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />

        <main className="flex-grow p-4">
          <Routes>
            {/* Ruta para la página de inicio */}
            <Route path="/" element={
              <div className="text-center py-20">
                <h1 className="text-5xl font-extrabold text-blue-600 mb-4">
                  ¡Bienvenido a QAREZ, tu Tienda de Calzados! 👟
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

            {/* NUEVA RUTA: Ruta para el detalle de un producto específico */}
            {/* :id es un parámetro dinámico que capturará el ID del producto */}
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* Aquí se añadirán más rutas en el futuro (ej. /cart, /login, /register) */}
            {/* Ruta de ejemplo para una página no encontrada (404) */}
            <Route path="*" element={
              <div className="text-center p-8">
                <h2 className="text-4xl font-bold text-red-600 mb-4">404 - Página no encontrada</h2>
                <p className="text-lg text-gray-700">Lo sentimos, la página que buscas no existe.</p>
                <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">Volver al inicio</Link>
              </div>
            } />
            {/* Ruta para subir imagenes al proyecto) */}

            <Route path="/admin/upload" element={<UploadImage />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;