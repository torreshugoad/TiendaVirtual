'use client';

import useCarrito from '@/hooks/useCarrito';

import HeaderCarrito from '@/components/cart/HeaderCarrito';
import CarritoVacio from '@/components/cart/CarritoVacio';
import ItemCarritoCard from '@/components/cart/ItemCarritoCard';
import ResumenTotal from '@/components/cart/ResumenTotal';

import styles from '@/components/cart/cart.module.css';

export default function CartPage() {
  const {
    carrito,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    verificarStock,
    total
  } = useCarrito();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <HeaderCarrito />

        {carrito.length === 0 ? (
          <CarritoVacio />
        ) : (
          <>
            {carrito.map((item, index) => (
              <ItemCarritoCard
                key={index}
                item={item}
                index={index}
                onAumentar={aumentarCantidad}
                onDisminuir={disminuirCantidad}
                onEliminar={eliminarProducto}
              />
            ))}

            <ResumenTotal total={total} onFinalizar={verificarStock} />
          </>
        )}
      </div>
    </div>
  );
}
