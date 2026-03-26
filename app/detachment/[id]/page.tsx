import {
  getDetachmentRule,
  getEnhancementsForDetachment,
  getStratagemsForDetachment,
} from "@/lib/data";
import type { CSSProperties } from "react";

export default async function DetachmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detachmentId = decodeURIComponent(String(id || "").trim());

  const rule = getDetachmentRule(detachmentId);
  const enhancements = getEnhancementsForDetachment(detachmentId);
  const stratagems = getStratagemsForDetachment(detachmentId);

  if (!rule) {
    return <div>Detachment not found: {detachmentId}</div>;
  }
  const accent = getFactionAccent(rule.faction_id);

  return (
    <main style={{ ...styles.page, background: getPageBackground(accent.rgb) }}>
      <div style={styles.container}>
        <header style={styles.headerRow}>
          <a
            href={`/faction/${rule.faction_id}`}
            style={styles.backLink}
            aria-label="Back to faction"
            title="Back"
          >
            <span aria-hidden="true" style={styles.backIcon}>
              ←
            </span>
          </a>
          <div style={styles.titleBlock}>
            <div style={styles.breadcrumb}>
              {rule.faction_id} &gt; {rule.detachment}
            </div>
            <h1 style={styles.title}>{rule.detachment}</h1>
          </div>
        </header>

        <div style={styles.stack}>
          <section style={styles.card}>
            <details style={styles.item} open>
              <summary style={styles.summary}>
                <span style={styles.summaryText}>Detachment Rule</span>
                <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.6)" }}>
                  +
                </span>
              </summary>
              <div style={styles.body}>
                <div style={styles.ruleName}>{rule.name}</div>
                <RichText value={rule.description} />
              </div>
            </details>
          </section>

          {enhancements.length > 0 && (
            <section style={styles.card}>
              <div style={styles.cardTitle}>Enhancements</div>
              <div style={styles.list}>
                {enhancements.map((e) => (
                  <details key={e.id} style={styles.item} open>
                    <summary style={styles.summary}>
                      <span style={styles.summaryText}>{e.name}</span>
                      <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.6)" }}>
                        +
                      </span>
                    </summary>
                    <div style={styles.body}>
                      <div style={styles.bodyInner}>
                        <RichText value={e.description} compact />
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {stratagems.length > 0 && (
            <section style={styles.card}>
              <div style={styles.cardTitle}>Stratagems</div>
              <div style={styles.list}>
                {stratagems.map((s) => (
                  <details key={s.id} style={styles.item} open>
                    <summary style={styles.summary}>
                      <span style={styles.summaryText}>{s.name}</span>
                      <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.6)" }}>
                        +
                      </span>
                    </summary>
                    <div style={styles.body}>
                      <div style={styles.bodyInner}>
                        <RichText value={s.description} compact />
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function RichText({ value, compact }: { value: string; compact?: boolean }) {
  const v = String(value || "").trim();
  if (!v) return null;
  return (
    <div
      style={compact ? styles.richTextCompact : styles.richText}
      dangerouslySetInnerHTML={{ __html: v }}
    />
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    color: "rgba(255, 255, 255, 0.92)",
    background:
      "radial-gradient(900px 500px at 70% 0%, rgba(90, 130, 210, 0.14), transparent 55%), radial-gradient(800px 500px at 10% -10%, rgba(90, 130, 210, 0.08), transparent 60%), #070A10",
  },
  container: {
    width: "100%",
    maxWidth: "100%",
    paddingLeft: 14,
    paddingRight: 14,
  },
  headerRow: {
    paddingTop: 6,
    paddingBottom: 10,
    display: "flex",
    alignItems: "stretch",
    gap: 12,
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
    minHeight: 64,
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
  titleBlock: {
    minWidth: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  breadcrumb: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(255, 255, 255, 0.58)",
    fontWeight: 800,
    marginBottom: 4,
  },
  title: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.15,
    fontWeight: 700,
    letterSpacing: "-0.03em",
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  card: {
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.07)",
    background: "rgba(255, 255, 255, 0.02)",
    padding: 10,
    boxShadow: "0 10px 28px rgba(0,0,0,0.16)",
    backdropFilter: "blur(6px)",
    transition: "all 0.2s ease",
  },
  cardTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.055em",
    color: "rgba(255, 255, 255, 0.62)",
    fontWeight: 900,
    marginBottom: 6,
  },
  ruleName: {
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: "-0.01em",
    marginBottom: 7,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },
  item: {
    borderRadius: 11,
    border: "1px solid rgba(255, 255, 255, 0.07)",
    background: "rgba(255, 255, 255, 0.02)",
    overflow: "hidden",
    transition: "all 0.2s ease",
  },
  summary: {
    cursor: "pointer",
    padding: "9px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    listStyle: "none",
    fontWeight: 900,
    letterSpacing: "-0.01em",
  },
  summaryText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.92)",
  },
  body: {
    padding: "9px 12px 12px 12px",
    borderTop: "1px solid rgba(255, 255, 255, 0.07)",
  },
  bodyInner: {
    fontSize: 12.5,
    lineHeight: 1.45,
    color: "rgba(255,255,255,0.92)",
  },
  richText: {
    lineHeight: 1.45,
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 13,
    wordBreak: "break-word",
  },
  richTextCompact: {
    lineHeight: 1.38,
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12.5,
    wordBreak: "break-word",
  },
};

function getFactionAccent(factionId: string | undefined) {
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
  return `radial-gradient(900px 500px at 70% 0%, rgba(${rgb}, 0.12), transparent 56%), radial-gradient(800px 500px at 10% -10%, rgba(${rgb}, 0.07), transparent 60%), #070A10`;
}

