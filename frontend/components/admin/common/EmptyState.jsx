'use client';

export default function EmptyState({

  mensaje

}) {

  return (

    <div

      style={{

        padding: 40,

        textAlign: 'center',

        color: '#777'

      }}

    >

      {mensaje}

    </div>

  );

}