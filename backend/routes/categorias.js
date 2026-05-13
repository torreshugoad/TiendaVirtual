const express =
  require('express');

const router =
  express.Router();

const Categoria =
  require('../models/Categoria');

router.get('/',
async (req, res) => {

  const categorias =
    await Categoria.find()
      .sort({ orden: 1 });

  res.json(categorias);

});

router.post('/',
async (req, res) => {

  const categoria =
    new Categoria(req.body);

  await categoria.save();

  res.json(categoria);

});

router.put('/:id',
async (req, res) => {

  const categoria =
    await Categoria.findByIdAndUpdate(

      req.params.id,

      req.body,

      { new: true }

    );

  res.json(categoria);

});

router.delete('/:id',
async (req, res) => {

  await Categoria.findByIdAndDelete(
    req.params.id
  );

  res.json({
    success: true
  });

});

module.exports = router;