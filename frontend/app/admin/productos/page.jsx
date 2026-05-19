'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminProductos() {

  const router = useRouter();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [filtroCategoria, setFiltroCategoria] =
    useState('todas');

  const [editandoId, setEditandoId] =
    useState(null);

  const [formulario, setFormulario] =
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

    if (!file) return;

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

  const productosFiltrados =

    filtroCategoria === 'todas'

      ? productos

      : productos.filter(
          p =>
            p.categoria?._id ===
            filtroCategoria
        );

  return (

    <main style={styles.main}>

      <div style={styles.container}>

        <h1 style={styles.title}>
          Administración Productos
        </h1>

        {/* FORMULARIO */}

        <div style={styles.card}>

          <div style={styles.grid2}>

            <input
              name="nombre"
              placeholder="Nombre"
              value={formulario.nombre}
              onChange={handleChange}
              style={styles.input}
            />

            <select
              name="categoria"
              value={formulario.categoria}
              onChange={handleChange}
              style={styles.input}
            >

              <option value="">
                Categoría
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

          </div>

          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={formulario.descripcion}
            onChange={handleChange}
            style={styles.textarea}
          />

          <div style={styles.grid3}>

            <select
              name="tipoStock"
              value={formulario.tipoStock}
              onChange={handleChange}
              style={styles.input}
            >

              <option value="unidad">
                Unidad
              </option>

              <option value="granel">
                Granel
              </option>

            </select>

            {formulario.tipoStock ===
              'granel' && (

              <input
                name="stockGranelKg"
                type="number"
                placeholder="Stock Kg"
                value={
                  formulario.stockGranelKg
                }
                onChange={handleChange}
                style={styles.input}
              />

            )}

            <input
              type="file"
              onChange={subirImagen}
              style={styles.input}
            />

          </div>

          {formulario.foto && (

            <Image
              src={formulario.foto}
              alt="preview"
              width={70}
              height={70}
              style={styles.preview}
            />

          )}

          {/* VARIANTES */}

          <div style={styles.variantesHeader}>

            <h3 style={{
              margin: 0
            }}>
              Variantes
            </h3>

            <button
              onClick={agregarVariante}
              style={styles.addButton}
            >
              + Variante
            </button>

          </div>

          {formulario.variantes.map(
            (v, index) => (

            <div
              key={index}
              style={styles.varianteRow}
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
                style={styles.smallInput}
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
                style={styles.smallInput}
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
                  style={styles.smallInput}
                />

              ) : (

                <input
                  type="number"
                  step="0.01"
                  placeholder="Kg"
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
                  style={styles.smallInput}
                />

              )}

              <button
                onClick={() =>
                  eliminarVariante(index)
                }
                style={styles.deleteMini}
              >
                ✕
              </button>

            </div>

          ))}

          <button
            onClick={guardarProducto}
            style={styles.saveButton}
          >

            {editandoId
              ? 'Actualizar Producto'
              : 'Guardar Producto'}

          </button>

        </div>

        {/* FILTRO */}

        <div style={styles.filtrosBar}>

          <select
            value={filtroCategoria}
            onChange={(e) =>
              setFiltroCategoria(
                e.target.value
              )
            }
            style={styles.filtroSelect}
          >

            <option value="todas">
              Todas las categorías
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

          <span style={styles.totalProductos}>

            {productosFiltrados.length}
            {' '}
            productos

          </span>

        </div>

        {/* PRODUCTOS */}

        <div style={styles.productosGrid}>

          {productosFiltrados.map(producto => (

            <div
              key={producto._id}
              style={styles.productoCard}
            >

              <Image
                src={producto.foto}
                alt={producto.nombre}
                width={70}
                height={70}
                style={styles.productImage}
              />

              <div style={{
                flex: 1
              }}>

                <div style={styles.productTop}>

                  <h3 style={styles.productName}>
                    {producto.nombre}
                  </h3>

                  <span style={styles.badge}>
                    {producto.tipoStock}
                  </span>

                </div>

                <p style={styles.category}>
                  {
                    producto.categoria
                      ?.nombre
                  }
                </p>

                {producto.tipoStock ===
                  'granel' && (

                  <p style={{
                    fontSize: 12,
                    color: '#777',
                    marginTop: 4
                  }}>

                    Stock:
                    {' '}
                    {
                      producto.stockGranelKg
                    }
                    Kg

                  </p>

                )}

                <div style={
                  styles.variantesCompactas
                }>

                  {producto.variantes?.map(
                    (v, i) => (

                    <span
                      key={i}
                      style={
                        styles.varianteBadge
                      }
                    >

                      {v.peso}
                      {' · '}
                      $
                      {v.precio}

                      {producto.tipoStock ===
                      'unidad'
                        ? ` · ${v.stock}`
                        : ` · ${v.equivalenciaKg}Kg`}

                    </span>

                  ))}

                </div>

              </div>

              <div style={styles.actions}>

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
                  style={styles.editBtn}
                >

                  Editar

                </button>

                <button
                  onClick={() =>
                    eliminarProducto(
                      producto._id
                    )
                  }
                  style={styles.deleteBtn}
                >

                  Eliminar

                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}

const styles = {

  main: {
    background: '#f4f5f7',
    minHeight: '100vh',
    padding: 20,
    fontFamily: 'Arial'
  },

  container: {
    maxWidth: 1100,
    margin: '0 auto'
  },

  title: {
    marginBottom: 15,
    fontSize: 28
  },

  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.05)'
  },

  grid2: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr',
    gap: 10
  },

  grid3: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr 1fr',
    gap: 10,
    marginTop: 10
  },

  input: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 14
  },

  textarea: {
    width: '100%',
    minHeight: 80,
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    border: '1px solid #ddd',
    resize: 'vertical',
    fontSize: 14
  },

  preview: {
    marginTop: 10,
    borderRadius: 10,
    objectFit: 'cover'
  },

  variantesHeader: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10
  },

  varianteRow: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr 1fr 40px',
    gap: 8,
    marginBottom: 8
  },

  smallInput: {
    padding: 8,
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 13
  },

  addButton: {
    background: '#2196F3',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer'
  },

  deleteMini: {
    background: '#ff4d4d',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer'
  },

  saveButton: {
    width: '100%',
    marginTop: 15,
    background: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    cursor: 'pointer'
  },

  filtrosBar: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10
  },

  filtroSelect: {
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ddd',
    background: '#fff',
    minWidth: 220,
    fontSize: 14
  },

  totalProductos: {
    fontSize: 14,
    color: '#666'
  },

  productosGrid: {
    display: 'grid',
    gap: 12
  },

  productoCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    boxShadow:
      '0 2px 10px rgba(0,0,0,0.04)'
  },

  productImage: {
    borderRadius: 10,
    objectFit: 'cover'
  },

  productTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },

  productName: {
    margin: 0,
    fontSize: 18
  },

  category: {
    margin: '4px 0',
    color: '#666',
    fontSize: 13
  },

  badge: {
    background: '#eee',
    padding: '4px 8px',
    borderRadius: 999,
    fontSize: 12
  },

  variantesCompactas: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8
  },

  varianteBadge: {
    background: '#f1f1f1',
    padding: '5px 8px',
    borderRadius: 999,
    fontSize: 12
  },

  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },

  editBtn: {
    background: '#2196F3',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer'
  },

  deleteBtn: {
    background: '#ff4d4d',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer'
  }

};