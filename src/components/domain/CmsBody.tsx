/** Renders plain CMS markdown as paragraphs / simple headings. */
export function CmsBody({ markdown }: { markdown: string }) {
  const blocks = markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) return null;

  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        if (block.startsWith("### ")) {
          return (
            <h3 key={block.slice(0, 40)} className="text-base font-medium">
              {block.slice(4)}
            </h3>
          );
        }
        if (block.startsWith("## ")) {
          return (
            <h2 key={block.slice(0, 40)} className="text-xl">
              {block.slice(3)}
            </h2>
          );
        }
        if (block.startsWith("# ")) {
          return (
            <h2 key={block.slice(0, 40)} className="text-2xl">
              {block.slice(2)}
            </h2>
          );
        }
        const lines = block.split("\n").map((line) => line.replace(/^[-*]\s+/, "• "));
        return (
          <p key={block.slice(0, 40)} className="text-sm leading-relaxed text-ink-soft whitespace-pre-line">
            {lines.join("\n")}
          </p>
        );
      })}
    </div>
  );
}
