"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface AnalyticsRecord {
  postId: string;
  platform: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  saves: number;
}

interface ScheduledPost {
  postId: string;
  platform: string;
  caption?: string;
  headline?: string;
  scheduledAt?: string;
  status?: string;
}

interface KeyInsight {
  insight: string;
  evidencePostIds: string[];
  metrics: Record<string, number | string>;
}

interface PlatformInsight {
  platform: string;
  insight: string;
  evidencePostIds: string[];
}

interface NextBrief {
  direction: string;
  objective: string;
  creativeDirection: string;
  platformFocus: string[];
  suggestedHook: string;
}

interface WeeklyReport {
  summary: string;
  keyInsights: KeyInsight[];
  platformInsights: PlatformInsight[];
  recommendations: string[];
  nextBrief: NextBrief;
}

/*
 * Gemini can occasionally return a field such as:
 *
 * platformFocus: "Instagram, YouTube"
 *
 * instead of:
 *
 * platformFocus: ["Instagram", "YouTube"]
 *
 * Normalize both formats before the UI uses the data.
 */
function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeNextBrief(value: unknown): NextBrief {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    direction: typeof source.direction === "string" ? source.direction : "",

    objective: typeof source.objective === "string" ? source.objective : "",

    creativeDirection:
      typeof source.creativeDirection === "string"
        ? source.creativeDirection
        : "",

    platformFocus: normalizeStringArray(source.platformFocus),

    suggestedHook:
      typeof source.suggestedHook === "string" ? source.suggestedHook : "",
  };
}

function normalizeReport(value: unknown): WeeklyReport | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;

  const keyInsights = Array.isArray(source.keyInsights)
    ? source.keyInsights.map((item) => {
        const insight =
          item && typeof item === "object"
            ? (item as Record<string, unknown>)
            : {};

        const metrics =
          insight.metrics && typeof insight.metrics === "object"
            ? (insight.metrics as Record<string, number | string>)
            : {};

        return {
          insight: typeof insight.insight === "string" ? insight.insight : "",

          evidencePostIds: normalizeStringArray(insight.evidencePostIds),

          metrics,
        };
      })
    : [];

  const platformInsights = Array.isArray(source.platformInsights)
    ? source.platformInsights.map((item) => {
        const insight =
          item && typeof item === "object"
            ? (item as Record<string, unknown>)
            : {};

        return {
          platform:
            typeof insight.platform === "string" ? insight.platform : "",

          insight: typeof insight.insight === "string" ? insight.insight : "",

          evidencePostIds: normalizeStringArray(insight.evidencePostIds),
        };
      })
    : [];

  const recommendations = Array.isArray(source.recommendations)
    ? source.recommendations.map((item) => String(item).trim()).filter(Boolean)
    : typeof source.recommendations === "string"
      ? [source.recommendations]
      : [];

  return {
    summary: typeof source.summary === "string" ? source.summary : "",

    keyInsights,

    platformInsights,

    recommendations,

    nextBrief: normalizeNextBrief(source.nextBrief),
  };
}

export default function ReportPage() {
  const router = useRouter();

  const [report, setReport] = useState<WeeklyReport | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const storedReport = localStorage.getItem("hoichoi-weekly-report");

    if (!storedReport) {
      return;
    }

    try {
      const parsed = JSON.parse(storedReport);

      const normalized = normalizeReport(parsed);

      if (!normalized) {
        localStorage.removeItem("hoichoi-weekly-report");
        return;
      }

      /*
       * Rewrite old/inconsistent report data using the
       * normalized structure.
       */
      localStorage.setItem("hoichoi-weekly-report", JSON.stringify(normalized));

      setReport(normalized);
    } catch {
      localStorage.removeItem("hoichoi-weekly-report");
    }
  }, []);

  async function generateReport() {
    setLoading(true);
    setError("");

    try {
      const analyticsRaw = localStorage.getItem("hoichoi-analytics");

      const postsRaw = localStorage.getItem("hoichoi-scheduled-posts");

      const analytics: AnalyticsRecord[] = analyticsRaw
        ? JSON.parse(analyticsRaw)
        : [];

      const posts: ScheduledPost[] = postsRaw ? JSON.parse(postsRaw) : [];

      if (analytics.length === 0 || posts.length === 0) {
        throw new Error(
          "Generate analytics and publish at least one post before creating the AI report.",
        );
      }

      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analytics,
          posts,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to generate the AI report.");
      }

      if (!data?.report) {
        throw new Error("The AI returned an invalid report.");
      }

      const normalizedReport = normalizeReport(data.report);

      if (!normalizedReport) {
        throw new Error("The AI returned an invalid report structure.");
      }

      setReport(normalizedReport);

      localStorage.setItem(
        "hoichoi-weekly-report",
        JSON.stringify(normalizedReport),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate the AI report.",
      );
    } finally {
      setLoading(false);
    }
  }

  function useForNextBrief() {
    if (!report?.nextBrief) {
      setError("No next campaign direction is available yet.");
      return;
    }

    const normalizedNextBrief = normalizeNextBrief(report.nextBrief);

    localStorage.setItem(
      "hoichoi-next-brief-insights",
      JSON.stringify(normalizedNextBrief),
    );

    localStorage.setItem(
      "hoichoi-report-feedback-source",
      JSON.stringify({
        usedAt: new Date().toISOString(),
        report,
      }),
    );

    router.push("/create?from=report");
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-zinc-950">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Header */}
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
                AI Content Intelligence
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Weekly AI Report
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
                Turn campaign performance into evidence-backed insights and a
                direction for your next campaign.
              </p>
            </div>

            <button
              type="button"
              onClick={generateReport}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : report ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Regenerate report
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate AI report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!report && !loading && (
          <section className="rounded-3xl border bg-white p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white">
              <FileText className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No AI report generated yet
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">
              Generate analytics first, then let the AI analyze your campaign
              performance and create the next campaign direction.
            </p>

            <button
              type="button"
              onClick={generateReport}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Generate AI report
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        )}

        {loading && (
          <section className="rounded-3xl border bg-white p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />

            <p className="mt-4 text-sm font-medium">
              AI is analyzing your campaign...
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Comparing platforms, validating evidence and preparing the next
              campaign direction.
            </p>
          </section>
        )}

        {report && !loading && (
          <div className="space-y-6">
            {/* Summary */}
            <section className="rounded-3xl bg-zinc-950 p-7 text-white sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Lightbulb className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Executive summary
                  </p>

                  <p className="mt-2 text-base leading-7 text-zinc-200">
                    {report.summary}
                  </p>
                </div>
              </div>
            </section>

            {/* Key insights */}
            <section className="rounded-3xl border bg-white p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                  <BarChart3 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Key performance insights
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Every factual performance claim is tied to post evidence.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {report.keyInsights.map((item, index) => (
                  <div
                    key={`${item.insight}-${index}`}
                    className="rounded-2xl border bg-zinc-50 p-5"
                  >
                    <p className="text-sm leading-6 text-zinc-700">
                      {item.insight}
                    </p>

                    {item.evidencePostIds.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                          Evidence
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {item.evidencePostIds.map((postId) => (
                            <span
                              key={postId}
                              className="rounded-lg border bg-white px-2.5 py-1 text-xs font-mono text-zinc-600"
                            >
                              {postId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Platform insights */}
            <section className="rounded-3xl border bg-white p-6 sm:p-8">
              <h2 className="text-lg font-semibold">Cross-platform insights</h2>

              <p className="mt-1 text-sm text-zinc-500">
                Like-for-like observations across publishing channels.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {report.platformInsights.map((item, index) => (
                  <div
                    key={`${item.platform}-${index}`}
                    className="rounded-2xl border p-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      {item.platform}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-zinc-700">
                      {item.insight}
                    </p>

                    {item.evidencePostIds.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.evidencePostIds.map((postId) => (
                          <span
                            key={postId}
                            className="rounded-lg bg-zinc-100 px-2 py-1 text-[11px] font-mono text-zinc-600"
                          >
                            {postId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Recommendations */}
            <section className="rounded-3xl border bg-white p-6 sm:p-8">
              <h2 className="text-lg font-semibold">Recommendations</h2>

              <div className="mt-5 space-y-3">
                {report.recommendations.map((recommendation, index) => (
                  <div
                    key={`${recommendation}-${index}`}
                    className="flex gap-3 rounded-2xl border bg-zinc-50 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                    <p className="text-sm leading-6 text-zinc-700">
                      {recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Next brief */}
            <section className="overflow-hidden rounded-3xl border bg-white">
              <div className="bg-zinc-950 p-7 text-white sm:p-8">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Feedback loop
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight">
                    Next campaign direction
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    Use the performance evidence above to seed your next
                    campaign brief.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
                <ReportField
                  label="Direction"
                  value={report.nextBrief.direction}
                />

                <ReportField
                  label="Objective"
                  value={report.nextBrief.objective}
                />

                <ReportField
                  label="Creative direction"
                  value={report.nextBrief.creativeDirection}
                />

                <ReportField
                  label="Suggested hook"
                  value={report.nextBrief.suggestedHook}
                />

                <ReportField
                  label="Platform focus"
                  value={
                    report.nextBrief.platformFocus.length > 0
                      ? report.nextBrief.platformFocus.join(", ")
                      : "Not specified"
                  }
                />
              </div>

              <div className="border-t p-6 sm:p-8">
                <button
                  type="button"
                  onClick={useForNextBrief}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:w-auto"
                >
                  <Sparkles className="h-4 w-4" />
                  Use for next brief
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function ReportField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-zinc-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-zinc-700">
        {value || "Not specified"}
      </p>
    </div>
  );
}
