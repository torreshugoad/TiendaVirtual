const express = require('express');

const router = express.Router();

const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Configuracion = require('../models/Configuracion');


// OBTENER PEDIDOS

router.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ fecha: -1 });

    res.json(pedidos);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: 'Error al obtener pedidos'
    });
  }
});


// CREAR PEDIDO

router.post('/', async (req, res) => {
  try {
    const configuracion = await Configuracion.findOneAndUpdate(
      {},
      { $inc: { nropedido: 1 } },
      { new: true, upsert: true }
    );

    const pedido = new Pedido({
      nropedido: configuracion.nropedido,
      cliente: req.body.cliente,
      telefono: req.body.telefono,
      direccion: req.body.direccion,
      tipoEntrega: req.body.tipoEntrega,
      envio: req.body.envio,
      items: req.body.items,
      subtotal: req.body.subtotal,
      total: req.body.total,
      estado: req.body.estado,
      fecha: req.body.fecha
    });

    await pedido.save();

    res.json(pedido);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: 'Error al guardar pedido'
    });
  }
});


// DESCONTAR STOCK

router.post('/descontar-stock', async (req, res) => {
  try {
    const items = req.body.items || [];

    for (const item of items) {
      const producto = await Producto.findById(item.productoId);

      if (!producto) continue;

      if (producto.tipoStock !== 'granel') {
        const variante = producto.variantes.find(
          (v) => v.peso === item.peso
        );

        if (variante) {
          variante.stock -= Number(item.cantidad);
        }
      } else {
        let gramos = 0;

        const variante = producto.variantes.find(
          (v) => v.peso === item.peso
        );

        if (variante) {
          gramos = variante.equivalencia;
        } else {
          const texto = item.peso.toLowerCase().replace(/\s/g, '');

          if (texto.includes('kg')) {
            gramos = Number(texto.replace('kg', '')) * 1000;
          } else if (texto.includes('gr')) {
            gramos = Number(texto.replace('gr', ''));
          } else {
            gramos = Number(texto);
          }
        }

        producto.stockGranel -= gramos * Number(item.cantidad);
      }

      await producto.save();
    }

    res.json({ ok: true });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: 'Error al descontar stock'
    });
  }
});


// REPONER STOCK (helper interno, usado al cancelar un pedido)

async function reponerStock(items) {
  for (const item of items) {
    const producto = await Producto.findById(item.productoId);

    if (!producto) continue;

    if (producto.tipoStock !== 'granel') {
      const variante = producto.variantes.find(
        (v) => v.peso === item.peso
      );

      if (variante) {
        variante.stock += Number(item.cantidad);
      }
    } else {
      let gramos = 0;

      const variante = producto.variantes.find(
        (v) => v.peso === item.peso
      );

      if (variante) {
        gramos = variante.equivalencia;
      } else {
        const texto = item.peso.toLowerCase().replace(/\s/g, '');

        if (texto.includes('kg')) {
          gramos = Number(texto.replace('kg', '')) * 1000;
        } else if (texto.includes('gr')) {
          gramos = Number(texto.replace('gr', ''));
        } else {
          gramos = Number(texto);
        }
      }

      producto.stockGranel += gramos * Number(item.cantidad);
    }

    await producto.save();
  }
}


// ACTUALIZAR ESTADO

router.put('/:id', async (req, res) => {
  try {
    const { estado } = req.body;

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        error: 'Pedido no encontrado'
      });
    }

    // Si se cancela un pedido que NO estaba ya cancelado,
    // se repone el stock de cada item automáticamente.
    // El chequeo evita reponer dos veces si alguien reintenta la acción.

    if (estado === 'Cancelado' && pedido.estado !== 'Cancelado') {
      await reponerStock(pedido.items);
    }

    pedido.estado = estado;

    await pedido.save();

    res.json(pedido);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: 'Error actualizando pedido'
    });
  }
});

module.exports = router;