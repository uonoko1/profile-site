import { HeroCanvas } from "@/components/three/HeroCanvas";
import { site } from "@/content/site";

/**
 * 粒子場は水平の帯として背景に敷き、主役は組版に置く(B案)。
 * 見出しは常に DOM のテキストとして存在させる — LCP・SEO・スクリーンリーダーのため、
 * WebGL が動かなくてもここは何も変わらない。
 */
export function Hero() {
  return (
    <header className="relative isolate overflow-hidden">
      {/*
       * 粒子場は帯として敷くが、主役はあくまで組版(B案)。
       * - 本文の下端より下に置き、文字の上に重ならないようにする
       * - 上端を地の色で強く覆い、見出し側へは滲みだけが届くようにする
       */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[22rem] opacity-45">
        <HeroCanvas variant="strata" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/30 to-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-transparent to-bg" />
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-32 md:grid-cols-[10rem_1fr] md:gap-14 md:px-8 md:py-44">
        <div className="font-mono text-xs tracking-widest text-fg-faint md:pt-3">
          00 / INDEX
        </div>
        <div className="min-w-0">
          <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
            {site.nameJa}
          </h1>
          <p className="mt-3 font-mono text-sm tracking-widest text-fg-muted uppercase">
            {site.name} — {site.role}
          </p>
          <p className="prose-ja mt-10 max-w-2xl text-balance text-lg text-fg md:text-xl">
            {site.tagline}
          </p>
          <p className="prose-ja mt-6 max-w-2xl text-sm text-fg-muted">
            {site.description}
          </p>
          <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs uppercase tracking-widest">
            {site.links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="border-b border-rule pb-1 text-fg-muted transition-colors hover:border-accent hover:text-accent"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
