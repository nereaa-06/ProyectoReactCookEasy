import React, { useEffect, useState } from 'react';
import { PerfilService } from '../servicios/perfil';
import { AuthService } from '../servicios/Auth';
import Notificacion from '../componentes/Notificacion';
import './Perfil.css';

function Perfil() {
  // Datos del perfil que se editan en el formulario.
  const [perfil, setPerfil] = useState({
    nombreUsuario: '',
    nombreCompleto: '',
    telefono: '',
    email: '',
    foto: ''
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [notificacion, setNotificacion] = useState({ visible: false, titulo: '', mensaje: '' });
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);

  useEffect(() => {
    // Trae el perfil al abrir la pagina.
    const cargarPerfil = async () => {
      const res = await PerfilService.obtener();

      if (res.ok) {
        setPerfil(res.perfil);
      } else {
        setMensaje(res.msg || 'No se pudo cargar el perfil');
      }

      setCargando(false);
    };

    cargarPerfil();
  }, []);

  const cambiarCampo = (campo) => (e) => {
    setPerfil({ ...perfil, [campo]: e.target.value });
  };

  const cambiarFoto = (e) => {
    // Convierte la foto a base64 para guardarla en Supabase.
    const archivo = e.target.files?.[0];
    if (!archivo) {
      return;
    }

    const lector = new FileReader();
    lector.onloadend = () => {
      setPerfil((prev) => ({ ...prev, foto: String(lector.result || '') }));
    };
    lector.readAsDataURL(archivo);
  };

  const guardarPerfil = async () => {
    setGuardando(true);
    setMensaje('');

    const res = await PerfilService.guardar(perfil);
    setGuardando(false);

    if (res.ok) {
      setMensaje('Perfil guardado');
    } else {
      setMensaje(res.msg || 'No se pudo guardar');
    }
  };

  const confirmarEliminar = async () => {
    // Elimina la cuenta y cierra sesion.
    const res = await AuthService.eliminarCuenta();
    
    if (res.ok) {
      setNotificacion({
        visible: true,
        titulo: 'Cuenta eliminada',
        mensaje: 'Tu cuenta ha sido eliminada. Redirigiéndote al inicio...'
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else {
      setNotificacion({
        visible: true,
        titulo: 'Error',
        mensaje: res.msg || 'No se pudo eliminar la cuenta'
      });
      setConfirmandoEliminar(false);
    }
  };

  if (cargando) {
    return (
      <div className="perfil-screen">
        <div className="perfil-container">
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil-screen">
      <div className="perfil-container">
        <div className="perfil-avatar-card">
          <div className="circulo-avatar-grande">
            {perfil.foto ? <img src={perfil.foto} alt="Foto de perfil" className="foto-perfil" /> : '👤'}
          </div>

          <label htmlFor="input-foto" className="btn-principal btn-perfil">
            Elegir foto
          </label>
          <input id="input-foto" type="file" accept="image/*" onChange={cambiarFoto} className="input-oculto" />
        </div>
        
        <div className="perfil-form">
          <input value={perfil.nombreUsuario} onChange={cambiarCampo('nombreUsuario')} className="input-salmon" placeholder="Nombre de usuario" />
          <input value={perfil.nombreCompleto} onChange={cambiarCampo('nombreCompleto')} className="input-salmon" placeholder="Nombre completo" />
          <input value={perfil.telefono} onChange={cambiarCampo('telefono')} className="input-salmon" placeholder="Telefono" />
          <input value={perfil.email} onChange={cambiarCampo('email')} className="input-salmon" placeholder="Correo electronico" />

          <button className="btn-principal btn-perfil" onClick={guardarPerfil} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar datos'}
          </button>

          {mensaje && <p style={{fontSize: '12px', color: '#666'}}>{mensaje}</p>}

          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <button 
              className="btn-eliminar" 
              onClick={() => setConfirmandoEliminar(true)}
              style={{
                backgroundColor: '#d9534f',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Eliminar cuenta
            </button>
          </div>
        </div>

        {confirmandoEliminar && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              maxWidth: '400px',
              textAlign: 'center'
            }}>
              <h2 style={{ marginBottom: '15px', color: '#333' }}>¿Eliminar cuenta?</h2>
              <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                Esta acción es irreversible. Se eliminarán tu perfil, recetas y datos.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  onClick={() => setConfirmandoEliminar(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmarEliminar}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#d9534f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        <Notificacion
          visible={notificacion.visible}
          titulo={notificacion.titulo}
          mensaje={notificacion.mensaje}
          onCerrar={() => setNotificacion({ ...notificacion, visible: false })}
        />
      </div>
    </div>
  );
}

export default Perfil;