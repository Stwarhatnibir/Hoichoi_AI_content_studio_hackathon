"use client";

import Link from "next/link";
import {
  BarChart3,
  BrainCircuit,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Megaphone,
  Plus,
  Sparkles,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Create",
    href: "/create",
    icon: Plus,
  },
  {
    label: "AI Studio",
    href: "/studio",
    icon: BrainCircuit,
  },
  {
    label: "Publisher",
    href: "/publish",
    icon: Megaphone,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "AI Report",
    href: "/report",
    icon: FileText,
  },
];

export default function DashboardShell() {
  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#18181b]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold tracking-tight">Hoichoi AI</p>
                <p className="text-xs text-zinc-500">Content Studio</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
                >
                  <Icon className="h-4 w-4" />

                  <span>{item.label}</span>

                  <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition group-hover:opacity-100" />
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <div className="rounded-2xl bg-zinc-950 p-4 text-white">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Sparkles className="h-4 w-4" />
              </div>

              <p className="text-sm font-semibold">AI Content Engine</p>

              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Generate, publish and analyze your content from one place.
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          {/* Mobile header */}
          <header className="flex h-16 items-center justify-between border-b bg-white px-5 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <Sparkles className="h-4 w-4" />
              </div>

              <span className="text-sm font-bold">Hoichoi AI</span>
            </Link>

            <Link
              href="/report"
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium"
            >
              <FileText className="h-4 w-4" />
              Report
            </Link>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            {/* Hero */}
            <div className="flex flex-col gap-5 rounded-3xl bg-zinc-950 p-7 text-white sm:p-9 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Content Command Center
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Create. Publish. Learn.
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
                  Turn one campaign brief into platform-specific content,
                  scheduled posts, performance analytics and actionable AI
                  insights.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  Create campaign
                </Link>

                <Link
                  href="/report"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <FileText className="h-4 w-4" />
                  View AI report
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="AI Studio"
                value="Active"
                description="Generate platform-specific content"
                icon={<BrainCircuit className="h-5 w-5" />}
              />

              <StatCard
                title="Publisher"
                value="Ready"
                description="Review and schedule approved posts"
                icon={<Megaphone className="h-5 w-5" />}
              />

              <StatCard
                title="Analytics"
                value="Live"
                description="Track cross-platform performance"
                icon={<BarChart3 className="h-5 w-5" />}
              />

              <StatCard
                title="AI Report"
                value="Ready"
                description="Turn post metrics into next actions"
                icon={<FileText className="h-5 w-5" />}
              />
            </div>

            {/* Workflow */}
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <section className="rounded-3xl border bg-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Content workflow</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Your complete campaign pipeline.
                    </p>
                  </div>

                  <Sparkles className="h-5 w-5 text-zinc-400" />
                </div>

                <div className="mt-6 space-y-3">
                  <WorkflowItem
                    number="01"
                    title="Create brief"
                    description="Define campaign goal, language and platforms."
                    href="/create"
                  />

                  <WorkflowItem
                    number="02"
                    title="Generate with AI"
                    description="Create platform-native visuals and copy."
                    href="/studio"
                  />

                  <WorkflowItem
                    number="03"
                    title="Approve & publish"
                    description="Validate content and schedule posts."
                    href="/publish"
                  />

                  <WorkflowItem
                    number="04"
                    title="Analyze performance"
                    description="Compare post performance across channels."
                    href="/analytics"
                  />

                  <WorkflowItem
                    number="05"
                    title="Generate AI report"
                    description="Use evidence-backed insights to guide the next brief."
                    href="/report"
                  />
                </div>
              </section>

              {/* AI Report card */}
              <section className="rounded-3xl border bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
                  <FileText className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-xl font-semibold">Weekly AI Report</h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Convert your campaign analytics into evidence-backed insights,
                  recommendations and a direction for the next campaign.
                </p>

                <div className="mt-6 space-y-3">
                  <ReportFeature text="Post-level evidence with Post IDs" />
                  <ReportFeature text="Cross-platform performance insights" />
                  <ReportFeature text="Actionable recommendations" />
                  <ReportFeature text="Next campaign brief direction" />
                </div>

                <Link
                  href="/report"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  Open AI Report
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </section>
            </div>

            {/* Quick actions */}
            <section className="mt-8 rounded-3xl border bg-white p-6">
              <div>
                <p className="text-lg font-semibold">Quick actions</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Jump directly into the campaign workflow.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <QuickAction
                  href="/create"
                  icon={<Plus className="h-5 w-5" />}
                  title="Create"
                  description="Start a campaign"
                />

                <QuickAction
                  href="/studio"
                  icon={<BrainCircuit className="h-5 w-5" />}
                  title="AI Studio"
                  description="Generate content"
                />

                <QuickAction
                  href="/publish"
                  icon={<Megaphone className="h-5 w-5" />}
                  title="Publisher"
                  description="Schedule posts"
                />

                <QuickAction
                  href="/analytics"
                  icon={<BarChart3 className="h-5 w-5" />}
                  title="Analytics"
                  description="View metrics"
                />

                <QuickAction
                  href="/report"
                  icon={<FileText className="h-5 w-5" />}
                  title="AI Report"
                  description="Generate insights"
                />
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-zinc-500">{description}</p>
    </div>
  );
}

function WorkflowItem({
  number,
  title,
  description,
  href,
}: {
  number: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xs font-bold">
        {number}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
      </div>

      <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-zinc-400 transition group-hover:translate-x-0.5" />
    </Link>
  );
}

function ReportFeature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-600">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
      </div>

      <span>{text}</span>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100">
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold">{title}</p>

      <p className="mt-1 text-xs text-zinc-500">{description}</p>
    </Link>
  );
}
