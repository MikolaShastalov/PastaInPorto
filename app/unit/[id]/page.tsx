import {
  getAbilityMasterMap,
  getAbilitiesForDatasheet,
  getCompositionForDatasheet,
  getDatasheets,
  getKeywordsForDatasheet,
  getModelsForDatasheet,
  getStratagemIdsForDatasheet,
  getStratagemMap,
  getWargearForDatasheet,
} from "@/lib/data";
import KeywordChips from "../../_components/KeywordChips";
import StratagemSection from "../../_components/StratagemSection";
import WeaponRuleChips from "../../_components/WeaponRuleChips";
import type { CSSProperties } from "react";

export default async function UnitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const datasheets = getDatasheets();
  const unitId = String(id).trim();

  const unit = datasheets.find(
    (u) => String(u.id).trim() === unitId
  );

  if (!unit) {
    return <div>Unit not found: {unitId}</div>;
  }

  const models = getModelsForDatasheet(unitId);
  const wargear = getWargearForDatasheet(unitId);
  const keywords = getKeywordsForDatasheet(unitId);
  const composition = getCompositionForDatasheet(unitId);
  const dsAbilities = getAbilitiesForDatasheet(unitId);
  const abilityMaster = getAbilityMasterMap();

  const hasModels = models.some((m) => String(m.name || "").trim().length > 0);
  const hasWeapons = wargear.some((w) => String(w.name || "").trim().length > 0);
  const rangedWeapons = wargear.filter((w) => {
    if (!String(w.name || "").trim()) return false;
    const r = String(w.range || "").trim();
    return r && r.toLowerCase() !== "melee";
  });
  const meleeWeapons = wargear.filter((w) => {
    if (!String(w.name || "").trim()) return false;
    return String(w.range || "").trim().toLowerCase() === "melee";
  });

  const abilities = dsAbilities
    .map((a) => {
      const master = a.ability_id ? abilityMaster.get(String(a.ability_id).trim()) : undefined;
      const name = master?.name || a.name;
      const description = master?.description || a.description;
      if (!String(name || "").trim() && !String(description || "").trim()) return null;
      return { name: String(name || "").trim(), description: String(description || "").trim() };
    })
    .filter((a): a is { name: string; description: string } => a !== null);

  const unitKeywordSet = new Set(
    keywords.map((k) => String(k.keyword || "").trim().toLowerCase()).filter(Boolean)
  );

  const stratagemIds = getStratagemIdsForDatasheet(unitId);
  const stratagemMap = getStratagemMap();
  const linkedStratagems = stratagemIds
    .map((id) => stratagemMap.get(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const stratagemsByKeyword = linkedStratagems.filter((s) => {
      const text = `${s.name} ${s.legend} ${s.description}`.toLowerCase();
      for (const kw of unitKeywordSet) {
        if (text.includes(kw)) return true;
      }
      return false;
    });
  const stratagems = stratagemsByKeyword.length > 0 ? stratagemsByKeyword : linkedStratagems;
  const accent = getFactionAccent(unit.faction_id);

  const sameFactionUnits = datasheets.filter(
    (d) => String(d.faction_id || "").trim() === String(unit.faction_id || "").trim()
  );

  const keywordToUnits = new Map<string, string[]>();
  for (const factionUnit of sameFactionUnits) {
    const unitKeywords = getKeywordsForDatasheet(String(factionUnit.id || "").trim());
    const localSeen = new Set<string>();
    for (const k of unitKeywords) {
      const keyword = String(k.keyword || "").trim();
      if (!keyword) continue;
      const normalized = keyword.toLowerCase();
      if (localSeen.has(normalized)) continue;
      localSeen.add(normalized);

      const existing = keywordToUnits.get(keyword) ?? [];
      if (!existing.includes(factionUnit.name)) {
        existing.push(factionUnit.name);
      }
      keywordToUnits.set(keyword, existing);
    }
  }

  const keywordItems = keywords.map((k) => ({
    keyword: k.keyword,
    units: keywordToUnits.get(k.keyword) ?? [],
  }));

  return (
    <main style={{ ...styles.page, background: getPageBackground(accent.rgb) }}>
      <style>{`
        .unitCardFx {
          transition: all 0.2s ease;
        }
        .unitCardFx:hover {
          border-color: rgba(${accent.rgb}, 0.30) !important;
          box-shadow: 0 0 0 1px rgba(${accent.rgb}, 0.16), 0 14px 32px rgba(0,0,0,0.26);
        }
        .weaponColumns {
          display: none;
        }
        @media (min-width: 681px) {
          .weaponColumns {
            display: grid;
            grid-template-columns: 2.25fr repeat(6, minmax(0, 1fr));
            gap: 8px;
            padding: 7px 8px;
            border-bottom: 1px solid rgba(255,255,255,0.07);
            background: rgba(255,255,255,0.02);
            font-size: 11.5px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.58);
            font-weight: 900;
          }
          .weaponRow {
            display: grid;
            grid-template-columns: 2.25fr repeat(6, minmax(0, 1fr));
            gap: 8px;
            padding: 8px 8px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            align-items: start;
          }
          .weaponTop {
            grid-column: 1 / 2;
          }
          .weaponStats {
            grid-column: 2 / 8;
            display: grid;
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 8px;
            margin-top: 0;
          }
          .weaponStatLabel {
            display: none;
          }
        }
        @media (max-width: 680px) {
          .weaponRow {
            padding: 8px 8px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }
          .weaponTop {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .weaponStats {
            margin-top: 7px;
            display: grid;
            grid-template-columns: repeat(6, minmax(0, 1fr));
            gap: 5px;
          }
          .weaponStatLabel {
            font-size: 9.5px;
            text-transform: uppercase;
            letter-spacing: 0.055em;
            color: rgba(255,255,255,0.58);
            font-weight: 900;
            line-height: 1.1;
          }
        }
      `}</style>
      <div style={styles.container}>
        <header style={styles.headerRow}>
          <a
            href="/"
            style={{ ...styles.backLink, borderColor: accent.border, background: accent.softBg }}
            aria-label="Back to factions"
            title="Back"
          >
            <span aria-hidden="true" style={styles.backIcon}>
              ←
            </span>
          </a>
          <div style={styles.titleBlock}>
            <div style={{ ...styles.breadcrumb, color: accent.muted }}>
              {unit.faction_id} &gt; {unit.name}
            </div>
            <h1 style={styles.title}>{unit.name}</h1>
          </div>
        </header>

        <div style={styles.stack}>
          {hasAnyValue([unit.leader_head, unit.leader_footer]) && (
            <section style={styles.card} className="unitCardFx">
              <div style={styles.cardTitle}>Notes / Rules</div>

              {hasAnyValue([unit.leader_head]) && (
                <>
                  <div style={styles.legendLabel}>Leader Head</div>
                  <RichText value={unit.leader_head} />
                  <div style={styles.divider} />
                </>
              )}

              {hasAnyValue([unit.leader_footer]) && (
                <>
                  <div style={styles.legendLabel}>Leader Footer</div>
                  <RichText value={unit.leader_footer} />
                </>
              )}
            </section>
          )}

          {hasModels && (
            <section style={styles.card} className="unitCardFx">
              <div style={styles.cardTitle}>Stats</div>
              <div style={styles.modelsWrap}>
                {models
                  .filter((m) => String(m.name || "").trim().length > 0)
                  .map((m) => (
                    <div key={`${m.line}-${m.name}`} style={styles.modelRow}>
                      <div style={styles.statBadgesRow}>
                        {renderStatBadge("M", m.M)}
                        {renderStatBadge("T", m.T)}
                        {renderStatBadge("Sv", m.Sv)}
                        {renderStatBadge("inv_sv", m.inv_sv)}
                        {renderStatBadge("W", m.W)}
                        {renderStatBadge("Ld", m.Ld)}
                        {renderStatBadge("OC", m.OC)}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {hasWeapons && (
            <section style={styles.card} className="unitCardFx">
              <details style={styles.abilityDetails} open>
                <summary style={styles.abilitySummary}>
                  <span style={styles.abilitySummaryText}>Weapons</span>
                  <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.6)" }}>
                    +
                  </span>
                </summary>
                <div style={styles.weaponBody}>
                  {hasAnyValue([unit.loadout]) && (
                    <div style={styles.loadoutInline}>
                      <RichText value={unit.loadout} compact />
                    </div>
                  )}

                  {rangedWeapons.length > 0 && (
                    <>
                      <div style={{ ...styles.weaponGroupTitle, ...styles.weaponGroupBar }}>
                        Ranged Weapons
                      </div>
                      <div style={styles.weaponTable}>
                        <div className="weaponColumns">
                          <div>Name</div>
                          <div style={styles.weaponColCenter}>Range</div>
                          <div style={styles.weaponColCenter}>A</div>
                          <div style={styles.weaponColCenter}>BS/WS</div>
                          <div style={styles.weaponColCenter}>S</div>
                          <div style={styles.weaponColCenter}>AP</div>
                          <div style={styles.weaponColCenter}>D</div>
                        </div>
                        {rangedWeapons.map((w, idx, arr) => {
                          const last = idx === arr.length - 1;
                          const range = String(w.range || "").trim();
                          const A = String(w.A || "").trim();
                          const BS_WS = String(w.BS_WS || "").trim();
                          const S = String(w.S || "").trim();
                          const AP = String(w.AP || "").trim();
                          const D = String(w.D || "").trim();
                          const tags = getWeaponTagItems(w.description);
                          return (
                            <div
                              key={`${w.line}-${w.line_in_wargear}-${w.name}`}
                              className="weaponRow"
                              style={last ? styles.weaponRowLast : undefined}
                            >
                              <div className="weaponTop">
                                <div style={styles.weaponCellName}>{w.name}</div>
                                {tags.length > 0 && (
                                  <WeaponRuleChips items={tags} accentRgb={accent.rgb} />
                                )}
                              </div>
                              <div className="weaponStats">
                                <div style={styles.weaponStatCell}>
                                  <span className="weaponStatLabel">Range</span>
                                  <span style={styles.weaponStatValue}>{range || "—"}</span>
                                </div>
                                <div style={styles.weaponStatCell}>
                                  <span className="weaponStatLabel">A</span>
                                  <span style={styles.weaponStatValue}>{A || "—"}</span>
                                </div>
                                <div style={styles.weaponStatCell}>
                                  <span className="weaponStatLabel">BS/WS</span>
                                  <span style={styles.weaponStatValue}>{BS_WS || "—"}</span>
                                </div>
                                <div style={styles.weaponStatCell}>
                                  <span className="weaponStatLabel">S</span>
                                  <span style={styles.weaponStatValue}>{S || "—"}</span>
                                </div>
                                <div style={styles.weaponStatCell}>
                                  <span className="weaponStatLabel">AP</span>
                                  <span style={styles.weaponStatValue}>{AP || "—"}</span>
                                </div>
                                <div style={styles.weaponStatCell}>
                                  <span className="weaponStatLabel">D</span>
                                  <span style={styles.weaponStatValue}>{D || "—"}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {rangedWeapons.length > 0 && meleeWeapons.length > 0 && (
                    <div style={styles.sectionDivider} />
                  )}

                  {meleeWeapons.length > 0 && (
                    <>
                      <div style={{ ...styles.weaponGroupTitle, ...styles.weaponGroupBar }}>
                        Melee Weapons
                      </div>
                      <div style={styles.weaponTable}>
                        <div className="weaponColumns">
                          <div>Name</div>
                          <div style={styles.weaponColCenter}>Range</div>
                          <div style={styles.weaponColCenter}>A</div>
                          <div style={styles.weaponColCenter}>BS/WS</div>
                          <div style={styles.weaponColCenter}>S</div>
                          <div style={styles.weaponColCenter}>AP</div>
                          <div style={styles.weaponColCenter}>D</div>
                        </div>
                        {meleeWeapons.map((w, idx, arr) => {
                          const last = idx === arr.length - 1;
                          const range = String(w.range || "").trim();
                          const A = String(w.A || "").trim();
                          const BS_WS = String(w.BS_WS || "").trim();
                          const S = String(w.S || "").trim();
                          const AP = String(w.AP || "").trim();
                          const D = String(w.D || "").trim();
                          const tags = getWeaponTagItems(w.description);
                          return (
                            <div
                              key={`${w.line}-${w.line_in_wargear}-${w.name}`}
                              className="weaponRow"
                              style={last ? styles.weaponRowLast : undefined}
                            >
                              <div className="weaponTop">
                                <div style={styles.weaponCellName}>{w.name}</div>
                                {tags.length > 0 && (
                                  <WeaponRuleChips items={tags} accentRgb={accent.rgb} />
                                )}
                              </div>
                              <div className="weaponStats">
                                <div style={styles.weaponStatCell}>
                                  <span className="weaponStatLabel">Range</span>
                                  <span style={styles.weaponStatValue}>{range || "—"}</span>
                                </div>
                                <div style={styles.weaponStatCell}>
                                  <span className="weaponStatLabel">A</span>
                                  <span style={styles.weaponStatValue}>{A || "—"}</span>
                                </div>
                                <div style={styles.weaponStatCell}>
                                  <span className="weaponStatLabel">BS/WS</span>
                                  <span style={styles.weaponStatValue}>{BS_WS || "—"}</span>
                                </div>
                                <div style={styles.weaponStatCell}>
                                  <span className="weaponStatLabel">S</span>
                                  <span style={styles.weaponStatValue}>{S || "—"}</span>
                                </div>
                                <div style={styles.weaponStatCell}>
                                  <span className="weaponStatLabel">AP</span>
                                  <span style={styles.weaponStatValue}>{AP || "—"}</span>
                                </div>
                                <div style={styles.weaponStatCell}>
                                  <span className="weaponStatLabel">D</span>
                                  <span style={styles.weaponStatValue}>{D || "—"}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </details>
            </section>
          )}

          {abilities.length > 0 && (
            <section style={styles.card} className="unitCardFx">
              <div style={styles.cardTitle}>Abilities</div>
              <div style={styles.abilitiesWrap}>
                {abilities.map((a, idx) => (
                  <details key={`${a.name}-${idx}`} style={styles.abilityDetails}>
                    <summary style={styles.abilitySummary}>
                      <span style={styles.abilitySummaryText}>{a.name}</span>
                      <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.6)" }}>
                        +
                      </span>
                    </summary>
                    {a.description && (
                      <div style={styles.abilityBody}>
                        <div style={styles.abilityBodyInner}>
                          <RichText value={a.description} compact />
                        </div>
                      </div>
                    )}
                  </details>
                ))}
              </div>
            </section>
          )}

          {stratagems.length > 0 && (
            <StratagemSection
              factionId={unit.faction_id}
              stratagems={stratagems}
              accentRgb={accent.rgb}
            />
          )}

          {composition.length > 0 && (
            <section style={styles.card} className="unitCardFx">
              <div style={styles.cardTitle}>Composition</div>
              <div style={styles.list}>
                {composition.map((c) => (
                  <div key={c.line} style={styles.compositionItem}>
                    <RichText value={c.description || ""} compact />
                  </div>
                ))}
              </div>
            </section>
          )}

          {keywords.length > 0 && (
            <section style={styles.card} className="unitCardFx">
              <div style={styles.cardTitle}>Keywords</div>
              <KeywordChips items={keywordItems} accentRgb={accent.rgb} />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function hasAnyValue(values: Array<string | undefined>) {
  return values.some((v) => {
    if (typeof v !== "string") return false;
    const t = v.trim();
    if (!t) return false;
    if (t.toUpperCase() === "FALSE") return false;
    return true;
  });
}

function getFactionAccent(factionId: string | undefined) {
  const f = String(factionId || "").toUpperCase();
  const presets: Array<{ test: (v: string) => boolean; rgb: string }> = [
    { test: (v) => v === "ADM", rgb: "220, 70, 70" }, // Adeptus Mechanicus
    { test: (v) => v === "NEC", rgb: "70, 190, 120" }, // Necrons
    { test: (v) => v === "EC", rgb: "214, 92, 201" }, // Emperor's Children
    { test: (v) => v === "SM", rgb: "85, 136, 220" }, // Space Marines
    { test: (v) => v.includes("ORK"), rgb: "93, 170, 78" }, // Orks
    { test: (v) => v === "AE", rgb: "146, 103, 214" }, // Aeldari
    { test: (v) => v.includes("CSM") || v.includes("CHAOS"), rgb: "150, 50, 60" }, // Chaos
  ];
  const rgb = presets.find((p) => p.test(f))?.rgb ?? "90, 130, 210";
  return {
    rgb,
    border: `rgba(${rgb}, 0.28)`,
    softBg: `rgba(${rgb}, 0.09)`,
    muted: `rgba(${rgb}, 0.70)`,
  };
}

function getPageBackground(rgb: string) {
  return `radial-gradient(900px 500px at 70% 0%, rgba(${rgb}, 0.14), transparent 55%), radial-gradient(800px 500px at 10% -10%, rgba(${rgb}, 0.08), transparent 60%), #070A10`;
}

function renderStatBadge(label: string, value: string | undefined) {
  const t = String(value || "").trim();
  if (!t) return null;
  if (t.toUpperCase() === "FALSE") return null;

  return (
    <div style={styles.statBadge}>
      <div style={styles.statBadgeLabel}>{label}</div>
      <div style={styles.statBadgeValue}>{t}</div>
    </div>
  );
}

function getWeaponTagItems(description: string | undefined): Array<{ label: string; description: string }> {
  const raw = String(description || "").trim();
  if (!raw) return [];

  const text = raw
    .replace(/<br\s*\/?>/gi, ", ")
    .replace(/<\/li>/gi, ", ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return [];

  const tokens = text
    .split(/[,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const glossary: Record<string, string> = {
    "rapid fire": "When this weapon shoots at half range, it makes additional attacks equal to the listed Rapid Fire value.",
    "devastating wounds": "Critical Wounds from this weapon are converted into mortal wounds instead of normal damage allocation.",
    "twin-linked": "You can re-roll the wound roll for attacks made with this weapon.",
    "extra attacks": "Attacks made with this weapon are additional and do not replace attacks made with another melee weapon.",
    "pistol": "This weapon can be fired while the bearer is within Engagement Range, following pistol rules.",
    "torrent": "This weapon automatically hits its target.",
    "lethal hits": "Critical Hits automatically wound the target.",
    "sustained hits": "Critical Hits generate additional hits equal to the listed Sustained Hits value.",
    "blast": "Against larger units, this weapon gains extra attacks according to Blast rules.",
    "anti-": "Critical wound threshold vs a specific target type is improved as listed.",
  };
  const tags: Array<{ label: string; description: string }> = [];
  for (const t of tokens) {
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const match = Object.entries(glossary).find(([k]) => key.includes(k));
    tags.push({
      label: t,
      description:
        match?.[1] ??
        `${t}: This weapon profile includes this special rule. Check the core rules wording for exact resolution.`,
    });
  }

  return tags;
}

function RichText({ value, compact }: { value: string; compact?: boolean }) {
  const v = value?.trim();
  if (!v) return null;

  const looksLikeHtml = v.includes("<") && v.includes(">");

  if (looksLikeHtml) {
    return (
      <div
        style={compact ? styles.richTextHtmlCompact : styles.richTextHtml}
        // Data is loaded from a local CSV export, and contains Wahapedia HTML.
        dangerouslySetInnerHTML={{ __html: v }}
      />
    );
  }

  return (
    <div
      style={compact ? styles.richTextCompact : styles.richText}
      aria-label="Text content"
    >
      {v}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    maxWidth: "100%",
    color: "rgba(255, 255, 255, 0.92)",
    background:
      "radial-gradient(900px 500px at 70% 0%, rgba(59, 130, 246, 0.14), transparent 55%), radial-gradient(800px 500px at 10% -10%, rgba(74, 222, 128, 0.10), transparent 60%), #070A10",
    overflowX: "hidden",
  },
  container: {
    width: "100%",
    maxWidth: 1200,
    margin: "0 auto",
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 0,
    paddingBottom: 0,
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
    transition: "all 0.2s ease",
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
    color: "rgba(255, 255, 255, 0.52)",
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
  cardLegacy: {
    borderRadius: 16,
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.02)",
    padding: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
  },
  row: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(255, 255, 255, 0.60)",
    fontWeight: 700,
  },
  value: {
    fontSize: 16,
    fontWeight: 650,
    color: "rgba(255, 255, 255, 0.92)",
    wordBreak: "break-word",
  },
  divider: {
    height: 1,
    width: "100%",
    background: "rgba(255, 255, 255, 0.10)",
    margin: "14px 0",
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  infoCard: {
    borderRadius: 16,
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.02)",
    padding: 12,
    boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
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
  loadoutInline: {
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.02)",
    padding: "9px 11px",
    marginBottom: 8,
  },
  weaponGroupTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.075em",
    color: "rgba(255, 255, 255, 0.72)",
    fontWeight: 950,
    marginBottom: 0,
  },
  weaponGroupBar: {
    borderRadius: 10,
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.035)",
    padding: "6px 9px",
    marginBottom: 6,
  },
  sectionDivider: {
    height: 1,
    background: "rgba(255, 255, 255, 0.10)",
    margin: "10px 0",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },
  subCard: {
    borderRadius: 14,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.02)",
    padding: 12,
  },
  subCardTitle: {
    fontWeight: 800,
    letterSpacing: "-0.01em",
    fontSize: 16,
    marginBottom: 8,
  },
  statBadgesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
  },
  statBadge: {
    borderRadius: 9999,
    border: "1px solid rgba(255, 255, 255, 0.10)",
    background: "rgba(255, 255, 255, 0.028)",
    padding: "6px 9px",
    display: "flex",
    alignItems: "baseline",
    gap: 8,
    minWidth: 76,
  },
  statBadgeLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(255, 255, 255, 0.54)",
    fontWeight: 950,
  },
  statBadgeValue: {
    fontSize: 17,
    fontWeight: 650,
    color: "rgba(255, 255, 255, 0.92)",
    wordBreak: "break-word",
  },
  modelBlock: {
    borderRadius: 14,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.02)",
    padding: 10,
  },
  modelRow: {
    padding: 0,
  },
  modelName: {
    fontWeight: 900,
    letterSpacing: "-0.01em",
    marginBottom: 10,
    fontSize: 15,
  },
  modelsWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },
  weaponTable: {
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    width: "100%",
    backdropFilter: "blur(6px)",
    background: "rgba(255,255,255,0.012)",
  },
  weaponRowLast: {
    borderBottom: "none",
  },
  weaponCellName: {
    fontWeight: 600,
    letterSpacing: "-0.01em",
    fontSize: 16,
    wordBreak: "keep-all",
    overflowWrap: "break-word",
    lineHeight: 1.2,
  },
  weaponColCenter: {
    textAlign: "center",
  },
  weaponStatCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    minWidth: 0,
  },
  weaponStatValue: {
    fontSize: 15.5,
    fontWeight: 650,
    color: "rgba(255, 255, 255, 0.93)",
    whiteSpace: "nowrap",
    textAlign: "center",
  },
  abilitiesWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },
  abilityDetails: {
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.07)",
    background: "rgba(255, 255, 255, 0.02)",
    overflow: "hidden",
    transition: "all 0.2s ease",
  },
  abilitySummary: {
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
  abilitySummaryText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.92)",
  },
  abilityBody: {
    padding: "7px 10px 10px 10px",
    borderTop: "1px solid rgba(255, 255, 255, 0.07)",
    maxHeight: 260,
    overflowY: "auto",
  },
  weaponBody: {
    padding: "9px 12px 10px 12px",
    borderTop: "1px solid rgba(255, 255, 255, 0.07)",
  },
  abilityBodyInner: {
    fontSize: 12.5,
    lineHeight: 1.45,
  },
  compositionItem: {
    padding: 0,
  },
  legendLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(255, 255, 255, 0.52)",
    fontWeight: 800,
    marginBottom: 7,
  },
  richText: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.45,
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 13,
    wordBreak: "break-word",
  },
  richTextCompact: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.38,
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12.5,
    wordBreak: "break-word",
  },
  richTextHtml: {
    lineHeight: 1.5,
    color: "rgba(255, 255, 255, 0.92)",
    fontSize: 13,
    wordBreak: "break-word",
  },
  richTextHtmlCompact: {
    lineHeight: 1.42,
    color: "rgba(255, 255, 255, 0.92)",
    fontSize: 12.5,
    wordBreak: "break-word",
  },
};