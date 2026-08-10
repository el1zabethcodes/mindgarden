export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function parseMarkdown(md: string): string {
  if (!md) return "";
  
  // temporary placeholder for code blocks to prevent double parsing
  const codeBlocks: string[] = [];
  let html = md.replace(/```([\s\S]*?)```/g, (match, code) => {
    const id = `__CODE_BLOCK_${codeBlocks.length}__`;
    const trimmed = code.trim();
    if (trimmed.startsWith("mermaid")) {
      const syntax = trimmed.substring(7).trim();
      codeBlocks.push(
        `<div class="mermaid bg-slate-50/50 p-4 border border-slate-200/20 rounded-xl my-4 flex justify-center overflow-x-auto" data-syntax="${encodeURIComponent(syntax)}">${syntax}</div>`
      );
    } else {
      codeBlocks.push(
        `<pre class="bg-slate-100/60 border border-slate-200/50 p-4 rounded-xl text-xs font-mono my-4 overflow-x-auto text-charcoal">${trimmed}</pre>`
      );
    }
    return id;
  });

  // escape basic html characters
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // headings (match from start of line or after newlines)
  html = html.replace(/(?:^|\n)### (.*)/g, '\n<h3 class="font-serif text-lg font-semibold mt-5 mb-2 text-charcoal">$1</h3>');
  html = html.replace(/(?:^|\n)## (.*)/g, '\n<h2 class="font-serif text-xl font-semibold mt-6 mb-3 text-charcoal border-b border-slate-200/40 pb-1">$1</h2>');
  html = html.replace(/(?:^|\n)# (.*)/g, '\n<h1 class="font-serif text-2xl font-bold mt-7 mb-4 text-charcoal">$1</h1>');

  // bold and italics
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-charcoal">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/__(.*?)__/g, '<strong class="font-semibold text-charcoal">$1</strong>');
  html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

  // inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded-md text-xs font-mono">$1</code>');

  // blockquotes
  html = html.replace(/(?:^|\n)\> (.*)/g, '\n<blockquote class="border-l-4 border-sage/60 pl-4 italic text-slate/85 my-4">$1</blockquote>');

  // lists: convert lines starting with * or - into lists
  // first handle individual items
  html = html.replace(/(?:^|\n)[\*\-\+] (.*)/g, '\n<li class="ml-4 list-disc text-sm text-slate mb-1">$1</li>');

  // replace code blocks placeholders back
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`__CODE_BLOCK_${idx}__`, block);
  });

  // split into paragraphs or convert newlines
  const lines = html.split("\n");
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return "<br />";
    if (trimmed.startsWith("<h") || trimmed.startsWith("<pre") || trimmed.startsWith("<blockquote") || trimmed.startsWith("<li") || trimmed.startsWith("<ul") || trimmed.startsWith("<ol") || trimmed.startsWith("<br")) {
      return line;
    }
    return `<p class="mb-3 leading-relaxed text-sm text-slate">${line}</p>`;
  });

  return processedLines.join("\n");
}
