import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-rule py-16">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-[10rem_1fr] md:gap-14 md:px-8">
        <div className="font-mono text-xs tracking-widest text-fg-faint">
          END
        </div>
        <div className="min-w-0">
          <nav className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs uppercase tracking-widest">
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
          <p className="mt-8 font-mono text-xs text-fg-faint">
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
