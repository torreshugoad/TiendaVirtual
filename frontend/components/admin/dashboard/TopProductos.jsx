'use client';

export default function TopProductos({

  productos = []

}) {

  if (productos.length === 0) {

    return (
      <p>
        No hay ventas registradas.
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
            {p[0]}
          </strong>

          <span>

            {p[1]} vendidos

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