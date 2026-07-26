const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Admin = require('../models/Admin');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;

    const admin = await Admin.findOne({ usuario });

    if (!admin) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Usuario o contraseña incorrectos',
      });
    }

    const passwordValida = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordValida) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Usuario o contraseña incorrectos',
      });
    }

    const token = jwt.sign(
      { usuario: admin.usuario },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      ok: true,
      usuario: admin.usuario,
      token,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error del servidor',
    });
  }
});

router.get('/verify', auth, (req, res) => {
  res.json({
    ok: true,
    usuario: req.usuario.usuario,
  });
});

router.put('/cambiar-password', auth, async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Faltan datos',
      });
    }

    if (passwordNueva.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
    }

    const admin = await Admin.findOne({ usuario: req.usuario.usuario });

    if (!admin) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Administrador no encontrado',
      });
    }

    const passwordValida = await bcrypt.compare(
      passwordActual,
      admin.passwordHash
    );

    if (!passwordValida) {
      return res.status(401).json({
        ok: false,
        mensaje: 'La contraseña actual es incorrecta',
      });
    }

    admin.passwordHash = await bcrypt.hash(passwordNueva, 10);
    await admin.save();

    res.json({
      ok: true,
      mensaje: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    console.error('Error cambiando password:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error del servidor',
    });
  }
});

module.exports = router;
