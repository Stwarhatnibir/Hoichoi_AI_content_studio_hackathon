This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

hoichoi AI Content Studio & Multi-Platform Command Center

Hackathon: hoichoi Hackathon'26 — Problem 3
AI Content Studio & Multi-Platform Command Center

A campaign-first AI content workflow that turns a creative brief into platform-specific content, moves approved content through a publishing command center, generates campaign analytics, and closes the loop by converting AI-generated insights into the next creative brief.

Overview

The hoichoi AI Content Studio is designed around one continuous workflow:

Creative Brief
↓
AI Content Studio
↓
Platform-specific Copy + Visual Concepts
↓
Explicit Approval Gate
↓
Multi-platform Publisher
↓
Campaign Analytics
↓
AI Weekly Report
↓
Actionable Insights
↓
Next Creative Brief
↺

The system is intentionally campaign-aware so that content, publishing activity, analytics, reports, and recommendations remain associated with the correct campaign.

Core Problem

Content teams often need to repeat the same work across multiple platforms:

Translate one campaign idea into different platform formats.

Adapt tone, structure, hooks, and calls-to-action for each channel.

Coordinate publishing after content approval.

Understand performance across platforms.

Turn performance data into the next creative decision.

This project combines those stages into a single command center.

Key Features

1. Generative Content Studio

Users create a structured campaign brief containing:

Campaign title

Creative brief

Language

Content type

Target platforms

Campaign context

Gemini generates:

Platform-specific headlines

Platform-specific body copy

Calls-to-action

Creative hooks

Visual concepts

Image/video direction

The generated output is intentionally adapted to each platform rather than simply duplicated.

2. Native Bengali + English Workflow

The studio supports campaign generation in Bengali and English.

The language selected in the brief is passed into the generation workflow so that the resulting content is appropriate for the requested audience and channel.

3. Explicit Approval Gate

Generated content cannot directly enter the publishing workflow.

The user must explicitly approve the generated campaign content before publishing or scheduling.

AI Generated
↓
Review
↓
Approve
↓
Publish / Schedule

This separates AI generation from the final publishing decision.

4. Multi-platform Command Center

The Publisher supports:

Instagram

YouTube

Facebook

The command center can:

Validate generated content

Schedule individual platforms

Schedule all selected platforms

Mock-publish all selected platforms

Track publishing status

Maintain campaign association

The MVP uses mock channel adapters, as permitted by the hackathon specification.

5. Campaign Management

Campaigns are isolated using a unique campaignId.

The Campaign Manager supports:

Creating campaigns

Switching active campaigns

Preserving campaign history

Removing campaigns from the campaign manager

Keeping historical publishing and analytics records intact

This prevents one campaign's generated content or analytics from appearing inside another campaign.

6. Analytics Store

The analytics layer tracks platform-level campaign performance.

The system supports metrics such as:

Reach

Impressions

Engagement

Views

Likes

Comments

Shares

Clicks

The current MVP uses deterministic mock analytics so the complete product workflow can be demonstrated without requiring paid external platform APIs.

7. Cross-platform Insights

The dashboard compares campaign performance across supported platforms.

The comparison is campaign-scoped and uses like-for-like platform metrics where applicable.

The command center exposes:

Campaign performance snapshot

Platform status

Publishing activity

Analytics status

AI report status

Next recommended workflow action

8. AI Weekly Report

The AI Report module analyzes the selected campaign's publishing and analytics data and generates:

Executive summary

Key insights

Platform observations

Performance interpretation

Recommendations

Next-brief guidance

Reports are archived by campaign so historical reports remain available.

9. Closed-loop AI Workflow

The most important product loop is:

Brief
↓
Generate
↓
Approve
↓
Publish
↓
Measure
↓
AI Report
↓
Insights
↓
Next Brief

The AI report contains actionable next-brief guidance.

The user can select:

Use for next brief

which transfers the generated insights into the next campaign creation workflow.

This makes analytics part of content creation rather than a separate reporting endpoint.

Product Architecture

┌───────────────────────────────────────────────────────┐
│ Dashboard Command Center │
├───────────────────────────────────────────────────────┤
│ Campaign Manager │
│ Create Brief │
│ AI Content Studio │
│ Publisher │
│ Analytics │
│ AI Report │
└───────────────────────┬───────────────────────────────┘
│
▼
Campaign / Brief State
│
┌───────────────┼────────────────┐
▼ ▼ ▼
AI Generation Publishing Analytics
│ │ │
└───────────────┼────────────────┘
▼
AI Report Engine
│
▼
Next Brief Insights
│
└──────────► Create

Technology Stack

Frontend

Next.js 14

React 18

TypeScript

Tailwind CSS

shadcn/ui

Lucide icons

AI

Google Gemini

@google/genai

Structured JSON generation

Schema-validated AI responses

Application Architecture

Next.js App Router

Client-side campaign state for the MVP

Local browser persistence using localStorage

API routes for AI generation and report generation

Platform Layer

Mock adapters for:

Instagram

YouTube

Facebook

This keeps the hackathon MVP free while preserving the architecture needed for real platform integrations.

AI Generation

The application uses Gemini for two primary AI workflows.

Content generation

POST /api/generate

Input:

Campaign brief

Language

Content type

Target platforms

Campaign ID

Output:

Platform-specific content

Visual concepts

Structured creative metadata

The generation prompt instructs the model to transform the campaign brief instead of blindly copying it and to avoid inventing unsupported factual campaign information.

AI reporting

POST /api/report

Input:

Campaign ID

Campaign analytics

Campaign publishing records

Output:

Campaign summary

Key insights

Recommendations

Next-brief platform focus

The report is evidence-based on the supplied campaign data.

Data Flow

Campaign creation

Create Brief
↓
Generate campaignId
↓
Save campaign
↓
Set active campaign

Content generation

Active Campaign
↓
Brief fingerprint
↓
Gemini API
↓
Generated content
↓
Visual specifications

Approval

Generated content
↓
User review
↓
Explicit approval

Publishing

Approved campaign
↓
Platform validation
↓
Schedule / Mock Publish
↓
ScheduledPost records

Analytics

Published posts
↓
Campaign-scoped analytics
↓
Platform comparison

Reporting

Campaign analytics + publishing records
↓
Gemini
↓
Weekly report
↓
Archived campaign report

Next brief

AI Report
↓
Use for next brief
↓
Next-brief insights
↓
Create Brief

Campaign Data Isolation

Every campaign receives a unique identifier:

campaignId

Campaign-scoped entities use that identifier to prevent cross-campaign contamination.

Examples include:

Content Brief
Scheduled Posts
Analytics
Weekly Reports
Next-brief Insights

Legacy records without a campaign ID are only associated with the current campaign when their campaign title matches the active brief.

Local Storage Model

The MVP uses browser persistence for fast, dependency-free demonstration.

Important storage keys include:

hoichoi-content-brief
hoichoi-campaigns
hoichoi-generated-contents
hoichoi-generated-visuals
hoichoi-approved
hoichoi-scheduled-posts
hoichoi-analytics
hoichoi-weekly-report
hoichoi-weekly-reports
hoichoi-next-brief-insights

This architecture is suitable for the hackathon MVP. A production implementation would replace browser persistence with a shared database and authenticated backend.

Project Structure

The application follows a Next.js App Router structure.

hoichoi-ai-content-studio/
│
├── src/
│ ├── app/
│ │ ├── api/
│ │ │ ├── generate/
│ │ │ │ └── route.ts
│ │ │ └── report/
│ │ │ └── route.ts
│ │ │
│ │ ├── analytics/
│ │ │ └── page.tsx
│ │ │
│ │ ├── create/
│ │ │ └── page.tsx
│ │ │
│ │ ├── publish/
│ │ │ └── page.tsx
│ │ │
│ │ ├── report/
│ │ │ └── page.tsx
│ │ │
│ │ ├── studio/
│ │ │ └── page.tsx
│ │ │
│ │ ├── page.tsx
│ │ └── ...
│ │
│ └── components/
│ └── dashboard-shell.tsx
│
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.\*
├── .env.local
└── README.md

Environment Variables

Create .env.local:

GEMINI_API_KEY=your_gemini_api_key

Do not commit .env.local or expose the API key publicly.

Installation

1. Clone the repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd hoichoi-ai-content-studio

2. Install dependencies

npm install

3. Configure Gemini

Create:

.env.local

and add:

GEMINI_API_KEY=your_gemini_api_key

4. Run development server

npm run dev

Open:

http://localhost:3000

Production Build

Verify the project with:

npm run build

Then:

npm start

Judge Demo Flow

The recommended demo sequence is:

1. Dashboard

Show the AI Content Command Center.

Highlight:

Active campaign

Pipeline status

Platform status

Campaign performance

AI insight preview

2. Create

Create a new campaign brief.

3. AI Studio

Generate content for multiple platforms.

Show that the platform outputs are different rather than duplicated.

4. Approval

Approve the generated content.

Emphasize the explicit approval gate.

5. Publisher

Use the multi-platform command center.

Demonstrate:

Schedule all platforms

or:

Mock publish all

6. Analytics

Show campaign-level performance and platform comparison.

7. AI Report

Generate the campaign report.

Show:

Summary

Key insights

Platform observations

Recommendations

8. Closed Loop

Click:

Use for next brief

Return to Create.

Show that the AI report's recommendations have become inputs for the next brief.

What Makes the Workflow Integrated

The application is not a collection of disconnected AI screens.

Each stage feeds the next:

Campaign ID
│
├── Brief
│
├── Generated Content
│
├── Approval
│
├── Publishing
│
├── Analytics
│
├── AI Report
│
└── Next Brief Insights

This provides a traceable campaign lifecycle from creative intent to measured outcome and back into creative planning.

MVP vs Production

Current Hackathon MVP

Gemini AI generation

Structured generation output

Browser persistence

Mock platform adapters

Deterministic mock analytics

Campaign isolation

AI reporting

Report archive

Next-brief feedback loop

Production Extension

A production deployment could add:

PostgreSQL / MongoDB persistence

Authentication and role-based access

Real Instagram/Meta APIs

Real YouTube Data API integration

Real publishing authorization

Real-time analytics ingestion

Background jobs

Scheduled workers

CDN-backed generated assets

Audit logs

Team collaboration

Campaign permissions

Persistent AI evaluation and observability

Security Notes

Never commit .env.local.

Never expose the Gemini API key in client-side code.

API routes should remain responsible for server-side AI requests.

Production platform tokens should be encrypted and stored server-side.

Real publishing integrations should use OAuth rather than collecting platform passwords.

Current MVP Limitations

The hackathon version intentionally avoids paid or operationally expensive external services.

Therefore:

Social publishing is mocked.

Analytics are mocked/deterministic.

Browser storage is used instead of a production database.

Generated visual output is represented through structured visual specifications rather than requiring a paid image/video generation pipeline.

These choices keep the complete workflow demonstrable while preserving the architecture for future real integrations.

Hackathon Requirement Mapping

Requirement

Implementation

Generative Studio

Gemini-powered AI Studio

Platform-specific content

Separate Instagram, YouTube and Facebook outputs

Bengali + English

Language-aware campaign generation

Approval gate

Explicit approval before publishing

Publisher

Multi-platform publisher and scheduler

Mock channel adapter

Built-in mock publishing

Analytics Store

Campaign-scoped mock analytics

Cross-platform insights

Platform comparison dashboard

AI weekly report

Gemini-powered campaign report

Insights → next brief

"Use for next brief" workflow

Campaign isolation

Unique campaignId

Integrated command center

Dashboard + complete campaign lifecycle

Demo Principle

The application is designed to communicate one core idea:

AI should not stop at generating content. It should help the content team create, approve, publish, measure, learn, and create the next campaign.

License

This project was created as a hackathon submission for hoichoi Hackathon'26.
