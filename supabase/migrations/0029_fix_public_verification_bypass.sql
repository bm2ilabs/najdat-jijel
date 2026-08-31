-- إصلاح أمني: كانت سياسات الإدخال العام لجدولي medical_volunteers وartisan_volunteers
-- تسمح بـ with check (true) دون أي قيد، مما يعني أن أي طرف يستدعي واجهة Supabase
-- مباشرة (بمفتاح anon العام، وهذا طبيعي أن يكون مكشوفًا) يستطيع إدخال صف بقيمة
-- status = 'verified' مباشرة، متجاوزًا كليًا التحقق من الإدارة الذي يفرضه Server
-- Action (الذي يضبط status: "pending" دائمًا لكنه لا يحمي شيئًا إن استُدعيت
-- Supabase مباشرة). استُغلّت هذه الثغرة فعليًا: 3 تسجيلات spam ظهرت كـ"موثّقة"
-- علنًا في صفحة /medical.
--
-- الإصلاح: تقييد with check بحيث لا يمكن إدخال صف إلا بحالة 'pending' وبدون
-- verified_by/verified_at — فقط التحديث اللاحق عبر manager (سياسة UPDATE
-- المنفصلة، محمية أصلًا بـ is_manager()) يمكنه توثيق الصف.

drop policy if exists medical_volunteers_public_insert on public.medical_volunteers;
create policy medical_volunteers_public_insert on public.medical_volunteers
  for insert to anon, authenticated
  with check (status = 'pending' and verified_by is null and verified_at is null);

drop policy if exists artisan_volunteers_public_insert on public.artisan_volunteers;
create policy artisan_volunteers_public_insert on public.artisan_volunteers
  for insert to anon, authenticated
  with check (status = 'pending' and verified_by is null and verified_at is null);
