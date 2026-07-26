'use client';

export default function StockBajo({

  productos = []

}) {

  if (productos.length === 0) {

    return (

      <p>

        No hay alertas de stock.

      </p>

    );

  }

  return (

    <>

      {productos.map((p, index) => (

        <div
          key={index}
          style={styles.item}
        >

          <strong>
            {p.nombre}
          </strong>

          <span>

            Stock: {p.stock}

          </span>

        </div>

      ))}

    </>

  );

}

const styles = {

  item: {

    display: 'flex',

    justifyContent:
      'space-between',

    alignItems: 'center',

    padding: '12px 0',

    borderBottom:
      '1px solid #eee'

  }

};