-- Duplicar conserva el original y crea un borrador sujeto al mismo contador y permisos.
create function public.cs_duplicate_quote(p_quote_id uuid,p_request_id uuid) returns jsonb
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
  'tax_rate',case when (original.document->>'tax_rate')::numeric=0 then 0 else 16 end,
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
