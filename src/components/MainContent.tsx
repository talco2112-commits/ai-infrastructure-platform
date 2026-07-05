"use client";

import { usePathname } from "next/navigation";
import { useProjects } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { RealSchedule } from "@/components/RealSchedule";

interface Props {
  children: React.ReactNode;
}

export function MainContent({ children }: Props) {
  const { active } = useProjects();
  const { isHe }   = useLanguage();
  const pathname   = usePathname();

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
