-- ============================================================
-- Permisos de desarrollo para WebTransmetroGT
-- ============================================================
-- Usar este script si los datos existen en Supabase pero la app web
-- no los puede leer con la anon/publishable key.
--
-- Para este proyecto academico se desactiva RLS y se otorgan permisos
-- simples a anon/authenticated. En un sistema real se deben crear
-- politicas RLS mas estrictas por rol.

alter table if exists municipalidades disable row level security;
alter table if exists estaciones disable row level security;
alter table if exists lineas disable row level security;
alter table if exists linea_estacion disable row level security;
alter table if exists accesos disable row level security;
alter table if exists guardias disable row level security;
alter table if exists parqueos disable row level security;
alter table if exists buses disable row level security;
alter table if exists pilotos disable row level security;
alter table if exists usuarios disable row level security;
alter table if exists recorridos disable row level security;
alter table if exists alertas disable row level security;

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on municipalidades to anon, authenticated;
grant select, insert, update, delete on estaciones to anon, authenticated;
grant select, insert, update, delete on lineas to anon, authenticated;
grant select, insert, update, delete on linea_estacion to anon, authenticated;
grant select, insert, update, delete on accesos to anon, authenticated;
grant select, insert, update, delete on guardias to anon, authenticated;
grant select, insert, update, delete on parqueos to anon, authenticated;
grant select, insert, update, delete on buses to anon, authenticated;
grant select, insert, update, delete on pilotos to anon, authenticated;
grant select, insert, update, delete on usuarios to anon, authenticated;
grant select, insert, update, delete on recorridos to anon, authenticated;
grant select, insert, update, delete on alertas to anon, authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;
