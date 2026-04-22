# neko-health

飼い猫のご飯量・飲水量を夫婦で共有して健康管理する Web アプリ。

設計詳細は [docs/design.md](docs/design.md) を参照。

## セットアップ

### 1. Supabase プロジェクト作成

1. https://supabase.com で新規プロジェクトを作る
2. SQL Editor で `supabase/schema.sql` を実行
3. `supabase/seed.sql` の `REPLACE_WITH_NANOID_24` を以下で生成した値に置換してから実行

```bash
node -e "console.log(require('nanoid').nanoid(24))"
```

4. seed.sql の `insert into cats` を自分の猫の数だけ書き換えて実行

### 2. 環境変数

`.env.local` をリポジトリ直下に作成（コミット禁止）:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Settings → API → service_role
```

### 3. 起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000/h/<secret_slug>` を開く。

## デプロイ (Vercel)

1. GitHub に push
2. Vercel で import、同じ環境変数を Production に設定
3. 家族には `https://<your-app>.vercel.app/h/<secret_slug>` を共有

Preview deploy は secret 漏洩防止のため Vercel の Deployment Protection で保護することを推奨。
