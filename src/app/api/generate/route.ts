import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

type GenerateRequest = {
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

type GenerateResponse = {
  contents: PlatformContent[];
};

const PLATFORM_GUIDANCE: Record<string, string> = {
  Instagram:
    "Create a short, visually evocative teaser. Lead with a striking image or moment. Use a concise caption and a small set of relevant hashtags.",
  YouTube:
    "Create a distinctive video title and a description that builds anticipation. The description should be more informative than the Instagram caption, without inventing plot details.",
  Facebook:
    "Create a conversational post that invites an authentic response. Use a different creative angle from Instagram and YouTube.",
};

function isPlatformContent(value: unknown): value is PlatformContent {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.platform === "string" &&
    typeof item.headline === "string" &&
    typeof item.caption === "string" &&
    Array.isArray(item.hashtags) &&
    item.hashtags.every((tag) => typeof tag === "string") &&
    typeof item.cta === "string"
  );
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is missing. Add it to .env.local and restart the server.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as Partial<GenerateRequest>;

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Campaign title is required." },
        { status: 400 },
      );
    }

    if (!body.brief?.trim()) {
      return NextResponse.json(
        { error: "Content brief is required." },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(body.platforms) ||
      body.platforms.length === 0 ||
      !body.platforms.every((platform) => typeof platform === "string")
    ) {
      return NextResponse.json(
        { error: "Select at least one valid platform." },
        { status: 400 },
      );
    }

    const platforms = [...new Set(body.platforms)];

    const platformInstructions = platforms
      .map(
        (platform) =>
          `${platform}: ${
            PLATFORM_GUIDANCE[platform] ??
            "Create content specifically suited to this platform."
          }`,
      )
      .join("\n");

    const prompt = `
You are a Bengali-first creative strategist for a streaming platform.

Produce original social-media campaign concepts based on the user's brief.

CAMPAIGN INFORMATION
Title: ${body.title}
Brief: ${body.brief}
Language: ${body.language ?? "Bengali"}
Content type: ${body.contentType ?? "Social campaign"}
Platforms: ${platforms.join(", ")}

PLATFORM INSTRUCTIONS
${platformInstructions}

CREATIVE REQUIREMENTS
1. Read the brief closely. Identify its actual creative direction.
2. Make each platform use a DIFFERENT creative concept, not merely
   different wording for the same concept.
3. Write natural, contemporary Bengali when Bengali is requested.
4. Avoid generic streaming-promotion language.
5. Do not automatically announce that a show is coming soon.
6. If the user requests subtle hints, preserve the mystery.
   Do not reveal a show title, plot, cast, or release date unless supplied.
7. Connect the creative concept to the specific occasion or theme
   in the brief, without relying on clichés.
8. Use concrete imagery, sensory detail, or an intriguing question
   where appropriate.
9. Do not invent facts about the show.
10. Make headlines, captions, CTAs, and hashtags platform-appropriate.
11. Return exactly one content object for each requested platform.
12. Return only valid JSON.

PROHIBITED GENERIC PHRASES AND PATTERNS
Do not use or lightly reword these:
- "একটা গল্প, কিছু অনুভূতি"
- "অনেকটা অপেক্ষা"
- "নতুন কিছু আসছে"
- "চোখ রাখুন"
- "সঙ্গে থাকুন"
- "অপেক্ষার অবসান"
- "রহস্যের পর্দা উঠবে"
- "Stay tuned"
- "Something exciting is coming"

Do not insert the campaign title into every caption as filler.

OUTPUT FORMAT
{
  "contents": [
    {
      "platform": "Instagram",
      "headline": "Platform-specific headline",
      "caption": "Original platform-specific caption",
      "hashtags": ["#RelevantTag"],
      "cta": "Platform-specific call to action"
    }
  ]
}

Before returning, internally check:
- Is every platform's creative angle distinct?
- Does every caption directly relate to the brief?
- Could this caption be used for any random show?
  If yes, rewrite it to be more specific to the brief.
- Have you invented any unsupported show details?
  If yes, remove them.
`;

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      // Keep the model ID that is already working with your API key.
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 1,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            contents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  headline: { type: "string" },
                  caption: { type: "string" },
                  hashtags: {
                    type: "array",
                    items: { type: "string" },
                  },
                  cta: { type: "string" },
                },
                required: [
                  "platform",
                  "headline",
                  "caption",
                  "hashtags",
                  "cta",
                ],
              },
            },
          },
          required: ["contents"],
        },
      },
    });

    if (!response.text) {
      return NextResponse.json(
        { error: "Gemini returned an empty response." },
        { status: 502 },
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(response.text);
    } catch {
      return NextResponse.json(
        { error: "Gemini returned invalid JSON." },
        { status: 502 },
      );
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("contents" in parsed) ||
      !Array.isArray(parsed.contents) ||
      !parsed.contents.every(isPlatformContent)
    ) {
      return NextResponse.json(
        { error: "Gemini returned an unexpected content structure." },
        { status: 502 },
      );
    }

    const generated = parsed as GenerateResponse;

    const orderedContents = platforms.map((platform) =>
      generated.contents.find(
        (item) => item.platform.toLowerCase() === platform.toLowerCase(),
      ),
    );

    if (orderedContents.some((item) => !item)) {
      return NextResponse.json(
        { error: "Gemini did not generate every requested platform." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      contents: orderedContents,
    });
  } catch (error) {
    console.error("Gemini generation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected Gemini generation error.",
      },
      { status: 500 },
    );
  }
}
