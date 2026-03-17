-- SQL schema para CookEasy

create extension if not exists "pgcrypto";

-- Tablas
create table if not exists recetas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  imagen text not null,
  ingredientes text not null,
  instrucciones text not null,
  created_at timestamp default now()
);

create table if not exists favoritos (
  user_id uuid not null references auth.users(id) on delete cascade,
  receta_id uuid not null references recetas(id) on delete cascade,
  primary key (user_id, receta_id)
);

create table if not exists perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_usuario text,
  nombre_completo text,
  telefono text,
  email text not null,
  foto text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table perfiles add column if not exists nombre_usuario text;
alter table perfiles add column if not exists nombre_completo text;
alter table perfiles add column if not exists telefono text;
alter table perfiles add column if not exists email text;
alter table perfiles add column if not exists foto text;

-- Unique: nombre_usuario
create unique index if not exists idx_perfiles_nombre_usuario_unico
on perfiles (lower(nombre_usuario))
where nombre_usuario is not null and nombre_usuario <> '';

-- Habilitar RLS que es la base de la seguridad en Supabase
alter table recetas enable row level security;
alter table favoritos enable row level security;
alter table perfiles enable row level security;

-- Políticas: Recetas

drop policy if exists recetas_select_public on recetas;
create policy recetas_select_public on recetas
for select using (auth.role() = 'authenticated');

drop policy if exists recetas_insert_owner on recetas;
create policy recetas_insert_owner on recetas
for insert with check (auth.uid() = user_id);

drop policy if exists recetas_update_owner on recetas;
create policy recetas_update_owner on recetas
for update using (auth.uid() = user_id);

drop policy if exists recetas_delete_owner on recetas;
create policy recetas_delete_owner on recetas
for delete using (auth.uid() = user_id);

-- Políticas: Favoritos
drop policy if exists favoritos_select_owner on favoritos;
create policy favoritos_select_owner on favoritos
for select using (auth.uid() = user_id);

drop policy if exists favoritos_insert_owner on favoritos;
create policy favoritos_insert_owner on favoritos
for insert with check (auth.uid() = user_id);

drop policy if exists favoritos_delete_owner on favoritos;
create policy favoritos_delete_owner on favoritos
for delete using (auth.uid() = user_id);

-- Políticas: Perfiles
drop policy if exists perfiles_select_owner on perfiles;
create policy perfiles_select_owner on perfiles
for select using (auth.uid() = id);

drop policy if exists perfiles_select_public on perfiles;
create policy perfiles_select_public on perfiles
for select using (auth.role() = 'authenticated');

drop policy if exists perfiles_insert_owner on perfiles;
create policy perfiles_insert_owner on perfiles
for insert with check (auth.uid() = id);

drop policy if exists perfiles_update_owner on perfiles;
create policy perfiles_update_owner on perfiles
for update using (auth.uid() = id);

-- Trigger: crear perfil al registrarse
create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre_usuario, nombre_completo, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre_usuario', 'usuario'),
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_crear_perfil_usuario on auth.users;
create trigger trg_crear_perfil_usuario
after insert on auth.users
for each row execute function public.crear_perfil_usuario();

-- Crear perfiles que falten
insert into public.perfiles (id, nombre_usuario, nombre_completo, email)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'nombre_usuario', 'usuario'),
  coalesce(u.raw_user_meta_data ->> 'nombre', ''),
  coalesce(u.email, '')
from auth.users u
on conflict (id) do nothing;

-- Función para eliminar usuario completo
create or replace function public.eliminar_usuario_completo(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.favoritos where user_id = p_user_id;
  delete from public.recetas where user_id = p_user_id;
  delete from public.perfiles where id = p_user_id;
  delete from auth.users where id = p_user_id;
end;
$$;
