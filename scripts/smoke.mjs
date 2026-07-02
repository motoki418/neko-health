#!/usr/bin/env node
/* global console, process, fetch */
// 本番（または任意 URL）への読み取り専用スモーク。書き込みは一切しない。
// 「対象が壊れたら必ず落ちる観測量」を assert する。
//
// 使い方: node scripts/smoke.mjs [BASE_URL]（省略時 SMOKE_BASE_URL）
//   SMOKE_HOUSEHOLD_SECRET があれば実 household ページの描画まで検証する
//   （secret slug は公開リポに書かないため env でのみ受け取る）。

const BASE = process.argv[2] || process.env.SMOKE_BASE_URL;
if (!BASE) {
  console.error("BASE_URL または SMOKE_BASE_URL を指定してください。");
  process.exit(1);
}
const base = BASE.replace(/\/$/, "");
const failures = [];

function check(name, cond, detail) {
  if (cond) console.log(`  ✓ ${name}`);
  else failures.push(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function get(path) {
  const res = await fetch(`${base}${path}`, {
    headers: { "user-agent": "neko-health-smoke" },
    redirect: "manual",
  });
  return { status: res.status, body: await res.text() };
}

// 1) トップ: 200 でアプリ名が描画される
const top = await get("/");
check("/ が 200", top.status === 200, `status=${top.status}`);
check("/ に neko health の見出しがある", /neko/.test(top.body) && /health/.test(top.body), "見出し欠落");

// 2) 存在しない household: 404 系で落ちる（500 やクラッシュではなく）
const bogus = await get("/h/smoke-nonexistent-household");
check(
  "未知の /h/<secret> が 404（500 でない）",
  bogus.status === 404,
  `status=${bogus.status}（500 なら Supabase 接続/env 欠落の疑い）`,
);

// 3) （env があれば）実 household ページが描画される = Supabase 実接続の証拠
const secret = process.env.SMOKE_HOUSEHOLD_SECRET;
if (secret) {
  const h = await get(`/h/${secret}`);
  check("実 household ページが 200", h.status === 200, `status=${h.status}`);
} else {
  console.log("  - SMOKE_HOUSEHOLD_SECRET 未指定のため実データ描画チェックはスキップ");
}

console.log(`smoke: ${base}`);
if (failures.length) {
  console.error("FAILURES:");
  for (const f of failures) console.error(f);
  process.exit(1);
}
console.log("smoke: ALL PASS");
