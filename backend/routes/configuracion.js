const express = require('express');

const router = express.Router();

const Configuracion =
  require('../models/Configuracion');

router.get('/', async (req, res) => {

  try {

    const config =
      await Configuracion.findOne({});

    res.json(config);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

module.exports = router;