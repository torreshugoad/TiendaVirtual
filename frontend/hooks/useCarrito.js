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

  // ---- Agregar desde la página de producto ----
  function agregarAlCarrito(producto, variante) {
    // Promoción visible del producto (0 si no tiene descuento activo).
    const descuentoPorcentaje = Number(producto.descuento || 0);

    const precioOriginal = Number(variante.precio || 0);

    const precioConDescuento =
      descuentoPorcentaje > 0
        ? Math.round(
            precioOriginal - (precioOriginal * descuentoPorcentaje) / 100
          )
        : precioOriginal;

    setCarrito((prev) => {
      const existe = prev.find(
        (item) =>
          item.productoId === producto._id && item.peso === variante.peso
      );

      if (existe) {
        return prev.map((item) =>
          item.productoId === producto._id && item.peso === variante.peso
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: Number(item.precio) * (item.cantidad + 1)
              }
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
          // Precio final, ya con la promoción aplicada. Es el que se
          // muestra en el carrito y se manda como referencia al
          // checkout (el servidor lo vuelve a calcular igual).
          precio: precioConDescuento,
          precioOriginal,
          descuentoPorcentaje,
          cantidad: 1,
        },
      ];
    });
  }

  // ---- Gestión desde la página del carrito ----

  async function aumentarCantidad(index) {
    try {
      const item = carrito[index];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stock-producto`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productoId: item.productoId,
            peso: item.peso,
            carrito
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error obteniendo stock');
        return;
      }

      const stockDisponible = Number(data.stock);

      if (Number(item.cantidad) >= stockDisponible) {
        alert('Stock máximo alcanzado');
        return;
      }

      setCarrito((prev) =>
        prev.map((i, idx) => {
          if (idx !== index) return i;

          const nuevaCantidad = i.cantidad + 1;

          return {
            ...i,
            cantidad: nuevaCantidad,
            subtotal: Number(i.precio) * nuevaCantidad,
            stockDisponible
          };
        })
      );
    } catch (error) {
      console.error(error);
      alert('Error verificando stock');
    }
  }

  function disminuirCantidad(index) {
    setCarrito((prev) => {
      const item = prev[index];
      const nuevaCantidad = item.cantidad - 1;

      if (nuevaCantidad <= 0) {
        return prev.filter((_, idx) => idx !== index);
      }

      return prev.map((i, idx) =>
        idx === index
          ? {
              ...i,
              cantidad: nuevaCantidad,
              subtotal: Number(i.precio) * nuevaCantidad
            }
          : i
      );
    });
  }

  function eliminarProducto(index) {
    setCarrito((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function verificarStock() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verificar-stock`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carrito })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error verificando stock');
        return;
      }

      // Limpiamos el flag de una confirmación anterior, para que un
      // checkout nuevo no muestre por error la pantalla de "Pedido
      // confirmado" de la compra pasada.
      sessionStorage.removeItem('pedidoConfirmado');
      sessionStorage.removeItem('whatsappUrl');

      window.location.href = '/checkout';
    } catch (error) {
      console.error(error);
      alert('Error verificando stock');
    }
  }

  const cantidadCarrito = mounted
    ? carrito.reduce((acc, item) => acc + item.cantidad, 0)
    : 0;

  const total = carrito.reduce(
    (acc, item) => acc + Number(item.precio) * Number(item.cantidad),
    0
  );

  return {
    carrito,
    cantidadCarrito,
    total,
    agregarAlCarrito,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    verificarStock,
  };
}
