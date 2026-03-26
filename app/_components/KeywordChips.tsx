"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type KeywordItem = {
  keyword: string;
  units: string[];
};

export default function KeywordChips({
  items,
  accentRgb,
}: {
  items: KeywordItem[];
  accentRgb?: string;
}) {
  const [openKeyword, setOpenKeyword] = useState<string | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [placement, setPlacement] = useState<"above" | "below">("below");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current) return;
      if (event.target instanceof Node && !rootRef.current.contains(event.target)) {
        setOpenKeyword(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const placePopover = (keyword: string) => {
    const trigger = triggerRefs.current[keyword];
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(260, vw - 16);
    const estimatedHeight = 220;
    const gap = 8;
    const belowSpace = vh - rect.bottom;
    const showAbove = belowSpace < estimatedHeight && rect.top > estimatedHeight;

    const desiredLeft = rect.left + rect.width / 2 - width / 2;
    const safeLeft = Math.max(8, Math.min(desiredLeft, vw - width - 8));
    const top = showAbove ? rect.top - gap : rect.bottom + gap;

    setPlacement(showAbove ? "above" : "below");
    setPosition({ top, left: safeLeft });
    setOpenKeyword(keyword);
  };

  return (
    <div ref={rootRef} style={styles.wrap}>
      {items.map((item) => {
        const isOpen = openKeyword === item.keyword;
        return (
          <div
            key={item.keyword}
            style={styles.chipContainer}
            onMouseEnter={() => placePopover(item.keyword)}
          >
            <button
              type="button"
              ref={(el) => {
                triggerRefs.current[item.keyword] = el;
              }}
              style={{
                ...styles.chip,
                borderColor: accentRgb ? `rgba(${accentRgb}, 0.30)` : (styles.chip.border as string),
                background: accentRgb ? `rgba(${accentRgb}, 0.11)` : (styles.chip.background as string),
              }}
              onClick={() =>
                setOpenKeyword((cur) => {
                  if (cur === item.keyword) return null;
                  placePopover(item.keyword);
                  return item.keyword;
                })
              }
            >
              {item.keyword}
            </button>
            {isOpen && position && (
              <div
                style={{
                  ...styles.popover,
                  top: position.top,
                  left: position.left,
                  transform: placement === "above" ? "translateY(-100%)" : "none",
                  borderColor: accentRgb
                      ? `rgba(${accentRgb}, 0.30)`
                      : (styles.popover.border as string),
                }}
              >
                <div style={styles.popoverTitle}>Units with {item.keyword}</div>
                <div style={styles.popoverList}>
                  {item.units.length === 0 ? (
                    <div style={styles.popoverItem}>No matching units</div>
                  ) : (
                    item.units.map((u) => (
                      <div key={u} style={styles.popoverItem}>
                        {u}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 3,
  },
  chipContainer: {
    position: "relative",
  },
  chip: {
    borderRadius: 9999,
    padding: "5px 9px",
    background: "rgba(255, 255, 255, 0.028)",
    border: "1px solid rgba(255, 255, 255, 0.09)",
    color: "rgba(255, 255, 255, 0.90)",
    fontSize: 11.5,
    fontWeight: 850,
    letterSpacing: "-0.01em",
    cursor: "pointer",
  },
  popover: {
    position: "fixed",
    zIndex: 70,
    width: 240,
    maxWidth: "calc(100vw - 16px)",
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(10,14,22,0.93)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 12px 34px rgba(0,0,0,0.40)",
    padding: 9,
  },
  popoverTitle: {
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: "0.095em",
    color: "rgba(255,255,255,0.62)",
    fontWeight: 900,
    marginBottom: 7,
  },
  popoverList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    maxHeight: 200,
    overflowY: "auto",
  },
  popoverItem: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 1.3,
  },
};

