// routes/productRoutes.js
const express = require('express');
const router = express.Router(); // Creamos un nuevo router de Express
const Product = require('../models/Product'); // Importamos el modelo de Producto

// --- Rutas Públicas (para clientes) ---

// GET /api/products
// Obtener todos los productos (calzados) disponibles
router.get('/', async (req, res) => {
    try {
        // Obtenemos todos los productos activos
        const products = await Product.find({ activo: true });
        res.json(products); // Enviamos la lista de productos como respuesta JSON
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener productos.' });
    }
});

// GET /api/products/:id
// Obtener los detalles de un producto específico por su ID
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id; // Obtenemos el ID del producto de los parámetros de la URL
        // Buscamos el producto por ID y nos aseguramos de que esté activo
        const product = await Product.findById(productId);

        if (!product || !product.activo) {
            return res.status(404).json({ message: 'Producto no encontrado o no disponible.' });
        }
        res.json(product); // Enviamos los detalles del producto como respuesta JSON
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        // Si el ID no es un formato válido de MongoDB ObjectId, Mongoose lanzará un error de tipo 'CastError'
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al obtener el producto.' });
    }
});

// --- Rutas de Administración (para el gestor de productos) ---
// NOTA: Estas rutas NO tienen autenticación aún. La añadiremos en un paso posterior.

// POST /api/products
// Crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const newProduct = new Product(req.body); // Creamos una nueva instancia de Producto con los datos del cuerpo de la petición
        const savedProduct = await newProduct.save(); // Guardamos el producto en la base de datos
        res.status(201).json(savedProduct); // Enviamos el producto creado con un status 201 (Created)
    } catch (error) {
        console.error('Error al crear producto:', error);
        // Manejo de errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear el producto.' });
    }
});

// PUT /api/products/:id
// Actualizar un producto existente por su ID
router.put('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        // Buscamos y actualizamos el producto. `new: true` devuelve el documento actualizado.
        // `runValidators: true` ejecuta las validaciones del esquema en la actualización.
        const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true, runValidators: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado para actualizar.' });
        }
        res.json(updatedProduct); // Enviamos el producto actualizado
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar el producto.' });
    }
});

// DELETE /api/products/:id
// Eliminar un producto por su ID
router.delete('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Producto no encontrado para eliminar.' });
        }
        res.json({ message: 'Producto eliminado exitosamente.' }); // Confirmamos la eliminación
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al eliminar el producto.' });
    }
});

module.exports = router; // Exportamos el router
