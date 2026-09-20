import { Link } from "react-router-dom";
import { posts } from "virtual:posts";
import { site } from "@/content/site";
import { Footer } from "@/components/site/Footer";
import { useHead } from "@/lib/head";

const DESCRIPTION = "実装で詰まったところと、その解き方の記録。";

export function BlogIndexPage() {
  useHead({
    title: `書いたもの — ${site.name}`,
    description: DESCRIPTION,
    canonical: `${site.url}/blog/`,
  });

  return (
    <>
      <main className="mx-auto max-w-5xl px-6 py-24 md:px-8 md:py-32">
        <div className="grid gap-10 md:grid-cols-[10rem_1fr] md:gap-14">
          <div className="font-mono text-xs tracking-widest text-fg-faint md:pt-2">
            <Link to="/" className="transition-colors hover:text-accent">
              ← INDEX
            </Link>
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
              書いたもの
            </h1>
            <p className="prose-ja mt-4 max-w-xl text-sm text-fg-muted">
              {DESCRIPTION}
            </p>

            <ul className="mt-16 space-y-12">
              {posts.map((p) => (
                <li key={p.slug} className="rule-left">
                  <div className="flex flex-wrap items-baseline gap-x-4 font-mono text-xs text-fg-faint">
                    <time dateTime={p.date}>{p.date}</time>
                    <span>{p.readingMinutes} min</span>
                  </div>
                  <h2 className="mt-2 text-lg font-medium tracking-tight">
                    <Link
                      to={`/blog/${p.slug}`}
                      className="transition-colors hover:text-accent"
                    >
                      {p.title}
                    </Link>
                  </h2>
                  <p className="prose-ja mt-2 max-w-2xl text-sm text-fg-muted">
                    {p.excerpt}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
