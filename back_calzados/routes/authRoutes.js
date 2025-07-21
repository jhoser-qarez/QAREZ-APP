// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importamos el modelo de Usuario
const jwt = require('jsonwebtoken'); // Para crear y verificar JSON Web Tokens (JWT)

// Se recomienda usar variables de entorno para la clave secreta del JWT
// Asegúrate de añadir en tu archivo .env:
// JWT_SECRET="una_cadena_secreta_muy_larga_y_aleatoria_para_jwt"
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Clave secreta para firmar los tokens

// --- Rutas de Autenticación ---

// POST /api/auth/register
// Registrar un nuevo usuario (cliente por defecto)
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Validar que los campos requeridos estén presentes
        if (!nombre || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos (nombre, email, password) son obligatorios.' });
        }

        // Verificar si el email ya está registrado
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado.' });
        }

        // Crear un nuevo usuario (el middleware en User.js encriptará la contraseña)
        const newUser = new User({ nombre, email, password, rol: 'cliente' });
        const savedUser = await newUser.save();

        // Generar un token JWT para el usuario recién registrado
        const token = jwt.sign(
            { id: savedUser._id, rol: savedUser.rol },
            JWT_SECRET,
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        // Devolver el token y la información básica del usuario (sin la contraseña)
        res.status(201).json({
            message: 'Registro exitoso.',
            token,
            user: {
                id: savedUser._id,
                nombre: savedUser.nombre,
                email: savedUser.email,
                rol: savedUser.rol
            }
        });
    } catch (error) {
        console.error('Error en el registro de usuario:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
    }
});

// POST /api/auth/login
// Iniciar sesión de un usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que los campos requeridos estén presentes
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
        }

        // Buscar el usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        // Comparar la contraseña proporcionada con la encriptada en la base de datos
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        // Generar un token JWT para el usuario autenticado
        const token = jwt.sign(
            { id: user._id, rol: user.rol },
            JWT_SECRET,
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        // Devolver el token y la información básica del usuario (sin la contraseña)
        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
});

module.exports = router;
