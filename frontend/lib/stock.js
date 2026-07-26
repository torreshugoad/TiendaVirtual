export function calcularStockDisponible(producto, variante) {
  if (producto.tipoStock !== 'granel') {
    return Number(variante.stock || 0);
  }

  return Math.floor(
    Number(producto.stockGranel || 0) / Number(variante.equivalencia || 1)
  );
}
