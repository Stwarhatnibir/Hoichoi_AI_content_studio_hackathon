"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

type Platform = "Instagram" | "YouTube" | "Facebook";
type ContentType = "Show Launch" | "Episode Promo" | "Brand Campaign";

type NextBrief = {
  direction: string;
  objective: string;
  creativeDirection: string;
  platformFocus: string[];
  suggestedHook: string;
};

function CreateCampaignForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [language, setLanguage] = useState("Bengali");
  const [contentType, setContentType] = useState<ContentType>("Show Launch");
  const [platforms, setPlatforms] = useState<Platform[]>([
    "Instagram",
    "YouTube",
    "Facebook",
  ]);
  const [fromReport, setFromReport] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const from = searchParams.get("from");

    if (from !== "report") {
      return;
    }

    const stored = localStorage.getItem("hoichoi-next-brief-insights");

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);

      const nextBrief: NextBrief = parsed?.nextBrief ?? parsed;

      if (nextBrief.direction) {
        setBrief(nextBrief.direction);
      }

      if (nextBrief.objective) {
        setBrief((current) => {
          if (!current) {
            return nextBrief.objective;
          }

          return `${current}\n\nObjective: ${nextBrief.objective}`;
        });
      }

      if (nextBrief.creativeDirection) {
        setBrief((current) => {
          if (!current) {
            return nextBrief.creativeDirection;
          }

          return `${current}\n\nCreative direction: ${nextBrief.creativeDirection}`;
        });
      }

      if (nextBrief.suggestedHook) {
        setBrief((current) => {
          if (!current) {
            return nextBrief.suggestedHook;
          }

          return `${current}\n\nSuggested hook: ${nextBrief.suggestedHook}`;
        });
      }

      if (Array.isArray(nextBrief.platformFocus)) {
        const validPlatforms = nextBrief.platformFocus.filter(
          (platform): platform is Platform =>
            platform === "Instagram" ||
            platform === "YouTube" ||
            platform === "Facebook",
        );

        if (validPlatforms.length > 0) {
          setPlatforms(validPlatforms);
        }
      }

      setFromReport(true);
    } catch {
      localStorage.removeItem("hoichoi-next-brief-insights");
    }
  }, [searchParams]);

  const togglePlatform = (platform: Platform) => {
    setPlatforms((current) => {
      if (current.includes(platform)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((item) => item !== platform);
      }

      return [...current, platform];
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a campaign title.");
      return;
    }

    if (!brief.trim()) {
      setError("Please enter a campaign brief.");
      return;
    }

    if (platforms.length === 0) {
      setError("Please select at least one platform.");
      return;
    }

    const campaign = {
      title: title.trim(),
      brief: brief.trim(),
      language,
      contentType,
      platforms,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("hoichoi-content-brief", JSON.stringify(campaign));

    localStorage.removeItem("hoichoi-generated-contents");
    localStorage.removeItem("hoichoi-generated-visuals");
    localStorage.removeItem("hoichoi-generated-for-brief");
    localStorage.removeItem("hoichoi-content-approved");
    localStorage.removeItem("hoichoi-content-approved-at");

    router.push("/studio");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI Content Studio
          </div>

          <h1 className="text-4xl font-semibold tracking-tight">
            Create Campaign
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Turn a single campaign brief into platform-tailored creative content
            for your selected channels.
          </p>

          {fromReport && (
            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <span className="font-medium">AI Report insights applied.</span>{" "}
              Your next campaign brief has been pre-filled from the previous
              performance report.
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border bg-card p-6 shadow-sm md:p-8"
        >
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Campaign title
            </label>

            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Kobita — New Show Launch"
              className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="brief" className="text-sm font-medium">
              Campaign brief
            </label>

            <textarea
              id="brief"
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              placeholder="Describe what you want to communicate..."
              rows={7}
              className="w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <p className="text-xs text-muted-foreground">
              Describe the campaign idea, message, mood, audience, or creative
              direction. The AI will transform the brief into platform-specific
              content.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium">
                Language
              </label>

              <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none"
              >
                <option value="Bengali">Bengali</option>
                <option value="English">English</option>
                <option value="Bengali + English">Bengali + English</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="contentType" className="text-sm font-medium">
                Content type
              </label>

              <select
                id="contentType"
                value={contentType}
                onChange={(event) =>
                  setContentType(event.target.value as ContentType)
                }
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none"
              >
                <option value="Show Launch">Show Launch</option>
                <option value="Episode Promo">Episode Promo</option>
                <option value="Brand Campaign">Brand Campaign</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Platforms</label>

            <div className="grid gap-3 md:grid-cols-3">
              {(["Instagram", "YouTube", "Facebook"] as Platform[]).map(
                (platform) => {
                  const selected = platforms.includes(platform);

                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`rounded-xl border px-4 py-4 text-left transition ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="font-medium">{platform}</div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        {selected ? "Selected" : "Not selected"}
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              Generate Campaign
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-sm text-muted-foreground">
            Loading campaign builder...
          </div>
        </main>
      }
    >
      <CreateCampaignForm />
    </Suspense>
  );
}
