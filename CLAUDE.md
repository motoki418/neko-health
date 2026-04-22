@AGENTS.md

# neko-health

飼い猫（メルク・エイラ）のごはん／みずを夫婦で共有記録する個人 Web アプリ。

## 前提（コードに書いてない判断軸）

- **ユーザー**: 中村元揮と妻の2人のみ。家族外に共有しない。
- **3タップ制約が最優先**: スマホから3タップ以内で1回の記録が完了すること。これを壊す変更は不可。
- **0円運用**: Supabase Free + Vercel Hobby の範囲を逸脱しない。
- **データ保持無期限**: 容量試算上問題にならない（生涯 ~20MB）。

## 認可モデル（最重要・非自明）

**認証は入れない。** 代わりに推測不可のランダム文字列（nanoid(24)）を URL パスに埋め込み、家族外アクセスをブロックする。

- URL: `/h/[secret]` 配下が全てのプライベート領域
- `src/app/h/[secret]/layout.tsx` で `assertHousehold(secret)` を1回呼ぶ
- 全 Server Action は第一引数に `secret` を取り、冒頭で `assertHousehold` を呼ぶ
- 失敗したら `notFound()`（= 404 相当）
- **secret をログ・エラーメッセージ・URL パラメータに出さない**

## Supabase の使い方（非自明）

- **Server Actions + `service_role` キー経由でのみ DB アクセス**。クライアントから `supabase-js` を直接叩かない。
- **RLS は無効**。認可はアプリ層（`assertHousehold`）に一元化。secret ベースで RLS を書くと複雑化するため採用しない。
- Server Action の戻り値は `{ ok: true; data } | { ok: false; error }` で統一。

## データの不変条件

`records` テーブルに DB 制約で表現していないが守るべきルール:

- `kind='food'` のとき `food_type` は `'dry' | 'wet'` 必須
- `kind='water'` のとき `food_type` は null 必須
- `kind='food'` のとき `unit='g'`、`kind='water'` のとき `unit='ml'`

アプリ層（`src/app/h/[secret]/actions.ts`）でバリデーションする。

## UX の固い決定

- **保存成功してもボトムシートを閉じない**。ドライ→ウェット混合給餌など連続記録があるため。「閉じる」ボタンで明示クローズ。
- 量チップはモード別に最適化（ドライ: 5–30g、ウェット: 10–70g、水: 20–100ml）。勝手に変えない。

## タイムゾーン

- DB は `timestamptz` (UTC)
- 表示・集計は `Asia/Tokyo`。「今日」の境界は JST 0:00
- ユーティリティは `src/lib/time.ts`（`TZ` 定数経由）

## ハマりポイント

1. **`params` は Promise**（Next.js 16）。`const { secret } = await params` と書く。
2. **body に `flex flex-col` を付けない**。`max-w-2xl mx-auto` と組み合わさると main が content-width に潰れる（過去に 163px まで縮んだ）。
3. **Recharts の `formatter` 引数に型注釈を書かない**。`(v) =>` で推論させて `typeof v === 'number'` でガードする。
4. **Next.js 16 は訓練データと差分あり**。実装前に `node_modules/next/dist/docs/01-app/` の該当ガイドを読む（AGENTS.md 参照）。

## デザイン

- ライトウォームテーマ（`color-scheme: light` 固定、`prefers-color-scheme: dark` は無視）
- フォント: Fraunces（ラテン数字・セリフ）/ Shippori Mincho（和文見出し）/ Geist Sans（本文）
- 色トークンは `src/app/globals.css` の CSS 変数（`--paper` / `--food` / `--water` 等）
- Arial・Inter などジェネリックフォント、purple gradient on white は使わない

## やらないこと

- ユーザー認証・アカウント管理
- 公開・マネタイズ・ネイティブアプリ化
- 獣医連携・医療機能
