import { supabase } from './supabaseClient';

const limpiarNombreUsuario = (texto) => {
  const base = String(texto || '').trim().toLowerCase();
  if (!base) {
    return 'usuario';
  }
  return base
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 30) || 'usuario';
};

const guardarPerfilBasico = async (user, nombre, nombreUsuario) => {
  if (!user) return;
  
  await supabase.from('perfiles').upsert({
    id: user.id,
    nombre_usuario: nombreUsuario || user.user_metadata?.nombre_usuario || limpiarNombreUsuario(nombre),
    nombre_completo: nombre || user.user_metadata?.nombre || '',
    email: user.email || '',
    updated_at: new Date().toISOString()
  });
};

const aUsuarioSimple = (user) => {
  if (!user) return null;
  const nombreSimple = user.user_metadata?.nombre_usuario || user.user_metadata?.nombre || 'Usuario';
  return {
    id: user.id,
    email: user.email,
    nombre: nombreSimple
  };
};

export const AuthService = {
  registrar: async (datos) => {
    const nombre = String(datos?.nombre || '').trim();
    const nombreUsuario = limpiarNombreUsuario(datos?.nombreUsuario || nombre);
    const email = String(datos?.email || '').trim().toLowerCase();
    const password = String(datos?.password || '');

    if (!email || !password) {
      return { ok: false, msg: 'Email y contrasena son obligatorios' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, nombre_usuario: nombreUsuario } }
    });

    if (error) {
      const msg = String(error.message || '').toLowerCase();
      if (msg.includes('idx_perfiles_nombre_usuario_unico') || msg.includes('duplicate key')) {
        return { ok: false, msg: 'Ese nombre de usuario ya existe. Elige otro.' };
      }
      return { ok: false, msg: error.message || 'No se pudo completar el registro' };
    }

    if (!data?.session) {
      return {
        ok: true,
        msg: 'Cuenta creada. Revisa tu correo para confirmar la cuenta antes de iniciar sesion.'
      };
    }

    await guardarPerfilBasico(data.session.user, nombre, nombreUsuario);
    return { ok: true, usuario: aUsuarioSimple(data.session.user) };
  },

  login: async (email, password) => {
    const emailLimpio = String(email || '').trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailLimpio,
      password
    });

    if (error || !data?.user) {
      return { ok: false, msg: error?.message || 'Email o contrasena incorrectos' };
    }

    return { ok: true, usuario: aUsuarioSimple(data.user) };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  obtenerSesionActiva: async () => {
    const { data } = await supabase.auth.getSession();
    return aUsuarioSimple(data?.session?.user);
  },

  suscribirSesion: (alCambiar) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      alCambiar(aUsuarioSimple(session?.user));
    });
    return () => data.subscription.unsubscribe();
  },

  eliminarCuenta: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { ok: false, msg: 'No hay sesion activa' };
      }

      const { error } = await supabase.rpc('eliminar_usuario_completo', {
        p_user_id: user.id
      });

      if (error) {
        return { ok: false, msg: 'Error al eliminar: ' + error.message };
      }

      await supabase.auth.signOut();
      return { ok: true, msg: 'Cuenta eliminada' };
    } catch (err) {
      return { ok: false, msg: 'Error: ' + (err.message || '') };
    }
  }
};