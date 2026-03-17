import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RecetasService } from '../servicios/recetas';
import Notificacion from '../componentes/Notificacion';
import './DetalleReceta.css';

function DetalleReceta() {
  // Toma el id de la receta desde la URL.
  const { id } = useParams();
  const idReceta = String(id);

  const [receta, setReceta] = useState(null);
  const [esFavorito, setEsFavorito] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [noti, setNoti] = useState({ abierta: false, titulo: '', mensaje: '' });

  useEffect(() => {
    const cargarDetalle = async () => {
      // Cargamos receta y favoritos juntos para tardar menos.
      const [detalle, favoritos] = await Promise.all([
        RecetasService.obtenerPorId(idReceta),
        RecetasService.obtenerFavoritos()
      ]);

      setReceta(detalle.ok ? detalle.receta : null);

      if (favoritos.ok) {
        setEsFavorito(favoritos.favoritos.includes(idReceta));
      }

      setCargando(false);
    };

    cargarDetalle();
  }, [idReceta]);

  const manejarFavorito = async () => {
    // Actualiza favorito en pantalla y luego en base de datos.
    const nuevoEstado = !esFavorito;
    setEsFavorito(nuevoEstado);

    const res = await RecetasService.actualizarFavorito(idReceta, nuevoEstado);
    if (!res.ok) {
      setEsFavorito(!nuevoEstado);
      setNoti({ abierta: true, titulo: 'Error', mensaje: res.msg || 'No se pudo actualizar favorito' });
    }
  };

  if (cargando) {
    return (
      <div className="detalle-contenedor">
        <div className="error-box">
          <h2>Cargando receta...</h2>
        </div>
      </div>
    );
  }

  if (!receta) {
    return (
      <div className="detalle-contenedor">
        <div className="error-box">
          <h2>Ups, esta receta ya no existe</h2>
          <Link to="/recetas" className="btn-volver-estetico">Volver al listado</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="detalle-contenedor">
        <Link to="/recetas" className="btn-volver-estetico">
          <span>←</span> Volver al listado
        </Link>

        <div className="receta-card">
          <div className="imagen-header">
            <img src={receta.imagen} alt={receta.nombre} />
            <button 
              className={`btn-corazon ${esFavorito ? 'activo' : ''}`}
              onClick={manejarFavorito}
            >
              {esFavorito ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="contenido-receta">
            <h1 className="titulo-receta">{receta.nombre}</h1>
            <p className="autor-receta-detalle">Receta creada por: {receta.autor}</p>
            
            <div className="seccion-info">
              <div className="seccion-ingredientes">
                <h3>Ingredientes</h3>
                <ul>
                  {Array.isArray(receta.ingredientes) ? (
                    receta.ingredientes.map((ing, index) => (
                      <li key={index}>{ing}</li>
                    ))
                  ) : (
                    <li>{receta.ingredientes}</li>
                  )}
                </ul>
              </div>

              <div className="seccion-instrucciones">
                <h3>Preparación</h3>
                <p className="texto-preparacion">{receta.instrucciones}</p>
              </div>
            </div>
          </div>
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

export default DetalleReceta;