'use client';

export const dynamic = 'force-dynamic';

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
orden: 0,
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
  `${process.env.NEXT_PUBLIC_API_URL}/api/productos`,
  {
    cache: 'no-store'
  }
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
  orden: 0,
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

    <div style={styles.card}>

      <div style={styles.grid3}>

  <input
    name="nombre"
    placeholder="Nombre"
    value={formulario.nombre}
    onChange={handleChange}
    style={styles.input}
  />

  <input
    name="orden"
    type="number"
    placeholder="Orden"
    value={formulario.orden}
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

<div style={styles.filaCompacta}>

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

  {formulario.foto && (

    <Image
      src={formulario.foto}
      alt="preview"
      width={45}
      height={45}
      style={styles.preview}
    />

  )}

</div>

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

<div style={styles.tablaHeader}>

  <span>Peso</span>

  <span>Precio</span>

  <span>
    {formulario.tipoStock ===
    'unidad'
      ? 'Stock'
      : 'Kg'}
  </span>

  <span></span>

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

<div style={styles.productosGrid}>

  {productosFiltrados.map(
    producto => (
<div
  key={producto._id}
  style={styles.productoCard}
>

  <Image
    src={producto.foto}
    alt={producto.nombre}
    width={55}
    height={55}
    style={styles.productImage}
  />

  <div style={{ flex: 1 }}>

    <div style={styles.productTop}>

      <h3 style={styles.productName}>
        {producto.nombre}
      </h3>

      <span style={styles.badge}>
        {producto.tipoStock}
      </span>

      <span style={styles.ordenBadge}>
        #{producto.orden || 0}
      </span>

    </div>

    <p style={styles.category}>
      {producto.categoria?.nombre}
    </p>

    {producto.tipoStock ===
      'granel' && (

      <p style={styles.stockInfo}>
        Stock:
        {' '}
        {producto.stockGranelKg}
        Kg
      </p>

    )}

    <div
      style={
        styles.variantesCompactas
      }
    >

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
            producto.categoria?._id,

          descripcion:
            producto.descripcion,

          orden:
            producto.orden || 0,

          tipoStock:
            producto.tipoStock,

          stockGranelKg:
            producto.stockGranelKg,

          variantes:
            producto.variantes || []

        });

        window.scrollTo({
          top: 0,
          behavior: 'smooth'
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
  padding: 15,
  fontFamily: 'Arial'
},

container: {
  maxWidth: 1200,
  margin: '0 auto'
},

title: {
  marginBottom: 12,
  fontSize: 24
},

card: {
  background: '#fff',
  borderRadius: 12,
  padding: 12,
  marginBottom: 15,
  boxShadow:
    '0 2px 10px rgba(0,0,0,0.05)'
},

grid3: {
  display: 'grid',
  gridTemplateColumns:
    '2fr 80px 1fr',
  gap: 6
},

filaCompacta: {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 8,
  flexWrap: 'wrap'
},

input: {
  width: '100%',
  padding: 8,
  borderRadius: 8,
  border: '1px solid #ddd',
  fontSize: 13
},

textarea: {
  width: '100%',
  minHeight: 55,
  padding: 8,
  marginTop: 8,
  borderRadius: 8,
  border: '1px solid #ddd',
  fontSize: 13
},

preview: {
  borderRadius: 8,
  objectFit: 'cover'
},

variantesHeader: {
  display: 'flex',
  justifyContent:
    'space-between',
  alignItems: 'center',
  marginTop: 15,
  marginBottom: 8
},

tablaHeader: {
  display: 'grid',
  gridTemplateColumns:
    '120px 120px 120px 40px',
  gap: 6,
  fontSize: 12,
  fontWeight: 'bold',
  marginBottom: 5
},

varianteRow: {
  display: 'grid',
  gridTemplateColumns:
    '120px 120px 120px 40px',
  gap: 6,
  marginBottom: 4
},

smallInput: {
  padding: 6,
  borderRadius: 6,
  border: '1px solid #ddd',
  fontSize: 12
},

addButton: {
  background: '#2196F3',
  color: '#fff',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 8,
  cursor: 'pointer'
},

deleteMini: {
  background: '#ff4d4d',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer'
},

saveButton: {
  width: '100%',
  marginTop: 12,
  background: '#4CAF50',
  color: '#fff',
  border: 'none',
  padding: 10,
  borderRadius: 8,
  cursor: 'pointer'
},

filtrosBar: {
  display: 'flex',
  justifyContent:
    'space-between',
  alignItems: 'center',
  marginBottom: 12
},

filtroSelect: {
  padding: 8,
  borderRadius: 8,
  border: '1px solid #ddd'
},

totalProductos: {
  color: '#666',
  fontSize: 13
},

productosGrid: {
  display: 'grid',
  gap: 10
},

productoCard: {
  background: '#fff',
  borderRadius: 10,
  padding: 10,
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  boxShadow:
    '0 2px 8px rgba(0,0,0,0.05)'
},

productImage: {
  borderRadius: 8,
  objectFit: 'cover'
},

productTop: {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap'
},

productName: {
  margin: 0,
  fontSize: 16
},

category: {
  margin: '3px 0',
  color: '#666',
  fontSize: 12
},

badge: {
  background: '#eee',
  padding: '3px 8px',
  borderRadius: 999,
  fontSize: 11
},

ordenBadge: {
  background: '#dbeafe',
  padding: '3px 8px',
  borderRadius: 999,
  fontSize: 11
},

stockInfo: {
  margin: '3px 0',
  fontSize: 12,
  color: '#777'
},

variantesCompactas: {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
  marginTop: 6
},

varianteBadge: {
  background: '#f1f1f1',
  padding: '4px 8px',
  borderRadius: 999,
  fontSize: 11
},

actions: {
  display: 'flex',
  flexDirection: 'column',
  gap: 6
},

editBtn: {
  background: '#2196F3',
  color: '#fff',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 8,
  cursor: 'pointer'
},

deleteBtn: {
  background: '#ff4d4d',
  color: '#fff',
  border: 'none',
  padding: '6px 10px',
  borderRadius: 8,
  cursor: 'pointer'
}
};