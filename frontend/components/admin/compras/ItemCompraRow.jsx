export default function ItemCompraRow({ item, producto, modalidades, onChange, onQuitar, readOnly = false }) {
  if (!producto) return null;

  const cambiarVarianteSugerida = (varianteId, patch) => {
    const nuevas = item.variantesSugeridas.map(v =>
      String(v.variante) === String(varianteId) ? { ...v, ...patch } : v
    );
    onChange({ variantesSugeridas: nuevas });
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '0.75rem', display: 'grid', gap: '0.75rem', background: '#fff' }}>
      
      {/* Cabecera del producto */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '0.95rem' }}>
          {producto.nombre} <span style={{ color: '#666', fontWeight: 'normal' }}>({producto.tipoStock})</span>
        </strong>
        {!readOnly && (
          <button 
            onClick={onQuitar}
            style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Quitar
          </button>
        )}
      </div>

      {/* Controles principales compactos en Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
        <select
          value={item.modalidadCompra}
          onChange={e => onChange({ modalidadCompra: e.target.value })}
          disabled={readOnly}
          style={{ padding: '4px', fontSize: '0.85rem' }}
        >
          {modalidades.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Cantidad"
          value={item.cantidadComprada ?? ''}
          onChange={e => onChange({ cantidadComprada: Number(e.target.value) })}
          disabled={readOnly}
          style={{ padding: '4px', fontSize: '0.85rem' }}
        />

        {item.modalidadCompra === 'bolsa' && (
          <input
            type="number"
            placeholder="Kg/bolsa"
            value={item.pesoBolsaKg || ''}
            onChange={e => onChange({ pesoBolsaKg: Number(e.target.value) })}
            disabled={readOnly}
            style={{ padding: '4px', fontSize: '0.85rem' }}
          />
        )}

        {item.modalidadCompra === 'caja' && (
          <input
            type="number"
            placeholder="Un/caja"
            value={item.unidadesPorCaja || ''}
            onChange={e => onChange({ unidadesPorCaja: Number(e.target.value) })}
            disabled={readOnly}
            style={{ padding: '4px', fontSize: '0.85rem' }}
          />
        )}

        <input
          type="number"
          placeholder="Costo total ($)"
          value={item.costoTotal ?? ''}
          onChange={e => onChange({ costoTotal: Number(e.target.value) })}
          disabled={readOnly}
          style={{ padding: '4px', fontSize: '0.85rem' }}
        />

        {item.tipoStock === 'unidad' && (
          <select
            value={item.varianteDestino || ''}
            onChange={e => onChange({ varianteDestino: e.target.value })}
            disabled={readOnly}
            style={{ padding: '4px', fontSize: '0.85rem', gridColumn: '1 / -1' }}
          >
            <option value="">¿A qué variante suma el stock?</option>
            {producto.variantes.map(v => (
              <option key={v._id} value={v._id}>{v.peso}</option>
            ))}
          </select>
        )}
      </div>

      {/* Resumen de costos e ingresos compacto */}
      {item.cantidadBase !== undefined && (
        <div style={{ background: '#f8f9fa', padding: '0.5rem 0.75rem', borderRadius: 6, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '2px', borderLeft: '3px solid #1890ff' }}>
          <div>
            <strong>Ingresan:</strong>{' '}
            {item.cantidadBase != null ? (
              item.tipoStock === 'granel'
                ? `${(item.cantidadBase / 1000).toFixed(2)} kg (a stockGranel)`
                : `${item.cantidadBase} unidades`
            ) : (
              <span style={{ color: '#d48806' }}>Falta indicar cantidad</span>
            )}
          </div>
          <div>
            {item.costoUnitarioBase != null ? (
              <span><strong>Costo base:</strong> ${item.costoUnitarioBase.toFixed(0)} {item.tipoStock === 'granel' ? '/g' : '/u'}</span>
            ) : (
              <span style={{ color: '#d48806' }}>Faltan datos para costo base</span>
            )}
          </div>
          {item.costoUnitarioBaseConCargos != null && (
            <div style={{ color: '#333' }}>
              <strong>Con cargos:</strong> ${item.costoUnitarioBaseConCargos.toFixed(0)} {item.tipoStock === 'granel' ? '/g' : '/u'}
              {item.cargoAsignado > 0 && <span style={{ color: '#666' }}> (+${item.cargoAsignado.toFixed(0)} flete)</span>}
            </div>
          )}
        </div>
      )}

      {/* Tabla de variantes optimizada */}
      {item.variantesSugeridas?.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left', color: '#555' }}>
                <th style={{ padding: '4px' }}>Variante</th>
                <th style={{ padding: '4px', textAlign: 'right' }}>Actual</th>
                <th style={{ padding: '4px', textAlign: 'right' }}>Sugerido</th>
                <th style={{ padding: '4px', textAlign: 'right' }}>Nuevo</th>
                <th style={{ padding: '4px', textAlign: 'center' }}>Aplicar</th>
              </tr>
            </thead>
            <tbody>
              {item.variantesSugeridas.map(v => {
                const sinCambio = v.precioActual === v.precioSugerido;
                return (
                  <tr key={v.variante} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '6px 4px' }}>{v.nombreVariante}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right' }}>${v.precioActual}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right' }}>
                      <div>${v.precioSugerido}</div>
                      {(v.margenMultiplicador != null || v.factorAjuste != null) && (
                        <div style={{ fontSize: '0.7rem', color: '#888' }}>
                          {v.margenMultiplicador}× · {v.factorAjuste}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <input
                        type="number"
                        style={{
                          width: '75px',
                          padding: '2px 4px',
                          fontSize: '0.85rem',
                          backgroundColor: sinCambio ? '#d4edda' : '#f8d7da',
                          border: `1px solid ${sinCambio ? '#155724' : '#721c24'}`,
                          borderRadius: 4
                        }}
                        value={v.precioNuevo}
                        onChange={e =>
                          cambiarVarianteSugerida(v.variante, {
                            precioNuevo: Number(e.target.value),
                            editadoManualmente: true
                          })
                        }
                        disabled={readOnly}
                      />
                      {!readOnly && v.editadoManualmente && (
                        <button
                          type="button"
                          title="Restaurar sugerido"
                          onClick={() =>
                            cambiarVarianteSugerida(v.variante, {
                              precioNuevo: v.precioSugerido,
                              editadoManualmente: false
                            })
                          }
                          style={{ marginLeft: '4px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '0.9rem' }}
                        >
                          ↺
                        </button>
                      )}
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={v.aplicar}
                        onChange={e => cambiarVarianteSugerida(v.variante, { aplicar: e.target.checked })}
                        disabled={readOnly}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}