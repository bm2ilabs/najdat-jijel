-- إضافة فئة الأدوية والمستلزمات البيطرية لإغاثة المواشي والحيوانات المتضررة
insert into public.categories (slug, name_ar, default_unit, sort_order)
values ('veterinary', 'أدوية ومستلزمات بيطرية', 'box', 8)
on conflict (slug) do update set
  name_ar = excluded.name_ar,
  default_unit = excluded.default_unit;
