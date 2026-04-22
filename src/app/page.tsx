export default function HomePage() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-8 py-16">
      <div className="max-w-xs w-full">
        <p className="eyebrow mb-8">cat health diary</p>
        <div className="text-8xl mb-6 leading-none select-none">🐈</div>
        <div className="mb-8">
          <h1 className="display text-6xl text-ink leading-none">neko</h1>
          <h1 className="display-italic text-6xl text-gold leading-none">health</h1>
        </div>
        <hr className="hairline mb-8" />
        <p className="jp-display text-sm text-ink-muted leading-loose">
          飼い猫のご飯量・飲水量を記録して
          <br />
          健康管理するアプリです。
        </p>
        <p className="font-mono text-xs text-ink-faint mt-5 leading-relaxed">
          家族で共有している URL から
          <br />
          アクセスしてください。
        </p>
      </div>
    </main>
  );
}
