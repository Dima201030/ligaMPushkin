import Link from "next/link";
import type { HandbookBlock, HandbookSection } from "@/lib/handbook";

function BlockView({ block }: { block: HandbookBlock }) {
  switch (block.kind) {
    case "paragraph":
      return <p className="text-sm leading-relaxed text-ink-soft">{block.text}</p>;
    case "list":
      return (
        <ul className="space-y-3">
          {block.items.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 border-b border-divider pb-3 text-sm leading-relaxed text-ink-soft last:border-b-0 last:pb-0"
            >
              <span className="mt-2 size-1 shrink-0 rounded-full bg-ink" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="space-y-0">
          {block.items.map((item, index) => (
            <li
              key={item.title}
              className="grid gap-2 border-b border-line py-4 first:pt-0 last:border-b-0 sm:grid-cols-[3rem_1fr] sm:gap-5"
            >
              <p className="display text-[1.4rem] leading-none text-ink-faint">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "note":
      return (
        <p className="border-l border-line pl-4 text-xs leading-relaxed text-ink-muted">
          {block.text}
        </p>
      );
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line">
                {block.headers.map((header) => (
                  <th
                    key={header}
                    className="py-2.5 pr-4 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-ink-muted"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")} className="border-b border-divider last:border-b-0">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${row[0]}-${cellIndex}`}
                      className={`py-3 pr-4 align-top leading-relaxed ${
                        cellIndex === 0 ? "font-medium text-ink" : "text-ink-soft"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "link":
      return (
        <div>
          <Link href={block.href} className="link-arrow">
            {block.label}
          </Link>
          {block.hint ? (
            <p className="mt-2 text-xs text-ink-muted">{block.hint}</p>
          ) : null}
        </div>
      );
    default:
      return null;
  }
}

export function HandbookBlocks({
  sectionId,
  blocks,
}: {
  sectionId: string;
  blocks: HandbookBlock[];
}) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => (
        <BlockView key={`${sectionId}-${index}`} block={block} />
      ))}
    </div>
  );
}

export function HandbookSectionView({
  section,
  children,
  childrenBefore,
}: {
  section: HandbookSection;
  children?: React.ReactNode;
  childrenBefore?: React.ReactNode;
}) {
  return (
    <section id={section.id} className="scroll-mt-8 border-t border-line pt-8">
      <h2 className="text-xl text-ink">{section.title}</h2>
      {section.lead ? (
        <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-ink-muted">{section.lead}</p>
      ) : null}
      {childrenBefore ? <div className="mt-5">{childrenBefore}</div> : null}
      <div className={childrenBefore ? "mt-6 space-y-5" : "mt-5 space-y-5"}>
        {section.blocks.map((block, index) => (
          <BlockView key={`${section.id}-${index}`} block={block} />
        ))}
        {children}
      </div>
    </section>
  );
}
