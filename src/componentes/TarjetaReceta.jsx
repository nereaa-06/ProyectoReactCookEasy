import React from 'react';
import './TarjetaReceta.css';

function TarjetaReceta({ receta }) {
  return (
    // Tarjeta con imagen, nombre y boton para ver la receta.
    <div className="tarjeta-receta">
      <img src={receta.imagen} alt={receta.nombre} className="tarjeta-receta__imagen" />
      <div className="tarjeta-receta__info">
        <h3 className="tarjeta-receta__titulo">{receta.nombre}</h3>
        <button className="tarjeta-receta__boton">Ver Receta</button>
      </div>
    </div>
  );
}

export default TarjetaReceta;