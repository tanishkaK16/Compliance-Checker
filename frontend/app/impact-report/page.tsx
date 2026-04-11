"use client";

import { useEffect, useState } from "react";
import { 
  Download, Printer, ChevronLeft, ShieldCheck, Globe, Calendar, FileText,
  Activity, Check, X, AlertTriangle, Vote, Users, ArrowRight, Clock,
  GitBranch, ShieldAlert, Gavel
} from "lucide-react";
import Link from "next/link";
import { getLatestReport, Report, Change } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import DeclineAmendmentModal, { RejectionRecord } from "@/components/DeclineAmendmentModal";
import PriorityScoring from "@/components/PriorityScoring";
import TaskBreakdown from "@/components/TaskBreakdown";

/* ─────────────────────────────── Types ─────────────────────────────── */

type ChangeStatus = "pending" | "accepted" | "declined" | "voting";

interface ChangeState {
  status: ChangeStatus;
  rejection?: RejectionRecord;
  votes: { name: string; role: string; voted: boolean; approve: boolean }[];
}

/* ─── hardcoded demo voters (unanimous committee) ─── */
const DEFAULT_VOTERS = [
  { name: "Vinit K.",    role: "Chief Compliance Officer", voted: false, approve: false },
  { name: "Mayank S.",   role: "IT Lead",                  voted: false, approve: false },
  { name: "Anusha R.",   role: "Product Head",             voted: false, approve: false },
];

/* ─── hardcoded demo penalty data ─── */
const PENALTY_DATA: Record<string, { type: string; amount: string; deadline: string; authority: string }> = {
  high:   { type: "Financial Penalty",  amount: "₹5.0 Lakhs+",  deadline: "14 Days",  authority: "RBI Section 46" },
  medium: { type: "Warning Notice",     amount: "₹0.5–2.0 Lakhs", deadline: "30 Days", authority: "RBI Section 35A" },
  low:    { type: "Advisory Notice",    amount: "₹0.1 Lakhs",   deadline: "90 Days",  authority: "RBI Circular" },
};

/* ─── hardcoded branch outcomes ─── */
function getAcceptedOutcomes(change: Change): string[] {
  return [
    `Internal policy "${change.affected_section}" will be updated to match the new circular requirement.`,
    "Cross-functional task queue will be generated for Legal, IT, and Operations teams.",
    "Compliance score improves; regulatory exposure reduced to near-zero for this clause.",
    "Audit trail is sealed with full traceability for future RBI inspections.",
  ];
}

function getDeclinedOutcomes(change: Change): string[] {
  const p = PENALTY_DATA[change.risk] || PENALTY_DATA.low;
  return [
    `Potential penalty of ${p.amount} under ${p.authority} if not complied within ${p.deadline}.`,
    `Section "${change.affected_section}" remains out of compliance — drift continues.`,
    "Internal auditors will flag this as an open finding in the next review cycle.",
    "Regulatory inspection risk elevates; the company may receive a show-cause notice.",
  ];
}

/* ════════════════════════════════════════════════════════════════════ */

export default function ImpactReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  /* per-change state map */
  const [changeStates, setChangeStates] = useState<Record<string, ChangeState>>({});

  /* decline modal */
  const [declineTarget, setDeclineTarget] = useState<{ id: string; title: string } | null>(null);

  /* expanded branch views */
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const data = await getLatestReport();
        setReport(data);
        // init all changes as pending
        const initial: Record<string, ChangeState> = {};
        (data.changes || []).forEach(c => {
          initial[c.change_id] = {
            status: "pending",
            votes: DEFAULT_VOTERS.map(v => ({ ...v })),
          };
        });
        setChangeStates(initial);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReport();
  }, []);

  /* ─── actions ─── */

  const handleAccept = (id: string) => {
    setChangeStates(prev => ({
      ...prev,
      [id]: { ...prev[id], status: "accepted" },
    }));
    showToast("Amendment accepted — tasks generated.", "success");
  };

  const handleDeclineSubmit = (record: RejectionRecord) => {
    setChangeStates(prev => ({
      ...prev,
      [record.change_id]: { ...prev[record.change_id], status: "declined", rejection: record },
    }));
    showToast("Decline recorded — committee vote initiated.", "info");
    // auto-start voting after 800ms for dramatic effect
    setTimeout(() => {
      setChangeStates(prev => ({
        ...prev,
        [record.change_id]: { ...prev[record.change_id], status: "voting" },
      }));
    }, 800);
  };

  const handleCastVote = (changeId: string, voterIndex: number, approve: boolean) => {
    setChangeStates(prev => {
      const state = { ...prev[changeId] };
      const votes = state.votes.map((v, i) => i === voterIndex ? { ...v, voted: true, approve } : v);
      return { ...prev, [changeId]: { ...state, votes } };
    });
  };

  const handleOverrideAccept = (changeId: string) => {
    setChangeStates(prev => ({
      ...prev,
      [changeId]: { ...prev[changeId], status: "accepted" },
    }));
    showToast("Vote overridden — amendment force-accepted.", "success");
  };

  /* ─── derived data ─── */

  const changes = report?.changes || [];
  const sortedChanges = [...changes].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (order[a.risk] ?? 3) - (order[b.risk] ?? 3);
  });
  const highRisks = changes.filter(c => c.risk === "high").length;
  const totalRisks = changes.length;

  const pendingVoteChanges = sortedChanges.filter(c => changeStates[c.change_id]?.status === "voting");

  /* ═══════════════════════ RENDER ═══════════════════════ */

  if (isLoading) {
    return (
      <div className="pt-24 px-8 max-w-[1100px] mx-auto space-y-12 animate-fade-in">
        <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-[600px] bg-white/[0.02] border border-white/[0.05] rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="pt-24 px-8 max-w-[1100px] mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
           <Activity className="w-12 h-12 text-text-muted opacity-20" />
           <p className="text-text-secondary font-medium">{error || "No assessment data available."}</p>
           <Link href="/simulate" className="linear-button-primary h-11">Run Assessment Cycle</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-8 min-h-screen bg-background animate-fade-in">
      <div className="max-w-[1100px] mx-auto space-y-12">

        {/* ─── Top Bar ─── */}
        <div className="flex items-center justify-between no-print">
          <Link href="/dashboard" className="flex items-center space-x-3 text-text-secondary hover:text-white transition-all group">
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Return to Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={() => window.print()} className="linear-button-secondary h-10 px-6 flex items-center gap-2">
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button onClick={() => window.print()} className="linear-button-primary h-10 px-6 flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* ═══════════════ PENALTY BANNER ═══════════════ */}
        {report.fine_risk && report.fine_risk.probability_percent > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-risk-high/30 bg-gradient-to-r from-risk-high/10 via-risk-high/5 to-transparent p-8">
            <div className="absolute top-0 right-0 w-40 h-40 bg-risk-high/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex items-start gap-6 relative z-10">
              <div className="p-3 bg-risk-high/20 rounded-xl shrink-0">
                <Gavel className="w-7 h-7 text-risk-high" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-lg font-black text-risk-high uppercase tracking-tight">⚠️ Regulatory Penalty Warning</h3>
                <p className="text-[15px] font-medium text-white/80 leading-relaxed">
                  If not complied within <span className="font-black text-white">{report.fine_risk.window_days} days</span>, 
                  a penalty of <span className="font-black text-risk-high">₹{report.fine_risk.estimated_amount_lakh}L</span> may 
                  be charged under applicable RBI directions. Enforcement probability: <span className="font-black text-white">{report.fine_risk.probability_percent}%</span>.
                </p>
                <div className="flex items-center gap-8 pt-2">
                  {report.fine_risk.reference_cases?.slice(0, 3).map((rc, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                      <span className="text-risk-high">₹{rc.amount_lakh}L</span>
                      <span>— {rc.bank}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ PRIORITY SCORING ═══════════════ */}
        <PriorityScoring 
          changes={sortedChanges} 
          totalExpectedFine={report.fine_risk?.estimated_amount_lakh || 0} 
        />

        {/* ═══════════════ MAIN REPORT CARD ═══════════════ */}
        <div className="linear-card p-16 md:p-24 space-y-24 relative bg-[#0d0d0f] print:bg-white print:text-black print:border-none print:shadow-none print:p-0">

          {/* Header */}
          <div className="flex justify-between items-start border-b border-white/[0.08] pb-16 print:border-black">
            <div className="space-y-8">
              <div className="flex items-center space-x-4 text-white">
                 <ShieldCheck className="w-10 h-10" />
                 <span className="text-xl font-bold uppercase tracking-tightest">Compliance Intel</span>
              </div>
              <div className="space-y-4">
                 <h1 className="text-5xl font-black tracking-tightest text-white print:text-black leading-tight">Executive Impact <br /> Assessment</h1>
                 <p className="text-text-muted text-[11px] uppercase tracking-[0.4em] font-bold">TraceID: {report?.run_id || '8491-X'} // Governance v2.4</p>
              </div>
            </div>
            <div className="text-right space-y-6">
               <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                  System Date: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
               </div>
               <div className="flex items-center justify-end space-x-2">
                  <Activity className="w-4 h-4 text-text-muted opacity-40" />
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">PROCESSED OK</span>
               </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-16 border-b border-white/[0.08] pb-20 print:border-black">
             <div className="space-y-4">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em]">Total Conflicts</span>
                <div className="text-5xl font-black tracking-tightest text-white print:text-black">{totalRisks}</div>
             </div>
             <div className="space-y-4">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em]">Critical Flux</span>
                <div className="text-5xl font-black tracking-tightest text-risk-high">{highRisks}</div>
             </div>
             <div className="space-y-4">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em]">Evolution Score</span>
                <div className="text-5xl font-black tracking-tightest text-white print:text-black">{report?.evolution_score || 0}</div>
             </div>
          </div>

          {/* ═══════════ AMENDMENTS with ACCEPT/DECLINE ═══════════ */}
          <div className="space-y-20">
             <div className="space-y-12">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.5em] text-text-muted flex items-center space-x-4 border-b border-white/[0.03] pb-6">
                   <span>Proposed Dynamic Amendments</span>
                </h3>
                <div className="grid gap-12">
                   {sortedChanges.filter(c => c.amendment).map((change, i) => {
                     const state = changeStates[change.change_id];
                     const status = state?.status || "pending";
                     const penalty = PENALTY_DATA[change.risk] || PENALTY_DATA.low;

                     return (
                       <div key={change.change_id} className="space-y-6">
                         {/* Amendment Card */}
                         <div className={`p-10 rounded-2xl space-y-6 border transition-all ${
                           status === "accepted" 
                             ? "bg-emerald-500/5 border-emerald-500/20" 
                             : status === "declined" || status === "voting"
                               ? "bg-risk-high/5 border-risk-high/20"
                               : "bg-black/60 border-white/[0.08]"
                         } print:bg-neutral-100 print:border-black`}>

                           {/* Title Row */}
                           <div className="flex items-center justify-between gap-4">
                             <div className="flex items-center gap-4">
                               <span className="text-xs font-mono font-bold text-text-muted opacity-30 tracking-widest">{(i+1).toString().padStart(2, '0')}</span>
                               <h4 className="font-bold text-white uppercase tracking-widest text-xs print:text-black">{change.affected_section}</h4>
                               {/* Risk badge */}
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-widest ${
                                 change.risk === 'high' ? 'text-risk-high border-risk-high/30 bg-risk-high/5' : 
                                 change.risk === 'medium' ? 'text-risk-medium border-risk-medium/30 bg-risk-medium/5' : 'text-risk-low border-risk-low/30 bg-risk-low/5'
                               }`}>
                                 {change.risk}
                               </span>
                             </div>
                             {/* Status Badge */}
                             {status === "accepted" && (
                               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                 <Check className="w-4 h-4" /> Accepted
                               </span>
                             )}
                             {status === "voting" && (
                               <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 animate-pulse">
                                 <Vote className="w-4 h-4" /> Vote in Progress
                               </span>
                             )}
                             {status === "declined" && (
                               <span className="text-[10px] font-black text-risk-high uppercase tracking-widest flex items-center gap-2">
                                 <AlertTriangle className="w-4 h-4" /> Declined
                               </span>
                             )}
                           </div>

                           {/* Penalty callout per-change */}
                           <div className="flex items-center gap-3 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                              <Clock className="w-3.5 h-3.5 text-risk-high" />
                              <span>Deadline: {penalty.deadline}</span>
                              <span className="text-white/10">|</span>
                              <AlertTriangle className="w-3.5 h-3.5 text-risk-high" />
                              <span>Fine: {penalty.amount}</span>
                              <span className="text-white/10">|</span>
                              <span className="text-white/25">{penalty.authority}</span>
                           </div>

                           {/* Diff */}
                           <pre className="text-[13px] font-mono text-text-secondary leading-relaxed whitespace-pre-wrap print:text-black custom-scrollbar">
                              {`- ${change.old_text}\n+ ${change.amendment}`}
                           </pre>

                           {/* ──── ACTION BUTTONS (only for pending) ──── */}
                           {status === "pending" && (
                             <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                               <button 
                                 onClick={() => handleAccept(change.change_id)}
                                 className="flex-1 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
                               >
                                 <Check className="w-4 h-4" /> Accept Strategy
                               </button>
                               <button 
                                 onClick={() => setDeclineTarget({ id: change.change_id, title: change.affected_section })}
                                 className="flex-1 h-12 rounded-xl bg-risk-high/10 border border-risk-high/20 text-risk-high text-[12px] font-black uppercase tracking-widest hover:bg-risk-high/20 transition-all flex items-center justify-center gap-2"
                               >
                                 <X className="w-4 h-4" /> Decline & Review
                               </button>
                               <button 
                                 onClick={() => setExpandedBranch(expandedBranch === change.change_id ? null : change.change_id)}
                                 className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[12px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                               >
                                 <GitBranch className="w-4 h-4" /> View Outcomes
                               </button>
                             </div>
                           )}
                         </div>

                         {/* ──── OUTCOME BRANCHES ──── */}
                         {(expandedBranch === change.change_id || status === "declined" || status === "voting") && (
                           <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                             {/* IF ACCEPTED */}
                             <div className="p-8 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 space-y-5">
                               <div className="flex items-center gap-3">
                                 <div className="p-2 bg-emerald-500/10 rounded-lg"><Check className="w-4 h-4 text-emerald-400" /></div>
                                 <h5 className="text-[12px] font-black text-emerald-400 uppercase tracking-widest">If Accepted</h5>
                               </div>
                               <ul className="space-y-3">
                                 {getAcceptedOutcomes(change).map((o, j) => (
                                   <li key={j} className="flex items-start gap-3 text-[13px] text-white/60 font-medium leading-relaxed">
                                     <ArrowRight className="w-3.5 h-3.5 text-emerald-500/40 shrink-0 mt-1" />
                                     {o}
                                   </li>
                                 ))}
                               </ul>
                             </div>
                             {/* IF DECLINED */}
                             <div className="p-8 rounded-2xl bg-risk-high/[0.03] border border-risk-high/10 space-y-5">
                               <div className="flex items-center gap-3">
                                 <div className="p-2 bg-risk-high/10 rounded-lg"><X className="w-4 h-4 text-risk-high" /></div>
                                 <h5 className="text-[12px] font-black text-risk-high uppercase tracking-widest">If Declined</h5>
                               </div>
                               <ul className="space-y-3">
                                 {getDeclinedOutcomes(change).map((o, j) => (
                                   <li key={j} className="flex items-start gap-3 text-[13px] text-white/60 font-medium leading-relaxed">
                                     <AlertTriangle className="w-3.5 h-3.5 text-risk-high/40 shrink-0 mt-1" />
                                     {o}
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           </div>
                         )}

                         {/* ──── REJECTION REASON (after decline) ──── */}
                         {state?.rejection && (status === "declined" || status === "voting") && (
                           <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                             <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Rejection Rationale</p>
                             <p className="text-[14px] text-white/70 font-medium leading-relaxed">{state.rejection.reason}</p>
                             <p className="text-[11px] text-white/25 font-bold">
                               Declined by: {state.rejection.rejectedBy} · {new Date(state.rejection.timestamp).toLocaleString()}
                             </p>
                           </div>
                         )}
                       </div>
                     );
                   })}
                </div>
             </div>
          </div>

          {/* ═══════════ PENDING COMMITTEE VOTE SECTION ═══════════ */}
          {pendingVoteChanges.length > 0 && (
            <div className="space-y-12 border-t border-white/[0.08] pt-20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Vote className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.5em] text-amber-400">Pending Committee Vote</h3>
                  <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest">Unanimous approval required — all members must vote</p>
                </div>
              </div>

              {pendingVoteChanges.map(change => {
                const state = changeStates[change.change_id];
                const votedCount = state.votes.filter(v => v.voted).length;
                const totalVoters = state.votes.length;
                const allVoted = votedCount === totalVoters;
                const allApproved = allVoted && state.votes.every(v => v.approve);

                return (
                  <div key={change.change_id} className="p-10 rounded-2xl bg-amber-500/[0.03] border border-amber-500/15 space-y-8">
                    {/* Vote Header */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h4 className="font-bold text-white uppercase tracking-tight">{change.affected_section}</h4>
                        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-400">{votedCount}/{totalVoters} Votes Recorded</span>
                          {!allVoted && (
                            <span className="text-white/30">
                              — Awaiting {state.votes.filter(v => !v.voted).map(v => v.role).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Override Accept Button */}
                      <button
                        onClick={() => handleOverrideAccept(change.change_id)}
                        className="h-10 px-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                      >
                        <ShieldAlert className="w-4 h-4" /> Override & Accept
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${(votedCount / totalVoters) * 100}%` }}
                      />
                    </div>

                    {/* Voter Cards */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {state.votes.map((voter, vi) => (
                        <div key={vi} className={`p-6 rounded-xl border space-y-4 transition-all ${
                          voter.voted 
                            ? voter.approve 
                              ? "bg-emerald-500/5 border-emerald-500/20" 
                              : "bg-risk-high/5 border-risk-high/20"
                            : "bg-white/[0.02] border-white/5 hover:border-white/20"
                        }`}>
                          <div className="space-y-1">
                            <p className="text-[14px] font-bold text-white">{voter.name}</p>
                            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">{voter.role}</p>
                          </div>
                          {voter.voted ? (
                            <div className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${
                              voter.approve ? "text-emerald-400" : "text-risk-high"
                            }`}>
                              {voter.approve ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              {voter.approve ? "Approved" : "Rejected"}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleCastVote(change.change_id, vi, true)}
                                className="flex-1 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleCastVote(change.change_id, vi, false)}
                                className="flex-1 h-9 rounded-lg bg-risk-high/10 border border-risk-high/20 text-risk-high text-[10px] font-black uppercase tracking-widest hover:bg-risk-high/20 transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Vote Result */}
                    {allVoted && (
                      <div className={`p-6 rounded-xl border text-center ${
                        allApproved 
                          ? "bg-emerald-500/10 border-emerald-500/20" 
                          : "bg-risk-high/10 border-risk-high/20"
                      }`}>
                        <p className={`text-[14px] font-black uppercase tracking-widest ${
                          allApproved ? "text-emerald-400" : "text-risk-high"
                        }`}>
                          {allApproved 
                            ? "✓ Unanimous Approval — Amendment will be applied" 
                            : "✗ Vote Failed — Amendment remains in review"}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══════════ TASK BREAKDOWN BY DEPARTMENT ═══════════ */}
          <div className="border-t border-white/[0.08] pt-20">
            <TaskBreakdown />
          </div>

          {/* Footer */}
          <div className="pt-24 border-t border-white/[0.08] flex justify-between items-end print:border-black opacity-40">
             <div className="space-y-8">
                <p className="text-[11px] text-text-muted max-w-sm leading-relaxed font-bold uppercase tracking-[0.2em] print:text-black/60">
                   This assessment was autonomously verified by Compliance Swarm v4. Audit trails available via secure node handshake.
                 </p>
                <div className="flex items-center space-x-8 text-text-muted">
                   <Globe className="w-4 h-4" />
                   <Calendar className="w-4 h-4" />
                   <FileText className="w-4 h-4" />
                </div>
             </div>
             <div className="text-right space-y-4">
                <div className="w-40 h-px bg-white/10 ml-auto print:bg-black" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Authenticity Index: {report?.run_id || '0x921A'}-F4</p>
             </div>
          </div>
        </div>
      </div>

      {/* ─── DECLINE MODAL ─── */}
      {declineTarget && (
        <DeclineAmendmentModal 
          isOpen={!!declineTarget}
          onClose={() => setDeclineTarget(null)}
          onSubmit={handleDeclineSubmit}
          amendment={declineTarget}
        />
      )}
    </div>
  );
}
