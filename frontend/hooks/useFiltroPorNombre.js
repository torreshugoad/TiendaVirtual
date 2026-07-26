'use client';

import { useMemo } from 'react';
import { normalizarTexto } from '@/lib/normalizarTexto';

export default function useFiltroPorNombre(items, termino, campo = 'nombre') {
  return useMemo(() => {
    const buscado = normalizarTexto(termino.trim());

    if (!buscado) return items;

    return items.filter((item) =>
      normalizarTexto(item[campo] || '').includes(buscado)
    );
  }, [items, termino, campo]);
}