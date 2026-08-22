// Muestra un peso en gramos con la unidad más práctica: Kg cuando
// llega a 1000 o más, Gr por debajo. Mismo criterio de formato que
// ya se usa en el resto de la app para variantes a granel (ej.
// "1Kg", "850Gr").
export function formatearPeso(gramos) {
  const valor = Number(gramos || 0);

  if (valor >= 1000) {
    const kg = valor / 1000;
    const texto = Number.isInteger(kg) ? kg : Number(kg.toFixed(2));
    return `${texto}Kg`;
  }

  return `${valor}Gr`;
}
