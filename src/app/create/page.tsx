"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  FileText,
  Lightbulb,
  Sparkles,
} from "lucide-react";

type Language = "Bengali" | "English" | "Hindi" | "Mixed";

type ContentType =
  | "Campaign"
  | "Announcement"
  | "Show Promotion"
  | "Social Campaign";

type Platform = "Instagram" | "YouTube" | "Facebook";

interface NextBrief {
  direction?: string;
  objective?: string;
  creativeDirection?: string;
  platformFocus?: string[];
  suggestedHook?: string;
}

const platforms: Platform[] = ["Instagram", "YouTube", "Facebook"];

const languages: Language[] = ["Bengali", "English", "Hindi", "Mixed"];

const contentTypes: ContentType[] = [
  "Campaign",
  "Announcement",
  "Show Promotion",
  "Social Campaign",
];

function isNextBrief(value: unknown): value is NextBrief {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.direction === "string" ||
    typeof candidate.objective === "string" ||
    typeof candidate.creativeDirection === "string" ||
    typeof candidate.suggestedHook === "string" ||
    Array.isArray(candidate.platformFocus)
  );
}

function extractNextBrief(raw: string): NextBrief | null {
  try {
    const parsed = JSON.parse(raw);

    /*
     * Current format:
     * {
     *   direction,
     *   objective,
     *   creativeDirection,
     *   platformFocus,
     *   suggestedHook
     * }
     */
    if (isNextBrief(parsed)) {
      return parsed;
    }

    /*
     * Backward-compatible format:
     * {
     *   nextBrief: {
     *     direction,
     *     ...
     *   }
     * }
     */
    if (parsed && isNextBrief(parsed.nextBrief)) {
      return parsed.nextBrief;
    }

    return null;
  } catch {
    return null;
  }
}

export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [language, setLanguage] = useState<Language>("Bengali");
  const [contentType, setContentType] = useState<ContentType>("Campaign");

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "Instagram",
    "YouTube",
    "Facebook",
  ]);

  const [fromReport, setFromReport] = useState(false);
  const [reportInsights, setReportInsights] = useState<NextBrief | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("from") !== "report") {
      return;
    }

    setFromReport(true);

    const raw = localStorage.getItem("hoichoi-next-brief-insights");

    if (!raw) {
      setError(
        'The AI report direction was not found. Return to the report and click "Use for next brief" again.',
      );
      return;
    }

    const nextBrief = extractNextBrief(raw);

    if (!nextBrief) {
      setError(
        'The saved AI report direction is invalid. Return to the report and click "Use for next brief" again.',
      );
      return;
    }

    setReportInsights(nextBrief);

    const direction = nextBrief.direction?.trim() || "";

    const objective = nextBrief.objective?.trim() || "";

    const creativeDirection = nextBrief.creativeDirection?.trim() || "";

    const suggestedHook = nextBrief.suggestedHook?.trim() || "";

    /*
     * Create a useful campaign title rather than simply
     * copying the previous campaign title.
     */
    const generatedTitle =
      suggestedHook || direction || "AI Guided Next Campaign";

    const generatedBrief = [
      direction ? `Campaign direction: ${direction}` : "",
      objective ? `Objective: ${objective}` : "",
      creativeDirection ? `Creative direction: ${creativeDirection}` : "",
      suggestedHook ? `Suggested hook: ${suggestedHook}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    setTitle(generatedTitle);
    setBrief(generatedBrief);

    if (
      Array.isArray(nextBrief.platformFocus) &&
      nextBrief.platformFocus.length > 0
    ) {
      const validPlatforms = nextBrief.platformFocus.filter(
        (platform): platform is Platform =>
          platforms.includes(platform as Platform),
      );

      if (validPlatforms.length > 0) {
        setSelectedPlatforms(validPlatforms);
      }
    }
  }, [searchParams]);

  function togglePlatform(platform: Platform) {
    setSelectedPlatforms((current) => {
      if (current.includes(platform)) {
        return current.filter((item) => item !== platform);
      }

      return [...current, platform];
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const cleanTitle = title.trim();
    const cleanBrief = brief.trim();

    if (!cleanTitle) {
      setError("Please enter a campaign title.");
      return;
    }

    if (!cleanBrief) {
      setError("Please enter a campaign brief.");
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError("Select at least one publishing platform.");
      return;
    }

    const campaignBrief = {
      title: cleanTitle,
      brief: cleanBrief,
      language,
      contentType,
      platforms: selectedPlatforms,
      createdAt: new Date().toISOString(),
      source: fromReport ? "ai-report" : "manual",
    };

    localStorage.setItem(
      "hoichoi-content-brief",
      JSON.stringify(campaignBrief),
    );

    /*
     * Invalidate previous campaign output.
     */
    localStorage.removeItem("hoichoi-generated-contents");

    localStorage.removeItem("hoichoi-generated-visuals");

    localStorage.removeItem("hoichoi-generated-for-brief");

    localStorage.removeItem("hoichoi-content-approved");

    localStorage.removeItem("hoichoi-content-approved-at");

    /*
     * Keep the report direction available for audit/demo
     * purposes, but record that it was consumed.
     */
    if (fromReport) {
      localStorage.setItem(
        "hoichoi-report-feedback-consumed-at",
        new Date().toISOString(),
      );
    }

    router.push("/studio");
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-zinc-950">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-zinc-600">
                <Sparkles className="h-3.5 w-3.5" />
                AI Content Studio
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Create a campaign
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
                Start with a campaign brief and let the AI Studio transform it
                into platform-specific content.
              </p>
            </div>

            <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white sm:flex">
              <BrainCircuit className="h-6 w-6" />
            </div>
          </div>
        </div>

        {fromReport && reportInsights && (
          <section className="mb-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
            <div className="border-b bg-zinc-950 px-6 py-5 text-white">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Lightbulb className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    AI Report insights applied
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    This campaign was pre-filled using the performance direction
                    from your previous campaign.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {reportInsights.direction && (
                <InsightCard
                  label="Direction"
                  value={reportInsights.direction}
                />
              )}

              {reportInsights.objective && (
                <InsightCard
                  label="Objective"
                  value={reportInsights.objective}
                />
              )}

              {reportInsights.creativeDirection && (
                <InsightCard
                  label="Creative direction"
                  value={reportInsights.creativeDirection}
                />
              )}

              {reportInsights.suggestedHook && (
                <InsightCard
                  label="Suggested hook"
                  value={reportInsights.suggestedHook}
                />
              )}
            </div>
          </section>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <section className="rounded-3xl border bg-white p-6 sm:p-8">
              <div className="mb-7">
                <h2 className="text-lg font-semibold">Campaign brief</h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Give the AI enough context to create original platform-native
                  content.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Campaign title
                  </label>

                  <input
                    id="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. New Bengali drama launch"
                    className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="brief"
                    className="mb-2 block text-sm font-semibold"
                  >
                    What should the campaign communicate?
                  </label>

                  <textarea
                    id="brief"
                    value={brief}
                    onChange={(event) => setBrief(event.target.value)}
                    placeholder="Describe the show, campaign idea, audience, emotional direction or marketing objective..."
                    rows={8}
                    className="w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
                  />

                  <p className="mt-2 text-xs text-zinc-400">
                    The AI can transform this into hooks, CTAs,
                    platform-specific copy and visual concepts.
                  </p>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold">
                    Generation language
                  </label>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {languages.map((item) => {
                      const active = language === item;

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setLanguage(item)}
                          className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                            active
                              ? "border-zinc-950 bg-zinc-950 text-white"
                              : "bg-white text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold">
                    Content type
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {contentTypes.map((item) => {
                      const active = contentType === item;

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setContentType(item)}
                          className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                            active
                              ? "border-zinc-950 bg-zinc-950 text-white"
                              : "bg-white text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold">
                    Publishing platforms
                  </label>

                  <div className="space-y-2">
                    {platforms.map((platform) => {
                      const selected = selectedPlatforms.includes(platform);

                      return (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => togglePlatform(platform)}
                          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                            selected
                              ? "border-zinc-950 bg-zinc-50"
                              : "bg-white hover:border-zinc-400"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium">{platform}</p>

                            <p className="mt-0.5 text-xs text-zinc-500">
                              Generate content tailored for {platform}.
                            </p>
                          </div>

                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                              selected
                                ? "border-zinc-950 bg-zinc-950 text-white"
                                : "border-zinc-300"
                            }`}
                          >
                            {selected && <Check className="h-3.5 w-3.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Continue to AI Studio
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>

            <aside className="space-y-6">
              <section className="rounded-3xl border bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                  <FileText className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                  What happens next?
                </h2>

                <div className="mt-5 space-y-4">
                  <StepItem
                    number="01"
                    title="AI generation"
                    description="Generate distinct copy and visual concepts for each selected platform."
                  />

                  <StepItem
                    number="02"
                    title="Human approval"
                    description="Review the generated campaign before anything can enter the publishing queue."
                  />

                  <StepItem
                    number="03"
                    title="Publish & measure"
                    description="Schedule the approved content and collect platform metrics."
                  />

                  <StepItem
                    number="04"
                    title="AI report"
                    description="Use performance evidence to inform your next campaign."
                  />
                </div>
              </section>

              {fromReport && (
                <section className="rounded-3xl border bg-zinc-950 p-6 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <h2 className="mt-5 text-lg font-semibold">
                    Closing the feedback loop
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    This brief was informed by your previous campaign&apos;s
                    analytics and AI report. Publishing this campaign creates
                    the next evidence set for the workflow.
                  </p>
                </section>
              )}
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-zinc-700">{value}</p>
    </div>
  );
}

function StepItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold">
        {number}
      </div>

      <div>
        <p className="text-sm font-semibold">{title}</p>

        <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
