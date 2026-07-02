#!/usr/bin/env node
// Cloudflare Workers 移行後の逆流防止ガード。
// Vercel のビルド環境（process.env.VERCEL）で next build が走ったら即失敗させる。
// tomozane-matching-mvp の同名スクリプトと同一パターン。

if (process.env.VERCEL) {
  console.error(
    "This repo is Cloudflare Workers-only. Do not deploy it on Vercel.",
  );
  process.exit(1);
}
