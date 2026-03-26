"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

type Unit = {
  id: string;
  name: string;
  faction_id: string;
};

export default function UnitSearchList({ units }: { units: Unit[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return units;
    return units.filter((u) => u.name.toLowerCase().includes(q));
  }, [query, units]);

  return (
    <section style={styles.section}>
      <style>{`
        .unitCard {
          text-decoration: none;
          color: inherit;
          transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
          will-change: transform;
        }
        .unitCard:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.025);
        }
        .unitCard:active {
          transform: translateY(0);
        }
      `}</style>

      <div style={styles.searchWrap}>
        <span style={styles.searchIcon} aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M16.5 16.5L21 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <input
          style={styles.searchInput}
          placeholder="Search units..."
          aria-label="Search units"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={styles.list}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>No units found</div>
        ) : (
          filtered.map((u) => (
            <a
              key={u.id}
              href={`/unit/${u.id}`}
              className="unitCard"
              style={styles.unitCard}
            >
              <div style={styles.unitName}>{u.name}</div>
            </a>
          ))
        )}
      </div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  section: {
    marginTop: 14,
  },
  searchWrap: {
    marginTop: 0,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
    userSelect: "none",
  },
  searchInput: {
    width: "100%",
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(255, 255, 255, 0.04)",
    outline: "none",
    padding: "0 12px 0 36px",
    color: "rgba(255, 255, 255, 0.92)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  },
  list: {
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingBottom: 28,
  },
  unitCard: {
    borderRadius: 14,
    border: "1px solid rgba(255, 255, 255, 0.09)",
    background: "rgba(255, 255, 255, 0.018)",
    padding: 12,
  },
  unitName: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  unitHint: {
    marginTop: 7,
    color: "rgba(255, 255, 255, 0.58)",
    fontSize: 12,
  },
  empty: {
    borderRadius: 14,
    border: "1px dashed rgba(255, 255, 255, 0.12)",
    background: "rgba(255, 255, 255, 0.018)",
    padding: 16,
    color: "rgba(255, 255, 255, 0.70)",
    fontWeight: 700,
  },
};

