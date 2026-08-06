import { createClient } from '@supabase/supabase-js'

// Cliente unico de Supabase. Las credenciales se colocan en el archivo .env.
const urlSupabase = import.meta.env.VITE_SUPABASE_URL
const claveAnonimaSupabase = import.meta.env.VITE_SUPABASE_ANON_KEY

// Permite mostrar una advertencia si faltan las credenciales.
export const supabaseConfigurado = Boolean(urlSupabase && claveAnonimaSupabase)

// createClient es la referencia oficial de la libreria de Supabase para conectarse al proyecto.
export const clienteSupabase = supabaseConfigurado
  ? createClient(urlSupabase, claveAnonimaSupabase)
  : null
