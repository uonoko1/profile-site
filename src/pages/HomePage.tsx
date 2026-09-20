import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { Career } from "@/components/site/Career";
import { Work } from "@/components/site/Work";
import { Skills } from "@/components/site/Skills";
import { Writing } from "@/components/site/Writing";
import { Footer } from "@/components/site/Footer";
import { site } from "@/content/site";
import { career } from "@/content/career";
import { useHead } from "@/lib/head";

/** 検索結果で職歴が構造化データとして拾われるようにしておく */
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

  return (
    <>
      <Hero />
      <main>
        <Section id="career" index="01" title="経歴" titleEn="Career">
          <Career />
        </Section>
        <Section id="work" index="02" title="つくったもの" titleEn="Work">
          <Work />
        </Section>
        <Section id="skills" index="03" title="使うもの" titleEn="Stack">
          <Skills />
        </Section>
        <Section id="writing" index="04" title="書いたもの" titleEn="Writing">
          <Writing />
        </Section>
      </main>
      <Footer />
    </>
  );
}
