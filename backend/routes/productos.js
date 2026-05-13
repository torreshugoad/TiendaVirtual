const express = require('express');

const router = express.Router();

const Producto =
  require('../models/Producto');

router.get('/',
async (req, res) => {

  const productos =
    await Producto.find()
      .populate('categoria');

  res.json(productos);

});

router.post('/', async (req, res) => {

  const producto =
    new Producto(req.body);

  await producto.save();

  res.json(producto);
});

router.delete('/:id',
async (req, res) => {

  await Producto.findByIdAndDelete(
    req.params.id
  );

  res.json({
    success: true
  });

});

router.put('/:id',
async (req, res) => {

  const producto =
    await Producto.findByIdAndUpdate(

      req.params.id,

      req.body,

      { new: true }

    );

  res.json(producto);

});

module.exports = router;