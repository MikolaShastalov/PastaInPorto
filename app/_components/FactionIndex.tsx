"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

type Faction = {
  id: string;
  name: string;
  link: string;
};

export default function FactionIndex({ factions }: { factions: Faction[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return factions;
    return factions.filter((f) => f.name.toLowerCase().includes(q));
  }, [factions, query]);

  return (
    <div style={styles.page}>
      <style>{`
        .factionCard {
          text-decoration: none;
          color: inherit;
          transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
          will-change: transform;
        }
        .factionCard:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.03);
        }
        .factionCard:active {
          transform: translateY(0);
        }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <h1 style={styles.title}>Warhammer 40k</h1>

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
              placeholder="Search factions..."
              aria-label="Search factions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>No factions found</div>
        ) : (
          <div style={styles.cardsRow}>
            {filtered.map((item) => (
              <a
                key={item.id}
                href={`/faction/${item.id}`}
                className="factionCard"
                style={styles.card}
              >
                <div style={styles.cardTop}>
                  <div style={styles.cardName}>{item.name}</div>
                  <div style={styles.cardChevron} aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 5H19V10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 14L19 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M19 14V19H5V5H10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 20% -10%, rgba(74, 222, 128, 0.14), transparent 60%), radial-gradient(900px 500px at 90% 0%, rgba(59, 130, 246, 0.18), transparent 55%), #070A10",
    color: "rgba(255, 255, 255, 0.92)",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "rgba(7, 10, 16, 0.72)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  headerInner: {
    padding: "16px 14px",
    maxWidth: 960,
    margin: "0 auto",
  },
  title: {
    margin: 0,
    fontSize: 22,
    letterSpacing: "-0.02em",
    fontWeight: 800,
  },
  searchWrap: {
    marginTop: 12,
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
  main: {
    padding: "14px",
    maxWidth: 960,
    margin: "0 auto",
  },
  cardsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "stretch",
  },
  card: {
    flex: "1 1 260px",
    minWidth: 260,
    borderRadius: 16,
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.02)",
    padding: 14,
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardName: {
    fontWeight: 750,
    letterSpacing: "-0.01em",
  },
  cardChevron: {
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: 16,
  },
  empty: {
    padding: 16,
    borderRadius: 16,
    border: "1px dashed rgba(255, 255, 255, 0.14)",
    background: "rgba(255, 255, 255, 0.02)",
    color: "rgba(255, 255, 255, 0.72)",
    fontWeight: 700,
  },
};

