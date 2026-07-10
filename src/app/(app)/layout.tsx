import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/Sidebar";
import { AiPrompter } from "@/components/AiPrompter";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DisciplineProvider } from "@/contexts/DisciplineContext";
import { SidebarDrawerProvider } from "@/contexts/SidebarDrawerContext";
import { MainContent } from "@/components/MainContent";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value ?? "en") as "en" | "he";

  return (
    <ProjectProvider>
      <LanguageProvider defaultLang={lang}>
        <DisciplineProvider>
          <SidebarDrawerProvider>
            <div
              className="h-screen flex overflow-hidden"
              style={{ background: "#EDE8E1" }}
              dir={lang === "he" ? "rtl" : "ltr"}
            >
              <Sidebar lang={lang} />
              <MainContent>{children}</MainContent>
              <AiPrompter lang={lang} />
            </div>
          </SidebarDrawerProvider>
        </DisciplineProvider>
      </LanguageProvider>
    </ProjectProvider>
  );
}
