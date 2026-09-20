import { skills } from "@/content/skills";

export function Skills() {
  return (
    <div className="space-y-10">
      {skills.map((group) => (
        <div key={group.label}>
          <h3 className="font-mono text-xs uppercase tracking-widest text-fg-faint">
            {group.label}
          </h3>
          <ul className="rule-left mt-4 space-y-3 pl-6">
            {group.items.map((item) => (
              <li
                key={item.name}
                className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <span className="min-w-[12rem] text-sm">{item.name}</span>
                {item.note && (
                  <span className="text-xs text-fg-muted">{item.note}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="prose-ja max-w-2xl border-t border-rule pt-8 text-xs text-fg-faint">
        実際に業務または個人開発で投入したものだけを挙げています。クラウドや IaC
        は現状「少し触ったことがある」段階なので載せていません。
      </p>
    </div>
  );
}
