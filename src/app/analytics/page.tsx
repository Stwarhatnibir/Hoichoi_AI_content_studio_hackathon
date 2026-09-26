"use client";

import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Eye,
  Globe,
  Heart,
  MessageCircle,
  MousePointerClick,
  PlaySquare,
  RefreshCw,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ContentBrief = {
  campaignId?: string;
  title: string;
  brief: string;
  language: string;
  objective: string;
  platforms: string[];
};

type ScheduledPost = {
  id: string;
  campaignId?: string;
  campaignTitle: string;
  platform: string;
  headline: string;
  scheduledAt: string;
  status: "scheduled" | "published";
  createdAt: string;
};

type AnalyticsRecord = {
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
  engagementRate: number;
  clickThroughRate: number;
  updatedAt: string;
};

const platformConfig: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
  }
> = {
  Instagram: {
    label: "Instagram",
    icon: <Globe className="h-4 w-4" />,
  },

  YouTube: {
    label: "YouTube",
    icon: <PlaySquare className="h-4 w-4" />,
  },

  Facebook: {
    label: "Facebook",
    icon: <Globe className="h-4 w-4" />,
  },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
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

function createMockAnalytics(post: ScheduledPost): AnalyticsRecord {
  const seed = Array.from(post.id).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  const platformMultiplier =
    post.platform === "Instagram"
      ? 1.18
      : post.platform === "YouTube"
        ? 1.42
        : 0.94;

  const impressions = Math.round((8500 + (seed % 7000)) * platformMultiplier);

  const reach = Math.round(impressions * (0.62 + (seed % 15) / 100));

  const likes = Math.round(reach * (0.045 + (seed % 25) / 1000));

  const comments = Math.round(likes * (0.08 + (seed % 10) / 100));

  const shares = Math.round(likes * (0.12 + (seed % 8) / 100));

  const clicks = Math.round(impressions * (0.018 + (seed % 12) / 1000));

  const saves = Math.round(likes * (0.18 + (seed % 12) / 100));

  const totalEngagement = likes + comments + shares + saves;

  const engagementRate =
    reach > 0 ? Number(((totalEngagement / reach) * 100).toFixed(2)) : 0;

  const clickThroughRate =
    impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;

  return {
    postId: post.id,
    campaignId: post.campaignId,
    platform: post.platform,
    impressions,
    reach,
    likes,
    comments,
    shares,
    clicks,
    saves,
    engagementRate,
    clickThroughRate,
    updatedAt: new Date().toISOString(),
  };
}

export default function AnalyticsPage() {
  const router = useRouter();

  const [campaignTitle, setCampaignTitle] = useState("");

  const [campaignId, setCampaignId] = useState("");

  const [posts, setPosts] = useState<ScheduledPost[]>([]);

  const [analytics, setAnalytics] = useState<AnalyticsRecord[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const briefRaw = localStorage.getItem("hoichoi-content-brief");

      let currentBrief: ContentBrief | null = null;

      if (briefRaw) {
        try {
          currentBrief = JSON.parse(briefRaw) as ContentBrief;
        } catch {
          currentBrief = null;
        }
      }

      if (!currentBrief) {
        setPosts([]);
        setAnalytics([]);
        setLoading(false);
        return;
      }

      let currentCampaignId = currentBrief.campaignId;

      if (!currentCampaignId) {
        currentCampaignId = generateCampaignId();

        currentBrief = {
          ...currentBrief,
          campaignId: currentCampaignId,
        };

        localStorage.setItem(
          "hoichoi-content-brief",
          JSON.stringify(currentBrief),
        );
      }

      setCampaignId(currentCampaignId);

      setCampaignTitle(currentBrief.title);

      const savedPosts = localStorage.getItem("hoichoi-scheduled-posts");

      let parsedPosts: ScheduledPost[] = [];

      if (savedPosts) {
        try {
          const candidatePosts = JSON.parse(savedPosts);

          if (Array.isArray(candidatePosts)) {
            parsedPosts = candidatePosts;
          }
        } catch {
          parsedPosts = [];
        }
      }

      /*
       * Migration for posts created before campaignId was introduced.
       *
       * Only legacy posts with the current campaign title are associated
       * with the current campaign. Other historical campaigns remain
       * untouched and are excluded from this campaign.
       */
      let postsChanged = false;

      const migratedPosts = parsedPosts.map((post) => {
        if (!post.campaignId && post.campaignTitle === currentBrief?.title) {
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

      const currentPosts = migratedPosts.filter(
        (post) => post.campaignId === currentCampaignId,
      );

      setPosts(currentPosts);

      const savedAnalytics = localStorage.getItem("hoichoi-analytics");

      let existingAnalytics: AnalyticsRecord[] = [];

      if (savedAnalytics) {
        try {
          const parsedAnalytics = JSON.parse(savedAnalytics);

          if (Array.isArray(parsedAnalytics)) {
            existingAnalytics = parsedAnalytics;
          }
        } catch {
          existingAnalytics = [];
        }
      }

      const postsById = new Map(migratedPosts.map((post) => [post.id, post]));

      /*
       * Preserve historical analytics while backfilling campaignId
       * from their corresponding scheduled post.
       */
      const migratedAnalytics = existingAnalytics.map((item) => {
        const matchingPost = postsById.get(item.postId);

        if (!item.campaignId && matchingPost?.campaignId) {
          return {
            ...item,
            campaignId: matchingPost.campaignId,
          };
        }

        return item;
      });

      const analyticsByPostId = new Map(
        migratedAnalytics.map((item) => [item.postId, item]),
      );

      /*
       * Generate analytics only for posts that do not already have
       * an analytics record.
       */
      for (const post of migratedPosts) {
        if (!analyticsByPostId.has(post.id)) {
          analyticsByPostId.set(post.id, createMockAnalytics(post));
        }
      }

      const mergedAnalytics = Array.from(analyticsByPostId.values());

      localStorage.setItem(
        "hoichoi-analytics",
        JSON.stringify(mergedAnalytics),
      );

      const currentAnalytics = mergedAnalytics.filter(
        (item) => item.campaignId === currentCampaignId,
      );

      setAnalytics(currentAnalytics);
    } catch {
      setPosts([]);
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const totals = useMemo(() => {
    return analytics.reduce(
      (total, item) => ({
        impressions: total.impressions + item.impressions,
        reach: total.reach + item.reach,
        likes: total.likes + item.likes,
        comments: total.comments + item.comments,
        shares: total.shares + item.shares,
        clicks: total.clicks + item.clicks,
        saves: total.saves + item.saves,
      }),
      {
        impressions: 0,
        reach: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0,
        saves: 0,
      },
    );
  }, [analytics]);

  const platformComparison = useMemo(() => {
    const platforms = ["Instagram", "YouTube", "Facebook"];

    return platforms.map((platform) => {
      const platformAnalytics = analytics.filter(
        (item) => item.platform === platform,
      );

      const impressions = platformAnalytics.reduce(
        (sum, item) => sum + item.impressions,
        0,
      );

      const reach = platformAnalytics.reduce(
        (sum, item) => sum + item.reach,
        0,
      );

      const likes = platformAnalytics.reduce(
        (sum, item) => sum + item.likes,
        0,
      );

      const comments = platformAnalytics.reduce(
        (sum, item) => sum + item.comments,
        0,
      );

      const shares = platformAnalytics.reduce(
        (sum, item) => sum + item.shares,
        0,
      );

      const clicks = platformAnalytics.reduce(
        (sum, item) => sum + item.clicks,
        0,
      );

      const saves = platformAnalytics.reduce(
        (sum, item) => sum + item.saves,
        0,
      );

      const totalEngagement = likes + comments + shares + saves;

      const engagementRate =
        reach > 0 ? Number(((totalEngagement / reach) * 100).toFixed(2)) : 0;

      const clickThroughRate =
        impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;

      return {
        platform,
        posts: platformAnalytics.length,
        impressions,
        reach,
        likes,
        comments,
        shares,
        clicks,
        saves,
        engagementRate,
        clickThroughRate,
      };
    });
  }, [analytics]);

  const topPlatform = useMemo(() => {
    if (analytics.length === 0) {
      return null;
    }

    return [...platformComparison]
      .filter((item) => item.posts > 0)
      .sort((a, b) => b.engagementRate - a.engagementRate)[0];
  }, [analytics.length, platformComparison]);

  function refreshAnalytics() {
    if (!campaignId) {
      return;
    }

    const allPostsRaw = localStorage.getItem("hoichoi-scheduled-posts");

    let allPosts: ScheduledPost[] = [];

    if (allPostsRaw) {
      try {
        const parsed = JSON.parse(allPostsRaw);

        if (Array.isArray(parsed)) {
          allPosts = parsed;
        }
      } catch {
        allPosts = [];
      }
    }

    const refreshedCampaignAnalytics = allPosts
      .filter((post) => post.campaignId === campaignId)
      .map((post) => createMockAnalytics(post));

    const existingAnalyticsRaw = localStorage.getItem("hoichoi-analytics");

    let existingAnalytics: AnalyticsRecord[] = [];

    if (existingAnalyticsRaw) {
      try {
        const parsed = JSON.parse(existingAnalyticsRaw);

        if (Array.isArray(parsed)) {
          existingAnalytics = parsed;
        }
      } catch {
        existingAnalytics = [];
      }
    }

    const currentPostIds = new Set(
      refreshedCampaignAnalytics.map((item) => item.postId),
    );

    const historicalAnalytics = existingAnalytics.filter(
      (item) => !currentPostIds.has(item.postId),
    );

    const updated = [...historicalAnalytics, ...refreshedCampaignAnalytics];

    localStorage.setItem("hoichoi-analytics", JSON.stringify(updated));

    setAnalytics(refreshedCampaignAnalytics);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Loading analytics...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition hover:bg-muted"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />

                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Analytics Store
                </span>
              </div>

              <h1 className="mt-1 text-xl font-semibold">
                Cross-platform performance
              </h1>

              {campaignTitle && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Campaign: {campaignTitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={refreshAnalytics}
            disabled={!campaignId}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh metrics
          </button>
        </header>

        {posts.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border p-12 text-center">
            <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground" />

            <h2 className="mt-4 text-lg font-semibold">
              No analytics for this campaign yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Publish or schedule a post for this campaign from the Publisher to
              populate the Analytics Store.
            </p>

            <button
              onClick={() => router.push("/publish")}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background"
            >
              Open Publisher
            </button>
          </section>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={<Eye className="h-4 w-4" />}
                label="Impressions"
                value={formatNumber(totals.impressions)}
              />

              <MetricCard
                icon={<Users className="h-4 w-4" />}
                label="Reach"
                value={formatNumber(totals.reach)}
              />

              <MetricCard
                icon={<Heart className="h-4 w-4" />}
                label="Likes"
                value={formatNumber(totals.likes)}
              />

              <MetricCard
                icon={<MousePointerClick className="h-4 w-4" />}
                label="Clicks"
                value={formatNumber(totals.clicks)}
              />
            </section>

            <section className="mt-4 grid gap-4 sm:grid-cols-3">
              <MetricCard
                icon={<MessageCircle className="h-4 w-4" />}
                label="Comments"
                value={formatNumber(totals.comments)}
              />

              <MetricCard
                icon={<Share2 className="h-4 w-4" />}
                label="Shares"
                value={formatNumber(totals.shares)}
              />

              <MetricCard
                icon={<Sparkles className="h-4 w-4" />}
                label="Saves"
                value={formatNumber(totals.saves)}
              />
            </section>

            {topPlatform && (
              <section className="mt-6 rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <TrendingUp className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Cross-platform signal
                    </p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {topPlatform.platform} currently has an engagement rate of{" "}
                      <strong className="font-semibold text-foreground">
                        {topPlatform.engagementRate}%
                      </strong>{" "}
                      across its tracked posts in this campaign.
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      This is based on the mock analytics data stored against
                      the generated Post IDs.
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="mb-5">
                <p className="text-sm font-semibold">
                  Like-for-like platform comparison
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Compare the same campaign metrics across supported channels.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="pb-3 pr-4 font-medium">Platform</th>
                      <th className="pb-3 pr-4 font-medium">Posts</th>
                      <th className="pb-3 pr-4 font-medium">Impressions</th>
                      <th className="pb-3 pr-4 font-medium">Reach</th>
                      <th className="pb-3 pr-4 font-medium">Engagement</th>
                      <th className="pb-3 font-medium">CTR</th>
                    </tr>
                  </thead>

                  <tbody>
                    {platformComparison.map((item) => (
                      <tr
                        key={item.platform}
                        className="border-b border-border last:border-0"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            {platformConfig[item.platform]?.icon}

                            <span className="font-medium">{item.platform}</span>
                          </div>
                        </td>

                        <td className="py-4 pr-4 text-muted-foreground">
                          {item.posts}
                        </td>

                        <td className="py-4 pr-4">
                          {formatNumber(item.impressions)}
                        </td>

                        <td className="py-4 pr-4">
                          {formatNumber(item.reach)}
                        </td>

                        <td className="py-4 pr-4">
                          <span className="font-medium">
                            {item.engagementRate}%
                          </span>
                        </td>

                        <td className="py-4">{item.clickThroughRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="mb-5">
                <p className="text-sm font-semibold">Post-level analytics</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Every metric is linked to a concrete Post ID.
                </p>
              </div>

              <div className="space-y-3">
                {analytics.map((item) => {
                  const post = posts.find(
                    (candidate) => candidate.id === item.postId,
                  );

                  return (
                    <div
                      key={item.postId}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] font-medium">
                              {platformConfig[item.platform]?.icon}

                              {item.platform}
                            </span>

                            <span className="font-mono text-[10px] text-muted-foreground">
                              {item.postId}
                            </span>

                            {post?.status === "published" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Published
                              </span>
                            )}
                          </div>

                          <p className="mt-3 text-sm font-medium">
                            {post?.headline ?? "Generated post"}
                          </p>

                          <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />

                            {post
                              ? new Date(post.scheduledAt).toLocaleString(
                                  "en-IN",
                                  {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  },
                                )
                              : "Unknown date"}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <MiniMetric
                            label="Impressions"
                            value={formatNumber(item.impressions)}
                          />

                          <MiniMetric
                            label="Engagement"
                            value={`${item.engagementRate}%`}
                          />

                          <MiniMetric
                            label="Clicks"
                            value={formatNumber(item.clicks)}
                          />

                          <MiniMetric
                            label="Shares"
                            value={formatNumber(item.shares)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
          {icon}
        </div>

        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </div>

      <p className="mt-5 text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[90px] rounded-lg bg-muted/40 p-3">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
