"use client";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Globe,
  Loader2,
  PlaySquare,
  RefreshCw,
  Sparkles,
  Wand2,
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

type GenerateResponse = {
  contents: PlatformContent[];
  visuals: PlatformVisual[];
};

const platformConfig: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    aspect: string;
    badge: string;
  }
> = {
  Instagram: {
    label: "Instagram",
    icon: <Globe className="h-4 w-4" />,
    aspect: "1:1",
    badge: "Square",
  },

  YouTube: {
    label: "YouTube",
    icon: <PlaySquare className="h-4 w-4" />,
    aspect: "16:9",
    badge: "Landscape",
  },

  Facebook: {
    label: "Facebook",
    icon: <Globe className="h-4 w-4" />,
    aspect: "4:5",
    badge: "Portrait",
  },
};

function createBriefFingerprint(brief: ContentBrief) {
  return JSON.stringify({
    title: brief.title.trim(),
    brief: brief.brief.trim(),
    language: brief.language,
    contentType: brief.contentType,
    platforms: [...brief.platforms].sort(),
  });
}

function VisualPoster({
  visual,
  platform,
}: {
  visual: PlatformVisual;
  platform: string;
}) {
  const aspectClass =
    platform === "YouTube"
      ? "aspect-video"
      : platform === "Facebook"
        ? "aspect-[4/5]"
        : "aspect-square";

  return (
    <div
      className={`relative ${aspectClass} w-full overflow-hidden rounded-2xl border border-border bg-[#111]`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_35%)]" />

      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />

      <div className="absolute left-[8%] top-[12%] h-24 w-24 rounded-full bg-white/10 blur-2xl" />

      <div className="absolute bottom-[10%] right-[8%] h-32 w-32 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/70 backdrop-blur">
            {platform}
          </span>

          <span className="text-xs text-white/50">
            {platformConfig[platform]?.aspect ?? "Custom"}
          </span>
        </div>

        <div className="max-w-[85%]">
          <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-white/50">
            {visual.mood}
          </p>

          <h3 className="text-2xl font-semibold leading-tight text-white md:text-4xl">
            {visual.visualText || visual.visualConcept}
          </h3>

          <p className="mt-4 max-w-xl text-xs leading-relaxed text-white/60 md:text-sm">
            {visual.foreground}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {visual.decorativeElements?.slice(0, 3).map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/50"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  const router = useRouter();

  const [brief, setBrief] = useState<ContentBrief | null>(null);
  const [contents, setContents] = useState<PlatformContent[]>([]);
  const [visuals, setVisuals] = useState<PlatformVisual[]>([]);
  const [activePlatform, setActivePlatform] = useState("Instagram");

  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedBrief = localStorage.getItem("hoichoi-content-brief");

    if (!savedBrief) {
      router.replace("/create");
      return;
    }

    try {
      const parsedBrief = JSON.parse(savedBrief) as ContentBrief;

      setBrief(parsedBrief);

      if (parsedBrief.platforms?.length > 0) {
        setActivePlatform(parsedBrief.platforms[0]);
      }

      const currentFingerprint = createBriefFingerprint(parsedBrief);

      /*
       * Check which brief the cached AI generation belongs to.
       */
      const generatedForBrief = localStorage.getItem(
        "hoichoi-generated-for-brief",
      );

      const savedContents = localStorage.getItem("hoichoi-generated-contents");

      const savedVisuals = localStorage.getItem("hoichoi-generated-visuals");

      /*
       * Only reuse cached content if it belongs to the
       * EXACT SAME campaign brief.
       */
      if (
        generatedForBrief === currentFingerprint &&
        savedContents &&
        savedVisuals
      ) {
        const parsedContents = JSON.parse(savedContents) as PlatformContent[];

        const parsedVisuals = JSON.parse(savedVisuals) as PlatformVisual[];

        if (
          Array.isArray(parsedContents) &&
          parsedContents.length > 0 &&
          Array.isArray(parsedVisuals) &&
          parsedVisuals.length > 0
        ) {
          setContents(parsedContents);
          setVisuals(parsedVisuals);

          const savedApproval = localStorage.getItem(
            "hoichoi-content-approved",
          );

          setApproved(savedApproval === "true");

          setLoading(false);
          return;
        }
      }

      /*
       * The cached generation belongs to another campaign,
       * so generate fresh content automatically.
       */
      localStorage.removeItem("hoichoi-generated-contents");

      localStorage.removeItem("hoichoi-generated-visuals");

      localStorage.removeItem("hoichoi-content-approved");

      localStorage.removeItem("hoichoi-content-approved-at");

      localStorage.removeItem("hoichoi-generated-for-brief");

      setApproved(false);

      generateContent(parsedBrief);
    } catch {
      setError("Could not read the saved content brief.");
      setLoading(false);
    }
  }, [router]);

  async function generateContent(
    currentBrief: ContentBrief,
    isRegeneration = false,
  ) {
    try {
      setError("");

      if (isRegeneration) {
        setRegenerating(true);
      } else {
        setLoading(true);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentBrief),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate content.");
      }

      const generated = data as GenerateResponse;

      if (
        !Array.isArray(generated.contents) ||
        !Array.isArray(generated.visuals)
      ) {
        throw new Error("The AI returned an invalid content structure.");
      }

      setContents(generated.contents);
      setVisuals(generated.visuals);

      /*
       * Save the generated content.
       */
      localStorage.setItem(
        "hoichoi-generated-contents",
        JSON.stringify(generated.contents),
      );

      localStorage.setItem(
        "hoichoi-generated-visuals",
        JSON.stringify(generated.visuals),
      );

      /*
       * IMPORTANT:
       * Store exactly which brief produced this generation.
       */
      localStorage.setItem(
        "hoichoi-generated-for-brief",
        createBriefFingerprint(currentBrief),
      );

      /*
       * A new generation invalidates old approval.
       */
      localStorage.removeItem("hoichoi-content-approved");

      localStorage.removeItem("hoichoi-content-approved-at");

      setApproved(false);
    } catch (generationError) {
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

  function handleApprove() {
    if (!contents.length || !visuals.length) {
      setError("Generate the content before approving it.");
      return;
    }

    localStorage.setItem("hoichoi-content-approved", "true");

    localStorage.setItem(
      "hoichoi-content-approved-at",
      new Date().toISOString(),
    );

    setApproved(true);
    setError("");
  }

  function handleOpenPublisher() {
    if (!approved) {
      setError(
        "Please approve the generated content before opening the Publisher.",
      );
      return;
    }

    router.push("/publish");
  }

  const currentContent = useMemo(
    () => contents.find((item) => item.platform === activePlatform),
    [contents, activePlatform],
  );

  const currentVisual = useMemo(
    () => visuals.find((item) => item.platform === activePlatform),
    [visuals, activePlatform],
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>

            <div>
              <h1 className="text-lg font-semibold">Creating your campaign</h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Gemini is generating platform-specific content...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!brief) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/create")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition hover:bg-muted"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />

                <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  AI Content Studio
                </span>
              </div>

              <h1 className="mt-1 text-xl font-semibold">{brief.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}

              {regenerating ? "Regenerating..." : "Regenerate"}
            </button>

            {approved && (
              <button
                onClick={handleOpenPublisher}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
              >
                Publisher
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Campaign brief
              </p>

              <p className="mt-2 max-w-3xl text-sm leading-6">{brief.brief}</p>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <span className="rounded-full border border-border px-3 py-1 text-xs">
                {brief.language}
              </span>

              <span className="rounded-full border border-border px-3 py-1 text-xs">
                {brief.contentType}
              </span>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex flex-wrap gap-2">
            {brief.platforms.map((platform) => {
              const config =
                platformConfig[platform] ?? platformConfig.Instagram;

              const active = platform === activePlatform;

              return (
                <button
                  key={platform}
                  onClick={() => setActivePlatform(platform)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  {config.icon}
                  {config.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Generated creative</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Platform-specific visual direction
                </p>
              </div>

              <span className="rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {platformConfig[activePlatform]?.badge}
              </span>
            </div>

            {currentVisual ? (
              <VisualPoster visual={currentVisual} platform={activePlatform} />
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                No visual generated for this platform.
              </div>
            )}

            {currentVisual && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Composition
                  </p>

                  <p className="mt-1 text-xs leading-5">
                    {currentVisual.composition}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Background
                  </p>

                  <p className="mt-1 text-xs leading-5">
                    {currentVisual.background}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Platform copy</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Generated specifically for {activePlatform}
                </p>
              </div>

              <button
                onClick={() => {
                  if (!currentContent) return;

                  navigator.clipboard.writeText(
                    `${currentContent.headline}\n\n${currentContent.caption}\n\n${currentContent.hashtags.join(
                      " ",
                    )}\n\n${currentContent.cta}`,
                  );
                }}
                className="flex h-8 items-center gap-2 rounded-lg border border-border px-3 text-xs transition hover:bg-muted"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>

            {currentContent ? (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Headline
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold leading-tight">
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

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Call to action
                  </p>

                  <p className="mt-2 rounded-xl border border-border bg-muted/30 p-3 text-sm">
                    {currentContent.cta}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No copy generated for this platform.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  approved
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {approved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Clock3 className="h-4 w-4" />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {approved
                    ? "Content approved"
                    : "Approval required before publishing"}
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {approved
                    ? "This campaign is ready to move into the Publisher."
                    : "Review the generated copy and creative for each platform before scheduling."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {!approved ? (
                <button
                  onClick={handleApprove}
                  disabled={!contents.length || !visuals.length}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check className="h-4 w-4" />
                  Approve content
                </button>
              ) : (
                <button
                  onClick={handleOpenPublisher}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90"
                >
                  <Wand2 className="h-4 w-4" />
                  Continue to Publisher
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
