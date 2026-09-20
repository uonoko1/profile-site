import { Link } from "react-router-dom";
import { publications } from "@/content/publications";

/** 書いたものは、経歴の主張を外から検証できるようにするためのもの */
export function Writing() {
  return (
    <ul className="space-y-8">
      {publications.map((p) => {
        const external = p.href.startsWith("http");
        const className =
          "prose-ja mt-2 block max-w-2xl text-sm transition-colors hover:text-accent";
        return (
          <li key={p.href}>
            <div className="flex flex-wrap items-baseline gap-x-4 font-mono text-xs text-fg-faint">
              <span>{p.date}</span>
              <span>{p.outlet}</span>
            </div>
            {external ? (
              <a href={p.href} target="_blank" rel="noreferrer" className={className}>
                {p.title} ↗
              </a>
            ) : (
              <Link to={p.href} className={className}>
                {p.title} →
              </Link>
            )}
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-fg-faint">
              {p.topics.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </li>
        );
      })}
      <li>
        <Link
          to="/blog"
          className="font-mono text-xs tracking-widest text-accent transition-opacity hover:opacity-70"
        >
          すべての記事 →
        </Link>
      </li>
    </ul>
  );
}
