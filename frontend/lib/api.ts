const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types matching backend schema (crew.py / main.py) ──────────────────────

export interface Change {
  change_id: string;
  change_type: "added" | "removed" | "modified";
  old_text: string;
  new_text: string;
  section_hint: string;
  risk: "high" | "medium" | "low";
  affected_document: string;
  affected_section: string;
  amendment: string;
}

export interface ReferenceCase {
  bank: string;
  amount_lakh: number;
}

export interface FineRisk {
  probability_percent: number;
  estimated_amount_lakh: number;
  window_days: number;
  reference_cases: ReferenceCase[];
}

export interface Report {
  run_id: string;
  timestamp: string;
  circular_source: string;
  summary: string;
  risk_level: "high" | "medium" | "low";
  changes: Change[];
  fine_risk: FineRisk;
  evolution_score: number;
  // backend may return empty: true when no report exists yet
  empty?: boolean;
  message?: string;
}

export interface EvolutionRun {
  run_id: string;
  score: number;
  timestamp: string;
  risk_level?: string;
  changes_count?: number;
}

export interface Evolution {
  runs: EvolutionRun[];
}

export interface SimulationStatus {
  status: "not_started" | "running" | "complete" | "failed";
  steps_completed?: string[];
  run_id?: string;
  duration_seconds?: number;
  error?: string;
}

// ── API calls ───────────────────────────────────────────────────────────────

export async function runComplianceCheck(): Promise<{ status: string; run_id: string }> {
  const res = await fetch(`${API_BASE_URL}/run_compliance_crew`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || "Failed to start compliance check");
  }
  return res.json();
}

export async function getStatus(): Promise<SimulationStatus> {
  const res = await fetch(`${API_BASE_URL}/status`);
  if (!res.ok) throw new Error("Failed to fetch status");
  return res.json();
}

export async function getLatestReport(): Promise<Report | null> {
  const res = await fetch(`${API_BASE_URL}/report`);
  if (!res.ok) throw new Error("Failed to fetch report");
  const data = await res.json();
  if (data.empty) return null;
  return data;
}

export async function getEvolution(): Promise<Evolution> {
  const res = await fetch(`${API_BASE_URL}/evolution`);
  if (!res.ok) throw new Error("Failed to fetch evolution history");
  return res.json();
}

export async function resetDemo(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/reset`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset demo");
  return res.json();
}