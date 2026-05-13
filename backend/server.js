const reportesRoutes =
  require('./routes/reportes');
const dashboardRoutes =
  require('./routes/dashboard');
const categoriasRoutes =
  require('./routes/categorias');
const uploadRoutes =
  require('./routes/upload');
const pedidosRoutes =
  require('./routes/pedidos');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const productosRoutes =
  require('./routes/productos');

const configuracionRoutes =
  require('./routes/configuracion');

const app = express();

app.use(cors());

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
  })
  .catch((err) => {
    console.log(err);
  });

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

app.listen(
  process.env.PORT || 5000,
  '0.0.0.0',
  () => {

    console.log(
      'Servidor iniciado'
    );
  }
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