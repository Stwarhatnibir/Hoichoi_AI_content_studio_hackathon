import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

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

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    contents: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          platform: {
            type: Type.STRING,
          },
          headline: {
            type: Type.STRING,
          },
          caption: {
            type: Type.STRING,
          },
          hashtags: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
          cta: {
            type: Type.STRING,
          },
        },
        required: ["platform", "headline", "caption", "hashtags", "cta"],
      },
    },

    visuals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          platform: {
            type: Type.STRING,
          },
          visualConcept: {
            type: Type.STRING,
          },
          mood: {
            type: Type.STRING,
          },
          composition: {
            type: Type.STRING,
          },
          background: {
            type: Type.STRING,
          },
          accent: {
            type: Type.STRING,
          },
          foreground: {
            type: Type.STRING,
          },
          decorativeElements: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
          visualText: {
            type: Type.STRING,
          },
        },
        required: [
          "platform",
          "visualConcept",
          "mood",
          "composition",
          "background",
          "accent",
          "foreground",
          "decorativeElements",
          "visualText",
        ],
      },
    },
  },

  required: ["contents", "visuals"],
};

function getPlatformInstructions(platform: string) {
  if (platform === "Instagram") {
    return `
INSTAGRAM

Create:
- A visually striking square-first concept
- Short, memorable headline
- Engaging but concise caption
- Social-friendly CTA
- Relevant hashtags

Aspect ratio:
1:1

The creative should feel designed specifically for Instagram,
not like a cropped version of another platform.
`;
  }

  if (platform === "YouTube") {
    return `
YOUTUBE

Create:
- A strong cinematic headline
- A more dramatic promotional caption
- Thumbnail-friendly visual concept
- Clear visual hierarchy
- Strong anticipation

Aspect ratio:
16:9

The creative should feel designed specifically for YouTube.
`;
  }

  if (platform === "Facebook") {
    return `
FACEBOOK

Create:
- A slightly more descriptive headline
- A conversational promotional caption
- A share-friendly CTA
- Editorial/social visual treatment

Aspect ratio:
4:5

The creative should feel designed specifically for Facebook.
`;
  }

  return "";
}

function buildPrompt(brief: ContentBrief) {
  const platforms = brief.platforms.join(", ");

  return `
You are an expert entertainment marketing AI working inside a professional
multi-platform content studio.

Your task is NOT to copy the user's brief.

Your task is to transform a short campaign brief into polished,
creative, platform-specific marketing content.

==================================================
CAMPAIGN INPUT
==================================================

TITLE:
${brief.title}

USER BRIEF:
${brief.brief}

LANGUAGE:
${brief.language}

CONTENT TYPE:
${brief.contentType}

PLATFORMS:
${platforms}

==================================================
CORE CREATIVE PRINCIPLE
==================================================

Think like a professional entertainment social-media strategist.

The user's brief is the SOURCE OF TRUTH for the campaign.

However, the final output must be a CREATIVE TRANSFORMATION of that brief,
not a repetition or paraphrase.

You should:

- rewrite the idea naturally
- create stronger hooks
- create promotional language
- create curiosity
- create anticipation
- improve emotional impact
- make headlines memorable
- make captions feel human
- adapt copy to each platform
- create visually interesting concepts
- turn a basic idea into publishable social content

DO NOT simply repeat the user's sentence.

==================================================
VERY IMPORTANT: FACTS VS CREATIVE LANGUAGE
==================================================

You are allowed to creatively elaborate on the PRESENTATION of the idea.

You are NOT allowed to invent NEW FACTS.

For example, if the brief is:

"Kobitar notun show asche"

Good creative expansion:

Headline:
"কবিতা, এবার নতুন এক অধ্যায়"

Caption:
"পরিচিত নাম, নতুন আয়োজন। কবিতাকে ঘিরে আসছে নতুন শো।
অপেক্ষা থাকুক—শুরু হতে চলেছে এক নতুন পর্ব।"

Visual:
"Minimal cinematic announcement featuring the title 'Kobita',
with dramatic typography, layered paper textures and an abstract
spotlight suggesting anticipation."

These are creative interpretations of the supplied announcement.

Bad output:

"Durga Pujo-te Kobitar notun show"

Why?

Because Durga Puja was never mentioned.

Another bad output:

"Kobita-r romantic thriller story"

Why?

Because the genre was never provided.

==================================================
WHAT YOU MAY INVENT
==================================================

You MAY invent:

- marketing hooks
- slogans
- taglines
- emotional phrasing
- curiosity-driven language
- anticipation
- calls to action
- typography treatment
- abstract visual metaphors
- lighting style
- composition
- color direction
- graphic elements
- promotional atmosphere
- social-media presentation

These are CREATIVE PRESENTATION choices.

==================================================
WHAT YOU MUST NEVER INVENT
==================================================

Do NOT invent factual information such as:

- festivals
- release dates
- episode numbers
- actors
- directors
- locations
- characters
- plot
- story
- genre
- awards
- reviews
- ratings
- statistics
- streaming availability
- production details
- celebrity names
- partnerships
- brands
- special events
- cultural occasions
- plot twists
- fictional facts presented as real

unless explicitly provided by the user.

==================================================
DO NOT COPY THE BRIEF
==================================================

This is extremely important.

The final headline should NOT simply equal the user's brief.

The caption should NOT simply repeat the brief sentence multiple times.

Instead:

INPUT:
"Kobitar notun show asche"

POSSIBLE CREATIVE DIRECTIONS:

Headline examples:
- "কবিতা, এবার নতুন এক অধ্যায়"
- "এক নতুন কবিতার অপেক্ষা"
- "কবিতা আসছে, নতুন রূপে"
- "শুরু হোক নতুন অপেক্ষা"
- "পরিচিত নাম, নতুন আয়োজন"

Caption direction:
Build anticipation around the announcement without inventing
what the show is about.

The final result should feel like a real marketing team transformed
a rough internal brief into publishable campaign copy.

==================================================
LANGUAGE
==================================================

Generate user-facing content in:

${brief.language}

If the language is Bengali:

- Use natural modern Bengali
- Avoid archaic literary Bengali
- Use polished entertainment-industry language
- Do not mechanically translate English
- Make the Bengali sound like real social-media copy

==================================================
CONTENT TYPE
==================================================

The requested content type is:

${brief.contentType}

Respect this content type when designing the campaign.

==================================================
PLATFORM DIFFERENTIATION
==================================================

${brief.platforms
  .map((platform) => getPlatformInstructions(platform))
  .join("\n")}

==================================================
VISUAL CREATIVE
==================================================

Create a genuinely different visual direction for each platform.

Do NOT just describe:

"same poster but cropped differently."

Instead think about:

Instagram:
- bold typography
- square composition
- strong central focal point
- scroll-stopping visual hierarchy

YouTube:
- cinematic composition
- wide negative space
- large readable title
- thumbnail-friendly contrast

Facebook:
- editorial portrait composition
- more breathing room
- social announcement aesthetic
- strong readable typography

If the campaign does not provide a physical setting,
use an abstract or graphic visual treatment.

For example:

- typography
- shadows
- paper textures
- light beams
- gradients
- abstract shapes
- silhouettes
- atmospheric particles
- layered graphic elements

Do not invent real-world story elements.

==================================================
HASHTAGS
==================================================

Create relevant hashtags based on:

- campaign title
- supplied campaign concept
- content type
- platform

Do not create hashtags around facts that were not supplied.

==================================================
CTA
==================================================

Create a useful promotional CTA.

Examples:

- "Stay tuned."
- "অপেক্ষায় থাকুন।"
- "নতুন আপডেটের জন্য চোখ রাখুন।"
- "শীঘ্রই আরও জানুন।"

Do not invent a release date or platform unless provided.

==================================================
QUALITY BAR
==================================================

The output should feel like it was created by:

- an entertainment marketing strategist
- a social-media copywriter
- an art director
- a platform specialist

It should NOT feel like:

- raw AI text
- a paraphrase
- a summary
- the user's original brief repeated several times

==================================================
FINAL VALIDATION
==================================================

Before returning the result, silently check:

1. Is the copy creatively different from the original brief?
2. Does every platform have a different creative treatment?
3. Did I preserve the actual campaign idea?
4. Did I avoid inventing factual information?
5. Does the copy sound publishable?
6. Does the visual concept add creative value?
7. Are the headlines memorable?
8. Are the captions natural?
9. Is the Bengali natural if Bengali was requested?
10. Would a real social-media team actually be able to publish this?

Return ONLY valid JSON matching the requested schema.
`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContentBrief;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.title?.trim()) {
      return NextResponse.json(
        {
          error: "Campaign title is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.brief?.trim()) {
      return NextResponse.json(
        {
          error: "Campaign brief is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!Array.isArray(body.platforms) || body.platforms.length === 0) {
      return NextResponse.json(
        {
          error: "At least one platform is required.",
        },
        {
          status: 400,
        },
      );
    }

    const prompt = buildPrompt(body);

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.75,
      },
    });

    const text = result.text;

    if (!text) {
      return NextResponse.json(
        {
          error: "Gemini returned an empty response.",
        },
        {
          status: 502,
        },
      );
    }

    let parsed: {
      contents: PlatformContent[];
      visuals: PlatformVisual[];
    };

    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          error: "Gemini returned invalid JSON.",
        },
        {
          status: 502,
        },
      );
    }

    if (!Array.isArray(parsed.contents) || !Array.isArray(parsed.visuals)) {
      return NextResponse.json(
        {
          error: "Gemini returned an incomplete content structure.",
        },
        {
          status: 502,
        },
      );
    }

    const requestedPlatforms = new Set(body.platforms);

    parsed.contents = parsed.contents.filter((item) =>
      requestedPlatforms.has(item.platform),
    );

    parsed.visuals = parsed.visuals.filter((item) =>
      requestedPlatforms.has(item.platform),
    );

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Content generation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate content.",
      },
      {
        status: 500,
      },
    );
  }
}
