const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.use(auth);

const Pedido = require('../models/Pedido');

function obtenerRangoFechas(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(fechaFin);
  fin.setHours(23, 59, 59, 999);

  return { inicio, fin };
}

router.get('/ventas', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        error: 'fechaInicio y fechaFin son requeridos'
      });
    }

    const { inicio, fin } = obtenerRangoFechas(fechaInicio, fechaFin);

    const pedidos = await Pedido.find({
      fecha: {
        $gte: inicio,
        $lte: fin
      }
    });

    let facturacionTotal = 0;
    let cantidadPedidos = pedidos.length;
    let productosVendidos = {};

    pedidos.forEach((pedido) => {
      facturacionTotal += pedido.total || 0;

      pedido.items?.forEach((item) => {
        const key = `${item.nombre} ${item.peso}`;

        if (!productosVendidos[key]) {
          productosVendidos[key] = {
            cantidad: 0,
            importe: 0
          };
        }

        productosVendidos[key].cantidad += item.cantidad;
        productosVendidos[key].importe += item.subtotal;
      });
    });

    const productos = Object.entries(productosVendidos)
      .map(([nombre, datos]) => ({
        producto: nombre,
        cantidad: datos.cantidad,
        importe: datos.importe
      }))
      .sort((a, b) => b.importe - a.importe);

    const ticketPromedio =
      cantidadPedidos > 0 ? facturacionTotal / cantidadPedidos : 0;

    res.json({
      fechaInicio,
      fechaFin,
      cantidadPedidos,
      facturacionTotal,
      ticketPromedio,
      productos
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Error reporte ventas'
    });
  }
});

router.get('/ventas-excel', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        error: 'fechaInicio y fechaFin son requeridos'
      });
    }

    const { inicio, fin } = obtenerRangoFechas(fechaInicio, fechaFin);

    const pedidos = await Pedido.find({
      fecha: {
        $gte: inicio,
        $lte: fin
      }
    });

    const ventas = [];

    pedidos.forEach((pedido) => {
      pedido.items?.forEach((item) => {
        ventas.push({
          fecha: pedido.fecha,
          cliente: pedido.cliente,
          telefono: pedido.telefono,
          producto: item.nombre,
          variante: item.peso,
          cantidad: item.cantidad,
          precio: item.precio,
          subtotal: item.subtotal,
          estado: pedido.estado
        });
      });
    });

    res.json(ventas);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Error reporte excel'
    });
  }
});

module.exports = router;
