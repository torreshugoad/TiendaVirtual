'use client';

export default function ProductosVendidosTable({

  productos = []

}) {

  return (

    <div style={styles.container}>

      <h2 style={styles.titulo}>

        Productos vendidos

      </h2>

      {productos.length === 0 ? (

        <div style={styles.empty}>

          No hay productos para mostrar.

        </div>

      ) : (

        <table style={styles.table}>

          <thead>

            <tr>

              <th style={styles.th}>
                Producto
              </th>

              <th style={styles.th}>
                Cantidad
              </th>

              <th style={styles.th}>
                Importe
              </th>

            </tr>

          </thead>

          <tbody>

            {productos.map((producto, index) => (

              <tr key={index}>

                <td style={styles.td}>
                  {producto.producto}
                </td>

                <td style={styles.td}>
                  {producto.cantidad}
                </td>

                <td style={styles.td}>

                  $

                  {producto.importe?.toFixed(2)}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>

  );

}

const styles = {

  container: {

    background: '#fff',

    borderRadius: 14,

    padding: 24,

    boxShadow:
      '0 2px 10px rgba(0,0,0,.08)'

  },

  titulo: {

    marginTop: 0,

    marginBottom: 20

  },

  empty: {

    padding: 30,

    textAlign: 'center',

    color: '#777'

  },

  table: {

    width: '100%',

    borderCollapse: 'collapse'

  },

  th: {

    padding: 14,

    textAlign: 'left',

    borderBottom:
      '2px solid #e5e7eb',

    background: '#f9fafb',

    fontWeight: 600

  },

  td: {

    padding: 14,

    borderBottom:
      '1px solid #eee'

  }

};