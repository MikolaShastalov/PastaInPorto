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
    const spaceAbove = rect.top;
    const showBelow = spaceAbove < estimatedHeight;

    const desiredLeft = rect.left + rect.width / 2 - width / 2;
    const safeLeft = Math.max(8, Math.min(desiredLeft, vw - width - 8));
    const top = showBelow ? rect.bottom + gap : rect.top - gap - estimatedHeight;

    setPlacement(showBelow ? "below" : "above");
    setPosition({ top, left: safeLeft });
    setOpenKey(key);
  };

  const placePopoverAtPoint = (key: string, x: number, y: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(240, vw - 16);
    const estimatedHeight = 190;
    const gap = 8;

    // If there's not enough space above, show below.
    const spaceAbove = y;
    const showBelow = spaceAbove < estimatedHeight;

    const desiredLeft = x - width / 2;
    const safeLeft = Math.max(8, Math.min(desiredLeft, vw - width - 8));
    const top = showBelow ? y + gap : y - gap - estimatedHeight;

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
                borderColor: accentRgb ? `rgba(${accentRgb}, 0.30)` : "rgba(255, 255, 255, 0.09)",
background: accentRgb ? `rgba(${accentRgb}, 0.11)` : "rgba(255, 255, 255, 0.028)",
              }}
              onMouseEnter={(e) => {
                placePopoverAtPoint(item.label, e.clientX, e.clientY);
              }}
              onPointerDown={(e) => {
                // Mobile/touch: ensure tap opens the popover.
                if (e.pointerType !== "mouse") {
                  e.preventDefault();
                  e.stopPropagation();
                  placePopoverAtPoint(item.label, e.clientX, e.clientY);
                }
              }}
              onClick={(e) => {
                // Also open on click for robustness (some mobile browsers synthesize click
                // without pointer events). Keep tap-to-toggle behavior.
                e.preventDefault();
                e.stopPropagation();
                placePopoverAtPoint(item.label, e.clientX, e.clientY);
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
          borderColor: accentRgb ? `rgba(${accentRgb}, 0.30)` : "rgba(255, 255, 255, 0.10)",
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
    marginTop: 4,
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    borderRadius: 9999,
    border: "1px solid rgba(255, 255, 255, 0.11)",
    background: "rgba(255, 255, 255, 0.028)",
    color: "rgba(255, 255, 255, 0.80)",
    fontSize: 12,
    fontWeight: 800,
    padding: "4px 9px",
    lineHeight: 1.2,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  popover: {
    position: "fixed",
    zIndex: 75,
    width: 240,
    maxWidth: "calc(100vw - 16px)",
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(10,14,22,0.93)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 12px 34px rgba(0,0,0,0.40)",
    padding: "9px 12px",
    transition: "opacity 0.15s ease, transform 0.15s ease",
    opacity: 1,
  },
  popoverTitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.95)",
    fontWeight: 700,
    marginBottom: 5,
  },
  popoverDescription: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 1.35,
    maxHeight: 220,
    overflowY: "auto",
  },
};

