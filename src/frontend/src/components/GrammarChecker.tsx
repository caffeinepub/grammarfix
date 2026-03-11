import HighlightedText from "@/components/HighlightedText";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Loader2,
  RotateCcw,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface LTReplacement {
  value: string;
}

interface LTMatch {
  message: string;
  offset: number;
  length: number;
  replacements: LTReplacement[];
  rule: { issueType: string };
}

interface LTResponse {
  matches: LTMatch[];
}

const LANGUAGES = [
  { label: "English (US)", value: "en-US" },
  { label: "English (UK)", value: "en-GB" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
];

export type { LTMatch };

export default function GrammarChecker() {
  const { actor } = useActor();
  const [text, setText] = useState(
    "Ths is a sampel text with som speling mistaeks. Their are also grammer errors in this sentance.",
  );
  const [language, setLanguage] = useState("en-US");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<LTMatch[] | null>(null);
  const [checkedText, setCheckedText] = useState<string | null>(null);
  const abortRef = useRef(false);

  const spellCount =
    matches?.filter((m) => m.rule.issueType === "misspelling").length ?? 0;
  const grammarCount =
    matches?.filter((m) => m.rule.issueType !== "misspelling").length ?? 0;

  const handleCheck = useCallback(async () => {
    if (!actor || !text.trim()) return;
    setLoading(true);
    setError(null);
    setMatches(null);
    abortRef.current = false;

    try {
      const raw = await actor.checkText(text, language);
      if (abortRef.current) return;
      const parsed: LTResponse = JSON.parse(raw);
      setMatches(parsed.matches ?? []);
      setCheckedText(text);
    } catch (e) {
      if (!abortRef.current) {
        setError(
          e instanceof Error ? e.message : "An unexpected error occurred.",
        );
      }
    } finally {
      if (!abortRef.current) setLoading(false);
    }
  }, [actor, text, language]);

  const handleFixAll = useCallback(() => {
    if (!matches || !checkedText) return;
    const sorted = [...matches]
      .filter((m) => m.replacements.length > 0)
      .sort((a, b) => b.offset - a.offset);

    let fixed = checkedText;
    for (const m of sorted) {
      fixed =
        fixed.slice(0, m.offset) +
        m.replacements[0].value +
        fixed.slice(m.offset + m.length);
    }
    setText(fixed);
    setCheckedText(fixed);
    setMatches([]);
    toast.success("All fixes applied!");
  }, [matches, checkedText]);

  const handleApplyFix = useCallback(
    (matchIndex: number, replacement: string) => {
      if (!matches || !checkedText) return;
      const match = matches[matchIndex];
      const fixed =
        checkedText.slice(0, match.offset) +
        replacement +
        checkedText.slice(match.offset + match.length);

      const delta = replacement.length - match.length;
      const updatedMatches = matches
        .filter((_, i) => i !== matchIndex)
        .map((m) =>
          m.offset > match.offset ? { ...m, offset: m.offset + delta } : m,
        );

      setText(fixed);
      setCheckedText(fixed);
      setMatches(updatedMatches);
    },
    [matches, checkedText],
  );

  const handleCopy = useCallback(async () => {
    const toCopy = checkedText ?? text;
    await navigator.clipboard.writeText(toCopy);
    toast.success("Copied to clipboard!");
  }, [checkedText, text]);

  const handleClear = useCallback(() => {
    abortRef.current = true;
    setText("");
    setMatches(null);
    setCheckedText(null);
    setError(null);
    setLoading(false);
  }, []);

  const hasResults = matches !== null;

  return (
    <div className="space-y-6">
      {/* Editor card */}
      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2 flex-1">
            <Label
              htmlFor="language-select"
              className="text-sm font-medium whitespace-nowrap text-muted-foreground"
            >
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger
                id="language-select"
                className="h-8 w-40 text-sm"
                data-ocid="checker.language_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {hasResults && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={handleCopy}
                  data-ocid="checker.copy_button"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                  onClick={handleClear}
                  data-ocid="checker.clear_button"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Text input area */}
        <div className="p-4">
          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (hasResults) {
                setMatches(null);
                setCheckedText(null);
              }
            }}
            placeholder="Paste or type your text here to check for spelling and grammar errors..."
            className="min-h-[200px] resize-y text-base leading-relaxed border-0 shadow-none focus-visible:ring-0 bg-transparent p-0 font-body"
            data-ocid="checker.textarea"
          />
        </div>

        {/* Check button footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <span className="text-xs text-muted-foreground">
            {text.length} characters·{" "}
            {text.trim() ? text.trim().split(/\s+/).length : 0} words
          </span>
          <Button
            onClick={handleCheck}
            disabled={loading || !text.trim()}
            className="gap-2 font-semibold"
            data-ocid="checker.check_button"
          >
            {loading ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  data-ocid="checker.loading_state"
                />
                Checking…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Check Text
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
            data-ocid="checker.error_state"
          >
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-destructive text-sm">
                Check failed
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {hasResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {matches!.length === 0 ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex items-center gap-3 rounded-xl border p-4"
                style={{
                  borderColor: "oklch(0.65 0.15 160 / 0.4)",
                  background: "oklch(0.65 0.15 160 / 0.06)",
                }}
                data-ocid="checker.success_state"
              >
                <CheckCircle2
                  className="h-5 w-5 shrink-0"
                  style={{ color: "oklch(0.55 0.15 160)" }}
                />
                <p
                  className="font-semibold text-sm"
                  style={{ color: "oklch(0.45 0.15 160)" }}
                >
                  No errors found! Your text looks great.
                </p>
              </motion.div>
            ) : (
              <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                {/* Summary */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <h2 className="font-display font-semibold text-sm text-foreground">
                      Results
                    </h2>
                    <div className="flex gap-2">
                      {spellCount > 0 && (
                        <motion.span
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 20,
                            delay: 0.1,
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{
                            background: "oklch(0.55 0.22 27 / 0.1)",
                            color: "oklch(0.45 0.2 27)",
                            border: "1px solid oklch(0.55 0.22 27 / 0.25)",
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: "oklch(0.55 0.22 27)" }}
                          />
                          {spellCount} spelling
                        </motion.span>
                      )}
                      {grammarCount > 0 && (
                        <motion.span
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 20,
                            delay: 0.2,
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{
                            background: "oklch(0.72 0.16 80 / 0.1)",
                            color: "oklch(0.52 0.15 75)",
                            border: "1px solid oklch(0.72 0.16 80 / 0.3)",
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: "oklch(0.72 0.16 80)" }}
                          />
                          {grammarCount} grammar
                        </motion.span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleFixAll}
                    className="gap-1.5 text-xs h-8"
                    data-ocid="checker.fix_all_button"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Fix All
                  </Button>
                </div>

                {/* Highlighted text */}
                <div className="p-4">
                  <HighlightedText
                    text={checkedText!}
                    matches={matches!}
                    onApplyFix={handleApplyFix}
                  />
                </div>

                {/* Legend */}
                <div className="flex gap-4 px-4 py-2.5 border-t border-border bg-muted/20">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="inline-block w-8 h-0.5 rounded"
                      style={{ background: "oklch(0.55 0.22 27)" }}
                    />
                    Spelling
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="inline-block w-8 h-0.5 rounded"
                      style={{ background: "oklch(0.72 0.16 80)" }}
                    />
                    Grammar
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Click an underlined word to fix it
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
