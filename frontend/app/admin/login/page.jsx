'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

export default function LoginPage() {

  const router =
    useRouter();

  const [

    usuario,

    setUsuario

  ] = useState('');

  const [

    password,

    setPassword

  ] = useState('');

  const [

    error,

    setError

  ] = useState('');

  const [

    loading,

    setLoading

  ] = useState(false);

  async function login(e) {

    e.preventDefault();

    setError('');

    setLoading(true);

    try {

      const res = await fetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`,

        {

          method: 'POST',

          headers: {

            'Content-Type':

              'application/json'

          },

          body: JSON.stringify({

            usuario,

            password

          })

        }

      );

      const data =
        await res.json();

      if (!res.ok || !data.ok) {

        setError(

          data.mensaje ||

          'Credenciales incorrectas'

        );

        setLoading(false);

        return;

      }

      localStorage.setItem(

        'token',

        data.token

      );

      localStorage.setItem(

        'adminLogueado',

        'true'

      );

      router.replace(

        '/admin'

      );

    } catch (err) {

      console.error(err);

      setError(

        'No fue posible conectarse al servidor.'

      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <main style={styles.main}>

      <form

        onSubmit={login}

        style={styles.form}

      >

        <h2>

          Panel de Administración

        </h2>

        <input

          placeholder="Usuario"

          value={usuario}

          onChange={e =>

            setUsuario(

              e.target.value

            )

          }

          style={styles.input}

        />

        <input

          type="password"

          placeholder="Contraseña"

          value={password}

          onChange={e =>

            setPassword(

              e.target.value

            )

          }

          style={styles.input}

        />

        {

          error &&

          (

            <div style={styles.error}>

              {error}

            </div>

          )

        }

        <button

          type="submit"

          disabled={loading}

          style={styles.button}

        >

          {

            loading

              ? 'Ingresando...'

              : 'Ingresar'

          }

        </button>

      </form>

    </main>

  );

}

const styles = {

  main: {

    minHeight: '100vh',

    display: 'flex',

    justifyContent: 'center',

    alignItems: 'center',

    background: '#f5f7fa'

  },

  form: {

    width: 360,

    display: 'flex',

    flexDirection: 'column',

    gap: 16,

    padding: 32,

    background: '#fff',

    borderRadius: 12,

    boxShadow:
      '0 2px 12px rgba(0,0,0,.08)'

  },

  input: {

    padding: 12,

    borderRadius: 8,

    border: '1px solid #d1d5db'

  },

  button: {

    padding: 12,

    border: 'none',

    borderRadius: 8,

    cursor: 'pointer',

    background: '#2563eb',

    color: '#fff',

    fontWeight: 600

  },

  error: {

    color: '#dc2626',

    fontSize: 14

  }

};