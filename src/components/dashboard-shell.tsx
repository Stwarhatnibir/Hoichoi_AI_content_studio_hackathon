"use client";

import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Menu,
  PenSquare,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    name: "Create",
    icon: PenSquare,
    active: false,
  },
  {
    name: "Approvals",
    icon: CheckCircle2,
    active: false,
    badge: "4",
  },
  {
    name: "Publisher",
    icon: CalendarClock,
    active: false,
  },
  {
    name: "Analytics",
    icon: BarChart3,
    active: false,
  },
  {
    name: "Insights",
    icon: Sparkles,
    active: false,
  },
];

export default function DashboardShell() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigation = (name: string) => {
    if (name === "Dashboard") {
      router.push("/");
    }

    if (name === "Create") {
      router.push("/create");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center border-b px-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="text-left">
              <p className="text-sm font-bold tracking-tight">HOICHOI AI</p>

              <p className="text-xs text-muted-foreground">Content Studio</p>
            </div>
          </button>

          <button
            className="ml-auto rounded-lg p-2 hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main navigation */}
        <div className="flex-1 px-3 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.name)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />

                  <span className="flex-1 text-left">{item.name}</span>

                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.active
                          ? "bg-primary-foreground/15 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="my-6 border-t" />

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            System
          </p>

          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Settings className="h-4 w-4" />

            <span>Settings</span>
          </button>
        </div>

        {/* User area */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-sm font-semibold">
              N
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Content Manager</p>

              <p className="truncate text-xs text-muted-foreground">
                Hoichoi Workspace
              </p>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      {/* Main application */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <button
            className="mr-4 rounded-lg p-2 hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="text-xs text-muted-foreground">Workspace</p>

            <p className="truncate text-sm font-semibold">Content Operations</p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="hidden items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted md:flex">
              <span className="text-xs">⌘</span>

              <span>Search</span>

              <span className="ml-4 text-xs">K</span>
            </button>

            <button className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-sm font-semibold hover:bg-muted">
              N
            </button>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Page heading */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Saturday, September 26, 2026
              </p>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Good morning.
              </h1>

              <p className="mt-2 max-w-2xl text-muted-foreground">
                Here&apos;s what&apos;s happening across your content workspace
                today.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Content drafts"
                value="12"
                change="+3 this week"
                icon={FileText}
              />

              <StatCard
                label="Awaiting approval"
                value="4"
                change="2 need attention"
                icon={CheckCircle2}
              />

              <StatCard
                label="Scheduled"
                value="8"
                change="Next post in 2h"
                icon={CalendarClock}
              />

              <StatCard
                label="Published"
                value="28"
                change="+18% this month"
                icon={BarChart3}
              />
            </div>

            {/* Main dashboard area */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              {/* Recent content */}
              <section className="rounded-2xl border bg-card">
                <div className="flex items-center justify-between border-b p-6">
                  <div>
                    <h2 className="font-semibold">Recent content</h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Your latest content briefs and assets.
                    </p>
                  </div>

                  <button className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    View all
                  </button>
                </div>

                <div className="divide-y">
                  <ContentRow
                    title="Durga Puja 2026 Campaign"
                    platform="Instagram"
                    status="Awaiting approval"
                    statusType="warning"
                  />

                  <ContentRow
                    title="New Series Announcement"
                    platform="YouTube"
                    status="Scheduled"
                    statusType="info"
                  />

                  <ContentRow
                    title="Weekend Watchlist"
                    platform="Facebook"
                    status="Published"
                    statusType="success"
                  />

                  <ContentRow
                    title="Bengali Classics Collection"
                    platform="Instagram"
                    status="Draft"
                    statusType="neutral"
                  />
                </div>
              </section>

              {/* AI Assistant */}
              <section className="rounded-2xl border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      AI Content Assistant
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Ready to turn your next brief into platform-specific
                      content.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border bg-muted/40 p-4">
                  <p className="text-sm font-medium">
                    What are you creating today?
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Start with a campaign idea, title, event or simple content
                    brief.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/create")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <PenSquare className="h-4 w-4" />
                  Create content brief
                </button>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight">{value}</p>

      <p className="mt-1 text-xs text-muted-foreground">{change}</p>
    </div>
  );
}

function ContentRow({
  title,
  platform,
  status,
  statusType,
}: {
  title: string;
  platform: string;
  status: string;
  statusType: "warning" | "info" | "success" | "neutral";
}) {
  const statusClasses = {
    warning: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    info: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    success: "bg-green-500/10 text-green-700 dark:text-green-400",
    neutral: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex items-center gap-4 p-5 transition-colors hover:bg-muted/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
        <FileText className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>

        <p className="mt-1 text-xs text-muted-foreground">{platform}</p>
      </div>

      <span
        className={`hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-flex ${statusClasses[statusType]}`}
      >
        {status}
      </span>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </div>
  );
}
