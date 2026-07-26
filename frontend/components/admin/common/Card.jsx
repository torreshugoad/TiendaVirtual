'use client';

export default function Card({

  children,

  style = {}

}) {

  return (

    <div

      style={{

        background: '#fff',

        borderRadius: 14,

        padding: 20,

        boxShadow:
          '0 2px 10px rgba(0,0,0,.08)',

        ...style

      }}

    >

      {children}

    </div>

  );

}