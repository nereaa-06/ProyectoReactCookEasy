import { supabase } from './supabaseClient';
import { recetasIniciales } from './datos';

let sembrando = false;

// Convierte ingredientes a una lista limpia de texto.
const pasarALista = (ingredientes) => {
  if (Array.isArray(ingredientes)) {
    return ingredientes.map((item) => String(item).trim()).filter(Boolean);
  }

  const valor = String(ingredientes || '').trim();
  if (!valor) return [];

  // JSON en texto
  if (valor.startsWith('[')) {
    try {
      const parsed = JSON.parse(valor);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return [valor];
    }
  }

  const separador = valor.includes('\n') ? '\n' : ',';
  return valor
    .split(separador)
    .map((item) => item.trim())
    .map((item) => item.replace(/^\[+|\]+$/g, '').replace(/^"+|"+$/g, '').trim())
    .filter(Boolean);
};

const aRecetaUI = (fila) => ({
  id: String(fila.id),
  userId: String(fila.user_id),
  nombre: fila.nombre,
  imagen: fila.imagen,
  ingredientes: pasarALista(fila.ingredientes),
  instrucciones: fila.instrucciones,
  esMia: false,
  autor: 'Usuario'
});

// Devuelve el usuario actual desde Supabase.
const obtenerUsuario = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

const sacarNombreAutor = (usuario) => {
  return usuario?.user_metadata?.nombre || usuario?.email?.split('@')[0] || 'Usuario';
};

const ponerAutores = async (listaRecetas) => {
  // Busca el nombre de cada autor para mostrarlo en tarjetas.
  const ids = [...new Set(listaRecetas.map((receta) => receta.userId))];
  if (ids.length === 0) return listaRecetas;

  const { data } = await supabase
    .from('perfiles')
    .select('id, nombre_usuario, nombre_completo')
    .in('id', ids);

  const mapaAutores = {};
  (data || []).forEach((perfil) => {
    mapaAutores[String(perfil.id)] = perfil.nombre_usuario || perfil.nombre_completo || 'Usuario';
  });

  return listaRecetas.map((receta) => ({
    ...receta,
    autor: mapaAutores[receta.userId] || 'Usuario'
  }));
};

const crearRecetasEjemplo = async (idUsuario) => {
  const listaNueva = recetasIniciales.map((receta) => ({
    user_id: idUsuario,
    nombre: receta.nombre,
    imagen: receta.imagen,
    ingredientes: pasarALista(receta.ingredientes),
    instrucciones: receta.instrucciones
  }));

  const { error } = await supabase.from('recetas').insert(listaNueva);
  if (error) {
    return { ok: false, msg: 'No se pudo crear las recetas de ejemplo' };
  }
  return { ok: true };
};

export const RecetasService = {
  listar: async () => {
    // Trae recetas; si no hay, crea algunas de ejemplo.
    const usuario = await obtenerUsuario();
    if (!usuario) {
      return { ok: false, msg: 'Sesion no valida' };
    }

    const { data, error } = await supabase
      .from('recetas')
      .select('id, user_id, nombre, imagen, ingredientes, instrucciones, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return { ok: false, msg: 'No se pudieron cargar las recetas' };
    }

    if (!data || data.length === 0) {
      if (sembrando) {
        const recargaRapida = await supabase
          .from('recetas')
          .select('id, user_id, nombre, imagen, ingredientes, instrucciones, created_at')
          .order('created_at', { ascending: false });

        if (recargaRapida.error) {
          return { ok: false, msg: 'Error al cargar recetas' };
        }

        const listaBase = (recargaRapida.data || []).map((fila) => ({
          ...aRecetaUI(fila),
          esMia: String(fila.user_id) === usuario.id
        }));
        const lista = await ponerAutores(listaBase);
        return { ok: true, recetas: lista };
      }

      sembrando = true;
      const seed = await crearRecetasEjemplo(usuario.id);
      sembrando = false;

      if (!seed.ok) return seed;

      const recarga = await supabase
        .from('recetas')
        .select('id, user_id, nombre, imagen, ingredientes, instrucciones, created_at')
        .order('created_at', { ascending: false });

      if (recarga.error) {
        return { ok: false, msg: 'Error al cargar recetas' };
      }

      const listaBase = (recarga.data || []).map((fila) => ({
        ...aRecetaUI(fila),
        esMia: String(fila.user_id) === usuario.id
      }));
      const lista = await ponerAutores(listaBase);
      return { ok: true, recetas: lista };
    }

    const listaBase = (data || []).map((fila) => ({
      ...aRecetaUI(fila),
      esMia: String(fila.user_id) === usuario.id
    }));
    const lista = await ponerAutores(listaBase);
    return { ok: true, recetas: lista };
  },

  crear: async ({ nombre, imagen, ingredientes, instrucciones }) => {
    // Inserta una receta nueva del usuario actual.
    const usuario = await obtenerUsuario();
    if (!usuario) {
      return { ok: false, msg: 'Sesion no valida' };
    }

    const nombreLimpio = String(nombre || '').trim();
    if (!nombreLimpio) {
      return { ok: false, msg: 'El nombre de la receta es obligatorio' };
    }

    const nuevaReceta = {
      user_id: usuario.id,
      nombre: nombreLimpio,
      imagen,
      ingredientes: pasarALista(ingredientes),
      instrucciones: String(instrucciones || '').trim()
    };

    const { data, error } = await supabase
      .from('recetas')
      .insert(nuevaReceta)
      .select('id, user_id, nombre, imagen, ingredientes, instrucciones')
      .single();

    if (error) {
      return { ok: false, msg: 'No se pudo guardar la receta' };
    }

    const recetaBase = {
      ...aRecetaUI(data),
      esMia: true,
      autor: sacarNombreAutor(usuario)
    };

    const receta = await ponerAutores([recetaBase]);
    return { ok: true, receta: receta[0] };
  },

  eliminar: async (id) => {
    // Elimina favoritos ligados y luego la receta.
    const usuario = await obtenerUsuario();
    if (!usuario) {
      return { ok: false, msg: 'Sesion no valida' };
    }

    await supabase.from('favoritos').delete().eq('receta_id', id);

    const { error } = await supabase
      .from('recetas')
      .delete()
      .eq('id', id)
      .eq('user_id', usuario.id);

    if (error) {
      return { ok: false, msg: 'No se pudo eliminar la receta' };
    }

    return { ok: true };
  },

  obtenerPorId: async (id) => {
    const usuario = await obtenerUsuario();
    if (!usuario) {
      return { ok: false, msg: 'Sesion no valida' };
    }

    const { data, error } = await supabase
      .from('recetas')
      .select('id, user_id, nombre, imagen, ingredientes, instrucciones')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return { ok: false, msg: 'No se pudo obtener la receta' };
    }

    if (!data) {
      return { ok: true, receta: null };
    }

    const recetaBase = {
      ...aRecetaUI(data),
      esMia: String(data.user_id) === usuario.id
    };
    const recetaConAutor = await ponerAutores([recetaBase]);
    return { ok: true, receta: recetaConAutor[0] };
  },

  obtenerFavoritos: async () => {
    const usuario = await obtenerUsuario();
    if (!usuario) {
      return { ok: false, msg: 'Sesion no valida' };
    }

    const { data, error } = await supabase.from('favoritos').select('receta_id').eq('user_id', usuario.id);
    if (error) {
      return { ok: false, msg: 'No se pudieron cargar favoritos' };
    }

    const ids = (data || []).map((item) => String(item.receta_id));
    return { ok: true, favoritos: ids };
  },

  actualizarFavorito: async (recetaId, esFavorito) => {
    // Marca o desmarca favorito segun el estado recibido.
    const usuario = await obtenerUsuario();
    if (!usuario) {
      return { ok: false, msg: 'Sesion no valida' };
    }

    if (esFavorito) {
      const { error } = await supabase.from('favoritos').upsert({
        user_id: usuario.id,
        receta_id: recetaId
      });
      if (error) {
        return { ok: false, msg: 'No se pudo guardar favorito' };
      }
      return { ok: true };
    }

    const { error } = await supabase
      .from('favoritos')
      .delete()
      .eq('user_id', usuario.id)
      .eq('receta_id', recetaId);

    if (error) {
      return { ok: false, msg: 'No se pudo quitar favorito' };
    }

    return { ok: true };
  }
};
