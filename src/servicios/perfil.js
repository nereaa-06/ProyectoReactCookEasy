import { supabase } from './supabaseClient';

// Devuelve el usuario logueado.
const obtenerUsuario = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

const perfilVacio = (user) => ({
  nombreUsuario: user?.user_metadata?.nombre_usuario || '',
  nombreCompleto: user?.user_metadata?.nombre || '',
  telefono: '',
  email: user?.email || '',
  foto: ''
});

export const PerfilService = {
  obtener: async () => {
    // Busca el perfil y si no existe, crea uno vacio para la UI.
    const user = await obtenerUsuario();
    if (!user) {
      return { ok: false, msg: 'Sesion no valida' };
    }

    const { data, error } = await supabase
      .from('perfiles')
      .select('nombre_usuario, nombre_completo, telefono, email, foto')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      return { ok: false, msg: error.message || 'No se pudo cargar el perfil' };
    }

    if (!data) {
      return { ok: true, perfil: perfilVacio(user) };
    }

    return {
      ok: true,
      perfil: {
        nombreUsuario: data.nombre_usuario || '',
        nombreCompleto: data.nombre_completo || '',
        telefono: data.telefono || '',
        email: data.email || user.email || '',
        foto: data.foto || ''
      }
    };
  },

  guardar: async (perfil) => {
    // Guarda los cambios del formulario en Supabase.
    const user = await obtenerUsuario();
    if (!user) {
      return { ok: false, msg: 'Sesion no valida' };
    }

    const nuevoPerfil = {
      id: user.id,
      nombre_usuario: String(perfil.nombreUsuario || '').trim(),
      nombre_completo: String(perfil.nombreCompleto || '').trim(),
      telefono: String(perfil.telefono || '').trim(),
      email: String(perfil.email || user.email || '').trim(),
      foto: String(perfil.foto || ''),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('perfiles').upsert(nuevoPerfil);

    if (error) {
      return { ok: false, msg: error.message || 'No se pudo guardar el perfil' };
    }

    return { ok: true };
  }
};
