-- STEP 2 — run this AFTER 002_add_vendor_types.sql has been run and committed
-- (must be a separate execution, not appended to the same query as step 1).

insert into categories (name, vendor_type) values
  ('Pastries', 'bakery'),
  ('Cakes', 'bakery'),
  ('Cookies & Sweets', 'bakery'),
  ('Fresh Bread', 'bakery'),
  ('Hot Drinks', 'cafe'),
  ('Cold Drinks', 'cafe'),
  ('Pastries & Snacks', 'cafe'),
  ('Desserts', 'cafe'),
  ('Event Packages', 'catering'),
  ('Platters', 'catering'),
  ('Custom Orders', 'catering');
