const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.use(auth);

const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');

function obtenerRangoFechas(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(fechaFin);
  fin.setHours(23, 59, 59, 999);

  return { inicio, fin };
}

router.get('/', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        error: 'fechaInicio y fechaFin son requeridos'
      });
    }

    const { inicio, fin } = obtenerRangoFechas(fechaInicio, fechaFin);

    const pedidosPeriodo = await Pedido.find({
      fecha: {
        $gte: inicio,
        $lte: fin
      }
    });

    const productos = await Producto.find();

    // Pedidos pendientes: se muestra el total actual (no depende del
    // período elegido), porque es una cola de trabajo operativa, no
    // una métrica histórica.
    const pedidosPendientes = await Pedido.countDocuments({
      estado: 'Pedido pendiente'
    });

    const facturacionPeriodo = pedidosPeriodo
      .filter((pedido) => pedido.estado !== 'Cancelado')
      .reduce((acc, pedido) => acc + (pedido.total || 0), 0);

    const cantidadPedidosPeriodo = pedidosPeriodo.length;

    const ticketPromedioPeriodo =
      cantidadPedidosPeriodo > 0
        ? facturacionPeriodo / cantidadPedidosPeriodo
        : 0;

    const ventasProductos = {};

    pedidosPeriodo.forEach((pedido) => {
      pedido.items?.forEach((item) => {
        const key = `${item.nombre} ${item.peso}`;

        if (!ventasProductos[key]) {
          ventasProductos[key] = 0;
        }

        ventasProductos[key] += item.cantidad;
      });
    });

    const topProductos = Object.entries(ventasProductos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const stockBajo = [];

    productos.forEach((producto) => {
      if (producto.tipoStock === 'granel') {
        const minimo = producto.stockMinimoGranel ?? 2000;

        if (producto.stockGranel <= minimo) {
          stockBajo.push({
            nombre: producto.nombre,
            stock: `${(producto.stockGranel / 1000).toFixed(2)} Kg`
          });
        }
      } else {
        producto.variantes?.forEach((v) => {
          const minimo = v.stockMinimo ?? 5;

          if (v.stock <= minimo) {
            stockBajo.push({
              nombre: `${producto.nombre} ${v.peso}`,
              stock: v.stock
            });
          }
        });
      }
    });

    res.json({
      fechaInicio,
      fechaFin,
      facturacionPeriodo,
      cantidadPedidosPeriodo,
      ticketPromedioPeriodo,
      pedidosPendientes,
      topProductos,
      stockBajo
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Error dashboard'
    });
  }
});

module.exports = router;
