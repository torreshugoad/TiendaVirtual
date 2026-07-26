const express = require('express');
const jwt = require('jsonwebtoken');

const auth =
  require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {

  const { usuario, password } = req.body;

  if (
    usuario !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASSWORD
  ) {

    return res.status(401).json({

      ok: false,

      mensaje: 'Usuario o contraseña incorrectos'

    });

  }

  const token = jwt.sign(

    {
      usuario
    },

    process.env.JWT_SECRET,

    {
      expiresIn: '8h'
    }

  );

  res.json({

    ok: true,

    usuario,

    token

  });

});   

router.get(

  '/verify',

  auth,

  (req, res) => {

    res.json({

      ok: true,

      usuario:
        req.usuario.usuario

    });

  }

);

module.exports = router;