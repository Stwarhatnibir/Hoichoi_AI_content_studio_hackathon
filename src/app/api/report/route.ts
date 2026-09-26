import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

type AnalyticsRecord = {
  postId: string;
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

type ScheduledPost = {
  id: string;
  campaignTitle: string;
  platform: string;
  headline: string;
  scheduledAt: string;
  status: "scheduled" | "published";
  createdAt: string;
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
            type: Type.STRING,
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
          type: Type.STRING,
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

    const analytics = body.analytics as AnalyticsRecord[];

    const posts = body.posts as ScheduledPost[];

    if (!Array.isArray(analytics) || analytics.length === 0) {
      return NextResponse.json(
        {
          error: "No analytics data is available for the report.",
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

    const postMap = new Map(posts.map((post) => [post.id, post]));

    const reportData = analytics.map((item) => {
      const post = postMap.get(item.postId);

      return {
        postId: item.postId,
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

    const prompt = `
You are an AI content strategist inside a professional
entertainment content command center.

Generate a weekly performance report from the provided
mock social-media analytics.

==================================================
DATA
==================================================

${JSON.stringify(reportData, null, 2)}

==================================================
CRITICAL EVIDENCE RULE
==================================================

Every factual performance claim MUST be traceable to one
or more Post IDs.

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

    let parsed;

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
     * in the supplied analytics dataset.
     */
    const validPostIds = new Set(analytics.map((item) => item.postId));

    if (Array.isArray(parsed.keyInsights)) {
      parsed.keyInsights = parsed.keyInsights.map(
        (insight: {
          insight: string;
          evidencePostIds: string[];
          metrics: string;
        }) => ({
          ...insight,
          evidencePostIds: Array.isArray(insight.evidencePostIds)
            ? insight.evidencePostIds.filter((id) => validPostIds.has(id))
            : [],
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

    return NextResponse.json(parsed);
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
