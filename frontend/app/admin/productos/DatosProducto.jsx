'use client';

export default function DatosProducto({

  formulario,

  categorias = [],

  handleChange

}) {

  return (

    <div style={styles.container}>

      <div style={styles.grid}>

        <div>

          <label style={styles.label}>

            Nombre

          </label>

          <input

            style={styles.input}

            type="text"

            name="nombre"

            value={formulario.nombre}

            onChange={handleChange}

            placeholder="Nombre del producto"

          />

        </div>

        <div>

          <label style={styles.label}>

            Categoría

          </label>

          <select

            style={styles.input}

            name="categoria"

            value={formulario.categoria}

            onChange={handleChange}

          >

            <option value="">

              Seleccione una categoría

            </option>

            {categorias.map(categoria => (

              <option

                key={categoria._id}

                value={categoria._id}

              >

                {categoria.nombre}

              </option>

            ))}

          </select>

        </div>

      </div>

      <div>

        <label style={styles.label}>

          Descripción

        </label>

        <textarea

          style={styles.textarea}

          rows={4}

          name="descripcion"

          value={formulario.descripcion}

          onChange={handleChange}

          placeholder="Descripción del producto"

        />

        </div>

        <div

          style={{

            display: 'flex',

            alignItems: 'center',

            gap: 8,

            marginTop: 22

          }}

        >

          <input

            type="checkbox"

            name="activo"

            checked={formulario.activo ?? true}

            onChange={handleChange}

          />

          <label style={styles.label}>

            Activo (visible en el catálogo)

          </label>

        </div>

      <div style={styles.grid}>

        <div>

          <label style={styles.label}>

            Orden

          </label>

          <input

            style={styles.input}

            type="number"

            name="orden"

            value={formulario.orden}

            onChange={handleChange}

          />

        </div>

        <div>

          <label style={styles.label}>

            Tipo de stock

          </label>

          <select

            style={styles.input}

            name="tipoStock"

            value={formulario.tipoStock}

            onChange={handleChange}

          >

            <option value="unidad">

              Por unidad

            </option>

            <option value="granel">

              A granel

            </option>

            <option value="combo">

              Combo

            </option>

          </select>

        </div>

      </div>

      {formulario.tipoStock === 'granel' && (

        <div style={styles.grid}>

          <div>

            <label style={styles.label}>

              Stock disponible (Kg)

            </label>

<input

  style={styles.input}

  type="number"

  step="0.01"

  name="stockGranel"

  value={formulario.stockGranel ?? 0}

  onChange={handleChange}

/>

          </div>

          <div>

            <label style={styles.label}>

              Stock mínimo (alerta de bajo stock, en Kg)

            </label>

            <input

              style={styles.input}

              type="number"

              step="0.01"

              name="stockMinimoGranel"

              value={formulario.stockMinimoGranel ?? 2}

              onChange={handleChange}

            />

          </div>

        </div>

      )}

      {formulario.tipoStock === 'combo' && (

        <div>

          <label style={styles.label}>

            Precio del combo (oferta)

          </label>

          <input

            style={styles.input}

            type="number"

            step="1"

            min="0"

            name="precioCombo"

            value={formulario.precioCombo ?? 0}

            onChange={handleChange}

          />

        </div>

      )}

    </div>

  );

}

const styles = {

  container: {

    display: 'flex',

    flexDirection: 'column',

    gap: 20

  },

  grid: {

    display: 'grid',

    gridTemplateColumns:

      'repeat(auto-fit, minmax(250px,1fr))',

    gap: 20

  },

  label: {

    display: 'block',

    marginBottom: 6,

    fontWeight: 600,

    fontSize: 14

  },

  input: {

    width: '100%',

    padding: 10,

    borderRadius: 8,

    border: '1px solid #d1d5db',

    fontSize: 14,

    boxSizing: 'border-box'

  },

  textarea: {

    width: '100%',

    padding: 10,

    borderRadius: 8,

    border: '1px solid #d1d5db',

    fontSize: 14,

    resize: 'vertical',

    boxSizing: 'border-box'

  }

};