// src/pages/ProductList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Para hacer peticiones HTTP a tu backend
import ProductCard from '../components/ProductCard'; // Importamos el componente ProductCard

function ProductList() {
  const [products, setProducts] = useState([]); // Estado para almacenar los productos
  const [loading, setLoading] = useState(true); // Estado para indicar si los productos están cargando
  const [error, setError] = useState(null); // Estado para manejar errores

  // useEffect se ejecuta después del primer render y cada vez que sus dependencias cambian
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Realizamos una petición GET a tu backend para obtener los productos
        // Asegúrate de que tu backend esté corriendo en http://localhost:5000
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data); // Guardamos los productos en el estado
        setLoading(false); // Indicamos que la carga ha terminado
      } catch (err) {
        console.error('Error al obtener productos:', err);
        setError('No se pudieron cargar los productos. Inténtalo de nuevo más tarde.'); // Establecemos un mensaje de error
        setLoading(false); // Indicamos que la carga ha terminado (con error)
      }
    };

    fetchProducts(); // Llamamos a la función para obtener los productos cuando el componente se monta
  }, []); // El array vacío [] como dependencia significa que este efecto se ejecuta solo una vez al montar el componente

  if (loading) {
    return <div className="text-center p-4 text-lg font-medium">Cargando productos...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600 text-lg font-medium">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-10">Nuestros Calzados</h2>
      {products.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No hay productos disponibles en este momento.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(product => (
            // ¡Importante! Aquí es donde usamos el ProductCard.jsx
            // Le pasamos cada 'product' como una prop llamada 'product'
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;