// Uso: node scripts/crearAdminMongoAtlas.js <usuario> <password> "<mongoUri>"
//
// Ejemplo:
// node scripts/crearAdminMongoAtlas.js admin miClaveSegura123 "mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/Tienda?retryWrites=true&w=majority"
//
// La URI se pasa como argumento (no se lee del .env) para evitar crear el
// admin por error contra la base local en vez de Atlas.

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

async function crearAdminAtlas() {
  const usuario = process.argv[2];
  const password = process.argv[3];
  const mongoUri = process.argv[4];

  if (!usuario || !password || !mongoUri) {
    console.log(
      'Uso: node scripts/crearAdminMongoAtlas.js <usuario> <password> "<mongoUri>"'
    );
    process.exit(1);
  }

  if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
    console.log(
      'Esa URI parece ser local, no de Atlas. Este script es específicamente para Atlas — usá crearAdmin.js para la base local.'
    );
    process.exit(1);
  }

  if (!mongoUri.startsWith('mongodb+srv://') && !mongoUri.startsWith('mongodb://')) {
    console.log('La URI no parece un connection string válido de MongoDB.');
    process.exit(1);
  }

  console.log('Conectando a MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('Conectado.');

  const existente = await Admin.findOne({ usuario });

  if (existente) {
    console.log(
      `Ya existe un admin con el usuario "${usuario}" en esta base. Si queres cambiarle la clave, hacelo desde la pantalla de "Cambiar contraseña" del panel, ya logueado.`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await Admin.create({ usuario, passwordHash });

  console.log(`Admin "${usuario}" creado correctamente en Atlas.`);

  await mongoose.disconnect();
  process.exit(0);
}

crearAdminAtlas().catch((error) => {
  console.error('Error creando admin en Atlas:', error);
  process.exit(1);
});
