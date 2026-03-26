import { getData, getDatasheets, getDetachmentsForFaction } from "@/lib/data";
import type { CSSProperties } from "react";
import UnitSearchList from "@/app/_components/UnitSearchList";

export default async function FactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = getData();
  const datasheets = getDatasheets();
  const detachments = getDetachmentsForFaction(id);

  const faction = data.find((f) => f.id === id);
  const units = datasheets.filter((d) => d.faction_id === id);
  const accent = getFactionAccent(id);

  if (!faction) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <a href="/" style={styles.backLink}>
            <span aria-hidden="true" style={styles.backIcon}>
              ←
            </span>
            Back
          </a>
          <div style={styles.notFound}>Faction not found</div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ ...styles.page, background: getPageBackground(accent.rgb) }}>
      <style>{`
        .factionDetachmentTile {
          transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
        }
        .factionDetachmentTile:hover {
          transform: translateY(-1px);
          border-color: rgba(${accent.rgb}, 0.38);
          background: rgba(${accent.rgb}, 0.10);
          box-shadow: 0 0 0 1px rgba(${accent.rgb}, 0.18);
        }
        .factionUnits .unitHint {
          display: none;
        }
      `}</style>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <a href="/" style={styles.backLink}>
            <span aria-hidden="true" style={styles.backIcon}>
              ←
            </span>
            Back
          </a>
        </div>

        <header style={styles.header}>
          <h1 style={styles.title}>{faction.name}</h1>
          <p style={styles.subtitle}>Units in this faction</p>
        </header>

        {detachments.length > 0 && (
          <section style={styles.detachmentSection}>
            <details style={styles.detachmentDetails} open>
              <summary style={styles.detachmentSummary}>
                <span style={styles.sectionTitle}>Detachments</span>
                <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.6)" }}>
                  +
                </span>
              </summary>
              <div style={styles.detachmentGrid}>
                {detachments.map((d) => (
                  <a
                    key={`${d.id}-${d.name}`}
                    href={`/detachment/${encodeURIComponent(d.name)}`}
                    style={styles.detachmentCard}
                    className="factionDetachmentTile"
                  >
                    <div style={styles.detachmentName}>{d.name}</div>
                  </a>
                ))}
              </div>
            </details>
          </section>
        )}

        <div className="factionUnits">
          <UnitSearchList units={units} />
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0b0f14",
    color: "rgba(255, 255, 255, 0.92)",
  },
  container: {
    padding: 16,
    maxWidth: 720,
    margin: "0 auto",
  },
  topBar: {
    paddingTop: 8,
    paddingBottom: 10,
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    textDecoration: "none",
    color: "rgba(255, 255, 255, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.03)",
  },
  backIcon: {
    display: "inline-flex",
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.05)",
  },
  header: {
    paddingTop: 6,
    paddingBottom: 14,
  },
  title: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.15,
    fontWeight: 700,
    letterSpacing: "-0.03em",
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 0,
    color: "rgba(255, 255, 255, 0.67)",
    fontSize: 14,
  },
  detachmentSection: {
    marginTop: 6,
    marginBottom: 6,
  },
  detachmentDetails: {
    borderRadius: 13,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.02)",
    overflow: "hidden",
    backdropFilter: "blur(6px)",
    transition: "all 0.2s ease",
  },
  detachmentSummary: {
    cursor: "pointer",
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    listStyle: "none",
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "rgba(255, 255, 255, 0.66)",
    fontWeight: 800,
    marginBottom: 0,
  },
  detachmentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 8,
    padding: 10,
  },
  detachmentCard: {
    display: "block",
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "#111827",
    padding: "10px 11px",
    textDecoration: "none",
    color: "rgba(255, 255, 255, 0.94)",
    backdropFilter: "blur(6px)",
  },
  detachmentName: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1.25,
  },
  notFound: {
    marginTop: 16,
    color: "rgba(255, 255, 255, 0.78)",
    fontWeight: 700,
  },
};

function getFactionAccent(factionId: string) {
  const f = String(factionId || "").toUpperCase();
  const presets: Array<{ test: (v: string) => boolean; rgb: string }> = [
    { test: (v) => v === "ADM", rgb: "220, 70, 70" },
    { test: (v) => v === "NEC", rgb: "70, 190, 120" },
    { test: (v) => v === "EC", rgb: "214, 92, 201" },
    { test: (v) => v === "SM", rgb: "85, 136, 220" },
    { test: (v) => v.includes("ORK"), rgb: "93, 170, 78" },
    { test: (v) => v === "AE", rgb: "146, 103, 214" },
    { test: (v) => v.includes("CSM") || v.includes("CHAOS"), rgb: "150, 50, 60" },
  ];
  const rgb = presets.find((p) => p.test(f))?.rgb ?? "90, 130, 210";
  return { rgb };
}

function getPageBackground(rgb: string) {
  return `radial-gradient(900px 500px at 70% 0%, rgba(${rgb}, 0.16), transparent 56%), radial-gradient(800px 500px at 10% -10%, rgba(${rgb}, 0.09), transparent 60%), #0b0f14`;
}