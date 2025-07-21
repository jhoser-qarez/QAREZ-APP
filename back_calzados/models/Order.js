// models/Order.js
const mongoose = require('mongoose');

// Esquema para los ítems dentro de un pedido
const orderItemSchema = new mongoose.Schema({
    productId: { // Referencia al ID del producto comprado
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Hace referencia al modelo 'Product'
        required: true
    },
    nombreProducto: { // Para guardar el nombre en el pedido en caso de que el producto cambie
        type: String,
        required: true
    },
    variante: { // Para guardar la talla y color específicos comprados
        talla: { type: String, required: true },
        color: { type: String, required: true },
        sku: { type: String, required: true }
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    },
    precioUnitario: { // Precio del producto en el momento de la compra
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false }); // No necesitamos un _id automático para cada ítem de pedido

// Esquema principal del Pedido
const orderSchema = new mongoose.Schema({
    userId: { // Referencia al ID del usuario que hizo el pedido
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Hace referencia al modelo 'User'
        required: true
    },
    items: {
        type: [orderItemSchema], // Un array de ítems de pedido
        required: true,
        validate: { // Validación para asegurar que haya al menos un ítem
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Un pedido debe tener al menos un artículo.'
        }
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    direccionEnvio: { // Detalles de la dirección de envío del pedido
        calle: { type: String, required: true, trim: true },
        numero: { type: String, trim: true },
        distrito: { type: String, required: true, trim: true },
        ciudad: { type: String, required: true, trim: true },
        codigoPostal: { type: String, trim: true },
        referencia: { type: String, trim: true }
    },
    metodoPago: {
        type: String,
        required: true,
        enum: ['Tarjeta de Crédito/Débito', 'Yape', 'Plin', 'Transferencia Bancaria'] // Opciones de pago
    },
    transaccionId: { // ID de la transacción de la pasarela de pago (si aplica)
        type: String,
        trim: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    fechaPedido: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // `timestamps: true` añade `createdAt` y `updatedAt` automáticamente

// Creamos y exportamos el Modelo de Pedido
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;