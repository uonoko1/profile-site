import { projects } from "@/content/projects";

/**
 * 課題 → 手法 → 結果 の順で読ませる。
 * 何を作ったかより、なぜその形にしたかが読み手の判断材料になる。
 */
export function Work() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <div className="space-y-20">
      {featured.map((p) => (
        <article key={p.slug}>
          <div className="flex items-baseline gap-4">
            <h3 className="text-xl font-medium tracking-tight">{p.title}</h3>
            <span className="font-mono text-xs text-fg-faint">{p.year}</span>
          </div>
          <p className="prose-ja mt-4 max-w-2xl text-sm">{p.blurb}</p>

          <dl className="rule-left mt-8 space-y-6 pl-6">
            {p.problem && (
              <div>
                <dt className="font-mono text-xs uppercase tracking-widest text-fg-faint">
                  Problem
                </dt>
                <dd className="prose-ja mt-2 max-w-2xl text-sm text-fg-muted">
                  {p.problem}
                </dd>
              </div>
            )}
            {p.approach && (
              <div>
                <dt className="font-mono text-xs uppercase tracking-widest text-fg-faint">
                  Approach
                </dt>
                <dd className="prose-ja mt-2 max-w-2xl text-sm text-fg-muted">
                  {p.approach}
                </dd>
              </div>
            )}
            {p.outcome && (
              <div>
                <dt className="font-mono text-xs uppercase tracking-widest text-fg-faint">
                  Outcome
                </dt>
                <dd className="prose-ja mt-2 max-w-2xl text-sm text-fg-muted">
                  {p.outcome}
                </dd>
              </div>
            )}
          </dl>

          <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-fg-faint">
            {p.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          {p.links && p.links.length > 0 && (
            <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-widest">
              {p.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="border-b border-rule pb-1 text-fg-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {l.label} ↗
                </a>
              ))}
            </nav>
          )}
        </article>
      ))}

      <div className="border-t border-rule pt-10">
        <ul className="space-y-8">
          {rest.map((p) => (
            <li key={p.slug}>
              <div className="flex items-baseline gap-4">
                <h3 className="text-base font-medium tracking-tight">
                  {p.title}
                </h3>
                <span className="font-mono text-xs text-fg-faint">{p.year}</span>
              </div>
              <p className="prose-ja mt-2 max-w-2xl text-sm text-fg-muted">
                {p.outcome ?? p.blurb}
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-fg-faint">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
