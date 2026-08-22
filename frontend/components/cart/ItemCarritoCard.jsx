import styles from './cart.module.css';

export default function ItemCarritoCard({
  item,
  index,
  onAumentar,
  onDisminuir,
  onEliminar
}) {
  return (
    <div className={styles.itemCard}>
      <div className={styles.itemInfo}>
        <h2 className={styles.itemNombre}>{item.nombre}</h2>
        <p>Variante: {item.peso}</p>
        <p>Precio unitario: ${item.precio}</p>

        <div className={styles.controlesCantidad}>
          <button
            onClick={() => onDisminuir(index)}
            className={styles.botonCantidad}
          >
            -
          </button>

          <strong>{item.cantidad}</strong>

          <button
            onClick={() => onAumentar(index)}
            className={styles.botonCantidad}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.itemResumen}>
        <h3>${Number(item.precio) * Number(item.cantidad)}</h3>

        <button
          onClick={() => onEliminar(index)}
          className={styles.botonEliminar}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
