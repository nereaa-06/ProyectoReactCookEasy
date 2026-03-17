import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../servicios/Auth';
import Notificacion from '../componentes/Notificacion';
import './Auth.css';

function Login({ setUsuario }) {
  // Campos del formulario de acceso.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargandoLogin, setCargandoLogin] = useState(false);
  const [noti, setNoti] = useState({ abierta: false, titulo: '', mensaje: '' });
  const navigate = useNavigate();

  const manejarLogin = async (e) => {
    e.preventDefault();

    // Evita doble click mientras se hace la peticion.
    if (cargandoLogin) {
      return;
    }

    setCargandoLogin(true);
    // Intenta iniciar sesion con Supabase.
    const res = await AuthService.login(email.trim(), password);
    setCargandoLogin(false);

    if (res.ok) {
      setUsuario(res.usuario);
      navigate('/');
    } else {
      setNoti({ abierta: true, titulo: 'No se pudo iniciar sesion', mensaje: res.msg });
    }
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-card">
        <h2 className="auth-titulo">¡Bienvenido!</h2>
        <p className="auth-subtitulo">Entra para ver tus recetas guardadas</p>
        
        <form onSubmit={manejarLogin} className="auth-form">
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="tu@email.com" 
              required 
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button type="submit" className="btn-auth-principal" disabled={cargandoLogin}>
            {cargandoLogin ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
            ¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link>
        </p>
        </div>
      </div>

      <Notificacion
        abierta={noti.abierta}
        titulo={noti.titulo}
        mensaje={noti.mensaje}
        onClose={() => setNoti({ abierta: false, titulo: '', mensaje: '' })}
      />
    </>
  );
}

export default Login;