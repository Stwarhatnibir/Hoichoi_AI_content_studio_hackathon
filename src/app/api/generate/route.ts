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

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured. Add it to .env.local and restart the development server.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as GenerateRequest;

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

    if (!Array.isArray(body.platforms) || body.platforms.length === 0) {
      return NextResponse.json(
        { error: "At least one platform is required." },
        { status: 400 },
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const systemPrompt = `
You are the AI content generation engine for a professional
streaming company's AI Content Studio.

Your job is to transform ONE campaign brief into genuinely
platform-specific social media content.

IMPORTANT RULES:

1. Bengali must be naturally written Bengali.
2. English must sound naturally written in English.
3. Hindi must sound naturally written in Hindi.
4. Never produce literal machine-translated language.
5. Platform variants must be meaningfully different.
6. Do not simply translate or relabel one caption.
7. Instagram should be concise, visual, engaging and hashtag-aware.
8. YouTube should have a stronger title/headline and a more informative description.
9. Facebook should encourage conversation and sharing.
10. Never invent factual claims that are not supported by the brief.
11. Keep the tone suitable for a professional streaming/content platform.
12. Return ONLY valid JSON.
13. Generate content for EVERY requested platform.

Required JSON structure:

{
  "contents": [
    {
      "platform": "Instagram",
      "headline": "...",
      "caption": "...",
      "hashtags": ["...", "..."],
      "cta": "..."
    }
  ]
}
`;

    const userPrompt = `
Campaign title:
${body.title}

Campaign brief:
${body.brief}

Primary language:
${body.language}

Content type:
${body.contentType}

Target platforms:
${body.platforms.join(", ")}

Generate one platform-specific content package for every requested platform.

The content must be directly based on the campaign brief.

Make each platform meaningfully different in:
- headline
- caption structure
- tone
- CTA
- hashtag strategy

Do not invent facts, characters, dates, actors, release information,
statistics, awards, or other details that are not present in the brief.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\n${userPrompt}`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            contents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: {
                    type: "string",
                  },
                  headline: {
                    type: "string",
                  },
                  caption: {
                    type: "string",
                  },
                  hashtags: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  cta: {
                    type: "string",
                  },
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

    const rawContent = response.text;

    if (!rawContent) {
      return NextResponse.json(
        {
          error: "Gemini returned an empty response.",
        },
        { status: 502 },
      );
    }

    let parsed: GenerateResponse;

    try {
      parsed = JSON.parse(rawContent) as GenerateResponse;
    } catch {
      console.error("Invalid Gemini JSON:", rawContent);

      return NextResponse.json(
        {
          error: "Gemini returned invalid JSON.",
        },
        { status: 502 },
      );
    }

    if (!parsed.contents || !Array.isArray(parsed.contents)) {
      return NextResponse.json(
        {
          error: "Gemini response does not contain a valid contents array.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      contents: parsed.contents,
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
