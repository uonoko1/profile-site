import { Link, useParams } from "react-router-dom";
import { posts } from "virtual:posts";
import { site } from "@/content/site";
import { Footer } from "@/components/site/Footer";
import { useHead } from "@/lib/head";
import { NotFoundPage } from "./NotFoundPage";

export function BlogPostPage() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) return <NotFoundPage />;
  return <PostView post={post} />;
}

function PostView({ post }: { post: (typeof posts)[number] }) {
  useHead({
    title: `${post.title} — ${site.name}`,
    description: post.excerpt,
    canonical: `${site.url}/blog/${post.slug}/`,
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.date,
      ...(post.updated && { dateModified: post.updated }),
      author: { "@type": "Person", name: site.name },
      mainEntityOfPage: `${site.url}/blog/${post.slug}/`,
    },
  });

  return (
    <>
      <main className="mx-auto max-w-5xl px-6 py-24 md:px-8 md:py-32">
        <div className="grid gap-10 md:grid-cols-[10rem_1fr] md:gap-14">
          <div className="md:pt-2">
            <Link
              to="/blog"
              className="font-mono text-xs tracking-widest text-fg-faint transition-colors hover:text-accent"
            >
              ← WRITING
            </Link>

            {post.headings.length > 2 && (
              <nav className="mt-10 hidden md:block" aria-label="目次">
                <div className="font-mono text-[0.65rem] tracking-widest text-fg-faint">
                  CONTENTS
                </div>
                <ul className="mt-3 space-y-2">
                  {post.headings
                    .filter((h) => h.depth <= 3)
                    .map((h) => (
                      <li
                        key={h.id}
                        style={{ paddingLeft: `${(h.depth - 1) * 0.6}rem` }}
                      >
                        <a
                          href={`#${h.id}`}
                          className="text-xs leading-relaxed text-fg-muted transition-colors hover:text-accent"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                </ul>
              </nav>
            )}
          </div>

          <article className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-4 font-mono text-xs text-fg-faint">
              <time dateTime={post.date}>{post.date}</time>
              {post.updated && <span>updated {post.updated}</span>}
              <span>{post.readingMinutes} min</span>
            </div>
            <h1 className="mt-3 text-2xl font-medium leading-snug tracking-tight md:text-3xl">
              {post.title}
            </h1>
            <div
              className="post-body prose-ja mt-12"
              // 本文は自分が書いた Markdown のみ。HTML は無効化して描画している
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
