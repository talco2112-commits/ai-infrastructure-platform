import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle,
} from "docx";
import PptxGenJS from "pptxgenjs";

export interface ReportTable { headers: string[]; rows: string[][] }
export interface ReportSection {
  heading: string;
  paragraph?: string;
  bullets?: string[];
  table?: ReportTable;
}
export interface ReportPayload {
  format: "pdf" | "docx" | "pptx";
  title: string;
  subtitle?: string;
  sections: ReportSection[];
}

const HEBREW_RE = /[֐-׿]/;
function isHebrew(text: string | undefined): boolean {
  return !!text && HEBREW_RE.test(text);
}

// pdf-lib's standard fonts only support WinAnsi (cp1252) encoding — no arrows,
// shekel sign, checkmarks, emoji, or Hebrew. Map common symbols and strip the rest.
const PDF_CHAR_REPLACEMENTS: [string, string][] = [
  ["→", "->"], ["←", "<-"], ["↑", "^"], ["↓", "v"],
  ["₪", "NIS "], ["⚠️", "[!]"], ["⚠", "[!]"], ["✓", "OK"], ["✔", "OK"], ["✗", "X"],
  ["•", "-"], ["…", "..."], ["–", "-"], ["—", "-"],
];
function sanitizeForPdf(text: string): string {
  let out = text;
  for (const [from, to] of PDF_CHAR_REPLACEMENTS) out = out.split(from).join(to);
  return out.replace(/[^\x20-\x7E]/g, "");
}

function sanitizePayloadForPdf(payload: ReportPayload): ReportPayload {
  return {
    ...payload,
    title: sanitizeForPdf(payload.title),
    subtitle: payload.subtitle ? sanitizeForPdf(payload.subtitle) : undefined,
    sections: payload.sections.map((s) => ({
      heading: sanitizeForPdf(s.heading),
      paragraph: s.paragraph ? sanitizeForPdf(s.paragraph) : undefined,
      bullets: s.bullets?.map(sanitizeForPdf),
      table: s.table
        ? { headers: s.table.headers.map(sanitizeForPdf), rows: s.table.rows.map((r) => r.map(sanitizeForPdf)) }
        : undefined,
    })),
  };
}

// ── PDF (pdf-lib, standard fonts only — Latin/English content) ──────────────
export async function generatePdfBuffer(rawPayload: ReportPayload): Promise<Buffer> {
  const payload = sanitizePayloadForPdf(rawPayload);
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const pageWidth = 612;
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;

  let page: PDFPage = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function ensureSpace(needed: number) {
    if (y - needed < margin) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  }

  function wrapText(text: string, size: number, f: PDFFont): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const trial = line ? `${line} ${w}` : w;
      if (f.widthOfTextAtSize(trial, size) > maxWidth) {
        if (line) lines.push(line);
        line = w;
      } else {
        line = trial;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawParagraph(text: string, size = 10, f = font, gap = 14) {
    for (const line of wrapText(text, size, f)) {
      ensureSpace(gap);
      page.drawText(line, { x: margin, y, size, font: f, color: rgb(0.15, 0.13, 0.11) });
      y -= gap;
    }
  }

  // Title
  ensureSpace(30);
  page.drawText(payload.title, { x: margin, y, size: 20, font: bold, color: rgb(0.35, 0.22, 0.11) });
  y -= 26;
  if (payload.subtitle) {
    ensureSpace(18);
    page.drawText(payload.subtitle, { x: margin, y, size: 11, font, color: rgb(0.4, 0.38, 0.36) });
    y -= 22;
  }
  ensureSpace(10);
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.85, 0.8, 0.75) });
  y -= 20;

  for (const section of payload.sections) {
    ensureSpace(24);
    page.drawText(section.heading, { x: margin, y, size: 13, font: bold, color: rgb(0.2, 0.15, 0.1) });
    y -= 18;

    if (section.paragraph) {
      drawParagraph(section.paragraph);
      y -= 4;
    }

    if (section.bullets) {
      for (const b of section.bullets) {
        const lines = wrapText(b, 10, font);
        lines.forEach((line, i) => {
          ensureSpace(14);
          page.drawText(i === 0 ? `•  ${line}` : `    ${line}`, { x: margin, y, size: 10, font, color: rgb(0.15, 0.13, 0.11) });
          y -= 14;
        });
      }
      y -= 4;
    }

    if (section.table) {
      const { headers, rows } = section.table;
      const colWidth = maxWidth / headers.length;
      ensureSpace(16);
      headers.forEach((h, i) => {
        page.drawText(h, { x: margin + i * colWidth, y, size: 9, font: bold, color: rgb(0.35, 0.22, 0.11) });
      });
      y -= 14;
      ensureSpace(2);
      page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.85, 0.8, 0.75) });
      y -= 12;
      for (const row of rows) {
        ensureSpace(14);
        row.forEach((cell, i) => {
          const truncated = font.widthOfTextAtSize(cell, 9) > colWidth - 6
            ? cell.slice(0, Math.floor((colWidth - 6) / 5)) + "..."
            : cell;
          page.drawText(truncated, { x: margin + i * colWidth, y, size: 9, font, color: rgb(0.15, 0.13, 0.11) });
        });
        y -= 14;
      }
      y -= 8;
    }
    y -= 6;
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

// ── DOCX (full Hebrew/RTL + English support) ─────────────────────────────────
export async function generateDocxBuffer(payload: ReportPayload): Promise<Buffer> {
  const docHe = isHebrew(payload.title) || isHebrew(payload.subtitle);

  function para(text: string, opts: { bold?: boolean; size?: number; heading?: typeof HeadingLevel[keyof typeof HeadingLevel]; color?: string } = {}) {
    const rtl = isHebrew(text) || docHe;
    return new Paragraph({
      heading: opts.heading,
      alignment: rtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
      bidirectional: rtl,
      spacing: { after: 160 },
      children: [new TextRun({ text, bold: opts.bold, size: opts.size, color: opts.color })],
    });
  }

  const children: (Paragraph | Table)[] = [];
  children.push(para(payload.title, { heading: HeadingLevel.TITLE, color: "8B5A2B" }));
  if (payload.subtitle) children.push(para(payload.subtitle, { color: "57534E", size: 20 }));

  for (const section of payload.sections) {
    children.push(para(section.heading, { heading: HeadingLevel.HEADING_1, bold: true, color: "6B3E18" }));
    if (section.paragraph) children.push(para(section.paragraph));
    if (section.bullets) {
      for (const b of section.bullets) {
        const rtl = isHebrew(b) || docHe;
        children.push(new Paragraph({
          bullet: { level: 0 },
          alignment: rtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
          bidirectional: rtl,
          children: [new TextRun({ text: b })],
        }));
      }
    }
    if (section.table) {
      const { headers, rows } = section.table;
      const borders = {
        top: { style: BorderStyle.SINGLE, size: 2, color: "EDE8DF" },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: "EDE8DF" },
        left: { style: BorderStyle.SINGLE, size: 2, color: "EDE8DF" },
        right: { style: BorderStyle.SINGLE, size: 2, color: "EDE8DF" },
      };
      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: headers.map((h) => new TableCell({
              borders,
              shading: { fill: "F5EBE0" },
              children: [para(h, { bold: true, size: 20 })],
            })),
          }),
          ...rows.map((r) => new TableRow({
            children: r.map((cell) => new TableCell({ borders, children: [para(cell, { size: 18 })] })),
          })),
        ],
      }));
      children.push(new Paragraph({ text: "" }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

// ── PPTX (full Hebrew/RTL + English support, one slide per section) ─────────
export async function generatePptxBuffer(payload: ReportPayload): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 10, height: 5.63 });
  pptx.layout = "WIDE";

  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "1A1512" };
  titleSlide.addText(payload.title, {
    x: 0.5, y: 2.0, w: 9, h: 1.2, fontSize: 32, bold: true, color: "F5EBE0",
    align: isHebrew(payload.title) ? "right" : "left", rtlMode: isHebrew(payload.title),
    fontFace: "Arial",
  });
  if (payload.subtitle) {
    titleSlide.addText(payload.subtitle, {
      x: 0.5, y: 3.1, w: 9, h: 0.6, fontSize: 16, color: "C49A6C",
      align: isHebrew(payload.subtitle) ? "right" : "left", rtlMode: isHebrew(payload.subtitle),
      fontFace: "Arial",
    });
  }

  for (const section of payload.sections) {
    const slide = pptx.addSlide();
    slide.background = { color: "FAF8F5" };
    const rtl = isHebrew(section.heading);

    slide.addText(section.heading, {
      x: 0.4, y: 0.3, w: 9.2, h: 0.7, fontSize: 24, bold: true, color: "6B3E18",
      align: rtl ? "right" : "left", rtlMode: rtl, fontFace: "Arial",
    });

    let bodyY = 1.15;

    if (section.paragraph) {
      const prtl = isHebrew(section.paragraph);
      slide.addText(section.paragraph, {
        x: 0.4, y: bodyY, w: 9.2, h: 1.0, fontSize: 14, color: "1C1917",
        align: prtl ? "right" : "left", rtlMode: prtl, fontFace: "Arial", valign: "top",
      });
      bodyY += 1.1;
    }

    if (section.bullets) {
      const brtl = section.bullets.some(isHebrew);
      slide.addText(
        section.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
        {
          x: 0.4, y: bodyY, w: 9.2, h: 3.9 - bodyY, fontSize: 13, color: "1C1917",
          align: brtl ? "right" : "left", rtlMode: brtl, fontFace: "Arial", valign: "top",
        }
      );
      bodyY += 0.1;
    }

    if (section.table) {
      const { headers, rows } = section.table;
      const tableRows = [
        headers.map((h) => ({ text: h, options: { bold: true, fill: { color: "F5EBE0" }, color: "6B3E18" } })),
        ...rows.map((r) => r.map((c) => ({ text: c }))),
      ];
      slide.addTable(tableRows, {
        x: 0.4, y: bodyY, w: 9.2, h: Math.min(3.9 - bodyY, 0.35 * tableRows.length),
        fontSize: 11, color: "1C1917", border: { type: "solid", color: "EDE8DF", pt: 0.5 },
        align: headers.some(isHebrew) ? "right" : "left",
      });
    }
  }

  const buf = await pptx.write({ outputType: "nodebuffer" });
  return buf as Buffer;
}

export async function generateReportBuffer(payload: ReportPayload): Promise<{ buffer: Buffer; mime: string; ext: string }> {
  if (payload.format === "docx") {
    return { buffer: await generateDocxBuffer(payload), mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: "docx" };
  }
  if (payload.format === "pptx") {
    return { buffer: await generatePptxBuffer(payload), mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", ext: "pptx" };
  }
  return { buffer: await generatePdfBuffer(payload), mime: "application/pdf", ext: "pdf" };
}
