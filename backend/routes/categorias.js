const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');

const Categoria = require('../models/Categoria');

router.get('/', async (req, res) => {

  try {

    // El catálogo público pide ?activa=true para no mostrar
    // categorías ocultas. El admin llama sin el parámetro y
    // sigue viendo todas, para poder gestionarlas.

    const filtro = {};

    if (req.query.activa === 'true') {

      filtro.activa = true;
    }

    const categorias =
      await Categoria.find(filtro)
        .sort({ orden: 1 });

    res.json(categorias);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al obtener categorías'
    });

  }

});

router.post(
  '/',
  auth,
  async (req, res) => {

  const categoria =
    new Categoria(req.body);

  await categoria.save();

  res.json(categoria);

});

router.put(
  '/:id',
  auth,
  async (req, res) => {

  const categoria =
    await Categoria.findByIdAndUpdate(

      req.params.id,

      req.body,

      { new: true }

    );

  res.json(categoria);

});

router.delete(
  '/:id',
  auth,
  async (req, res) => {

  await Categoria.findByIdAndDelete(
    req.params.id
  );

  res.json({
    success: true
  });

});

module.exports = router;