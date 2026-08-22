'use client';

import useCarritoManual from '@/hooks/useCarritoManual';

import SelectorProducto from '@/components/cartManual/SelectorProducto';
import PanelProductoSeleccionado from '@/components/cartManual/PanelProductoSeleccionado';
import ListaCarrito from '@/components/cartManual/ListaCarrito';
import DatosClienteForm from '@/components/cartManual/DatosClienteForm';
import PedidoConfirmado from '@/components/cartManual/PedidoConfirmado';

import styles from '@/components/cartManual/cartManual.module.css';

export default function CarritoManualPage() {
  const estado = useCarritoManual();
  const { productoSeleccionado, carrito, pedidoGuardado, nuevoPedido } = estado;

  if (pedidoGuardado) {
    return (
      <PedidoConfirmado pedidoGuardado={pedidoGuardado} nuevoPedido={nuevoPedido} />
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.titulo}>Carrito manual</h1>

      <SelectorProducto
        buscar={estado.buscar}
        setBuscar={estado.setBuscar}
        productoId={estado.productoId}
        seleccionarProducto={estado.seleccionarProducto}
        productosFiltrados={estado.productosFiltrados}
      />

      {productoSeleccionado && <PanelProductoSeleccionado estado={estado} />}

      <ListaCarrito
        carrito={carrito}
        actualizarCantidad={estado.actualizarCantidad}
        quitarDelCarrito={estado.quitarDelCarrito}
        subtotal={estado.subtotal}
        tipoEntrega={estado.tipoEntrega}
        costoEnvio={estado.costoEnvio}
        totalFinal={estado.totalFinal}
      />

      {carrito.length > 0 && (
        <DatosClienteForm
          nombre={estado.nombre}
          setNombre={estado.setNombre}
          telefono={estado.telefono}
          setTelefono={estado.setTelefono}
          tipoEntrega={estado.tipoEntrega}
          setTipoEntrega={estado.setTipoEntrega}
          direccion={estado.direccion}
          setDireccion={estado.setDireccion}
          error={estado.error}
          guardando={estado.guardando}
          confirmarPedido={estado.confirmarPedido}
        />
      )}
    </div>
  );
}
