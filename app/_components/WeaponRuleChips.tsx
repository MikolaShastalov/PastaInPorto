"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type RuleItem = {
  label: string;
  description: string;
};

export default function WeaponRuleChips({
  items,
  accentRgb,
}: {
  items: RuleItem[];
  accentRgb?: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [placement, setPlacement] = useState<"above" | "below">("above");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current) return;
      if (event.target instanceof Node && !rootRef.current.contains(event.target)) {
        setOpenKey(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const itemMap = useMemo(() => {
    const map = new Map<string, RuleItem>();
    for (const i of items) map.set(i.label, i);
    return map;
  }, [items]);

  const placePopover = (key: string) => {
    const trigger = triggerRefs.current[key];
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(240, vw - 16);
    const estimatedHeight = 190;
    const gap = 8;
    const aboveSpace = rect.top;
    const showBelow = aboveSpace < estimatedHeight;

    const desiredLeft = rect.left + rect.width / 2 - width / 2;
    const safeLeft = Math.max(8, Math.min(desiredLeft, vw - width - 8));
    const top = showBelow ? rect.bottom + gap : rect.top - gap;

    setPlacement(showBelow ? "below" : "above");
    setPosition({ top, left: safeLeft });
    setOpenKey(key);
  };

  return (
    <div ref={rootRef} style={styles.wrap}>
      {items.map((item) => {
        const isOpen = openKey === item.label;
        return (
          <div
            key={item.label}
            onMouseLeave={() => {
              if (openKey === item.label) setOpenKey(null);
            }}
          >
            <button
              type="button"
              ref={(el) => {
                triggerRefs.current[item.label] = el;
              }}
              style={{
                ...styles.chip,
                borderColor: accentRgb ? `rgba(${accentRgb}, 0.35)` : styles.chip.border,
                background: accentRgb ? `rgba(${accentRgb}, 0.14)` : styles.chip.background,
              }}
              onMouseEnter={() => placePopover(item.label)}
              onClick={() => {
                if (isOpen) {
                  setOpenKey(null);
                } else {
                  placePopover(item.label);
                }
              }}
            >
              {item.label}
            </button>
          </div>
        );
      })}

      {openKey && position && itemMap.get(openKey) && (
        <div
          style={{
            ...styles.popover,
            top: position.top,
            left: position.left,
            transform: placement === "above" ? "translateY(-100%)" : "none",
            borderColor: accentRgb ? `rgba(${accentRgb}, 0.35)` : styles.popover.border,
          }}
        >
          <div style={styles.popoverTitle}>{openKey}</div>
          {itemMap.get(openKey)?.description ? (
            <div style={styles.popoverDescription}>{itemMap.get(openKey)?.description}</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrap: {
    marginTop: 6,
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    borderRadius: 9999,
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(255, 255, 255, 0.03)",
    color: "rgba(255, 255, 255, 0.76)",
    fontSize: 13,
    fontWeight: 800,
    padding: "3px 8px",
    lineHeight: 1.2,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  popover: {
    position: "fixed",
    zIndex: 70,
    width: 240,
    maxWidth: "calc(100vw - 16px)",
    borderRadius: 10,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(20,20,30,0.95)",
    boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
    padding: "10px 12px",
    transition: "opacity 0.15s ease, transform 0.15s ease",
    opacity: 1,
  },
  popoverTitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    fontWeight: 700,
    marginBottom: 6,
  },
  popoverDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 1.4,
    maxHeight: 220,
    overflowY: "auto",
  },
};

