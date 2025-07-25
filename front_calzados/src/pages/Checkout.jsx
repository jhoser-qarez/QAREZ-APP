import React, { useState } from 'react';
import { useCart } from '../context/useCartHook';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function Checkout() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombreCliente: '',
    emailCliente: '',
    telefonoCliente: '',
    direccionEnvio: {
      calle: '',
      numero: '',
      distrito: '',
      ciudad: '',
      codigoPostal: '',
      referencia: ''
    },
    metodoEnvio: '',
    metodoPago: ''
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const costoEnvio = form.metodoEnvio === 'envio' ? 10 : 0;
  const total = subtotal + costoEnvio;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in form.direccionEnvio) {
      setForm(prev => ({
        ...prev,
        direccionEnvio: {
          ...prev.direccionEnvio,
          [name]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (
      !form.nombreCliente ||
      !form.emailCliente ||
      !form.direccionEnvio.calle ||
      !form.metodoPago ||
      !form.metodoEnvio
    ) {
      toast.error('Por favor completa todos los campos obligatorios.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/orders`, {
        ...form,
        items: cartItems.map(item => ({
          productId: item._id,
          nombreProducto: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
          variante: {
            talla: item.talla,
            color: item.color,
            sku: item.sku
          }
        })),
        subtotal,
        costoEnvio,
        total
      });

      const nuevaOrden = response.data.orden;

      toast.success('¡Pedido confirmado! 📦');

      // ✅ Guardamos en localStorage para prevenir pérdida al recargar
      localStorage.setItem('ordenFinalizada', JSON.stringify(nuevaOrden));

      // ✅ Limpiamos carrito
      clearCart();

      // ✅ Redirigimos al resumen de la orden
      navigate('/order-success', { state: { order: nuevaOrden } });

    } catch (err) {
      console.error('Error al enviar orden:', err);
      toast.error('Ocurrió un error al procesar tu pedido.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Finalizar Compra</h1>

      <form onSubmit={handleSubmit} className="grid gap-4 bg-white p-6 rounded shadow-md">

        {/* Datos personales */}
        <h2 className="text-xl font-semibold">Datos del Cliente</h2>
        <input name="nombreCliente" required value={form.nombreCliente} onChange={handleChange} placeholder="Nombre completo" className="input" />
        <input name="emailCliente" type="email" required value={form.emailCliente} onChange={handleChange} placeholder="Correo electrónico" className="input" />
        <input name="telefonoCliente" value={form.telefonoCliente} onChange={handleChange} placeholder="Teléfono" className="input" />

        {/* Dirección */}
        <h2 className="text-xl font-semibold mt-4">Dirección de Envío</h2>
        <input name="calle" required value={form.direccionEnvio.calle} onChange={handleChange} placeholder="Calle" className="input" />
        <input name="numero" value={form.direccionEnvio.numero} onChange={handleChange} placeholder="Número" className="input" />
        <input name="distrito" required value={form.direccionEnvio.distrito} onChange={handleChange} placeholder="Distrito" className="input" />
        <input name="ciudad" required value={form.direccionEnvio.ciudad} onChange={handleChange} placeholder="Ciudad" className="input" />
        <input name="codigoPostal" value={form.direccionEnvio.codigoPostal} onChange={handleChange} placeholder="Código Postal" className="input" />
        <input name="referencia" value={form.direccionEnvio.referencia} onChange={handleChange} placeholder="Referencia" className="input" />

        {/* Envío */}
        <h2 className="text-xl font-semibold mt-4">Método de Envío</h2>
        <select name="metodoEnvio" required value={form.metodoEnvio} onChange={handleChange} className="input">
          <option value="">Selecciona una opción</option>
          <option value="envio">Envío a domicilio (S/.10)</option>
          <option value="recoger">Recojo en tienda (Gratis)</option>
        </select>

        {/* Pago */}
        <h2 className="text-xl font-semibold mt-4">Método de Pago</h2>
        <select name="metodoPago" required value={form.metodoPago} onChange={handleChange} className="input">
          <option value="">Selecciona una opción</option>
          <option value="Yape">Yape</option>
          <option value="Plin">Plin</option>
          <option value="Transferencia Bancaria">Transferencia Bancaria</option>
          <option value="Tarjeta de Crédito/Débito">Tarjeta de Crédito/Débito</option>
        </select>

        {/* Productos */}
        <h2 className="text-xl font-semibold mt-6">Resumen del Pedido</h2>
        <ul className="space-y-2">
          {cartItems.map(item => (
            <li key={item.sku}>
              {item.nombre} ({item.talla} - {item.color}) x{item.cantidad} - <strong>S/. {(item.precio * item.cantidad).toFixed(2)}</strong>
            </li>
          ))}
        </ul>

        {/* Totales */}
        <div className="mt-4 text-right text-lg">
          <p>Subtotal: S/. {subtotal.toFixed(2)}</p>
          <p>Costo de Envío: S/. {costoEnvio.toFixed(2)}</p>
          <p className="font-bold">Total: S/. {total.toFixed(2)}</p>
        </div>

        {/* Confirmar */}
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow mt-4">
          Confirmar Pedido
        </button>
      </form>
    </div>
  );
}

export default Checkout;
