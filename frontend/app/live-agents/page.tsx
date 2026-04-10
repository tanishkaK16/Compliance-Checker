"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Terminal as TerminalIcon, Cpu, ShieldCheck,
  Search, FileCheck, AlertTriangle, Activity
} from "lucide-react";
import AgentStepper from "@/components/AgentStepper";
import { getStatus } from "@/lib/api";

const AGENTS = [
  { id: 1, name: "Scraper Agent",      icon: Cpu,           task: "Reading RBI/2026/41 circular from data store..." },
  { id: 2, name: "Change Detector",    icon: Search,        task: "Diffing new circular against previous version..." },
  { id: 3, name: "Impact Mapper",      icon: Activity,      task: "Querying ChromaDB — matching clauses to company docs..." },
  { id: 4, name: "Amendment Drafter",  icon: FileCheck,     task: "Sending affected sections to LLM for amendment drafting..." },
  { id: 5, name: "Executive Summarizer", icon: AlertTriangle, task: "Assembling fine risk estimate and report JSON..." },
  { id: 6, name: "Policy Evolution",   icon: ShieldCheck,   task: "Writing amendments to internal_policy.pdf and re-indexing..." },
];

// How many fake log lines to show per agent stage
const STAGE_LOGS: Record<number, string[]> = {
  1: ["→ Scraper Agent — opening raw_circulars/rbi_circular_2026_41.pdf", "→ Extracted 4,218 characters from circular", "→ Previous circular loaded for comparison"],
  2: ["→ Change Detector — running unified diff", "→ 3 clause modifications identified", "→ Changes labeled: 2× modified, 1× added"],
  3: ["→ Impact Mapper — querying ChromaDB collection company_docs", "→ Matched Section 4.2 → internal_policy.pdf", "→ Matched Section 6.1 → product_catalog.pdf"],
  4: ["→ Amendment Drafter — sending prompt to mistral-small", "→ Amendment drafted for change c1 (high risk)", "→ Amendments complete for all 3 changes"],
  5: ["→ Executive Summarizer — calculating fine risk probability: 68%", "→ Estimated exposure: ₹18.4L in 90 days", "→ Report JSON written to shared_data/latest_report.json"],
  6: ["→ Policy Evolution — appending amendments to internal_policy.pdf", "→ ChromaDB re-indexed with updated document", "→ Evolution score recorded in evolution_history.json"],
};

export default function LiveAgentsPage() {
  const [currentAgent, setCurrentAgent] = useState(1);
  const [logs, setLogs] = useState<{ time: string; text: string; type: string }[]>([
    { time: now(), text: "[SYSTEM] Compliance pipeline starting...", type: "system" },
  ]);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const router = useRouter();
  const logEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const animDone = useRef(false);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

useEffect(() => {
  let agent = 1;
  let logIndex = 0;

  const tick = setInterval(() => {
    if (agent > 6) {
      clearInterval(tick);
      return;
    }

    const stageLines = STAGE_LOGS[agent] || [];
    if (logIndex < stageLines.length) {
      setLogs(l => [...l, { time: now(), text: stageLines[logIndex], type: "info" }]);
      logIndex++;
    } else {
      setLogs(l => [...l, { time: now(), text: `✓ ${AGENTS[agent - 1].name} — complete`, type: "success" }]);
      logIndex = 0;
      agent++;

      if (agent <= 6) {
        setCurrentAgent(agent);
      } else {
        // All done — cap at 6, mark animation complete
        setCurrentAgent(6);
        clearInterval(tick);
        animDone.current = true;
      }
    }
  }, 900);

  return () => clearInterval(tick);
}, []);
  // Poll backend status every 3s
  useEffect(() => {
    pollingRef.current = setInterval(async () => {
      try {
        const status = await getStatus();
        if (status.status === "complete" && animDone.current) {
          clearInterval(pollingRef.current!);
          router.push("/dashboard");
        } else if (status.status === "complete" && !animDone.current) {
          // Backend done but animation still running — wait for animation
          const waitForAnim = setInterval(() => {
            if (animDone.current) {
              clearInterval(waitForAnim);
              clearInterval(pollingRef.current!);
              router.push("/dashboard");
            }
          }, 500);
        } else if (status.status === "failed") {
          clearInterval(pollingRef.current!);
          setPipelineError(status.error || "Pipeline failed — check backend logs");
        }
      } catch {
        // Backend unreachable — animation still runs, redirect on anim end
      }
    }, 3000);

    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [router]);

  return (
    <div className="pt-24 pb-20 px-8 min-h-screen flex flex-col items-center animate-fade-in relative">
      <div className="absolute inset-0 linear-grid mask-fade-top opacity-5 pointer-events-none" />

      <div className="max-w-[1200px] w-full space-y-20 relative z-10">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 text-[10px] font-bold text-text-muted uppercase tracking-[0.4em]">
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
            <span>Compliance Pipeline Running</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tightest text-white">
            Processing Circular Delta
          </h1>
          <p className="text-text-secondary text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed">
            Scraping, diffing, mapping, and drafting amendments against RBI/2026/41.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2">
            <AgentStepper activeAgent={currentAgent} agents={AGENTS} />
          </div>

          <div className="lg:col-span-3 space-y-8">
            {pipelineError ? (
              <div className="linear-card p-8 border border-risk-high/30 bg-risk-high/5 space-y-3">
                <p className="text-sm font-bold text-risk-high uppercase tracking-widest">Pipeline Error</p>
                <p className="text-text-secondary text-sm font-mono">{pipelineError}</p>
                <button onClick={() => router.push("/simulate")} className="linear-button-secondary h-10 mt-2">
                  Try Again
                </button>
              </div>
            ) : (
              <div className="linear-card bg-black/40 p-12 min-h-[550px] flex flex-col font-mono relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-8 mb-8">
                  <div className="flex items-center space-x-4">
                    <TerminalIcon className="w-4 h-4 text-text-muted" />
                    <span className="text-xs font-bold text-white tracking-[0.2em] uppercase">Pipeline Log</span>
                  </div>
                  <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest animate-pulse">
                    Running...
                  </span>
                </div>

                <div className="flex-1 space-y-3 text-[13px] overflow-y-auto pr-2">
                  {logs.map((log, i) => (
                    <div key={i} className={`flex items-start space-x-4 ${i === logs.length - 1 ? "opacity-100" : "opacity-40"}`}>
                      <span className="text-[11px] font-bold text-text-muted shrink-0 pt-0.5">{log.time}</span>
                      <span className={
                        log.type === "success" ? "text-emerald-400 font-medium" :
                        log.type === "system"  ? "text-primary-500 font-medium" :
                        "text-white/80"
                      }>
                        {log.text}
                      </span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>

                <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center space-x-2 opacity-40">
                  <div className="w-2 h-4 bg-white/60 animate-pulse rounded-sm" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function now() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}