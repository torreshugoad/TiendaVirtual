'use client';

export default function Loading({

  texto = 'Cargando...'

}) {

  return (

    <div

      style={{

        padding: 50,

        textAlign: 'center',

        color: '#666'

      }}

    >

      {texto}

    </div>

  );

}