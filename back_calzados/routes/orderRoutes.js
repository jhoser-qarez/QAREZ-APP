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
      total,
      transaccionId // ✅ Recibimos el código de transacción
    } = req.body;

    // Validaciones básicas
    if (!nombreCliente || !emailCliente || !metodoEnvio || !metodoPago || !items || items.length === 0) {
      return res.status(400).json({ message: 'Faltan campos obligatorios para procesar la orden.' });
    }

    // Validar campos de dirección si el método de envío es 'envio'
    if (metodoEnvio === 'envio' && (!direccionEnvio.calle || !direccionEnvio.distrito || !direccionEnvio.ciudad)) {
      return res.status(400).json({ message: 'Por favor completa todos los campos de la dirección de envío para el método "envio".' });
    }

    // ✅ Validar que el código de transacción esté presente si el método de pago lo requiere
    if ((metodoPago === 'Yape' || metodoPago === 'Plin' || metodoPago === 'Transferencia Bancaria') && !transaccionId) {
        return res.status(400).json({ message: `El código de transacción es obligatorio para el método de pago ${metodoPago}.` });
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
      // Solo guarda la dirección de envío si el método es 'envio'
      direccionEnvio: metodoEnvio === 'envio' ? direccionEnvio : {},
      metodoEnvio,
      metodoPago,
      subtotal,
      costoEnvio,
      total,
      items: processedItems,
      transaccionId // ✅ Guardamos el código de transacción en el modelo
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

    // Lógica condicional para la dirección en el correo
    let direccionHtml = '';
    if (metodoEnvio === 'envio') {
      direccionHtml = `
        <h4>Dirección de envío:</h4>
        <p>
          ${direccionEnvio.calle} ${direccionEnvio.numero || ''},<br/>
          ${direccionEnvio.distrito}, ${direccionEnvio.ciudad} - ${direccionEnvio.codigoPostal || ''}<br/>
          ${direccionEnvio.referencia ? 'Ref: ' + direccionEnvio.referencia : ''}
        </p>
      `;
    } else if (metodoEnvio === 'recoger') {
      direccionHtml = `
        <h4>Dirección de Recojo en Tienda:</h4>
        <p><strong>QAREZ Tienda de Calzados</strong></p>
        <p>Av. Siempre Viva 742, Springfield</p>
        <p>Horario: Lunes a Viernes de 9:00 AM a 6:00 PM</p>
        <p>Teléfono: +51 987 654 321</p>
      `;
    }

    // ✅ Lógica condicional para las instrucciones de pago en el correo
    let instruccionesPagoHtml = '';
    if (metodoPago === 'Yape') {
      instruccionesPagoHtml = `
        <h4>Instrucciones de Pago (Yape):</h4>
        <p>Por favor, realiza el pago de <strong>S/. ${total.toFixed(2)}</strong> a nuestro número Yape:</p>
        <p style="font-size: 24px; font-weight: bold; color: #800080;">+51 997572736</p>
        <p><strong>Código de Transferencia ingresado:</strong> ${transaccionId}</p>
        <p style="font-size: 14px; color: #555; margin-top: 10px;">Tu pedido será procesado una vez que confirmemos el pago con este código.</p>
      `;
    } else if (metodoPago === 'Plin') {
      instruccionesPagoHtml = `
        <h4>Instrucciones de Pago (Plin):</h4>
        <p>Por favor, realiza el pago de <strong>S/. ${total.toFixed(2)}</strong> a nuestro número Plin:</p>
        <p style="font-size: 24px; font-weight: bold; color: #FF69B4;">+51 997572736</p>
        <p><strong>Código de Transferencia ingresado:</strong> ${transaccionId}</p>
        <p style="font-size: 14px; color: #555; margin-top: 10px;">Tu pedido será procesado una vez que confirmemos el pago con este código.</p>
      `;
    } else if (metodoPago === 'Transferencia Bancaria') {
      instruccionesPagoHtml = `
        <h4>Instrucciones de Pago (Transferencia Bancaria):</h4>
        <p>Por favor, realiza la transferencia de <strong>S/. ${total.toFixed(2)}</strong> a la siguiente cuenta bancaria:</p>
        <p><strong>Banco:</strong> Banco de Crédito del Perú (BCP)</p>
        <p><strong>Número de Cuenta:</strong> 194-12345678-0-00</p>
        <p><strong>CCI:</strong> 002-194-123456789012-XX</p>
        <p><strong>Titular:</strong> QAREZ Tienda de Calzados S.A.C.</p>
        <p><strong>Código de Transferencia ingresado:</strong> ${transaccionId}</p>
        <p style="font-size: 14px; color: #555; margin-top: 10px;">Tu pedido será procesado una vez que confirmemos el pago con este código.</p>
      `;
    }


    const mailOptions = {
      from: `"QAREZ Tienda de Calzados" <${process.env.EMAIL_USER}>`,
      to: emailCliente,
      subject: 'Confirmación de tu pedido - QAREZ',
      html: `
        <h2>¡Gracias por tu compra, ${nombreCliente}!</h2>
        <p>Tu pedido ha sido recibido y está siendo procesado.</p>
        <h3>Resumen del pedido:</h3>
        <ul>${resumenProductos}</ul>
        <p><strong>Subtotal:</strong> S/. ${subtotal.toFixed(2)}</p>
        <p><strong>Costo de Envío:</strong> S/. ${costoEnvio.toFixed(2)}</p>
        <p><strong>Total:</strong> S/. ${total.toFixed(2)}</p>
        <br/>
        ${direccionHtml}
        <p>Método de Envío: ${metodoEnvio}</p>
        <p>Método de Pago: ${metodoPago}</p>
        <br/>
        ${instruccionesPagoHtml}
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
