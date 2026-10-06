-- No reescribe documentos históricos. Las nuevas escrituras exigen IVA 16 y descuento cero.
insert into public.cs_templates(id,name,plan) values
 ('essential','Esencial','free'),
 ('clarity','Claridad','free'),
 ('ledger','Oficio','free'),
 ('linear','Línea','free'),
 ('balance','Balance','free'),
 ('origin','Origen','free'),
 ('folio','Folio','free'),
 ('norte','Norte','free'),
 ('base','Base','free'),
 ('pure','Pura','free'),
 ('grid','Retícula','free'),
 ('letter','Carta','free'),
 ('studio','Estudio','pro'),
 ('frame','Marco','pro'),
 ('horizon','Horizonte','pro'),
 ('axis','Eje','pro'),
 ('duo','Dúo','pro'),
 ('module','Módulo','pro'),
 ('contour','Contorno','pro'),
 ('signal','Señal','pro'),
 ('prisma','Prisma','pro'),
 ('format','Formato','pro'),
 ('focus','Enfoque','pro'),
 ('urban','Urbana','pro'),
 ('editorial','Editorial','premium'),
 ('signature','Firma','premium'),
 ('atelier','Atelier','premium'),
 ('archive','Archivo','premium'),
 ('monograph','Monografía','premium'),
 ('aura','Aura','premium'),
 ('capital','Capital','premium'),
 ('gallery','Galería','premium'),
 ('volume','Volumen','premium'),
 ('manifest','Manifiesto','premium'),
 ('heritage','Legado','premium'),
 ('edition','Edición','premium')
on conflict(id) do update set name=excluded.name, plan=excluded.plan;

create or replace function public.cs_validate_quote(p_data jsonb) returns void language plpgsql set search_path=public,pg_temp as $$
 declare item jsonb; p numeric; qty numeric; dto numeric; taxrate numeric;
 begin
 if jsonb_typeof(p_data)<>'object' or length(trim(coalesce(p_data->>'title',''))) not between 3 and 160 or length(trim(coalesce(p_data->'customer'->>'name',''))) not between 2 and 160 or coalesce(jsonb_typeof(p_data->'items'),'')<>'array' or jsonb_array_length(p_data->'items') not between 1 and 100 then raise exception 'VALIDATION_ERROR'; end if;
 if coalesce(p_data->'design'->>'color','') !~ '^#[0-9a-fA-F]{6}$' or coalesce(p_data->'design'->>'font','') not in ('sans','serif','humanist','mono','lora','dm','plex','baskerville') then raise exception 'VALIDATION_ERROR'; end if;
 if coalesce(jsonb_typeof(p_data->'design'->'show_logo'),'')<>'boolean' or coalesce(jsonb_typeof(p_data->'design'->'show_notes'),'')<>'boolean' or coalesce(jsonb_typeof(p_data->'design'->'show_terms'),'')<>'boolean' then raise exception 'VALIDATION_ERROR'; end if;
 if length(coalesce(p_data->>'notes',''))>2000 or length(coalesce(p_data->>'terms',''))>3000 or length(coalesce(p_data->'customer'->>'email',''))>254 or length(coalesce(p_data->'customer'->>'phone',''))>30 or length(coalesce(p_data->'customer'->>'address',''))>400 or length(coalesce(p_data->'customer'->>'rfc',''))>20 then raise exception 'VALIDATION_ERROR'; end if;
 if coalesce(p_data->>'valid_until','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'VALIDATION_ERROR'; end if;
 perform (p_data->>'valid_until')::date;
 if coalesce(jsonb_typeof(p_data->'tax_rate'),'')<>'number' then raise exception 'VALIDATION_ERROR'; end if;
 taxrate := (p_data->>'tax_rate')::numeric;
 if taxrate is null or taxrate <> 16 then raise exception 'VALIDATION_ERROR'; end if;
 for item in select value from jsonb_array_elements(p_data->'items') loop
  if coalesce(jsonb_typeof(item->'unit_price'),'')<>'number' or coalesce(jsonb_typeof(item->'quantity'),'')<>'number' or coalesce(jsonb_typeof(item->'discount'),'')<>'number' then raise exception 'VALIDATION_ERROR'; end if;
  p := (item->>'unit_price')::numeric; qty := (item->>'quantity')::numeric; dto := (item->>'discount')::numeric;
  if p is null or qty is null or dto is null or p<0 or p>10000000 or round(p,2)<>p or qty<=0 or qty>100000 or round(qty,3)<>qty or dto<>0 or round(dto,2)<>dto or coalesce(item->>'kind','') not in ('product','service') or length(trim(coalesce(item->>'description',''))) not between 1 and 500 or length(coalesce(item->>'unit',''))>30 or length(coalesce(item->>'id','')) not between 1 and 100 then raise exception 'VALIDATION_ERROR'; end if;
 end loop;
 if (select sum((value->>'quantity')::numeric * (value->>'unit_price')::numeric) from jsonb_array_elements(p_data->'items'))>1000000000000 then raise exception 'VALIDATION_ERROR'; end if;
 if (select count(distinct value->>'id') from jsonb_array_elements(p_data->'items')) <> jsonb_array_length(p_data->'items') then raise exception 'VALIDATION_ERROR'; end if;
 end;
$$;

create or replace function public.cs_save_quote(p_data jsonb,p_quote_id uuid default null,p_revision integer default null,p_request_id uuid default gen_random_uuid()) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
 declare b public.cs_businesses; q public.cs_quotes; c public.cs_customers; v_plan text; v_required text; v_customer_id uuid; v_doc jsonb; item jsonb; pos integer:=0; sub_cents numeric:=0; line_cents numeric; tax_cents numeric; v_number text;
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
 -- Las categorías son metadatos; el límite Free sigue protegido por la misma transacción.
 if v_required is null then raise exception 'VALIDATION_ERROR'; end if;
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
  line_cents:=round((item->>'quantity')::numeric * round((item->>'unit_price')::numeric * 100)); sub_cents:=sub_cents+line_cents; pos:=pos+1;
 end loop;
 tax_cents:=round(sub_cents*16/100);
 update public.cs_quotes set subtotal=sub_cents/100,discount=0,tax=tax_cents/100,total=(sub_cents+tax_cents)/100 where id=q.id returning * into q;
 perform public.cs_event(q,case when p_quote_id is null then 'created' else 'updated' end);
 return public.cs_quote_json(q);
 end;
$$;

-- Duplicar conserva el original y crea un borrador sujeto al mismo contador y permisos.
create or replace function public.cs_duplicate_quote(p_quote_id uuid,p_request_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare b public.cs_businesses; original public.cs_quotes; saved public.cs_quotes; payload jsonb; result jsonb;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_request_id is null then raise exception 'VALIDATION_ERROR'; end if;
 select * into b from public.cs_businesses where owner_id=auth.uid() for update;
 if not found then raise exception 'BUSINESS_REQUIRED'; end if;
 select * into original from public.cs_quotes where id=p_quote_id and business_id=b.id and deleted_at is null;
 if not found then raise exception 'NOT_FOUND'; end if;
 select * into saved from public.cs_quotes where business_id=b.id and creation_request_id=p_request_id;
 if found then
  if saved.deleted_at is not null then raise exception 'NOT_FOUND'; end if;
  return public.cs_quote_json(saved);
 end if;
 payload := original.document || jsonb_build_object(
  'title',left(original.title,152)||' · copia',
  'tax_rate',16,
  'items',(select jsonb_agg(value || '{"discount":0}'::jsonb) from jsonb_array_elements(original.document->'items')),
  'valid_until',greatest(original.valid_until,(now() at time zone 'America/Mexico_City')::date+15)::text
 );
 result := public.cs_save_quote(payload,null,null,p_request_id);
 select * into saved from public.cs_quotes where id=(result->>'id')::uuid;
 perform public.cs_event(saved,'duplicated');
 return result;
end;
$$;
revoke execute on function public.cs_duplicate_quote(uuid,uuid) from public,anon,authenticated;
grant execute on function public.cs_duplicate_quote(uuid,uuid) to authenticated;
