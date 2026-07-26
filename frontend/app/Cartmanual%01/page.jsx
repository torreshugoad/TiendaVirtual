'use client';

import { useMemo, useState } from 'react';

import BuscadorProductos from '@/components/home/BuscadorProductos';
import useFiltroPorNombre from '@/hooks/useFiltroPorNombre';
import { normalizarTexto } from '@/lib/normalizarTexto';

import useProductos from '@/hooks/useProductos';
import useConfiguracion from '@/hooks/useConfiguracion';

export default function CarritoManualPage() {
  const { productos, loading } = useProductos();
  const { configuracion } = useConfiguracion();

  // ---- Selección del producto que se está por agregar ----
  const [buscar, setBuscar] = useState('');
  const [productoId, setProductoId] = useState('');
  const [varianteId, setVarianteId] = useState('');
  const [nuevoPeso, setNuevoPeso] = useState('');
  const [unidad, setUnidad] = useState('gr');
  const [cantidad, setCantidad] = useState(1);

  // ---- Carrito que se va armando ----
  const [carrito, setCarrito] = useState([]);

  // ---- Datos del pedido (mismos campos que usa el checkout del cliente) ----
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('retiro');
  const [direccion, setDireccion] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [pedidoGuardado, setPedidoGuardado] = useState(null);

const productosFiltrados = useMemo(() => {
  const termino = normalizarTexto(buscar.trim());

  return productos.filter((p) => {
    if (termino && !normalizarTexto(p.nombre).includes(termino)) {
      return false;
    }
    return true;
  });
}, [productos, buscar]);

  const productoSeleccionado =
    productos.find(p => p._id === productoId) || null;

  // Los productos a granel necesitan cálculo de precio por peso.
  // Los combos tienen un precio de oferta fijo (sin variantes).
  // El resto (por unidad) usa el precio fijo de la variante.
  const esGranel = productoSeleccionado?.tipoStock === 'granel';
  const esCombo = productoSeleccionado?.tipoStock === 'combo';

  const variantes = productoSeleccionado?.variantes || [];

  const varianteSeleccionada =
    variantes.find(v => v._id === varianteId) || null;

  const precioPorGramo =
    esGranel && varianteSeleccionada
      ? Number(varianteSeleccionada.precio || 0) /
        Number(varianteSeleccionada.equivalencia || 1)
      : 0;

  const nuevoPesoGramos =
    unidad === 'kg'
      ? Math.round(Number(nuevoPeso || 0) * 1000)
      : Math.round(Number(nuevoPeso || 0));

  const precioCalculado = esGranel
    ? Math.round(precioPorGramo * nuevoPesoGramos)
    : esCombo
    ? Number(productoSeleccionado?.precioCombo || 0)
    : Number(varianteSeleccionada?.precio || 0);

  const pesoTexto = esGranel
    ? `${nuevoPesoGramos}Gr`
    : esCombo
    ? 'Combo'
    : varianteSeleccionada?.peso || '';

  const puedeAgregar = esGranel
    ? Boolean(varianteSeleccionada) && nuevoPeso !== '' && nuevoPesoGramos > 0
    : esCombo
    ? Number(cantidad) > 0
    : Boolean(varianteSeleccionada) && Number(cantidad) > 0;

function seleccionarProducto(id) {
  setProductoId(id);

  const producto = productos.find(p => p._id === id);
  const primeraVariante = producto?.variantes?.[0] || null;

  setVarianteId(primeraVariante?._id || '');

  // Precargamos el peso con el valor típico de la variante
  // (equivalencia ya está siempre en gramos).
  if (producto?.tipoStock === 'granel' && primeraVariante) {
    setNuevoPeso(String(primeraVariante.equivalencia ?? ''));
    setUnidad('gr');
  } else {
    setNuevoPeso('');
  }

  setCantidad(1);
}

function cambiarVarianteReferencia(id) {
  setVarianteId(id);

  const variante = variantes.find(v => v._id === id);

  if (variante) {
    setNuevoPeso(String(variante.equivalencia ?? ''));
    setUnidad('gr');
  }
}

  function agregarAlCarrito() {
    if (!puedeAgregar || !productoSeleccionado) return;

    const cant = esGranel ? 1 : Number(cantidad);
    const precioUnitario = precioCalculado;

    setCarrito(prev => [
      ...prev,
      {
        tempId:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        productoId: productoSeleccionado._id,
        nombre: productoSeleccionado.nombre,
        foto: productoSeleccionado.foto,
        peso: pesoTexto,
        precio: precioUnitario,
        cantidad: cant,
        subtotal: precioUnitario * cant
      }
    ]);

    // Reseteamos la selección para cargar el próximo producto.
    setProductoId('');
    setVarianteId('');
    setNuevoPeso('');
    setCantidad(1);
    setBuscar('');
  }

  function quitarDelCarrito(tempId) {
    setCarrito(prev => prev.filter(i => i.tempId !== tempId));
  }

  function actualizarCantidad(tempId, nuevaCantidad) {
    const cant = Math.max(1, Number(nuevaCantidad) || 1);

    setCarrito(prev =>
      prev.map(i =>
        i.tempId === tempId
          ? { ...i, cantidad: cant, subtotal: i.precio * cant }
          : i
      )
    );
  }

  const subtotal = carrito.reduce((acc, i) => acc + i.subtotal, 0);

  const envioGratisDesde = Number(configuracion?.envioGratisDesde || 0);
  const costoBaseEnvio = Number(configuracion?.costoEnvio || 0);
  const tieneEnvioGratis = subtotal >= envioGratisDesde;

  const costoEnvio =
    tipoEntrega === 'envio' ? (tieneEnvioGratis ? 0 : costoBaseEnvio) : 0;

  const totalFinal = subtotal + costoEnvio;

  function nuevoPedido() {
    setPedidoGuardado(null);
    setCarrito([]);
    setNombre('');
    setTelefono('');
    setDireccion('');
    setTipoEntrega('retiro');
  }

  // Mismo endpoint y misma forma de body que usa el checkout del cliente,
  // así el pedido queda registrado de forma idéntica sin importar quién lo cargue.
  async function confirmarPedido() {
    if (carrito.length === 0) return;

    if (!nombre || !telefono) {
      setError('Completá nombre y teléfono del cliente.');
      return;
    }

    if (tipoEntrega === 'envio' && !direccion) {
      setError('Ingresá la dirección de envío.');
      return;
    }

    setGuardando(true);
    setError('');

    try {
      const itemsPedido = carrito.map(item => ({
        productoId: item.productoId,
        nombre: item.nombre,
        foto: item.foto,
        peso: item.peso,
        cantidad: item.cantidad,
        precio: item.precio
      }));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/checkout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cliente: nombre,
            telefono,
            direccion,
            tipoEntrega,
            envio: costoEnvio,
            items: itemsPedido
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'Error registrando el pedido');
      }

      setPedidoGuardado(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  if (pedidoGuardado) {
    return (
      <div style={{ padding: '14px', background: '#f3f4f6', minHeight: '100vh' }}>
        <div style={{ ...card, maxWidth: '420px', margin: '40px auto', textAlign: 'center' }}>
          <h2 style={{ color: '#16a34a' }}>Pedido registrado</h2>
          <p style={{ color: '#6b7280' }}>
            Pedido #{pedidoGuardado.nropedido} guardado correctamente.
          </p>
          <button onClick={nuevoPedido} style={{ ...botonPrimario, marginTop: '16px' }}>
            Cargar otro pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '14px', background: '#f3f4f6', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Carrito manual</h1>

      {/* BUSCADOR Y SELECCIÓN DE PRODUCTO */}
      <div style={card}>

        <label style={label}>Producto</label>

<BuscadorProductos
  valor={buscar}
  onChange={setBuscar}
  placeholder="Buscar producto..."
  style={{ border: '1px solid #d1d5db', marginBottom: 8 }}
/>

<select
  value={productoId}
  onChange={e => seleccionarProducto(e.target.value)}
  style={input}
>
          <option value="">Seleccioná un producto...</option>
          {productosFiltrados.map(p => (
            <option key={p._id} value={p._id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {productoSeleccionado && (
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {esGranel ? (
            <>
<div style={card}>
  <label style={label}>Variante de referencia</label>

  <select
    value={varianteId}
    onChange={e => cambiarVarianteReferencia(e.target.value)}
    style={input}
  >
    {variantes.map(v => (
      <option key={v._id} value={v._id}>
        {v.peso} — ${v.precio}
      </option>
    ))}
  </select>
</div>

              <div style={card}>
                <label style={label}>Peso a cargar</label>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="Ej. 280"
                    value={nuevoPeso}
                    onChange={e => setNuevoPeso(e.target.value)}
                    style={{ ...input, flex: 1 }}
                  />

                  <select
                    value={unidad}
                    onChange={e => setUnidad(e.target.value)}
                    style={{ ...input, width: '80px' }}
                  >
                    <option value="gr">Gr</option>
                    <option value="kg">Kg</option>
                  </select>
                </div>

                {varianteSeleccionada && nuevoPeso !== '' && (
                  <div style={precioBox}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Precio para {nuevoPesoGramos}Gr
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#16a34a' }}>
                      ${precioCalculado}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : esCombo ? (
            <div style={card}>
              <label style={label}>Combo</label>

              <div style={precioBox}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Precio del combo
                </div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#16a34a' }}>
                  ${precioCalculado}
                </div>
              </div>

              <label style={{ ...label, marginTop: '10px' }}>Cantidad</label>

              <input
                type="number"
                step="1"
                min="1"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                style={input}
              />
            </div>
          ) : (
            <div style={card}>
              <label style={label}>Variante</label>

              <select
                value={varianteId}
                onChange={e => setVarianteId(e.target.value)}
                style={{ ...input, marginBottom: '8px' }}
              >
                {variantes.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.peso} — ${v.precio}
                  </option>
                ))}
              </select>

              <label style={label}>Cantidad</label>

              <input
                type="number"
                step="1"
                min="1"
                value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                style={input}
              />
            </div>
          )}

          <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={agregarAlCarrito}
              disabled={!puedeAgregar}
              style={{
                ...botonPrimario,
                opacity: puedeAgregar ? 1 : 0.5,
                cursor: puedeAgregar ? 'pointer' : 'not-allowed'
              }}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      )}

      {/* CARRITO */}
      <div style={card}>
        <label style={label}>Carrito ({carrito.length} ítems)</label>

        {carrito.length === 0 && (
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>
            Todavía no agregaste productos.
          </p>
        )}

        {carrito.map(item => (
          <div
            key={item.tempId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            <div style={{ flex: 2 }}>
              <div style={{ fontWeight: 'bold' }}>{item.nombre}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {item.peso} — ${item.precio} c/u
              </div>
            </div>

            <input
              type="number"
              min="1"
              value={item.cantidad}
              onChange={e => actualizarCantidad(item.tempId, e.target.value)}
              style={{ ...input, width: '60px' }}
            />

            <div style={{ width: '80px', textAlign: 'right', fontWeight: 'bold' }}>
              ${item.subtotal}
            </div>

            <button onClick={() => quitarDelCarrito(item.tempId)} style={botonQuitar}>
              ✕
            </button>
          </div>
        ))}

        {carrito.length > 0 && (
          <div style={{ marginTop: '12px', textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Subtotal: ${subtotal}
            </div>
            {tipoEntrega === 'envio' && (
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Envío: {costoEnvio === 0 ? 'GRATIS' : `$${costoEnvio}`}
              </div>
            )}
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              Total: ${totalFinal}
            </div>
          </div>
        )}
      </div>

      {/* DATOS DEL CLIENTE */}
      {carrito.length > 0 && (
        <div style={card}>
          <label style={label}>Datos del cliente</label>

          <input
            placeholder="Nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={{ ...input, marginBottom: '8px' }}
          />

          <input
            placeholder="Teléfono"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            style={{ ...input, marginBottom: '8px' }}
          />

          <select
            value={tipoEntrega}
            onChange={e => setTipoEntrega(e.target.value)}
            style={{ ...input, marginBottom: '8px' }}
          >
            <option value="retiro">Retiro en tienda</option>
            <option value="envio">Envío a domicilio</option>
          </select>

          {tipoEntrega === 'envio' && (
            <input
              placeholder="Dirección"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              style={{ ...input, marginBottom: '8px' }}
            />
          )}

          {error && (
            <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '8px' }}>{error}</p>
          )}

          <button
            onClick={confirmarPedido}
            disabled={guardando}
            style={{ ...botonPrimario, width: '100%' }}
          >
            {guardando ? 'Guardando...' : 'Registrar pedido'}
          </button>
        </div>
      )}
    </div>
  );
}

const card = {
  flex: '1 1 260px',
  background: '#fff',
  borderRadius: '10px',
  border: '1px solid #e5e7eb',
  padding: '8px',
  marginBottom: '8px'
};

const precioBox = {
  background: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '10px',
  padding: '6px',
  textAlign: 'center'
};

const botonPrimario = {
  background: '#16a34a',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const botonQuitar = {
  background: '#fee2e2',
  color: '#dc2626',
  border: 'none',
  borderRadius: '6px',
  padding: '4px 8px',
  cursor: 'pointer'
};

const label = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 'bold',
  marginBottom: '6px',
  color: '#374151'
};

const input = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  boxSizing: 'border-box'
};
