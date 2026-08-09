import { jsPDF } from "jspdf";
import { useEventStore } from "@/stores/eventStore";

// ── Brand colours ────────────────────────────────────────────────────────────
const BLUE        = [0, 127, 188];
const YELLOW      = [247, 227, 38];
const GREEN       = [0, 150, 70];
const MCI_BG      = [187, 222, 251];
const TA_BG       = [200, 230, 201];
const GREY        = [96, 125, 139];
const DARK        = [30, 30, 30];
const MUTED       = [140, 140, 140];
const AMBER_LIGHT = [255, 248, 225];

// ── Page constants ───────────────────────────────────────────────────────────
const PW     = 210;
const PH     = 297;
const MARGIN = 13;
const W      = PW - 2 * MARGIN;     // 184 mm
const BOTTOM = PH - MARGIN - 8;     // leave 8 mm for page number

export function useBriefingPdf() {
  const eventStore = useEventStore();

  const generate = (groups) => {
    const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const code = eventStore.selectedEvent?.value?.toUpperCase() ?? "—";

    let y = 0;

    // ── Page header ──────────────────────────────────────────────────────────
    const drawPageHeader = () => {
      doc.setFillColor(...BLUE);
      doc.rect(0, 0, PW, 18, "F");

      doc.setFillColor(...YELLOW);
      doc.rect(0, 18, PW, 2.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("Day 2 Briefing", MARGIN, 12.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(
        `${code}  ·  ${new Date().toLocaleString()}`,
        PW - MARGIN, 12.5,
        { align: "right" }
      );

      y = 26;
    };

    // ── Space guard — adds page + header if needed ───────────────────────────
    const need = (mm) => {
      if (y + mm > BOTTOM) {
        doc.addPage();
        drawPageHeader();
      }
    };

    // ── Draw one group section ───────────────────────────────────────────────
    const drawGroup = (group) => {
      need(44);

      const accent = group.pairType === "mci" ? BLUE  : GREEN;
      const bg     = group.pairType === "mci" ? MCI_BG : TA_BG;

      // Header background
      doc.setFillColor(...bg);
      doc.rect(MARGIN, y, W, 16, "F");

      // Left accent stripe
      doc.setFillColor(...accent);
      doc.rect(MARGIN, y, 3, 16, "F");

      // Group letter chip
      doc.setFillColor(...accent);
      doc.roundedRect(MARGIN + 6, y + 3.5, 23, 9, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(`Group ${group.letter}`, MARGIN + 8.5, y + 9.2);

      // Type label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text(
        group.pairType === "mci" ? "Machine Awards" : "Team Awards",
        MARGIN + 33, y + 10
      );

      // Counts (right-aligned)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text(
        `${group.awardData.length} awards  ·  ${group.uniqueTeamCount} teams`,
        MARGIN + W, y + 10,
        { align: "right" }
      );

      y += 20;

      // ── Judges ──────────────────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...GREY);
      doc.text("JUDGES", MARGIN, y);
      y += 4;

      if (group.judges.length > 0) {
        const txt   = group.judges.map((j) => `${j.name} (${j.pair})`).join("   ·   ");
        const lines = doc.splitTextToSize(txt, W);
        need(lines.length * 4.5 + 6);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...DARK);
        doc.text(lines, MARGIN, y);
        y += lines.length * 4.5 + 6;
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text("No judges assigned", MARGIN, y);
        y += 9;
      }

      // ── Awards ──────────────────────────────────────────────────────────
      if (group.awardData.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text("No awards assigned to this group.", MARGIN, y);
        y += 8;
      }

      for (const award of group.awardData) {
        need(14);

        // Accent bar + name
        doc.setFillColor(...accent);
        doc.rect(MARGIN, y, 2, 7.5, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        doc.text(award.name, MARGIN + 5, y + 5.8);
        y += 10;

        if (award.teams.length === 0) {
          need(7);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7);
          doc.setTextColor(...MUTED);
          doc.text("No nominations", MARGIN + 5, y + 3.5);
          y += 7;
        } else {
          for (const team of award.teams) {
            const isMulti = group.teamAwardCounts[team.Teams_idTeams] > 1;

            // Estimate row height: base + possible motive lines
            const firstMotive = team.nominations.find((n) => n.motive);
            let rowH = 6.5;
            if (firstMotive?.motive) {
              const ml = doc.splitTextToSize(`"${firstMotive.motive}"`, W - 14);
              rowH += Math.min(ml.length, 2) * 3.5 + (firstMotive.judge ? 3.5 : 0) + 2;
            }
            need(rowH + 1);

            // Amber highlight for multi-award teams
            if (isMulti) {
              doc.setFillColor(...AMBER_LIGHT);
              doc.rect(MARGIN + 2, y - 0.5, W - 2, 6.5, "F");
            }

            // Team number
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(...accent);
            doc.text(`#${team.teamNumber}`, MARGIN + 5, y + 4.3);

            // Team name
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...DARK);
            const nameStr = doc.splitTextToSize(team.teamName, W - 26)[0];
            doc.text(nameStr, MARGIN + 22, y + 4.3);

            // Multi-award badge
            if (isMulti) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(6);
              doc.setTextColor(180, 90, 0);
              doc.text(
                `×${group.teamAwardCounts[team.Teams_idTeams]}`,
                MARGIN + W, y + 4.3,
                { align: "right" }
              );
            }

            y += 6.5;

            // Nomination motive (italic, max 2 lines)
            if (firstMotive?.motive) {
              const ml    = doc.splitTextToSize(`"${firstMotive.motive}"`, W - 14);
              const shown = ml.slice(0, 2);
              doc.setFont("helvetica", "italic");
              doc.setFontSize(6.5);
              doc.setTextColor(110, 110, 110);
              doc.text(shown, MARGIN + 8, y + 2);
              y += shown.length * 3.5;

              if (firstMotive.judge) {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(6);
                doc.setTextColor(...MUTED);
                doc.text(`— ${firstMotive.judge}`, MARGIN + 10, y + 2.5);
                y += 4;
              } else {
                y += 2;
              }
            }
          }
        }

        y += 5; // gap between awards
      }

      y += 8; // gap between groups
    };

    // ── Render all groups ────────────────────────────────────────────────────
    drawPageHeader();
    for (const group of groups) {
      drawGroup(group);
    }

    // ── Page numbers ─────────────────────────────────────────────────────────
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(180, 180, 180);
      doc.text(`${p} / ${total}`, PW / 2, PH - 5, { align: "center" });
    }

    // ── Download ─────────────────────────────────────────────────────────────
    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`briefing-day2-${code}-${dateStr}.pdf`);
  };

  return { generate };
}
