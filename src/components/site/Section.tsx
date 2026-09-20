/**
 * B案(Strata)の骨格。
 * 見出しは左のヘアラインに揃え、通し番号を等幅で振る。
 * 全セクションが同じ基準線を共有することで、縦に読み下せる紙面になる。
 */
export function Section({
  id,
  index,
  title,
  titleEn,
  children,
}: {
  id: string;
  index: string;
  title: string;
  titleEn: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-rule py-20 md:py-28">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 md:grid-cols-[10rem_1fr] md:gap-14 md:px-8">
        <header className="md:pt-1">
          <div className="font-mono text-xs tracking-widest text-fg-faint">
            {index}
          </div>
          <h2 className="mt-2 text-lg font-medium tracking-tight">{title}</h2>
          <div className="mt-1 font-mono text-xs uppercase tracking-widest text-fg-faint">
            {titleEn}
          </div>
        </header>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
