import PanelGranel from './PanelGranel';
import PanelCombo from './PanelCombo';
import PanelUnidad from './PanelUnidad';
import styles from './cartManual.module.css';

// Elige qué panel de carga mostrar según el tipo de stock del
// producto seleccionado, y agrupa el botón "Agregar al carrito"
// que es común a los tres casos.
export default function PanelProductoSeleccionado({ estado }) {
  const { esGranel, esCombo, puedeAgregar, agregarAlCarrito } = estado;

  return (
    <div className={styles.cardsRow}>
      {esGranel ? (
        <PanelGranel {...estado} />
      ) : esCombo ? (
        <PanelCombo {...estado} />
      ) : (
        <PanelUnidad {...estado} />
      )}

      <div className={`${styles.card} ${styles.cardCentrada}`}>
        <button
          onClick={agregarAlCarrito}
          disabled={!puedeAgregar}
          className={styles.botonPrimario}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
