// models/Product.js
const mongoose = require('mongoose');

// Definimos el esquema para las variantes (talla, color, stock) de cada producto
const variantSchema = new mongoose.Schema({
    talla: {
        type: String, // Por ejemplo: "37", "38", "S", "M"
        required: true
    },
    color: {
        type: String, // Por ejemplo: "Negro", "Blanco", "Rojo"
        required: true
    },
    sku: { // Stock Keeping Unit: Código único para esta variante específica
        type: String,
        unique: true, // Cada SKU debe ser único
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0 // El stock no puede ser negativo
    }
}, { _id: false }); // No necesitamos un _id automático para cada variante interna

// Definimos el esquema principal del Producto (Calzado)
const productSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true // Elimina espacios en blanco al inicio y final
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0 // El precio no puede ser negativo
    },
    imagenes: {
        type: [String], // Un array de strings para las URLs de las imágenes
        required: true
    },
    categoria: {
        type: String, // Por ejemplo: "Zapatillas", "Botas", "Sandalias"
        required: true,
        trim: true
    },
    marca: {
        type: String, // Por ejemplo: "Nike", "Adidas", "Tu Marca"
        required: true,
        trim: true
    },
    // Las variantes serán un array de objetos, cada uno siguiendo el variantSchema
    variantes: {
        type: [variantSchema],
        required: true,
        validate: { // Validación para asegurar que haya al menos una variante
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Un producto debe tener al menos una variante (talla/color).'
        }
    },
    fechaCreacion: {
        type: Date,
        default: Date.now // Establece la fecha actual por defecto al crear
    },
    activo: { // Para activar/desactivar un producto sin eliminarlo
        type: Boolean,
        default: true
    }
}, { timestamps: true }); // `timestamps: true` añade `createdAt` y `updatedAt` automáticamente

// Creamos y exportamos el Modelo de Producto
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
