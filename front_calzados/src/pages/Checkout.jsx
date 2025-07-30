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
    metodoEnvio: '', // Este campo controlará la visibilidad de la dirección
    metodoPago: '',
    transaccionId: '' // Nuevo campo para el código de transferencia
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  // El costo de envío ahora depende del método elegido
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

    let validationMessage = '';

    // Validaciones básicas para campos siempre requeridos
    if (!form.nombreCliente || !form.emailCliente || !form.metodoPago || !form.metodoEnvio) {
      validationMessage = 'Por favor completa todos los campos obligatorios.';
    } else if (form.metodoEnvio === 'envio') {
      // Si el método de envío es 'envio', validar los campos de dirección
      if (!form.direccionEnvio.calle || !form.direccionEnvio.distrito || !form.direccionEnvio.ciudad) {
        validationMessage = 'Por favor completa todos los campos de la dirección de envío.';
      }
    }

    // Validar código de transacción para Yape/Plin
    if ((form.metodoPago === 'Yape' || form.metodoPago === 'Plin' || form.metodoPago === 'Transferencia Bancaria') && !form.transaccionId) {
        validationMessage = `Por favor, ingresa el código de transacción para ${form.metodoPago}.`;
    }


    if (validationMessage) {
      toast.error(validationMessage);
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

      // Guardamos en localStorage para prevenir pérdida al recargar
      localStorage.setItem('ordenFinalizada', JSON.stringify(nuevaOrden));

      // Limpiamos carrito
      clearCart();

      // Redirigimos al resumen de la orden
      navigate('/order-success', { state: { order: nuevaOrden } });

    } catch (err) {
      console.error('Error al enviar orden:', err);
      toast.error('Ocurrió un error al procesar tu pedido.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 my-8 bg-white rounded-xl shadow-2xl"> {/* Enhanced container styles */}
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">Finalizar Compra</h1> {/* Larger, bolder title */}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-8 rounded-lg shadow-inner"> {/* Enhanced form styles */}

        {/* Datos personales */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 border-gray-200">Datos del Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="nombreCliente" required value={form.nombreCliente} onChange={handleChange} placeholder="Nombre completo" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
            <input name="emailCliente" type="email" required value={form.emailCliente} onChange={handleChange} placeholder="Correo electrónico" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
            <input name="telefonoCliente" value={form.telefonoCliente} onChange={handleChange} placeholder="Teléfono" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
          </div>
        </div>

        {/* Envío */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2 border-gray-200">Método de Envío</h2>
          <select name="metodoEnvio" required value={form.metodoEnvio} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white">
            <option value="">Selecciona una opción</option>
            <option value="envio">Envío a domicilio (S/.10)</option>
            <option value="recoger">Recojo en tienda (Gratis)</option>
          </select>
        </div>

        {/* Sección de Dirección de Recojo (condicional) */}
        {form.metodoEnvio === 'recoger' && (
          <div className="md:col-span-2 bg-blue-50 border border-blue-200 text-blue-800 p-6 rounded-lg mt-4 shadow-inner"> {/* Enhanced pickup section */}
            <h3 className="font-bold text-xl mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657m10.314-10.314L13.414 2.9a1.998 1.998 0 00-2.828 0L6.343 6.343m10.314 10.314A9.953 9.953 0 0012 21c-4.97 0-9-3.582-9-8s4.03-8 9-8c.877 0 1.716.143 2.51.406m-2.51-.406A8.96 8.96 0 0112 3c4.97 0 9 3.582 9 8s-4.03 8-9 8" />
              </svg>
              Dirección de Recojo en Tienda:
            </h3>
            <p className="text-base mb-1"><strong>QAREZ Tienda de Calzados</strong></p>
            <p className="text-base mb-1">CC Trujillo</p>
            <p className="text-base mb-1">Horario: Lunes a Viernes de 9:00 AM a 6:00 PM</p>
            <p className="text-base">Teléfono: +51 997 572 736</p>
          </div>
        )}

        {/* Sección de Dirección de Envío (condicional) */}
        {form.metodoEnvio === 'envio' && (
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2 border-gray-200">Dirección de Envío</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="calle" required={form.metodoEnvio === 'envio'} value={form.direccionEnvio.calle} onChange={handleChange} placeholder="Calle" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              <input name="numero" value={form.direccionEnvio.numero} onChange={handleChange} placeholder="Número" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              <input name="distrito" required={form.metodoEnvio === 'envio'} value={form.direccionEnvio.distrito} onChange={handleChange} placeholder="Distrito" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              <input name="ciudad" required={form.metodoEnvio === 'envio'} value={form.direccionEnvio.ciudad} onChange={handleChange} placeholder="Ciudad" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              <input name="codigoPostal" value={form.direccionEnvio.codigoPostal} onChange={handleChange} placeholder="Código Postal" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              <input name="referencia" value={form.direccionEnvio.referencia} onChange={handleChange} placeholder="Referencia" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
            </div>
          </div>
        )}

        {/* Pago */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-4 border-b pb-2 border-gray-200">Método de Pago</h2>
          <select name="metodoPago" required value={form.metodoPago} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white">
            <option value="">Selecciona una opción</option>
            <option value="Yape">Yape</option>
            <option value="Plin">Plin</option>
            <option value="Transferencia Bancaria">Transferencia Bancaria</option>
            
          </select>
        </div>

        {/* Sección de Instrucciones de Pago (condicional para Yape/Plin/Transferencia Bancaria) */}
        {(form.metodoPago === 'Yape' || form.metodoPago === 'Plin' || form.metodoPago === 'Transferencia Bancaria') && (
          <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg mt-4 shadow-inner">
            <h3 className="font-bold text-xl mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instrucciones de Pago ({form.metodoPago})
            </h3>
            {form.metodoPago === 'Yape' && (
              <div className="text-base">
                <p className="mb-2">Por favor, realiza el pago de <strong>S/. {total.toFixed(2)}</strong> a nuestro número Yape:</p>
                <p className="text-2xl font-bold text-purple-700 mb-3">+51 997572736</p>
                <p className="mb-2">Escanea el código QR:</p>
                {/*  */}
                <img src="https://placehold.co/150x150/800080/ffffff?text=QR+Yape" alt="QR Yape" className="w-36 h-36 rounded-lg mx-auto mb-3" />
                <p className="mb-2">Ingresa el código de transferencia que Yape te proporciona al finalizar la operación:</p>
                <input
                  type="text"
                  name="transaccionId"
                  value={form.transaccionId}
                  onChange={handleChange}
                  placeholder="Código de Transferencia Yape"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            )}
            {form.metodoPago === 'Plin' && (
              <div className="text-base">
                <p className="mb-2">Por favor, realiza el pago de <strong>S/. {total.toFixed(2)}</strong> a nuestro número Plin:</p>
                <p className="text-2xl font-bold text-pink-700 mb-3">+51 997572736</p>
                <p className="mb-2">Escanea el código QR:</p>
                {/*  */}
                <img src="https://placehold.co/150x150/FF69B4/ffffff?text=QR+Plin" alt="QR Plin" className="w-36 h-36 rounded-lg mx-auto mb-3" />
                <p className="mb-2">Ingresa el código de transferencia que Plin te proporciona al finalizar la operación:</p>
                <input
                  type="text"
                  name="transaccionId"
                  value={form.transaccionId}
                  onChange={handleChange}
                  placeholder="Código de Transferencia Plin"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            )}
            {form.metodoPago === 'Transferencia Bancaria' && (
              <div className="text-base">
                <p className="mb-2">Por favor, realiza la transferencia de <strong>S/. {total.toFixed(2)}</strong> a la siguiente cuenta bancaria:</p>
                <p className="mb-1"><strong>Banco:</strong> Banco de Crédito del Perú (BCP)</p>
                <p className="mb-1"><strong>Número de Cuenta:</strong> 194-12345678-0-00</p>
                <p className="mb-1"><strong>CCI:</strong> 002-194-123456789012-XX</p>
                <p className="mb-1"><strong>Titular:</strong> QAREZ Tienda de Calzados S.A.C.</p>
                <p className="mb-2">Ingresa el número de operación o código de transferencia:</p>
                <input
                  type="text"
                  name="transaccionId"
                  value={form.transaccionId}
                  onChange={handleChange}
                  placeholder="Número de Operación / Código de Transferencia"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            )}
            <p className="text-red-600 font-semibold mt-4">Importante: Tu pedido será procesado una vez que confirmemos el pago y el código de transferencia.</p>
          </div>
        )}

        {/* Productos */}
        <div className="md:col-span-2 bg-gray-100 p-6 rounded-lg shadow-inner"> {/* Enhanced products summary */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 border-gray-200">Resumen del Pedido</h2>
          <ul className="space-y-3">
            {cartItems.map(item => (
              <li key={item.sku} className="flex justify-between items-center text-gray-700 text-base">
                <span>{item.nombre} ({item.talla} - {item.color}) x{item.cantidad}</span>
                <strong className="text-gray-900">S/. {(item.precio * item.cantidad).toFixed(2)}</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* Totales */}
        <div className="md:col-span-2 mt-4 text-right text-xl font-bold text-gray-900 p-4 bg-blue-50 rounded-lg shadow-sm"> {/* Enhanced totals section */}
          <p className="mb-2">Subtotal: <span className="text-blue-700">S/. {subtotal.toFixed(2)}</span></p>
          <p className="mb-2">Costo de Envío: <span className="text-blue-700">S/. {costoEnvio.toFixed(2)}</span></p>
          <p className="text-3xl font-extrabold text-blue-800">Total: S/. {total.toFixed(2)}</p>
        </div>

        {/* Confirmar */}
        <div className="md:col-span-2 text-center">
          <button
            type="submit"
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Confirmar Pedido
          </button>
        </div>
      </form>
    </div>
  );
}

export default Checkout;
