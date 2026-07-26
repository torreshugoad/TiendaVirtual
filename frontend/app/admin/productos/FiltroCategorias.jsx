'use client';

export default function FiltroCategorias({

  categorias,

  categoriaSeleccionada,

  totalProductos,

  onChange

}) {

  return (

    <div style={styles.container}>

      <select

        value={categoriaSeleccionada}

        onChange={(e) =>

          onChange(e.target.value)

        }

        style={styles.select}

      >

        <option value="todas">

          Todas las categorías

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

      <span style={styles.total}>

        {totalProductos} productos

      </span>

    </div>

  );

}

const styles = {

  container: {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 20,

    gap: 15,

    flexWrap: 'wrap'

  },

  select: {

    padding: 10,

    borderRadius: 8,

    border: '1px solid #ddd',

    minWidth: 220

  },

  total: {

    color: '#666',

    fontWeight: 'bold'

  }

};