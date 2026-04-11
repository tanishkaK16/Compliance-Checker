/* ═══════════════════════════════════════════════════════════════════════
 *  INDUSTRY PROFILES — hardcoded compliance data for demo
 *  Based on real regulatory text:
 *    • EU Digital Services Act (DSA)  — sample_regulations/EU DSA Age Law.md
 *    • DGCA CAR Sec 7 Series J Part 3 — sample_regulations/DGCA CAR …
 *    • FSSAI Front-of-Pack Labeling Guidelines
 * ═══════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────── Types ─────────────────────────── */

export type Sector =
  | "Financial"
  | "Software"
  | "Food"
  | "Aviation";

export interface SubSectorMap {
  [sector: string]: string[];
}

export interface BusinessModelOption {
  label: string;
  sector: Sector;
}

export interface ProfileConfig {
  sector: Sector;
  subSector: string;
  businessModels: string[];
}

export interface ProfileMetric {
  title: string;
  value: string | number;
  color: "primary" | "success" | "warning" | "error";
}

export interface ProfileChange {
  change_id: string;
  affected_section: string;
  old_text: string;
  new_text: string;
  amendment: string;
  risk: "high" | "medium" | "low";
  section_hint: string;
}

export interface ProfileFineRisk {
  probability_percent: number;
  estimated_amount_lakh: number;
  window_days: number;
  reference_cases: { id: string; case: string; fine: string }[];
}

export interface RoadmapItem {
  id: string;
  date: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "upcoming";
}

export interface IndustryProfile {
  id: string;
  sector: Sector;
  subSector: string;
  label: string;
  summary: string;
  metrics: ProfileMetric[];
  fineRisk: ProfileFineRisk;
  changes: ProfileChange[];
  roadmap: RoadmapItem[];
}

/* ─────────────────────────── Constants ─────────────────────────── */

export const SECTORS: Sector[] = [
  "Financial",
  "Software",
  "Food",
  "Aviation",
];

export const SUB_SECTORS: SubSectorMap = {
  Financial: ["Banking", "Insurance", "FinTech", "NBFC"],
  Software: ["SaaS", "Enterprise", "Consumer App", "Open Source"],
  Food: ["Packaged Foods", "Kids Nutrition", "Beverages", "Restaurant Chain"],
  Aviation: ["Commercial Airlines", "Cargo", "Charter", "MRO"],
};

export const BUSINESS_MODELS: BusinessModelOption[] = [
  // Financial
  { label: "Lending", sector: "Financial" },
  { label: "Payments", sector: "Financial" },
  { label: "Wealth Mgmt", sector: "Financial" },
  { label: "Neo-Banking", sector: "Financial" },
  // Software
  { label: "B2B SaaS", sector: "Software" },
  { label: "B2C Platform", sector: "Software" },
  { label: "Freemium", sector: "Software" },
  { label: "Marketplace", sector: "Software" },
  { label: "Ad-Supported", sector: "Software" },
  // Food
  { label: "FMCG", sector: "Food" },
  { label: "D2C Snacks", sector: "Food" },
  { label: "QSR Chain", sector: "Food" },
  { label: "Subscription Box", sector: "Food" },
  // Aviation
  { label: "Scheduled Ops", sector: "Aviation" },
  { label: "Low-Cost Carrier", sector: "Aviation" },
  { label: "Full-Service", sector: "Aviation" },
  { label: "Regional", sector: "Aviation" },
];

/* ═══════════════════════════════════════════════════════════════════════
 *  PROFILE 1 — SOFTWARE / SaaS
 *  Source: EU Digital Services Act (DSA) — Articles 12, 16, 17, 20,
 *          21, 26, 27, 38, 39, 53, 86
 * ═══════════════════════════════════════════════════════════════════════ */

const SOFTWARE_SAAS: IndustryProfile = {
  id: "software_saas",
  sector: "Software",
  subSector: "SaaS",
  label: "Software — SaaS (EU DSA Compliance)",
  summary:
    "6 compliance gaps detected against the EU Digital Services Act. " +
    "Platform must implement transparent content moderation, ad disclosure, " +
    "and user complaint mechanisms per Articles 12–53.",
  metrics: [
    { title: "Total Gaps", value: 6, color: "error" },
    { title: "Critical", value: 2, color: "warning" },
    { title: "Amendments Drafted", value: 6, color: "primary" },
    { title: "Compliance Score", value: 42, color: "success" },
  ],
  fineRisk: {
    probability_percent: 68,
    estimated_amount_lakh: 120,
    window_days: 60,
    reference_cases: [
      { id: "rc1", case: "Meta (EU DSA)", fine: "€1.2B" },
      { id: "rc2", case: "TikTok (DSA)", fine: "€345M" },
      { id: "rc3", case: "X/Twitter (DSA)", fine: "€50M" },
    ],
  },
  changes: [
    {
      change_id: "sw1",
      affected_section: "User Complaint Mechanism (Art. 12)",
      section_hint: "Art. 12",
      risk: "high",
      old_text:
        "Users can email support@product.com to report issues. Average response time is 5–7 business days. No formal tracking or status updates provided.",
      new_text:
        "Platforms must offer a clear and accessible contact point so users can easily reach them and complain or report any issue. (DSA Article 12)",
      amendment:
        "- Users email support@product.com, 5–7 day response, no tracking\n+ In-app complaint portal with real-time ticket tracking, auto-acknowledgment within 24 hours, and status updates at each moderation stage per Art. 12",
    },
    {
      change_id: "sw2",
      affected_section: "Illegal Content Reporting (Art. 16)",
      section_hint: "Art. 16",
      risk: "high",
      old_text:
        "No dedicated mechanism for reporting illegal content. Users use the same general support channel for all requests.",
      new_text:
        "If you encounter illegal content such as counterfeit products or CSAM, you can notify the platform directly using their reporting mechanisms. (DSA Article 16)",
      amendment:
        "- No dedicated illegal content reporting; users use general support\n+ Dedicated 'Report Illegal Content' button on every content page with structured form fields, auto-routing to Trust & Safety team, and mandatory 48-hour review SLA per Art. 16",
    },
    {
      change_id: "sw3",
      affected_section: "Content Moderation Transparency (Art. 17)",
      section_hint: "Art. 17",
      risk: "medium",
      old_text:
        "Content removed without explanation. User receives a generic 'Your post has been removed' notification with no further details.",
      new_text:
        "Platforms are required to explain their content moderation decisions clearly to all affected users. (DSA Article 17)",
      amendment:
        "- Generic 'post removed' notification with no explanation\n+ Structured decision notice containing: specific rule violated, content excerpt, appeal link, and estimated appeal review timeline per Art. 17",
    },
    {
      change_id: "sw4",
      affected_section: "Internal Appeal System (Art. 20)",
      section_hint: "Art. 20",
      risk: "medium",
      old_text:
        "No internal appeal process exists. Users who disagree with moderation decisions have no recourse within the platform.",
      new_text:
        "If you disagree with a platform's content moderation decision, you can request a review using its internal complaint system. (DSA Article 20)",
      amendment:
        "- No internal appeal process for moderation decisions\n+ One-click 'Appeal This Decision' button with structured appeal form, human reviewer guarantee, and 7-day resolution SLA per Art. 20",
    },
    {
      change_id: "sw5",
      affected_section: "Advertising Transparency (Art. 26 & 39)",
      section_hint: "Art. 26 & 39",
      risk: "medium",
      old_text:
        "Sponsored content appears in user feeds without any visual distinction. No disclosure of advertiser identity or targeting parameters.",
      new_text:
        "Platforms must clearly indicate when content is advertising, provide meaningful information about who paid for the ad and why the user is seeing it, and maintain public advertising libraries. (DSA Articles 26 & 39)",
      amendment:
        "- Sponsored content mixed into feed with no disclosure\n+ 'Sponsored' label on all paid content, 'Why am I seeing this?' info panel showing advertiser name and targeting criteria, plus searchable public ad library per Art. 26 & 39",
    },
    {
      change_id: "sw6",
      affected_section: "Recommendation Algorithm Disclosure (Art. 27 & 38)",
      section_hint: "Art. 27 & 38",
      risk: "low",
      old_text:
        "Content feed is fully algorithmic with no transparency. Users cannot modify or opt out of profiling-based recommendations.",
      new_text:
        "Platforms must explain the main parameters used in their recommendation systems and offer at least one recommendation option that is not based on user profiling. (DSA Articles 27 & 38)",
      amendment:
        "- Fully algorithmic feed, no transparency, no opt-out\n+ 'How Your Feed Works' explainer page, user-facing parameter controls, and a 'Chronological / Non-Profiled' feed toggle per Art. 27 & 38",
    },
  ],
  roadmap: [
    {
      id: "sr1",
      date: "2026-05-01",
      title: "Art. 12 Complaint Portal",
      description: "Deploy in-app complaint mechanism with real-time tracking.",
      status: "in-progress",
    },
    {
      id: "sr2",
      date: "2026-06-15",
      title: "Art. 16 Illegal Content Pipeline",
      description: "Launch dedicated reporting flow with Trust & Safety routing.",
      status: "upcoming",
    },
    {
      id: "sr3",
      date: "2026-07-01",
      title: "Art. 17 & 20 Moderation Notices",
      description: "Structured decision notices and one-click appeal system.",
      status: "upcoming",
    },
    {
      id: "sr4",
      date: "2026-08-15",
      title: "Art. 26/39 Ad Transparency",
      description: "Public ad library and 'Why am I seeing this?' panel.",
      status: "upcoming",
    },
    {
      id: "sr5",
      date: "2026-09-30",
      title: "Art. 27/38 Algorithm Disclosure",
      description: "Non-profiled feed option and recommendation explainer page.",
      status: "upcoming",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
 *  PROFILE 2 — AVIATION / Commercial Airlines
 *  Source: DGCA CAR Section 7, Series J, Part III
 *          (Flight Duty Period, Rest Period, Fatigue Management)
 * ═══════════════════════════════════════════════════════════════════════ */

const AVIATION_COMMERCIAL: IndustryProfile = {
  id: "aviation_commercial",
  sector: "Aviation",
  subSector: "Commercial Airlines",
  label: "Aviation — Commercial (DGCA FDTL Compliance)",
  summary:
    "4 compliance gaps detected against DGCA CAR Sec 7 Series J Part III. " +
    "Airline must update crew scheduling, rest facility standards, and " +
    "fatigue risk management per ICAO Annex 6 prescriptive requirements.",
  metrics: [
    { title: "Total Gaps", value: 4, color: "error" },
    { title: "Critical", value: 2, color: "warning" },
    { title: "Amendments Drafted", value: 4, color: "primary" },
    { title: "Compliance Score", value: 55, color: "success" },
  ],
  fineRisk: {
    probability_percent: 74,
    estimated_amount_lakh: 45,
    window_days: 30,
    reference_cases: [
      { id: "rc1", case: "IndiGo (DGCA)", fine: "₹30L" },
      { id: "rc2", case: "SpiceJet (DGCA)", fine: "₹10L" },
      { id: "rc3", case: "Air India (DGCA)", fine: "₹5L" },
    ],
  },
  changes: [
    {
      change_id: "av1",
      affected_section: "Acclimatization Rules (Sec 3.1)",
      section_hint: "Sec 3.1",
      risk: "high",
      old_text:
        "Crew acclimatization is assumed after landing at a new time zone. No formal tracking of circadian synchronization or 48-hour adaptation window.",
      new_text:
        "A crew member is considered acclimatised to a 3-hour wide time zone surrounding the local time at the point of departure. After crossing >3 hours, they remain acclimatised to the departure zone for 48 hours. (CAR Sec 3.1)",
      amendment:
        "Update crew scheduling module to enforce a 48-hour acclimatization buffer for time zone crossings exceeding 3 hours. Rostering software must block FDP assignments that violate the departure-zone-lock rule.",
    },
    {
      change_id: "av2",
      affected_section: "Rest Facility Standards (Sec 3.16)",
      section_hint: "Sec 3.16",
      risk: "high",
      old_text:
        "In-flight rest facilities are not categorized. Crew rest on available business class seats without formal seat angle or isolation requirements.",
      new_text:
        "Rest facilities are categorized as Bunk (≥80° recline, isolated), Isolated Rest Seat (≥45° recline, 55″ pitch, curtain separation), or Basic Rest Seat (≥40° recline, not adjacent to passengers). (CAR Sec 3.16)",
      amendment:
        "Classify all fleet's in-flight rest facilities into Bunk / Isolated Seat / Basic Seat categories. Update aircraft configuration documents and verify minimum pitch (55″ for Isolated, 40° recline for Basic) during C-checks.",
    },
    {
      change_id: "av3",
      affected_section: "Flight Duty Period Limits (Sec 3.5.2)",
      section_hint: "Sec 3.5.2",
      risk: "medium",
      old_text:
        "FDP is tracked from first departure to last arrival. Reporting time and post-flight duties are not counted as part of the duty period.",
      new_text:
        "FDP commences when a flight crew member is required to report for duty and finishes at engine(s) off at the end of the last flight. (CAR Sec 3.5.2)",
      amendment:
        "Redefine FDP calculation in the crew management system to include reporting time as start and engine-off as end. Retrain all dispatchers on the updated FDP boundary definition.",
    },
    {
      change_id: "av4",
      affected_section: "Night Duty Classification (Sec 3.11)",
      section_hint: "Sec 3.11",
      risk: "medium",
      old_text:
        "Night duty is defined as any flight departing after 22:00 local time. There is no consideration of the crew's acclimatized time zone.",
      new_text:
        "Night Duty is any Duty Period encroaching upon any portion of 0000–0600 hours in the time zone to which the crew is acclimatised. (CAR Sec 3.11)",
      amendment:
        "Update night duty classification to use the crew's acclimatised time zone (not station local time). Rostering software must compute the 0000–0600 window relative to acclimatised zone and apply enhanced rest requirements accordingly.",
    },
  ],
  roadmap: [
    {
      id: "ar1",
      date: "2026-05-10",
      title: "Acclimatization Module",
      description: "Deploy 48-hour time-zone lock in the crew scheduling engine.",
      status: "in-progress",
    },
    {
      id: "ar2",
      date: "2026-06-01",
      title: "Rest Facility Audit",
      description: "Classify and certify all in-flight rest positions across fleet.",
      status: "upcoming",
    },
    {
      id: "ar3",
      date: "2026-07-15",
      title: "FDP Boundary Update",
      description: "Redefine FDP start/end in crew management software.",
      status: "upcoming",
    },
    {
      id: "ar4",
      date: "2026-08-01",
      title: "Night Duty Re-classification",
      description: "Switch night-duty computation to acclimatised time zone.",
      status: "upcoming",
    },
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
 *  PROFILE 3 — FOOD / Kids Nutrition
 *  Source: FSSAI Front-of-Pack Labelling (FoPL) Guidelines
 * ═══════════════════════════════════════════════════════════════════════ */

const FOOD_KIDS: IndustryProfile = {
  id: "food_kids",
  sector: "Food",
  subSector: "Kids Nutrition",
  label: "Food — Kids Nutrition (FSSAI Compliance)",
  summary:
    "4 compliance gaps detected against FSSAI Front-of-Pack Labelling and " +
    "advertising-to-children guidelines. Products must display nutritional " +
    "health star ratings and restrict misleading cartoon-based marketing.",
  metrics: [
    { title: "Total Gaps", value: 4, color: "error" },
    { title: "Critical", value: 1, color: "warning" },
    { title: "Amendments Drafted", value: 4, color: "primary" },
    { title: "Compliance Score", value: 61, color: "success" },
  ],
  fineRisk: {
    probability_percent: 52,
    estimated_amount_lakh: 15,
    window_days: 90,
    reference_cases: [
      { id: "rc1", case: "Nestlé (FSSAI)", fine: "₹10L" },
      { id: "rc2", case: "Patanjali (FSSAI)", fine: "₹4.5L" },
      { id: "rc3", case: "ITC Foods (FSSAI)", fine: "₹2L" },
    ],
  },
  changes: [
    {
      change_id: "fd1",
      affected_section: "Front-of-Pack Nutrition Label",
      section_hint: "FoPL Guideline 4.2",
      risk: "high",
      old_text:
        "Nutritional information is printed in small text on the back of the package. No front-of-pack summary or health star rating is displayed.",
      new_text:
        "All packaged food products must display a prominent Front-of-Pack Label (FoPL) showing a Health Star Rating (1–5 stars) based on sugar, salt, and fat content per FSSAI guidelines.",
      amendment:
        "Add a Front-of-Pack Health Star Rating badge (minimum 2cm diameter) to all product packaging. Star rating must be computed using the FSSAI nutrient profiling algorithm and updated annually.",
    },
    {
      change_id: "fd2",
      affected_section: "Advertising to Children Restrictions",
      section_hint: "FoPL Guideline 6.1",
      risk: "medium",
      old_text:
        "Products use cartoon mascots and toy giveaways to target children under 12 in TV and digital advertising with no nutritional context.",
      new_text:
        "FSSAI restricts advertising of HFSS (High Fat, Sugar, Salt) products to children. Cartoon characters and toy incentives must not be used to market HFSS foods to children under 14.",
      amendment:
        "Remove cartoon mascots from HFSS product packaging and advertising targeting children under 14. Replace with factual nutritional comparisons. Toy giveaway promotions must be discontinued for products exceeding HFSS thresholds.",
    },
    {
      change_id: "fd3",
      affected_section: "Sugar Content Disclosure",
      section_hint: "FoPL Guideline 5.3",
      risk: "medium",
      old_text:
        "Added sugar is listed under a combined 'carbohydrates' line item. Free sugars, added sugars, and natural sugars are not distinguished.",
      new_text:
        "Products must separately declare Added Sugars (in grams and as percentage of Daily Value) on the front-of-pack label, distinct from total carbohydrates.",
      amendment:
        "Break out 'Added Sugars' as a separate line item on both back-panel nutrition table and front-of-pack FoPL. Display as grams and % Daily Value based on a 2000 kcal reference diet.",
    },
    {
      change_id: "fd4",
      affected_section: "Allergen Warning Standardization",
      section_hint: "FSSAI Reg 2.4.1",
      risk: "low",
      old_text:
        "Allergen information is embedded within the ingredients list in regular font. No bold highlighting or separate allergen box is present.",
      new_text:
        "Allergens must be declared in a separate 'Contains' box with bold typeface, and a 'May Contain' advisory for cross-contamination risks, per FSSAI Regulation 2.4.1.",
      amendment:
        "Add a dedicated 'Contains: [allergens]' box in bold type on pack front. Add 'May Contain' advisory for shared-facility cross-contamination. Use FSSAI's 14-allergen reference list.",
    },
  ],
  roadmap: [
    {
      id: "fr1",
      date: "2026-05-15",
      title: "FoPL Star Rating Design",
      description: "Finalize Health Star Rating badge design and nutrient profiling algorithm.",
      status: "in-progress",
    },
    {
      id: "fr2",
      date: "2026-07-01",
      title: "HFSS Ad Review",
      description: "Audit all child-targeted advertising for HFSS compliance.",
      status: "upcoming",
    },
    {
      id: "fr3",
      date: "2026-08-15",
      title: "Packaging Redesign",
      description: "Roll out updated packaging with FoPL, sugar disclosure, and allergen box.",
      status: "upcoming",
    },
    {
      id: "fr4",
      date: "2026-10-01",
      title: "Retailer Shelf Compliance",
      description: "Ensure all retail partners display updated packaging in-store.",
      status: "upcoming",
    },
  ],
};

/* ─────────────────────────── Profile Registry ─────────────────────────── */

/* ═══════════════════════════════════════════════════════════════════════
 *  PROFILE 4 — FINANCIAL / Banking
 *  Source: RBI/2026/41 — Trade Receivables Discounting System Directions
 *          (mirrored from the main demo dashboard / latest_report.json)
 * ═══════════════════════════════════════════════════════════════════════ */

const FINANCIAL_BANKING: IndustryProfile = {
  id: "financial_banking",
  sector: "Financial",
  subSector: "Banking",
  label: "Financial — Banking (RBI Compliance)",
  summary:
    "1 clause change detected affecting internal policy and product catalog. " +
    "Cross-border inward transaction notification must be updated per RBI/2026/41 TReDS Directions.",
  metrics: [
    { title: "Total Changes", value: 1, color: "error" },
    { title: "High Risk", value: 0, color: "warning" },
    { title: "Amendments Ready", value: 1, color: "primary" },
    { title: "Evolution Score", value: 98, color: "success" },
  ],
  fineRisk: {
    probability_percent: 2,
    estimated_amount_lakh: 0,
    window_days: 90,
    reference_cases: [
      { id: "rc1", case: "Bank of India", fine: "₹58.5L" },
      { id: "rc2", case: "HSBC", fine: "₹31.8L" },
      { id: "rc3", case: "Jeypore Co-op", fine: "₹2L" },
    ],
  },
  changes: [
    {
      change_id: "fn1",
      affected_section: "III. Key Provisions of the Draft Directions",
      section_hint: "Sec III",
      risk: "medium",
      old_text:
        "The RBI has released the draft Reserve Bank of India (Trade Receivables Discounting System) Directions with the objective of rationalizing and simplifying the existing regulatory framework.",
      new_text:
        "Banks shall inform their customer of the receipt of cross-border inward transactions immediately on receipt of inward message.",
      amendment:
        "- NBFC follows legacy TReDS framework; no immediate customer notification on cross-border inward transactions\n+ The NBFC shall inform its customers of the receipt of cross-border inward transactions immediately upon receiving the inward message from the bank, in accordance with the RBI's TReDS Directions. Notification shall be made through a secure and reliable means, as specified by the RBI.",
    },
  ],
  roadmap: [
    {
      id: "fnr1",
      date: "2026-04-15",
      title: "Policy Update — TReDS Sec III",
      description: "Update internal policy to reflect immediate customer notification requirement for cross-border inward transactions.",
      status: "in-progress",
    },
    {
      id: "fnr2",
      date: "2026-05-01",
      title: "Notification Pipeline",
      description: "Deploy automated SMS/email notification on inward message receipt per RBI directive.",
      status: "upcoming",
    },
    {
      id: "fnr3",
      date: "2026-06-01",
      title: "Compliance Audit",
      description: "Internal audit to verify zero-drift against RBI/2026/41 circular requirements.",
      status: "upcoming",
    },
  ],
};

/* ─────────────────────────── Profile Registry ─────────────────────────── */

export const PROFILES: Record<string, IndustryProfile> = {
  financial_banking: FINANCIAL_BANKING,
  software_saas: SOFTWARE_SAAS,
  aviation_commercial: AVIATION_COMMERCIAL,
  aviation_commercialairlines: AVIATION_COMMERCIAL,
  food_kids: FOOD_KIDS,
  food_kidsnutrition: FOOD_KIDS,
};

/**
 * Find a profile matching user config.
 * Falls back to the first profile for a given sector if no exact match.
 */
export function resolveProfile(config: ProfileConfig): IndustryProfile | null {
  // Exact match
  const key = `${config.sector.toLowerCase()}_${config.subSector.toLowerCase().replace(/\s+/g, "")}`;
  if (PROFILES[key]) return PROFILES[key];

  // Sector-level fallback
  const sectorMatch = Object.values(PROFILES).find(
    (p) => p.sector === config.sector
  );
  return sectorMatch || null;
}
