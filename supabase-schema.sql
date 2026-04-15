create table if not exists public.products (
  id bigint generated always as identity primary key,
  naziv text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workers (
  id bigint generated always as identity primary key,
  ime text not null,
  prezime text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.worker_product_counts (
  product_id bigint not null references public.products(id) on delete cascade,
  worker_id bigint not null references public.workers(id) on delete cascade,
  counter integer not null default 0 check (counter >= 0),
  updated_at timestamptz not null default now(),
  primary key (product_id, worker_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


drop trigger if exists trg_worker_product_counts_updated_at on public.worker_product_counts;
create trigger trg_worker_product_counts_updated_at
before update on public.worker_product_counts
for each row
execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.workers enable row level security;
alter table public.worker_product_counts enable row level security;

drop policy if exists "public read products" on public.products;
create policy "public read products"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "public write products" on public.products;
create policy "public write products"
on public.products
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public read workers" on public.workers;
create policy "public read workers"
on public.workers
for select
to anon, authenticated
using (true);

drop policy if exists "public write workers" on public.workers;
create policy "public write workers"
on public.workers
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public read counts" on public.worker_product_counts;
create policy "public read counts"
on public.worker_product_counts
for select
to anon, authenticated
using (true);

drop policy if exists "public write counts" on public.worker_product_counts;
create policy "public write counts"
on public.worker_product_counts
for all
to anon, authenticated
using (true)
with check (true);
