const mongoose = require('mongoose');
const { Schema } = mongoose;

const VarianteSugeridaSchema = new Schema({
  variante: { type: Schema.Types.ObjectId, required: true },
  nombreVariante: String,
  precioActual: Number,
  precioSugerido: Number,
  precioNuevo: Number,
  margenMultiplicador: Number,      // snapshot: margen de la variante usado para calcular precioSugerido
  factorAjuste: Number,             // snapshot: factor de ajuste de la variante usado para calcular precioSugerido
  editadoManualmente: { type: Boolean, default: false }, // true si el operador tocó "Nuevo precio" a mano
  aplicar: { type: Boolean, default: false }
}, { _id: false });

const ItemCompraSchema = new Schema({
  producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
  nombreProducto: String,          // snapshot, por si el producto cambia después
  tipoStock: { type: String, enum: ['granel', 'unidad'], required: true },
  modalidadCompra: { type: String, enum: ['kg', 'bolsa', 'caja', 'unidad'], required: true },
  cantidadComprada: { type: Number, required: true },
  pesoBolsaKg: Number,              // solo si modalidadCompra === 'bolsa'
  unidadesPorCaja: Number,          // solo si modalidadCompra === 'caja'
  varianteDestino: Schema.Types.ObjectId, // solo si tipoStock === 'unidad' (a qué variante suma el stock)
  cantidadBase: Number,              // gramos (granel) o unidades (unidad); null hasta completar cantidad/modalidad
  costoTotal: { type: Number, required: true },
  costoUnitarioBase: Number,        // costoTotal / cantidadBase, se recalcula en cada guardado
  cargoAsignado: Number,             // parte de los cargos (flete, impuestos, etc.) prorrateada a este ítem
  costoUnitarioBaseConCargos: Number, // costoUnitarioBase + cargoAsignado/cantidadBase; se recalcula al evaluar precios

  // --- Evaluación de precios (paso separado del guardado) ---
  costoUnitarioBaseEvaluado: Number, // costoUnitarioBaseConCargos que tenía este ítem la última vez que se evaluaron precios
  huboCambioCosto: { type: Boolean, default: false }, // true si costoUnitarioBaseConCargos difiere de costoUnitarioBaseEvaluado
  variantesSugeridas: [VarianteSugeridaSchema] // precios sugeridos para TODAS las variantes del producto (se llenan al evaluar)
}, { _id: false });

const CargoCompraSchema = new Schema({
  tipo: { type: String, required: true }, // ej: 'flete', 'impuestos', 'otros'
  descripcion: String,
  monto: { type: Number, required: true, min: 0 }
}, { _id: false });

const CompraSchema = new Schema({
  proveedor: String,
  numeroFactura: String,
  fecha: { type: Date, default: Date.now },
  items: [ItemCompraSchema],
  cargos: [CargoCompraSchema],       // flete, impuestos u otros gastos de la compra, a prorratear entre los ítems
  costoTotalCompra: { type: Number, default: 0 },
  estado: { type: String, enum: ['borrador', 'confirmada', 'anulada'], default: 'borrador' },
  confirmadaEn: Date,
  creadoPor: { type: Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

// Cubre listarCompras (sort por createdAt) y cualquier filtro por estado
// (borrador/confirmada/anulada), evitando sort en memoria a medida que
// crezca la colección.
CompraSchema.index({ estado: 1, createdAt: -1 });

module.exports = mongoose.model('Compra', CompraSchema);
