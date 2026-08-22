const jwt = require('jsonwebtoken');

/* ==========================
   A diferencia de auth.js, este middleware NUNCA rechaza la
   request: rutas como /api/checkout las usa tanto el cliente
   público (sin sesión) como el vendedor logueado desde el
   carrito manual.

   Si viene un token válido, lo deja en req.usuario para que el
   controller decida qué confiarle (ej. aplicar un descuento
   manual). Si no viene, o es inválido, sigue igual pero con
   req.usuario = null.
========================== */

module.exports = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.usuario = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.usuario = null;
  }

  next();
};
