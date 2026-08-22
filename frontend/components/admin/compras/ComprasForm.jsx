'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import {  LayoutDashboard} from 'lucide-react';
import useCompras from '@/hooks/useCompras';
import useProductos from '@/hooks/useProductos';
import useCategorias from '@/hooks/useCategorias';
import ItemCompraRow from '@/components/admin/compras/ItemCompraRow';
import { ESTADO_COMPRA } from '@/lib/estadoCompra';
import styles from './ComprasForm.module.css';

const MODALIDADES = {
  granel: [
    { value: 'kg', label: 'Por Kg' },
    { value: 'bolsa', label: 'Por bolsa' }
  ],
  unidad: [
    { value: 'unidad', label: 'Por unidad' },
    { value: 'caja', label: 'Por caja' }
  ]
};

const TIPOS_CARGO = [
  { value: 'flete', label: 'Flete' },
  { value: 'impuestos', label: 'Impuestos' },
  { value: 'otros', label: 'Otros' }
];

export default function ComprasForm({ compraIdInicial }) {
  const { productos } = useProductos();
  const { categorias } = useCategorias(true);
  const {
    compra,
    crear,
    actualizar,
    evaluarPrecios,
    confirmar,
    anular,
    obtener,
    loading,
    error,
    setCompra
  } = useCompras();

  const [proveedor, setProveedor] = useState('');
  const [numeroFactura, setNumeroFactura] = useState('');
  const [items, setItems] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cargandoCompra, setCargandoCompra] = useState(!!compraIdInicial);

  useEffect(() => {
    if (!compraIdInicial || !productos) return;

    obtener(compraIdInicial)
      .then((data) => {
        if (!data) return;
        setProveedor(data.proveedor || '');
        setNumeroFactura(data.numeroFactura || '');
        setCargos(data.cargos || []);
        setItems(
          (data.items || []).map((it) => ({
            ...it,
            _productoCompleto: productos.find((p) => p._id === it.producto)
          }))
        );
      })
      .finally(() => setCargandoCompra(false));
  }, [compraIdInicial, productos]);

  const productosFiltrados = categoriaSeleccionada
    ? productos?.filter((p) => {
        const catId = p.categoria?._id ?? p.categoria;
        return String(catId) === String(categoriaSeleccionada);
      })
    : productos;

  const agregarItem = () => {
    const producto = productos?.find((p) => p._id === productoSeleccionado);
    if (!producto) return;

    setItems((prev) => [
      {
        producto: producto._id,
        _productoCompleto: producto,
        tipoStock: producto.tipoStock,
        modalidadCompra: producto.tipoStock === 'granel' ? 'kg' : 'unidad',
        cantidadComprada: 0,
        pesoBolsaKg: undefined,
        unidadesPorCaja: undefined,
        varianteDestino: undefined,
        costoTotal: 0
      },
      ...prev
    ]);
    setProductoSeleccionado('');
  };

  const actualizarItem = (index, patch) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  };

  const quitarItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const agregarCargo = () => {
    setCargos((prev) => [
      ...prev,
      { tipo: 'flete', descripcion: '', monto: 0 }
    ]);
  };

  const actualizarCargo = (index, patch) => {
    setCargos((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c))
    );
  };

  const quitarCargo = (index) => {
    setCargos((prev) => prev.filter((_, i) => i !== index));
  };

  const limpiarParaEnviar = (items) =>
    items.map(({ _productoCompleto, ...rest }) => rest);

  const aplicarRespuesta = (data) => {
    if (!data) return;
    setItems(
      data.items.map((it) => ({
        ...it,
        _productoCompleto: productos.find((p) => p._id === it.producto)
      }))
    );
    setCargos(data.cargos || []);
  };

  const guardarBorrador = async () => {
    try {
      const payload = {
        proveedor,
        numeroFactura,
        items: limpiarParaEnviar(items),
        cargos
      };
      const data = compra
        ? await actualizar(compra._id, payload)
        : await crear(payload);
      aplicarRespuesta(data);
    } catch {}
  };

  const handleEvaluarPrecios = async () => {
    if (!compra) return;
    try {
      const data = await evaluarPrecios(compra._id);
      aplicarRespuesta(data);
    } catch {}
  };

  const handleConfirmar = async () => {
    if (!compra) return;
    if (
      !confirm(
        '¿Confirmar esta compra? Se actualizará el stock y los precios aprobados.'
      )
    )
      return;

    try {
      const payload = {
        proveedor,
        numeroFactura,
        items: limpiarParaEnviar(items),
        cargos
      };
      const dataActualizada = await actualizar(compra._id, payload);
      aplicarRespuesta(dataActualizada);

      await confirmar(compra._id);
      alert('Compra confirmada');
    } catch {}
  };

  const handleAnular = async () => {
    if (!compra) return;
    if (!confirm('¿Anular esta compra?')) return;
    try {
      await anular(compra._id);
    } catch {}
  };

  const nuevaCompra = () => {
    setCompra(null);
    setProveedor('');
    setNumeroFactura('');
    setItems([]);
    setCargos([]);
    setCategoriaSeleccionada('');
    setProductoSeleccionado('');
  };

  if (cargandoCompra) {
    return <div className={styles.loadingScreen}>Cargando compra...</div>;
  }

  const soloLectura = compra ? compra.estado !== 'borrador' : false;
  const estadoInfo = compra ? ESTADO_COMPRA[compra.estado] : null;

  return (
    <div className={styles.page}>
      {/* TÍTULO ARRIBA Y BOTONES DEBAJO */}
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>
          {compraIdInicial ? 'Detalle de compra' : 'Nueva compra'}
        </h1>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={nuevaCompra}>
            + Nueva compra
          </button>
          <Link
            href="/admin/compras/historial"
            className={styles.linkButtonBase}
          >
            Historial
          </Link>
          <Link href="/admin" className={styles.linkButtonBase}>
            <LayoutDashboard size={15} />
            Panel Administrador
          </Link>
        </div>
      </div>

      {estadoInfo && (
        <div className={styles.statusRow}>
          <span className={clsx(styles.badge, styles[estadoInfo.badgeClass])}>
            {estadoInfo.texto}
          </span>
          {soloLectura && (
            <span className={styles.readOnlyNote}>
              Esta compra ya no se puede editar.
            </span>
          )}
        </div>
      )}

      {error && <div className={styles.errorText}>{error}</div>}

      {items.length > 0 && !soloLectura && (
        <div className={styles.toolbar}>
          <div className={styles.toolbarActions}>
            <button
              className={styles.btnPrimary}
              onClick={guardarBorrador}
              disabled={loading}
            >
              {compra ? 'Guardar cambios' : 'Guardar compra'}
            </button>
            {compra && compra.estado === 'borrador' && (
              <>
                <button
                  className={styles.btnSecondary}
                  onClick={handleEvaluarPrecios}
                  disabled={loading}
                >
                  Evaluar cambios de costo
                </button>
                <button
                  className={clsx(styles.btnPrimary, styles.btnConfirmar)}
                  onClick={handleConfirmar}
                  disabled={loading}
                >
                  Confirmar compra (Actualizar Stock y Precios)
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={handleAnular}
                  disabled={loading}
                >
                  Anular
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className={styles.formRow}>
        <input
          className={styles.input}
          placeholder="Proveedor"
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
          disabled={soloLectura}
        />
        <input
          className={styles.input}
          placeholder="N° Factura"
          value={numeroFactura}
          onChange={(e) => setNumeroFactura(e.target.value)}
          disabled={soloLectura}
        />
      </div>

      <div className={styles.cargosBox}>
        <div className={styles.cargosHeader}>
          <strong className={styles.cargosTitle}>
            Flete, impuestos y otros cargos
          </strong>
          {!soloLectura && (
            <button
              type="button"
              className={clsx(styles.btnSecondary, styles.btnSmall)}
              onClick={agregarCargo}
            >
              + Agregar cargo
            </button>
          )}
        </div>

        {cargos.length === 0 && (
          <span className={styles.cargosEmpty}>
            Sin cargos adicionales cargados. Se prorratean entre los ítems al
            evaluar precios.
          </span>
        )}

        {cargos.map((cargo, i) => (
          <div key={i} className={styles.cargoRow}>
            <select
              className={styles.select}
              value={cargo.tipo}
              onChange={(e) => actualizarCargo(i, { tipo: e.target.value })}
              disabled={soloLectura}
            >
              {TIPOS_CARGO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              className={clsx(styles.input, styles.cargoDescripcion)}
              placeholder="Descripción (opcional)"
              value={cargo.descripcion || ''}
              onChange={(e) =>
                actualizarCargo(i, { descripcion: e.target.value })
              }
              disabled={soloLectura}
            />
            <input
              type="number"
              className={clsx(styles.input, styles.cargoMonto)}
              placeholder="Monto ($)"
              title="Monto ($)"
              value={cargo.monto}
              onChange={(e) =>
                actualizarCargo(i, { monto: Number(e.target.value) })
              }
              disabled={soloLectura}
            />
            {!soloLectura && (
              <button
                type="button"
                className={clsx(styles.btnGhost, styles.btnSmall)}
                onClick={() => quitarCargo(i)}
              >
                Quitar
              </button>
            )}
          </div>
        ))}
      </div>

      {!soloLectura && (
        <div className={styles.itemsToolbar}>
          <select
            className={styles.select}
            value={categoriaSeleccionada}
            onChange={(e) => {
              setCategoriaSeleccionada(e.target.value);
              setProductoSeleccionado('');
            }}
          >
            <option value="">Todas las categorías</option>
            {categorias?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
          >
            <option value="">Seleccionar producto...</option>
            {productosFiltrados?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre} ({p.tipoStock})
              </option>
            ))}
          </select>
          <button
            className={styles.btnPrimary}
            onClick={agregarItem}
            disabled={!productoSeleccionado}
          >
            Agregar a la compra
          </button>
        </div>
      )}

      {items.map((item, i) => (
        <ItemCompraRow
          key={i}
          item={item}
          producto={item._productoCompleto}
          modalidades={MODALIDADES[item.tipoStock]}
          onChange={(patch) => actualizarItem(i, patch)}
          onQuitar={() => quitarItem(i)}
          readOnly={soloLectura}
        />
      ))}
    </div>
  );
}