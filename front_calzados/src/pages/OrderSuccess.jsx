import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  // ✅ Cargar orden desde location o localStorage
  useEffect(() => {
    const raw = location.state?.order || JSON.parse(localStorage.getItem('ordenFinalizada'));
    const orden = raw?.orden || raw;

    console.log('📦 Orden procesada:', orden);

    if (orden && Array.isArray(orden.items)) {
      setOrder(orden);
      localStorage.removeItem('ordenFinalizada');
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);

  if (!order) {
    return (
      <div className="text-center py-10 text-gray-500">Cargando datos del pedido...</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-3xl font-bold text-green-600 mb-4">¡Gracias por tu compra! 🎉</h1>
      <p className="text-gray-700 mb-4">Tu pedido ha sido registrado correctamente. A continuación, los detalles:</p>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Detalles del Pedido</h2>
        <p><strong>ID del Pedido:</strong> {order._id}</p>
        <p><strong>Fecha:</strong> {new Date(order.createdAt || order.fechaPedido).toLocaleString()}</p>
        <p><strong>Cliente:</strong> {order.nombreCliente}</p>
        <p><strong>Correo:</strong> {order.emailCliente}</p>
        <p><strong>Teléfono:</strong> {order.telefonoCliente || 'No proporcionado'}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Envío</h2>
        <p><strong>Método:</strong> {order.metodoEnvio}</p>
        {order.metodoEnvio !== 'Recojo en tienda' && (
          <div className="text-sm text-gray-600 ml-4">
            <p>{order.direccionEnvio?.calle} {order.direccionEnvio?.numero}</p>
            <p>{order.direccionEnvio?.distrito}, {order.direccionEnvio?.ciudad}</p>
            {order.direccionEnvio?.codigoPostal && <p>C.P. {order.direccionEnvio.codigoPostal}</p>}
            {order.direccionEnvio?.referencia && <p>Ref: {order.direccionEnvio.referencia}</p>}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Productos</h2>
        <ul className="space-y-2">
          {order.items.map((item, idx) => (
            <li key={idx} className="border-b pb-2">
              <p><strong>{item.nombreProducto}</strong> ({item.variante.talla} - {item.variante.color})</p>
              <p>Cantidad: {item.cantidad}</p>
              <p>Precio unitario: S/. {item.precioUnitario.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 text-right text-xl font-bold text-gray-800">
        Total pagado: S/. {order.total.toFixed(2)}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">Te hemos enviado una copia del pedido a tu correo electrónico.</p>
      </div>
    </div>
  );
}

export default OrderSuccess;
