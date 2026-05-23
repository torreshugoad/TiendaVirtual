const express =
  require('express');

const mongoose =
  require('mongoose');

const cors =
  require('cors');

require('dotenv').config();

/* ROUTES */

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

const app = express();

/* MIDDLEWARES */

app.use(cors());

app.use(express.json());

/* MONGODB */

mongoose.connect(
  process.env.MONGO_URI
)

.then(() => {

  console.log(
    'MongoDB conectado'
  );

})

.catch((err) => {

  console.log(err);

});

/* ROUTES */

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


/* SERVER */

app.listen(

  process.env.PORT || 5000,

  '0.0.0.0',

  () => {

    console.log(
      'Servidor iniciado'
    );
  }
);