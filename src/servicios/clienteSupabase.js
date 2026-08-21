// Archivo que prepara la conexión con Supabase para que el resto de la aplicación pueda usar la base de datos.
// Importación de la función oficial para crear la conexión con Supabase.
import { createClient } from '@supabase/supabase-js'

// Se leen las credenciales desde .env para no escribirlas directamente dentro del código.
const urlSupabase = import.meta.env.VITE_SUPABASE_URL
const claveAnonimaSupabase = import.meta.env.VITE_SUPABASE_ANON_KEY

// Control previo: indica si existen las dos credenciales necesarias antes de intentar una consulta.
export const supabaseConfigurado = Boolean(urlSupabase && claveAnonimaSupabase)

// Crea un solo cliente reutilizable. Si faltan credenciales se deja en null para evitar una conexión incompleta.
export const clienteSupabase = supabaseConfigurado
  ? createClient(urlSupabase, claveAnonimaSupabase)
  : null
