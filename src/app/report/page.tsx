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

interface ContentBrief {
  campaignId?: string;
  title: string;
  brief: string;
  language: string;
  objective: string;
  platforms: string[];
}

interface AnalyticsRecord {
  postId: string;
  campaignId?: string;
  platform: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  saves: number;
  engagementRate?: number;
  clickThroughRate?: number;
  updatedAt?: string;
}

interface ScheduledPost {
  id: string;
  campaignId?: string;
  campaignTitle: string;
  platform: string;
  headline: string;
  scheduledAt: string;
  status: string;
  createdAt?: string;
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
  campaignId?: string;
  summary: string;
  keyInsights: KeyInsight[];
  platformInsights: PlatformInsight[];
  recommendations: string[];
  nextBrief: NextBrief;
}

function generateCampaignId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `campaign-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

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

function normalizeMetrics(value: unknown): Record<string, number | string> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const source = value as Record<string, unknown>;

    return Object.fromEntries(
      Object.entries(source).filter(
        ([, item]) => typeof item === "number" || typeof item === "string",
      ),
    ) as Record<string, number | string>;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return normalizeMetrics(parsed);
      }
    } catch {
      return {};
    }
  }

  return {};
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

function normalizeReport(
  value: unknown,
  campaignId?: string,
): WeeklyReport | null {
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

        return {
          insight: typeof insight.insight === "string" ? insight.insight : "",

          evidencePostIds: normalizeStringArray(insight.evidencePostIds),

          metrics: normalizeMetrics(insight.metrics),
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
    campaignId:
      typeof source.campaignId === "string" ? source.campaignId : campaignId,

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

  const [campaignTitle, setCampaignTitle] = useState("");

  const [campaignId, setCampaignId] = useState("");

  const [loading, setLoading] = useState(false);

  const [initializing, setInitializing] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const briefRaw = localStorage.getItem("hoichoi-content-brief");

      if (!briefRaw) {
        setInitializing(false);
        return;
      }

      let brief = JSON.parse(briefRaw) as ContentBrief;

      let currentCampaignId = brief.campaignId;

      if (!currentCampaignId) {
        currentCampaignId = generateCampaignId();

        brief = {
          ...brief,
          campaignId: currentCampaignId,
        };

        localStorage.setItem("hoichoi-content-brief", JSON.stringify(brief));
      }

      setCampaignId(currentCampaignId);

      setCampaignTitle(brief.title);

      /*
       * Defensive migration for legacy posts.
       */
      const postsRaw = localStorage.getItem("hoichoi-scheduled-posts");

      let posts: ScheduledPost[] = [];

      if (postsRaw) {
        try {
          const parsed = JSON.parse(postsRaw);

          if (Array.isArray(parsed)) {
            posts = parsed;
          }
        } catch {
          posts = [];
        }
      }

      let postsChanged = false;

      const migratedPosts = posts.map((post) => {
        if (!post.campaignId && post.campaignTitle === brief.title) {
          postsChanged = true;

          return {
            ...post,
            campaignId: currentCampaignId,
          };
        }

        return post;
      });

      if (postsChanged) {
        localStorage.setItem(
          "hoichoi-scheduled-posts",
          JSON.stringify(migratedPosts),
        );
      }

      /*
       * Only use a previously stored report if it belongs to
       * the currently selected campaign.
       */
      const storedReport = localStorage.getItem("hoichoi-weekly-report");

      if (storedReport) {
        try {
          const parsed = JSON.parse(storedReport);

          if (parsed?.campaignId && parsed.campaignId === currentCampaignId) {
            const normalized = normalizeReport(parsed, currentCampaignId);

            if (normalized) {
              localStorage.setItem(
                "hoichoi-weekly-report",
                JSON.stringify(normalized),
              );

              setReport(normalized);
            }
          } else {
            /*
             * Old reports without campaignId are deliberately ignored.
             * They may belong to another campaign.
             */
            localStorage.removeItem("hoichoi-weekly-report");
          }
        } catch {
          localStorage.removeItem("hoichoi-weekly-report");
        }
      }
    } catch {
      setError("Unable to load the current campaign.");
    } finally {
      setInitializing(false);
    }
  }, []);

  async function generateReport() {
    setLoading(true);
    setError("");

    try {
      const briefRaw = localStorage.getItem("hoichoi-content-brief");

      if (!briefRaw) {
        throw new Error(
          "No active campaign was found. Create a campaign first.",
        );
      }

      const brief = JSON.parse(briefRaw) as ContentBrief;

      const currentCampaignId = brief.campaignId;

      if (!currentCampaignId) {
        throw new Error("The current campaign does not have a campaign ID.");
      }

      const analyticsRaw = localStorage.getItem("hoichoi-analytics");

      const postsRaw = localStorage.getItem("hoichoi-scheduled-posts");

      const allAnalytics: AnalyticsRecord[] = analyticsRaw
        ? JSON.parse(analyticsRaw)
        : [];

      const allPosts: ScheduledPost[] = postsRaw ? JSON.parse(postsRaw) : [];

      /*
       * Match legacy posts by campaign title if campaignId
       * was not present when they were created.
       */
      const migratedPosts = allPosts.map((post) => {
        if (!post.campaignId && post.campaignTitle === brief.title) {
          return {
            ...post,
            campaignId: currentCampaignId,
          };
        }

        return post;
      });

      localStorage.setItem(
        "hoichoi-scheduled-posts",
        JSON.stringify(migratedPosts),
      );

      const currentPosts = migratedPosts.filter(
        (post) => post.campaignId === currentCampaignId,
      );

      const currentPostIds = new Set(currentPosts.map((post) => post.id));

      const currentAnalytics = allAnalytics
        .map((item) => {
          const matchingPost = migratedPosts.find(
            (post) => post.id === item.postId,
          );

          if (!item.campaignId && matchingPost?.campaignId) {
            return {
              ...item,
              campaignId: matchingPost.campaignId,
            };
          }

          return item;
        })
        .filter(
          (item) =>
            item.campaignId === currentCampaignId &&
            currentPostIds.has(item.postId),
        );

      if (currentAnalytics.length === 0 || currentPosts.length === 0) {
        throw new Error(
          "Publish at least one post for this campaign and generate its analytics before creating the AI report.",
        );
      }

      const response = await fetch("/api/report", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          campaignId: currentCampaignId,
          analytics: currentAnalytics,
          posts: currentPosts,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to generate the AI report.");
      }

      if (!data?.report) {
        throw new Error("The AI returned an invalid report.");
      }

      const normalizedReport = normalizeReport(data.report, currentCampaignId);

      if (!normalizedReport) {
        throw new Error("The AI returned an invalid report structure.");
      }

      const finalReport: WeeklyReport = {
        ...normalizedReport,
        campaignId: currentCampaignId,
      };

      setReport(finalReport);

      localStorage.setItem(
        "hoichoi-weekly-report",
        JSON.stringify(finalReport),
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
        campaignId,
        report,
      }),
    );

    router.push("/create?from=report");
  }

  if (initializing) {
    return (
      <main className="min-h-screen bg-[#f7f7f8] text-zinc-950">
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-zinc-950">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
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

              {campaignTitle && (
                <div className="mt-4 inline-flex items-center rounded-lg border bg-white px-3 py-2 text-xs font-medium text-zinc-600">
                  Campaign: {campaignTitle}
                </div>
              )}
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

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!report && !loading && (
          <section className="rounded-3xl border bg-white p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white">
              <FileText className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No AI report generated yet
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">
              Generate analytics first, then let the AI analyze this
              campaign&apos;s performance and create the next campaign
              direction.
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
