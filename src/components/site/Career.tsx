import { career, education } from "@/content/career";
import type { Job } from "@/content/types";

/** 2024-04 → 「2024.04」。現職は end が null */
function formatPeriod(job: Job) {
  const fmt = (v: string) => v.replace("-", ".");
  return `${fmt(job.start)} — ${job.end ? fmt(job.end) : "現在"}`;
}

export function Career() {
  return (
    <div className="space-y-16">
      {career.map((job) => (
        <article key={`${job.start}-${job.company}`}>
          <div className="font-mono text-xs tracking-widest text-fg-faint">
            {formatPeriod(job)}
          </div>
          <h3 className="mt-2 text-xl font-medium tracking-tight">
            {job.companyAlias ?? job.company}
          </h3>
          <div className="mt-1 text-sm text-fg-muted">{job.role}</div>
          <p className="prose-ja mt-5 max-w-2xl text-sm text-fg-muted">
            {job.summary}
          </p>

          {job.highlights.length > 0 && (
            <ul className="rule-left mt-8 space-y-8 pl-6">
              {job.highlights.map((h) => (
                <li key={h.title}>
                  <h4 className="text-sm font-medium">{h.title}</h4>
                  <p className="prose-ja mt-2 max-w-2xl text-sm text-fg-muted">
                    {h.body}
                  </p>
                  {h.link && (
                    <a
                      href={h.link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block border-b border-rule pb-0.5 text-xs text-fg-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      {h.link.label} ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}

          {job.stack.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-fg-faint">
              {job.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
        </article>
      ))}

      <div className="border-t border-rule pt-8">
        {education.map((e) => (
          <div key={e.title}>
            <div className="font-mono text-xs tracking-widest text-fg-faint">
              {e.date.replace("-", ".")}
            </div>
            <div className="mt-2 text-sm">{e.title}</div>
            {e.note && (
              <div className="mt-1 text-xs text-fg-muted">{e.note}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
