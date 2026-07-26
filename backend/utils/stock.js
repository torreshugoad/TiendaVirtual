function kgAGramos(kg) {

  return Math.round(Number(kg || 0) * 1000);

}

function gramosAKg(gramos) {

  return Number(

    (gramos / 1000).toFixed(3)

  );
}

function hayStock(stockKg, solicitadoKg) {

  return kgAGramos(stockKg) >=
         kgAGramos(solicitadoKg);

}

function descontarStock(stockKg, descuentoKg) {

  const disponible =
    kgAGramos(stockKg);

  const descuento =
    kgAGramos(descuentoKg);

  return gramosAKg(
    disponible - descuento
  );

}

function sumarStock(stockKg, cantidadKg) {

  return gramosAKg(

    kgAGramos(stockKg) +

    kgAGramos(cantidadKg)

  );

}

module.exports = {

  kgAGramos,

  gramosAKg,

  hayStock,

  descontarStock,

  sumarStock

};