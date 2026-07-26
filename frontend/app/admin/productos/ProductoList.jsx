'use client';

import ProductoCard from './ProductoCard';
import EmptyState from '@/components/admin/common/EmptyState';

export default function ProductoList({

  productos = [],

  onEditar,

  onEliminar

}) {

  const productosOrdenados =

    [...productos].sort(

      (a, b) =>

        (a.orden || 0) -

        (b.orden || 0)

    );

  if (

    productosOrdenados.length === 0

  ) {

    return (

      <EmptyState

        mensaje="No hay productos registrados."

      />

    );

  }

  return (

    <>

      <div style={styles.info}>

        {productosOrdenados.length}

        {' '}productos

      </div>

      <div style={styles.grid}>

        {productosOrdenados.map(

          producto => (

            <ProductoCard

              key={producto._id}

              producto={producto}

              onEditar={

                onEditar

              }

              onEliminar={

                onEliminar

              }

            />

          )

        )}

      </div>

    </>

  );

}

const styles = {

  info: {

    marginBottom: 20,

    color: '#666',

    fontSize: 14,

    fontWeight: 500

  },

  grid: {

    display: 'grid',

    gridTemplateColumns:

      'repeat(auto-fill, minmax(340px,1fr))',

    gap: 20

  }

};