import { sanityClient } from "./client";

export type SanityLandingContent = {
  hero?: {
    headline1En?: string; headline1He?: string;
    headline2En?: string; headline2He?: string;
    heroDescEn?:  string; heroDescHe?:  string;
    ctaPrimaryEn?: string; ctaPrimaryHe?: string;
    ctaSecondaryEn?: string; ctaSecondaryHe?: string;
  };
  stats?: Array<{ value?: string; labelEn?: string; labelHe?: string }>;
  scene1?: { titleEn?: string; titleHe?: string; descEn?: string; descHe?: string };
  scene2?: { titleEn?: string; titleHe?: string; descEn?: string; descHe?: string };
  platform?: { tagEn?: string; tagHe?: string; titleEn?: string; titleHe?: string; descEn?: string; descHe?: string };
  cta?: { line1En?: string; line1He?: string; line2En?: string; line2He?: string; descEn?: string; descHe?: string; btnEn?: string; btnHe?: string };
  footer?: { copyrightEn?: string; copyrightHe?: string };
};

const QUERY = `*[_type == "landingPage"][0]{
  hero, stats, scene1, scene2, platform, cta, footer
}`;

export async function getSanityLandingContent(): Promise<SanityLandingContent | null> {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return null;
  try {
    return await sanityClient.fetch(QUERY);
  } catch {
    return null;
  }
}
