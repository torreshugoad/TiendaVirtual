const express =
  require('express');

const mongoose =
  require('mongoose');

const cors =
  require('cors');

require('dotenv').config();

/* =========================
   ROUTES
========================= */

const adminStockRoutes =
  require('./routes/adminStock');

const productosRoutes =
  require('./routes/productos');

const categoriasRoutes =
  require('./routes/categorias');

const configuracionRoutes =
  require('./routes/configuracion');

const pedidosRoutes =
  require('./routes/pedidos');

const uploadRoutes =
  require('./routes/upload');

const dashboardRoutes =
  require('./routes/dashboard');

const reportesRoutes =
  require('./routes/reportes');

const checkoutRoutes =
  require('./routes/checkout');

const stockProductoRoutes =
  require('./routes/stockProducto');

const verificarStockRoutes =
  require('./routes/verificarStock');

const authRoutes = require('./routes/auth');

const app = express();

/* =========================
   MIDDLEWARES
========================= */

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */

app.get(
  '/',
  (req, res) => {

    res.status(200).json({
      ok: true,
      mensaje:
        'Backend funcionando correctamente'
    });

  }
);

/* =========================
   API ROUTES
========================= */

app.use(
  '/api/productos',
  productosRoutes
);

app.use(
  '/api/categorias',
  categoriasRoutes
);

app.use(
  '/api/configuracion',
  configuracionRoutes
);

app.use(
  '/api/pedidos',
  pedidosRoutes
);

app.use(
  '/api/upload',
  uploadRoutes
);

app.use(
  '/api/dashboard',
  dashboardRoutes
);

app.use(
  '/api/reportes',
  reportesRoutes
);

app.use(
  '/api/checkout',
  checkoutRoutes
);

app.use(
  '/api/admin/stock',
  adminStockRoutes
);

app.use(
  '/api/stock-producto',
  stockProductoRoutes
);

app.use(
  '/api/verificar-stock',
  verificarStockRoutes
);

app.use('/api/admin', authRoutes);

/* =========================
   404
========================= */

app.use(
  (req, res) => {

    res.status(404).json({
      error: 'Ruta no encontrada'
    });

  }
);

/* =========================
   MONGODB + SERVER
========================= */

const PORT =
  process.env.PORT || 5000;

mongoose
  .connect(
    process.env.MONGO_URI,
    {
      serverSelectionTimeoutMS: 10000
    }
  )
  .then(() => {

    console.log(
      '✅ MongoDB conectado'
    );

    app.listen(
      PORT,
      '0.0.0.0',
      () => {

        console.log(
          `🚀 Servidor iniciado en puerto ${PORT}`
        );

      }
    );

  })
  .catch((err) => {

    console.error(
      '❌ Error conectando MongoDB:',
      err
    );

    process.exit(1);

  });

/* =========================
   MANEJO DE ERRORES
========================= */

process.on(
  'unhandledRejection',
  (err) => {

    console.error(
      '❌ Unhandled Rejection:',
      err
    );

  }
);

process.on(
  'uncaughtException',
  (err) => {

    console.error(
      '❌ Uncaught Exception:',
      err
    );

    process.exit(1);

  }
);