import Link from 'next/link';

import styles from './cart.module.css';

export default function CarritoVacio() {
  return (
    <div className={styles.vacioCard}>
      <h2>Tu carrito está vacío</h2>

      <Link href="/">
        <button className={styles.botonVerde}>Ver productos</button>
      </Link>
    </div>
  );
}
