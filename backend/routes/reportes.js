const express =
  require('express');

const router =
  express.Router();

const auth =
  require('../middleware/auth');

router.use(auth);

const Pedido =
  require('../models/Pedido');

router.get(
  '/ventas',
  async (req, res) => {

    try {

      const { tipo } =
        req.query;

      const hoy =
        new Date();

      let fechaInicio;

      if (
        tipo === 'semana'
      ) {

        fechaInicio =
          new Date();

        fechaInicio.setDate(
          hoy.getDate() - 7
        );

      } else {

        fechaInicio =
          new Date();

        fechaInicio.setMonth(
          hoy.getMonth() - 1
        );
      }

      const pedidos =
        await Pedido.find({

          fecha: {
            $gte:
              fechaInicio
          }

        });

      let facturacionTotal =
        0;

      let cantidadPedidos =
        pedidos.length;

      let productosVendidos =
        {};

      pedidos.forEach(
        pedido => {

        facturacionTotal +=
          pedido.total || 0;

        pedido.items?.forEach(
          item => {

          const key =

            `${item.nombre} ${item.peso}`;

          if (
            !productosVendidos[key]
          ) {

            productosVendidos[key] = {

              cantidad: 0,

              importe: 0

            };
          }

          productosVendidos[key]
            .cantidad +=
              item.cantidad;

          productosVendidos[key]
            .importe +=
              item.subtotal;

        });

      });

      const productos =

        Object.entries(
          productosVendidos
        )

        .map(
          ([nombre, datos]) => ({

          producto:
            nombre,

          cantidad:
            datos.cantidad,

          importe:
            datos.importe

        }))

        .sort(
          (a, b) =>

            b.importe -
            a.importe
        );

      const ticketPromedio =

        cantidadPedidos > 0

          ? facturacionTotal /
            cantidadPedidos

          : 0;

      res.json({

        tipo,

        cantidadPedidos,

        facturacionTotal,

        ticketPromedio,

        productos

      });

    } catch (error) {

      console.log(error);

      res.status(500)
        .json({

          error:
            'Error reporte ventas'

        });

    }

  }
);

router.get(
  '/ventas-excel',
  async (req, res) => {

    try {

      const {
        fechaInicio,
        fechaFin
      } = req.query;

      const inicio =
        new Date(fechaInicio);

      const fin =
        new Date(fechaFin);

      fin.setHours(
        23,
        59,
        59,
        999
      );

      const pedidos =
        await Pedido.find({

          fecha: {

            $gte: inicio,

            $lte: fin

          }

        });

      const ventas =
        [];

      pedidos.forEach(
        pedido => {

        pedido.items?.forEach(
          item => {

          ventas.push({

            fecha:
              pedido.fecha,

            cliente:
              pedido.cliente,

            telefono:
              pedido.telefono,

            producto:
              item.nombre,

            variante:
              item.peso,

            cantidad:
              item.cantidad,

            precio:
              item.precio,

            subtotal:
              item.subtotal,

            estado:
              pedido.estado

          });

        });

      });

      res.json(ventas);

    } catch (error) {

      console.log(error);

      res.status(500)
        .json({

          error:
            'Error reporte excel'

        });

    }

  }
);

module.exports = router;