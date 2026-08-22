const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/comprasController');

router.use(auth);

router.get('/', ctrl.listarCompras);
router.get('/:id', ctrl.obtenerCompra);
router.post('/', ctrl.crearCompra);
router.put('/:id', ctrl.actualizarCompra);
router.post('/:id/evaluar-precios', ctrl.evaluarPrecios);
router.post('/:id/confirmar', ctrl.confirmarCompra);
router.post('/:id/anular', ctrl.anularCompra);

module.exports = router;
