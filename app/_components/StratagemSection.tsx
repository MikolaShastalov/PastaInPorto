"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Stratagem = {
  id: string;
  name: string;
  description: string;
  legend: string;
  faction_id: string;
  type: string;
  cp_cost: string;
  turn: string;
  phase: string;
  detachment: string;
};

export default function StratagemSection({
  factionId,
  stratagems,
  accentRgb,
}: {
  factionId: string;
  stratagems: Stratagem[];
  accentRgb?: string;
}) {
  const storageKey = `wh40k.detachment.${String(factionId || "").toUpperCase()}`;

  const detachments = useMemo(() => {
    const set = new Set<string>();
    for (const s of stratagems) {
      const d = String(s.detachment || "").trim();
      if (d) set.add(d);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [stratagems]);

  const [selectedDetachment, setSelectedDetachment] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && detachments.includes(saved)) {
      setSelectedDetachment(saved);
      return;
    }
    setSelectedDetachment(detachments[0] || "");
  }, [storageKey, detachments]);

  useEffect(() => {
    if (!selectedDetachment) return;
    localStorage.setItem(storageKey, selectedDetachment);
  }, [storageKey, selectedDetachment]);

  const filtered = useMemo(() => {
    if (!selectedDetachment) return stratagems;
    return stratagems.filter((s) => {
      const d = String(s.detachment || "").trim();
      const isCommon = !d;
      return isCommon || d === selectedDetachment;
    });
  }, [stratagems, selectedDetachment]);

  if (stratagems.length === 0) return null;

  return (
    <section style={styles.card}>
      <div style={styles.cardTitle}>Stratagems</div>

      <div style={styles.filterRow}>
        <label style={styles.filterLabel} htmlFor="detachment-select">
          Detachment
        </label>
        <div
          style={{
            ...styles.selectWrap,
            borderColor: accentRgb ? `rgba(${accentRgb}, 0.30)` : styles.selectWrap.borderColor,
            background: accentRgb ? `rgba(${accentRgb}, 0.10)` : styles.selectWrap.background,
            boxShadow: accentRgb ? `0 0 0 1px rgba(${accentRgb}, 0.08) inset` : "none",
          }}
        >
          <select
            id="detachment-select"
            value={selectedDetachment}
            onChange={(e) => setSelectedDetachment(e.target.value)}
            style={styles.select}
          >
            {detachments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <span style={styles.chevron} aria-hidden="true">
            ▾
          </span>
        </div>
      </div>

      <div style={styles.list}>
        {filtered.map((s) => (
          <details key={s.id} style={styles.item}>
            <summary style={styles.summary}>
              <span style={styles.summaryText}>{s.name}</span>
              <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.6)" }}>
                +
              </span>
            </summary>
            <div style={styles.body}>
              <div
                style={styles.bodyInner}
                dangerouslySetInnerHTML={{ __html: String(s.description || "") }}
              />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    borderRadius: 16,
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.02)",
    padding: 12,
    boxShadow: "0 20px 60px rgba(0,0,0,0.16)",
  },
  cardTitle: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    color: "rgba(255, 255, 255, 0.58)",
    fontWeight: 800,
    marginBottom: 8,
  },
  filterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    paddingBottom: 12,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.65)",
    fontWeight: 800,
  },
  selectWrap: {
    position: "relative",
    height: 40,
    minWidth: 170,
    maxWidth: "68%",
    borderRadius: 11,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    display: "flex",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 30,
  },
  select: {
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.92)",
    height: "100%",
    width: "100%",
    padding: 0,
    outline: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    minWidth: 0,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
  },
  chevron: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    pointerEvents: "none",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  item: {
    borderRadius: 14,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.02)",
    overflow: "hidden",
  },
  summary: {
    cursor: "pointer",
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    listStyle: "none",
    fontWeight: 950,
    letterSpacing: "-0.01em",
  },
  summaryText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.92)",
  },
  body: {
    padding: "10px 12px 12px 12px",
    borderTop: "1px solid rgba(255, 255, 255, 0.07)",
  },
  bodyInner: {
    fontSize: 13,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.92)",
  },
};

