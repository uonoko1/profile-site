import { site } from "@/content/site";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { Link } from "react-router-dom";

/**
 * 入口のページ。名乗りと行き先だけを置き、説明はしない。
 * 読ませるものはリンク先(ブログ・GitHub)に任せる。
 */
export function Landing() {
  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      {/* 粒子場は下に敷く。文字とは重ねない */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[26rem] opacity-40">
        <HeroCanvas variant="strata" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/40 to-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-transparent to-bg" />
      </div>

      {/* 行き先は右上に小さく置く */}
      <nav className="flex justify-end gap-x-6 px-6 py-6 font-mono text-xs uppercase tracking-widest md:px-10">
        <Link
          to="/blog"
          className="text-fg-muted transition-colors hover:text-accent"
        >
          Blog
        </Link>
        {site.links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            {...(l.href.startsWith("http")
              ? { target: "_blank", rel: "noreferrer" }
              : {})}
            className="text-fg-muted transition-colors hover:text-accent"
          >
            {l.label}
          </a>
        ))}
      </nav>

      {/* 名乗りは画面の上寄り中央。下に余白を残して粒子場に繋ぐ */}
      <main className="flex flex-col items-center px-6 pt-[14vh] text-center md:pt-[18vh]">
        <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
          {site.nameJa}
        </h1>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-fg-muted md:text-sm">
          {site.name} — {site.role}
        </p>
        <p className="prose-ja mt-10 text-balance text-lg text-fg md:text-xl">
          {site.tagline}
        </p>
      </main>
    </div>
  );
}
