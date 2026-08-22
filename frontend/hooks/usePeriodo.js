'use client';

import { useEffect, useState } from 'react';

function formatearYMD(fecha) {
  return fecha.toISOString().slice(0, 10);
}

function calcularRango(tipo) {
  const hoy = new Date();
  const fin = formatearYMD(hoy);

  const dias = tipo === 'mes' ? 30 : 7;
  const inicioDate = new Date(hoy);
  inicioDate.setDate(inicioDate.getDate() - dias);

  return {
    fechaInicio: formatearYMD(inicioDate),
    fechaFin: fin
  };
}

/**
 * Maneja el período seleccionado (tipo: 'semana' | 'mes' | 'personalizado').
 * Cuando tipo es 'semana' o 'mes', fechaInicio/fechaFin se recalculan automáticamente.
 * Si el usuario edita las fechas a mano, tipo pasa a 'personalizado'.
 */
export default function usePeriodo(tipoInicial = 'semana') {
  const [tipo, setTipo] = useState(tipoInicial);
  const [fechaInicio, setFechaInicioState] = useState(
    () => calcularRango(tipoInicial).fechaInicio
  );
  const [fechaFin, setFechaFinState] = useState(
    () => calcularRango(tipoInicial).fechaFin
  );

  useEffect(() => {
    if (tipo === 'personalizado') return;

    const rango = calcularRango(tipo);
    setFechaInicioState(rango.fechaInicio);
    setFechaFinState(rango.fechaFin);
  }, [tipo]);

  function setFechaInicio(valor) {
    setTipo('personalizado');
    setFechaInicioState(valor);
  }

  function setFechaFin(valor) {
    setTipo('personalizado');
    setFechaFinState(valor);
  }

  return {
    tipo,
    setTipo,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin
  };
}
