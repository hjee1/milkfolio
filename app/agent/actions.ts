"use server";

import { promises as fs } from "fs";
import path from "path";
import { parseDataHtml } from "@/lib/parse-data-html";
import type { FetchResult } from "@/lib/types/agent";

// Server Action: reads casting-agent's pushed `data.html` from disk and
// returns structured data to the client. The file path mirrors the legacy
// GH-Pages layout (root/agent/data.html). Once Phase 7 removes the legacy
// /agent folder, casting-agent's push target will move to public/agent/data.html
// and we'll just swap the path here.
const DATA_FILE = path.join(process.cwd(), "agent", "data.html");

export async function fetchAgentData(): Promise<FetchResult> {
  try {
    const html = await fs.readFile(DATA_FILE, "utf-8");
    if (!html.trim()) {
      return { ok: false, reason: "no-file", message: "data.html is empty" };
    }
    const data = parseDataHtml(html);
    return { ok: true, data };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return { ok: false, reason: "no-file" };
    }
    return {
      ok: false,
      reason: "parse-error",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}
