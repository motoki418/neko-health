@AGENTS.md

# neko-health — Claude 固有メモ

共通ルール（前提・認可モデル・Supabase・データ不変条件・UX・デザイン・セキュリティ・検証・やらないこと）は @AGENTS.md を単一の正とする。以下は AGENTS.md に無い／薄い Claude 向け補足のみ。

## ハマりポイント（AGENTS.md 未記載）

- **body に `flex flex-col` を付けない**。`max-w-2xl mx-auto` と組み合わさると main が content-width に潰れる（過去に 163px まで縮んだ）。
- **Recharts の `formatter` 引数に型注釈を書かない**。`(v) =>` で推論させて `typeof v === 'number'` でガードする。

## 詳細補足

- **タイムゾーン**: DB は `timestamptz`(UTC)。表示・集計は `Asia/Tokyo` で「今日」の境界は JST 0:00。ユーティリティは `src/lib/time.ts`（`TZ` 定数経由）。
- **量チップ範囲**: ドライ 5–30g / ウェット 10–70g / 水 20–100ml。モード別最適化なので勝手に変えない。
