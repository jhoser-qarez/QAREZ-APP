// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Importamos el modelo de Pedido
const Product = require('../models/Product'); // Necesitamos el modelo de Producto para actualizar el stock
const User = require('../models/User'); // Necesitamos el modelo de Usuario para verificar el userId
const jwt = require('jsonwebtoken'); // Para verificar tokens JWT
const JWT_SECRET = process.env.JWT_SECRET; // La clave secreta del JWT desde .env

// Middleware para verificar el token JWT y obtener el usuario
// Este middleware protegerá las rutas que solo los usuarios autenticados pueden acceder
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token de autenticación.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado.' });
        }
        req.user = user; // Añadimos la información del usuario (id, rol) al objeto de la petición
        next();
    });
};

// Middleware para verificar si el usuario es administrador
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'administrador') {
        next(); // El usuario es administrador, continúa
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};

// --- Rutas de Pedidos ---

// POST /api/orders
// Crear un nuevo pedido (requiere autenticación de usuario)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { items, direccionEnvio, metodoPago } = req.body;
        const userId = req.user.id; // Obtenemos el ID del usuario del token JWT

        // Validar que el usuario existe
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'El pedido debe contener al menos un artículo.' });
        }
        if (!direccionEnvio || !metodoPago) {
            return res.status(400).json({ message: 'Dirección de envío y método de pago son obligatorios.' });
        }

        let total = 0;
        const processedItems = [];

        // Verificar stock y calcular total
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product || !product.activo) {
                return res.status(404).json({ message: `Producto con ID ${item.productId} no encontrado o no disponible.` });
            }

            const variant = product.variantes.find(v => v.sku === item.variante.sku);
            if (!variant) {
                return res.status(404).json({ message: `Variante ${item.variante.sku} no encontrada para el producto ${product.nombre}.` });
            }
            if (variant.stock < item.cantidad) {
                return res.status(400).json({ message: `Stock insuficiente para la variante ${item.variante.sku} del producto ${product.nombre}.` });
            }

            // Actualizar stock del producto
            variant.stock -= item.cantidad;
            await product.save(); // Guardar el producto con el stock actualizado

            const itemTotal = product.precio * item.cantidad;
            total += itemTotal;

            processedItems.push({
                productId: product._id,
                nombreProducto: product.nombre,
                variante: {
                    talla: variant.talla,
                    color: variant.color,
                    sku: variant.sku
                },
                cantidad: item.cantidad,
                precioUnitario: product.precio
            });
        }

        const newOrder = new Order({
            userId,
            items: processedItems,
            total,
            direccionEnvio,
            metodoPago,
            estado: 'pendiente' // Estado inicial del pedido
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error al crear pedido:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear el pedido.' });
    }
});

// GET /api/orders/my-orders
// Obtener todos los pedidos de un usuario autenticado
router.get('/my-orders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Obtenemos el ID del usuario del token JWT
        const orders = await Order.find({ userId }).populate('userId', 'nombre email'); // Populate para obtener nombre y email del usuario
        res.json(orders);
    } catch (error) {
        console.error('Error al obtener mis pedidos:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener pedidos.' });
    }
});

// GET /api/orders
// Obtener todos los pedidos (solo para administradores)
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'nombre email'); // Populate para obtener nombre y email del usuario
        res.json(orders);
    } catch (error) {
        console.error('Error al obtener todos los pedidos:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener todos los pedidos.' });
    }
});

// PUT /api/orders/:id/status
// Actualizar el estado de un pedido (solo para administradores)
router.put('/:id/status', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const orderId = req.params.id;
        const { estado } = req.body;

        if (!estado) {
            return res.status(400).json({ message: 'El estado es obligatorio.' });
        }

        // Validar que el estado sea uno de los permitidos
        const validStates = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
        if (!validStates.includes(estado)) {
            return res.status(400).json({ message: 'Estado de pedido inválido.' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { estado },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Pedido no encontrado para actualizar.' });
        }
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de pedido inválido.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar el estado del pedido.' });
    }
});

module.exports = router;