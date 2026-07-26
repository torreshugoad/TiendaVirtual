'use client';

import Button from '@/components/admin/common/Button';

export default function ProductoCard({

  producto,

  onEditar,

  onEliminar

}) {

  const {

    nombre,

    foto,

    categoria,

    tipoStock,
    stockMinimoGranel,
    stockMinimo,
    variantes = [],

    orden

  } = producto;

  const nombreCategoria =

    typeof categoria === 'object'

      ? categoria?.nombre

      : categoria;

const stockTexto =

  tipoStock === 'granel'

    ? `${((producto.stockGranel || 0) / 1000).toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3
      })} Kg`

    : tipoStock === 'combo'

    ? null

    : `${variantes.reduce(
        (total, v) => total + Number(v.stock || 0),
        0
      )} unidades`;

const stockMinimoTexto =

  tipoStock === 'granel'

    ? `${((producto.stockMinimoGranel || 0) / 1000).toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3
      })} Kg`

    : null;


  return (

    <div style={styles.card}>

      {/* ===========================
          CABECERA
      =========================== */}

      <div style={styles.header}>

        <div style={styles.nombre}>

          {nombre}

        </div>

        <div style={styles.orden}>

          Orden: <b>{orden ?? 0}</b>

        </div>

      </div>

      {/* ===========================
          CUERPO
      =========================== */}

      <div style={styles.body}>

        {/* FOTO */}

        <div style={styles.colFoto}>

          {

            foto

              ?

              <img

                src={foto}

                alt={nombre}

                style={styles.imagen}

              />

              :

              <div style={styles.sinImagen}>

                📦

              </div>

          }

        </div>

        {/* DATOS */}

        <div style={styles.colDatos}>

          <div style={styles.linea}>

            <b>Categoría:</b>

            {' '}

            {nombreCategoria || 'Sin categoría'}

          </div>

          <div style={styles.linea}>

            <b>Tipo:</b>

            {' '}

            <span

              style={

                tipoStock === 'granel'

                  ?

                  styles.granel

                  :

                  tipoStock === 'combo'

                  ?

                  styles.combo

                  :

                  styles.unidad

              }

            >

              {

                tipoStock === 'granel'

                  ? 'Granel'

                  : tipoStock === 'combo'

                  ? 'Combo'

                  : 'Unidad'

              }

            </span>

<div style={styles.linea}>

  <b>Stock:</b>

  {' '}

  {

    tipoStock === 'combo'

      ?

      <span style={styles.stock}>

        Precio combo: ${Number(producto.precioCombo || 0).toLocaleString('es-AR')}

      </span>

      :

      <span style={styles.stock}>

        {stockTexto}

        {

          stockMinimoTexto &&

          ` (Mínimo: ${stockMinimoTexto})`

        }

      </span>

  }

</div>

          </div>

          <table style={styles.tabla}>

            <thead>

              <tr>

                <th>

                  Variante

                </th>

                <th>

                  Equiv.

                </th>

                {

                  tipoStock !== 'granel' && (

                    <>

                      <th>

                        Stock

                      </th>

                      <th>

                        Mín.

                      </th>

                    </>

                  )

                }

                <th

                  style={{

                    textAlign: 'right'

                  }}

                >

                  Precio

                </th>

              </tr>

            </thead>

            <tbody>

              {

                variantes.map(

                  (v, index) => (

                    <tr key={index}>

                      <td>

                        {v.peso}

                      </td>

                      <td>

                        {v.equivalencia} g

                      </td>

                      {

                        tipoStock !== 'granel' && (

                          <>

                            <td>

                              {v.stock ?? 0}

                            </td>

                            <td>

                              {v.stockMinimo ?? 0}

                            </td>

                          </>

                        )

                      }

                      <td

                        style={{

                          textAlign: 'right',

                          fontWeight: 600

                        }}

                      >

                        $

                        {

                          Number(

                            v.precio

                          ).toLocaleString(

                            'es-AR'

                          )

                        }

                      </td>

                    </tr>

                  )

                )

              }

            </tbody>

          </table>

        </div>

      </div>

      {/* ===========================
          BOTONES
      =========================== */}

      <div style={styles.footer}>

        <Button

          variant="success"

          onClick={() =>

            onEditar(producto)

          }

        >

          Editar

        </Button>

        <Button

          variant="danger"

          onClick={() =>

            onEliminar(

              producto._id

            )

          }

        >

          Eliminar

        </Button>

      </div>

    </div>

  );

}

const styles = {

  card: {

    background: '#fff',

    border: '1px solid #dbe3eb',

    borderRadius: 12,

    marginBottom: 18,

    overflow: 'hidden',

    boxShadow:

      '0 2px 8px rgba(0,0,0,.06)'

  },

  header: {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    padding: '14px 18px',

    background: '#f8fafc',

    borderBottom:

      '1px solid #e5e7eb'

  },

  nombre: {

    fontSize: 20,

    fontWeight: 700,

    color: '#111827'

  },

  orden: {

    color: '#6b7280',

    fontSize: 14

  },

  body: {

    display: 'flex',

    gap: 20,

    padding: 18

  },

  colFoto: {

    width: 90,

    minWidth: 90

  },

  imagen: {

    width: 90,

    height: 90,

    borderRadius: 10,

    objectFit: 'cover',

    border: '1px solid #ddd'

  },

  sinImagen: {

    width: 90,

    height: 90,

    background: '#f3f4f6',

    display: 'flex',

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 10,

    fontSize: 32

  },

  colDatos: {

    flex: 1

  },

  linea: {

    marginBottom: 10,

    fontSize: 15,

    color: '#374151'

  },

  granel: {

    padding: '4px 10px',

    borderRadius: 20,

    background: '#ede9fe',

    color: '#6d28d9',

    fontWeight: 600

  },

  unidad: {

    padding: '4px 10px',

    borderRadius: 20,

    background: '#dcfce7',

    color: '#166534',

    fontWeight: 600

  },

  combo: {

    padding: '4px 10px',

    borderRadius: 20,

    background: '#fef3c7',

    color: '#92400e',

    fontWeight: 600

  },

  tabla: {

    width: '100%',

    marginTop: 15,

    borderCollapse: 'collapse',

    fontSize: 14

  },

  footer: {

    display: 'flex',

    justifyContent: 'space-between',

    padding: 16,

    background: '#fafafa',

    borderTop:

      '1px solid #e5e7eb'

  }

};