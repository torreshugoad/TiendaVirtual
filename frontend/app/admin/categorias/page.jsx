'use client';

import { useEffect, useState }
from 'react';

import { useRouter }
from 'next/navigation';

import Image from 'next/image';

export default function AdminCategorias() {

  const router = useRouter();

  const [categorias,
    setCategorias] =
    useState([]);

  const [editandoId,
    setEditandoId] =
    useState(null);

  const [formulario,
    setFormulario] =
    useState({

      nombre: '',
      imagen: '',
      descripcion: '',
      orden: 0,
      activa: true

    });

  useEffect(() => {

    const logueado =
      localStorage.getItem(
        'adminLogueado'
      );

    if (!logueado) {

      router.push(
        '/admin/login'
      );

      return;
    }

    obtenerCategorias();

  }, []);

  async function obtenerCategorias() {

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categorias`
    );

    const data = await res.json();

    setCategorias(data);
  }

  function handleChange(e) {

    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setFormulario({

      ...formulario,

      [name]:
        type === 'checkbox'
          ? checked
          : value

    });
  }

  async function subirImagen(e) {

    const file =
      e.target.files[0];

    if (!file) return;

    const formData =
      new FormData();

    formData.append(
      'imagen',
      file
    );

    const res = await fetch(
      '${process.env.NEXT_PUBLIC_API_URL}/api/upload',
      {
        method: 'POST',
        body: formData
      }
    );

    const data =
      await res.json();

    setFormulario(prev => ({

      ...prev,

      imagen:
        data.imageUrl

    }));
  }

  async function guardarCategoria() {

    if (editandoId) {

      await fetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/categorias/${editandoId}`,

        {

          method: 'PUT',

          headers: {

            'Content-Type':
              'application/json'

          },

          body: JSON.stringify(
            formulario
          )

        }

      );

    } else {

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categorias`,
        {

          method: 'POST',

          headers: {

            'Content-Type':
              'application/json'

          },

          body: JSON.stringify(
            formulario
          )

        }
      );

    }

    setFormulario({

      nombre: '',
      imagen: '',
      descripcion: '',
      orden: 0,
      activa: true

    });

    setEditandoId(null);

    obtenerCategorias();
  }

  async function eliminarCategoria(id) {

    const confirmar =
      confirm(
        '¿Eliminar categoría?'
      );

    if (!confirmar) return;

    await fetch(

      `${process.env.NEXT_PUBLIC_API_URL}/api/categorias/${id}`,

      {
        method: 'DELETE'
      }

    );

    obtenerCategorias();
  }

  return (

    <main style={{
      padding: 30,
      fontFamily: 'Arial',
      background: '#f7f7f7',
      minHeight: '100vh'
    }}>

      <div style={{
        display: 'flex',
        justifyContent:
          'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>

        <h1>
          Categorías
        </h1>

        <a href="/admin/productos">

          <button style={{
            padding: 10,
            borderRadius: 8,
            border: 'none'
          }}>

            Productos

          </button>

        </a>

      </div>

      <div style={{
        background: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 30
      }}>

        <h2>

          {editandoId
            ? 'Editar Categoría'
            : 'Nueva Categoría'}

        </h2>

        <input
          name="nombre"
          placeholder="Nombre"
          value={formulario.nombre}
          onChange={handleChange}
          style={inputStyle}
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={formulario.descripcion}
          onChange={handleChange}
          style={{
            ...inputStyle,
            minHeight: 100
          }}
        />

        <input
          name="orden"
          type="number"
          placeholder="Orden"
          value={formulario.orden}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={{
          display: 'block',
          marginBottom: 15
        }}>

          <input
            type="checkbox"
            name="activa"
            checked={formulario.activa}
            onChange={handleChange}
            style={{
              marginRight: 10
            }}
          />

          Categoría activa

        </label>

        <input
          type="file"
          onChange={subirImagen}
          style={inputStyle}
        />

        {formulario.imagen && (

          <Image
            src={formulario.imagen}
            alt="preview"
            width={120}
            height={120}
            style={{
              width: 120,
              height: 120,
              objectFit: 'cover',
              borderRadius: 10,
              marginBottom: 15
            }}
          />

        )}

        <button
          onClick={guardarCategoria}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: 15,
            borderRadius: 10,
            width: '100%',
            cursor: 'pointer'
          }}
        >

          {editandoId
            ? 'Actualizar Categoría'
            : 'Guardar Categoría'}

        </button>

      </div>

      <div style={{
        display: 'grid',
        gap: 20
      }}>

        {categorias.map(categoria => (

          <div
            key={categoria._id}
            style={{
              background: 'white',
              padding: 20,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 20
            }}
          >

            {categoria.imagen && (

              <Image
                src={categoria.imagen}
                alt={categoria.nombre}
                width={80}
                height={80}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 10
                }}
              />

            )}

            <div style={{
              flex: 1
            }}>

              <h2>
                {categoria.nombre}
              </h2>

              <p>
                {categoria.descripcion}
              </p>

              <p>
                Orden:
                {' '}
                {categoria.orden}
              </p>

              <p>

                {categoria.activa
                  ? 'Activa'
                  : 'Inactiva'}

              </p>

            </div>

            <div style={{
              display: 'flex',
              gap: 10
            }}>

              <button
                onClick={() => {

                  setEditandoId(
                    categoria._id
                  );

                  setFormulario({

                    nombre:
                      categoria.nombre,

                    imagen:
                      categoria.imagen,

                    descripcion:
                      categoria.descripcion,

                    orden:
                      categoria.orden,

                    activa:
                      categoria.activa

                  });

                }}
                style={{
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  padding: 10,
                  borderRadius: 8
                }}
              >

                Editar

              </button>

              <button
                onClick={() =>
                  eliminarCategoria(
                    categoria._id
                  )
                }
                style={{
                  background: '#ff4d4d',
                  color: 'white',
                  border: 'none',
                  padding: 10,
                  borderRadius: 8
                }}
              >

                Eliminar

              </button>

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}

const inputStyle = {

  width: '100%',

  padding: 12,

  marginBottom: 10,

  borderRadius: 8,

  border: '1px solid #ddd'

};