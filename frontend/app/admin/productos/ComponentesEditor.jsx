'use client';

import Button from '@/components/admin/common/Button';

export default function ComponentesEditor({

  componentes,
  productos,
  productoIdActual,
  onAgregar,
  onActualizar,
  onEliminar

}) {

  // Solo tiene sentido armar combos con productos a granel
  // (se descuenta un peso fijo de cada uno), y nunca con el
  // producto que se está editando en este momento.

  const productosDisponibles =

    (productos || []).filter(p =>

      p.tipoStock === 'granel' &&

      p._id !== productoIdActual
    );

  function cambiarProducto(index, valor) {

    onActualizar(index, {
      productoId: valor
    });
  }

  function cambiarCantidad(index, valor) {

    onActualizar(index, {
      cantidadGramos:
        valor === '' ? '' : Number(valor)
    });
  }

  return (

    <div style={styles.container}>

      <div style={styles.header}>
        <h3>Componentes del combo</h3>
        <Button onClick={onAgregar}>
          + Agregar
        </Button>
      </div>

      {

        productosDisponibles.length === 0 && (

          <p style={styles.aviso}>
            No hay productos a granel disponibles para armar un combo.
            Cargá primero los productos base (ej. Avena, Semillas, etc.)
            como productos a granel.
          </p>
        )
      }

      {

        componentes.map((c, index) => (

          <div key={index} style={styles.fila}>

            <select
              value={c.productoId ?? ''}
              onChange={(e) =>
                cambiarProducto(index, e.target.value)
              }
              style={styles.inputProducto}
            >

              <option value="">
                Seleccioná un producto...
              </option>

              {

                productosDisponibles.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.nombre}
                  </option>
                ))
              }

            </select>

            <input
              type="number"
              step="1"
              min="0"
              placeholder="Gramos"
              value={c.cantidadGramos ?? ''}
              onChange={(e) =>
                cambiarCantidad(index, e.target.value)
              }
              style={styles.inputNumero}
            />

            <span style={styles.unidad}>Gr</span>

            <Button
              variant="danger"
              onClick={() => onEliminar(index)}
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

  aviso: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 10
  },

  fila: {
    display: 'flex',
    gap: 10,
    marginBottom: 10,
    alignItems: 'center',
    flexWrap: 'wrap'
  },

  inputProducto: {
    flex: 2,
    minWidth: 180,
    padding: 8
  },

  inputNumero: {
    flex: 1,
    minWidth: 90,
    padding: 8
  },

  unidad: {
    color: '#6b7280',
    fontSize: 13
  }

};
