-- ============================================================
-- Hauscenter · Generador de cupones para lives
-- Pega este archivo completo en Supabase > SQL Editor > Run
-- ============================================================

-- ---------- Tablas ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'vendedor' check (role in ('vendedor', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  percentage int not null check (percentage between 1 and 100),
  applies_to text not null,              -- ej: "refrigeradores Hova"
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,             -- único valor único: el código
  discount_id uuid references public.discounts(id) on delete set null,
  discount_percent int not null,         -- copia fija (la llena el trigger)
  applies_to text not null,              -- copia fija (la llena el trigger)
  tiktok_profile text check (tiktok_profile is null or tiktok_profile ~ '^[a-z0-9._]{2,24}$'),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists coupons_created_at_idx on public.coupons (created_at desc);
create index if not exists coupons_created_by_idx on public.coupons (created_by);

-- ---------- Funciones auxiliares ----------
create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and active);
$$;

-- Perfil automático al crear un usuario en Authentication (siempre como vendedor).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Al insertar un cupón: valida el descuento, copia sus valores y fija el autor.
-- Así un vendedor no puede inventar porcentajes ni firmar como otro usuario.
create or replace function public.coupons_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  d public.discounts%rowtype;
begin
  select * into d from public.discounts where id = new.discount_id and active;
  if not found then
    raise exception 'Descuento no disponible' using errcode = 'P0001';
  end if;
  new.discount_percent := d.percentage;
  new.applies_to := d.applies_to;
  new.created_by := auth.uid();
  new.code := upper(btrim(new.code));
  new.tiktok_profile := nullif(lower(regexp_replace(btrim(coalesce(new.tiktok_profile, '')), '^@+', '')), '');
  return new;
end;
$$;

drop trigger if exists coupons_before_insert on public.coupons;
create trigger coupons_before_insert
  before insert on public.coupons
  for each row execute function public.coupons_before_insert();

-- Estadísticas para el panel de administración
create or replace function public.coupon_stats()
returns json language plpgsql stable security definer set search_path = public as $$
declare
  result json;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  select json_build_object(
    'total', (select count(*) from public.coupons),
    'today', (select count(*) from public.coupons
              where (created_at at time zone 'America/La_Paz')::date = (now() at time zone 'America/La_Paz')::date),
    'with_tiktok', (select count(*) from public.coupons where tiktok_profile is not null),
    'by_discount', coalesce((
      select json_agg(x order by x.count desc)
      from (select discount_percent as percent, applies_to, count(*)::int as count
            from public.coupons group by 1, 2) x), '[]'::json),
    'by_seller', coalesce((
      select json_agg(y order by y.count desc)
      from (select coalesce(nullif(p.full_name, ''), 'Sin nombre') as name, count(*)::int as count
            from public.coupons c join public.profiles p on p.id = c.created_by
            group by 1) y), '[]'::json)
  ) into result;

  return result;
end;
$$;

grant execute on function public.coupon_stats() to authenticated;

-- ---------- Seguridad (RLS) ----------
alter table public.profiles  enable row level security;
alter table public.discounts enable row level security;
alter table public.coupons   enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists discounts_select on public.discounts;
create policy discounts_select on public.discounts for select to authenticated
  using ((active and public.is_active_user()) or public.is_admin());

drop policy if exists discounts_admin_insert on public.discounts;
create policy discounts_admin_insert on public.discounts for insert to authenticated
  with check (public.is_admin());

drop policy if exists discounts_admin_update on public.discounts;
create policy discounts_admin_update on public.discounts for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists discounts_admin_delete on public.discounts;
create policy discounts_admin_delete on public.discounts for delete to authenticated
  using (public.is_admin());

drop policy if exists coupons_select on public.coupons;
create policy coupons_select on public.coupons for select to authenticated
  using (created_by = auth.uid() or public.is_admin());

drop policy if exists coupons_insert on public.coupons;
create policy coupons_insert on public.coupons for insert to authenticated
  with check (public.is_active_user());

drop policy if exists coupons_admin_update on public.coupons;
create policy coupons_admin_update on public.coupons for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists coupons_admin_delete on public.coupons;
create policy coupons_admin_delete on public.coupons for delete to authenticated
  using (public.is_admin());

-- ---------- Descuentos iniciales (solo si la tabla está vacía) ----------
insert into public.discounts (percentage, applies_to, sort_order)
select v.percentage, v.applies_to, v.sort_order
from (values
  (5,  'cualquier producto',            10),
  (10, 'refrigeradores Hova',           20),
  (10, 'electrodomésticos Bonatti',     30),
  (10, 'aires acondicionados Polarmax', 40),
  (20, 'menaje Westinghouse',           50),
  (50, 'soporte Lumi',                  60)
) as v(percentage, applies_to, sort_order)
where not exists (select 1 from public.discounts);

-- ============================================================
-- DESPUÉS de crear tus 2 usuarios en Authentication > Users,
-- convierte uno en administrador (el otro queda como vendedor):
--
-- update public.profiles
--    set role = 'admin', full_name = 'Tu nombre'
--  where id = (select id from auth.users where email = 'admin@tuempresa.com');
--
-- update public.profiles
--    set full_name = 'Nombre del vendedor'
--  where id = (select id from auth.users where email = 'vendedor@tuempresa.com');
-- ============================================================
