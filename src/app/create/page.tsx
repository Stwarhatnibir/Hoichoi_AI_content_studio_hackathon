"use client";

import { ArrowLeft, Check, Globe, PlaySquare, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ContentBrief = {
  title: string;
  brief: string;
  language: string;
  contentType: string;
  platforms: string[];
};

const availablePlatforms = [
  {
    name: "Instagram",
    description: "Visual-first copy, hashtags and CTA",
    icon: Globe,
  },
  {
    name: "YouTube",
    description: "Title, description and viewer-focused copy",
    icon: PlaySquare,
  },
  {
    name: "Facebook",
    description: "Conversation-driven copy and engagement CTA",
    icon: Globe,
  },
];

export default function CreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [language, setLanguage] = useState("Bengali");
  const [contentType, setContentType] = useState("Campaign");

  const [platforms, setPlatforms] = useState<string[]>(["Instagram"]);

  const [error, setError] = useState("");

  const togglePlatform = (platform: string) => {
    setPlatforms((current) => {
      if (current.includes(platform)) {
        return current.filter((item) => item !== platform);
      }

      return [...current, platform];
    });

    setError("");
  };

  const handleGenerate = () => {
    if (!title.trim()) {
      setError("Please enter a campaign title.");
      return;
    }

    if (!brief.trim()) {
      setError("Please describe your content brief.");
      return;
    }

    if (platforms.length === 0) {
      setError("Select at least one target platform.");
      return;
    }

    const contentBrief: ContentBrief = {
      title: title.trim(),
      brief: brief.trim(),
      language,
      contentType,
      platforms,
    };

    localStorage.setItem("hoichoi-content-brief", JSON.stringify(contentBrief));

    router.push("/studio");
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Create content brief
              </h1>

              <p className="mt-2 text-muted-foreground">
                Give the AI enough context to create platform-specific content
                for your campaign.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Campaign details */}
          <section className="rounded-2xl border bg-card p-6">
            <div className="mb-6">
              <h2 className="font-semibold">Campaign details</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Start with the basic information about your content.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium"
                >
                  Campaign title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setError("");
                  }}
                  placeholder="Example: Durga Puja 2026 Campaign"
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="brief"
                  className="mb-2 block text-sm font-medium"
                >
                  Content brief
                </label>

                <textarea
                  id="brief"
                  value={brief}
                  onChange={(event) => {
                    setBrief(event.target.value);
                    setError("");
                  }}
                  placeholder="Describe what you want to communicate. Include the title, story, audience, campaign goal, tone, key message, CTA and any important context..."
                  rows={8}
                  className="w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>
                    Give the AI enough context to understand the campaign.
                  </span>

                  <span>{brief.length} characters</span>
                </div>
              </div>
            </div>
          </section>

          {/* AI preferences */}
          <section className="rounded-2xl border bg-card p-6">
            <div className="mb-6">
              <h2 className="font-semibold">AI generation preferences</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Tell the system how the content should be generated.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="language"
                  className="mb-2 block text-sm font-medium"
                >
                  Primary language
                </label>

                <select
                  id="language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option>Bengali</option>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Mixed Bengali + English</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contentType"
                  className="mb-2 block text-sm font-medium"
                >
                  Content type
                </label>

                <select
                  id="contentType"
                  value={contentType}
                  onChange={(event) => setContentType(event.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option>Campaign</option>
                  <option>Series announcement</option>
                  <option>Episode promotion</option>
                  <option>Trailer promotion</option>
                  <option>Festival campaign</option>
                  <option>Engagement post</option>
                </select>
              </div>
            </div>
          </section>

          {/* Platforms */}
          <section className="rounded-2xl border bg-card p-6">
            <div className="mb-6">
              <h2 className="font-semibold">Target platforms</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                The AI will generate meaningfully different content for each
                selected platform.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {availablePlatforms.map((platform) => {
                const selected = platforms.includes(platform.name);
                const Icon = platform.icon;

                return (
                  <button
                    key={platform.name}
                    type="button"
                    onClick={() => togglePlatform(platform.name)}
                    className={`rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <span className="font-medium">{platform.name}</span>
                      </div>

                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3" />}
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-muted-foreground">
                      {platform.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Next step information */}
          <section className="rounded-2xl border bg-muted/30 p-5">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="text-sm font-medium">What happens next?</p>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  The AI will create platform-specific copy and creative
                  directions from this brief. You will be able to review,
                  regenerate and approve each asset before publishing.
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-lg border px-5 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              Continue to AI Studio
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
