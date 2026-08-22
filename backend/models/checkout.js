const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Producto = require('../models/Producto');
const Pedido = require('../models/Pedido');
const Configuracion = require('../models/configuracion');

router.post('/', async (req, res) => {

  const session = await mongoose.startSession();
  let pedidoCreado = null;

  try {

    const {
      cliente,
      telefono,
      direccion,
      tipoEntrega,
      envio,
      items,
      cartId // idempotencia: el modelo Pedido ya tiene índice único parcial sobre esto
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ mensaje: 'Carrito vacío' });
    }

    await session.withTransaction(async () => {

      let subtotal = 0;
      const itemsPedido = [];

      for (const item of items) {

        const producto = await Producto.findById(item.productoId).session(session);
        if (!producto) {
          throw { status: 404, mensaje: 'Producto no encontrado' };
        }

        const variante = producto.variantes.find(v => v.peso === item.peso);
        if (!variante) {
          throw { status: 404, mensaje: 'Variante no encontrada' };
        }

        let actualizado;

        if (producto.tipoStock !== 'granel') {

          // Descuento atómico y condicional en una sola operación: el $gte en
          // el filtro hace que el update solo aplique si en ESE momento hay
          // stock suficiente. Reemplaza el patrón anterior (leer, validar en
          // JS, guardar) que dejaba una ventana para overselling si dos
          // checkouts llegaban al mismo tiempo.
          actualizado = await Producto.findOneAndUpdate(
            {
              _id: item.productoId,
              'variantes.peso': item.peso,
              'variantes.stock': { $gte: Number(item.cantidad) }
            },
            { $inc: { 'variantes.$.stock': -Number(item.cantidad) } },
            { new: true, session }
          );

        } else {

          // FIX: el modelo Producto guarda el stock a granel en GRAMOS, en el
          // campo "stockGranel", y la equivalencia de cada variante en
          // "equivalencia" (también gramos). La versión anterior de este
          // archivo usaba "stockGranelKg" y "equivalenciaKg", que no existen
          // en el schema: el valor siempre daba 0, la validación de stock
          // nunca frenaba una venta sin stock, y el descuento no se guardaba
          // en el campo real (se perdía silenciosamente).
          const gramosNecesarios = Number(variante.equivalencia || 0) * Number(item.cantidad);

          actualizado = await Producto.findOneAndUpdate(
            {
              _id: item.productoId,
              stockGranel: { $gte: gramosNecesarios }
            },
            { $inc: { stockGranel: -gramosNecesarios } },
            { new: true, session }
          );
        }

        if (!actualizado) {
          throw { status: 400, mensaje: `${producto.nombre} sin stock suficiente` };
        }

        const subtotalItem = Number(item.precio) * Number(item.cantidad);
        subtotal += subtotalItem;

        itemsPedido.push({
          productoId: item.productoId,
          nombre: item.nombre,
          foto: item.foto,
          peso: item.peso,
          precio: item.precio,
          cantidad: item.cantidad,
          subtotal: subtotalItem
        });
      }

      // Contador atómico de número de pedido usando el documento de
      // Configuracion (ya tenía el campo "nropedido" pensado para esto).
      // Reemplaza "buscar el último pedido y sumarle 1 en JS", que es una
      // condición de carrera: dos checkouts simultáneos pueden leer el mismo
      // último número antes de que ninguno haya guardado todavía.
      const config = await Configuracion.findOneAndUpdate(
        {},
        { $inc: { nropedido: 1 } },
        { new: true, upsert: true, session }
      );
      const nuevoNumero = config.nropedido;

      const total = subtotal + Number(envio || 0);

      const creados = await Pedido.create(
        [{
          nropedido: String(nuevoNumero),
          cartId,
          cliente,
          telefono,
          direccion,
          tipoEntrega,
          envio: Number(envio || 0),
          items: itemsPedido,
          subtotal,
          total
        }],
        { session }
      );

      pedidoCreado = creados[0];
    });

    res.json({
      success: true,
      pedidoId: pedidoCreado._id,
      nropedido: pedidoCreado.nropedido
    });

  } catch (error) {

    if (error && error.status) {
      return res.status(error.status).json({ mensaje: error.mensaje });
    }

    // Error de índice único (doble submit con mismo cartId): no es un error
    // real, el pedido ya existe. Devolvemos éxito idempotente si viene cartId.
    if (error && error.code === 11000 && req.body.cartId) {
      const existente = await Pedido.findOne({ cartId: req.body.cartId });
      if (existente) {
        return res.json({
          success: true,
          pedidoId: existente._id,
          nropedido: existente.nropedido
        });
      }
    }

    console.error(error);
    res.status(500).json({ mensaje: 'Error en checkout' });

  } finally {
    session.endSession();
  }

});

module.exports = router;
