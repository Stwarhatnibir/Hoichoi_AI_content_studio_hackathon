"use client";

import Link from "next/link";
import {
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  LayoutDashboard,
  Megaphone,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Video,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Platform = "Instagram" | "YouTube" | "Facebook";

type Campaign = {
  campaignId?: string;
  title: string;
  brief: string;
  language: string;
  contentType: string;
  platforms: Platform[];
  createdAt?: string;
};

type ScheduledPost = {
  id: string;
  campaignId?: string;
  campaignTitle?: string;
  platform: Platform;
  headline: string;
  scheduledAt: string;
  status: "scheduled" | "published";
  createdAt: string;
};

type AnalyticsRecord = {
  postId: string;
  campaignId?: string;
  platform: Platform;
  metrics?:
    | {
        impressions?: number;
        reach?: number;
        engagement?: number;
        views?: number;
        clicks?: number;
        likes?: number;
        comments?: number;
        shares?: number;
        engagementRate?: number;
      }
    | string;
};

type WeeklyReport = {
  campaignId?: string;
  generatedAt?: string;
  keyInsights?: Array<{
    insight?: string;
    evidence?: string;
    evidencePostIds?: string[];
    metrics?: Record<string, string | number>;
  }>;
  recommendations?: Array<
    | {
        recommendation?: string;
        rationale?: string;
      }
    | string
  >;
  nextBrief?: {
    direction?: string;
    objective?: string;
    creativeDirection?: string;
    suggestedHook?: string;
    platformFocus?: string[];
  };
};

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Create", href: "/create", icon: Plus },
  { label: "AI Studio", href: "/studio", icon: BrainCircuit },
  { label: "Publisher", href: "/publish", icon: Megaphone },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "AI Report", href: "/report", icon: FileText },
];

const platformMeta: Record<Platform, string> = {
  Instagram: "bg-pink-50 text-pink-700 border-pink-100",
  YouTube: "bg-red-50 text-red-700 border-red-100",
  Facebook: "bg-blue-50 text-blue-700 border-blue-100",
};

function parseMetrics(value: string) {
  try {
    return JSON.parse(value) as Record<string, number>;
  } catch {
    return {};
  }
}

function getMetrics(record: AnalyticsRecord) {
  return typeof record.metrics === "string"
    ? parseMetrics(record.metrics)
    : (record.metrics ?? {});
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0";

  return new Intl.NumberFormat("en-IN", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDateTime(value?: string) {
  if (!value) return "Unknown time";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getGeneratedState() {
  if (typeof window === "undefined") return false;

  const raw = localStorage.getItem("hoichoi-generated-contents");

  if (!raw) return false;

  if (raw === "true") return true;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length > 0 : Boolean(parsed);
  } catch {
    return Boolean(raw);
  }
}

function getApprovedState() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("hoichoi-content-approved") === "true";
}

export default function DashboardShell() {
  /*
   * IMPORTANT:
   * localStorage, Intl date formatting and client-only state must not
   * participate in the first render. Otherwise the server HTML can differ
   * from the browser HTML and trigger a React hydration mismatch.
   */
  const [mounted, setMounted] = useState(false);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsRecord[]>([]);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function loadDashboardState() {
    try {
      const briefRaw = localStorage.getItem("hoichoi-content-brief");
      const postsRaw = localStorage.getItem("hoichoi-scheduled-posts");
      const analyticsRaw = localStorage.getItem("hoichoi-analytics");

      /*
       * Prefer the campaign-aware report archive. Fall back to the legacy
       * single-report key so existing demo data continues to work.
       */
      const reportsRaw = localStorage.getItem("hoichoi-weekly-reports");
      const legacyReportRaw = localStorage.getItem("hoichoi-weekly-report");

      const parsedCampaign = briefRaw
        ? (JSON.parse(briefRaw) as Campaign)
        : null;

      const parsedPosts = postsRaw ? JSON.parse(postsRaw) : [];
      const parsedAnalytics = analyticsRaw ? JSON.parse(analyticsRaw) : [];

      let parsedReports: WeeklyReport[] = [];

      if (reportsRaw) {
        const candidate = JSON.parse(reportsRaw);
        if (Array.isArray(candidate)) {
          parsedReports = candidate;
        }
      }

      if (legacyReportRaw) {
        const legacy = JSON.parse(legacyReportRaw) as WeeklyReport;

        const alreadyPresent = parsedReports.some(
          (item) =>
            item.campaignId &&
            legacy.campaignId &&
            item.campaignId === legacy.campaignId,
        );

        if (!alreadyPresent) {
          parsedReports.push(legacy);
        }
      }

      const matchingReport = parsedCampaign?.campaignId
        ? parsedReports.find(
            (item) => item.campaignId === parsedCampaign.campaignId,
          )
        : parsedReports[0];

      setCampaign(parsedCampaign);
      setPosts(Array.isArray(parsedPosts) ? parsedPosts : []);
      setAnalytics(Array.isArray(parsedAnalytics) ? parsedAnalytics : []);
      setReport(matchingReport ?? null);
    } catch {
      setCampaign(null);
      setPosts([]);
      setAnalytics([]);
      setReport(null);
    }
  }

  useEffect(() => {
    setMounted(true);
    loadDashboardState();

    const handleStorage = () => loadDashboardState();
    const handleCampaignChanged = () => loadDashboardState();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("hoichoi-campaign-changed", handleCampaignChanged);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "hoichoi-campaign-changed",
        handleCampaignChanged,
      );
    };
  }, [refreshKey]);

  const campaignPosts = useMemo(() => {
    if (!campaign) return [];

    return posts.filter((post) =>
      campaign.campaignId
        ? post.campaignId === campaign.campaignId ||
          (!post.campaignId && post.campaignTitle === campaign.title)
        : post.campaignTitle === campaign.title,
    );
  }, [campaign, posts]);

  const campaignPostIds = useMemo(
    () => new Set(campaignPosts.map((post) => post.id)),
    [campaignPosts],
  );

  const campaignAnalytics = useMemo(() => {
    if (!campaign) return [];

    return analytics.filter((item) => {
      if (campaign.campaignId) {
        return (
          item.campaignId === campaign.campaignId &&
          campaignPostIds.has(item.postId)
        );
      }

      return campaignPostIds.has(item.postId);
    });
  }, [analytics, campaign, campaignPostIds]);

  const generated = mounted ? getGeneratedState() : false;
  const approved = mounted ? getApprovedState() : false;

  const status = useMemo(() => {
    const hasPublished = campaignPosts.some(
      (post) => post.status === "published",
    );
    const hasScheduled = campaignPosts.some(
      (post) => post.status === "scheduled",
    );
    const hasAnalytics = campaignAnalytics.length > 0;
    const hasReport =
      Boolean(report) &&
      (!campaign?.campaignId || report?.campaignId === campaign.campaignId);

    return {
      brief: Boolean(campaign),
      generated,
      approved,
      published: hasPublished,
      scheduled: hasScheduled,
      analytics: hasAnalytics,
      report: hasReport,
      hasPosts: campaignPosts.length > 0,
    };
  }, [campaign, campaignAnalytics, campaignPosts, generated, approved, report]);

  const totals = useMemo(() => {
    let reach = 0;
    let impressions = 0;
    let engagement = 0;
    let views = 0;

    for (const record of campaignAnalytics) {
      const metrics = getMetrics(record);

      reach += Number(metrics.reach ?? 0);
      impressions += Number(metrics.impressions ?? 0);
      engagement += Number(metrics.engagement ?? 0);
      views += Number(metrics.views ?? 0);
    }

    return {
      reach,
      impressions,
      engagement,
      views,
      engagementRate:
        reach > 0 ? Number(((engagement / reach) * 100).toFixed(2)) : 0,
    };
  }, [campaignAnalytics]);

  const platformRows = useMemo(() => {
    const platforms: Platform[] = ["Instagram", "YouTube", "Facebook"];

    return platforms.map((platform) => {
      const platformPosts = campaignPosts.filter(
        (post) => post.platform === platform,
      );

      const platformAnalytics = campaignAnalytics.filter(
        (item) => item.platform === platform,
      );

      let reach = 0;
      let engagement = 0;
      let views = 0;

      for (const record of platformAnalytics) {
        const metrics = getMetrics(record);
        reach += Number(metrics.reach ?? 0);
        engagement += Number(metrics.engagement ?? 0);
        views += Number(metrics.views ?? 0);
      }

      return {
        platform,
        postCount: platformPosts.length,
        published: platformPosts.filter((post) => post.status === "published")
          .length,
        scheduled: platformPosts.filter((post) => post.status === "scheduled")
          .length,
        reach,
        engagement,
        views,
      };
    });
  }, [campaignAnalytics, campaignPosts]);

  const nextAction = useMemo(() => {
    if (!campaign) {
      return {
        title: "Create your first campaign",
        description:
          "Start with a campaign brief and let the AI studio generate native content for your selected platforms.",
        href: "/create",
        action: "Create campaign",
      };
    }

    if (!status.generated) {
      return {
        title: "Generate platform content",
        description:
          "Your brief is ready. Generate platform-specific copy and visual directions in AI Studio.",
        href: "/studio",
        action: "Open AI Studio",
      };
    }

    if (!status.approved) {
      return {
        title: "Review and approve",
        description:
          "Generated content is waiting for the explicit approval gate before publishing.",
        href: "/studio",
        action: "Review content",
      };
    }

    if (!status.hasPosts) {
      return {
        title: "Publish the campaign",
        description:
          "Your approved content is ready for the mock publisher. Schedule all selected platforms from one place.",
        href: "/publish",
        action: "Open Publisher",
      };
    }

    if (!status.analytics) {
      return {
        title: "Generate campaign analytics",
        description:
          "Use Analytics to create the mock performance dataset for the published campaign.",
        href: "/analytics",
        action: "Open Analytics",
      };
    }

    if (!status.report) {
      return {
        title: "Turn performance into AI insights",
        description:
          "Generate the evidence-backed report that feeds recommendations into your next campaign brief.",
        href: "/report",
        action: "Generate AI report",
      };
    }

    return {
      title: "Create the next campaign",
      description:
        "Your report is ready. Carry its direction directly into the next campaign brief.",
      href: "/create?from=report",
      action: "Use report for next brief",
    };
  }, [campaign, status]);

  const latestActivity = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      description: string;
      date?: string;
      icon: React.ReactNode;
    }> = [];

    if (campaign) {
      items.push({
        id: "brief",
        title: "Campaign brief created",
        description: campaign.title,
        date: campaign.createdAt,
        icon: <Target className="h-4 w-4" />,
      });
    }

    campaignPosts
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3)
      .forEach((post) => {
        items.push({
          id: post.id,
          title:
            post.status === "published"
              ? `${post.platform} post published`
              : `${post.platform} post scheduled`,
          description: post.headline,
          date: post.createdAt,
          icon:
            post.status === "published" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Clock3 className="h-4 w-4" />
            ),
        });
      });

    /*
     * Do not use new Date().toISOString() during render.
     * That creates different HTML on the server and client.
     */
    if (status.report && report) {
      items.push({
        id: "report",
        title: "AI report generated",
        description:
          report.keyInsights?.[0]?.insight ??
          "Campaign performance has been converted into AI insights.",
        date: report.generatedAt,
        icon: <Sparkles className="h-4 w-4" />,
      });
    }

    return items
      .sort(
        (a, b) =>
          new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
      )
      .slice(0, 5);
  }, [campaign, campaignPosts, report, status.report]);

  const insightPreview = report?.keyInsights?.[0];

  const recommendationPreview = report?.recommendations?.[0];

  const recommendationText =
    typeof recommendationPreview === "string"
      ? recommendationPreview
      : recommendationPreview?.recommendation;

  /*
   * Server and the first browser render are intentionally identical.
   * The real localStorage-backed dashboard is mounted immediately after.
   */
  if (!mounted) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#18181b]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">Hoichoi AI</p>
                <p className="text-xs text-zinc-500">Content Studio</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition group-hover:opacity-100" />
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <div className="rounded-2xl bg-zinc-950 p-4 text-white">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold">AI Content Engine</p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Create, publish, analyze and learn from every campaign.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between border-b bg-white px-5 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold">Hoichoi AI</span>
            </Link>

            <Link
              href="/report"
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium"
            >
              <FileText className="h-4 w-4" />
              Report
            </Link>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-5 rounded-3xl bg-zinc-950 p-7 text-white sm:p-9 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Content Command Center
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {campaign ? campaign.title : "Create. Publish. Learn."}
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
                  {campaign
                    ? campaign.brief
                    : "Turn one campaign brief into platform-specific content, scheduled posts, performance analytics and actionable AI insights."}
                </p>

                {campaign && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                      {campaign.contentType}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                      {campaign.language}
                    </span>
                    {campaign.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={nextAction.href}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  {nextAction.action}
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setRefreshKey((value) => value + 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>

            <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
              <PipelineCard label="Brief" done={status.brief} />
              <PipelineCard label="AI generated" done={status.generated} />
              <PipelineCard label="Approved" done={status.approved} />
              <PipelineCard label="Published" done={status.published} />
              <PipelineCard label="Scheduled" done={status.scheduled} />
              <PipelineCard label="Analytics" done={status.analytics} />
              <PipelineCard label="AI report" done={status.report} />
            </section>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <section className="rounded-3xl border bg-white p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      Campaign performance
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {campaign
                        ? `Current metrics for ${campaign.title}.`
                        : "Performance appears here after publishing and analytics generation."}
                    </p>
                  </div>

                  <Link
                    href="/analytics"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-black"
                  >
                    Open analytics
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    label="Reach"
                    value={formatNumber(totals.reach)}
                    icon={<TrendingUp className="h-4 w-4" />}
                  />
                  <MetricCard
                    label="Impressions"
                    value={formatNumber(totals.impressions)}
                    icon={<BarChart3 className="h-4 w-4" />}
                  />
                  <MetricCard
                    label="Engagement"
                    value={formatNumber(totals.engagement)}
                    icon={<Target className="h-4 w-4" />}
                  />
                  <MetricCard
                    label="Engagement rate"
                    value={`${totals.engagementRate}%`}
                    icon={<Sparkles className="h-4 w-4" />}
                  />
                </div>

                <div className="mt-6 space-y-3">
                  {platformRows.map((row) => (
                    <PlatformRow key={row.platform} {...row} />
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-xl font-semibold">Next best action</h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {nextAction.description}
                </p>

                <Link
                  href={nextAction.href}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  {nextAction.action}
                  <ChevronRight className="h-4 w-4" />
                </Link>

                {status.report && report?.nextBrief && (
                  <Link
                    href="/create?from=report"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:bg-zinc-50"
                  >
                    <FileText className="h-4 w-4" />
                    Build from AI insights
                  </Link>
                )}
              </section>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Platform command</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      See the publishing state of every selected channel.
                    </p>
                  </div>
                  <Megaphone className="h-5 w-5 text-zinc-400" />
                </div>

                <div className="mt-6 space-y-3">
                  {platformRows
                    .filter((row) =>
                      campaign
                        ? campaign.platforms.includes(row.platform)
                        : true,
                    )
                    .map((row) => (
                      <div
                        key={row.platform}
                        className="flex items-center gap-3 rounded-2xl border p-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                          <Video className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">
                              {row.platform}
                            </p>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${platformMeta[row.platform]}`}
                            >
                              {row.postCount === 0
                                ? "Not published"
                                : row.published > 0
                                  ? "Published"
                                  : "Scheduled"}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-zinc-500">
                            {row.postCount} post
                            {row.postCount === 1 ? "" : "s"} ·{" "}
                            {formatNumber(row.reach)} reach ·{" "}
                            {formatNumber(row.views)} views
                          </p>
                        </div>

                        <Link
                          href="/publish"
                          className="rounded-lg border p-2 text-zinc-500 transition hover:bg-zinc-50 hover:text-black"
                          aria-label={`Open ${row.platform} publisher`}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    ))}
                </div>
              </section>

              <section className="rounded-3xl border bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">AI insight preview</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      The report feeds the next campaign brief.
                    </p>
                  </div>
                  <FileText className="h-5 w-5 text-zinc-400" />
                </div>

                {status.report && insightPreview ? (
                  <>
                    <div className="mt-5 rounded-2xl bg-zinc-50 p-5">
                      <p className="text-sm font-semibold">Key insight</p>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        {insightPreview.insight ||
                          "The AI report contains a campaign performance insight."}
                      </p>

                      {insightPreview.evidence && (
                        <p className="mt-3 text-xs leading-5 text-zinc-500">
                          Evidence: {insightPreview.evidence}
                        </p>
                      )}

                      {!insightPreview.evidence &&
                        insightPreview.evidencePostIds &&
                        insightPreview.evidencePostIds.length > 0 && (
                          <p className="mt-3 text-xs leading-5 text-zinc-500">
                            Evidence:{" "}
                            {insightPreview.evidencePostIds.join(", ")}
                          </p>
                        )}
                    </div>

                    {recommendationText && (
                      <div className="mt-3 rounded-2xl border p-5">
                        <p className="text-sm font-semibold">Recommendation</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                          {recommendationText}
                        </p>
                      </div>
                    )}

                    <Link
                      href="/report"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
                    >
                      Open full AI report
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed p-6 text-center">
                    <FileText className="mx-auto h-8 w-8 text-zinc-300" />
                    <p className="mt-3 text-sm font-medium">
                      No campaign report yet
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Publish the campaign, generate analytics, then create the
                      evidence-backed AI report.
                    </p>
                    <Link
                      href={status.analytics ? "/report" : "/analytics"}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white"
                    >
                      {status.analytics ? "Generate report" : "Open analytics"}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </section>
            </div>

            <section className="mt-8 rounded-3xl border bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">Recent activity</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Latest events from the active campaign.
                  </p>
                </div>
                <Clock3 className="h-5 w-5 text-zinc-400" />
              </div>

              {latestActivity.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {latestActivity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-2xl border p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                          {item.description}
                        </p>
                        <p className="mt-2 text-[10px] text-zinc-400">
                          {formatDateTime(item.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed p-6 text-center">
                  <p className="text-sm font-medium">No activity yet</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Start a campaign to populate the command center.
                  </p>
                </div>
              )}
            </section>

            <section className="mt-8 rounded-3xl bg-zinc-950 p-6 text-white sm:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                    Closed-loop content intelligence
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    Brief → Create → Publish → Learn → Brief
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    Every campaign feeds performance evidence into the next
                    creative decision instead of ending at publication.
                  </p>
                </div>

                <Link
                  href={status.report ? "/create?from=report" : nextAction.href}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  {status.report ? "Start next brief" : nextAction.action}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#18181b]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r bg-white lg:block" />
        <section className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            <div className="h-64 animate-pulse rounded-3xl bg-zinc-900" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-2xl border bg-white"
                />
              ))}
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="h-80 animate-pulse rounded-3xl border bg-white" />
              <div className="h-80 animate-pulse rounded-3xl border bg-white" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PipelineCard({ label, done }: { label: string; done: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        done ? "border-zinc-200 bg-white" : "border-dashed bg-transparent"
      }`}
    >
      <div className="flex items-center gap-2">
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        ) : (
          <XCircle className="h-4 w-4 text-zinc-300" />
        )}
        <p className="text-xs font-semibold">{label}</p>
      </div>
      <p className="mt-2 text-[10px] text-zinc-500">
        {done ? "Complete" : "Pending"}
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center gap-2 text-zinc-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function PlatformRow({
  platform,
  postCount,
  published,
  scheduled,
  reach,
  engagement,
  views,
}: {
  platform: Platform;
  postCount: number;
  published: number;
  scheduled: number;
  reach: number;
  engagement: number;
  views: number;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{platform}</p>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${platformMeta[platform]}`}
          >
            {postCount === 0
              ? "No posts"
              : `${published} published · ${scheduled} scheduled`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-right text-xs sm:min-w-[300px]">
        <div>
          <p className="text-zinc-400">Reach</p>
          <p className="mt-1 font-semibold">{formatNumber(reach)}</p>
        </div>
        <div>
          <p className="text-zinc-400">Engagement</p>
          <p className="mt-1 font-semibold">{formatNumber(engagement)}</p>
        </div>
        <div>
          <p className="text-zinc-400">Views</p>
          <p className="mt-1 font-semibold">{formatNumber(views)}</p>
        </div>
      </div>
    </div>
  );
}
