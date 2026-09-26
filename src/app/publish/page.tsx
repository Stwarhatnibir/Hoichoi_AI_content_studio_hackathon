"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock3,
  Globe,
  Loader2,
  PlaySquare,
  Send,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ContentBrief = {
  title: string;
  brief: string;
  language: string;
  contentType: string;
  platforms: string[];
};

type PlatformContent = {
  platform: string;
  headline: string;
  caption: string;
  hashtags: string[];
  cta: string;
};

type PlatformVisual = {
  platform: string;
  visualConcept: string;
  mood: string;
  composition: string;
  background: string;
  accent: string;
  foreground: string;
  decorativeElements: string[];
  visualText: string;
};

type ScheduledPost = {
  id: string;
  campaignTitle: string;
  platform: string;
  headline: string;
  scheduledAt: string;
  status: "scheduled" | "published";
  createdAt: string;
};

type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

const platformConfig: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    description: string;
  }
> = {
  Instagram: {
    label: "Instagram",
    icon: <Globe className="h-4 w-4" />,
    description: "Square social creative",
  },

  YouTube: {
    label: "YouTube",
    icon: <PlaySquare className="h-4 w-4" />,
    description: "Landscape video/thumbnail",
  },

  Facebook: {
    label: "Facebook",
    icon: <Globe className="h-4 w-4" />,
    description: "Portrait social creative",
  },
};

function generatePostId(platform: string) {
  const prefix =
    platform === "Instagram"
      ? "IG"
      : platform === "YouTube"
        ? "YT"
        : platform === "Facebook"
          ? "FB"
          : "POST";

  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomPart}`;
}

/*
 * Mock platform adapters.
 *
 * These simulate the kind of validation that a real social-platform
 * publishing adapter would perform before accepting a post.
 */
function validateForPlatform(
  content: PlatformContent,
  visual: PlatformVisual | undefined,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const captionLength = content.caption.trim().length;
  const hashtagCount = content.hashtags.length;

  if (!content.headline.trim()) {
    errors.push("Headline is required.");
  }

  if (!content.caption.trim()) {
    errors.push("Caption is required.");
  }

  if (!content.cta.trim()) {
    errors.push("CTA is required.");
  }

  if (!visual) {
    errors.push("A generated creative is required.");
  }

  if (content.platform === "Instagram") {
    if (captionLength > 2200) {
      errors.push(
        `Instagram caption exceeds the 2,200 character limit (${captionLength}).`,
      );
    }

    if (hashtagCount > 30) {
      errors.push(
        `Instagram allows a maximum of 30 hashtags (${hashtagCount} supplied).`,
      );
    }

    if (
      visual &&
      !["1:1", "square", "Square"].some((value) =>
        `${visual.composition} ${visual.visualConcept}`
          .toLowerCase()
          .includes(value.toLowerCase()),
      )
    ) {
      warnings.push(
        "Creative direction does not explicitly mention a square composition.",
      );
    }
  }

  if (content.platform === "YouTube") {
    if (content.headline.length > 100) {
      errors.push(
        `YouTube title exceeds 100 characters (${content.headline.length}).`,
      );
    }

    if (captionLength > 5000) {
      errors.push(
        `YouTube description exceeds 5,000 characters (${captionLength}).`,
      );
    }

    if (
      visual &&
      !["16:9", "landscape", "wide"].some((value) =>
        `${visual.composition} ${visual.visualConcept}`
          .toLowerCase()
          .includes(value.toLowerCase()),
      )
    ) {
      warnings.push(
        "Creative direction does not explicitly mention a landscape composition.",
      );
    }
  }

  if (content.platform === "Facebook") {
    if (captionLength > 63206) {
      errors.push(
        `Facebook caption exceeds the supported length (${captionLength}).`,
      );
    }

    if (
      visual &&
      !["4:5", "portrait"].some((value) =>
        `${visual.composition} ${visual.visualConcept}`
          .toLowerCase()
          .includes(value.toLowerCase()),
      )
    ) {
      warnings.push(
        "Creative direction does not explicitly mention a portrait composition.",
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function formatDateTime(value: string) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function PublishPage() {
  const router = useRouter();

  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [contents, setContents] = useState<PlatformContent[]>([]);
  const [visuals, setVisuals] = useState<PlatformVisual[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

  const [activePlatform, setActivePlatform] = useState("Instagram");

  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [approved, setApproved] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    const savedBrief = localStorage.getItem("hoichoi-content-brief");

    const savedContents = localStorage.getItem("hoichoi-generated-contents");

    const savedVisuals = localStorage.getItem("hoichoi-generated-visuals");

    const savedApproval = localStorage.getItem("hoichoi-content-approved");

    const savedPosts = localStorage.getItem("hoichoi-scheduled-posts");

    if (!savedBrief || !savedContents || !savedVisuals) {
      router.replace("/create");
      return;
    }

    try {
      const parsedBrief = JSON.parse(savedBrief) as ContentBrief;

      const parsedContents = JSON.parse(savedContents) as PlatformContent[];

      const parsedVisuals = JSON.parse(savedVisuals) as PlatformVisual[];

      setBrief(parsedBrief);
      setContents(parsedContents);
      setVisuals(parsedVisuals);

      setApproved(savedApproval === "true");

      if (parsedBrief.platforms?.length > 0) {
        setActivePlatform(parsedBrief.platforms[0]);
      }

      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts) as ScheduledPost[];

        if (Array.isArray(parsedPosts)) {
          setScheduledPosts(parsedPosts);
        }
      }
    } catch {
      setMessage("Could not load the approved campaign data.");
      setMessageType("error");
    }
  }, [router]);

  const currentContent = useMemo(
    () => contents.find((item) => item.platform === activePlatform),
    [contents, activePlatform],
  );

  const currentVisual = useMemo(
    () => visuals.find((item) => item.platform === activePlatform),
    [visuals, activePlatform],
  );

  const validation = useMemo(() => {
    if (!currentContent) {
      return {
        valid: false,
        errors: ["No generated content found."],
        warnings: [],
      };
    }

    return validateForPlatform(currentContent, currentVisual);
  }, [currentContent, currentVisual]);

  function savePosts(posts: ScheduledPost[]) {
    setScheduledPosts(posts);

    localStorage.setItem("hoichoi-scheduled-posts", JSON.stringify(posts));
  }

  async function handleSchedule() {
    if (!approved) {
      setMessage(
        "Publishing is blocked because this campaign has not been approved.",
      );
      setMessageType("error");
      return;
    }

    if (!currentContent) {
      setMessage("No content is available for this platform.");
      setMessageType("error");
      return;
    }

    if (!validation.valid) {
      setMessage(
        "Platform adapter rejected this post. Fix the validation errors before scheduling.",
      );
      setMessageType("error");
      return;
    }

    if (!scheduleDate || !scheduleTime) {
      setMessage("Select both a schedule date and time.");
      setMessageType("error");
      return;
    }

    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);

    if (Number.isNaN(scheduledAt.getTime())) {
      setMessage("Invalid schedule date or time.");
      setMessageType("error");
      return;
    }

    if (scheduledAt.getTime() <= Date.now()) {
      setMessage("The scheduled time must be in the future.");
      setMessageType("error");
      return;
    }

    setPublishing(true);
    setMessage("");

    /*
     * Simulate a real adapter/API call.
     */
    await new Promise((resolve) => setTimeout(resolve, 900));

    const post: ScheduledPost = {
      id: generatePostId(activePlatform),
      campaignTitle: brief?.title ?? "Untitled Campaign",
      platform: activePlatform,
      headline: currentContent.headline,
      scheduledAt: scheduledAt.toISOString(),
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    savePosts([post, ...scheduledPosts]);

    setPublishing(false);

    setMessage(
      `${activePlatform} post scheduled successfully with Post ID ${post.id}.`,
    );

    setMessageType("success");
  }

  function handleMockPublishNow() {
    if (!approved) {
      setMessage(
        "Publishing is blocked because this campaign has not been approved.",
      );
      setMessageType("error");
      return;
    }

    if (!currentContent) {
      setMessage("No content is available.");
      setMessageType("error");
      return;
    }

    if (!validation.valid) {
      setMessage(
        "Platform adapter rejected this post. Fix the validation errors first.",
      );
      setMessageType("error");
      return;
    }

    setPublishing(true);
    setMessage("");

    setTimeout(() => {
      const post: ScheduledPost = {
        id: generatePostId(activePlatform),
        campaignTitle: brief?.title ?? "Untitled Campaign",
        platform: activePlatform,
        headline: currentContent.headline,
        scheduledAt: new Date().toISOString(),
        status: "published",
        createdAt: new Date().toISOString(),
      };

      savePosts([post, ...scheduledPosts]);

      setPublishing(false);

      setMessage(
        `${activePlatform} mock post published successfully with Post ID ${post.id}.`,
      );

      setMessageType("success");
    }, 900);
  }

  if (!brief) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        {/* HEADER */}
        <header className="mb-8 flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/studio")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition hover:bg-muted"
              aria-label="Back to studio"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />

                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Publisher
                </span>
              </div>

              <h1 className="mt-1 text-xl font-semibold">{brief.title}</h1>
            </div>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              approved
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}
          >
            {approved ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Approval verified
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5" />
                Approval required
              </>
            )}
          </div>
        </header>

        {/* STATUS MESSAGE */}
        {message && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
              messageType === "success"
                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}
          >
            {messageType === "success" ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}

            <span>{message}</span>
          </div>
        )}

        {/* APPROVAL GATE */}
        <section className="mb-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">Approval gate</p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                The publisher only accepts content that has been explicitly
                approved in AI Content Studio.
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs">
                {approved ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600">
                    <Check className="h-3.5 w-3.5" />
                    Approved campaign
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-destructive">
                    <XCircle className="h-3.5 w-3.5" />
                    Publishing blocked
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORM SELECTOR */}
        <section className="mb-6">
          <div className="flex flex-wrap gap-2">
            {brief.platforms.map((platform) => {
              const config =
                platformConfig[platform] ?? platformConfig.Instagram;

              const active = platform === activePlatform;

              return (
                <button
                  key={platform}
                  onClick={() => {
                    setActivePlatform(platform);
                    setMessage("");
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  {config.icon}

                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* PUBLISHER */}
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          {/* CONTENT PREVIEW */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Ready to publish</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {platformConfig[activePlatform]?.description}
                </p>
              </div>

              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>

            {currentContent ? (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Headline
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    {currentContent.headline}
                  </h2>
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Caption
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {currentContent.caption}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Hashtags
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentContent.hashtags.map((hashtag, index) => (
                      <span
                        key={`${hashtag}-${index}`}
                        className="rounded-full border border-border px-2.5 py-1 text-xs"
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    CTA
                  </p>

                  <p className="mt-2 text-sm">{currentContent.cta}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No content found.
              </div>
            )}
          </div>

          {/* ADAPTER + SCHEDULER */}
          <div className="space-y-6">
            {/* ADAPTER VALIDATION */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {activePlatform} adapter
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Pre-publish platform validation
                  </p>
                </div>

                {validation.valid ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-600">
                    <Check className="h-3 w-3" />
                    READY
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-medium text-destructive">
                    <XCircle className="h-3 w-3" />
                    REJECTED
                  </span>
                )}
              </div>

              {validation.errors.length > 0 && (
                <div className="space-y-2">
                  {validation.errors.map((error, index) => (
                    <div
                      key={`${error}-${index}`}
                      className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive"
                    >
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}

              {validation.errors.length === 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-700">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                  <span>
                    Content passed the platform adapter validation and can be
                    scheduled.
                  </span>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="mt-3 space-y-2">
                  {validation.warnings.map((warning, index) => (
                    <div
                      key={`${warning}-${index}`}
                      className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground"
                    >
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SCHEDULER */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-5">
                <p className="text-sm font-semibold">Schedule post</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Create a mock scheduled post for the selected platform.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="schedule-date"
                    className="mb-2 block text-xs font-medium"
                  >
                    Date
                  </label>

                  <input
                    id="schedule-date"
                    type="date"
                    value={scheduleDate}
                    onChange={(event) => setScheduleDate(event.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="schedule-time"
                    className="mb-2 block text-xs font-medium"
                  >
                    Time
                  </label>

                  <input
                    id="schedule-time"
                    type="time"
                    value={scheduleTime}
                    onChange={(event) => setScheduleTime(event.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
                  />
                </div>
              </div>

              <button
                onClick={handleSchedule}
                disabled={publishing || !approved || !validation.valid}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {publishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Clock3 className="h-4 w-4" />
                )}

                {publishing ? "Sending to adapter..." : "Schedule post"}
              </button>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />

                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Demo
                </span>

                <div className="h-px flex-1 bg-border" />
              </div>

              <button
                onClick={handleMockPublishNow}
                disabled={publishing || !approved || !validation.valid}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                {publishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Mock publish now
              </button>
            </div>
          </div>
        </section>

        {/* POST QUEUE */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Post queue</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Mock channel adapter output and generated Post IDs
              </p>
            </div>

            <span className="rounded-full border border-border px-2.5 py-1 text-xs">
              {scheduledPosts.length} posts
            </span>
          </div>

          {scheduledPosts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm font-medium">No posts yet</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Schedule or mock-publish a validated post to create the first
                Post ID.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      {platformConfig[post.platform]?.icon ?? (
                        <Globe className="h-4 w-4" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium">{post.headline}</p>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                        <span>{post.platform}</span>

                        <span>Post ID: {post.id}</span>

                        <span>{formatDateTime(post.scheduledAt)}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-medium ${
                      post.status === "published"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    {post.status === "published" ? "PUBLISHED" : "SCHEDULED"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
