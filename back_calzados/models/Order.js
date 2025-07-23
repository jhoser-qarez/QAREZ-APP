const mongoose = require('mongoose');
// Esquema para los ítems dentro de un pedido
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  nombreProducto: {
    type: String,
    required: true
  },
  variante: {
    talla: { type: String, required: true },
    color: { type: String, required: true },
    sku: { type: String, required: true }
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Esquema principal del Pedido
const orderSchema = new mongoose.Schema({
  // ✅ Si hay login, se guarda el userId
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // ✅ Cliente sin login puede dejar sus datos personales
  nombreCliente: {
    type: String,
    required: true
  },
  emailCliente: {
    type: String,
    required: true
  },
  telefonoCliente: {
    type: String
  },

  // ✅ Lista de productos
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'Un pedido debe tener al menos un artículo.'
    }
  },

  // ✅ Dirección de envío
  direccionEnvio: {
    calle: { type: String, required: true, trim: true },
    numero: { type: String, trim: true },
    distrito: { type: String, required: true, trim: true },
    ciudad: { type: String, required: true, trim: true },
    codigoPostal: { type: String, trim: true },
    referencia: { type: String, trim: true }
  },

  // ✅ Método de envío (nuevo)
  metodoEnvio: {
    type: String,
    required: true,
    enum: ['recoger', 'Envio estándar', 'envio']
  },

  // ✅ Método de pago
  metodoPago: {
    type: String,
    required: true,
    enum: ['Tarjeta de Crédito/Débito', 'Yape', 'Plin', 'Transferencia Bancaria']
  },

  // ✅ ID de transacción si aplica
  transaccionId: {
    type: String,
    trim: true
  },

  // ✅ Totales
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  costoEnvio: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },

  // ✅ Estado y fechas
  estado: {
    type: String,
    enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  fechaPedido: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
