"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  BarChart3,
  Files,
  Activity,
  ArrowRight,
  Terminal,
  Search,
  ChevronRight,
  Factory,
  Plane,
  UtensilsCrossed,
  Monitor,
  Building2,
  CheckCircle2,
  Clock,
  Circle,
  Code2,
  X,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import RiskCard from "@/components/RiskCard";
import FineSimulator from "@/components/FineSimulator";
import DiffViewer from "@/components/DiffViewer";

import {
  SECTORS,
  SUB_SECTORS,
  BUSINESS_MODELS,
  resolveProfile,
  Sector,
  IndustryProfile,
  ProfileConfig,
} from "@/lib/industryProfiles";

/* ─────────────────── Sector Icon Map ─────────────────── */

const SECTOR_ICONS: Record<Sector, typeof Factory> = {
  Financial: Building2,
  Software: Monitor,
  Food: UtensilsCrossed,
  Aviation: Plane,
};

/* ═══════════════════════════════════════════════════════════════════ */

export default function IndustryDashboardPage() {
  /* ── Configurator State ── */
  const [sector, setSector] = useState<Sector>("Software");
  const [subSector, setSubSector] = useState(SUB_SECTORS["Software"][0]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [profile, setProfile] = useState<IndustryProfile | null>(null);

  const availableSubSectors = SUB_SECTORS[sector] || [];
  const availableModels = BUSINESS_MODELS.filter((m) => m.sector === sector);

  const handleSectorChange = (s: Sector) => {
    setSector(s);
    setSubSector(SUB_SECTORS[s]?.[0] || "");
    setSelectedModels([]);
  };

  const toggleModel = (label: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(label)) return prev.filter((m) => m !== label);
      if (prev.length >= 3) return prev;
      return [...prev, label];
    });
  };

  const handleLoadProfile = () => {
    const config: ProfileConfig = { sector, subSector, businessModels: selectedModels };
    const resolved = resolveProfile(config);
    setProfile(resolved);
  };

  /* ── Derived data from active profile ── */
  const changes = profile?.changes || [];
  const riskCards = changes.map((c) => ({
    id: c.change_id,
    title: c.affected_section,
    description: c.new_text.slice(0, 140) + (c.new_text.length > 140 ? "…" : ""),
    level: c.risk,
  }));

  const isSoftware = profile?.sector === "Software";

  // Build DiffViewer-compatible amendments (plain-language diffs)
  const amendments = changes
    .filter((c) => c.amendment)
    .map((c) => ({
      id: c.change_id,
      title: c.affected_section,
      diff: c.amendment,
    }));

  const SectorIcon = SECTOR_ICONS[sector];

  return (
    <div className="pt-24 pb-20 px-8 min-h-screen animate-fade-in">
      <div className="max-w-[1400px] mx-auto space-y-12">
        {/* ═══════════════ HEADER ═══════════════ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-white/[0.1] pb-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-4 text-[13px] font-bold text-white uppercase tracking-[0.5em]">
              <Factory className="w-4 h-4" />
              <span>Industry Compliance Profiler</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tightest text-white">
              Industry Profile Dashboard
            </h1>
            <p className="text-white text-lg font-medium max-w-2xl leading-relaxed">
              Select your industry sector to generate a profile-specific
              compliance assessment powered by real regulatory frameworks.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="linear-button-secondary h-12 px-8 flex items-center gap-2 shrink-0"
          >
            <ArrowRight className="w-5 h-5" /> Main Dashboard
          </Link>
        </div>

        {/* ═════════════ SECTION 1 — CONFIGURATOR ═════════════ */}
        <div className="linear-card p-12 space-y-10 border-neutral-800">
          <div className="flex items-center space-x-4">
            <SectorIcon className="w-5 h-5 text-white" />
            <h2 className="text-[13px] font-bold text-white uppercase tracking-[0.4em]">
              Profile Configurator
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Sector Select */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-white uppercase tracking-[0.3em]">
                Sector
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SECTORS.map((s) => {
                  const Icon = SECTOR_ICONS[s];
                  const isActive = s === sector;
                  return (
                    <button
                      key={s}
                      onClick={() => handleSectorChange(s)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[12px] font-bold uppercase tracking-widest transition-all ${
                        isActive
                          ? "bg-white/10 border-white/30 text-white"
                          : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/20 hover:text-white/70"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{s}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-Sector Select */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-white uppercase tracking-[0.3em]">
                Sub-Sector
              </label>
              <div className="grid gap-3">
                {availableSubSectors.map((ss) => (
                  <button
                    key={ss}
                    onClick={() => setSubSector(ss)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[12px] font-bold uppercase tracking-widest transition-all ${
                      ss === subSector
                        ? "bg-white/10 border-white/30 text-white"
                        : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/20 hover:text-white/70"
                    }`}
                  >
                    <ChevronRight className="w-3 h-3 shrink-0" />
                    {ss}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Model Tags */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-white uppercase tracking-[0.3em]">
                Business Model{" "}
                <span className="text-white/30">(max 3)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableModels.map((m) => {
                  const isSelected = selectedModels.includes(m.label);
                  return (
                    <button
                      key={m.label}
                      onClick={() => toggleModel(m.label)}
                      className={`px-4 py-2 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                        isSelected
                          ? "bg-primary-500/20 border-primary-500/40 text-white"
                          : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:border-white/20 hover:text-white/70"
                      }`}
                    >
                      {m.label}
                      {isSelected && <X className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                {selectedModels.length}/3 selected
              </p>
            </div>
          </div>

          {/* Load Button */}
          <button
            onClick={handleLoadProfile}
            className="w-full h-14 bg-white text-black text-[13px] font-black rounded-xl hover:bg-neutral-200 hover:scale-[1.005] transition-all uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(255,255,255,0.08)] flex items-center justify-center gap-3"
          >
            <Activity className="w-5 h-5" />
            Load Compliance Profile
          </button>
        </div>

        {/* ═══════ SECTION 2 — PROFILE DASHBOARD (only if loaded) ═══════ */}
        {profile && (
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            {/* Profile Header */}
            <div className="space-y-4 border-b border-white/[0.1] pb-10">
              <div className="flex items-center gap-3 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                <Activity className="w-3.5 h-3.5" />
                <span>Active Profile: {profile.label}</span>
              </div>
              <p className="text-white text-lg font-medium max-w-3xl leading-relaxed">
                {profile.summary}
              </p>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              {profile.metrics.map((m, i) => {
                const icons = [ShieldAlert, BarChart3, Files, Activity];
                return (
                  <MetricCard
                    key={i}
                    title={m.title}
                    value={m.value}
                    icon={icons[i % icons.length]}
                    color={m.color}
                  />
                );
              })}
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-12">
                {/* ── SOFTWARE SPECIFIC: Code Diff View ── */}
                {isSoftware && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-4 px-2">
                      <Code2 className="w-5 h-5 text-white" />
                      <span className="text-[13px] font-bold text-white uppercase tracking-[0.4em]">
                        Current Implementation vs Compliant Implementation
                      </span>
                    </div>
                    <DiffViewer amendments={amendments} />
                  </div>
                )}

                {/* ── NON-SOFTWARE: Semantic Delta View ── */}
                {!isSoftware && changes.length > 0 && (
                  <div className="space-y-8">
                    <div className="flex items-center space-x-4 px-2">
                      <Terminal className="w-5 h-5 text-white" />
                      <span className="text-[13px] font-bold text-white uppercase tracking-[0.4em]">
                        Semantic Delta Analyzer
                      </span>
                    </div>
                    {changes.map((change) => (
                      <div
                        key={change.change_id}
                        className="linear-card p-10 space-y-8 overflow-hidden relative border-neutral-800"
                      >
                        <div className="flex items-center justify-between border-b border-white/[0.1] pb-6">
                          <h4 className="text-[12px] font-bold text-white uppercase tracking-widest">
                            {change.affected_section}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                              change.risk === "high"
                                ? "text-risk-high border-risk-high/30 bg-risk-high/5"
                                : change.risk === "medium"
                                ? "text-risk-medium border-risk-medium/30 bg-risk-medium/5"
                                : "text-risk-low border-risk-low/30 bg-risk-low/5"
                            }`}
                          >
                            {change.risk}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <label className="text-[11px] font-bold text-white uppercase tracking-[0.3em]">
                              Current State
                            </label>
                            <div className="p-6 bg-black/40 rounded-xl border border-white/[0.08] text-[14px] text-white/70 leading-relaxed font-medium">
                              {change.old_text}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <label className="text-[11px] font-bold text-white uppercase tracking-[0.3em]">
                              Required State
                            </label>
                            <div className="p-6 bg-white/[0.04] rounded-xl border border-white/[0.15] text-[14px] text-white font-medium leading-relaxed">
                              {change.new_text}
                            </div>
                          </div>
                        </div>
                        {change.amendment && (
                          <div className="space-y-3 pt-4 border-t border-white/5">
                            <label className="text-[11px] font-bold text-white/40 uppercase tracking-[0.3em]">
                              Drafted Amendment
                            </label>
                            <p className="text-[14px] text-white/80 font-medium leading-relaxed">
                              {change.amendment}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-12">
                {/* Fine Risk */}
                <div className="space-y-8">
                  <span className="text-[13px] font-bold text-white uppercase tracking-[0.4em] px-2">
                    Predictive Enforcement
                  </span>
                  <FineSimulator
                    probability={profile.fineRisk.probability_percent}
                    referenceCases={profile.fineRisk.reference_cases}
                  />
                </div>

                {/* Risk Cards */}
                <div className="space-y-8">
                  <span className="text-[13px] font-bold text-white uppercase tracking-[0.4em] px-2">
                    Compliance Hotspots
                  </span>
                  <div className="grid gap-4">
                    {riskCards.map((risk) => (
                      <RiskCard key={risk.id} {...risk} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════ SECTION 3 — REGULATORY ROADMAP ═══════ */}
            <div className="space-y-8 border-t border-white/[0.1] pt-12">
              <div className="flex items-center space-x-4 px-2">
                <Search className="w-5 h-5 text-white" />
                <span className="text-[13px] font-bold text-white uppercase tracking-[0.4em]">
                  Regulatory Roadmap
                </span>
              </div>

              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[23px] top-4 bottom-4 w-px bg-white/10" />

                <div className="space-y-4">
                  {profile.roadmap.map((item, i) => {
                    const statusConfig = {
                      completed: {
                        icon: CheckCircle2,
                        color: "text-white",
                        bg: "bg-white/10 border-white/30",
                        label: "Completed",
                      },
                      "in-progress": {
                        icon: Clock,
                        color: "text-risk-medium",
                        bg: "bg-risk-medium/10 border-risk-medium/30",
                        label: "In Progress",
                      },
                      upcoming: {
                        icon: Circle,
                        color: "text-white/30",
                        bg: "bg-white/[0.02] border-white/[0.06]",
                        label: "Upcoming",
                      },
                    };
                    const sc = statusConfig[item.status];
                    const StatusIcon = sc.icon;

                    return (
                      <div key={item.id} className="flex items-start gap-6 group">
                        {/* Timeline Dot */}
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all z-10 ${sc.bg}`}
                        >
                          <StatusIcon className={`w-5 h-5 ${sc.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 linear-card p-8 space-y-3 border-neutral-800 group-hover:border-white/20 transition-all">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[13px] font-bold text-white uppercase tracking-tight">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-4">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${sc.bg} ${sc.color}`}
                              >
                                {sc.label}
                              </span>
                              <span className="text-[11px] font-bold text-white/30 font-mono">
                                {item.date}
                              </span>
                            </div>
                          </div>
                          <p className="text-[14px] text-white/60 font-medium leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no profile loaded */}
        {!profile && (
          <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-6 opacity-30">
            <Factory className="w-16 h-16 text-white" />
            <p className="text-[14px] font-bold text-white uppercase tracking-[0.3em]">
              Select a sector and load a profile to begin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
