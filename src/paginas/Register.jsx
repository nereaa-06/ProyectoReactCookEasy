import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../servicios/Auth';
import Notificacion from '../componentes/Notificacion';
import './Auth.css';

function Register() {
  // Datos del formulario de registro.
  const [nombre, setNombre] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargandoRegistro, setCargandoRegistro] = useState(false);
  const [noti, setNoti] = useState({ abierta: false, titulo: '', mensaje: '' });
  const navigate = useNavigate();

  const manejarRegistro = async (e) => {
    e.preventDefault();

    if (cargandoRegistro) {
      return;
    }

    setCargandoRegistro(true);
    // Crea la cuenta del nuevo usuario.
    const res = await AuthService.registrar({
      nombre: nombre.trim(),
      nombreUsuario: nombreUsuario.trim(),
      email: email.trim(),
      password
    });
    setCargandoRegistro(false);
    
    if (res.ok) {
      setNoti({
        abierta: true,
        titulo: 'Cuenta creada',
        mensaje: res.msg || 'Cuenta creada con exito.'
      });
    } else {
      setNoti({ abierta: true, titulo: 'No se pudo registrar', mensaje: res.msg });
    }
  };

  const cerrarNoti = () => {
    // Si se registro bien, envia al login.
    const mensaje = noti.mensaje.toLowerCase();
    setNoti({ abierta: false, titulo: '', mensaje: '' });

    if (mensaje.includes('cuenta creada')) {
      navigate('/login');
    }
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-card">
        <h2 className="auth-titulo">Crear Cuenta</h2>
        <p className="auth-subtitulo">Únete a la comunidad de CookEasy</p>
        
        <form onSubmit={manejarRegistro} className="auth-form">
          <div className="input-group">
            <label>Nombre Completo</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              placeholder="Tu nombre" 
              required 
            />
          </div>

          <div className="input-group">
            <label>Nombre de Usuario</label>
            <input
              type="text"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              placeholder="ej: nerea_cocina"
              required
            />
          </div>

          <div className="input-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="correo@ejemplo.com" 
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

          <button type="submit" className="btn-auth-principal" disabled={cargandoRegistro}>
            {cargandoRegistro ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
        </div>
      </div>

      <Notificacion
        abierta={noti.abierta}
        titulo={noti.titulo}
        mensaje={noti.mensaje}
        onClose={cerrarNoti}
      />
    </>
  );
}

export default Register;