// server.js
// Este archivo contendrá la configuración principal de tu servidor backend.

// Importar las librerías necesarias
const express = require('express'); // Framework para crear el servidor web
const mongoose = require('mongoose'); // ODM (Object Data Modeling) para interactuar con MongoDB
const cors = require('cors'); // Middleware para permitir peticiones desde el frontend (React)
require('dotenv').config(); // Para cargar variables de entorno desde un archivo .env

// Importar los modelos de la base de datos
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

// Importar las rutas de la API
const productRoutes = require('./routes/productRoutes'); // Importamos las rutas de productos
const authRoutes = require('./routes/authRoutes');     // Importamos las rutas de autenticación
const orderRoutes = require('./routes/orderRoutes');   // Importamos las rutas de pedidos

// Crear una instancia de la aplicación Express
const app = express();

// --- Middlewares ---
// CORS: Permite que tu frontend (que estará en un dominio diferente) pueda hacer peticiones a este backend.
// En desarrollo, permitimos cualquier origen (*). En producción, deberías especificar el dominio de tu frontend.


const allowedOrigins = [
  process.env.CORS_ORIGIN, // Este será el dominio de tu frontend en producción (ej: https://tudominio.com)
  'http://localhost:5173', // El puerto común de Vite en desarrollo (puede ser otro si lo configuraste)
  'http://127.0.0.1:5173', // Por si acaso localhost se resuelve así
].filter(Boolean); // Esto filtra valores nulos si CORS_ORIGIN no está definido en el entorno

app.use(cors({
    origin: function (origin, callback) {
        // Permite solicitudes sin un "Origin" (como Postman o curl sin especificarlo)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`CORS Error: Origin ${origin} not allowed`); // Mensaje para depuración en los logs de Render
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true // Crucial si tu backend maneja sesiones, cookies o tokens con credenciales
}));

// Express.json(): Permite que Express entienda y parseé el cuerpo de las peticiones en formato JSON.
// Esto es crucial para recibir datos del frontend (ej. cuando subes un producto o haces un pedido).
app.use(express.json());

// --- Conexión a la Base de Datos MongoDB ---
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('🎉 Conectado a MongoDB Atlas exitosamente!');
    })
    .catch((error) => {
        console.error('❌ Error al conectar a MongoDB Atlas:', error);
    });

// --- Rutas de Prueba (para verificar que el servidor funciona) ---
app.get('/', (req, res) => {
    res.send('¡Bienvenido al Backend de tu Tienda de Calzados! 👟');
});

// Ruta de prueba de modelos (ya la probamos, pero la dejamos por si acaso)
app.get('/api/test-models', async (req, res) => {
    try {
        const testProduct = new Product({
            nombre: 'Zapatilla Test',
            descripcion: 'Descripción de prueba',
            precio: 50.00,
            imagenes: ['http://example.com/test.jpg'],
            categoria: 'Zapatillas',
            marca: 'Marca Test',
            variantes: [{ talla: '40', color: 'Negro', sku: 'TESTSKU001', stock: 10 }]
        });
        console.log('Modelo de Producto cargado:', testProduct.nombre);

        const testUser = new User({
            nombre: 'Usuario Prueba',
            email: 'prueba@example.com',
            password: 'password123'
        });
        console.log('Modelo de Usuario cargado:', testUser.email);

        const testOrder = new Order({
            userId: new mongoose.Types.ObjectId(),
            items: [{
                productId: new mongoose.Types.ObjectId(),
                nombreProducto: 'Zapatilla Test',
                variante: { talla: '40', color: 'Negro', sku: 'TESTSKU001' },
                cantidad: 1,
                precioUnitario: 50.00
            }],
            total: 50.00,
            direccionEnvio: {
                calle: 'Calle Falsa',
                numero: '123',
                distrito: 'Distrito Test',
                ciudad: 'Ciudad Test',
                codigoPostal: '12345',
                referencia: 'Frente al parque'
            },
            metodoPago: 'Tarjeta de Crédito/Débito',
            estado: 'pendiente'
        });
        console.log('Modelo de Pedido cargado:', testOrder.total);

        res.send('Modelos cargados y probados internamente en el servidor. ¡Listo para las rutas!');
    } catch (error) {
        console.error('Error al probar los modelos:', error);
        res.status(500).send('Error al cargar los modelos.');
    }
});

// --- Uso de las Rutas de la API ---
// Aquí le decimos a Express que use las rutas definidas en productRoutes.js
// para cualquier petición que empiece con '/api/products'.
app.use('/api/products', productRoutes);

// Aquí le decimos a Express que use las rutas definidas en authRoutes.js
// para cualquier petición que empiece con '/api/auth'.
app.use('/api/auth', authRoutes);

// Aquí le decimos a Express que use las rutas definidas en orderRoutes.js
// para cualquier petición que empiece con '/api/orders'.
app.use('/api/orders', orderRoutes);


// --- Configuración del Puerto del Servidor ---
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express escuchando en el puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT} en tu navegador para verificar.`);
});
// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

//Configuración carga de imágenes
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

