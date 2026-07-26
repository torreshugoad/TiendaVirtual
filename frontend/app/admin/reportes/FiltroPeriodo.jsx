'use client';

export default function FiltroPeriodo({

  tipo,

  setTipo,

  fechaInicio,

  setFechaInicio,

  fechaFin,

  setFechaFin,

  onExportar

}) {

  return (

    <div style={styles.container}>

      <div style={styles.left}>

        <select

          value={tipo}

          onChange={(e) =>

            setTipo(
              e.target.value
            )

          }

          style={styles.select}

        >

          <option value="semana">
            Última semana
          </option>

          <option value="mes">
            Último mes
          </option>

        </select>

      </div>

      <div style={styles.right}>

        <input

          type="date"

          value={fechaInicio}

          onChange={(e) =>

            setFechaInicio(
              e.target.value
            )

          }

          style={styles.input}

        />

        <input

          type="date"

          value={fechaFin}

          onChange={(e) =>

            setFechaFin(
              e.target.value
            )

          }

          style={styles.input}

        />

        <button

          onClick={onExportar}

          style={styles.button}

        >

          📄 Exportar Excel

        </button>

      </div>

    </div>

  );

}

const styles = {

  container: {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    flexWrap: 'wrap',

    gap: 20,

    marginBottom: 30

  },

  left: {

    display: 'flex',

    alignItems: 'center'

  },

  right: {

    display: 'flex',

    gap: 10,

    flexWrap: 'wrap',

    alignItems: 'center'

  },

  select: {

    padding: 10,

    borderRadius: 10,

    border: '1px solid #ddd',

    fontSize: 14

  },

  input: {

    padding: 10,

    borderRadius: 10,

    border: '1px solid #ddd',

    fontSize: 14

  },

  button: {

    background: '#16a34a',

    color: '#fff',

    border: 'none',

    borderRadius: 10,

    padding: '10px 18px',

    cursor: 'pointer',

    fontWeight: 600

  }

};