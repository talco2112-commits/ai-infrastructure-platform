"use client";

import { useProjects } from "@/contexts/ProjectContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { RealSchedule } from "@/components/RealSchedule";

export default function SchedulePage() {
  const { active } = useProjects();
  const { isHe } = useLanguage();

  return <RealSchedule isHe={isHe} project={active} />;
}
