<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# neko-health — プロジェクト固有指示

## 技術前提

- 作業開始時に必ず `git status --short --branch` を実行し、ブランチ・ahead/behind・dirty差分・未追跡ファイルを確認する。
- ユーザー既存のdirty差分や未追跡ファイルは、明示指示なしに編集・整形・削除・revertしない。必要な変更が既存dirtyファイルと重なる場合は、先に差分を読んで最小限の追記に留める。
- `git add .` は禁止。ステージングが必要な場合でも、明示指示後に対象ファイルを個別指定する。
- `git reset --hard`、`git checkout -- <path>`、`git clean`、`rm -rf`、生成物削除など破壊的なGit操作・削除操作は、明示承認なしに実行しない。
- Next.js 16.2.4 / React 19 系の個人用Webアプリ。古いNext.js知識で実装判断せず、必要に応じて `node_modules/next/dist/docs/` と既存実装を確認する。
- Supabase はサーバー側で `SUPABASE_SERVICE_ROLE_KEY` を使う。service role key、`NEXT_PUBLIC_SUPABASE_URL` 以外の秘匿値、`.env*` の実値は読まない・表示しない・コミットしない。
- 家庭ごとの入口は `/h/<secret>`。`secret` は実質的なアクセス鍵なので、ログ、PR本文、スクリーンショット、外部サービスへ不用意に出さない。
- READMEのVercel手順にある本番デプロイ（`npx vercel --prod`、production promotion、production環境変数変更）は、家族利用中の本番環境に影響するため明示承認なしに実行しない。PR・報告ではdeploy影響とrollbackを明記する。

## 認可とデータアクセス

- 読み書きは `/h/[secret]` 配下のServer Actions経由を基本とする。
- Server Actionsでは必ず冒頭で `assertHousehold(secret)` を通し、以降のSupabaseクエリを `household_id` / 対象猫IDにスコープする。
- service role keyでRLSを迂回する設計のため、クライアントから任意IDを渡して他家庭データに触れる実装は禁止。

## UX制約

- スマホから3タップ以内で1回の食事・飲水記録が完了することを最優先する。
- 記録導線の変更では、猫選択、種別選択、量選択、保存完了までのタップ数と片手操作性を確認する。

## 検証

- 変更後は原則として `npm run lint` と `npm run build` を実行する。
- 実行できない場合は理由、代替確認、残リスクをPR本文または報告に明記する。
