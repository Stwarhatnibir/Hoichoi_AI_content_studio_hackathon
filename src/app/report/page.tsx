"use client";

import { useEffect, useMemo, useState } from "react";
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

type Campaign = {
  campaignId: string;
  title: string;
  brief?: string;
  language?: string;
  contentType?: string;
  platforms?: string[];
  createdAt?: string;
};

type AnalyticsRecord = {
  postId: string;
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
  campaignId?: string;
};

type ScheduledPost = {
  id: string;
  campaignId?: string;
  campaignTitle?: string;
  platform: string;
  headline: string;
  scheduledAt: string;
  status: "scheduled" | "published";
  createdAt: string;
};

type KeyInsight = {
  insight: string;
  evidencePostIds: string[];
  metrics: Record<string, number | string>;
};

type PlatformInsight = {
  platform: string;
  insight: string;
  evidencePostIds: string[];
};

type NextBrief = {
  direction: string;
  objective: string;
  creativeDirection: string;
  platformFocus: string[];
  suggestedHook: string;
};

type WeeklyReport = {
  campaignId: string;
  campaignTitle: string;
  generatedAt: string;
  summary: string;
  keyInsights: KeyInsight[];
  platformInsights: PlatformInsight[];
  recommendations: string[];
  nextBrief: NextBrief;
};

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

function normalizeReport(
  value: unknown,
  fallbackCampaign?: Campaign,
): WeeklyReport | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;

  const campaignId =
    typeof source.campaignId === "string"
      ? source.campaignId
      : (fallbackCampaign?.campaignId ?? "");

  if (!campaignId) {
    return null;
  }

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
    campaignId,
    campaignTitle:
      typeof source.campaignTitle === "string"
        ? source.campaignTitle
        : (fallbackCampaign?.title ?? "Campaign"),
    generatedAt:
      typeof source.generatedAt === "string"
        ? source.generatedAt
        : new Date().toISOString(),
    summary: typeof source.summary === "string" ? source.summary : "",
    keyInsights,
    platformInsights,
    recommendations,
    nextBrief: normalizeNextBrief(source.nextBrief),
  };
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function ReportPage() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [report, setReport] = useState<WeeklyReport | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function loadCampaignWorkspace() {
    const currentBrief = readJson<Campaign | null>(
      "hoichoi-content-brief",
      null,
    );

    const storedCampaigns = readJson<Campaign[]>("hoichoi-campaigns", []);

    const postHistory = readJson<ScheduledPost[]>(
      "hoichoi-scheduled-posts",
      [],
    );

    const campaignMap = new Map<string, Campaign>();

    for (const campaign of storedCampaigns) {
      if (campaign?.campaignId) {
        campaignMap.set(campaign.campaignId, campaign);
      }
    }

    if (currentBrief?.campaignId) {
      campaignMap.set(currentBrief.campaignId, currentBrief);
    }

    for (const post of postHistory) {
      if (!post.campaignId) continue;

      if (!campaignMap.has(post.campaignId)) {
        campaignMap.set(post.campaignId, {
          campaignId: post.campaignId,
          title: post.campaignTitle || "Untitled Campaign",
        });
      }
    }

    const allCampaigns = Array.from(campaignMap.values()).sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    setCampaigns(allCampaigns);

    const storedReports = readJson<unknown[]>("hoichoi-weekly-reports", []);

    const normalizedReports = storedReports
      .map((item) => normalizeReport(item))
      .filter((item): item is WeeklyReport => Boolean(item));

    /*
     * Backward compatibility:
     * Older versions stored only one report under hoichoi-weekly-report.
     * Preserve it by migrating it into the campaign report archive.
     */
    const legacyReportRaw = localStorage.getItem("hoichoi-weekly-report");

    if (legacyReportRaw) {
      try {
        const parsedLegacy = JSON.parse(legacyReportRaw);

        const legacyCampaignId =
          typeof parsedLegacy?.campaignId === "string"
            ? parsedLegacy.campaignId
            : currentBrief?.campaignId;

        const fallbackCampaign =
          allCampaigns.find(
            (campaign) => campaign.campaignId === legacyCampaignId,
          ) ??
          currentBrief ??
          undefined;

        const legacyReport = normalizeReport(parsedLegacy, fallbackCampaign);

        if (legacyReport) {
          const exists = normalizedReports.some(
            (item) => item.campaignId === legacyReport.campaignId,
          );

          if (!exists) {
            normalizedReports.push(legacyReport);
          }
        }
      } catch {
        // Ignore malformed legacy data.
      }
    }

    setReports(normalizedReports);

    const preferredId =
      selectedCampaignId &&
      allCampaigns.some(
        (campaign) => campaign.campaignId === selectedCampaignId,
      )
        ? selectedCampaignId
        : currentBrief?.campaignId &&
            allCampaigns.some(
              (campaign) => campaign.campaignId === currentBrief.campaignId,
            )
          ? currentBrief.campaignId
          : (allCampaigns[0]?.campaignId ?? "");

    setSelectedCampaignId(preferredId);

    const selectedReport =
      normalizedReports.find((item) => item.campaignId === preferredId) ?? null;

    setReport(selectedReport);

    localStorage.setItem(
      "hoichoi-weekly-reports",
      JSON.stringify(normalizedReports),
    );
  }

  useEffect(() => {
    loadCampaignWorkspace();

    const handleStorage = () => loadCampaignWorkspace();
    const handleCampaignChanged = () => loadCampaignWorkspace();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("hoichoi-campaign-changed", handleCampaignChanged);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "hoichoi-campaign-changed",
        handleCampaignChanged,
      );
    };
    // The report page intentionally reloads workspace data only on mount
    // and campaign/storage events.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCampaign = useMemo(
    () =>
      campaigns.find(
        (campaign) => campaign.campaignId === selectedCampaignId,
      ) ?? null,
    [campaigns, selectedCampaignId],
  );

  const selectedReport = useMemo(
    () =>
      reports.find((item) => item.campaignId === selectedCampaignId) ?? null,
    [reports, selectedCampaignId],
  );

  useEffect(() => {
    setReport(selectedReport);
  }, [selectedReport]);

  function handleCampaignChange(campaignId: string) {
    setSelectedCampaignId(campaignId);
    setError("");

    const nextReport =
      reports.find((item) => item.campaignId === campaignId) ?? null;

    setReport(nextReport);
  }

  async function generateReport() {
    if (!selectedCampaign) {
      setError("Select a campaign before generating an AI report.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const allPosts = readJson<ScheduledPost[]>("hoichoi-scheduled-posts", []);

      const allAnalytics = readJson<AnalyticsRecord[]>("hoichoi-analytics", []);

      /*
       * Campaign isolation is based on campaignId first.
       * For legacy posts that pre-date campaignId, campaignTitle is
       * used only when it exactly matches the selected campaign title.
       */
      const campaignPosts = allPosts.filter(
        (post) =>
          post.campaignId === selectedCampaign.campaignId ||
          (!post.campaignId && post.campaignTitle === selectedCampaign.title),
      );

      const campaignPostIds = new Set(campaignPosts.map((post) => post.id));

      const campaignAnalytics = allAnalytics.filter(
        (item) =>
          item.campaignId === selectedCampaign.campaignId ||
          campaignPostIds.has(item.postId),
      );

      if (campaignPosts.length === 0) {
        throw new Error(
          "This campaign has no scheduled or published posts yet.",
        );
      }

      if (campaignAnalytics.length === 0) {
        throw new Error(
          "This campaign has no analytics yet. Generate analytics before creating its AI report.",
        );
      }

      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: selectedCampaign.campaignId,
          campaignTitle: selectedCampaign.title,
          analytics: campaignAnalytics,
          posts: campaignPosts,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to generate the AI report.");
      }

      const normalized = normalizeReport(
        data?.report ?? data,
        selectedCampaign,
      );

      if (!normalized) {
        throw new Error("The AI returned an invalid report structure.");
      }

      const nextReports = [
        ...reports.filter(
          (item) => item.campaignId !== selectedCampaign.campaignId,
        ),
        normalized,
      ];

      localStorage.setItem(
        "hoichoi-weekly-reports",
        JSON.stringify(nextReports),
      );

      // Keep the old key synchronized for compatibility with existing UI.
      localStorage.setItem("hoichoi-weekly-report", JSON.stringify(normalized));

      setReports(nextReports);
      setReport(normalized);
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
        campaignId: report.campaignId,
        campaignTitle: report.campaignTitle,
        report,
      }),
    );

    router.push("/create?from=report");
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-zinc-950">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-zinc-600">
              <Sparkles className="h-3.5 w-3.5" />
              AI Content Intelligence
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Campaign AI Reports
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
              Select any campaign to view its existing report or generate a
              fresh evidence-backed report from that campaign&apos;s own posts
              and analytics.
            </p>
          </div>

          <button
            type="button"
            onClick={generateReport}
            disabled={loading || !selectedCampaign}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : report ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Regenerate selected report
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate selected report
              </>
            )}
          </button>
        </div>

        <section className="mb-6 rounded-3xl border bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label
                htmlFor="campaign-report-selector"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                Select campaign
              </label>

              <select
                id="campaign-report-selector"
                value={selectedCampaignId}
                onChange={(event) => handleCampaignChange(event.target.value)}
                className="h-12 w-full rounded-xl border bg-white px-4 text-sm font-medium outline-none focus:border-zinc-950"
              >
                {campaigns.length === 0 ? (
                  <option value="">No campaigns found</option>
                ) : (
                  campaigns.map((campaign) => {
                    const hasReport = reports.some(
                      (item) => item.campaignId === campaign.campaignId,
                    );

                    return (
                      <option
                        key={campaign.campaignId}
                        value={campaign.campaignId}
                      >
                        {campaign.title} {hasReport ? "— Report available" : ""}
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            {selectedCampaign && (
              <div className="rounded-xl border bg-zinc-50 px-4 py-3 text-sm">
                <p className="font-semibold">{selectedCampaign.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {selectedCampaign.contentType || "Campaign"} ·{" "}
                  {selectedCampaign.language || "Language not specified"}
                </p>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!selectedCampaign && (
          <section className="rounded-3xl border bg-white p-10 text-center">
            <FileText className="mx-auto h-8 w-8" />
            <h2 className="mt-4 text-xl font-semibold">No campaign found</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Create a campaign first, then its report will remain available
              independently from future campaigns.
            </p>
          </section>
        )}

        {selectedCampaign && !report && !loading && (
          <section className="rounded-3xl border bg-white p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-white">
              <FileText className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No report saved for this campaign
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">
              This does not affect other campaigns. Generate a report using only{" "}
              {selectedCampaign.title}&apos;s posts and analytics.
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
              AI is analyzing {selectedCampaign?.title}...
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Only this campaign&apos;s posts and analytics are being supplied
              to the report generator.
            </p>
          </section>
        )}

        {report && !loading && (
          <div className="space-y-6">
            <section className="rounded-3xl border bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Selected campaign
                  </p>
                  <h2 className="mt-1 text-xl font-bold">
                    {report.campaignTitle}
                  </h2>
                </div>

                <span className="rounded-full border bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600">
                  Report generated{" "}
                  {new Date(report.generatedAt).toLocaleString("en-IN")}
                </span>
              </div>
            </section>

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
                    Factual claims are tied to campaign post evidence.
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
                Like-for-like observations within this campaign.
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
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Feedback loop
                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  Next campaign direction
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                  Use this campaign&apos;s performance evidence to seed a future
                  campaign brief.
                </p>
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
                  Use this report for next brief
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
