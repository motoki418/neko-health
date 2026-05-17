# neko-health — Codex 運用ルール

## 役割

このリポジトリは、飼い猫のごはん・飲水量を夫婦で共有記録する個人Webアプリ。

- ユーザーは中村元揮と妻の2人のみ。
- 家族外に共有しない。
- スマホから3タップ以内で1回の記録が完了することを最優先する。
- Supabase Free と Vercel Hobby の0円運用を前提にする。

## 技術前提

- Next.js 16.2.4 / React 19 系の個人用Webアプリ。
- 古いNext.js知識で判断せず、必要に応じて `node_modules/next/dist/docs/` と既存実装を確認する。非推奨通知も確認する。
- `params` は Promise。`const { secret } = await params` の形を使う。
- `body` に `flex flex-col` を安易に付けない。`max-w-2xl mx-auto` と組み合わさるとレイアウトが潰れる。
- パッケージ管理は `pnpm@11.0.8` を正とし、lockfile は `pnpm-lock.yaml` のみ使う。`package-lock.json` は戻さない。
- 依存追加・更新時は `pnpm install --frozen-lockfile`、`pnpm run lint`、`pnpm run build`、npm系lockfile/コマンド残存検索を実行する。
- `pnpm-workspace.yaml` の `trustPolicyExclude` を増やす場合は、理由、対象package/version、削除条件を同じ変更内で記録する。

## 主要ディレクトリ

- `src/app/h/[secret]/`: 家庭ごとのプライベート領域。
- `src/app/h/[secret]/actions.ts`: Server Actions と入力検証。
- `src/lib/time.ts`: `Asia/Tokyo` の日付境界と時刻ユーティリティ。
- `src/app/globals.css`: デザイントークンとテーマ。
- `supabase/`: schema と seed。
- `docs/`: スクリーンショットや補助資料。
- `plans/`: 作業計画。

## 認可モデル

- 認証は入れない。推測困難な `nanoid(24)` を URL パスに埋め込む。
- `/h/[secret]` 配下は `src/app/h/[secret]/layout.tsx` で `assertHousehold(secret)` を通す。
- 全 Server Actions は第一引数に `secret` を取り、冒頭で `assertHousehold(secret)` を呼ぶ。
- 失敗時は `notFound()` にする。
- `secret` は実質的なアクセス鍵。ログ、エラーメッセージ、PR本文、スクリーンショット、外部サービスに出さない。

## Supabase

- DBアクセスは Server Actions と `service_role` キー経由に寄せる。
- クライアントから `supabase-js` を直接叩かない。
- RLS は無効。認可はアプリ層の `assertHousehold` に一元化する。
- Server Action の戻り値は `{ ok: true; data } | { ok: false; error }` で統一する。
- クライアントから任意IDを渡して他家庭データに触れる実装は禁止。

## データの不変条件

- `kind='food'` のとき `food_type` は `'dry' | 'wet'` 必須。
- `kind='water'` のとき `food_type` は null 必須。
- `kind='food'` のとき `unit='g'`、`kind='water'` のとき `unit='ml'`。
- DB制約にないルールは `src/app/h/[secret]/actions.ts` で検証する。

## UX制約

- 記録導線の変更では、猫選択、種別選択、量選択、保存完了までのタップ数を確認する。
- 保存成功後もボトムシートを閉じない。連続記録を優先する。
- 量チップはモード別に最適化されているため、勝手に変更しない。

## デザイン

- ライトウォームテーマを維持する。
- `color-scheme: light` 固定。`prefers-color-scheme: dark` は無視する。
- フォントは Fraunces、Shippori Mincho、Geist Sans を前提にする。
- 色は `src/app/globals.css` の CSS 変数を使う。
- Arial、Inter、白地の purple gradient は使わない。

## 作業開始時の確認

- 必ず `git status --short --branch` を実行し、ブランチ、ahead/behind、変更済みファイル、未追跡ファイルを確認する。
- 既存の変更済みファイルと未追跡ファイルはユーザー作業として扱い、明示指示なしに編集、整形、削除、revertしない。
- 変更対象が既存のdirtyファイルと重なる場合は、先に差分を読んでから最小限に編集する。

## 承認が必要な操作

- Vercel 本番デプロイ、production promotion、production環境変数変更は明示承認なしに行わない。
- READMEのVercel手順にある本番デプロイ、`npx vercel --prod`、production promotion、production環境変数変更は家族利用中の本番環境に影響するため、PR・報告ではdeploy影響とrollbackを明記する。
- commit、push、deploy、publish、mail、GitHub Actions 実行、Issue/PR作成は明示承認なしに行わない。

## セキュリティ

- `.env*`、token、cookie、API key、認証情報、秘密鍵を読まない・表示しない・保存しない。
- `SUPABASE_SERVICE_ROLE_KEY`、`NEXT_PUBLIC_SUPABASE_URL` 以外の秘匿値、家庭用 `secret` の実値を出力しない。

## 禁止事項

- ユーザー認証、アカウント管理、公開、マネタイズ、ネイティブアプリ化、獣医連携、医療機能は追加しない。
- `git add .` は使わない。ステージングが必要な場合も、明示承認後に対象ファイルを個別指定する。
- `git reset --hard`、`git checkout -- <path>`、`git clean`、破壊的な `rm` / `rm -rf`、生成物削除は明示承認なしに実行しない。

## 検証

- 変更後は原則として `pnpm run lint` と `pnpm run build` を実行する。
- 実行できない場合は、理由、代替確認、残リスクを報告する。
- 記録導線の変更では、スマホ幅で3タップ制約と片手操作性を確認する。
- 変更後は `git diff` と `git status --short --branch` で、意図しない差分がないか確認する。
