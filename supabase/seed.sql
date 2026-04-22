-- 初期データ投入の例。自分の環境に合わせて編集してから Supabase SQL Editor で実行する。
-- secret_slug は nanoid(24) などで生成した値を使う（例: V1StGXR8_Z5jdHi6B-myT）

insert into households (secret_slug) values ('REPLACE_WITH_NANOID_24') returning id;

-- 上の id をコピーして下記 <household_id> に貼る
-- insert into cats (household_id, name, icon) values
--   ('<household_id>', 'タマ',   '🐈'),
--   ('<household_id>', 'クロ',   '🐈‍⬛');
