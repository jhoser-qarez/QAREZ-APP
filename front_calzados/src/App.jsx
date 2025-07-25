import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/NavBar';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import UploadImage from "./pages/UploadImage";
import CartPage from './pages/CartPage';
import { ToastContainer } from 'react-toastify';
import OrderSummary from './pages/OrderSummary';
import OrderSuccess from './pages/OrderSuccess';
import Checkout from './pages/Checkout';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-grow p-4">
        <Routes>
          {/* Página de inicio */}
          <Route path="/" element={
            <div className="text-center py-20">
              <h1 className="text-5xl font-extrabold text-fuchsia-600 mb-4">
                ¡Bienvenido a QAREZ, tu Tienda de Calzados! 👟
              </h1>
              <p className="text-xl text-gray-700">Explora nuestra colección y encuentra tu par perfecto.</p>
              <Link
                to="/products"
                className="mt-8 inline-block bg-red-600 text-white text-lg font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-red-900 transition-all duration-300 transform hover:scale-105"
              >
                Ver Productos
              </Link>
              
            </div>
          } />

          {/* Lista de productos */}
          <Route path="/products" element={<ProductList />} />

          {/* Detalle de producto */}
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Página de carrito */}
          <Route path="/cart" element={<CartPage />} />

          {/* Página de carga de imágenes (admin) */}
          <Route path="/admin/upload" element={<UploadImage />} />

          {/* Ruta 404 */}
          <Route path="*" element={
            <div className="text-center p-8">
              <h2 className="text-4xl font-bold text-red-600 mb-4">404 - Página no encontrada</h2>
              <p className="text-lg text-gray-700">Lo sentimos, la página que buscas no existe.</p>
              <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">Volver al inicio</Link>
            </div>
          } />

          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route path="/order-success" element={<OrderSuccess />} />

        </Routes>
      </main>

      {/* ✅ Contenedor de toasts para mostrar notificaciones flotantes */}
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default App;
