import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const claveAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !claveAnon) {
  throw new Error('Faltan variables de entorno de Supabase. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(url, claveAnon);
