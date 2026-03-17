import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecetasService } from '../servicios/recetas';
import Notificacion from '../componentes/Notificacion';
import './Recetas.css';

function Recetas() {
  const [recetas, setRecetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardandoReceta, setGuardandoReceta] = useState(false);
  const [error, setError] = useState('');
  const [noti, setNoti] = useState({ abierta: false, titulo: '', mensaje: '' });
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [recetaAEliminar, setRecetaAEliminar] = useState(null);
  
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevosIngredientes, setNuevosIngredientes] = useState('');
  const [nuevasInstrucciones, setNuevasInstrucciones] = useState('');
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  useEffect(() => {
    const cargarRecetas = async () => {
      const res = await RecetasService.listar();

      if (res.ok) {
        setRecetas(res.recetas || []);
      } else {
        setNoti({ abierta: true, titulo: 'Error', mensaje: res.msg || 'No se pudieron cargar las recetas' });
      }

      setCargando(false);
    };

    cargarRecetas();
  }, []);

  const manejarArchivo = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenSeleccionada(reader.result);
    };
    reader.readAsDataURL(archivo);
  };

  const limpiarFormulario = () => {
    setNuevoNombre('');
    setNuevosIngredientes('');
    setNuevasInstrucciones('');
    setImagenSeleccionada(null);
  };

  const añadir = async (e) => {
    e.preventDefault();
    if (!imagenSeleccionada) {
      setNoti({ abierta: true, titulo: 'Falta la foto', mensaje: 'Sube una foto de tu plato' });
      return;
    }

    setError('');

    setGuardandoReceta(true);
    const res = await RecetasService.crear({
      nombre: nuevoNombre,
      imagen: imagenSeleccionada,
      // Guardamos ingredientes como lista para mostrarlos en bullets.
      ingredientes: nuevosIngredientes.split('\n').filter((i) => i.trim() !== ''),
      instrucciones: nuevasInstrucciones
    });
    setGuardandoReceta(false);

    if (!res.ok) {
      setNoti({ abierta: true, titulo: 'Error', mensaje: res.msg || 'No se pudo guardar la receta' });
      return;
    }

    setRecetas((prev) => [res.receta, ...prev]);
    setMostrarModal(false);
    limpiarFormulario();
  };

  const confirmarBorrado = async () => {
    if (!recetaAEliminar) {
      return;
    }

    setError('');
    const res = await RecetasService.eliminar(recetaAEliminar.id);
    if (!res.ok) {
      setError(res.msg || 'No se pudo eliminar la receta.');
      return;
    }

    setRecetas((prev) => prev.filter((r) => r.id !== recetaAEliminar.id));
    setRecetaAEliminar(null);
  };

  return (
    <>
      <div className="pagina-recetas-viva">
        <div className="hero-section">
          <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2000" className="banner-vivido" alt="banner" />
          <div className="hero-text">
            <h1>Recetas de la comunidad</h1>
            <p>Aqui puedes ver tus recetas y las de otros usuarios</p>
          </div>
        </div>

        <button className="boton-flotante" onClick={() => setMostrarModal(true)}>+</button>
      
        <div className="contenedor-principal-vivido">
          {error && (
            <div className="estado-vacio">
              <p>{error}</p>
            </div>
          )}

          {cargando && (
            <div className="estado-vacio">
              <p>Cargando recetas...</p>
            </div>
          )}

          <div className="grid-vivido">
            {recetas.map((receta) => (
              <div key={receta.id} className="card-moderna">
                <div className="card-img-container">
                  <img src={receta.imagen} alt={receta.nombre} />
                </div>
                <div className="card-info">
                  <h3>{receta.nombre}</h3>
                  <p className="autor-receta">Por: {receta.autor}</p>
                  <div className="card-btns">
                      <Link to={`/receta/${receta.id}`} className="btn-moderno ver">Ver Receta</Link>
                      {receta.esMia && (
                        <button 
                          onClick={() => setRecetaAEliminar(receta)} 
                          className="btn-moderno borrar"
                        >
                          Eliminar
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        
          {!cargando && recetas.length === 0 && (
            <div className="estado-vacio">
              <p>No hay recetas aun. Pulsa el boton + para crear la primera.</p>
            </div>
          )}
        </div>

        {mostrarModal && (
          <div className="modal-overlay">
            <div className="modal-content scrollable">
              <button className="btn-cerrar-modal" onClick={() => setMostrarModal(false)}>×</button>
              <h2>Nueva Receta</h2>
              <form onSubmit={añadir} className="form-modal">
                <input value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder="Nombre del plato" className="input-moderno" required />
                <textarea value={nuevosIngredientes} onChange={e => setNuevosIngredientes(e.target.value)} placeholder="Ingredientes (uno por línea)..." className="input-moderno area" required />
                <textarea value={nuevasInstrucciones} onChange={e => setNuevasInstrucciones(e.target.value)} placeholder="Pasos de preparación..." className="input-moderno area" required />
                
                <label htmlFor="foto-pc" className="label-foto-moderno">
                  {imagenSeleccionada ? 'Foto cargada' : 'Seleccionar foto'}
                </label>
                <input id="foto-pc" type="file" accept="image/*" onChange={manejarArchivo} style={{display: 'none'}} />
                
                {imagenSeleccionada && <img src={imagenSeleccionada} className="preview-mini" alt="preview" />}
                <button type="submit" className="btn-añadir-final" disabled={guardandoReceta}>
                  {guardandoReceta ? 'Guardando...' : 'Guardar Receta'}
                </button>
              </form>
            </div>
          </div>
        )}

        {recetaAEliminar && (
          <div className="modal-overlay">
            <div className="modal-content confirmacion">
              <h3>¿Estás seguro?</h3>
              <p>Vas a eliminar la receta <strong>"{recetaAEliminar.nombre}"</strong> de forma permanente.</p>
              <div className="modal-btns-confirm">
                <button className="btn-confirmar-si" onClick={confirmarBorrado}>Sí, eliminar</button>
                <button className="btn-confirmar-no" onClick={() => setRecetaAEliminar(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
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

export default Recetas;