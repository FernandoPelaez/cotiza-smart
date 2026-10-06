-- Esquema nuevo, aislado de cualquier instalación anterior. No borra ni transforma datos históricos.
-- Las escrituras de cotizaciones y consumo pasan por funciones transaccionales; no por permisos de tablas.
create table public.cs_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '' check (length(full_name) <= 160), created_at timestamptz not null default now()
);
create table public.cs_businesses (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null unique references auth.users(id) on delete cascade,
 name text not null check (length(name) between 2 and 160), email text not null default '', phone text not null default '', address text not null default '', website text not null default '', rfc text not null default '', logo_url text not null default '',
 activity text not null default 'both' check (activity in ('products','services','both')),
 creations_used integer not null default 0 check (creations_used >= 0), next_quote_number integer not null default 1 check (next_quote_number > 0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.cs_subscriptions (
 business_id uuid primary key references public.cs_businesses(id) on delete cascade,
 plan text not null default 'free' check (plan in ('free','pro','premium')), status text not null default 'free',
 stripe_customer_id text unique, stripe_subscription_id text unique, current_period_end timestamptz, cancel_at_period_end boolean not null default false,
 checkout_lock_id uuid, checkout_lock_until timestamptz,
 last_event_created bigint not null default 0, updated_at timestamptz not null default now()
);
create table public.cs_customers (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.cs_businesses(id) on delete cascade,
 name text not null check (length(name) between 2 and 160), email text not null default '', phone text not null default '', address text not null default '', rfc text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(business_id,id)
);
create index cs_customers_business_name on public.cs_customers(business_id,lower(name));
create table public.cs_templates (
 id text primary key, name text not null, plan text not null check (plan in ('free','pro','premium'))
);
insert into public.cs_templates(id,name,plan) values ('essential','Esencial','free'),('studio','Estudio','pro'),('editorial','Editorial','premium');
create table public.cs_quotes (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.cs_businesses(id) on delete cascade,
 customer_id uuid not null, template_id text not null references public.cs_templates(id), number text not null,
 title text not null check (length(title) between 3 and 160), status text not null default 'draft' check (status in ('draft','sent','viewed','accepted','rejected','expired')),
 document jsonb not null, business_snapshot jsonb, subtotal numeric(18,2) not null default 0, discount numeric(18,2) not null default 0,
 tax numeric(18,2) not null default 0, total numeric(18,2) not null default 0, valid_until date not null,
 creation_request_id uuid not null, revision integer not null default 1 check (revision > 0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), sent_at timestamptz, responded_at timestamptz, deleted_at timestamptz,
 foreign key(business_id,customer_id) references public.cs_customers(business_id,id), unique(business_id,number), unique(business_id,creation_request_id)
);
create index cs_quotes_workspace on public.cs_quotes(business_id,updated_at desc) where deleted_at is null;
create index cs_quotes_status on public.cs_quotes(business_id,status,valid_until) where deleted_at is null;
create table public.cs_quote_items (
 quote_id uuid not null references public.cs_quotes(id) on delete cascade, id text not null, position integer not null check (position >= 0),
 description text not null check (length(description) between 1 and 500), kind text not null check (kind in ('product','service')),
 quantity numeric(14,3) not null check (quantity > 0 and quantity <= 100000), unit text not null default '' check (length(unit) <= 30),
 unit_price numeric(14,2) not null check (unit_price between 0 and 10000000), discount numeric(5,2) not null default 0 check (discount between 0 and 100),
 primary key(quote_id,id), unique(quote_id,position)
);
create table public.cs_quote_events (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.cs_businesses(id) on delete cascade,
 quote_id uuid references public.cs_quotes(id) on delete set null, quote_number text not null, title text not null, customer_name text not null,
 kind text not null check (kind in ('created','updated','sent','viewed','accepted','rejected','expired','duplicated')), created_at timestamptz not null default now()
);
create index cs_quote_events_history on public.cs_quote_events(business_id,created_at desc);
create table public.cs_public_quote_access (
 quote_id uuid primary key references public.cs_quotes(id) on delete cascade,
 token text not null unique check (token ~ '^[0-9a-f]{64}$'), revoked_at timestamptz, created_at timestamptz not null default now()
);
create table public.cs_stripe_events (id text primary key, kind text not null, created_at timestamptz not null default now());
create table public.cs_request_limits (key text primary key, hits integer not null, reset_at timestamptz not null);

alter table public.cs_profiles enable row level security;
alter table public.cs_businesses enable row level security;
alter table public.cs_subscriptions enable row level security;
alter table public.cs_customers enable row level security;
alter table public.cs_templates enable row level security;
alter table public.cs_quotes enable row level security;
alter table public.cs_quote_items enable row level security;
alter table public.cs_quote_events enable row level security;
alter table public.cs_public_quote_access enable row level security;
alter table public.cs_stripe_events enable row level security;
alter table public.cs_request_limits enable row level security;
create policy cs_profiles_read on public.cs_profiles for select to authenticated using (id = (select auth.uid()));
create policy cs_businesses_read on public.cs_businesses for select to authenticated using (owner_id = (select auth.uid()));
create policy cs_customers_read on public.cs_customers for select to authenticated using (exists(select 1 from public.cs_businesses b where b.id = business_id and b.owner_id = (select auth.uid())));
create policy cs_subscriptions_read on public.cs_subscriptions for select to authenticated using (exists(select 1 from public.cs_businesses b where b.id = business_id and b.owner_id = (select auth.uid())));
create policy cs_templates_read on public.cs_templates for select to authenticated using (true);
create policy cs_quotes_read on public.cs_quotes for select to authenticated using (deleted_at is null and exists(select 1 from public.cs_businesses b where b.id = business_id and b.owner_id = (select auth.uid())));
create policy cs_items_read on public.cs_quote_items for select to authenticated using (exists(select 1 from public.cs_quotes q join public.cs_businesses b on b.id = q.business_id where q.id = quote_id and q.deleted_at is null and b.owner_id = (select auth.uid())));
create policy cs_events_read on public.cs_quote_events for select to authenticated using (exists(select 1 from public.cs_businesses b where b.id = business_id and b.owner_id = (select auth.uid())));
-- Tokens y recibos de Stripe nunca tienen SELECT para anon ni authenticated.
revoke all on public.cs_public_quote_access, public.cs_stripe_events, public.cs_request_limits from anon, authenticated;
grant select on public.cs_profiles,public.cs_businesses,public.cs_subscriptions,public.cs_customers,public.cs_templates,public.cs_quotes,public.cs_quote_items,public.cs_quote_events to authenticated;
revoke insert,update,delete on public.cs_profiles,public.cs_businesses,public.cs_subscriptions,public.cs_customers,public.cs_templates,public.cs_quotes,public.cs_quote_items,public.cs_quote_events from anon,authenticated;

create function public.cs_business_json(b public.cs_businesses) returns jsonb language sql stable as $$
 select jsonb_build_object('id',b.id,'name',b.name,'email',b.email,'phone',b.phone,'address',b.address,'website',b.website,'rfc',b.rfc,'logo_url',b.logo_url,'activity',b.activity);
$$;
create function public.cs_customer_json(c public.cs_customers) returns jsonb language sql stable as $$
 select jsonb_build_object('id',c.id,'name',c.name,'email',c.email,'phone',c.phone,'address',c.address,'rfc',c.rfc);
$$;
create function public.cs_quote_json(q public.cs_quotes, p_token text default null) returns jsonb language sql stable as $$
 select q.document || jsonb_build_object('id',q.id,'business_id',q.business_id,'number',q.number,'status',q.status,'created_at',q.created_at,'updated_at',q.updated_at,'sent_at',q.sent_at,'responded_at',q.responded_at,'revision',q.revision,'public_token',p_token,'business_snapshot',q.business_snapshot);
$$;
create function public.cs_event(p_quote public.cs_quotes,p_kind text) returns void language sql security definer set search_path=public,pg_temp as $$
 insert into public.cs_quote_events(business_id,quote_id,quote_number,title,customer_name,kind) values(p_quote.business_id,p_quote.id,p_quote.number,p_quote.title,p_quote.document->'customer'->>'name',p_kind);
$$;
create function public.cs_expire(p_business_id uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
 declare q public.cs_quotes;
 begin
 for q in update public.cs_quotes set status='expired',updated_at=now(),revision=revision+1 where business_id=p_business_id and deleted_at is null and status in ('sent','viewed') and valid_until < (now() at time zone 'America/Mexico_City')::date returning * loop perform public.cs_event(q,'expired'); end loop;
 end;
$$;
create function public.cs_effective_plan(p_business_id uuid) returns text language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce((select plan from public.cs_subscriptions where business_id=p_business_id and status in ('active','trialing') and current_period_end>now()),'free');
$$;
create function public.cs_workspace() returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
 declare b public.cs_businesses; sub public.cs_subscriptions;
 begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select * into b from public.cs_businesses where owner_id=auth.uid();
 if not found then return jsonb_build_object('business',null,'quotes','[]'::jsonb,'customers','[]'::jsonb,'events','[]'::jsonb,'creations_used',0,'subscription',jsonb_build_object('plan','free','status','free','current_period_end',null,'cancel_at_period_end',false)); end if;
 perform public.cs_expire(b.id); select * into sub from public.cs_subscriptions where business_id=b.id;
 return jsonb_build_object('business',public.cs_business_json(b),'creations_used',b.creations_used,
 'subscription',jsonb_build_object('plan',coalesce(sub.plan,'free'),'status',coalesce(sub.status,'free'),'current_period_end',sub.current_period_end,'cancel_at_period_end',coalesce(sub.cancel_at_period_end,false)),
 'quotes',coalesce((select jsonb_agg(public.cs_quote_json(q,a.token) order by q.updated_at desc) from public.cs_quotes q left join public.cs_public_quote_access a on a.quote_id=q.id and a.revoked_at is null where q.business_id=b.id and q.deleted_at is null),'[]'::jsonb),
 'customers',coalesce((select jsonb_agg(public.cs_customer_json(c) order by c.name) from public.cs_customers c where c.business_id=b.id),'[]'::jsonb),
 'events',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'quote_id',coalesce(e.quote_id::text,''),'quote_number',e.quote_number,'title',e.title,'customer_name',e.customer_name,'kind',e.kind,'created_at',e.created_at) order by e.created_at desc) from public.cs_quote_events e where e.business_id=b.id),'[]'::jsonb));
 end;
$$;
create function public.cs_save_business(p_data jsonb) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
 declare b public.cs_businesses;
 begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 if length(trim(coalesce(p_data->>'name',''))) not between 2 and 160 or coalesce(p_data->>'activity','') not in ('products','services','both') or length(coalesce(p_data->>'logo_url',''))>1500 or length(coalesce(p_data->>'address',''))>400 or length(coalesce(p_data->>'phone',''))>30 or length(coalesce(p_data->>'email',''))>254 or length(coalesce(p_data->>'website',''))>300 or length(coalesce(p_data->>'rfc',''))>20 then raise exception 'VALIDATION_ERROR'; end if;
 if coalesce(p_data->>'logo_url','')<>'' and (p_data->>'logo_url' !~ '^https?://[a-zA-Z0-9.:-]+/storage/v1/object/public/business-logos/' or split_part(split_part(p_data->>'logo_url','/business-logos/',2),'/',1)<>auth.uid()::text) then raise exception 'VALIDATION_ERROR'; end if;
 insert into public.cs_profiles(id,full_name) values(auth.uid(),'') on conflict(id) do nothing;
 insert into public.cs_businesses(owner_id,name,email,phone,address,website,rfc,logo_url,activity)
 values(auth.uid(),trim(p_data->>'name'),coalesce(p_data->>'email',''),coalesce(p_data->>'phone',''),coalesce(p_data->>'address',''),coalesce(p_data->>'website',''),coalesce(p_data->>'rfc',''),coalesce(p_data->>'logo_url',''),p_data->>'activity')
 on conflict(owner_id) do update set name=excluded.name,email=excluded.email,phone=excluded.phone,address=excluded.address,website=excluded.website,rfc=excluded.rfc,logo_url=excluded.logo_url,activity=excluded.activity,updated_at=now() returning * into b;
 insert into public.cs_subscriptions(business_id) values(b.id) on conflict do nothing;
 return public.cs_business_json(b);
 end;
$$;

create function public.cs_validate_quote(p_data jsonb) returns void language plpgsql set search_path=public,pg_temp as $$
 declare item jsonb; p numeric; qty numeric; dto numeric; taxrate numeric;
 begin
 if jsonb_typeof(p_data)<>'object' or length(trim(coalesce(p_data->>'title',''))) not between 3 and 160 or length(trim(coalesce(p_data->'customer'->>'name',''))) not between 2 and 160 or coalesce(jsonb_typeof(p_data->'items'),'')<>'array' or jsonb_array_length(p_data->'items') not between 1 and 100 then raise exception 'VALIDATION_ERROR'; end if;
 if coalesce(p_data->'design'->>'color','') !~ '^#[0-9a-fA-F]{6}$' or coalesce(p_data->'design'->>'font','') not in ('sans','serif') then raise exception 'VALIDATION_ERROR'; end if;
 if coalesce(jsonb_typeof(p_data->'design'->'show_logo'),'')<>'boolean' or coalesce(jsonb_typeof(p_data->'design'->'show_notes'),'')<>'boolean' or coalesce(jsonb_typeof(p_data->'design'->'show_terms'),'')<>'boolean' then raise exception 'VALIDATION_ERROR'; end if;
 if length(coalesce(p_data->>'notes',''))>2000 or length(coalesce(p_data->>'terms',''))>3000 or length(coalesce(p_data->'customer'->>'email',''))>254 or length(coalesce(p_data->'customer'->>'phone',''))>30 or length(coalesce(p_data->'customer'->>'address',''))>400 or length(coalesce(p_data->'customer'->>'rfc',''))>20 then raise exception 'VALIDATION_ERROR'; end if;
 if coalesce(p_data->>'valid_until','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'VALIDATION_ERROR'; end if;
 perform (p_data->>'valid_until')::date;
 if coalesce(jsonb_typeof(p_data->'tax_rate'),'')<>'number' then raise exception 'VALIDATION_ERROR'; end if;
 taxrate := (p_data->>'tax_rate')::numeric;
 if taxrate is null or taxrate<0 or taxrate>100 or round(taxrate,2)<>taxrate then raise exception 'VALIDATION_ERROR'; end if;
 for item in select value from jsonb_array_elements(p_data->'items') loop
  if coalesce(jsonb_typeof(item->'unit_price'),'')<>'number' or coalesce(jsonb_typeof(item->'quantity'),'')<>'number' or coalesce(jsonb_typeof(item->'discount'),'')<>'number' then raise exception 'VALIDATION_ERROR'; end if;
  p := (item->>'unit_price')::numeric; qty := (item->>'quantity')::numeric; dto := (item->>'discount')::numeric;
  if p is null or qty is null or dto is null or p<0 or p>10000000 or round(p,2)<>p or qty<=0 or qty>100000 or round(qty,3)<>qty or dto<0 or dto>100 or round(dto,2)<>dto or coalesce(item->>'kind','') not in ('product','service') or length(trim(coalesce(item->>'description',''))) not between 1 and 500 or length(coalesce(item->>'unit',''))>30 or length(coalesce(item->>'id','')) not between 1 and 100 then raise exception 'VALIDATION_ERROR'; end if;
 end loop;
 if (select sum((value->>'quantity')::numeric * (value->>'unit_price')::numeric) from jsonb_array_elements(p_data->'items'))>1000000000000 then raise exception 'VALIDATION_ERROR'; end if;
 if (select count(distinct value->>'id') from jsonb_array_elements(p_data->'items')) <> jsonb_array_length(p_data->'items') then raise exception 'VALIDATION_ERROR'; end if;
 end;
$$;

create function public.cs_save_quote(p_data jsonb,p_quote_id uuid default null,p_revision integer default null,p_request_id uuid default gen_random_uuid()) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
 declare b public.cs_businesses; q public.cs_quotes; c public.cs_customers; v_plan text; v_required text; v_customer_id uuid; v_doc jsonb; item jsonb; pos integer:=0; sub_cents numeric:=0; dto_cents numeric:=0; line_cents numeric; tax_cents numeric; v_number text;
 begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 perform public.cs_validate_quote(p_data);
 -- Bloqueo por negocio: dos solicitudes simultáneas nunca consumen el último crédito dos veces.
 select * into b from public.cs_businesses where owner_id=auth.uid() for update; if not found then raise exception 'BUSINESS_REQUIRED'; end if;
 if p_quote_id is null then
  select * into q from public.cs_quotes where business_id=b.id and creation_request_id=p_request_id;
  if found then if q.deleted_at is not null then raise exception 'NOT_FOUND'; end if; return public.cs_quote_json(q); end if;
 else
  select * into q from public.cs_quotes where id=p_quote_id and business_id=b.id and deleted_at is null for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if q.status<>'draft' then raise exception 'QUOTE_LOCKED'; end if;
  if p_revision is null or q.revision<>p_revision then raise exception 'CONFLICT'; end if;
 end if;
 v_plan := public.cs_effective_plan(b.id);
 if p_quote_id is null and v_plan='free' and b.creations_used>=3 then raise exception 'FREE_LIMIT'; end if;
 select plan into v_required from public.cs_templates where id=p_data->>'template_id';
 if v_required is null or (v_required='premium' and v_plan<>'premium') or (v_required='pro' and v_plan='free') then raise exception 'TEMPLATE_LOCKED'; end if;
 if coalesce(p_data->'customer'->>'id','')<>'' then
  v_customer_id := (p_data->'customer'->>'id')::uuid;
  select * into c from public.cs_customers where id=v_customer_id and business_id=b.id;
  if not found then raise exception 'NOT_FOUND'; end if;
  update public.cs_customers set name=trim(p_data->'customer'->>'name'),email=coalesce(p_data->'customer'->>'email',''),phone=coalesce(p_data->'customer'->>'phone',''),address=coalesce(p_data->'customer'->>'address',''),rfc=coalesce(p_data->'customer'->>'rfc',''),updated_at=now() where id=v_customer_id returning * into c;
 else
  insert into public.cs_customers(business_id,name,email,phone,address,rfc) values(b.id,trim(p_data->'customer'->>'name'),coalesce(p_data->'customer'->>'email',''),coalesce(p_data->'customer'->>'phone',''),coalesce(p_data->'customer'->>'address',''),coalesce(p_data->'customer'->>'rfc','')) returning * into c;
 end if;
 v_doc := jsonb_set(p_data,'{customer}',public.cs_customer_json(c));
 if p_quote_id is null then
  v_number := 'CS-'||extract(year from now())::text||'-'||lpad(b.next_quote_number::text,4,'0');
  insert into public.cs_quotes(business_id,customer_id,template_id,number,title,document,valid_until,creation_request_id) values(b.id,c.id,p_data->>'template_id',v_number,trim(p_data->>'title'),v_doc,(p_data->>'valid_until')::date,p_request_id) returning * into q;
  update public.cs_businesses set creations_used=creations_used+case when v_plan='free' then 1 else 0 end,next_quote_number=next_quote_number+1 where id=b.id;
 else
  update public.cs_quotes set customer_id=c.id,template_id=p_data->>'template_id',title=trim(p_data->>'title'),document=v_doc,valid_until=(p_data->>'valid_until')::date,updated_at=now(),revision=revision+1 where id=q.id returning * into q;
  delete from public.cs_quote_items where quote_id=q.id;
 end if;
 for item in select value from jsonb_array_elements(p_data->'items') loop
  insert into public.cs_quote_items(quote_id,id,position,description,kind,quantity,unit,unit_price,discount) values(q.id,item->>'id',pos,item->>'description',item->>'kind',(item->>'quantity')::numeric,coalesce(item->>'unit',''),(item->>'unit_price')::numeric,(item->>'discount')::numeric);
  line_cents:=round((item->>'quantity')::numeric * round((item->>'unit_price')::numeric * 100)); sub_cents:=sub_cents+line_cents; dto_cents:=dto_cents+round(line_cents*(item->>'discount')::numeric/100); pos:=pos+1;
 end loop;
 tax_cents:=round((sub_cents-dto_cents)*(p_data->>'tax_rate')::numeric/100);
 update public.cs_quotes set subtotal=sub_cents/100,discount=dto_cents/100,tax=tax_cents/100,total=(sub_cents-dto_cents+tax_cents)/100 where id=q.id returning * into q;
 perform public.cs_event(q,case when p_quote_id is null then 'created' else 'updated' end);
 return public.cs_quote_json(q);
 end;
$$;

create function public.cs_delete_quote(p_quote_id uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
 begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 update public.cs_quotes q set deleted_at=now(),updated_at=now() where q.id=p_quote_id and deleted_at is null and exists(select 1 from public.cs_businesses b where b.id=q.business_id and b.owner_id=auth.uid());
 if not found then raise exception 'NOT_FOUND'; end if;
 update public.cs_public_quote_access set revoked_at=now() where quote_id=p_quote_id;
 -- El contador Free no disminuye. La eliminación lógica conserva la idempotencia de creación.
 end;
$$;
create function public.cs_share_quote(p_quote_id uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
 declare q public.cs_quotes; b public.cs_businesses; access public.cs_public_quote_access; token text;
 begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select q1.* into q from public.cs_quotes q1 join public.cs_businesses b1 on b1.id=q1.business_id where q1.id=p_quote_id and q1.deleted_at is null and b1.owner_id=auth.uid() for update of q1;
 if not found then raise exception 'NOT_FOUND'; end if;
 select * into access from public.cs_public_quote_access where quote_id=q.id and revoked_at is null;
 if found then return public.cs_quote_json(q,access.token); end if;
 if q.valid_until<(now() at time zone 'America/Mexico_City')::date or q.status<>'draft' then raise exception 'QUOTE_LOCKED'; end if;
 select * into b from public.cs_businesses where id=q.business_id;
 -- Dos UUID v4 independientes aportan 244 bits aleatorios; no hay folios ni IDs secuenciales en el enlace.
 token := replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
 insert into public.cs_public_quote_access(quote_id,token) values(q.id,token);
 update public.cs_quotes set status='sent',sent_at=now(),updated_at=now(),business_snapshot=public.cs_business_json(b),revision=revision+1 where id=q.id returning * into q;
 perform public.cs_event(q,'sent'); return public.cs_quote_json(q,token);
 end;
$$;

-- Las funciones públicas solo se invocan desde el servidor con service_role. La API anónima no lee tablas.
create function public.cs_public_quote(p_token text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
 declare q public.cs_quotes;
 begin
 select q1.* into q from public.cs_quotes q1 join public.cs_public_quote_access a on a.quote_id=q1.id where a.token=p_token and a.revoked_at is null and q1.deleted_at is null;
 if not found then raise exception 'NOT_FOUND'; end if;
 perform public.cs_expire(q.business_id); select * into q from public.cs_quotes where id=q.id;
 return jsonb_build_object('quote',public.cs_quote_json(q,p_token),'business',q.business_snapshot);
 end;
$$;
create function public.cs_record_view(p_token text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
 declare q public.cs_quotes;
 begin
 select q1.* into q from public.cs_quotes q1 join public.cs_public_quote_access a on a.quote_id=q1.id where a.token=p_token and a.revoked_at is null and q1.deleted_at is null for update of q1;
 if not found then raise exception 'NOT_FOUND'; end if;
 if q.status='sent' and q.valid_until>=(now() at time zone 'America/Mexico_City')::date then update public.cs_quotes set status='viewed',updated_at=now(),revision=revision+1 where id=q.id returning * into q; perform public.cs_event(q,'viewed'); end if;
 end;
$$;
create function public.cs_respond_public(p_token text,p_action text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
 declare q public.cs_quotes;
 begin
 if p_action not in ('accepted','rejected') then raise exception 'VALIDATION_ERROR'; end if;
 select q1.* into q from public.cs_quotes q1 join public.cs_public_quote_access a on a.quote_id=q1.id where a.token=p_token and a.revoked_at is null and q1.deleted_at is null for update of q1;
 if not found then raise exception 'NOT_FOUND'; end if;
 if q.status=p_action then return public.cs_quote_json(q,p_token); end if;
 if q.valid_until<(now() at time zone 'America/Mexico_City')::date or q.status not in ('sent','viewed') then raise exception 'QUOTE_LOCKED'; end if;
 update public.cs_quotes set status=p_action,responded_at=now(),updated_at=now(),revision=revision+1 where id=q.id returning * into q;
 perform public.cs_event(q,p_action); return public.cs_quote_json(q,p_token);
 end;
$$;
create function public.cs_rate_limit(p_key text,p_limit integer,p_window integer) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
 declare attempts integer;
 begin
 delete from public.cs_request_limits where reset_at<now()-interval '1 hour';
 insert into public.cs_request_limits(key,hits,reset_at) values(p_key,1,now()+make_interval(secs=>p_window))
 on conflict(key) do update set hits=case when cs_request_limits.reset_at<=now() then 1 else cs_request_limits.hits+1 end,reset_at=case when cs_request_limits.reset_at<=now() then now()+make_interval(secs=>p_window) else cs_request_limits.reset_at end returning hits into attempts;
 return attempts<=p_limit;
 end;
$$;
-- Una reserva corta serializa Checkout entre pestañas e instancias; caduca si la solicitud se interrumpe.
create function public.cs_claim_checkout(p_business_id uuid,p_lock_id uuid) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
 begin
 update public.cs_subscriptions set checkout_lock_id=p_lock_id,checkout_lock_until=now()+interval '3 minutes'
 where business_id=p_business_id and (checkout_lock_until is null or checkout_lock_until<=now());
 return found;
 end;
$$;
create function public.cs_release_checkout(p_business_id uuid,p_lock_id uuid) returns void language sql security definer set search_path=public,pg_temp as $$
 update public.cs_subscriptions set checkout_lock_id=null,checkout_lock_until=null where business_id=p_business_id and checkout_lock_id=p_lock_id;
$$;
create function public.cs_bind_stripe_customer(p_business_id uuid,p_customer_id text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
 begin update public.cs_subscriptions set stripe_customer_id=p_customer_id where business_id=p_business_id and (stripe_customer_id is null or stripe_customer_id=p_customer_id); if not found then raise exception 'CONFLICT'; end if; end;
$$;
create function public.cs_apply_subscription_event(p_event_id text,p_kind text,p_created bigint,p_business_id uuid,p_customer_id text,p_subscription_id text,p_plan text,p_status text,p_period_end timestamptz,p_cancel boolean) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
 begin
 insert into public.cs_stripe_events(id,kind) values(p_event_id,p_kind) on conflict do nothing;
 if not found then return false; end if;
 if p_plan not in ('free','pro','premium') then raise exception 'INVALID_PLAN'; end if;
 if not exists(select 1 from public.cs_subscriptions where business_id=p_business_id and stripe_customer_id=p_customer_id) then raise exception 'CONFLICT'; end if;
 update public.cs_subscriptions set plan=p_plan,status=p_status,stripe_customer_id=p_customer_id,stripe_subscription_id=p_subscription_id,current_period_end=p_period_end,cancel_at_period_end=p_cancel,last_event_created=p_created,updated_at=now()
 where business_id=p_business_id and (stripe_customer_id is null or stripe_customer_id=p_customer_id) and last_event_created<=p_created;
 return found;
 end;
$$;

-- Solo se revocan las funciones de esta aplicación; no se alteran privilegios de instalaciones previas.
revoke execute on function public.cs_business_json(public.cs_businesses),public.cs_customer_json(public.cs_customers),public.cs_quote_json(public.cs_quotes,text),public.cs_event(public.cs_quotes,text),public.cs_expire(uuid),public.cs_effective_plan(uuid),public.cs_validate_quote(jsonb),public.cs_workspace(),public.cs_save_business(jsonb),public.cs_save_quote(jsonb,uuid,integer,uuid),public.cs_delete_quote(uuid),public.cs_share_quote(uuid),public.cs_public_quote(text),public.cs_record_view(text),public.cs_respond_public(text,text),public.cs_rate_limit(text,integer,integer),public.cs_claim_checkout(uuid,uuid),public.cs_release_checkout(uuid,uuid),public.cs_bind_stripe_customer(uuid,text),public.cs_apply_subscription_event(text,text,bigint,uuid,text,text,text,text,timestamptz,boolean) from public,anon,authenticated;
grant execute on function public.cs_workspace(), public.cs_save_business(jsonb), public.cs_save_quote(jsonb,uuid,integer,uuid),public.cs_delete_quote(uuid),public.cs_share_quote(uuid) to authenticated;
grant execute on function public.cs_public_quote(text),public.cs_record_view(text),public.cs_respond_public(text,text),public.cs_rate_limit(text,integer,integer),public.cs_claim_checkout(uuid,uuid),public.cs_release_checkout(uuid,uuid),public.cs_bind_stripe_customer(uuid,text),public.cs_apply_subscription_event(text,text,bigint,uuid,text,text,text,text,timestamptz,boolean) to service_role;
grant all on public.cs_businesses,public.cs_subscriptions,public.cs_request_limits,public.cs_stripe_events to service_role;
