# neko-health 設計ドキュメント

最終更新: 2026-04-22

## 目的

飼い猫のご飯量・飲水量を夫婦で記録・共有し、日次/週次グラフで健康変化に気づくための Web アプリ。

## 要件

### Must

- 複数匹の猫を管理できる（2匹以上想定）
- 1匹ごとにご飯量 (g) と飲水量 (ml) を記録できる
- 日次グラフ・週次グラフで推移が見える
- 夫婦2人が同じ共有URL経由でデータを閲覧・入力できる
- スマホから3タップ以内で1回の記録が完了する

### Nice to have（後日）

- 体重記録 / 写真メモ / 異常検知 / リマインダー / CSV エクスポート

### Non-goals

- ユーザー認証・アカウント管理
- 他の飼い主向けの公開・マネタイズ
- ネイティブアプリ化
- 獣医連携・医療機能

## データモデル

### スキーマ

```sql
create table households (
  id           uuid primary key default gen_random_uuid(),
  secret_slug  text unique not null,          -- nanoid(24)
  created_at   timestamptz not null default now()
);

create table cats (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households(id) on delete cascade,
  name          text not null,
  icon          text not null default '🐈',   -- 絵文字
  created_at    timestamptz not null default now()
);

create table records (
  id            uuid primary key default gen_random_uuid(),
  cat_id        uuid not null references cats(id) on delete cascade,
  kind          text not null check (kind in ('food', 'water')),
  amount        integer not null check (amount > 0),
  unit          text not null check (unit in ('g', 'ml')),
  recorded_at   timestamptz not null default now(),  -- ユーザー編集可
  created_at    timestamptz not null default now()
);

create index records_cat_recorded on records (cat_id, recorded_at desc);
```

### 設計判断

- `records` を kind カラムで多態化 → グラフ用の集計クエリが1本で済む。体重など後から kind 追加で拡張可。
- `amount` は integer（g / ml で十分）。精度が必要になれば migration で numeric へ。
- `created_by` なし（夫/妻の区別は MVP では不要）。
- `households` は複数行を許容するスキーマで作る。MVP では手動 INSERT で1行のみ使う。

## 画面構成

### ルート

| パス | 内容 |
|---|---|
| `/` | ランディング（secret は貼らせない。案内のみ） |
| `/h/[secret]` | ダッシュボード（全猫の今日のサマリー + ＋記録ボタン） |
| `/h/[secret]/cats/[catId]` | 猫個別ページ（日次/週次グラフを縦並び同時表示） |

### ダッシュボード (`/h/[secret]`)

- 上部: 今日のサマリー（全猫の食事合計 / 飲水合計）
- 中部: 猫ごとのカード（今日の量 + 進捗バー、タップで猫個別ページへ）
- 下部固定: 大きな「＋記録」ボタン

### 記録モーダル（ボトムシート）

3タップで完結する動線:

1. **＋記録ボタン**（ダッシュボードから）
2. **猫アイコン選択**（シート上部の横並び）
3. **クイック量チップ選択**（食事: 10/15/20g、水: 30/50/100ml）→ 即保存

補足:
- 食事/水のトグルはシート中部に置き、視線移動のみで切り替え（タップ数に含めない）
- 自由入力は数値キーパッドで2段階（チップに収まらないケース用）

### 猫個別ページ (`/h/[secret]/cats/[catId]`)

- ヘッダー: 猫名 + アイコン
- グラフ1: 直近7日の日別棒グラフ（食事 g）
- グラフ2: 直近7日の日別棒グラフ（水 ml）
- グラフ3: 直近4週の週合計（食事・水を色分け）
- 基準線は引かない（個体差優先）

## API / Server Actions

### 方針

- 全書き込み/読み込みは Next.js 16 の **Server Actions** 経由
- Supabase は **service_role キー**でサーバー側のみアクセス、**RLS は無効**
- 認可はアプリ層に一元化（`assertHousehold(secret)` を冒頭で呼ぶ）
- 戻り値は discriminated union で統一: `{ ok: true, data } | { ok: false, error }`

### 一覧（想定）

```ts
// src/lib/auth.ts
assertHousehold(secret: string): Promise<{ id: string }>

// src/app/h/[secret]/actions.ts
createRecord(secret, catId, kind, amount, unit, recordedAt?): ActionResult<Record>
updateRecord(secret, recordId, patch): ActionResult<Record>
deleteRecord(secret, recordId): ActionResult<void>
listTodayByHousehold(secret): ActionResult<TodaySummary>
listRecentByCat(secret, catId, days): ActionResult<Record[]>
```

### 認可フロー

```
Client (URL params.secret)
  → Server Action (secret を第一引数で受ける)
  → assertHousehold(secret) で households から照会
  → 該当なしなら throw（404 相当）
  → 以降は household_id をスコープに Supabase クエリ
```

## インフラ

### Supabase

- プラン: Free（500MB / 月5万req / 無期限）
- テーブル: 上記3テーブル + `gen_random_uuid()` 有効化
- 接続: `@supabase/supabase-js` を Server Actions 内で使用
- キー管理:
  - `NEXT_PUBLIC_SUPABASE_URL`（クライアントにも露出可）
  - `SUPABASE_SERVICE_ROLE_KEY`（サーバーのみ、Vercel Env Var）
- 初期データ: Supabase 管理画面で手動 INSERT（households 1行 + cats 2行〜）

### Vercel

- プラン: Hobby
- リポジトリ: GitHub から自動連携
- 環境変数: 上記2本を Production に設定
- Preview deploy は secret 漏洩防止のため **無効化 or パスワード保護**

### グラフ

- ライブラリ: **Recharts**
- 配置: グラフページのみ `"use client"`、データ取得は親の Server Component で実施
- 集計: Postgres 側で `date_trunc` による GROUP BY

### secret 生成・管理

- 生成: `nanoid(24)` (144bit エントロピー)
- 例: `/h/V1StGXR8_Z5jdHi6B-myT`
- ローテーション: `households` に新行 INSERT → 旧行削除（UI なし、手動運用）
- ログ出力禁止（`security.md` 遵守）

## MVP スコープ（2026-04-22 今日中）

### 今日入れる

- [ ] Supabase プロジェクト作成 + 上記スキーマ適用
- [ ] `.env.local` / Vercel Env Var 設定
- [ ] households / cats を手動 INSERT（猫2匹）
- [ ] `/h/[secret]` ダッシュボード（サマリー + 猫カード + ＋記録ボタン）
- [ ] 記録ボトムシート（食事/水 × クイック量チップ）
- [ ] `createRecord` Server Action + `assertHousehold`
- [ ] `/h/[secret]/cats/[catId]` 日次/週次グラフ
- [ ] Vercel へデプロイ

### 後で入れる（nice to have）

- 体重記録（`records.kind = 'weight'` で拡張）
- 記録の編集/削除 UI（MVPは Supabase 管理画面から）
- 異常検知アラート
- 写真メモ（Supabase Storage）
- リマインダー通知
- CSV エクスポート
- `/setup` ページでの household 自動作成

## 未決事項

- 記録の**編集/削除 UI** を今日入れるか、次回に回すか → MVP後の優先度判断
- 自由入力時の数値キーパッド UI の具体（iOS/Android の `inputmode="numeric"` で十分か要実機確認）
- タイムゾーン: `Asia/Tokyo` をサーバー側で固定するか、クライアント側で変換するか
  - 推奨: Postgres 側は `timestamptz`、表示は `Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo' })` で統一
- secret 入力 UI（URL を知らない人がアクセスしたとき）: MVP では 404 相当で良い

## 参考

- Next.js 16 の破壊的変更に注意（`node_modules/next/dist/docs/` を実装前に参照）
- Supabase Free Tier 制限: DB 500MB / 月5万Auth req / 容量試算上は生涯 ~20MB なので問題なし
