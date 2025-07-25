import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/useCartHook';// ✅ Hook del carrito
import { toast } from 'react-toastify'; // ✅ Notificaciones tipo toast

const API_BASE_URL = import.meta.env.VITE_API_URL;

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        setProduct(response.data);

        if (response.data.variantes && response.data.variantes.length > 0) {
          setSelectedVariant(response.data.variantes[0]);
        }

        if (response.data.imagenes && response.data.imagenes.length > 0) {
          setActiveImage(response.data.imagenes[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error al obtener el detalle del producto:', err);
        setError('No se pudo cargar el detalle del producto.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleVariantChange = (e) => {
    const selectedSku = e.target.value;
    const variant = product.variantes.find(v => v.sku === selectedSku);
    setSelectedVariant(variant);
    setQuantity(1); // Reiniciar cantidad cuando se cambia variante
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Por favor, selecciona una talla y color.');
      return;
    }

    addToCart({
      _id: product._id,
      sku: selectedVariant.sku,
      nombre: product.nombre,
      precio: product.precio,
      imagen: product.imagenes[0] || '',
      talla: selectedVariant.talla,
      color: selectedVariant.color,
      cantidad: quantity,
    });

    toast.success(`"${product.nombre}" añadido al carrito.`);
  };

  if (loading) {
    return <div className="text-center p-6 text-xl font-semibold">Cargando detalles del producto...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-600 text-xl font-semibold">
        Error: {error}
        <Link to="/products" className="block mt-4 text-blue-500 hover:underline">Volver a la lista de productos</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center p-6 text-gray-600 text-xl font-semibold">
        Producto no encontrado.
        <Link to="/products" className="block mt-4 text-blue-500 hover:underline">Volver a la lista de productos</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Imágenes */}
        <div className="flex flex-col items-center">
          <img
            src={activeImage ? `${API_BASE_URL}${activeImage}` : 'https://placehold.co/600x450/cccccc/333333?text=No+Image'}
            alt={product.nombre}
            className="w-full max-w-md h-auto rounded-lg shadow-md object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x450/cccccc/333333?text=No+Image';
            }}
          />
          <div className="flex space-x-2 mt-4 overflow-x-auto">
            {product.imagenes.map((img, index) => (
              <img
                key={index}
                src={`${API_BASE_URL}${img}`}
                alt={`${product.nombre} - ${index + 1}`}
                className="w-20 h-20 object-cover rounded-md cursor-pointer border-2 border-transparent hover:border-blue-500"
                onClick={() => setActiveImage(img)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/80x80/cccccc/333333?text=No+Image';
                }}
              />
            ))}
          </div>
        </div>

        {/* Detalles */}
        <div className="flex flex-col justify-start">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.nombre}</h1>
          <p className="text-2xl font-semibold text-blue-600 mb-4">S/. {product.precio.toFixed(2)}</p>
          <p className="text-gray-700 mb-6 leading-relaxed">{product.descripcion}</p>

          <div className="mb-4 text-gray-600">
            <span className="font-semibold">Categoría:</span> {product.categoria}
          </div>
          <div className="mb-6 text-gray-600">
            <span className="font-semibold">Marca:</span> {product.marca}
          </div>

          {/* Selector de Variante */}
          {product.variantes && product.variantes.length > 0 && (
            <div className="mb-6">
              <label htmlFor="variant-select" className="block text-gray-700 text-lg font-semibold mb-2">
                Selecciona Talla/Color:
              </label>
              <select
                id="variant-select"
                className="block w-full p-3 border border-gray-300 rounded-md shadow-sm"
                onChange={handleVariantChange}
                value={selectedVariant ? selectedVariant.sku : ''}
              >
                {product.variantes.map(variant => (
                  <option key={variant.sku} value={variant.sku}>
                    Talla: {variant.talla} - Color: {variant.color} (Stock: {variant.stock})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selector de cantidad */}
          {selectedVariant && (
            <div className="mb-6">
              <label htmlFor="quantity" className="block text-gray-700 text-lg font-semibold mb-2">Cantidad:</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={selectedVariant.stock}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val >= 1 && val <= selectedVariant.stock) {
                    setQuantity(val);
                  }
                }}
                className="w-24 p-2 border border-gray-300 rounded-md shadow-sm text-center"
              />
              <p className="text-sm text-gray-500 mt-1">Stock disponible: {selectedVariant.stock}</p>
            </div>
          )}

          {/* Botón añadir al carrito */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-xl hover:bg-green-700"
            disabled={!selectedVariant || selectedVariant.stock === 0}
          >
            {selectedVariant && selectedVariant.stock === 0 ? 'Sin Stock' : 'Añadir al Carrito'}
          </button>

          <Link
            to="/products"
            className="block mt-4 w-full bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg text-xl text-center hover:bg-gray-300"
          >
            Volver a Productos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
