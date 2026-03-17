import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navegador.css';

function Navegador({ alSalir, nombreUsuario }) {
  const [menu, setMenu] = useState(false);
  const nombre = nombreUsuario || 'Usuario';
  const cerrarMenu = () => setMenu(false);

  return (
    <nav className="nav-container">
      
      <Link to="/" className="logo-link-wrapper">
        <div className="logo-completo">
          <img src="/imagenes/logo.png" alt="Logo" className="img-logo-cabecera" />
          <span className="texto-logo">COOKEASY</span>
        </div>
      </Link>

      <div className="enlaces-nav">
        <Link to="/" className="nav-link">Inicio</Link>
        <Link to="/recetas" className="nav-link">Recetas</Link>
        <Link to="/favoritos" className="nav-link">Favoritos</Link>
        
        <div className="usuario-pill">
          <Link to="/perfil" className="nav-link">👤 {nombre}</Link>
          <button onClick={() => setMenu(!menu)} className="boton-menu-hamburguesa">☰</button>
        </div>
      </div>

      {menu && (
        <div className="menu-lateral">
          <div className="perfil-resumen">
            <div className="circulo-user-naranja">👤</div>
            <p><strong>{nombre}</strong></p>
          </div>

          <Link to="/perfil" className="btn-menu-naranja" onClick={cerrarMenu}>
            Perfil
          </Link>

          <Link to="/favoritos" className="btn-menu-naranja" onClick={cerrarMenu}>
            Favoritos
          </Link>
          
          <button className="btn-menu-naranja" onClick={alSalir}>Cerrar Sesión</button>
          <button className="btn-menu-naranja">Soporte</button>
          
          <button onClick={cerrarMenu} className="boton-cerrar-menu">
            Cerrar ×
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navegador;