'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function CambiarPasswordPage() {
  const router = useRouter();

  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [loading, setLoading] = useState(false);

  async function cambiarPassword(e) {
    e.preventDefault();
    setError('');
    setExito('');

    if (passwordNueva !== confirmarPassword) {
      setError('La nueva contraseña y su confirmación no coinciden');
      return;
    }

    if (passwordNueva.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/cambiar-password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            passwordActual,
            passwordNueva,
          }),
        }
      );

      if (!res) return;

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.mensaje || 'No se pudo cambiar la contraseña');
        setLoading(false);
        return;
      }

      setExito('Contraseña actualizada correctamente');
      setPasswordActual('');
      setPasswordNueva('');
      setConfirmarPassword('');
    } catch (err) {
      console.error(err);
      setError('No fue posible conectarse al servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <form onSubmit={cambiarPassword} style={styles.form}>
        <h2>Cambiar contraseña</h2>

        <input
          type="password"
          placeholder="Contraseña actual"
          value={passwordActual}
          onChange={(e) => setPasswordActual(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Contraseña nueva"
          value={passwordNueva}
          onChange={(e) => setPasswordNueva(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Confirmar contraseña nueva"
          value={confirmarPassword}
          onChange={(e) => setConfirmarPassword(e.target.value)}
          style={styles.input}
        />

        {error && <div style={styles.error}>{error}</div>}
        {exito && <div style={styles.exito}>{exito}</div>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin')}
          style={styles.botonVolver}
        >
          Volver al panel
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
    background: '#f5f7fa',
  },
  form: {
    width: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 32,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,.08)',
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid #d1d5db',
  },
  button: {
    padding: 12,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 600,
  },
  botonVolver: {
    padding: 12,
    border: '1px solid #d1d5db',
    borderRadius: 8,
    cursor: 'pointer',
    background: '#fff',
    color: '#374151',
    fontWeight: 600,
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
  },
  exito: {
    color: '#16a34a',
    fontSize: 14,
  },
};
