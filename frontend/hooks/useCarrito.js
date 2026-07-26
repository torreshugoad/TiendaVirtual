'use client';

import { useEffect, useState } from 'react';

const CARRITO_KEY = 'carrito';

export default function useCarrito() {
  const [carrito, setCarrito] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Carga el carrito guardado una vez montado (evita mismatch de SSR)
  useEffect(() => {
    if (!mounted) return;

    const guardado = localStorage.getItem(CARRITO_KEY);

    if (guardado) {
      setCarrito(JSON.parse(guardado));
    }
  }, [mounted]);

  // Persiste cada cambio del carrito
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
  }, [carrito, mounted]);

  function agregarAlCarrito(producto, variante) {
    setCarrito((prev) => {
      const existe = prev.find(
        (item) =>
          item.productoId === producto._id && item.peso === variante.peso
      );

      if (existe) {
        return prev.map((item) =>
          item.productoId === producto._id && item.peso === variante.peso
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          _id: producto._id,
          productoId: String(producto._id),
          nombre: producto.nombre,
          foto: producto.foto,
          tipoStock: producto.tipoStock,
          peso: variante.peso,
          precio: variante.precio,
          cantidad: 1,
        },
      ];
    });
  }

  const cantidadCarrito = mounted
    ? carrito.reduce((acc, item) => acc + item.cantidad, 0)
    : 0;

  return {
    carrito,
    cantidadCarrito,
    agregarAlCarrito,
  };
}
