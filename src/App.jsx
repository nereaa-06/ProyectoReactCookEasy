import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navegador from './componentes/Navegador';
import Inicio from './paginas/Inicio';
import Recetas from './paginas/Recetas';
import DetalleReceta from './paginas/DetalleReceta';
import Login from './paginas/Login';
import Perfil from './paginas/Perfil';
import Favoritos from './paginas/Favoritos';
import Register from './paginas/Register';
import { AuthService } from './servicios/Auth';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const iniciarSesion = async () => {
      const sesion = await AuthService.obtenerSesionActiva();
      setUsuario(sesion);
      setCargando(false);
    };

    iniciarSesion();

    // Escucha cambios de login/logout para mantener App sincronizada.
    const desuscribir = AuthService.suscribirSesion((nuevoUsuario) => {
      setUsuario(nuevoUsuario);
    });

    return () => desuscribir();
  }, []);

  const estaLogueado = Boolean(usuario);
  const nombreMostrado = usuario?.nombre
    ? usuario.nombre.trim().split(/\s+/)[0]
    : usuario?.email?.split('@')[0] || 'Usuario';

  const manejarSalir = async () => {
    await AuthService.logout();
    setUsuario(null);
  };

  if (cargando) {
    return null;
  }

  const rutaPrivada = (componente) => (estaLogueado ? componente : <Navigate to="/login" replace />);
  const rutaPublica = (componente) => (estaLogueado ? <Navigate to="/" replace /> : componente);

  return (
    <div>
      {estaLogueado && <Navegador alSalir={manejarSalir} nombreUsuario={nombreMostrado} />}
      
      <Routes>
        <Route path="/login" element={rutaPublica(<Login setUsuario={setUsuario} />)} />
        <Route path="/register" element={rutaPublica(<Register />)} />

        <Route path="/" element={rutaPrivada(<Inicio />)} />
        <Route path="/recetas" element={rutaPrivada(<Recetas />)} />
        <Route path="/receta/:id" element={rutaPrivada(<DetalleReceta />)} />
        <Route path="/favoritos" element={rutaPrivada(<Favoritos />)} />
        <Route path="/perfil" element={rutaPrivada(<Perfil />)} />

        <Route path="*" element={<Navigate to={estaLogueado ? '/' : '/login'} replace />} />
      </Routes>
    </div>
  );
}

export default App;