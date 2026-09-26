"use client";

import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  Home,
  Plus,
  Send,
  Settings,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useRouter } from "next/navigation";

const navigation = [
  {
    label: "Dashboard",
    icon: Home,
    route: "/",
  },
  {
    label: "Create",
    icon: Plus,
    route: "/create",
  },
  {
    label: "AI Studio",
    icon: Wand2,
    route: "/studio",
  },
  {
    label: "Publisher",
    icon: Send,
    route: "/publish",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    route: "/analytics",
  },
];

const recentContent = [
  {
    title: "Kobita",
    platform: "Instagram",
    status: "Draft",
    time: "Just now",
  },
  {
    title: "New Show Campaign",
    platform: "YouTube",
    status: "Scheduled",
    time: "2h ago",
  },
  {
    title: "Weekly Entertainment",
    platform: "Facebook",
    status: "Published",
    time: "Yesterday",
  },
];

export default function DashboardShell() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
          <div className="flex h-16 items-center border-b border-border px-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                <Sparkles className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-semibold">Hoichoi</p>

                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  AI Content Studio
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  onClick={() => router.push(item.route)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-border p-3">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOP BAR */}
          <header className="flex h-16 items-center justify-between border-b border-border px-5 md:px-8">
            <div>
              <p className="text-xs text-muted-foreground">
                Content Operations
              </p>

              <h1 className="text-sm font-semibold">Command Center</h1>
            </div>

            <button
              onClick={() => router.push("/create")}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-3 text-sm font-medium text-background transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </header>

          <div className="flex-1 p-5 md:p-8">
            {/* HERO */}
            <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  AI-powered content operations
                </div>

                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Turn one brief into a multi-platform campaign.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Generate platform-specific creative, approve it, schedule mock
                  channel publishing, and analyze performance from one command
                  center.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push("/create")}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background"
                  >
                    <Sparkles className="h-4 w-4" />
                    Create campaign
                  </button>

                  <button
                    onClick={() => router.push("/analytics")}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium transition hover:bg-muted"
                  >
                    <BarChart3 className="h-4 w-4" />
                    View analytics
                  </button>
                </div>
              </div>
            </section>

            {/* STATS */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardStat
                icon={<FileText className="h-4 w-4" />}
                label="Campaigns"
                value="12"
              />

              <DashboardStat
                icon={<Send className="h-4 w-4" />}
                label="Published Posts"
                value="28"
              />

              <DashboardStat
                icon={<CalendarDays className="h-4 w-4" />}
                label="Scheduled"
                value="07"
              />

              <DashboardStat
                icon={<BarChart3 className="h-4 w-4" />}
                label="Avg. Engagement"
                value="6.8%"
              />
            </section>

            {/* CONTENT GRID */}
            <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
              {/* RECENT CONTENT */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Recent content</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Latest campaign activity
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/analytics")}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    Analytics
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {recentContent.map((item) => (
                    <div
                      key={`${item.title}-${item.platform}`}
                      className="flex items-center justify-between rounded-xl border border-border p-4"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.platform} · {item.time}
                        </p>
                      </div>

                      <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI ASSISTANT */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                  <Sparkles className="h-4 w-4" />
                </div>

                <p className="mt-4 text-sm font-semibold">AI assistant</p>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Turn a campaign idea into platform-specific content, schedule
                  it, and inspect performance signals.
                </p>

                <button
                  onClick={() => router.push("/create")}
                  className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border text-xs font-medium transition hover:bg-muted"
                >
                  Start a brief
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </section>

            {/* WORKFLOW */}
            <section className="mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="mb-5">
                <p className="text-sm font-semibold">Campaign workflow</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  From brief to measurable platform output
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-5">
                {[
                  ["01", "Brief", FileText],
                  ["02", "Generate", Sparkles],
                  ["03", "Approve", CheckIcon],
                  ["04", "Publish", Send],
                  ["05", "Analyze", BarChart3],
                ].map(([number, label, Icon]) => {
                  const WorkflowIcon = Icon as React.ComponentType<{
                    className?: string;
                  }>;

                  return (
                    <div
                      key={String(number)}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {String(number)}
                        </span>

                        <WorkflowIcon className="h-4 w-4" />
                      </div>

                      <p className="mt-4 text-sm font-medium">
                        {String(label)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function DashboardStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
        {icon}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return <CheckCircle2 className={className} />;
}
