import Link from 'next/link';

import styles from './cart.module.css';

export default function HeaderCarrito() {
  return (
    <div className={styles.header}>
      <h1 className={styles.titulo}>Mi carrito</h1>

      <Link href="/">
        <button className={styles.botonOscuro}>Seguir comprando</button>
      </Link>
    </div>
  );
}
