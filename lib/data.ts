import fs from "fs";
import path from "path";

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        // Escaped quote
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
  }

  out.push(cur);
  return out;
}

export function getData() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "Wahapedia Data Export - Factions.csv"
  );

  const file = fs.readFileSync(filePath, "utf-8");

  const rows = file.split("\n").slice(1);

  const data = rows.map((row) => {
    const [id, name, link] = row.split(",");
    return { id, name, link };
  });

  return data;
}

export function getDatasheets() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "Wahapedia Data Export - Datasheets.csv"
  );

  const file = fs.readFileSync(filePath, "utf-8");
  const rows = file.split(/\r?\n/).slice(1).filter((r) => r.trim().length > 0);

  const data = rows.map((row) => {
    const cols = parseCsvLine(row);

    // CSV header:
    // id,name,faction_id,source_id,legend,role,loadout,transport,virtual,leader_head,leader_footer,damaged_w,damaged_description,link
    const [
      id,
      name,
      faction_id,
      source_id,
      legend,
      role,
      loadout,
      transport,
      virtual,
      leader_head,
      leader_footer,
      damaged_w,
      damaged_description,
      link,
    ] = cols;

    return {
      id,
      name,
      faction_id,
      source_id,
      legend,
      role,
      loadout,
      transport,
      virtual,
      leader_head,
      leader_footer,
      damaged_w,
      damaged_description,
      link,
    };
  });

  return data;
}

function readCsvRows(fileName: string): string[][] {
  const filePath = path.join(process.cwd(), "data", fileName);
  const file = fs.readFileSync(filePath, "utf-8");
  const rows = file.split(/\r?\n/).slice(1).filter((r) => r.trim().length > 0);
  return rows.map((row) => parseCsvLine(row));
}

export function getModelsForDatasheet(datasheetId: string) {
  const rows = readCsvRows("Wahapedia Data Export - DS_Models.csv");
  return rows
    .filter((r) => String(r[0]).trim() === String(datasheetId).trim())
    .map((r) => {
      const [
        _datasheet_id,
        line,
        name,
        M,
        T,
        Sv,
        inv_sv,
        inv_sv_descr,
        W,
        Ld,
        OC,
        base_size,
        base_size_descr,
      ] = r;
      return {
        datasheet_id: _datasheet_id,
        line,
        name,
        M,
        T,
        Sv,
        inv_sv,
        inv_sv_descr,
        W,
        Ld,
        OC,
        base_size,
        base_size_descr,
      };
    });
}

export function getWargearForDatasheet(datasheetId: string) {
  const rows = readCsvRows("Wahapedia Data Export - DS_Wargear.csv");
  return rows
    .filter((r) => String(r[0]).trim() === String(datasheetId).trim())
    .map((r) => {
      const [
        _datasheet_id,
        line,
        line_in_wargear,
        dice,
        name,
        description,
        range,
        type,
        A,
        BS_WS,
        S,
        AP,
        D,
      ] = r;

      return {
        datasheet_id: _datasheet_id,
        line,
        line_in_wargear,
        dice,
        name,
        description,
        range,
        type,
        A,
        BS_WS,
        S,
        AP,
        D,
      };
    });
}

export function getKeywordsForDatasheet(datasheetId: string) {
  const rows = readCsvRows("Wahapedia Data Export - DS_Keywords.csv");
  const keywords = rows
    .filter((r) => String(r[0]).trim() === String(datasheetId).trim())
    .map((r) => {
      const [_datasheet_id, keyword, model, is_faction_keyword] = r;
      return {
        datasheet_id: _datasheet_id,
        keyword,
        model,
        is_faction_keyword,
      };
    })
    .filter((k) => String(k.keyword || "").trim().length > 0);

  // Keep things readable: remove duplicates.
  const seen = new Set<string>();
  const unique: typeof keywords = [];
  for (const k of keywords) {
    const key = String(k.keyword).trim();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(k);
  }

  return unique;
}

export function getCompositionForDatasheet(datasheetId: string) {
  const rows = readCsvRows("Wahapedia Data Export - DS_Unit Comp.csv");
  return rows
    .filter((r) => String(r[0]).trim() === String(datasheetId).trim())
    .map((r) => {
      const [_datasheet_id, line, description] = r;
      return { datasheet_id: _datasheet_id, line, description };
    })
    .filter((r) => String(r.description || "").trim().length > 0);
}

export function getAbilitiesForDatasheet(datasheetId: string) {
  const rows = readCsvRows("Wahapedia Data Export - DS_Abilities.csv");
  return rows
    .filter((r) => String(r[0]).trim() === String(datasheetId).trim())
    .map((r) => {
      const [
        _datasheet_id,
        line,
        ability_id,
        model,
        name,
        description,
        type,
        parameter,
      ] = r;

      return {
        datasheet_id: _datasheet_id,
        line,
        ability_id,
        model,
        name,
        description,
        type,
        parameter,
      };
    })
    .filter((a) => String(a.name || "").trim().length > 0 || String(a.description || "").trim().length > 0);
}

export function getAbilityMasterMap() {
  const rows = readCsvRows("Wahapedia Data Export - Abilities.csv");
  const map = new Map<string, { id: string; name: string; description: string }>();
  for (const r of rows) {
    const [id, name, _legend, _faction_id, description] = r;
    map.set(String(id).trim(), {
      id: String(id).trim(),
      name: String(name || "").trim(),
      description: String(description || "").trim(),
    });
  }
  return map;
}

export function getStratagemIdsForDatasheet(datasheetId: string) {
  const rows = readCsvRows("Wahapedia Data Export - DS_Stratagems.csv");
  const ids = rows
    .filter((r) => String(r[0]).trim() === String(datasheetId).trim())
    .map((r) => String(r[1] || "").trim())
    .filter(Boolean);
  return Array.from(new Set(ids));
}

export function getStratagemMap() {
  const rows = readCsvRows("Wahapedia Data Export - Stratagems.csv");
  const map = new Map<
    string,
    {
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
    }
  >();

  for (const r of rows) {
    const [faction_id, id, name, type, cp_cost, legend, turn, phase, detachment, description] =
      r;
    const key = String(id || "").trim();
    if (!key) continue;
    map.set(key, {
      id: key,
      name: String(name || "").trim(),
      description: String(description || "").trim(),
      legend: String(legend || "").trim(),
      faction_id: String(faction_id || "").trim(),
      type: String(type || "").trim(),
      cp_cost: String(cp_cost || "").trim(),
      turn: String(turn || "").trim(),
      phase: String(phase || "").trim(),
      detachment: String(detachment || "").trim(),
    });
  }

  return map;
}

export function getDetachmentsForFaction(factionId: string) {
  const rows = readCsvRows("Wahapedia Data Export - Detachment_Abilities.csv");
  const filtered = rows.filter((r) => String(r[1] || "").trim() === String(factionId).trim());

  const byDetachment = new Map<
    string,
    { id: string; name: string; subtitle: string; description: string }
  >();

  for (const r of filtered) {
    const [id, _faction_id, name, legend, description, detachment] = r;
    const det = String(detachment || "").trim();
    if (!det) continue;
    if (byDetachment.has(det)) continue;
    byDetachment.set(det, {
      id: String(id || "").trim(),
      name: det,
      subtitle: String(legend || "").trim(),
      description: String(description || "").trim(),
    });
  }

  return Array.from(byDetachment.values());
}

export function getDetachmentRule(detachmentId: string) {
  const rows = readCsvRows("Wahapedia Data Export - Detachment_Abilities.csv");
  const det = String(detachmentId || "").trim();
  const filtered = rows.filter((r) => String(r[5] || "").trim() === det);
  const useful = filtered.filter((r) => String(r[2] || "").trim().toUpperCase() !== "KEYWORDS");
  const row = useful[0] || filtered[0];
  if (!row) return null;

  const [id, faction_id, name, legend, description, detachment] = row;
  return {
    id: String(id || "").trim(),
    faction_id: String(faction_id || "").trim(),
    name: String(name || "").trim(),
    legend: String(legend || "").trim(),
    description: String(description || "").trim(),
    detachment: String(detachment || "").trim(),
  };
}

export function getEnhancementsForDetachment(detachmentId: string) {
  const rows = readCsvRows("Wahapedia Data Export - Enhacements.csv");
  const det = String(detachmentId || "").trim();
  return rows
    .filter((r) => String(r[4] || "").trim() === det)
    .map((r) => {
      const [id, faction_id, name, cost, detachment, legend, description] = r;
      return {
        id: String(id || "").trim(),
        faction_id: String(faction_id || "").trim(),
        name: String(name || "").trim(),
        cost: String(cost || "").trim(),
        detachment: String(detachment || "").trim(),
        legend: String(legend || "").trim(),
        description: String(description || "").trim(),
      };
    });
}

export function getStratagemsForDetachment(detachmentId: string) {
  const rows = readCsvRows("Wahapedia Data Export - Stratagems.csv");
  const det = String(detachmentId || "").trim();
  return rows
    .filter((r) => String(r[8] || "").trim() === det)
    .map((r) => {
      const [faction_id, id, name, type, cp_cost, legend, turn, phase, detachment, description] =
        r;
      return {
        id: String(id || "").trim(),
        faction_id: String(faction_id || "").trim(),
        name: String(name || "").trim(),
        type: String(type || "").trim(),
        cp_cost: String(cp_cost || "").trim(),
        legend: String(legend || "").trim(),
        turn: String(turn || "").trim(),
        phase: String(phase || "").trim(),
        detachment: String(detachment || "").trim(),
        description: String(description || "").trim(),
      };
    });
}