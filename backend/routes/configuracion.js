const express = require('express');

const router = express.Router();

const Configuracion =
  require('../models/Configuracion');

/* ===========================
   OBTENER CONFIGURACIÓN
=========================== */

router.get('/', async (req, res) => {

  try {

    let configuracion =
      await Configuracion.findOne({});

    if (!configuracion) {

      configuracion =
        await Configuracion.create({});

    }

    res.json(configuracion);

  } catch (error) {

    console.error(error);

    res.status(500).json({

      ok: false,

      mensaje:
        'Error obteniendo la configuración.'

    });

  }

});

/* ===========================
   ACTUALIZAR CONFIGURACIÓN
=========================== */

router.put('/', async (req, res) => {

  try {

    let configuracion =
      await Configuracion.findOne({});

    if (!configuracion) {

      configuracion =
        new Configuracion();

    }

    configuracion.nombreTienda =
      req.body.nombreTienda;

    configuracion.descripcion =
      req.body.descripcion;

    configuracion.notaHeader =
      req.body.notaHeader;

    configuracion.telefonoWhatsapp =
      req.body.telefonoWhatsapp;

    configuracion.instagram =
      req.body.instagram;

    configuracion.facebook =
      req.body.facebook;

    configuracion.costoEnvio =
      Number(req.body.costoEnvio || 0);

    configuracion.envioGratisDesde =
      Number(req.body.envioGratisDesde || 0);

    await configuracion.save();

    res.json({

      ok: true,

      mensaje:
        'Configuración actualizada.',

      configuracion

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({

      ok: false,

      mensaje:
        'No fue posible guardar la configuración.'

    });

  }

});

module.exports = router;