-- Ampliación aditiva: no modifica documentos guardados ni reescribe migraciones aplicadas.
insert into public.cs_templates(id,name,plan) values
 ('clarity','Claridad','free'),('ledger','Oficio','free'),
 ('frame','Marco','pro'),('horizon','Horizonte','pro'),
 ('signature','Firma','premium'),('atelier','Atelier','premium')
on conflict (id) do nothing;

create or replace function public.cs_validate_quote(p_data jsonb) returns void language plpgsql set search_path=public,pg_temp as $$
 declare item jsonb; p numeric; qty numeric; dto numeric; taxrate numeric;
 begin
 if jsonb_typeof(p_data)<>'object' or length(trim(coalesce(p_data->>'title',''))) not between 3 and 160 or length(trim(coalesce(p_data->'customer'->>'name',''))) not between 2 and 160 or coalesce(jsonb_typeof(p_data->'items'),'')<>'array' or jsonb_array_length(p_data->'items') not between 1 and 100 then raise exception 'VALIDATION_ERROR'; end if;
 if coalesce(p_data->'design'->>'color','') !~ '^#[0-9a-fA-F]{6}$' or coalesce(p_data->'design'->>'font','') not in ('sans','serif','humanist','mono') then raise exception 'VALIDATION_ERROR'; end if;
 if coalesce(jsonb_typeof(p_data->'design'->'show_logo'),'')<>'boolean' or coalesce(jsonb_typeof(p_data->'design'->'show_notes'),'')<>'boolean' or coalesce(jsonb_typeof(p_data->'design'->'show_terms'),'')<>'boolean' then raise exception 'VALIDATION_ERROR'; end if;
 if length(coalesce(p_data->>'notes',''))>2000 or length(coalesce(p_data->>'terms',''))>3000 or length(coalesce(p_data->'customer'->>'email',''))>254 or length(coalesce(p_data->'customer'->>'phone',''))>30 or length(coalesce(p_data->'customer'->>'address',''))>400 or length(coalesce(p_data->'customer'->>'rfc',''))>20 then raise exception 'VALIDATION_ERROR'; end if;
 if coalesce(p_data->>'valid_until','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'VALIDATION_ERROR'; end if;
 perform (p_data->>'valid_until')::date;
 if coalesce(jsonb_typeof(p_data->'tax_rate'),'')<>'number' then raise exception 'VALIDATION_ERROR'; end if;
 taxrate := (p_data->>'tax_rate')::numeric;
 if taxrate is null or taxrate not in (0,16) then raise exception 'VALIDATION_ERROR'; end if;
 for item in select value from jsonb_array_elements(p_data->'items') loop
  if coalesce(jsonb_typeof(item->'unit_price'),'')<>'number' or coalesce(jsonb_typeof(item->'quantity'),'')<>'number' or coalesce(jsonb_typeof(item->'discount'),'')<>'number' then raise exception 'VALIDATION_ERROR'; end if;
  p := (item->>'unit_price')::numeric; qty := (item->>'quantity')::numeric; dto := (item->>'discount')::numeric;
  if p is null or qty is null or dto is null or p<0 or p>10000000 or round(p,2)<>p or qty<=0 or qty>100000 or round(qty,3)<>qty or dto<0 or dto>100 or round(dto,2)<>dto or coalesce(item->>'kind','') not in ('product','service') or length(trim(coalesce(item->>'description',''))) not between 1 and 500 or length(coalesce(item->>'unit',''))>30 or length(coalesce(item->>'id','')) not between 1 and 100 then raise exception 'VALIDATION_ERROR'; end if;
 end loop;
 if (select sum((value->>'quantity')::numeric * (value->>'unit_price')::numeric) from jsonb_array_elements(p_data->'items'))>1000000000000 then raise exception 'VALIDATION_ERROR'; end if;
 if (select count(distinct value->>'id') from jsonb_array_elements(p_data->'items')) <> jsonb_array_length(p_data->'items') then raise exception 'VALIDATION_ERROR'; end if;
 end;
$$;

create table public.cs_notifications (
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null unique references public.cs_quote_events(id) on delete cascade,
 quote_id uuid not null references public.cs_quotes(id) on delete cascade,
 business_id uuid not null references public.cs_businesses(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('accepted','rejected')),
 created_at timestamptz not null default now(), read_at timestamptz
);
create index cs_notifications_inbox on public.cs_notifications(user_id,created_at desc);
create index cs_notifications_unread on public.cs_notifications(user_id) where read_at is null;
alter table public.cs_notifications enable row level security;
create policy cs_notifications_owner on public.cs_notifications for select to authenticated
 using(user_id=(select auth.uid()) and exists(select 1 from public.cs_businesses b where b.id=business_id and b.owner_id=(select auth.uid())));
revoke all on public.cs_notifications from anon,authenticated;
grant select on public.cs_notifications to authenticated;

-- La notificación nace en la misma transacción que la respuesta pública.
-- La clave única de evento evita duplicados incluso si se reintenta el webhook/endpoint.
create function public.cs_notify_response() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.kind in ('accepted','rejected') then
  insert into public.cs_notifications(event_id,quote_id,business_id,user_id,kind,created_at)
  select new.id,new.quote_id,new.business_id,b.owner_id,new.kind,new.created_at
  from public.cs_businesses b join public.cs_quotes q on q.business_id=b.id
  where b.id=new.business_id and q.id=new.quote_id
  on conflict(event_id) do nothing;
 end if;
 return new;
end;
$$;
create trigger cs_response_notification after insert on public.cs_quote_events
 for each row execute function public.cs_notify_response();

create function public.cs_notifications() returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object(
 'id',n.id,'event_id',n.event_id,'quote_id',n.quote_id,'quote_number',e.quote_number,
 'title',e.title,'customer_name',e.customer_name,'kind',n.kind,'created_at',n.created_at,'read_at',n.read_at
 ) order by n.created_at desc),'[]'::jsonb)
 from public.cs_notifications n join public.cs_quote_events e on e.id=n.event_id
 where n.user_id=auth.uid();
$$;
create function public.cs_mark_notifications_read(p_id uuid default null) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_id is not null and not exists(select 1 from public.cs_notifications n where n.id=p_id and n.user_id=auth.uid()) then raise exception 'NOT_FOUND'; end if;
 update public.cs_notifications n set read_at=coalesce(n.read_at,now())
 where n.user_id=auth.uid() and (p_id is null or n.id=p_id)
 and exists(select 1 from public.cs_businesses b where b.id=n.business_id and b.owner_id=auth.uid());
end;
$$;
revoke execute on function public.cs_notify_response(),public.cs_notifications(),public.cs_mark_notifications_read(uuid) from public,anon,authenticated;
grant execute on function public.cs_notifications(),public.cs_mark_notifications_read(uuid) to authenticated;
