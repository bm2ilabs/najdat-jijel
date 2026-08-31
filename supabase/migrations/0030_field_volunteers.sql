-- ==============================================================================
-- 0030_field_volunteers.sql
-- وحدة التطوع الميداني والإغاثي (المتطوعون في الميدان ومراكز الفرز والتوزيع)
-- ==============================================================================

-- 1. Enum لحالة التطوع الميداني
do $$ begin
    create type field_volunteer_status as enum ('pending', 'verified', 'deployed', 'inactive');
exception
    when duplicate_object then null;
end $$;

-- 2. جدول المتطوعين الميدانيين
create table if not exists public.field_volunteers (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    phone text not null,
    wilaya_code text not null,
    commune_id text not null,
    skills text[] not null default '{}',
    mobility text not null default 'none',
    availability text not null default 'immediate',
    equipment text[] not null default '{}',
    emergency_contact text,
    notes text,
    show_phone_publicly boolean not null default false,
    status field_volunteer_status not null default 'pending',
    verified_by uuid references public.profiles(id) on delete set null,
    verified_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- فهارس للبحث السريع
create index if not exists idx_field_volunteers_status on public.field_volunteers(status);
create index if not exists idx_field_volunteers_wilaya on public.field_volunteers(wilaya_code);
create index if not exists idx_field_volunteers_commune on public.field_volunteers(commune_id);

-- مشغل تحديث وقت التعديل
drop trigger if exists trg_field_volunteers_updated_at on public.field_volunteers;
create trigger trg_field_volunteers_updated_at
    before update on public.field_volunteers
    for each row execute function public.set_updated_at();

-- 3. تفعيل وحماية سياسات الوصول (RLS)
alter table public.field_volunteers enable row level security;

drop policy if exists field_volunteers_public_insert on public.field_volunteers;
drop policy if exists field_volunteers_staff_select on public.field_volunteers;
drop policy if exists field_volunteers_manager_update on public.field_volunteers;
drop policy if exists field_volunteers_manager_delete on public.field_volunteers;

create policy field_volunteers_public_insert on public.field_volunteers
    for insert to anon, authenticated with check (true);

create policy field_volunteers_staff_select on public.field_volunteers
    for select using (public.is_staff());

create policy field_volunteers_manager_update on public.field_volunteers
    for update using (public.is_manager());

create policy field_volunteers_manager_delete on public.field_volunteers
    for delete using (public.is_manager());

-- 4. دالة RPC آمنة لجلب المتطوعين المعتمدين الذين وافقوا على نشر بياناتهم
create or replace function public.get_public_field_volunteers()
returns table (
    id uuid,
    full_name text,
    wilaya_code text,
    commune_id text,
    skills text[],
    mobility text,
    availability text,
    phone text
)
language sql stable security definer set search_path = public as $$
    select id, full_name, wilaya_code, commune_id, skills, mobility, availability,
        case when show_phone_publicly then phone else null end
    from public.field_volunteers
    where status = 'verified' or status = 'deployed';
$$;

grant execute on function public.get_public_field_volunteers() to anon, authenticated;
