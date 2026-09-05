import { useMemo, useState } from 'react';

import { normalizarTexto } from '@/lib/normalizarTexto';
import { generarId } from '@/lib/generarId';
import { apiFetch } from '@/lib/api';

import useProductos from '@/hooks/useProductos';
import useConfiguracion from '@/hooks/useConfiguracion';

// Toda la lógica de la pantalla "Carrito manual" vive acá: selección
// del producto a agregar, cálculo de precio/descuento, armado del
// carrito y confirmación del pedido. El componente de página solo
// se encarga de renderizar lo que este hook expone.
export default function useCarritoManual() {
  const { productos, loading } = useProductos();
  const { configuracion } = useConfiguracion();

  // ---- Selección del producto que se está por agregar ----
  const [buscar, setBuscar] = useState('');
  const [productoId, setProductoId] = useState('');
  const [varianteId, setVarianteId] = useState('');
  const [nuevoPeso, setNuevoPeso] = useState('');
  const [unidad, setUnidad] = useState('gr');
  const [cantidad, setCantidad] = useState(1);

  // ---- Descuento a aplicar al producto que se está por agregar ----
  // tipo: 'porcentaje' (%) o 'monto' ($ fijo sobre el precio unitario)
  const [descuentoTipo, setDescuentoTipo] = useState('porcentaje');
  const [descuentoValor, setDescuentoValor] = useState('');

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

  // Identifica este pedido manual ante el backend (mismo mecanismo
  // de idempotencia que usa el checkout del cliente). No hace falta
  // guardarlo en localStorage: esta pantalla no persiste entre
  // recargas, así que alcanza con generarlo una vez en memoria.
  const [cartId, setCartId] = useState(() => generarId());

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

  // Stock de cada componente del combo, para mostrarle al vendedor
  // antes de agregar (el combo en sí no tiene un "stock" propio: lo
  // limita el stock a granel de sus componentes).
  const componentesConStock = esCombo
    ? (productoSeleccionado.componentes || []).map((c) => {
        const componente = productos.find(
          (p) => p._id === c.productoId
        );

        return {
          nombre: componente?.nombre || 'Componente',
          cantidadGramos: c.cantidadGramos,
          stockGranel: componente?.stockGranel ?? null
        };
      })
    : [];

  // ---- Descuento sobre el precio unitario calculado ----
  const descuentoValorNum = Number(descuentoValor || 0);

  const descuentoMonto =
    descuentoValorNum <= 0
      ? 0
      : descuentoTipo === 'porcentaje'
      ? Math.round((precioCalculado * descuentoValorNum) / 100)
      : Math.round(descuentoValorNum);

  // El descuento nunca puede hacer que el precio sea negativo,
  // ni superar el precio original.
  const descuentoAplicado = Math.min(
    Math.max(descuentoMonto, 0),
    precioCalculado
  );

  const precioConDescuento = precioCalculado - descuentoAplicado;

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
    setDescuentoTipo('porcentaje');
    setDescuentoValor('');
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
    // El precio unitario que se usa para el carrito y para el pedido
    // final es el precio YA con el descuento aplicado.
    const precioUnitario = precioConDescuento;

    setCarrito(prev => [
      ...prev,
      {
        tempId: generarId(),
        productoId: productoSeleccionado._id,
        varianteId: varianteSeleccionada?._id || null,
        nombre: productoSeleccionado.nombre,
        foto: productoSeleccionado.foto,
        peso: pesoTexto,
        precioOriginal: precioCalculado,
        descuentoTipo: descuentoAplicado > 0 ? descuentoTipo : null,
        descuentoValor: descuentoAplicado > 0 ? descuentoValorNum : 0,
        descuentoMonto: descuentoAplicado,
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
    setDescuentoTipo('porcentaje');
    setDescuentoValor('');
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
    setCartId(generarId());
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
        varianteId: item.varianteId,
        nombre: item.nombre,
        foto: item.foto,
        peso: item.peso,
        cantidad: item.cantidad,
        // precio final, ya con el descuento aplicado (es el que se cobra)
        precio: item.precio,
        // datos de referencia sobre el descuento aplicado, por si el
        // backend quiere guardarlos/mostrarlos en el detalle del pedido
        precioOriginal: item.precioOriginal,
        descuentoTipo: item.descuentoTipo,
        descuentoValor: item.descuentoValor,
        descuentoMonto: item.descuentoMonto
      }));

      const res = await apiFetch(
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
            items: itemsPedido,
            cartId
          })
        }
      );

      // apiFetch ya redirige a /admin/login si el token venció (401) y
      // devuelve null en ese caso; no hay más nada que hacer acá.
      if (!res) return;

      const data = await res.json();
      setPedidoGuardado(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return {
    loading,

    // selección de producto
    buscar,
    setBuscar,
    productosFiltrados,
    productoId,
    seleccionarProducto,
    productoSeleccionado,
    esGranel,
    esCombo,
    variantes,
    varianteId,
    varianteSeleccionada,
    cambiarVarianteReferencia,
    componentesConStock,

    // peso / cantidad
    nuevoPeso,
    setNuevoPeso,
    unidad,
    setUnidad,
    nuevoPesoGramos,
    cantidad,
    setCantidad,

    // descuento y precio
    descuentoTipo,
    setDescuentoTipo,
    descuentoValor,
    setDescuentoValor,
    precioCalculado,
    descuentoAplicado,
    precioConDescuento,

    // agregar al carrito
    puedeAgregar,
    agregarAlCarrito,

    // carrito
    carrito,
    quitarDelCarrito,
    actualizarCantidad,
    subtotal,
    costoEnvio,
    tieneEnvioGratis,
    totalFinal,

    // datos del cliente y confirmación
    nombre,
    setNombre,
    telefono,
    setTelefono,
    tipoEntrega,
    setTipoEntrega,
    direccion,
    setDireccion,
    guardando,
    error,
    pedidoGuardado,
    confirmarPedido,
    nuevoPedido
  };
}
