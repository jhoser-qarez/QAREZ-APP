// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Librería para encriptar contraseñas

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // El email debe ser único para cada usuario
        trim: true,
        lowercase: true, // Guarda el email en minúsculas
        match: [/.+@.+\..+/, 'Por favor, introduce un email válido'] // Validación de formato de email
    },
    password: { // Almacenaremos el hash de la contraseña, no la contraseña en texto plano
        type: String,
        required: true
    },
    direccionesEnvio: [{ // Un array de objetos para almacenar múltiples direcciones
        calle: { type: String, trim: true },
        numero: { type: String, trim: true },
        distrito: { type: String, trim: true },
        ciudad: { type: String, trim: true },
        codigoPostal: { type: String, trim: true },
        referencia: { type: String, trim: true }
    }],
    rol: {
        type: String,
        enum: ['cliente', 'administrador'], // Solo puede ser 'cliente' o 'administrador'
        default: 'cliente' // Por defecto, los nuevos usuarios son clientes
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // `timestamps: true` añade `createdAt` y `updatedAt` automáticamente

// --- Middleware para encriptar la contraseña antes de guardar ---
// 'pre' significa que esta función se ejecuta ANTES de que el documento se guarde ('save')
userSchema.pre('save', async function(next) {
    // Solo encripta la contraseña si ha sido modificada (o es nueva)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10); // Genera un "salt" (valor aleatorio)
        this.password = await bcrypt.hash(this.password, salt); // Encripta la contraseña con el salt
        next();
    } catch (error) {
        next(error); // Pasa el error al siguiente middleware
    }
});

// --- Método para comparar contraseñas ---
// Este método estará disponible en cada instancia de usuario (ej: user.comparePassword('miContraseña'))
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Creamos y exportamos el Modelo de Usuario
const User = mongoose.model('User', userSchema);

module.exports = User;