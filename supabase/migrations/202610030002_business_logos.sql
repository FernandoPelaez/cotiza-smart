-- Los logos son activos de marca públicos. Cada usuario solo escribe y elimina dentro de su carpeta.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('business-logos','business-logos',true,2097152,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
create policy cs_logo_read on storage.objects for select to public using(bucket_id='business-logos');
create policy cs_logo_insert on storage.objects for insert to authenticated with check(bucket_id='business-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy cs_logo_delete on storage.objects for delete to authenticated using(bucket_id='business-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
