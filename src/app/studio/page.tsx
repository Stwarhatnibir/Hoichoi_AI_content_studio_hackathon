"use client";

import {
  ArrowLeft,
  Check,
  Copy,
  FileText,
  Globe,
  Image as ImageIcon,
  PlaySquare,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ContentBrief = {
  title: string;
  brief: string;
  language: string;
  contentType: string;
  platforms: string[];
};

type GeneratedContent = {
  platform: string;
  caption: string;
  headline: string;
  hashtags: string[];
  cta: string;
};

const fallbackBrief: ContentBrief = {
  title: "Untitled Campaign",
  brief: "",
  language: "Bengali",
  contentType: "Campaign",
  platforms: ["Instagram"],
};

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "YouTube") {
    return <PlaySquare className="h-4 w-4" />;
  }

  return <Globe className="h-4 w-4" />;
}

export default function StudioPage() {
  const router = useRouter();

  const [brief, setBrief] = useState<ContentBrief | null>(null);

  const [activePlatform, setActivePlatform] = useState("Instagram");

  const [isGenerating, setIsGenerating] = useState(false);

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>(
    [],
  );

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedBrief = localStorage.getItem("hoichoi-content-brief");

    if (!storedBrief) {
      setBrief(fallbackBrief);
      return;
    }

    try {
      const parsedBrief = JSON.parse(storedBrief) as ContentBrief;

      setBrief(parsedBrief);

      if (parsedBrief.platforms.length > 0) {
        setActivePlatform(parsedBrief.platforms[0]);
      }
    } catch {
      setBrief(fallbackBrief);
    }
  }, []);

  useEffect(() => {
    if (!brief) {
      return;
    }

    generatePreview(brief);
  }, [brief]);

  const generatePreview = (currentBrief: ContentBrief) => {
    setIsGenerating(true);

    window.setTimeout(() => {
      const results: GeneratedContent[] = currentBrief.platforms.map(
        (platform) => {
          if (platform === "Instagram") {
            return {
              platform,
              headline: currentBrief.title,
              caption:
                currentBrief.language === "Bengali"
                  ? `একটা গল্প, কিছু অনুভূতি আর অনেকটা অপেক্ষা। ${currentBrief.title} নিয়ে আসছে নতুন কিছু। চোখ রাখুন হইচই-তে।`
                  : `A story worth waiting for. ${currentBrief.title} is bringing something new. Stay tuned to hoichoi.`,
              hashtags: [
                "#hoichoi",
                "#BengaliContent",
                "#NewRelease",
                "#WatchNow",
              ],
              cta: "Watch on hoichoi",
            };
          }

          if (platform === "YouTube") {
            return {
              platform,
              headline: `${currentBrief.title} | Official`,
              caption:
                currentBrief.language === "Bengali"
                  ? `${currentBrief.title} সম্পর্কে সবকিছু জানতে ভিডিওটি দেখুন। গল্প, চরিত্র এবং নতুন আপডেট—সব একসঙ্গে।`
                  : `Everything you need to know about ${currentBrief.title}. Discover the story, characters and latest updates.`,
              hashtags: ["#hoichoi", "#BengaliSeries", "#Official"],
              cta: "Watch the full video",
            };
          }

          return {
            platform,
            headline: currentBrief.title,
            caption:
              currentBrief.language === "Bengali"
                ? `${currentBrief.title} নিয়ে আমাদের নতুন আপডেট। গল্পটি আপনার বন্ধুদের সঙ্গে শেয়ার করুন এবং আলোচনায় যোগ দিন।`
                : `Here is the latest update about ${currentBrief.title}. Share it with your friends and join the conversation.`,
            hashtags: ["#hoichoi", "#BengaliEntertainment", "#Streaming"],
            cta: "Learn more",
          };
        },
      );

      setGeneratedContent(results);
      setIsGenerating(false);
    }, 900);
  };

  const regenerate = () => {
    if (!brief) {
      return;
    }

    generatePreview(brief);
  };

  const currentContent = generatedContent.find(
    (item) => item.platform === activePlatform,
  );

  const copyCaption = async () => {
    if (!currentContent) {
      return;
    }

    const text = `${currentContent.headline}\n\n${currentContent.caption}\n\n${currentContent.hashtags.join(
      " ",
    )}\n\n${currentContent.cta}`;

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!brief) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Sparkles className="mx-auto h-8 w-8 animate-pulse" />

          <p className="mt-3 text-sm text-muted-foreground">
            Loading AI Studio...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <button
              onClick={() => router.push("/create")}
              className="mb-5 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to brief
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">
                    AI Generation Studio
                  </h1>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                    Preview
                  </span>
                </div>

                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Generate and review platform-specific creative content from
                  one brief.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={regenerate}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
            />
            Regenerate all
          </button>
        </div>

        {/* Brief summary */}
        <section className="mb-6 rounded-2xl border bg-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Campaign
              </p>

              <h2 className="mt-1 text-xl font-semibold">{brief.title}</h2>

              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {brief.brief || "No campaign description provided."}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <span className="rounded-full bg-muted px-3 py-1.5 text-xs">
                {brief.language}
              </span>

              <span className="rounded-full bg-muted px-3 py-1.5 text-xs">
                {brief.contentType}
              </span>
            </div>
          </div>
        </section>

        {/* Studio */}
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Platform navigation */}
          <aside className="rounded-2xl border bg-card p-3">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Platforms
            </p>

            <div className="mt-2 space-y-1">
              {brief.platforms.map((platform) => {
                const selected = platform === activePlatform;

                return (
                  <button
                    key={platform}
                    onClick={() => setActivePlatform(platform)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <PlatformIcon platform={platform} />

                    {platform}
                  </button>
                );
              })}
            </div>

            <div className="my-4 border-t" />

            <div className="rounded-xl bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />

                <p className="text-xs font-medium">Generation status</p>
              </div>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {isGenerating
                  ? "Generating platform-specific content..."
                  : "Content generated and ready for review."}
              </p>
            </div>
          </aside>

          {/* Content workspace */}
          <section className="min-w-0 rounded-2xl border bg-card">
            <div className="border-b p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{activePlatform} content</h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    AI-generated content tailored for this platform.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCaption}
                    disabled={!currentContent}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}

                    {copied ? "Copied" : "Copy"}
                  </button>

                  <button
                    onClick={regenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isGenerating ? "animate-spin" : ""
                      }`}
                    />
                    Regenerate
                  </button>
                </div>
              </div>
            </div>

            {isGenerating ? (
              <div className="flex min-h-[500px] items-center justify-center p-8">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>

                  <h3 className="mt-5 font-semibold">
                    Creating platform-specific content
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    The AI is adapting tone, length, CTA and hashtags.
                  </p>
                </div>
              </div>
            ) : currentContent ? (
              <div className="grid gap-6 p-6 xl:grid-cols-[1fr_320px]">
                {/* Copy */}
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Headline
                    </label>

                    <div className="rounded-xl border bg-background p-4">
                      <p className="text-lg font-semibold">
                        {currentContent.headline}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Caption
                    </label>

                    <div className="min-h-48 rounded-xl border bg-background p-5">
                      <p className="whitespace-pre-wrap text-sm leading-7">
                        {currentContent.caption}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Hashtags
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {currentContent.hashtags.map((hashtag) => (
                        <span
                          key={hashtag}
                          className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium"
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Call to action
                    </label>

                    <div className="rounded-xl border bg-background p-4">
                      <p className="text-sm font-medium">
                        {currentContent.cta}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Creative preview */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Creative preview
                  </label>

                  <div className="overflow-hidden rounded-2xl border bg-muted">
                    <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-muted to-background">
                      <div className="p-8 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                          <ImageIcon className="h-6 w-6" />
                        </div>

                        <p className="mt-5 text-sm font-semibold">
                          AI creative
                        </p>

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          Image generation will be connected in the next stage.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border bg-muted/30 p-4">
                    <p className="text-xs font-semibold">Platform adaptation</p>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      This version is generated specifically for{" "}
                      {activePlatform}. It is not a translated or relabeled
                      version of another platform asset.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[500px] items-center justify-center p-8">
                <div className="text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />

                  <p className="mt-4 text-sm font-medium">
                    No generated content
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Try generating the campaign again.
                  </p>
                </div>
              </div>
            )}

            {/* Approval */}
            <div className="border-t bg-muted/20 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    Human approval required
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Content cannot enter the publishing queue until it has been
                    explicitly approved.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted">
                    Discard
                  </button>

                  <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                    <Check className="h-4 w-4" />
                    Approve content
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
