-- =====================================================================
--  ZAPATILLERÍA DELFI — Base de datos para Supabase
--  Se pega TODO junto en Supabase > SQL Editor > New query > Run.
--  Se corre una sola vez, en un proyecto NUEVO (no el de FERRE).
-- =====================================================================

create extension if not exists pgcrypto;

-- Los productos que se ven en el catálogo
create table if not exists public.productos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  categoria   text not null default 'zapatilla' check (categoria in ('zapatilla', 'ojota')),
  precio      numeric(12,2) not null default 0,
  talles      jsonb not null default '[]',   -- ej: ["35","36","37"]
  colores     text not null default '',      -- ej: "Negro, Blanco"
  descripcion text not null default '',
  foto_url    text not null default '',
  activo      boolean not null default true, -- false = no se ve en la página
  creado      timestamptz not null default now()
);

-- Seguridad: el público solo VE los productos visibles.
-- Agregar, cambiar o borrar lo puede hacer solo quien entra con usuario y contraseña.
alter table public.productos enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.productos to anon;
grant select, insert, update, delete on public.productos to authenticated;

create policy "publico ve productos visibles" on public.productos for select to anon using (activo);
create policy "admin maneja productos" on public.productos for all to authenticated using (true) with check (true);

-- Carpeta pública para las fotos
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true) on conflict (id) do nothing;
create policy "admin sube fotos"   on storage.objects for insert to authenticated with check (bucket_id = 'fotos');
create policy "admin cambia fotos" on storage.objects for update to authenticated using (bucket_id = 'fotos');
create policy "admin borra fotos"  on storage.objects for delete to authenticated using (bucket_id = 'fotos');
