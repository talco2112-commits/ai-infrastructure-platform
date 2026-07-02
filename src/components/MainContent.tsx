"use client";

import { usePathname } from "next/navigation";
import { useProjects } from "@/contexts/ProjectContext";
import { EmptyModulePage } from "@/components/EmptyModulePage";
import { RealSchedule } from "@/components/RealSchedule";
import { useState, useEffect } from "react";
import type { Project } from "@/contexts/ProjectContext";

interface Props {
  children: React.ReactNode;
  defaultLang: "en" | "he";
}

function relevantFilesForPath(pathname: string, p: Project): boolean {
  const s = p.scheduleFiles  > 0;
  const c = p.contractFiles  > 0;
  const b = p.boqFiles       > 0;
  const d = p.drawingFiles   > 0;
  const any = s || c || b || d;

  if (pathname.startsWith("/schedule"))      return s;
  if (pathname.startsWith("/finance"))       return c || b;
  if (pathname.startsWith("/documents"))     return any;
  if (pathname.startsWith("/billing"))       return c || b;
  if (pathname.startsWith("/claims"))        return c || s;
  if (pathname.startsWith("/rfis"))          return d;
  if (pathname.startsWith("/design"))        return d;
  if (pathname.startsWith("/quality"))       return d;
  if (pathname.startsWith("/safety"))        return any;
  if (pathname.startsWith("/reports"))       return any;
  if (pathname.startsWith("/site-progress")) return d;
  if (pathname.startsWith("/construction"))  return s;
  return false;
}

export function MainContent({ children, defaultLang }: Props) {
  const { active } = useProjects();
  const pathname   = usePathname();

  const [isHe, setIsHe] = useState(defaultLang === "he");
  useEffect(() => {
    const c = document.cookie.split(";").find(s => s.trim().startsWith("lang="))?.split("=")[1]?.trim();
    setIsHe(c === "he");
  }, []);

  const isDashboard = pathname === "/dashboard";
  const isDemo      = active.id === "highway-20";

  // Pass through for demo project and dashboard
  if (isDashboard || isDemo) {
    return <main className="flex-1 overflow-y-auto">{children}</main>;
  }

  // ── Real modules for non-demo projects ──

  // Schedule: fully functional — parses real Excel/CSV/XER files
  if (pathname.startsWith("/schedule")) {
    return (
      <main className="flex-1 overflow-y-auto">
        <RealSchedule isHe={isHe} project={active}/>
      </main>
    );
  }

  // All other modules: show empty state or "files uploaded" processing state
  const filesUploaded = relevantFilesForPath(pathname, active);
  return (
    <main className="flex-1 overflow-y-auto">
      <EmptyModulePage
        isHe={isHe}
        project={active}
        pathname={pathname}
        filesUploaded={filesUploaded}
      />
    </main>
  );
}
