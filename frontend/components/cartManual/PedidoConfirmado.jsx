import styles from './cartManual.module.css';

export default function PedidoConfirmado({ pedidoGuardado, nuevoPedido }) {
  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.confirmadoWrap}`}>
        <h2 className={styles.confirmadoTitulo}>Pedido registrado</h2>
        <p className={styles.confirmadoTexto}>
          Pedido #{pedidoGuardado.nropedido} guardado correctamente.
        </p>
        <button
          onClick={nuevoPedido}
          className={`${styles.botonPrimario} ${styles.confirmadoBoton}`}
        >
          Cargar otro pedido
        </button>
      </div>
    </div>
  );
}
