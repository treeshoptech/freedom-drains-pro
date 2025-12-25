-- Freedom Drains Pro Database Schema
-- Run this in Supabase SQL Editor

-- Projects table (stores drainage designs)
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  lat numeric,
  lng numeric,
  design_data jsonb not null default '{"type":"FeatureCollection","features":[]}',
  total_lf numeric default 0,
  parallel_lf numeric default 0,
  transition_count integer default 0,
  stormwater_count integer default 0,
  total_cost numeric default 0,
  status text default 'draft',
  customer_name text,
  customer_phone text,
  customer_email text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Settings table (pricing config)
create table settings (
  id uuid primary key default gen_random_uuid(),
  rate_per_lf numeric default 50,
  promo_rate_per_lf numeric default 35,
  parallel_rate numeric default 25,
  transition_box_price numeric default 400,
  stormwater_box_price numeric default 750,
  promo_active boolean default true,
  promo_end_date date default '2026-03-31',
  home_depot_hydroblox_url text default 'https://www.homedexl.com/s/hydroblox',
  home_depot_trencher_url text default 'https://www.homedepot.com/tool-truck-rental/Trencher'
);

-- Insert default settings row
insert into settings (id) values (gen_random_uuid());

-- Enable Row Level Security
alter table projects enable row level security;
alter table settings enable row level security;

-- Allow authenticated users to CRUD projects
create policy "Users can manage projects" on projects for all using (true);
create policy "Users can read settings" on settings for select using (true);
