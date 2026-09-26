"use client";

import {
  CheckCircle2,
  Copy,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  PlaySquare,
  RefreshCw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Platform = "Instagram" | "YouTube" | "Facebook";

type BriefData = {
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

const platformIcons = {
  Instagram: Globe,
  YouTube: PlaySquare,
  Facebook: Globe,
};

const platformDescriptions = {
  Instagram: "Short-form visual storytelling",
  YouTube: "Long-form video discovery",
  Facebook: "Conversation-driven community content",
};

export default function StudioPage() {
  const router = useRouter();

  const [brief, setBrief] = useState<BriefData | null>(null);
  const [contents, setContents] = useState<PlatformContent[]>([]);
  const [activePlatform, setActivePlatform] = useState<Platform>("Instagram");

  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const storedBrief = localStorage.getItem("hoichoi-content-brief");

    if (!storedBrief) {
      router.replace("/create");
      return;
    }

    try {
      const parsedBrief = JSON.parse(storedBrief) as BriefData;

      setBrief(parsedBrief);

      if (parsedBrief.platforms?.length > 0 && parsedBrief.platforms[0]) {
        setActivePlatform(parsedBrief.platforms[0] as Platform);
      }

      generateContent(parsedBrief, false);
    } catch {
      setError("The saved campaign brief is invalid.");
      setLoading(false);
    }
  }, [router]);

  async function generateContent(
    campaignBrief: BriefData,
    isRegeneration: boolean,
  ) {
    if (isRegeneration) {
      setRegenerating(true);
    } else {
      setLoading(true);
    }

    setError("");
    setApproved(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignBrief),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate content.");
      }

      if (!Array.isArray(data.contents)) {
        throw new Error("Gemini returned an invalid content structure.");
      }

      setContents(data.contents);
    } catch (generationError) {
      console.error("Content generation failed:", generationError);

      setError(
        generationError instanceof Error
          ? generationError.message
          : "Something went wrong while generating content.",
      );
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }

  function handleRegenerate() {
    if (!brief) return;

    generateContent(brief, true);
  }

  async function handleCopy() {
    const currentContent = contents.find(
      (item) => item.platform.toLowerCase() === activePlatform.toLowerCase(),
    );

    if (!currentContent) return;

    const text = `${currentContent.headline}

${currentContent.caption}

${currentContent.hashtags.join(" ")}

${currentContent.cta}`;

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setError("Unable to copy content to clipboard.");
    }
  }

  function handleApprove() {
    setApproved(true);

    localStorage.setItem(
      "hoichoi-content-approved",
      JSON.stringify({
        approved: true,
        approvedAt: new Date().toISOString(),
        campaignTitle: brief?.title ?? "",
      }),
    );
  }

  function handleReject() {
    setApproved(false);

    localStorage.removeItem("hoichoi-content-approved");
  }

  const currentContent = contents.find(
    (item) => item.platform.toLowerCase() === activePlatform.toLowerCase(),
  );

  const requestedPlatforms = brief?.platforms?.length
    ? (brief.platforms as Platform[])
    : [];

  if (!brief) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading campaign...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1500px] px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <button
              onClick={() => router.push("/")}
              className="mb-5 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <Sparkles className="h-4 w-4" />
              Hoichoi AI Content Studio
            </button>

            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  AI CONTENT STUDIO
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  Generative Studio
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Transform one campaign brief into platform-specific content
                  using Gemini AI.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/create")}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            New Campaign
          </button>
        </div>

        {/* Campaign summary */}
        <section className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <FileText className="h-4 w-4" />
            Campaign
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <h2 className="text-2xl font-semibold">{brief.title}</h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
                {brief.brief}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium">
                {brief.language}
              </span>

              <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium">
                {brief.contentType}
              </span>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-destructive/10 p-1">
                <RefreshCw className="h-4 w-4 text-destructive" />
              </div>

              <div>
                <p className="font-medium text-destructive">
                  Generation failed
                </p>

                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main studio */}
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Platforms */}
          <aside className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="px-2 pb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Platforms
            </p>

            <div className="space-y-1">
              {requestedPlatforms.map((platform) => {
                const Icon = platformIcons[platform] ?? Globe;

                const isActive = activePlatform === platform;

                return (
                  <button
                    key={platform}
                    onClick={() => setActivePlatform(platform)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />

                    <div className="min-w-0">
                      <div className="font-medium">{platform}</div>

                      <div
                        className={`mt-0.5 truncate text-[11px] ${
                          isActive
                            ? "text-background/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {platformDescriptions[platform]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <p className="px-2 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Generation status
              </p>

              <div className="mt-3 flex items-center gap-2 px-2">
                {loading || regenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Generating with Gemini...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Ready for review</span>
                  </>
                )}
              </div>
            </div>
          </aside>

          {/* Content */}
          <section className="min-w-0 rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-border p-6 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <WandSparkles className="h-5 w-5" />

                  <h2 className="text-lg font-semibold">
                    {activePlatform} content
                  </h2>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  AI-generated content tailored specifically for{" "}
                  {activePlatform}.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!currentContent || loading}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />

                  {copied ? "Copied" : "Copy"}
                </button>

                <button
                  onClick={handleRegenerate}
                  disabled={loading || regenerating}
                  className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {regenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}

                  {regenerating ? "Generating..." : "Regenerate"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[500px] items-center justify-center p-8">
                <div className="text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>

                  <h3 className="font-semibold">
                    Gemini is creating your campaign
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Generating platform-specific content...
                  </p>
                </div>
              </div>
            ) : currentContent ? (
              <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_300px]">
                {/* Copy */}
                <div className="space-y-7 p-6">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Headline
                    </label>

                    <div className="mt-3 rounded-xl border border-border bg-background p-4">
                      <p className="text-lg font-semibold">
                        {currentContent.headline}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Caption
                    </label>

                    <div className="mt-3 min-h-[180px] rounded-xl border border-border bg-background p-5">
                      <p className="whitespace-pre-wrap text-[15px] leading-7">
                        {currentContent.caption}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Hashtags
                    </label>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentContent.hashtags.map((hashtag, index) => (
                        <span
                          key={`${hashtag}-${index}`}
                          className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium"
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Call to action
                    </label>

                    <div className="mt-3 rounded-xl border border-border bg-muted/50 p-4">
                      <p className="text-sm font-medium">
                        {currentContent.cta}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Creative preview */}
                <div className="border-t border-border p-6 xl:border-l xl:border-t-0">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Creative Preview
                  </p>

                  <div className="mt-3 flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-background shadow-sm">
                      <ImageIcon className="h-6 w-6" />
                    </div>

                    <h3 className="font-semibold">AI creative</h3>

                    <p className="mt-2 max-w-[220px] text-xs leading-5 text-muted-foreground">
                      Image/video generation will be connected in the next
                      stage.
                    </p>
                  </div>

                  <div className="mt-5 rounded-xl border border-border p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      Platform adaptation
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      This content was generated specifically for{" "}
                      <span className="font-medium text-foreground">
                        {activePlatform}
                      </span>
                      , rather than simply reusing another platform&apos;s copy.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[500px] items-center justify-center p-8">
                <div className="text-center">
                  <p className="font-medium">No content generated yet.</p>

                  <button
                    onClick={() => generateContent(brief, false)}
                    className="mt-4 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
                  >
                    Generate Content
                  </button>
                </div>
              </div>
            )}

            {/* Approval gate */}
            {!loading && currentContent && (
              <div className="border-t border-border bg-muted/30 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="font-semibold">
                      Approval required before publishing
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Review the generated content before it can be sent to the
                      publishing workflow.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                      Needs Changes
                    </button>

                    <button
                      onClick={handleApprove}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                        approved
                          ? "bg-foreground text-background"
                          : "bg-foreground text-background hover:opacity-90"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />

                      {approved ? "Approved" : "Approve Content"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
