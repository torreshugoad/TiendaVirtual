// ============================================================
// Migración: agregar margenMultiplicador y factorAjuste a las
// variantes existentes que todavía no los tengan.
//
// CÓMO USARLO EN COMPASS:
// 1. Conectate a tu base (local o Atlas).
// 2. Abrí la pestaña "MONGOSH" (la consola integrada, abajo
//    en Compass, o el ícono ">_").
// 3. Pegá este bloque completo y presioná Enter.
//
// Es seguro correrlo más de una vez: los updateMany solo tocan
// las variantes que NO tienen el campo (arrayFilters con
// $exists: false), así que no pisa valores ya cargados.
// ============================================================

const DEFAULT_MARGEN = 2;   // vender al doble del costo
const DEFAULT_FACTOR = 1;   // sin ajuste

const resultadoMargen = db.productos.updateMany(
  {},
  { $set: { "variantes.$[v].margenMultiplicador": DEFAULT_MARGEN } },
  { arrayFilters: [{ "v.margenMultiplicador": { $exists: false } }] }
);

const resultadoFactor = db.productos.updateMany(
  {},
  { $set: { "variantes.$[v].factorAjuste": DEFAULT_FACTOR } },
  { arrayFilters: [{ "v.factorAjuste": { $exists: false } }] }
);

print(`margenMultiplicador agregado en ${resultadoMargen.modifiedCount} producto(s)`);
print(`factorAjuste agregado en ${resultadoFactor.modifiedCount} producto(s)`);
print("Listo.");
