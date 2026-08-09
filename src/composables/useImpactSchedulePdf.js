import { jsPDF } from "jspdf";
import { useEventStore } from "@/stores/eventStore";

// ── Page constants (landscape A4) ─────────────────────────────────────────────
const PW = 297;
const PH = 210;
const M  = 12;

// ── Brand colours ─────────────────────────────────────────────────────────────
const BLUE      = [0, 127, 188];
const DARK      = [25, 25, 25];
const GREY_TEXT = [110, 110, 110];
const LINE      = [210, 210, 210];
const BREAK_BG  = [243, 243, 243];
const ALT_BG    = [249, 252, 255];

// ── Helpers ───────────────────────────────────────────────────────────────────
const toMin = (t = "0") => {
  const [h, m = 0] = t.split(":").map(Number);
  return h * 60 + m;
};

const loadImgBase64 = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width  = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d").drawImage(img, 0, 0);
      resolve({ b64: c.toDataURL("image/png"), w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

// ── Draw one page ─────────────────────────────────────────────────────────────
function drawPage(doc, logo, eventCode, dayLabel, roomLabel, slots) {
  const LOGO_AREA_W = 100; // left column for logo
  const TITLE_X     = LOGO_AREA_W + 8;
  const TITLE_W     = PW - TITLE_X - M;
  const HEADER_H    = 90;  // height of the header section

  // ── Logo ────────────────────────────────────────────────────────────────
  if (logo) {
    const aspect  = logo.w / logo.h;
    const maxW    = LOGO_AREA_W - M * 2;
    const maxH    = HEADER_H - M * 2;
    let lw = maxW;
    let lh = lw / aspect;
    if (lh > maxH) { lh = maxH; lw = lh * aspect; }
    const lx = M + (maxW - lw) / 2;
    const ly = M + (maxH - lh) / 2;
    doc.addImage(logo.b64, "PNG", lx, ly, lw, lh);
  }

  // Vertical divider between logo and title
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.5);
  doc.line(LOGO_AREA_W, M, LOGO_AREA_W, HEADER_H - 4);

  // ── Title block ──────────────────────────────────────────────────────────
  let ty = 22;

  // Event code
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY_TEXT);
  doc.text(eventCode, TITLE_X, ty);
  ty += 11;

  // FIRST Impact Award (large, blue)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BLUE);
  doc.text("FIRST Impact Award", TITLE_X, ty);
  ty += 5;

  // Blue separator bar
  doc.setFillColor(...BLUE);
  doc.rect(TITLE_X, ty, TITLE_W, 1.2, "F");
  ty += 10;

  // INTERVIEW TIMES
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text("INTERVIEW TIMES", TITLE_X, ty);
  ty += 9;

  // Day · Room
  doc.setFontSize(14);
  doc.text(
    `${dayLabel.toUpperCase()}  ·  ${roomLabel.toUpperCase()}`,
    TITLE_X, ty
  );

  // Horizontal divider between header and tables
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.5);
  doc.line(M, HEADER_H, PW - M, HEADER_H);

  // ── Tables ───────────────────────────────────────────────────────────────
  const TABLE_TOP  = HEADER_H + 4;
  const TABLE_H    = PH - TABLE_TOP - M;
  const GAP        = 10;
  const TABLE_W    = (PW - 2 * M - GAP) / 2;

  const half  = Math.ceil(slots.length / 2);
  const left  = slots.slice(0, half);
  const right = slots.slice(half);

  drawTable(doc, M,                  TABLE_TOP, TABLE_W, TABLE_H, left);
  drawTable(doc, M + TABLE_W + GAP,  TABLE_TOP, TABLE_W, TABLE_H, right);
}

function drawTable(doc, x, y, tableW, maxH, slots) {
  const ROW_H  = Math.min(12, (maxH - 12) / Math.max(slots.length, 1));
  const CLAMP  = Math.max(9, Math.min(12, ROW_H));  // keep rows between 9-12mm
  const COL_T  = tableW * 0.36;  // TIME column
  const COL_M  = tableW - COL_T; // TEAM column

  // ── Header row ──────────────────────────────────────────────────────────
  doc.setFillColor(...BLUE);
  doc.rect(x, y, tableW, CLAMP, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("TIME", x + COL_T / 2, y + CLAMP * 0.65, { align: "center" });
  doc.text("TEAM", x + COL_T + COL_M / 2, y + CLAMP * 0.65, { align: "center" });

  // Outer border
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.5);
  const totalH = CLAMP + slots.length * CLAMP;
  doc.rect(x, y, tableW, totalH);

  // Column divider
  doc.line(x + COL_T, y, x + COL_T, y + totalH);

  // ── Data rows ────────────────────────────────────────────────────────────
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const ry   = y + CLAMP + i * CLAMP;
    const isSpecial = slot.slotType !== "team";

    // Row background
    if (isSpecial) {
      doc.setFillColor(...BREAK_BG);
      doc.rect(x, ry, tableW, CLAMP, "F");
    } else if (i % 2 === 1) {
      doc.setFillColor(...ALT_BG);
      doc.rect(x, ry, tableW, CLAMP, "F");
    }

    // Row divider
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.25);
    doc.line(x, ry, x + tableW, ry);

    const cy = ry + CLAMP * 0.65; // vertical centre of text

    // TIME cell
    doc.setFont("helvetica", isSpecial ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(slot.slotTime ?? "", x + COL_T / 2, cy, { align: "center" });

    // TEAM / label cell
    const label =
      slot.slotType === "lunch" ? "LUNCH" :
      slot.slotType === "break" ? "BREAK" :
      slot.teamNumber ?? "";

    doc.setFont("helvetica", isSpecial ? "bold" : "normal");
    if (isSpecial) {
      doc.setTextColor(...GREY_TEXT);
    } else {
      doc.setTextColor(...DARK);
    }
    doc.text(label, x + COL_T + COL_M / 2, cy, { align: "center" });
  }
}

// ── Public composable ─────────────────────────────────────────────────────────
export function useImpactSchedulePdf() {
  const eventStore = useEventStore();

  const generate = async ({ days, rooms, fetchSlotsRaw }) => {
    const code = eventStore.selectedEvent?.value?.toUpperCase() ?? "—";

    // Pre-load logo
    const logoSrc = require("@/assets/logo_frc_biocore_vertical.png");
    const logo    = await loadImgBase64(logoSrc);

    const doc       = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    let firstPage   = true;

    for (const day of days) {
      for (const room of rooms) {
        const raw    = await fetchSlotsRaw(day.idDay, room.idRoom);
        const sorted = [...raw].sort((a, b) => toMin(a.slotTime) - toMin(b.slotTime));

        if (!firstPage) doc.addPage();
        firstPage = false;

        drawPage(doc, logo, code, day.label, room.name, sorted);
      }
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`impact-schedule-${code}-${dateStr}.pdf`);
  };

  return { generate };
}
