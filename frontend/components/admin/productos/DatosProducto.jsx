'use client';

import styles from './DatosProducto.module.css';

export default function DatosProducto({
  formulario = {},
  categorias = [],
  handleChange
}) {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            className={styles.inputBase}
            type="text"
            name="nombre"
            value={formulario?.nombre ?? ''}
            onChange={handleChange}
            placeholder="Nombre del producto"
          />
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="categoria">
            Categoría
          </label>
          <select
            id="categoria"
            className={styles.selectBase}
            name="categoria"
            value={formulario?.categoria ?? ''}
            onChange={handleChange}
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria._id} value={categoria._id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.campo}>
        <label className={styles.label} htmlFor="descripcion">
          Descripción
        </label>
        <textarea
          id="descripcion"
          className={styles.textarea}
          rows={3}
          name="descripcion"
          value={formulario?.descripcion ?? ''}
          onChange={handleChange}
          placeholder="Descripción del producto"
        />
      </div>

      <div className={styles.checkboxContainer}>
        <input
          id="activo"
          type="checkbox"
          name="activo"
          checked={formulario?.activo ?? true}
          onChange={handleChange}
          className={styles.checkbox}
        />
        <label htmlFor="activo" className={styles.checkboxLabel}>
          Activo (visible en el catálogo)
        </label>
      </div>

      <div className={styles.grid}>
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="orden">
            Orden
          </label>
          <input
            id="orden"
            className={styles.inputBase}
            type="number"
            name="orden"
            value={formulario?.orden ?? ''}
            onChange={handleChange}
          />
        </div>

        <div className={styles.campo}>
          <label className={styles.label} htmlFor="tipoStock">
            Tipo de stock
          </label>
          <select
            id="tipoStock"
            className={styles.selectBase}
            name="tipoStock"
            value={formulario?.tipoStock ?? 'unidad'}
            onChange={handleChange}
          >
            <option value="unidad">Por unidad</option>
            <option value="granel">A granel</option>
            <option value="combo">Combo</option>
          </select>
        </div>
      </div>

      <div className={styles.campo}>
        <label className={styles.label} htmlFor="descuento">
          Descuento promocional (%)
        </label>
        <input
          id="descuento"
          className={styles.inputBase}
          type="number"
          step="1"
          min="0"
          max="100"
          name="descuento"
          value={formulario?.descuento ?? 0}
          onChange={handleChange}
          placeholder="0"
        />
        <small className={styles.ayuda}>
          Se muestra al cliente en la tienda (precio tachado + % de descuento). Dejar en 0 para no aplicar promoción.
        </small>
      </div>

      {formulario?.tipoStock === 'granel' && (
        <div className={styles.grid}>
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="stockGranel">
              Stock disponible (Kg)
            </label>
            <input
              id="stockGranel"
              className={styles.inputBase}
              type="number"
              step="0.1"
              name="stockGranel"
              value={formulario?.stockGranel ?? 0}
              onChange={handleChange}
            />
          </div>

          <div className={styles.campo}>
            <label className={styles.label} htmlFor="stockMinimoGranel">
              Stock mínimo (alerta bajo stock, Kg)
            </label>
            <input
              id="stockMinimoGranel"
              className={styles.inputBase}
              type="number"
              step="0.1"
              name="stockMinimoGranel"
              value={formulario?.stockMinimoGranel ?? 2}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      {formulario?.tipoStock === 'combo' && (
        <div className={styles.campo}>
          <label className={styles.label} htmlFor="precioCombo">
            Precio del combo (oferta)
          </label>
          <input
            id="precioCombo"
            className={styles.inputBase}
            type="number"
            step="1"
            min="0"
            name="precioCombo"
            value={formulario?.precioCombo ?? 0}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
}