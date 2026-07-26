'use client';

import Button from '@/components/admin/common/Button';

/* ==========================
   Convierte el texto del peso
   a gramos enteros.
========================== */

function calcularEquivalencia(peso) {

  if (!peso) return 0;

  const texto =

    peso
      .toLowerCase()
      .replace(',', '.')
      .replace(/\s/g, '');

  if (texto.endsWith('kg')) {

    return Math.round(

      parseFloat(

        texto.replace('kg', '')

      ) * 1000

    );

  }

  if (texto.endsWith('gr')) {

    return Math.round(

      parseFloat(

        texto.replace('gr', '')

      )

    );

  }

  return 0;

}

export default function VariantesEditor({

  tipoStock,

  variantes,

  onAgregar,

  onActualizar,

  onEliminar

}) {

  function cambiarPeso(index, valor) {

    onActualizar(index, {

      peso: valor,

      equivalencia: calcularEquivalencia(valor)

    });

  }

  function cambiarPrecio(index, valor) {

    onActualizar(index, {

      precio:

        valor === ''

          ? ''

          : Number(valor)

    });

  }

  function cambiarStock(index, valor) {

    onActualizar(index, {

      stock:

        valor === ''

          ? ''

          : Number(valor)

    });

  }

  function cambiarStockMinimo(index, valor) {

    onActualizar(index, {

      stockMinimo:

        valor === ''

          ? ''

          : Number(valor)

    });

  }

  return (

    <div style={styles.container}>

      <div style={styles.header}>

        <h3>Variantes</h3>

        <Button onClick={onAgregar}>

          + Agregar

        </Button>

      </div>

      {

        variantes.map((v, index) => (

          <div

            key={index}

            style={styles.fila}

          >

            <input

              placeholder="Peso"

              value={v.peso ?? ''}

              onChange={(e) =>

                cambiarPeso(

                  index,

                  e.target.value

                )

              }

              style={styles.inputPeso}

            />

            <input

              type="number"

              placeholder="Precio"

              value={v.precio ?? ''}

              onChange={(e) =>

                cambiarPrecio(

                  index,

                  e.target.value

                )

              }

              style={styles.inputNumero}

            />

            {

              tipoStock !== 'granel' && (

                <>

                  <input

                    type="number"

                    placeholder="Stock"

                    value={v.stock ?? ''}

                    onChange={(e) =>

                      cambiarStock(

                        index,

                        e.target.value

                      )

                    }

                    style={styles.inputNumero}

                  />

                  <input

                    type="number"

                    placeholder="Stock mínimo"

                    value={v.stockMinimo ?? ''}

                    onChange={(e) =>

                      cambiarStockMinimo(

                        index,

                        e.target.value

                      )

                    }

                    style={styles.inputNumero}

                  />

                </>

              )

            }

            <Button

              variant="danger"

              onClick={() =>

                onEliminar(index)

              }

            >

              Eliminar

            </Button>

          </div>

        ))

      }

    </div>

  );

}

const styles = {

  container: {

    marginTop: 30

  },

  header: {

    display: 'flex',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 20

  },

  fila: {

    display: 'flex',

    gap: 10,

    marginBottom: 10,

    flexWrap: 'wrap'

  },

  inputPeso: {

    flex: 2,

    minWidth: 140,

    padding: 8

  },

  inputNumero: {

    flex: 1,

    minWidth: 100,

    padding: 8

  }

};