import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// /h/[secret] 配下は force-dynamic 主体で Next の incremental cache をほぼ使わないため、
// 当面は default 構成（tomozane-matching-mvp と同じ判断）。
// ISR/キャッシュを使う段になったら r2-incremental-cache 等を足す。
export default defineCloudflareConfig({});
