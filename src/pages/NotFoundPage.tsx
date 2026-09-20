import { Link } from "react-router-dom";
import { useHead } from "@/lib/head";
import { site } from "@/content/site";

export function NotFoundPage() {
  useHead({
    title: `見つかりません — ${site.name}`,
    description: "指定されたページは存在しません。",
    canonical: `${site.url}/`,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 md:px-8">
      <div className="font-mono text-xs tracking-widest text-fg-faint">404</div>
      <h1 className="mt-4 text-2xl font-medium tracking-tight">
        ページが見つかりません
      </h1>
      <p className="prose-ja mt-4 max-w-md text-sm text-fg-muted">
        URL が変わったか、削除された可能性があります。
      </p>
      <Link
        to="/"
        className="mt-8 font-mono text-xs tracking-widest text-accent transition-opacity hover:opacity-70"
      >
        ← INDEX
      </Link>
    </main>
  );
}
