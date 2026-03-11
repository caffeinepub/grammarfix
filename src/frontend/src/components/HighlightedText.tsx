import type { LTMatch } from "@/components/GrammarChecker";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

interface HighlightedTextProps {
  text: string;
  matches: LTMatch[];
  onApplyFix: (matchIndex: number, replacement: string) => void;
}

interface Segment {
  text: string;
  matchIndex: number | null;
  isSpelling: boolean;
  key: string;
}

function buildSegments(text: string, matches: LTMatch[]): Segment[] {
  const segments: Segment[] = [];
  const sorted = [...matches]
    .map((m, i) => ({ ...m, originalIndex: i }))
    .sort((a, b) => a.offset - b.offset);

  let cursor = 0;
  for (const m of sorted) {
    if (m.offset > cursor) {
      segments.push({
        text: text.slice(cursor, m.offset),
        matchIndex: null,
        isSpelling: false,
        key: `plain-${cursor}`,
      });
    }
    segments.push({
      text: text.slice(m.offset, m.offset + m.length),
      matchIndex: m.originalIndex,
      isSpelling: m.rule.issueType === "misspelling",
      key: `match-${m.originalIndex}-${m.offset}`,
    });
    cursor = m.offset + m.length;
  }
  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      matchIndex: null,
      isSpelling: false,
      key: `plain-${cursor}-end`,
    });
  }
  return segments;
}

export default function HighlightedText({
  text,
  matches,
  onApplyFix,
}: HighlightedTextProps) {
  const [activeMatch, setActiveMatch] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const segments = buildSegments(text, matches);

  const toggleMatch = (matchIndex: number) => {
    setActiveMatch((prev) => (prev === matchIndex ? null : matchIndex));
  };

  const handleApply = (matchIndex: number, replacement: string) => {
    setActiveMatch(null);
    onApplyFix(matchIndex, replacement);
  };

  return (
    <div className="relative">
      {activeMatch !== null && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActiveMatch(null)}
        />
      )}

      <p
        className="text-base leading-relaxed font-body whitespace-pre-wrap break-words select-text"
        style={{ minHeight: "80px" }}
      >
        {segments.map((seg) => {
          if (seg.matchIndex === null) {
            return <span key={seg.key}>{seg.text}</span>;
          }

          const match = matches[seg.matchIndex];
          const isActive = activeMatch === seg.matchIndex;
          const top3 = match.replacements.slice(0, 3);
          const matchIdx = seg.matchIndex;

          return (
            <span key={seg.key} className="relative inline">
              <button
                type="button"
                className={`${seg.isSpelling ? "spell-error" : "grammar-error"} font-[inherit] text-[inherit] bg-none border-none p-0 m-0 cursor-pointer`}
                onClick={() => toggleMatch(matchIdx)}
                aria-expanded={isActive}
                aria-label={`${seg.isSpelling ? "Spelling" : "Grammar"} error: ${match.message}`}
              >
                {seg.text}
              </button>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    ref={popoverRef}
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 top-full mt-2 z-20 w-72 rounded-xl border border-border bg-popover shadow-popover p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={
                          seg.isSpelling
                            ? {
                                background: "oklch(0.55 0.22 27 / 0.1)",
                                color: "oklch(0.45 0.2 27)",
                              }
                            : {
                                background: "oklch(0.72 0.16 80 / 0.1)",
                                color: "oklch(0.52 0.15 75)",
                              }
                        }
                      >
                        {seg.isSpelling ? "Spelling" : "Grammar"}
                      </span>
                    </div>

                    <p className="text-sm text-foreground mb-3 leading-snug">
                      {match.message}
                    </p>

                    {top3.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                          Suggestions
                        </p>
                        {top3.map((rep, idx) => (
                          <Button
                            key={rep.value}
                            size="sm"
                            variant="outline"
                            className="w-full justify-start gap-2 h-8 text-sm font-medium hover:bg-primary/5"
                            onClick={() => handleApply(matchIdx, rep.value)}
                          >
                            <span
                              className="w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold shrink-0"
                              style={{
                                background: "oklch(0.42 0.12 255 / 0.1)",
                                color: "oklch(0.42 0.12 255)",
                              }}
                            >
                              {idx + 1}
                            </span>
                            {rep.value}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        No suggestions available.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveMatch(null)}
                      className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-base leading-none"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
          );
        })}
      </p>
    </div>
  );
}
