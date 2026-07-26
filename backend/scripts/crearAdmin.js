// Uso: node scripts/crearAdmin.js <usuario> <password>
// Ejemplo: node scripts/crearAdmin.js admin miClaveSegura123

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function crearAdmin() {
  const usuario = process.argv[2];
  const password = process.argv[3];

  if (!usuario || !password) {
    console.log('Uso: node scripts/crearAdmin.js <usuario> <password>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existente = await Admin.findOne({ usuario });

  if (existente) {
    console.log(
      `Ya existe un admin con el usuario "${usuario}". Si queres cambiarle la clave, borralo primero de la colección Admin o hacemos un script aparte para actualizarla.`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await Admin.create({ usuario, passwordHash });

  console.log(`Admin "${usuario}" creado correctamente.`);

  await mongoose.disconnect();
  process.exit(0);
}

crearAdmin().catch((error) => {
  console.error('Error creando admin:', error);
  process.exit(1);
});
