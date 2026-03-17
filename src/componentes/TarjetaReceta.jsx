import React from 'react';

function TarjetaReceta({ receta }) {
  return (
    <div style={css.tarjeta}>
      <img src={receta.imagen} alt={receta.nombre} style={css.imagen} />
      <div style={css.info}>
        <h3 style={css.titulo}>{receta.nombre}</h3>
        <button style={css.boton}>Ver Receta</button>
      </div>
    </div>
  );
}

const css = {
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    paddingBottom: '15px',
    border: '1px solid #eee'
  },
  imagen: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '20px 20px 0 0'
  },
  info: {
    padding: '15px'
  },
  titulo: {
    fontSize: '18px',
    marginBottom: '15px'
  },
  boton: {
    backgroundColor: '#FF9F1C',
    color: 'white',
    border: 'none',
    padding: '10px 25px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '80%'
  }
};

export default TarjetaReceta;