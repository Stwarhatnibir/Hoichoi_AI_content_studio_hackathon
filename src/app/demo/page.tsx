"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Database,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const campaignId = "demo-kobita-2026";
const createdAt = "2026-09-26T09:00:00.000Z";

const brief = {
  campaignId,
  title: "Kobita Ã¢â‚¬â€ Monsoon Stories",
  brief:
    "Promote Kobita with an emotional Bengali-first campaign built around monsoon memories, intimate storytelling and a premium cinematic mood.",
  language: "Bengali + English",
  contentType: "Show Launch",
  platforms: ["Instagram", "YouTube", "Facebook"],
  createdAt,
};

const contents = [
  {
    platform: "Instagram",
    headline: "Ã Â¦Â¬Ã Â§Æ’Ã Â¦Â·Ã Â§ÂÃ Â¦Å¸Ã Â¦Â¿Ã Â¦Â° Ã Â¦Â°Ã Â¦Â¾Ã Â¦Â¤Ã Â§â€¡ Ã Â¦â€¢Ã Â¦Â¿Ã Â¦â€ºÃ Â§Â Ã Â¦â€”Ã Â¦Â²Ã Â§ÂÃ Â¦Âª Ã Â¦Â¬Ã Â¦Â²Ã Â¦Â¾ Ã Â¦Â¹Ã Â¦Â¯Ã Â¦Â¼ Ã Â¦Â¨Ã Â¦Â¾, Ã Â¦â€¦Ã Â¦Â¨Ã Â§ÂÃ Â¦Â­Ã Â¦Â¬ Ã Â¦â€¢Ã Â¦Â°Ã Â¦Â¾ Ã Â¦Â¹Ã Â¦Â¯Ã Â¦Â¼Ã Â¥Â¤",
    caption:
      "Ã Â¦â€¢Ã Â¦Â¿Ã Â¦â€ºÃ Â§Â Ã Â¦â€”Ã Â¦Â²Ã Â§ÂÃ Â¦Âª Ã Â¦Â¬Ã Â§Æ’Ã Â¦Â·Ã Â§ÂÃ Â¦Å¸Ã Â¦Â¿Ã Â¦Â° Ã Â¦Â®Ã Â¦Â¤Ã Â§â€¹Ã¢â‚¬â€Ã Â¦Å¡Ã Â§ÂÃ Â¦ÂªÃ Â¦Å¡Ã Â¦Â¾Ã Â¦Âª Ã Â¦â€ Ã Â¦Â¸Ã Â§â€¡, Ã Â¦Â¤Ã Â¦Â¾Ã Â¦Â°Ã Â¦ÂªÃ Â¦Â° Ã Â¦Â®Ã Â¦Â¨Ã Â¦Å¸Ã Â¦Â¾ Ã Â¦Â­Ã Â¦Â¿Ã Â¦Å“Ã Â¦Â¿Ã Â¦Â¯Ã Â¦Â¼Ã Â§â€¡ Ã Â¦Â¦Ã Â¦Â¿Ã Â¦Â¯Ã Â¦Â¼Ã Â§â€¡ Ã Â¦Â¯Ã Â¦Â¾Ã Â¦Â¯Ã Â¦Â¼Ã Â¥Â¤ Ã¢Ëœâ€\n\nKobita Ã¢â‚¬â€ Monsoon Stories. Ã Â¦ÂÃ Â¦Â¬Ã Â¦Â¾Ã Â¦Â° Ã Â¦â€”Ã Â¦Â²Ã Â§ÂÃ Â¦ÂªÃ Â¦Å¸Ã Â¦Â¾ Ã Â¦â€ Ã Â¦ÂªÃ Â¦Â¨Ã Â¦Â¾Ã Â¦Â°Ã Â¦â€œ Ã Â¦Â¹Ã Â¦Â¤Ã Â§â€¡ Ã Â¦ÂªÃ Â¦Â¾Ã Â¦Â°Ã Â§â€¡Ã Â¥Â¤",
    hashtags: ["#Kobita", "#Hoichoi", "#BengaliStories", "#MonsoonStories"],
    cta: "Watch on hoichoi",
  },
  {
    platform: "YouTube",
    headline: "Kobita Ã¢â‚¬â€ Monsoon Stories | Official Campaign Film",
    caption:
      "A cinematic introduction to Kobita, built around monsoon memories, quiet emotions and Bengali storytelling. Watch the campaign film and discover the world of Kobita.",
    hashtags: ["#Kobita", "#Hoichoi", "#BengaliSeries"],
    cta: "Watch the campaign film",
  },
  {
    platform: "Facebook",
    headline: "Ã Â¦â€¢Ã Â¦Â¿Ã Â¦â€ºÃ Â§Â Ã Â¦Â¬Ã Â§Æ’Ã Â¦Â·Ã Â§ÂÃ Â¦Å¸Ã Â¦Â¿ Ã Â¦Â¶Ã Â§ÂÃ Â¦Â§Ã Â§Â Ã Â¦Å“Ã Â¦Â¾Ã Â¦Â¨Ã Â¦Â²Ã Â¦Â¾ Ã Â¦Â­Ã Â§â€¡Ã Â¦Å“Ã Â¦Â¾Ã Â¦Â¯Ã Â¦Â¼ Ã Â¦Â¨Ã Â¦Â¾Ã Â¥Â¤",
    caption:
      "Ã Â¦ÂÃ Â¦â€¢Ã Â¦Å¸Ã Â¦Â¾ Ã Â¦ÂªÃ Â§ÂÃ Â¦Â°Ã Â¦Â¨Ã Â§â€¹ Ã Â¦â€”Ã Â¦Â¾Ã Â¦Â¨, Ã Â¦Â­Ã Â§â€¡Ã Â¦Å“Ã Â¦Â¾ Ã Â¦Â°Ã Â¦Â¾Ã Â¦Â¸Ã Â§ÂÃ Â¦Â¤Ã Â¦Â¾, Ã Â¦â€ Ã Â¦Â° Ã Â¦Â®Ã Â¦Â¨Ã Â§â€¡ Ã Â¦ÂªÃ Â¦Â¡Ã Â¦Â¼Ã Â§â€¡ Ã Â¦Â¯Ã Â¦Â¾Ã Â¦â€œÃ Â¦Â¯Ã Â¦Â¼Ã Â¦Â¾ Ã Â¦ÂÃ Â¦â€¢Ã Â¦Å¸Ã Â¦Â¾ Ã Â¦â€”Ã Â¦Â²Ã Â§ÂÃ Â¦ÂªÃ Â¥Â¤ Kobita Ã Â¦Â¸Ã Â§â€¡Ã Â¦â€¡ Ã Â¦â€¦Ã Â¦Â¨Ã Â§ÂÃ Â¦Â­Ã Â§â€šÃ Â¦Â¤Ã Â¦Â¿Ã Â¦â€”Ã Â§ÂÃ Â¦Â²Ã Â§â€¹Ã Â¦Â° Ã Â¦â€¢Ã Â¦Â¾Ã Â¦â€ºÃ Â§â€¡Ã Â¦â€¡ Ã Â¦Â«Ã Â¦Â¿Ã Â¦Â°Ã Â§â€¡ Ã Â¦Â¯Ã Â¦Â¾Ã Â¦Â¯Ã Â¦Â¼Ã Â¥Â¤\n\nÃ Â¦â€ Ã Â¦Å“Ã Â¦â€¢Ã Â§â€¡Ã Â¦Â° Ã Â¦â€”Ã Â¦Â²Ã Â§ÂÃ Â¦ÂªÃ Â¦Å¸Ã Â¦Â¾ Ã Â¦â€ Ã Â¦ÂªÃ Â¦Â¨Ã Â¦Â¾Ã Â¦Â° Ã Â¦Â¸Ã Â¦â„¢Ã Â§ÂÃ Â¦â€”Ã Â§â€¡ Ã Â¦Â­Ã Â¦Â¾Ã Â¦â€” Ã Â¦â€¢Ã Â¦Â°Ã Â§â€¡ Ã Â¦Â¨Ã Â¦Â¿Ã Â¦Â¨Ã Â¥Â¤",
    hashtags: ["#Kobita", "#Hoichoi", "#MonsoonStories"],
    cta: "Explore Kobita",
  },
];

const visuals = [
  {
    platform: "Instagram",
    visualConcept:
      "Square 1:1 editorial portrait with a rain-covered window and intimate Bengali cinematic mood.",
    mood: "Emotional, intimate, premium",
    composition: "1:1 square",
    background: "Soft monsoon window bokeh",
    accent: "Warm amber practical light",
    foreground: "Character silhouette beside the window",
    decorativeElements: [
      "Rain droplets",
      "Film grain",
      "Subtle Bengali typography",
    ],
    visualText: "Ã Â¦Â¬Ã Â§Æ’Ã Â¦Â·Ã Â§ÂÃ Â¦Å¸Ã Â¦Â¿Ã Â¦Â° Ã Â¦Â°Ã Â¦Â¾Ã Â¦Â¤Ã Â§â€¡ Ã Â¦â€”Ã Â¦Â²Ã Â§ÂÃ Â¦ÂªÃ Â§â€¡Ã Â¦Â°Ã Â¦Â¾ Ã Â¦Å“Ã Â§â€¡Ã Â¦â€”Ã Â§â€¡ Ã Â¦â€œÃ Â¦Â Ã Â§â€¡",
  },
  {
    platform: "YouTube",
    visualConcept:
      "Wide 16:9 cinematic campaign frame designed like a premium trailer thumbnail.",
    mood: "Cinematic, mysterious, atmospheric",
    composition: "16:9 landscape",
    background: "Deep monsoon city street",
    accent: "Cool blue rain with warm window highlights",
    foreground: "Central character framed against the street",
    decorativeElements: ["Rain streaks", "Cinematic depth", "Title lockup"],
    visualText: "KOBITA Ã¢â‚¬â€ MONSOON STORIES",
  },
  {
    platform: "Facebook",
    visualConcept:
      "Portrait 4:5 social poster balancing emotional character framing with readable campaign typography.",
    mood: "Warm, nostalgic, human",
    composition: "4:5 portrait",
    background: "Monsoon evening interior",
    accent: "Warm yellow window light",
    foreground: "Character with handwritten-note prop",
    decorativeElements: [
      "Paper texture",
      "Rain reflections",
      "Bengali headline",
    ],
    visualText: "Ã Â¦â€¢Ã Â¦Â¿Ã Â¦â€ºÃ Â§Â Ã Â¦â€”Ã Â¦Â²Ã Â§ÂÃ Â¦Âª Ã Â¦Â®Ã Â¦Â¨Ã Â§â€¡ Ã Â¦Â¥Ã Â§â€¡Ã Â¦â€¢Ã Â§â€¡ Ã Â¦Â¯Ã Â¦Â¾Ã Â¦Â¯Ã Â¦Â¼",
  },
];

const posts = [
  {
    id: "IG-DEMO-KOBITA",
    campaignId,
    campaignTitle: brief.title,
    platform: "Instagram",
    headline: contents[0].headline,
    scheduledAt: "2026-09-24T18:30:00.000Z",
    status: "published",
    createdAt: "2026-09-24T10:00:00.000Z",
  },
  {
    id: "YT-DEMO-KOBITA",
    campaignId,
    campaignTitle: brief.title,
    platform: "YouTube",
    headline: contents[1].headline,
    scheduledAt: "2026-09-24T20:00:00.000Z",
    status: "published",
    createdAt: "2026-09-24T10:05:00.000Z",
  },
  {
    id: "FB-DEMO-KOBITA",
    campaignId,
    campaignTitle: brief.title,
    platform: "Facebook",
    headline: contents[2].headline,
    scheduledAt: "2026-09-25T12:00:00.000Z",
    status: "published",
    createdAt: "2026-09-25T09:00:00.000Z",
  },
];

const analytics = [
  {
    postId: "IG-DEMO-KOBITA",
    campaignId,
    platform: "Instagram",
    impressions: 18400,
    reach: 12900,
    likes: 1040,
    comments: 86,
    shares: 214,
    clicks: 510,
    saves: 326,
    engagementRate: 12.91,
    clickThroughRate: 2.77,
    updatedAt: "2026-09-26T08:00:00.000Z",
  },
  {
    postId: "YT-DEMO-KOBITA",
    campaignId,
    platform: "YouTube",
    impressions: 31200,
    reach: 24100,
    likes: 2180,
    comments: 173,
    shares: 401,
    clicks: 1680,
    saves: 0,
    engagementRate: 11.43,
    clickThroughRate: 5.38,
    updatedAt: "2026-09-26T08:00:00.000Z",
  },
  {
    postId: "FB-DEMO-KOBITA",
    campaignId,
    platform: "Facebook",
    impressions: 14600,
    reach: 10200,
    likes: 710,
    comments: 92,
    shares: 188,
    clicks: 430,
    saves: 0,
    engagementRate: 9.71,
    clickThroughRate: 2.95,
    updatedAt: "2026-09-26T08:00:00.000Z",
  },
];

const report = {
  campaignId,
  generatedAt: "2026-09-26T08:30:00.000Z",
  summary:
    "The campaign generated the strongest response on video-led storytelling, while Instagram showed strong save and share behaviour around emotional Bengali creative.",
  keyInsights: [
    {
      insight:
        "The YouTube campaign film produced the highest reach and click-through response in this campaign dataset.",
      evidencePostIds: ["YT-DEMO-KOBITA"],
      metrics: { reach: 24100, clickThroughRate: "5.38%" },
    },
    {
      insight:
        "Instagram creative generated strong save and share behaviour, indicating resonance with the emotional monsoon theme.",
      evidencePostIds: ["IG-DEMO-KOBITA"],
      metrics: { saves: 326, shares: 214, engagementRate: "12.91%" },
    },
  ],
  platformInsights: [
    {
      platform: "Instagram",
      insight:
        "Keep the intimate Bengali-first visual language and emotional hooks.",
      evidencePostIds: ["IG-DEMO-KOBITA"],
    },
    {
      platform: "YouTube",
      insight:
        "Continue cinematic video storytelling and stronger watch-oriented hooks.",
      evidencePostIds: ["YT-DEMO-KOBITA"],
    },
    {
      platform: "Facebook",
      insight:
        "Retain nostalgic copy but make the opening line more immediately actionable.",
      evidencePostIds: ["FB-DEMO-KOBITA"],
    },
  ],
  recommendations: [
    "Lead the next campaign with a cinematic story hook.",
    "Preserve Bengali-first emotional framing on Instagram.",
    "Use a stronger opening line on Facebook.",
  ],
  nextBrief: {
    direction:
      "Build the next Kobita campaign around a character-driven monsoon memory.",
    objective:
      "Increase qualified engagement and traffic while preserving emotional storytelling.",
    creativeDirection:
      "Use intimate rain-soaked visuals, a cinematic reveal and a short Bengali hook before the English support line.",
    platformFocus: ["YouTube", "Instagram", "Facebook"],
    suggestedHook: "Ã Â¦Â¬Ã Â§Æ’Ã Â¦Â·Ã Â§ÂÃ Â¦Å¸Ã Â¦Â¿ Ã Â¦Â¥Ã Â§â€¡Ã Â¦Â®Ã Â§â€¡ Ã Â¦â€”Ã Â§â€¡Ã Â¦Â²Ã Â§â€¡Ã Â¦â€œ Ã Â¦â€¢Ã Â¦Â¿Ã Â¦â€ºÃ Â§Â Ã Â¦â€”Ã Â¦Â²Ã Â§ÂÃ Â¦Âª Ã Â¦Â¥Ã Â¦Â¾Ã Â¦Â®Ã Â§â€¡ Ã Â¦Â¨Ã Â¦Â¾Ã Â¥Â¤",
  },
};

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadDemo() {
  save("hoichoi-content-brief", brief);
  save("hoichoi-generated-contents", contents);
  save("hoichoi-generated-visuals", visuals);
  save("hoichoi-generated-for-brief", brief);
  localStorage.setItem("hoichoi-content-approved", "true");
  localStorage.setItem(
    "hoichoi-content-approved-at",
    "2026-09-24T09:30:00.000Z",
  );

  const existingPosts = JSON.parse(
    localStorage.getItem("hoichoi-scheduled-posts") || "[]",
  );
  const withoutDemo = Array.isArray(existingPosts)
    ? existingPosts.filter(
        (item: { campaignId?: string }) => item?.campaignId !== campaignId,
      )
    : [];
  save("hoichoi-scheduled-posts", [...posts, ...withoutDemo]);

  const existingAnalytics = JSON.parse(
    localStorage.getItem("hoichoi-analytics") || "[]",
  );
  const withoutDemoAnalytics = Array.isArray(existingAnalytics)
    ? existingAnalytics.filter(
        (item: { campaignId?: string }) => item?.campaignId !== campaignId,
      )
    : [];
  save("hoichoi-analytics", [...analytics, ...withoutDemoAnalytics]);

  save("hoichoi-weekly-report", report);
  save("hoichoi-next-brief-insights", report.nextBrief);
  save("hoichoi-report-feedback-source", {
    usedAt: new Date().toISOString(),
    campaignId,
    report,
  });
  localStorage.setItem("hoichoi-campaign-changed", Date.now().toString());
  window.dispatchEvent(new Event("hoichoi-campaign-changed"));
}

function resetDemo() {
  const keys = [
    "hoichoi-generated-contents",
    "hoichoi-generated-visuals",
    "hoichoi-generated-for-brief",
    "hoichoi-content-approved",
    "hoichoi-content-approved-at",
    "hoichoi-weekly-report",
    "hoichoi-next-brief-insights",
    "hoichoi-report-feedback-source",
  ];
  keys.forEach((key) => localStorage.removeItem(key));

  const posts = JSON.parse(
    localStorage.getItem("hoichoi-scheduled-posts") || "[]",
  );
  const analyticsRecords = JSON.parse(
    localStorage.getItem("hoichoi-analytics") || "[]",
  );
  save(
    "hoichoi-scheduled-posts",
    Array.isArray(posts)
      ? posts.filter(
          (item: { campaignId?: string }) => item?.campaignId !== campaignId,
        )
      : [],
  );
  save(
    "hoichoi-analytics",
    Array.isArray(analyticsRecords)
      ? analyticsRecords.filter(
          (item: { campaignId?: string }) => item?.campaignId !== campaignId,
        )
      : [],
  );
  localStorage.removeItem("hoichoi-content-brief");
  localStorage.setItem("hoichoi-campaign-changed", Date.now().toString());
  window.dispatchEvent(new Event("hoichoi-campaign-changed"));
}

export default function DemoPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  function handleLoad() {
    loadDemo();
    setMessage("Full demo campaign loaded. Opening the command centerÃ¢â‚¬Â¦");
    setTimeout(() => router.push("/"), 500);
  }

  function handleReset() {
    resetDemo();
    setMessage(
      "Demo data cleared. Your other campaigns and historical records were preserved.",
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center px-6 py-12">
        <section className="w-full rounded-3xl border bg-white p-8 shadow-sm md:p-12">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
            <Sparkles className="h-6 w-6" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Hackathon Demo Control
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            AI Content Studio Demo Mode
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500 md:text-base">
            Load a deterministic end-to-end campaign without calling Gemini. It
            seeds the brief, platform-tailored content, approval, multi-platform
            publishing, analytics, AI report and next-brief feedback loop.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              "Brief Ã¢â€ â€™ AI Studio",
              "Approval Ã¢â€ â€™ Publishing",
              "Analytics Ã¢â€ â€™ AI Report Ã¢â€ â€™ Next Brief",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border bg-zinc-50 p-4 text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleLoad}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              <Play className="h-4 w-4" /> Load full demo
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
            >
              <RotateCcw className="h-4 w-4" /> Reset demo data
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
            >
              <Database className="h-4 w-4" /> Open dashboard
            </button>
          </div>

          {message && (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="mt-10 border-t pt-6 text-xs leading-5 text-zinc-500">
            Demo campaign:{" "}
            <span className="font-medium text-zinc-700">{brief.title}</span>.
            Demo data uses the same localStorage contracts as the existing
            application and does not require any API call.
          </div>
        </section>
      </div>
    </main>
  );
}
