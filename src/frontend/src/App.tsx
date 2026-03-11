import GrammarChecker from "@/components/GrammarChecker";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        {/* Hero header */}
        <header
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.06 265) 0%, oklch(0.28 0.08 230) 50%, oklch(0.24 0.07 248) 100%)",
          }}
        >
          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.7 0.1 220 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.1 220 / 0.3) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:py-16 text-center">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase"
              style={{
                background: "oklch(1 0 0 / 0.1)",
                color: "oklch(0.85 0.05 220)",
                border: "1px solid oklch(1 0 0 / 0.15)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "oklch(0.72 0.16 160)" }}
              />
              AI-Powered Writing Assistant
            </div>
            <h1
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3"
              style={{ color: "oklch(0.97 0.008 240)" }}
            >
              Grammar<span style={{ color: "oklch(0.72 0.18 200)" }}>Fix</span>
            </h1>
            <p
              className="text-base sm:text-lg max-w-xl mx-auto"
              style={{ color: "oklch(0.78 0.03 240)" }}
            >
              Paste your text and fix spelling &amp; grammar instantly
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
          <GrammarChecker />
        </main>

        <footer className="text-center py-8 mt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}. Built with{" "}
            <span className="text-destructive">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline underline-offset-2 hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
