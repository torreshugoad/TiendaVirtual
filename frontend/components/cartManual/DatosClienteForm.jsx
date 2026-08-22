import styles from './cartManual.module.css';

export default function DatosClienteForm({
  nombre,
  setNombre,
  telefono,
  setTelefono,
  tipoEntrega,
  setTipoEntrega,
  direccion,
  setDireccion,
  error,
  guardando,
  confirmarPedido
}) {
  return (
    <div className={styles.card}>
      <label className={styles.label}>Datos del cliente</label>

      <input
        placeholder="Nombre"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        className={`${styles.input} ${styles.mb8}`}
      />

      <input
        placeholder="Teléfono"
        value={telefono}
        onChange={e => setTelefono(e.target.value)}
        className={`${styles.input} ${styles.mb8}`}
      />

      <select
        value={tipoEntrega}
        onChange={e => setTipoEntrega(e.target.value)}
        className={`${styles.input} ${styles.mb8}`}
      >
        <option value="retiro">Retiro en tienda</option>
        <option value="envio">Envío a domicilio</option>
      </select>

      {tipoEntrega === 'envio' && (
        <input
          placeholder="Dirección"
          value={direccion}
          onChange={e => setDireccion(e.target.value)}
          className={`${styles.input} ${styles.mb8}`}
        />
      )}

      {error && <p className={styles.errorTexto}>{error}</p>}

      <button
        onClick={confirmarPedido}
        disabled={guardando}
        className={`${styles.botonPrimario} ${styles.botonAncho}`}
      >
        {guardando ? 'Guardando...' : 'Registrar pedido'}
      </button>
    </div>
  );
}
