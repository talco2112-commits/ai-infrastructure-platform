import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/Sidebar";
import { AiPrompter } from "@/components/AiPrompter";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { MainContent } from "@/components/MainContent";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value ?? "en") as "en" | "he";

  return (
    <ProjectProvider>
      <div
        className="h-screen flex overflow-hidden"
        style={{ background: "#EDE8E1" }}
        dir={lang === "he" ? "rtl" : "ltr"}
      >
        <Sidebar lang={lang} />
        <MainContent defaultLang={lang}>{children}</MainContent>
        <AiPrompter lang={lang} />
      </div>
    </ProjectProvider>
  );
}
