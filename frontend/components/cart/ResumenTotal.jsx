import styles from './cart.module.css';

export default function ResumenTotal({ total, onFinalizar }) {
  return (
    <div className={styles.resumenCard}>
      <h2>Total: ${total}</h2>

      <button onClick={onFinalizar} className={styles.botonFinalizar}>
        Finalizar compra
      </button>
    </div>
  );
}
