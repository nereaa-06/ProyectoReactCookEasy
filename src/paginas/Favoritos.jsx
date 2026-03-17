import React, { useEffect, useState } from 'react';
import { RecetasService } from '../servicios/recetas';
import Notificacion from '../componentes/Notificacion';
import './Favoritos.css';

function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [notificacion, setNotificacion] = useState({ visible: false, titulo: '', mensaje: '' });

  useEffect(() => {
    const cargarFavoritos = async () => {
      setCargando(true);
      const res = await RecetasService.listar();
      
      if (res.ok) {
        const todasLasRecetas = res.recetas;
        const resFavoritos = await RecetasService.obtenerFavoritos();
        
        if (resFavoritos.ok) {
          const idsFavoritos = new Set(resFavoritos.favoritos);
          const recetasFavoritas = todasLasRecetas.filter(r => idsFavoritos.has(r.id));
          setFavoritos(recetasFavoritas);
        }
      }
      
      setCargando(false);
    };

    cargarFavoritos();
  }, []);

  const quitarFavorito = async (recetaId) => {
    const res = await RecetasService.actualizarFavorito(recetaId, false);
    
    if (res.ok) {
      setFavoritos(favoritos.filter(r => r.id !== recetaId));
      setNotificacion({
        visible: true,
        titulo: 'Quitado',
        mensaje: 'Receta eliminada de favoritos'
      });
    } else {
      setNotificacion({
        visible: true,
        titulo: 'Error',
        mensaje: res.msg || 'No se pudo quitar de favoritos'
      });
    }
  };

  if (cargando) {
    return (
      <div className="favoritos-screen">
        <div className="favoritos-container">
          <p>Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favoritos-screen">
      <div className="favoritos-container">
        <h1>Mis favoritos</h1>
        
        {favoritos.length === 0 ? (
          <p className="sin-favoritos">No tienes recetas favoritas aún</p>
        ) : (
          <div className="favoritos-grid">
            {favoritos.map((receta) => (
              <div key={receta.id} className="tarjeta-favorito">
                <img src={receta.imagen} alt={receta.nombre} className="imagen-favorito" />
                
                <div className="info-favorito">
                  <h2>{receta.nombre}</h2>
                  <p className="autor">{receta.autor}</p>
                  
                  <button 
                    className="btn-quitar"
                    onClick={() => quitarFavorito(receta.id)}
                  >
                    Quitar de favoritos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Notificacion
        visible={notificacion.visible}
        titulo={notificacion.titulo}
        mensaje={notificacion.mensaje}
        onCerrar={() => setNotificacion({ ...notificacion, visible: false })}
      />
    </div>
  );
}

export default Favoritos;
