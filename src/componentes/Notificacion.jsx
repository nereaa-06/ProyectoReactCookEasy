import './Notificacion.css';

function Notificacion({ abierta, titulo, mensaje, textoBoton = 'Aceptar', onClose }) {
  if (!abierta) {
    return null;
  }

  return (
    <div className="overlay-notificacion">
      <div className="caja-notificacion">
        <h3>{titulo}</h3>
        <p>{mensaje}</p>
        <button className="boton-notificacion" onClick={onClose}>
          {textoBoton}
        </button>
      </div>
    </div>
  );
}

export default Notificacion;
