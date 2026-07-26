const styles = {
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 14px',
    marginBottom: '12px',
    border: '1px solid #025221',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#111827',
    background: '#ffffff',
    outline: 'none',
  },
};

export default function BuscadorProductos({
  valor,
  onChange,
  placeholder = 'Buscar producto por nombre...',
  style = {}
}) {
  return (
    <input
      type="text"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...styles.input, ...style }}
    />
  );
}