import React from 'react';
import './Inicio.css';

function Inicio() {
  return (
    <div className="inicio-fondo">
      <div className="inicio-caja">
        <h1 className="inicio-titulo">Descubre recetas fáciles y deliciosas</h1>
        
        <p className="inicio-texto">
          En CookEasy, creemos que cocinar debe ser una aventura placentera y accesible para todos. 
          Somos tu fuente de inspiración para la cocina diaria, con una biblioteca que abarca desde los 
          clásicos de siempre hasta las tendencias más innovadoras. Explora, aprende y domina cada 
          plato con nuestras recetas probadas, explicadas paso a paso y con consejos para que siempre triunfes.
        </p>
        
        <p className="inicio-final">
          ¡Ponte el delantal y transforma tu cocina en tu lugar favorito!
        </p>
      </div>
    </div>
  );
}

export default Inicio;