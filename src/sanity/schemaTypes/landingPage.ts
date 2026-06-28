import { defineField, defineType } from "sanity";

const bilingualString = (name: string, titleEn: string, titleHe: string) => [
  defineField({ name: `${name}En`, title: titleEn, type: "string" }),
  defineField({ name: `${name}He`, title: titleHe, type: "string" }),
];

const bilingualText = (name: string, titleEn: string, titleHe: string) => [
  defineField({ name: `${name}En`, title: titleEn, type: "text", rows: 3 }),
  defineField({ name: `${name}He`, title: titleHe, type: "text", rows: 3 }),
];

export const landingPageSchema = defineType({
  name: "landingPage",
  title: "Landing Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      initialValue: "Landing Page",
    }),

    // ── Hero ─────────────────────────────────────
    defineField({
      name: "hero",
      title: "Hero Section",
      type: "object",
      fields: [
        ...bilingualString("headline1", "Headline line 1 (EN)", "Headline line 1 (HE)"),
        ...bilingualString("headline2", "Headline line 2 (EN)", "Headline line 2 (HE)"),
        ...bilingualText("heroDesc", "Description (EN)", "Description (HE)"),
        ...bilingualString("ctaPrimary", "Primary button (EN)", "Primary button (HE)"),
        ...bilingualString("ctaSecondary", "Secondary button (EN)", "Secondary button (HE)"),
      ],
    }),

    // ── Stats ────────────────────────────────────
    defineField({
      name: "stats",
      title: "Stats (3 items)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "value", title: "Value", type: "string" }),
            ...bilingualString("label", "Label (EN)", "Label (HE)"),
          ],
          preview: { select: { title: "value", subtitle: "labelEn" } },
        },
      ],
      validation: (r) => r.max(3),
    }),

    // ── Scene panels ─────────────────────────────
    defineField({
      name: "scene1",
      title: "Scene Panel 1 (PM office)",
      type: "object",
      fields: [
        ...bilingualString("title", "Title (EN)", "Title (HE)"),
        ...bilingualText("desc", "Description (EN)", "Description (HE)"),
      ],
    }),

    defineField({
      name: "scene2",
      title: "Scene Panel 2 (Boardroom)",
      type: "object",
      fields: [
        ...bilingualString("title", "Title (EN)", "Title (HE)"),
        ...bilingualText("desc", "Description (EN)", "Description (HE)"),
      ],
    }),

    // ── Platform section ─────────────────────────
    defineField({
      name: "platform",
      title: "Platform Section",
      type: "object",
      fields: [
        ...bilingualString("tag", "Tag (EN)", "Tag (HE)"),
        ...bilingualString("title", "Title (EN)", "Title (HE)"),
        ...bilingualText("desc", "Description (EN)", "Description (HE)"),
      ],
    }),

    // ── CTA section ──────────────────────────────
    defineField({
      name: "cta",
      title: "CTA Section",
      type: "object",
      fields: [
        ...bilingualString("line1", "Line 1 (EN)", "Line 1 (HE)"),
        ...bilingualString("line2", "Line 2 (EN)", "Line 2 (HE)"),
        ...bilingualText("desc", "Description (EN)", "Description (HE)"),
        ...bilingualString("btn", "Button text (EN)", "Button text (HE)"),
      ],
    }),

    // ── Footer ───────────────────────────────────
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      fields: [
        ...bilingualString("copyright", "Copyright (EN)", "Copyright (HE)"),
      ],
    }),
  ],

  preview: {
    select: { title: "title" },
  },
});
