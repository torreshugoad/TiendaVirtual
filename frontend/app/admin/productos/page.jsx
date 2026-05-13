'use client';

import {
  useEffect,
  useState
} from 'react';

import {
  useRouter
} from 'next/navigation';

import Image from 'next/image';

export default function AdminProductos() {

  const router =
    useRouter();

  const [productos,
    setProductos] =
    useState([]);

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

      foto: '',

      categoria: '',

      descripcion: '',

      tipoStock: 'unidad',

      stockGranelKg: 0,

      variantes: []

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

    obtenerProductos();

    obtenerCategorias();

  }, []);

  async function obtenerProductos() {

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/productos`
    );

    const data =
      await res.json();

    setProductos(data);
  }

  async function obtenerCategorias() {

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categorias`
    );

    const data =
      await res.json();

    setCategorias(data);
  }

  function handleChange(e) {

    setFormulario({

      ...formulario,

      [e.target.name]:
        e.target.value

    });
  }

  function agregarVariante() {

    setFormulario({

      ...formulario,

      variantes: [

        ...formulario.variantes,

        {

          peso: '',

          precio: '',

          stock: '',

          equivalenciaKg: ''

        }

      ]

    });
  }

  function actualizarVariante(
    index,
    campo,
    valor
  ) {

    const nuevas =
      [...formulario.variantes];

    nuevas[index][campo] =
      valor;

    setFormulario({

      ...formulario,

      variantes: nuevas

    });
  }

  function eliminarVariante(
    index
  ) {

    const nuevas =
      [...formulario.variantes];

    nuevas.splice(index, 1);

    setFormulario({

      ...formulario,

      variantes: nuevas

    });
  }

  async function subirImagen(e) {

    const file =
      e.target.files[0];

    const formData =
      new FormData();

    formData.append(
      'imagen',
      file
    );

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data =
      await res.json();

    setFormulario({

      ...formulario,

      foto:
        data.imageUrl

    });
  }

  async function guardarProducto() {

    if (editandoId) {

      await fetch(

        `${process.env.NEXT_PUBLIC_API_URL}/api/productos/${editandoId}`,

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/productos`,
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

      foto: '',

      categoria: '',

      descripcion: '',

      tipoStock: 'unidad',

      stockGranelKg: 0,

      variantes: []

    });

    setEditandoId(null);

    obtenerProductos();
  }

  async function eliminarProducto(id) {

    const confirmar =
      confirm(
        '¿Eliminar producto?'
      );

    if (!confirmar) return;

    await fetch(

      `${process.env.NEXT_PUBLIC_API_URL}/api/productos/${id}`,

      {
        method: 'DELETE'
      }

    );

    obtenerProductos();
  }

  return (

    <main style={{
      padding: 30,
      fontFamily: 'Arial',
      background: '#f7f7f7'
    }}>

      <h1>
        Administración Productos
      </h1>

      <div style={{
        background: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 30
      }}>

        <input
          name="nombre"
          placeholder="Nombre"
          value={formulario.nombre}
          onChange={handleChange}
          style={inputStyle}
        />

        <select
          name="categoria"
          value={formulario.categoria}
          onChange={handleChange}
          style={inputStyle}
        >

          <option value="">
            Seleccionar categoría
          </option>

          {categorias.map(c => (

            <option
              key={c._id}
              value={c._id}
            >

              {c.nombre}

            </option>

          ))}

        </select>

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

        <select
          name="tipoStock"
          value={formulario.tipoStock}
          onChange={handleChange}
          style={inputStyle}
        >

          <option value="unidad">
            Stock por unidad
          </option>

          <option value="granel">
            Stock a granel
          </option>

        </select>

        {formulario.tipoStock ===
          'granel' && (

          <input
            name="stockGranelKg"
            type="number"
            placeholder="Stock total Kg"
            value={
              formulario.stockGranelKg
            }
            onChange={handleChange}
            style={inputStyle}
          />

        )}

        <input
          type="file"
          onChange={subirImagen}
          style={inputStyle}
        />

        {formulario.foto && (

          <Image
            src={formulario.foto}
            alt="preview"
            width={120}
            height={120}
            style={{
              width: 120,
              height: 120,
              objectFit: 'cover',
              borderRadius: 10
            }}
          />

        )}

        <hr style={{
          margin: '20px 0'
        }} />

        <h2>
          Variantes
        </h2>

        {formulario.variantes.map(
          (v, index) => (

          <div
            key={index}
            style={{
              border: '1px solid #ddd',
              padding: 15,
              borderRadius: 10,
              marginBottom: 15
            }}
          >

            <input
              placeholder="Peso"
              value={v.peso}
              onChange={(e) =>
                actualizarVariante(
                  index,
                  'peso',
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Precio"
              value={v.precio}
              onChange={(e) =>
                actualizarVariante(
                  index,
                  'precio',
                  e.target.value
                )
              }
              style={inputStyle}
            />

            {formulario.tipoStock ===
            'unidad' ? (

              <input
                type="number"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) =>
                  actualizarVariante(
                    index,
                    'stock',
                    e.target.value
                  )
                }
                style={inputStyle}
              />

            ) : (

              <input
                type="number"
                step="0.01"
                placeholder="Equivalencia Kg"
                value={
                  v.equivalenciaKg
                }
                onChange={(e) =>
                  actualizarVariante(
                    index,
                    'equivalenciaKg',
                    e.target.value
                  )
                }
                style={inputStyle}
              />

            )}

            <button
              onClick={() =>
                eliminarVariante(index)
              }
              style={{
                background: '#ff4d4d',
                color: 'white',
                border: 'none',
                padding: 10,
                borderRadius: 8
              }}
            >

              Eliminar variante

            </button>

          </div>

        ))}

        <button
          onClick={agregarVariante}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: 12,
            borderRadius: 10,
            marginBottom: 20
          }}
        >

          Agregar variante

        </button>

        <button
          onClick={guardarProducto}
          style={{
            width: '100%',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: 16,
            borderRadius: 10,
            fontSize: 16
          }}
        >

          {editandoId
            ? 'Actualizar Producto'
            : 'Guardar Producto'}

        </button>

      </div>

      <div style={{
        display: 'grid',
        gap: 20
      }}>

        {productos.map(producto => (

          <div
            key={producto._id}
            style={{
              background: 'white',
              padding: 20,
              borderRadius: 12
            }}
          >

            <div style={{
              display: 'flex',
              gap: 20
            }}>

              <Image
                src={producto.foto}
                alt={producto.nombre}
                width={100}
                height={100}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  borderRadius: 10
                }}
              />

              <div style={{
                flex: 1
              }}>

                <h2>
                  {producto.nombre}
                </h2>

                <p>
                  {
                    producto.categoria
                      ?.nombre
                  }
                </p>

                <p>
                  Tipo:
                  {' '}
                  {producto.tipoStock}
                </p>

                {producto.tipoStock ===
                  'granel' && (

                  <p>

                    Stock Kg:
                    {' '}
                    {
                      producto.stockGranelKg
                    }

                  </p>

                )}

                <div>

                  {producto.variantes?.map(
                    (v, i) => (

                    <div key={i}>

                      <p>

                        {v.peso}
                        {' - '}
                        $
                        {v.precio}

                        {producto.tipoStock ===
                        'unidad'
                          ? ` - Stock ${v.stock}`
                          : ` - ${v.equivalenciaKg} Kg`}

                      </p>

                    </div>

                  ))}

                </div>

              </div>

              <div style={{
                display: 'flex',
                gap: 10
              }}>

                <button
                  onClick={() => {

                    setEditandoId(
                      producto._id
                    );

                    setFormulario({

                      nombre:
                        producto.nombre,

                      foto:
                        producto.foto,

                      categoria:
                        producto.categoria
                          ?._id,

                      descripcion:
                        producto.descripcion,

                      tipoStock:
                        producto.tipoStock,

                      stockGranelKg:
                        producto.stockGranelKg,

                      variantes:
                        producto.variantes || []

                    });

                    window.scrollTo({
                      top: 0,
                      behavior:
                        'smooth'
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
                    eliminarProducto(
                      producto._id
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