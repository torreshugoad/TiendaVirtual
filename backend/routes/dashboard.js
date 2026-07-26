const express =
  require('express');

const router =
  express.Router();

const auth =
  require('../middleware/auth');

router.use(auth);

const Pedido =
  require('../models/Pedido');

const Producto =
  require('../models/Producto');

router.get('/',
async (req, res) => {

  try {

    const pedidos =
      await Pedido.find();

    const productos =
      await Producto.find();

const ventasTotales = pedidos
  .filter(pedido => pedido.estado !== "Cancelado")
  .reduce((acc, pedido) => acc + (pedido.total || 0), 0);

    const pedidosPendientes =

      pedidos.filter(

        p =>

          p.estado ===
          'Pedido pendiente'

      ).length;

    const hoy =
      new Date();

    hoy.setHours(
      0, 0, 0, 0
    );

    const pedidosHoy =

      pedidos.filter(p => {

        const fecha =
          new Date(p.fecha);

        fecha.setHours(
          0, 0, 0, 0
        );

        return (
          fecha.getTime() ===
          hoy.getTime()
        );

      }).length;

    const mesActual =
      new Date().getMonth();

    const anioActual =
      new Date().getFullYear();

    const facturacionMensual =
      pedidos

        .filter(p => {

          const fecha =
            new Date(p.fecha);

          return (

            fecha.getMonth() ===
              mesActual &&

            fecha.getFullYear() ===
              anioActual

          );

        })

        .reduce(

          (acc, pedido) =>

            acc + (
              pedido.total || 0
            ),

          0

        );

    const ventasProductos =
      {};

    pedidos.forEach(pedido => {

      pedido.items?.forEach(item => {

        const key =

          `${item.nombre} ${item.peso}`;

        if (
          !ventasProductos[key]
        ) {

          ventasProductos[key] = 0;
        }

        ventasProductos[key] +=
          item.cantidad;

      });

    });

    const topProductos =

      Object.entries(
        ventasProductos
      )

      .sort((a, b) =>
        b[1] - a[1]
      )

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

      ventasTotales,

      pedidosPendientes,

      pedidosHoy,

      facturacionMensual,

      topProductos,

      stockBajo

    });

  } catch (error) {

    console.log(error);

    res.status(500)
      .json({

        error:
          'Error dashboard'

      });

  }

});

module.exports = router;