"use client";

import { Menu } from "lucide-react";
import { useSidebarDrawer } from "@/contexts/SidebarDrawerContext";

interface Props {
  children: React.ReactNode;
}

export function MainContent({ children }: Props) {
  // Every module (including Schedule) renders its own normal template for every
  // project — non-demo projects just start from empty seed data (see each page's
  // isDemo gate), and the demo project seeds its own bundled sample data.
  const { toggle } = useSidebarDrawer();

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile-only top bar — the sidebar becomes an off-canvas drawer below md,
          so every page needs a way to open it without each page implementing its own. */}
      <div className="md:hidden h-12 flex items-center gap-3 px-4 shrink-0"
        style={{ background: "#1A1512", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={toggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)", color: "#D6D0CA" }}>
          <Menu className="w-4 h-4" />
        </button>
        <span className="text-[13px] font-bold" style={{ color: "#D6D0CA", letterSpacing: "0.05em" }}>InfrAI</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {children}
      </div>
    </main>
  );
}
