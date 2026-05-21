'use client';

import { useState }
from 'react';

import { useRouter }
from 'next/navigation';

export default function LoginPage() {

  const router = useRouter();

  const [usuario, setUsuario] =
    useState('');

  const [password, setPassword] =
    useState('');

  function login() {

    if (
      usuario === 'admin' &&
      password === '1234'
    ) {

      localStorage.setItem(
        'adminLogueado',
        'true'
      );

      router.push(
        '/admin'
      );

    } else {

      alert(
        'Usuario o contraseña incorrectos'
      );
    }
  }

  return (

    <main style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f7f7f7',
      fontFamily: 'Arial'
    }}>

      <div style={{
        background: 'white',
        padding: 40,
        borderRadius: 16,
        width: 350,
        boxShadow:
          '0 2px 15px rgba(0,0,0,0.1)'
      }}>

        <h1>
          Admin Login
        </h1>

        <input
          placeholder="Usuario"
          value={usuario}
          onChange={(e) =>
            setUsuario(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <button
          onClick={login}
          style={{
            width: '100%',
            padding: 14,
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: 16
          }}
        >

          Ingresar

        </button>

      </div>

    </main>
  );
}

const inputStyle = {

  width: '100%',

  padding: 12,

  marginBottom: 15,

  borderRadius: 8,

  border: '1px solid #ddd'

};