const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const nodemailer = require('nodemailer');

// POST /api/orders
// Crear un pedido sin necesidad de login
router.post('/', async (req, res) => {
  try {
    const {
      nombreCliente,
      emailCliente,
      telefonoCliente,
      direccionEnvio,
      metodoEnvio,
      metodoPago,
      items,
      subtotal,
      costoEnvio,
      total
    } = req.body;

    // Validaciones básicas
    if (!nombreCliente || !emailCliente || !direccionEnvio || !metodoEnvio || !metodoPago || !items || items.length === 0) {
      return res.status(400).json({ message: 'Faltan campos obligatorios para procesar la orden.' });
    }

    let processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.activo) {
        return res.status(404).json({ message: `Producto con ID ${item.productId} no encontrado o inactivo.` });
      }

      const variant = product.variantes.find(v => v.sku === item.variante.sku);
      if (!variant) {
        return res.status(404).json({ message: `Variante ${item.variante.sku} no encontrada.` });
      }

      if (variant.stock < item.cantidad) {
        return res.status(400).json({ message: `Stock insuficiente para la variante ${variant.sku}.` });
      }

      // Restar stock
      variant.stock -= item.cantidad;
      await product.save();

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

    const nuevaOrden = new Order({
      nombreCliente,
      emailCliente,
      telefonoCliente,
      direccionEnvio,
      metodoEnvio,
      metodoPago,
      subtotal,
      costoEnvio,
      total,
      items: processedItems
    });

    const ordenGuardada = await nuevaOrden.save();

    // ✅ Enviar correo de confirmación
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,     // tu correo desde .env
        pass: process.env.EMAIL_PASS      // contraseña o app password desde .env
      }
    });

    const resumenProductos = processedItems.map(p =>
      `<li>${p.nombreProducto} (${p.variante.talla} - ${p.variante.color}) x${p.cantidad} - S/. ${p.precioUnitario.toFixed(2)}</li>`
    ).join('');

    const mailOptions = {
      from: `"QAREZ Tienda de Calzados" <${process.env.EMAIL_USER}>`,
      to: emailCliente,
      subject: 'Confirmación de tu pedido - QAREZ',
      html: `
        <h2>¡Gracias por tu compra, ${nombreCliente}!</h2>
        <p>Tu pedido ha sido recibido y está siendo procesado.</p>
        <h3>Resumen del pedido:</h3>
        <ul>${resumenProductos}</ul>
        <p><strong>Total:</strong> S/. ${total}</p>
        <h4>Dirección de envío:</h4>
        <p>
          ${direccionEnvio.calle} ${direccionEnvio.numero || ''},<br/>
          ${direccionEnvio.distrito}, ${direccionEnvio.ciudad} - ${direccionEnvio.codigoPostal || ''}<br/>
          ${direccionEnvio.referencia ? 'Ref: ' + direccionEnvio.referencia : ''}
        </p>
        <p>Método de Envío: ${metodoEnvio}</p>
        <p>Método de Pago: ${metodoPago}</p>
        <br/>
        <p>Nos contactaremos contigo pronto. 🙌</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Orden registrada y correo enviado', orden: ordenGuardada });

  } catch (error) {
    console.error('❌ Error al crear pedido:', error);
    res.status(500).json({ message: 'Error interno al crear el pedido.' });
  }
});
module.exports = router;
