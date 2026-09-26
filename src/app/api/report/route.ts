import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

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
  updatedAt?: string;
};

type ScheduledPost = {
  id: string;
  campaignId?: string;
  campaignTitle: string;
  platform: string;
  headline: string;
  scheduledAt: string;
  status: "scheduled" | "published";
  createdAt?: string;
};

type ReportInsight = {
  insight: string;
  evidencePostIds: string[];
  metrics: Record<string, number | string>;
};

type PlatformInsight = {
  platform: string;
  insight: string;
  evidencePostIds: string[];
};

type ParsedReport = {
  keyInsights?: ReportInsight[];
  platformInsights?: PlatformInsight[];
  nextBrief?: {
    platformFocus?: string | string[];
  };
  campaignId?: string;
  [key: string]: unknown;
};

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const responseSchema = {
  type: Type.OBJECT,

  properties: {
    summary: {
      type: Type.STRING,
    },

    keyInsights: {
      type: Type.ARRAY,

      items: {
        type: Type.OBJECT,

        properties: {
          insight: {
            type: Type.STRING,
          },

          evidencePostIds: {
            type: Type.ARRAY,

            items: {
              type: Type.STRING,
            },
          },

          metrics: {
            type: Type.OBJECT,

            properties: {
              impressions: {
                type: Type.NUMBER,
              },

              reach: {
                type: Type.NUMBER,
              },

              likes: {
                type: Type.NUMBER,
              },

              comments: {
                type: Type.NUMBER,
              },

              shares: {
                type: Type.NUMBER,
              },

              clicks: {
                type: Type.NUMBER,
              },

              saves: {
                type: Type.NUMBER,
              },

              engagementRate: {
                type: Type.NUMBER,
              },

              clickThroughRate: {
                type: Type.NUMBER,
              },
            },

            required: [],
          },
        },

        required: ["insight", "evidencePostIds", "metrics"],
      },
    },

    platformInsights: {
      type: Type.ARRAY,

      items: {
        type: Type.OBJECT,

        properties: {
          platform: {
            type: Type.STRING,
          },

          insight: {
            type: Type.STRING,
          },

          evidencePostIds: {
            type: Type.ARRAY,

            items: {
              type: Type.STRING,
            },
          },
        },

        required: ["platform", "insight", "evidencePostIds"],
      },
    },

    recommendations: {
      type: Type.ARRAY,

      items: {
        type: Type.STRING,
      },
    },

    nextBrief: {
      type: Type.OBJECT,

      properties: {
        direction: {
          type: Type.STRING,
        },

        objective: {
          type: Type.STRING,
        },

        creativeDirection: {
          type: Type.STRING,
        },

        platformFocus: {
          type: Type.ARRAY,

          items: {
            type: Type.STRING,
          },
        },

        suggestedHook: {
          type: Type.STRING,
        },
      },

      required: [
        "direction",
        "objective",
        "creativeDirection",
        "platformFocus",
        "suggestedHook",
      ],
    },
  },

  required: [
    "summary",
    "keyInsights",
    "platformInsights",
    "recommendations",
    "nextBrief",
  ],
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const campaignId =
      typeof body.campaignId === "string" ? body.campaignId.trim() : "";

    const analytics = body.analytics as AnalyticsRecord[];

    const posts = body.posts as ScheduledPost[];

    if (!campaignId) {
      return NextResponse.json(
        {
          error:
            "Campaign ID is required to generate a campaign-scoped report.",
        },
        {
          status: 400,
        },
      );
    }

    if (!Array.isArray(analytics)) {
      return NextResponse.json(
        {
          error: "Analytics data is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!Array.isArray(posts)) {
      return NextResponse.json(
        {
          error: "Post data is required.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Strict campaign isolation.
     *
     * The frontend already migrates legacy posts before calling
     * this endpoint. The API still filters again so an unrelated
     * campaign can never accidentally reach Gemini.
     */
    const campaignPosts = posts.filter(
      (post) => post.campaignId === campaignId,
    );

    const campaignPostIds = new Set(campaignPosts.map((post) => post.id));

    const campaignAnalytics = analytics.filter(
      (item) =>
        item.campaignId === campaignId && campaignPostIds.has(item.postId),
    );

    if (campaignPosts.length === 0) {
      return NextResponse.json(
        {
          error: "No posts are available for this campaign.",
        },
        {
          status: 400,
        },
      );
    }

    if (campaignAnalytics.length === 0) {
      return NextResponse.json(
        {
          error: "No analytics data is available for this campaign.",
        },
        {
          status: 400,
        },
      );
    }

    const postMap = new Map(campaignPosts.map((post) => [post.id, post]));

    const reportData = campaignAnalytics.map((item) => {
      const post = postMap.get(item.postId);

      return {
        postId: item.postId,

        campaignId,

        campaignTitle: post?.campaignTitle ?? "Unknown campaign",

        headline: post?.headline ?? "Unknown headline",

        platform: item.platform,

        status: post?.status ?? "unknown",

        scheduledAt: post?.scheduledAt ?? null,

        metrics: {
          impressions: item.impressions,
          reach: item.reach,
          likes: item.likes,
          comments: item.comments,
          shares: item.shares,
          clicks: item.clicks,
          saves: item.saves,
          engagementRate: item.engagementRate,
          clickThroughRate: item.clickThroughRate,
        },
      };
    });

    const campaignTitle = campaignPosts[0]?.campaignTitle ?? "Current campaign";

    const prompt = `
You are an AI content strategist inside a professional
entertainment content command center.

Generate a weekly performance report for ONE campaign only.

==================================================
CURRENT CAMPAIGN
==================================================

Campaign ID:
${campaignId}

Campaign title:
${campaignTitle}

==================================================
DATA
==================================================

${JSON.stringify(reportData, null, 2)}

==================================================
CAMPAIGN ISOLATION RULE
==================================================

Analyze ONLY the data supplied above.

Do NOT reference:
- previous campaigns
- other campaign titles
- historical posts not present in the supplied data
- unrelated Post IDs
- unrelated analytics

The supplied Post IDs are the complete evidence set for
this report.

==================================================
CRITICAL EVIDENCE RULE
==================================================

Every factual performance claim MUST be traceable to one
or more supplied Post IDs.

For every key insight:

- Include the relevant Post IDs in evidencePostIds.
- Do not make unsupported claims.
- Do not invent metrics.
- Do not invent audience demographics.
- Do not claim causation when the data only shows correlation.
- Do not invent campaign information.

Example:

GOOD:

"Instagram post IG-ABC123 generated a 7.4% engagement
rate, higher than the other tracked posts."

evidencePostIds:
["IG-ABC123"]

BAD:

"Instagram audiences prefer emotional content."

Why?

The supplied analytics do not establish audience preference
or emotional response.

==================================================
ANALYTICAL TASK
==================================================

Analyze:

- impressions
- reach
- likes
- comments
- shares
- clicks
- saves
- engagement rate
- click-through rate
- platform differences
- post-level differences

Identify meaningful patterns only when the supplied data
supports them.

Use exact metrics from the supplied data.

==================================================
PLATFORM COMPARISON
==================================================

Compare platforms using the available data.

Do not automatically declare a platform "best".

Instead describe measurable differences.

For example:

"Instagram recorded a higher engagement rate than YouTube
across the tracked posts."

This is acceptable when supported by the data.

==================================================
RECOMMENDATIONS
==================================================

Generate practical recommendations for the next campaign.

Recommendations can cover:

- creative direction
- copy style
- hooks
- CTA
- platform adaptation
- content format
- posting strategy

However, recommendations must be clearly distinguishable
from factual observations.

==================================================
NEXT BRIEF
==================================================

Create a concise strategy that can be passed into the next
content brief.

The next brief should contain:

1. Direction
2. Objective
3. Creative direction
4. Platform focus
5. Suggested hook

The next brief is a STRATEGIC RECOMMENDATION.

Do not present it as an established fact.

==================================================
STYLE
==================================================

Write like an experienced entertainment marketing strategist.

Use concise, practical language.

Avoid generic AI phrases such as:

- "leverage synergies"
- "unlock potential"
- "game-changing"
- "revolutionary"
- "take it to the next level"

==================================================
FINAL VALIDATION
==================================================

Before returning JSON, verify:

1. Every factual insight has Post IDs.
2. Every referenced Post ID actually exists in the input.
3. Metrics match the supplied data.
4. No metrics were invented.
5. No unsupported audience conclusions were made.
6. Recommendations are clearly recommendations.
7. The next brief is based on observed analytics.
8. The report is useful to a content team.
9. No other campaign is mentioned.
10. Every evidence Post ID belongs to campaign ${campaignId}.

Return ONLY valid JSON.
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",

      contents: prompt,

      config: {
        responseMimeType: "application/json",

        responseSchema,

        temperature: 0.45,
      },
    });

    const text = result.text;

    if (!text) {
      return NextResponse.json(
        {
          error: "Gemini returned an empty report.",
        },
        {
          status: 502,
        },
      );
    }

    let parsed: ParsedReport;

    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          error: "Gemini returned invalid report JSON.",
        },
        {
          status: 502,
        },
      );
    }

    /*
     * Server-side evidence validation.
     *
     * Remove any Post IDs that do not actually exist
     * in this campaign's analytics dataset.
     */
    const validPostIds = new Set(campaignAnalytics.map((item) => item.postId));

    if (Array.isArray(parsed.keyInsights)) {
      parsed.keyInsights = parsed.keyInsights.map(
        (insight: {
          insight: string;
          evidencePostIds: string[];
          metrics: Record<string, number | string>;
        }) => ({
          ...insight,

          evidencePostIds: Array.isArray(insight.evidencePostIds)
            ? insight.evidencePostIds.filter((id) => validPostIds.has(id))
            : [],

          metrics:
            insight.metrics && typeof insight.metrics === "object"
              ? insight.metrics
              : {},
        }),
      );
    }

    if (Array.isArray(parsed.platformInsights)) {
      parsed.platformInsights = parsed.platformInsights.map(
        (insight: {
          platform: string;
          insight: string;
          evidencePostIds: string[];
        }) => ({
          ...insight,

          evidencePostIds: Array.isArray(insight.evidencePostIds)
            ? insight.evidencePostIds.filter((id) => validPostIds.has(id))
            : [],
        }),
      );
    }

    /*
     * Normalize platformFocus defensively even though the
     * response schema now requires an array.
     */
    if (parsed.nextBrief && typeof parsed.nextBrief === "object") {
      const platformFocus = parsed.nextBrief.platformFocus;

      if (typeof platformFocus === "string") {
        parsed.nextBrief.platformFocus = platformFocus
          .split(/[,|]/)
          .map((item: string) => item.trim())
          .filter(Boolean);
      } else if (!Array.isArray(platformFocus)) {
        parsed.nextBrief.platformFocus = [];
      }
    }

    /*
     * Attach the authoritative campaign ID from the request
     * rather than trusting the model to reproduce it.
     */
    parsed.campaignId = campaignId;

    return NextResponse.json({
      report: parsed,
    });
  } catch (error) {
    console.error("Weekly report generation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate weekly report.",
      },
      {
        status: 500,
      },
    );
  }
}
