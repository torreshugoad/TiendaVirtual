const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  const authHeader =
    req.headers.authorization;

  if (!authHeader) {

    return res.status(401).json({

      ok: false,

      mensaje: 'Token no enviado'

    });

  }

  const token =
    authHeader.split(' ')[1];

  try {

    const usuario =
      jwt.verify(

        token,

        process.env.JWT_SECRET

      );

    req.usuario = usuario;

    next();

  }

  catch {

    return res.status(401).json({

      ok: false,

      mensaje: 'Token inválido'

    });

  }

};