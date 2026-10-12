import { Landing } from "@/components/site/Landing";
import { site } from "@/content/site";
import { career } from "@/content/career";
import { useHead } from "@/lib/head";

/**
 * 画面には出さないが、検索結果と SNS 向けに人物の構造化データは持たせておく。
 * 表示を削っても、機械に対する名乗りは残す。
 */
function profileJsonLd() {
  const current = career.find((j) => j.end === null);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    alternateName: site.nameJa,
    jobTitle: site.role,
    url: site.url,
    description: site.description,
    sameAs: site.links.filter((l) => l.href.startsWith("http")).map((l) => l.href),
    ...(current && { worksFor: { "@type": "Organization", name: current.company } }),
  };
}

export function HomePage() {
  useHead({
    title: `${site.name} — ${site.role}`,
    description: site.description,
    canonical: `${site.url}/`,
    ogType: "profile",
    jsonLd: profileJsonLd(),
  });

  return <Landing />;
}
