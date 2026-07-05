"use client";

import { usePathname } from "next/navigation";
import { useProjects } from "@/contexts/ProjectContext";
import { RealSchedule } from "@/components/RealSchedule";
import { useState, useEffect } from "react";

interface Props {
  children: React.ReactNode;
  defaultLang: "en" | "he";
}

export function MainContent({ children, defaultLang }: Props) {
  const { active } = useProjects();
  const pathname   = usePathname();

  const [isHe, setIsHe] = useState(defaultLang === "he");
  useEffect(() => {
    const c = document.cookie.split(";").find(s => s.trim().startsWith("lang="))?.split("=")[1]?.trim();
    setIsHe(c === "he");
  }, []);

  const isDemo = active.id === "highway-20";

  // Schedule: fully functional — parses real Excel/CSV/XER files for non-demo projects
  if (pathname.startsWith("/schedule") && !isDemo) {
    return (
      <main className="flex-1 overflow-y-auto">
        <RealSchedule isHe={isHe} project={active}/>
      </main>
    );
  }

  // Every other module renders its normal template for every project —
  // non-demo projects just start from empty seed data (see each page's isDemo gate).
  return <main className="flex-1 overflow-y-auto">{children}</main>;
}
