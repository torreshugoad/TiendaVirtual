const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
router.use(auth);
const Producto = require('../models/Producto');

/* ==========================
   OBTENER STOCK
========================== */

router.get('/', async (req, res) => {
  try {
    const productos =
      await Producto.find()
        .populate('categoria');
    const filas = [];

    productos.forEach(producto => {
      producto.variantes.forEach(variante => {
        filas.push({
          productoId: producto._id,
          varianteId: variante._id,
          categoria: producto.categoria?.nombre || '',
          producto: producto.nombre,
          peso: variante.peso,
          precio: Number( variante.precio || 0 ),
          stock: Number( variante.stock || 0 ),
          stockMinimo: Number( variante.stockMinimo ?? 5 ),
          tipoStock: producto.tipoStock,
          // Mongo guarda gramos.
          // El administrador ve Kg.

          stockGranel: Number( producto.stockGranel || 0 ) / 1000,
          stockMinimoGranel: Number( producto.stockMinimoGranel ?? 2000 ) / 1000
        });
      });
    });
    res.json(filas);
  }

  catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        'Error obteniendo stock'
    });
  }
});

/* ==========================
   GUARDAR CAMBIOS
========================== */

router.put('/', async (req, res) => {
  try {
    const { filas } = req.body;

    if (!Array.isArray(filas) || filas.length === 0) {
      return res.json({ success: true });
    }

    /* ==========================
       AGRUPAMOS LAS FILAS POR PRODUCTO
       (antes se hacía 1 findById + 1 save
       por CADA fila/variante = 2 round-trips
       a Atlas por fila. Ahora armamos UNA
       sola operación de update por producto)
    ========================== */

    const filasPorProducto = new Map();
    for (const fila of filas) {
      const key = String(fila.productoId);
      if (!filasPorProducto.has(key)) {
        filasPorProducto.set(key, []);
      }
      filasPorProducto.get(key).push(fila);
    }

    const ops = [];
    for (const [productoId, filasProducto] of filasPorProducto) {
      const esGranel =
        filasProducto[0].tipoStock === 'granel';
      const set = {};
      const arrayFilters = [];
      /* ==========================
         STOCK GRANEL (a nivel producto)
      ========================== */

      if (esGranel) {
        const fila = filasProducto[0];
        set.stockGranel =
          Math.round(
            Number(fila.stockGranel || 0) * 1000
          );
        set.stockMinimoGranel =
          Math.round(
            Number(fila.stockMinimoGranel || 0) * 1000
          );
      }

      /* ==========================
         VARIANTES (usando arrayFilters
         para actualizar cada subdocumento
         sin traer el producto entero)
      ========================== */

      filasProducto.forEach((fila, index) => {

        // fila.varianteId llega como string plano desde el frontend
        // (pasó por JSON.stringify). MongoDB compara arrayFilters por
        // tipo exacto: un string nunca matchea un ObjectId, aunque
        // "se vean iguales". Sin este cast, el updateOne "tenía éxito"
        // pero no tocaba ningún elemento del array -> precio/stock
        // nunca se guardaban, sin tirar error.
        if (!mongoose.Types.ObjectId.isValid(fila.varianteId)) {
          return;
        }

        const alias = `v${index}`;
        const varianteObjectId = new mongoose.Types.ObjectId(fila.varianteId);

        set[`variantes.$[${alias}].precio`] =
          Number(fila.precio || 0);
        if (!esGranel) {
          set[`variantes.$[${alias}].stock`] =
            Number(fila.stock || 0);
          set[`variantes.$[${alias}].stockMinimo`] =
            Number(fila.stockMinimo ?? 5);
        }

        arrayFilters.push({
          [`${alias}._id`]: varianteObjectId
        });
      });

      ops.push({
        updateOne: {
          filter: { _id: productoId },
          update: { $set: set },
          arrayFilters
        }
      });

    }
    if (ops.length > 0) {
      await Producto.bulkWrite(ops);
    }

    res.json({
      success: true
    });
  }

  catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        'Error guardando stock'
    });
  }
});
module.exports = router;