import React from 'react';

function Inicio() {
  return (
    <div style={css.fondo}>
      <div style={css.caja}>
        <h1 style={css.titulo}>Descubre recetas fáciles y deliciosas</h1>
        
        <p style={css.texto}>
          En CookEasy, creemos que cocinar debe ser una aventura placentera y accesible para todos. 
          Somos tu fuente de inspiración para la cocina diaria, con una biblioteca que abarca desde los 
          clásicos de siempre hasta las tendencias más innovadoras. Explora, aprende y domina cada 
          plato con nuestras recetas probadas, explicadas paso a paso y con consejos para que siempre triunfes.
        </p>
        
        <p style={css.final}>
          ¡Ponte el delantal y transforma tu cocina en tu lugar favorito!
        </p>
      </div>
    </div>
  );
}

const css = {
  fondo: {
    backgroundImage: 'url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '80vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  caja: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: '40px',
    borderRadius: '50px',
    maxWidth: '900px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  titulo: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333'
  },
  texto: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: '#444',
    marginBottom: '20px'
  },
  final: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#000'
  }
};

export default Inicio;