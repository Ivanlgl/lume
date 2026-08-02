import { useState, useEffect, useRef } from "react";
import {
  Home, Receipt, PieChart, Users, Plus, Share2, Mail, Lock,
  Eye, EyeOff, Landmark, TrendingUp, Wallet, CreditCard, Wifi, Car,
  Plane, ShoppingBasket, Banknote, ScanFace, RefreshCw,
  AppWindow, ShieldCheck, Download, Smartphone, Trash2, ImageDown, Link as LinkI,
  X, ChevronLeft, ChevronRight, GraduationCap, Building2, Bitcoin,
, AlertTriangle } from "lucide-react";

/* ============================ THEME ============================ */
const INK = "#14263D", ACCENT = "#0E7086", POS = "#158A62", NEG = "#B4453A";
const AMBIENT =
  "radial-gradient(60% 42% at 12% 8%,rgba(93,196,203,.5),transparent 65%)," +
  "radial-gradient(55% 40% at 92% 24%,rgba(138,127,212,.42),transparent 65%)," +
  "radial-gradient(60% 45% at 50% 105%,rgba(240,201,143,.45),transparent 60%)";
const F_UI = "'Schibsted Grotesk',system-ui,-apple-system,sans-serif";
const F_MONO = "'JetBrains Mono',ui-monospace,monospace";

const glass = (r = 24, blur = 24, fill = 0.5) => ({
  borderRadius: r, background: `rgba(255,255,255,${fill})`,
  backdropFilter: `blur(${blur}px) saturate(1.8)`, WebkitBackdropFilter: `blur(${blur}px) saturate(1.8)`,
  border: "1px solid rgba(255,255,255,0.7)",
  boxShadow: "0 14px 30px -18px rgba(23,42,72,.3), inset 0 1px 0 rgba(255,255,255,.85)",
});
const heroGlass = { ...glass(28, 28), boxShadow: "0 20px 44px -20px rgba(23,42,72,.35), inset 0 1px 0 rgba(255,255,255,.85)" };
const eyebrow = { fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(20,38,61,.45)" };
const mono = (size, weight = 700) => ({ fontFamily: F_MONO, fontSize: size, fontWeight: weight });

/* ============================ CONSTANTS ============================ */
/* Storage adapter: uses Claude artifact storage when present, otherwise the
   browser's localStorage (for local dev / Vercel before Supabase). Replaced
   entirely by Supabase in production (DEPLOY.md step 5). */
const store = {
  async get(key, shared) {
    if (typeof window !== "undefined" && window.storage) return window.storage.get(key, shared);
    try { const v = localStorage.getItem(key); return v == null ? null : { key, value: v }; } catch (e) { return null; }
  },
  async set(key, value, shared) {
    if (typeof window !== "undefined" && window.storage) return window.storage.set(key, value, shared);
    try { localStorage.setItem(key, value); return { key, value }; } catch (e) { return null; }
  },
  async delete(key, shared) {
    if (typeof window !== "undefined" && window.storage) return window.storage.delete(key, shared);
    try { localStorage.removeItem(key); return { key, deleted: true }; } catch (e) { return null; }
  },
  async list(prefix, shared) {
    if (typeof window !== "undefined" && window.storage) return window.storage.list(prefix, shared);
    try { return { keys: Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix)) }; } catch (e) { return { keys: [] }; }
  },
};
const BAK_PREFIX = "lume-bak-";

const FX = { SGD: 1, MYR: 0.29, USD: 1.35 };
const CUR_SYM = { SGD: "S$", MYR: "RM ", USD: "US$", JPY: "¥" };
const JOINT = "Joint";
const GRADIENTS = {
  Ivan: "linear-gradient(135deg,#F0C98F,#D98E6B)",
  Phoebe: "linear-gradient(135deg,#A99FE3,#8A7FD4)",
  _palette: [
    "linear-gradient(135deg,#F0C98F,#D98E6B)", "linear-gradient(135deg,#A99FE3,#8A7FD4)",
    "linear-gradient(135deg,#5DC4CB,#2E93A6)", "linear-gradient(135deg,#8FD4A8,#4FA37E)",
    "linear-gradient(135deg,#E4A0B0,#C87F91)", "linear-gradient(135deg,#9FB4D8,#3D5A9E)",
  ],
};
const MEMBER_COLOR = { Ivan: "#2E93A6", Phoebe: "#8A7FD4", _palette: ["#2E93A6", "#8A7FD4", "#4FA37E", "#D9A554", "#C87F91", "#3D5A9E"] };
const TODAY = "2026-06-06";

const GROUP_META = {
  Cash: { icon: "Wallet", color: "#2E93A6" },
  CPF: { icon: "Landmark", color: "#3D5A9E" },
  Investments: { icon: "TrendingUp", color: "#4FA37E" },
  Property: { icon: "Home", color: "#D9A554" },
  Crypto: { icon: "Bitcoin", color: "#8A7FD4" },
};
const GROUP_ORDER = ["Cash", "CPF", "Investments", "Property", "Crypto"];
const ICON_MAP = { Wallet, Landmark, TrendingUp, Home, Bitcoin, CreditCard, Building2, Wifi, Car, Plane, ShoppingBasket, GraduationCap, ShieldCheck, Banknote, Receipt, Coffee: Receipt };

const SWATCHES = ["#D9A554", "#2E93A6", "#4FA37E", "#8A7FD4", "#C87F91", "#94A7BE", "#3D5A9E", "#0E7086", "#B4453A", "#158A62"];
const CAT_ICON = {
  "Hawker & dining": "Receipt", "Groceries": "ShoppingBasket", "Transport": "Car", "Bills": "Wifi",
  "Bills & utilities": "Wifi", "Shopping": "ShoppingBasket", "Travel": "Plane", "Mortgage": "Home",
  "Income tax": "Landmark", "Insurance": "ShieldCheck", "Car": "Car", "Education": "GraduationCap",
  "Utilities": "Wifi", "MCST": "Building2", "Property tax": "Landmark", "Household": "Home", "Income": "Banknote", "Bonus": "Banknote", "Dividends": "TrendingUp", "Interest": "Landmark", "CPF inflows": "Landmark", "Refunds & rebates": "Receipt", "Other received": "Wallet",
};

/* ============================ SEED (Lim family) ============================ */
const acc = (id, type, group, name, sub, balance, currency, owner, extra = {}) => ({
  id, type, group, name, sub, balance, currency, owner,
  rate: extra.rate || "", notes: extra.notes || "", badge: extra.badge || "",
  acctNumber: extra.acctNumber || "", purchasePrice: extra.purchasePrice || "", loanAmount: extra.loanAmount || "",
  loanTenorYrs: extra.loanTenorYrs || "", loanRatePct: extra.loanRatePct || "", holdingType: extra.holdingType || "",
  history: extra.history || [{ date: "2026-03", balance: extra.h0 ?? balance }, { date: "2026-06", balance }],
});

const SEED = {
  budget: 20000,
  premium: false,
  demo: false,
  currentUserId: "m_ivan",
  members: [
    { id: "m_ivan", name: "Ivan", fullName: "Ivan Lim", initials: "I", gradient: GRADIENTS.Ivan, color: MEMBER_COLOR.Ivan, role: "owner", joined: "Mar 2026" },
    { id: "m_phoebe", name: "Phoebe", fullName: "Phoebe Lim", initials: "P", gradient: GRADIENTS.Phoebe, color: MEMBER_COLOR.Phoebe, role: "editor", joined: "Mar 2026" },
  ],
  grants: { m_phoebe: [] }, // ownerId -> [granteeId] allowed to edit owner's accounts
  hidden: {},               // viewerId -> [hiddenMemberId] (personal "remove from my view")
  planning: { annualExpenses: 120000, swr: 3.5, returnRate: 5, inflation: 2.5, monthlyInvest: 8000, retireAge: 55, currentAge: 36, mode: "base", classRates: null, rateMode: "mixed" },
  legacy: {
    executor: "", willLocation: "", lawyer: "",
    checklist: {
      m_ivan: { will: true, cpfNom: true, insNom: false, lpa: false },
      m_phoebe: { will: true, cpfNom: true, insNom: true, lpa: false },
    },
    docs: [
      { id: "d1", name: "Wills (signed originals)", where: "Fireproof box, study cupboard" },
      { id: "d2", name: "Insurance policy summary", where: "Google Drive · /Family/Insurance" },
    ],
  },
  categories: [
    { name: "Mortgage", color: "#D9A554", kind: "out" }, { name: "Income tax", color: "#3D5A9E", kind: "out" },
    { name: "Insurance", color: "#8A7FD4", kind: "out" }, { name: "Car", color: "#2E93A6", kind: "out" },
    { name: "Education", color: "#4FA37E", kind: "out" }, { name: "Utilities", color: "#8A7FD4", kind: "out" },
    { name: "MCST", color: "#94A7BE", kind: "out" }, { name: "Property tax", color: "#2E93A6", kind: "out" },
    { name: "Groceries", color: "#4FA37E", kind: "out" }, { name: "Transport", color: "#3D5A9E", kind: "out" },
    { name: "Travel", color: "#2E93A6", kind: "out" }, { name: "Bills", color: "#8A7FD4", kind: "out" },
    { name: "Others", color: "#94A7BE", kind: "out" },
    { name: "Income", color: "#158A62", kind: "in" }, { name: "Bonus", color: "#D9A554", kind: "in" },
    { name: "Dividends", color: "#4FA37E", kind: "in" }, { name: "Interest", color: "#3D5A9E", kind: "in" },
    { name: "CPF inflows", color: "#0E7086", kind: "in" }, { name: "Refunds & rebates", color: "#2E93A6", kind: "in" },
    { name: "Other received", color: "#94A7BE", kind: "in" },
  ],
  accounts: [
    acc("c1", "asset", "Cash", "UOB One", "Savings · Phoebe · updated today", 123241, "SGD", "Phoebe", { h0: 119000, rate: "3.30%" }),
    acc("c2", "asset", "Cash", "Lady's Savings", "Savings · Phoebe · 2d ago", 100077, "SGD", "Phoebe", { h0: 98500 }),
    acc("c3", "asset", "Cash", "DBS Multiplier", "Savings · Ivan · updated today", 70638, "SGD", "Ivan", { h0: 66200, rate: "2.20%" }),
    acc("c4", "asset", "Cash", "Ivan other savings", "OCBC · cash management", 22754, "SGD", "Ivan", { h0: 21000 }),
    acc("c5", "asset", "Cash", "Joint account (UOB)", "Shared · 1w ago", 50000, "SGD", "Joint", { h0: 48000 }),
    acc("c6", "asset", "Cash", "Phoebe other + child savings", "incl. junior savers", 16469, "SGD", "Phoebe", { h0: 15800 }),
    acc("p1", "asset", "CPF", "Ordinary Account", "2.5% p.a. · Ivan", 28072, "SGD", "Ivan", { rate: "2.50%", h0: 26800 }),
    acc("p2", "asset", "CPF", "Special Account", "4.08% p.a. · Ivan", 113068, "SGD", "Ivan", { rate: "4.08%", h0: 110200 }),
    acc("p3", "asset", "CPF", "MediSave", "4.08% p.a. · Ivan", 78338, "SGD", "Ivan", { rate: "4.08%", h0: 76900 }),
    acc("p4", "asset", "CPF", "Ordinary Account", "2.5% p.a. · Phoebe", 27765, "SGD", "Phoebe", { rate: "2.50%", h0: 26400 }),
    acc("p5", "asset", "CPF", "Special Account", "4.08% p.a. · Phoebe", 157794, "SGD", "Phoebe", { rate: "4.08%", h0: 153900 }),
    acc("p6", "asset", "CPF", "MediSave", "4.08% p.a. · Phoebe", 77462, "SGD", "Phoebe", { rate: "4.08%", h0: 76100 }),
    acc("i1", "asset", "Investments", "IBKR portfolio", "US$353,300 · rate 1.35 · Ivan", 477000, "USD", "Ivan", { badge: "USD", balance: 353300, h0: 340000 }),
    acc("i2", "asset", "Investments", "SRS — Endowus", "Tax-deferred · Ivan", 77493, "SGD", "Ivan", { h0: 70000 }),
    acc("i3", "asset", "Investments", "CDP & local brokers", "Tiger · LongBridge · CDP · Ivan", 20958, "SGD", "Ivan", { h0: 19500 }),
    acc("i4", "asset", "Investments", "CDP — STI ETF", "SG dividend equities · Phoebe", 44174, "SGD", "Phoebe", { h0: 42000 }),
    acc("i5", "asset", "Investments", "SRS — UOB", "Tax-deferred · Phoebe", 26531, "SGD", "Phoebe", { h0: 24000 }),
    acc("i6", "asset", "Investments", "Brokers", "Webull · Tiger · FSMOne · Phoebe", 51063, "SGD", "Phoebe", { h0: 48500 }),
    acc("r1", "asset", "Property", "Parc Clematis", "Home · Clementi · est. value", 2520000, "SGD", "Phoebe", { h0: 2480000, notes: "Bought Oct 2024 @ S$2.388M", purchasePrice: 2388000 }),
    acc("r2", "asset", "Property", "Norwood Grand", "Investment · Woodlands · est. value", 1820000, "SGD", "Ivan", { h0: 1760000, notes: "Bought Oct 2024 @ S$1.698M", purchasePrice: 1698000 }),
    acc("y1", "asset", "Crypto", "BTC · ETH · alts", "Self-custody + exchange · Ivan", 35703, "SGD", "Ivan", { h0: 31000 }),
    acc("l1", "liability", "Liabilities", "Parc Clematis mortgage", "Home loan · Phoebe", 1735930, "SGD", "Phoebe", { rate: "3.50%", h0: 1748000 }),
    acc("l2", "liability", "Liabilities", "Norwood Grand mortgage", "Investment loan · Ivan", 1273500, "SGD", "Ivan", { rate: "3.50%", h0: 1282000 }),
  ],
  expenses: [
    { id: "e1", name: "Parc Clematis mortgage", category: "Mortgage", amount: 5870.27, currency: "SGD", owner: "Phoebe", date: "2026-06-01", notes: "", dir: "out", recurring: { interval: "monthly", every: 1, endDate: "" } },
    { id: "e2", name: "MOE Student Care", category: "Education", amount: 680, currency: "SGD", owner: "Phoebe", date: "2026-06-06", notes: "George — full day", dir: "out", recurring: { interval: "monthly", every: 1, endDate: "" } },
    { id: "e3", name: "NTUC FairPrice", category: "Groceries", amount: 142.8, currency: "SGD", owner: "Ivan", date: "2026-06-06", notes: "", dir: "out", recurring: null },
    { id: "e4", name: "Klook — Japan 2027", category: "Travel", amount: 36200, currency: "JPY", owner: "Ivan", date: "2026-06-03", notes: "Hotel deposit, Tokyo", dir: "out", recurring: null, fxManual: 0.0088 },
    { id: "e5", name: "Singtel Fibre", category: "Bills", amount: 89.9, currency: "SGD", owner: "Ivan", date: "2026-06-02", notes: "", dir: "out", recurring: { interval: "monthly", every: 1, endDate: "" } },
    { id: "e6", name: "Shell VivoCity", category: "Transport", amount: 95, currency: "SGD", owner: "Ivan", date: "2026-06-05", notes: "", dir: "out", recurring: null },
    { id: "e7", name: "Prudential premium", category: "Insurance", amount: 412.3, currency: "SGD", owner: "Phoebe", date: "2026-06-04", notes: "Family life + CI", dir: "out", recurring: { interval: "monthly", every: 1, endDate: "" } },
    { id: "e8", name: "Salary — Phoebe", category: "Income", amount: 21000, currency: "SGD", owner: "Phoebe", date: "2026-06-01", notes: "", dir: "in", recurring: { interval: "monthly", every: 1, endDate: "" } },
    { id: "e9", name: "Salary — Ivan", category: "Income", amount: 16700, currency: "SGD", owner: "Ivan", date: "2026-06-01", notes: "", dir: "in", recurring: { interval: "monthly", every: 1, endDate: "" } },
  ],
};

/* Home hero historical shape (imported history; ends at live NW) */
const TRENDS = {
  "1M": [2908, 2913, 2910, 2919, 2924, 2929],
  "6M": [2740, 2775, 2810, 2848, 2881, 2905, 2929],
  "1Y": [2610, 2648, 2672, 2705, 2740, 2775, 2810, 2848, 2881, 2905, 2918, 2929],
  "All": [1180, 1520, 1890, 2210, 2480, 2705, 2929],
};
const SPEND_TREND = [17.9, 18.6, 19.1, 18.8, 19.4, 19.6];

/* Generic sample household — clearly marked as DEMO throughout the UI */
const DEMO = {
  budget: 8000, premium: false, demo: true,
  currentUserId: "d_alex",
  members: [
    { id: "d_alex", name: "Alex", fullName: "Alex Tan", initials: "A", gradient: GRADIENTS._palette[2], color: MEMBER_COLOR._palette[2], role: "owner", joined: "Demo" },
    { id: "d_sam", name: "Sam", fullName: "Sam Lee", initials: "S", gradient: GRADIENTS._palette[4], color: MEMBER_COLOR._palette[4], role: "editor", joined: "Demo" },
  ],
  grants: {}, hidden: {},
  planning: { annualExpenses: 60000, swr: 4, returnRate: 5, inflation: 2.5, monthlyInvest: 2000, retireAge: 62, currentAge: 35, mode: "base", classRates: null, rateMode: "mixed" },
  legacy: { executor: "", willLocation: "", lawyer: "", checklist: {}, docs: [] },
  categories: SEED.categories.map(c => ({ ...c })),
  accounts: [
    acc("da1", "asset", "Cash", "Savings account", "Bank savings · Alex", 50000, "SGD", "Alex", { h0: 48000 }),
    acc("da2", "asset", "Cash", "Savings account", "Bank savings · Sam", 40000, "SGD", "Sam", { h0: 39000 }),
    acc("da3", "asset", "Cash", "Joint account", "Shared expenses", 20000, "SGD", "Joint", { h0: 19000 }),
    acc("da4", "asset", "CPF", "CPF — Alex", "OA + SA + MA", 100000, "SGD", "Alex", { h0: 97000 }),
    acc("da5", "asset", "CPF", "CPF — Sam", "OA + SA + MA", 80000, "SGD", "Sam", { h0: 78000 }),
    acc("da6", "asset", "Investments", "Index fund portfolio", "Broad market ETFs", 120000, "SGD", "Alex", { h0: 112000 }),
    acc("da7", "asset", "Property", "HDB flat", "4-room · est. value", 650000, "SGD", "Joint", { h0: 640000 }),
    acc("da8", "liability", "Liabilities", "HDB loan", "Home loan · joint", 350000, "SGD", "Joint", { rate: "2.60%", h0: 354000 }),
  ],
  expenses: [
    { id: "de1", name: "Salary — Alex", category: "Income", amount: 6000, currency: "SGD", owner: "Alex", date: TODAY, notes: "", dir: "in", recurring: { interval: "monthly", every: 1, endDate: "" } },
    { id: "de2", name: "Salary — Sam", category: "Income", amount: 5000, currency: "SGD", owner: "Sam", date: TODAY, notes: "", dir: "in", recurring: { interval: "monthly", every: 1, endDate: "" } },
    { id: "de3", name: "HDB loan payment", category: "Mortgage", amount: 1600, currency: "SGD", owner: "Joint", date: TODAY, notes: "", dir: "out", recurring: { interval: "monthly", every: 1, endDate: "" } },
    { id: "de4", name: "Groceries", category: "Groceries", amount: 600, currency: "SGD", owner: "Joint", date: TODAY, notes: "", dir: "out", recurring: null },
    { id: "de5", name: "Utilities & telco", category: "Utilities", amount: 250, currency: "SGD", owner: "Joint", date: TODAY, notes: "", dir: "out", recurring: { interval: "monthly", every: 1, endDate: "" } },
    { id: "de6", name: "Transport", category: "Transport", amount: 300, currency: "SGD", owner: "Alex", date: TODAY, notes: "", dir: "out", recurring: null },
    { id: "de7", name: "Insurance premiums", category: "Insurance", amount: 400, currency: "SGD", owner: "Sam", date: TODAY, notes: "", dir: "out", recurring: { interval: "monthly", every: 1, endDate: "" } },
  ],
};

/* Backfill any keys missing from older saved data so the app never reads undefined */
function migrate(d) {
  if (!d || typeof d !== "object") return SEED;
  return {
    ...SEED, ...d,
    planning: { ...SEED.planning, ...(d.planning || {}) },
    legacy: { ...SEED.legacy, ...(d.legacy || {}), checklist: { ...SEED.legacy.checklist, ...((d.legacy || {}).checklist || {}) }, docs: (d.legacy && Array.isArray(d.legacy.docs)) ? d.legacy.docs : SEED.legacy.docs },
    members: Array.isArray(d.members) && d.members.length ? d.members : SEED.members,
    currentUserId: d.currentUserId || SEED.currentUserId,
    grants: d.grants || {},
    hidden: d.hidden || {},
    categories: (() => {
      const base = (Array.isArray(d.categories) && d.categories.length ? d.categories : SEED.categories)
        .map(c => ({ ...c, kind: c.kind || (["Income", "Bonus", "Dividends", "Interest", "CPF inflows", "Refunds & rebates", "Other received"].includes(c.name) ? "in" : "out") }));
      SEED.categories.filter(c => c.kind === "in").forEach(c => { if (!base.some(b => b.name === c.name)) base.push(c); });
      return base;
    })(),
    accounts: Array.isArray(d.accounts) ? d.accounts : SEED.accounts,
    expenses: Array.isArray(d.expenses) ? d.expenses : SEED.expenses,
    budget: typeof d.budget === "number" ? d.budget : SEED.budget,
    premium: !!d.premium,
    demo: !!d.demo,
    scenarioB: d.scenarioB || null,
    propertySim: { ...DEFAULT_PROP, ...(d.propertySim || {}) },
    cpfPlan: { monthlyContrib: 3700, ...(d.cpfPlan || {}) },
  };
}

/* ============================ HELPERS ============================ */
const fmt = (n) => "S$" + Math.round(n).toLocaleString("en-SG");
const fmtShort = (n) => Math.abs(n) >= 1e6 ? "S$" + (n / 1e6).toFixed(2) + "M" : Math.abs(n) >= 1e3 ? "S$" + Math.round(n / 1e3) + "k" : "S$" + Math.round(n);
const toSGD = (a) => (a.balance || 0) * (FX[a.currency] ?? 1);
const expSGD = (e) => (e.amount || 0) * (e.fxManual ?? FX[e.currency] ?? 1);
// How an asset passes on death (SG rules of thumb; overridable per account via a.passesBy)
function passesBy(a) {
  if (a.passesBy) return a.passesBy;
  if (a.group === "CPF") return "CPF nomination";
  if (a.owner === JOINT) return "Survivorship";
  if (a.group === "Property" && a.holdingType === "Joint tenancy") return "Survivorship";
  if (a.type === "liability") return "Estate settles";
  return "Will";
}
const PASS_COLORS = { "Will": "#3D5A9E", "CPF nomination": "#0E7086", "Survivorship": "#4FA37E", "Insurance nomination": "#8A7FD4", "Estate settles": "#B4453A" };
function downloadBlob(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
// A fresh household: keeps only the acting user, wipes all financial data
function emptyData(me) {
  const keep = me || SEED.members[0];
  return {
    budget: 20000, premium: false, demo: false,
    currentUserId: keep.id,
    members: [{ ...keep, role: "owner" }],
    grants: {}, hidden: {},
    planning: { ...SEED.planning },
    legacy: { executor: "", willLocation: "", lawyer: "", checklist: {}, docs: [] },
    categories: SEED.categories.map(c => ({ ...c })),
    accounts: [], expenses: [],
  };
}
const uid = () => Math.random().toString(36).slice(2, 9);

function buildPath(data, w, h, pad, area) {
  if (!data || data.length < 2) data = [data?.[0] ?? 0, data?.[0] ?? 0];
  const min = Math.min(...data), max = Math.max(...data), span = (max - min) || 1;
  const pts = data.map((v, i) => [pad + (i / (data.length - 1)) * (w - pad * 2), h - pad - ((v - min) / span) * (h - pad * 2)]);
  let d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
  for (let i = 1; i < pts.length; i++) { const [x, y] = pts[i], [px, py] = pts[i - 1], cx = (px + x) / 2; d += " C" + cx.toFixed(1) + " " + py.toFixed(1) + " " + cx.toFixed(1) + " " + y.toFixed(1) + " " + x.toFixed(1) + " " + y.toFixed(1); }
  if (area) d += " L" + pts[pts.length - 1][0].toFixed(1) + " " + (h - 2) + " L" + pts[0][0].toFixed(1) + " " + (h - 2) + " Z";
  return { d, last: pts[pts.length - 1] };
}
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function nextDue(dateStr, rec) {
  if (!rec) return null;
  const d = new Date(dateStr.length === 7 ? dateStr + "-01" : dateStr); const now = new Date(TODAY);
  if (isNaN(d)) return null;
  const step = () => {
    if (rec.interval === "daily") d.setDate(d.getDate() + rec.every);
    else if (rec.interval === "weekly") d.setDate(d.getDate() + 7 * rec.every);
    else if (rec.interval === "monthly") d.setMonth(d.getMonth() + rec.every);
    else if (rec.interval === "yearly") d.setFullYear(d.getFullYear() + rec.every);
  };
  let guard = 0; while (d <= now && guard++ < 400) step();
  if (rec.endDate) { const end = new Date(rec.endDate.length === 7 ? rec.endDate + "-28" : rec.endDate); if (!isNaN(end) && d > end) return "ended"; }
  return d.getDate() + " " + MONTHS[d.getMonth()];
}

/* ============================ PROJECTION ENGINE ============================ */
// FIRE number = annual expenses / safe withdrawal rate
function fireNumber(annualExpenses, swrPct) { return annualExpenses / (swrPct / 100); }
// Coast FIRE: amount needed TODAY that, growing untouched at realReturn, reaches FIRE by retireAge
function coastNumber(fire, realReturnPct, years) { return fire / Math.pow(1 + realReturnPct / 100, Math.max(0, years)); }
// Project net worth forward. Returns yearly points with low/expected/high bands (real terms).
function projectWealth({ startNW, monthlyInvest, returnRate, inflation, years }) {
  const realBase = (returnRate - inflation) / 100;
  const bands = { low: realBase - 0.03, expected: realBase, high: realBase + 0.03 };
  const annualInvest = monthlyInvest * 12;
  const series = {};
  for (const k in bands) {
    const r = bands[k]; let v = startNW; const pts = [Math.round(v)];
    for (let y = 1; y <= years; y++) { v = v * (1 + r) + annualInvest; pts.push(Math.round(v)); }
    series[k] = pts;
  }
  return series; // each array length years+1
}
// Years until portfolio (real) reaches target given monthly contributions
function yearsToTarget({ startNW, monthlyInvest, returnRate, inflation, target }) {
  const r = (returnRate - inflation) / 100, annualInvest = monthlyInvest * 12;
  let v = startNW, y = 0;
  if (v >= target) return 0;
  while (v < target && y < 80) { v = v * (1 + r) + annualInvest; y++; }
  return y >= 80 ? null : y;
}

/* ---------- Asset-class growth model ---------- */
const CLASS_PRESETS = {
  bear: { Cash: 1.0, CPF: 3.0, Investments: 2.0, Property: 0.5, Crypto: -10.0, Other: 1.0, Liabilities: -3 },
  base: { Cash: 2.5, CPF: 3.2, Investments: 6.0, Property: 2.5, Crypto: 8.0, Other: 2.5, Liabilities: -3 },
  bull: { Cash: 3.0, CPF: 3.5, Investments: 9.0, Property: 4.5, Crypto: 20.0, Other: 4.0, Liabilities: -4 },
};
const CLASS_ORDER = ["Cash", "CPF", "Investments", "Property", "Crypto", "Other", "Liabilities"];
function classBalancesFrom(accounts) {
  const b = { Cash: 0, CPF: 0, Investments: 0, Property: 0, Crypto: 0, Other: 0, Liabilities: 0 };
  for (const a of accounts) {
    const v = toSGD(a);
    if (a.type === "liability") b.Liabilities += v;
    else b[Object.prototype.hasOwnProperty.call(b, a.group) ? a.group : "Other"] += v;
  }
  return b;
}
function projectByClass({ balances, rates, monthlyInvest, inflation, years }) {
  const cls = ["Cash", "CPF", "Investments", "Property", "Crypto", "Other"];
  const cur = { ...balances };
  let liab = balances.Liabilities || 0;
  const pts = [Math.round(cls.reduce((s, c) => s + cur[c], 0) - liab)];
  for (let y = 1; y <= years; y++) {
    for (const c of cls) cur[c] = cur[c] * (1 + ((rates[c] || 0) - inflation) / 100);
    cur.Investments += monthlyInvest * 12; // new savings assumed invested
    liab = Math.max(0, liab * (1 + ((rates.Liabilities || -3) - inflation) / 100)); // paydown + inflation erosion
    pts.push(Math.round(cls.reduce((s, c) => s + cur[c], 0) - liab));
  }
  return pts;
}
function projectWealthByClass(args) {
  const shift = (r, d) => { const o = { ...r }; for (const k of ["Investments", "Property", "Crypto"]) o[k] = (o[k] || 0) + d; return o; };
  return {
    low: projectByClass({ ...args, rates: shift(args.rates, -2) }),
    expected: projectByClass(args),
    high: projectByClass({ ...args, rates: shift(args.rates, 2) }),
  };
}
function amortSchedule(loan, ratePct, tenorYrs) {
  const r = ratePct / 100 / 12, n = Math.max(1, Math.round(tenorYrs * 12));
  const pay = r > 0 ? loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;
  const rows = []; let bal = loan;
  for (let y = 1; y <= tenorYrs && bal > 0.5; y++) {
    let int = 0, prin = 0;
    for (let m = 0; m < 12 && bal > 0.5; m++) { const i = bal * r; const pp = Math.min(pay - i, bal); int += i; prin += pp; bal -= pp; }
    rows.push({ y, pay: int + prin, int, prin, bal: Math.max(0, bal) });
  }
  return rows;
}
function parseRateStr(s) { if (s == null || s === "") return null; const n = parseFloat(String(s).replace(/[^0-9.\-]/g, "")); return isNaN(n) ? null : n; }
function projectByBuckets({ buckets, rates, monthlyInvest, inflation, years }) {
  let invPool = 0; const arr = buckets.map(b => ({ ...b }));
  const nw = () => arr.reduce((s, b) => s + (b.cls === "Liabilities" ? -b.v : b.v), 0) + invPool;
  const pts = [Math.round(nw())];
  for (let y = 1; y <= years; y++) {
    for (const b of arr) {
      const g = b.cls === "Liabilities" ? (rates.Liabilities ?? -3) : (b.own ?? (rates[b.cls] ?? 0));
      b.v = Math.max(0, b.v * (1 + (g - inflation) / 100));
    }
    invPool = invPool * (1 + ((rates.Investments ?? 5) - inflation) / 100) + monthlyInvest * 12;
    pts.push(Math.round(nw()));
  }
  return pts;
}
function projectWealthByBuckets(args) {
  const shift = (r, d) => { const o = { ...r }; for (const k of ["Investments", "Property", "Crypto"]) o[k] = (o[k] || 0) + d; return o; };
  const shiftB = (bs, d) => bs.map(b => (b.own != null && ["Investments", "Property", "Crypto"].includes(b.cls)) ? { ...b, own: b.own + d } : b);
  return {
    low: projectByBuckets({ ...args, rates: shift(args.rates, -2), buckets: shiftB(args.buckets, -2) }),
    expected: projectByBuckets(args),
    high: projectByBuckets({ ...args, rates: shift(args.rates, 2), buckets: shiftB(args.buckets, 2) }),
  };
}
function blendedReturnBuckets(buckets, rates) {
  let tot = 0, acc = 0;
  for (const b of buckets) { if (b.cls === "Liabilities" || b.v <= 0) continue; const g = b.own ?? (rates[b.cls] ?? 0); tot += b.v; acc += b.v * g; }
  return tot ? acc / tot : (rates.Investments || 5);
}
function blendedReturn(balances, rates) {
  const cls = ["Cash", "CPF", "Investments", "Property", "Crypto", "Other"];
  const tot = cls.reduce((s, c) => s + Math.max(0, balances[c] || 0), 0);
  if (!tot) return rates.Investments || 5;
  return cls.reduce((s, c) => s + Math.max(0, balances[c] || 0) * (rates[c] || 0), 0) / tot;
}

/* ---------- SG property investment engine ---------- */
const DEFAULT_PROP = { price: 1000000, downPct: 25, absdPct: 0, ratePct: 3.25, tenorYrs: 25, rental: false, rentYieldPct: 3.0, leaseYrs: 2, vacancyPct: 5, rentAgentPct: 4.17, rentTaxPct: 0, apprPct: 3.0, holdYrs: 10, maintMo: 300, propTaxPct: 0.5, legal: 3000, renoCost: 0, sellAgentPct: 2, sellLegal: 2000, newLaunch: false, topYrs: 3, sourceId: null };
function sgBSD(price) { // residential Buyer's Stamp Duty tiers
  const tiers = [[180000, 0.01], [180000, 0.02], [640000, 0.03], [500000, 0.04], [1500000, 0.05], [Infinity, 0.06]];
  let rem = price, bsd = 0;
  for (const [band, rate] of tiers) { const amt = Math.min(rem, band); bsd += amt * rate; rem -= amt; if (rem <= 0) break; }
  return Math.round(bsd);
}
function propertySim(p, altReturnPct) {
  const loan = p.price * (1 - p.downPct / 100);
  const r = p.ratePct / 100 / 12, n = p.tenorYrs * 12;
  const pay = r > 0 ? loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;
  const holdM = p.holdYrs * 12;
  const m = Math.min(holdM, n);
  const balance = r > 0 ? loan * (Math.pow(1 + r, n) - Math.pow(1 + r, m)) / (Math.pow(1 + r, n) - 1) : loan * (1 - m / n);
  const isRental = !!p.rental;
  const topM = p.newLaunch ? Math.round((p.topYrs ?? 3) * 12) : 0; // months to TOP (rent/holding costs start after)
  const rentedM = Math.max(0, p.holdYrs * 12 - topM);              // months actually available to rent
  const vacPct = p.vacancyPct ?? 5;                                // % of rented period untenanted (between leases)
  const rent = p.price * (p.rentYieldPct / 100) / 12;
  // ---- cost families ----
  const maint = p.maintMo ?? 300;                              // holding: MCST / maintenance
  const tax = p.price * ((p.propTaxPct ?? 0.5) / 100) / 12;    // holding: property tax
  const holdingCost = maint + tax;
  const leaseYrs = p.leaseYrs ?? 2;
  const leaseMult = leaseYrs >= 2 ? 1 : 0.5;                   // convention: 1mo rent (2yr lease), 0.5mo (1yr lease)
  const rentAgentPct = p.rentAgentPct ?? (leaseMult / (leaseYrs * 12) * 100); // commission as % of monthly rent, editable
  const effRent = isRental ? rent * (1 - vacPct / 100) : 0;    // rent net of vacancy
  const agentMo = isRental ? effRent * (rentAgentPct / 100) : 0;
  const rentTaxable = Math.max(0, effRent * 12 - holdingCost * 12 - agentMo * 12);
  const rentIncomeTax = isRental ? rentTaxable * ((p.rentTaxPct ?? 0) / 100) : 0; // optional income tax on net rent
  const rentalFeeMo = isRental ? agentMo + rentIncomeTax / 12 : 0;
  const bsd = sgBSD(p.price);
  const absd = p.price * (p.absdPct / 100);
  const cashIn = p.price * (p.downPct / 100) + bsd + absd + (p.legal ?? 3000) + (p.renoCost ?? 0);
  // cumulative cashflow across the hold, honouring the TOP gate for new launches
  const grossRentMo = effRent;
  let cumCashflow = 0;
  for (let mm = 0; mm < holdM; mm++) {
    const beforeTop = mm < topM;
    if (beforeTop) cumCashflow += -(pay * 0.5);               // BUC: progressive, no rent/MCST yet
    else cumCashflow += grossRentMo - holdingCost - rentalFeeMo - pay;
  }
  const steadyCf = grossRentMo - holdingCost - rentalFeeMo - pay;
  const exitValue = p.price * Math.pow(1 + p.apprPct / 100, p.holdYrs);
  const ssdRate = p.holdYrs < 1 ? 0.12 : p.holdYrs < 2 ? 0.08 : p.holdYrs < 3 ? 0.04 : 0;
  const ssdAmt = exitValue * ssdRate;
  const sellCosts = exitValue * ((p.sellAgentPct ?? 2) / 100) + (p.sellLegal ?? 2000) + ssdAmt;
  const equityAtExit = exitValue - balance - sellCosts;
  const netProfit = (equityAtExit - cashIn) + cumCashflow;
  const endCapital = cashIn + netProfit;
  const cagr = cashIn > 0 && endCapital > 0 ? (Math.pow(endCapital / cashIn, 1 / p.holdYrs) - 1) * 100 : null;
  const altEnd = cashIn * Math.pow(1 + altReturnPct / 100, p.holdYrs);
  return { pay, cashflow: steadyCf, grossRentMo, holdingCost, rentalFeeMo, rentIncomeTax, monthlyCosts: holdingCost + rentalFeeMo, vacPct, agentMo, rentAgentPct, effRent, bsd, absd, cashIn, exitValue, balance, equityAtExit, cumCashflow, netProfit, endCapital, cagr, altEnd, altProfit: altEnd - cashIn, ssdAmt, ssdRate, sellCosts, isRental, topM };
}


const Ico = ({ as: C, size = 16, color = "rgba(20,38,61,.65)", style }) => (C ? <C size={size} color={color} strokeWidth={2} style={style} /> : null);
const G = (name) => ICON_MAP[name] || Receipt;

function Seg({ items, value, onChange, small, scroll }) {
  return (
    <div style={{ display: "flex", gap: 4, background: "rgba(20,38,61,.06)", borderRadius: 999, padding: 3, width: "100%", ...(scroll ? { overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" } : {}) }}>
      {items.map((k) => { const on = k === value; return (
        <button key={k} onClick={() => onChange(k)} style={{ flex: scroll ? "0 0 auto" : 1, border: "none", cursor: "pointer", padding: scroll ? "6px 14px" : small ? "6px 10px" : "7px 0", borderRadius: 999, fontSize: small || scroll ? 11.5 : 12, fontWeight: 600, fontFamily: F_UI, background: on ? "#fff" : "transparent", color: on ? INK : "rgba(20,38,61,.5)", boxShadow: on ? "0 2px 6px rgba(23,42,72,.18)" : "none", transition: "background .2s", whiteSpace: "nowrap" }}>{k}</button>
      ); })}
    </div>
  );
}
function Chips({ items, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((k) => { const on = k === value; return (
        <button key={k} onClick={() => onChange(k)} style={{ border: `1px solid ${on ? INK : "rgba(255,255,255,.8)"}`, borderRadius: 999, background: on ? INK : "rgba(255,255,255,.55)", color: on ? "#fff" : "rgba(20,38,61,.65)", fontFamily: F_UI, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: "7px 13px", whiteSpace: "nowrap" }}>{k}</button>
      ); })}
    </div>
  );
}
function Tip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", verticalAlign: "middle" }}>
      <button onClick={() => setShow(v => !v)} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
        style={{ width: 15, height: 15, borderRadius: 8, border: "none", background: "rgba(20,38,61,.16)", color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", lineHeight: 1, padding: 0, marginLeft: 5, flexShrink: 0 }}>i</button>
      {show && <span style={{ position: "absolute", bottom: "130%", left: "50%", transform: "translateX(-50%)", width: 180, background: "rgba(20,38,61,.96)", color: "#fff", fontFamily: F_UI, fontSize: 10.5, fontWeight: 400, lineHeight: 1.45, borderRadius: 9, padding: "8px 10px", zIndex: 40, boxShadow: "0 8px 20px -6px rgba(0,0,0,.4)", pointerEvents: "none" }}>{text}</span>}
    </span>
  );
}
function Toggle({ on, onClick }) {
  return <button onClick={onClick} style={{ width: 46, height: 28, borderRadius: 14, border: "none", cursor: "pointer", background: on ? ACCENT : "rgba(20,38,61,.18)", position: "relative", transition: "background .2s", flexShrink: 0 }}><span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: 11, background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,.2)", transition: "left .2s" }} /></button>;
}
function IconBtn({ as, onClick, color = "rgba(20,38,61,.65)", size = 40 }) {
  return <button onClick={onClick} style={{ width: size, height: size, borderRadius: size / 2, border: "1px solid rgba(255,255,255,.7)", background: "rgba(255,255,255,.5)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color, boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)", flexShrink: 0 }}><Ico as={as} size={16} color={color} /></button>;
}
const field = { width: "100%", background: "rgba(255,255,255,.6)", border: "1px solid rgba(20,38,61,.12)", borderRadius: 12, color: INK, padding: "10px 12px", fontSize: 14, fontFamily: F_UI, outline: "none", boxSizing: "border-box" };
const fieldLabel = { ...eyebrow, fontSize: 10.5, marginBottom: 5, display: "block" };

function AreaChart({ data }) {
  const line = buildPath(data, 330, 112, 10, false), area = buildPath(data, 330, 112, 10, true);
  return (
    <svg width="100%" height="112" viewBox="0 0 330 112" preserveAspectRatio="none" style={{ display: "block", marginTop: 10 }}>
      <defs><linearGradient id="lgArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ACCENT} stopOpacity=".28" /><stop offset="1" stopColor={ACCENT} stopOpacity="0" /></linearGradient></defs>
      <path d={area.d} fill="url(#lgArea)" /><path d={line.d} fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={line.last[0]} cy={line.last[1]} r="4.5" fill={ACCENT} stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

/* share card → png (unchanged core) */
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function drawShareCard(canvas, { title, value, sub, series, footer }) {
  const W = 1080, H = 1080, ctx = canvas.getContext("2d"); canvas.width = W; canvas.height = H;
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#1B3A54"); g.addColorStop(.55, "#25546E"); g.addColorStop(1, "#3A7A88"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(W * .8, 120, 20, W * .8, 120, 620); rg.addColorStop(0, "rgba(138,127,212,.38)"); rg.addColorStop(1, "rgba(138,127,212,0)"); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.font = "600 30px 'JetBrains Mono',monospace"; ctx.fillText(title.toUpperCase(), 88, 150);
  const lx = W - 88 - 150, lg = ctx.createLinearGradient(lx, 110, lx + 44, 154); lg.addColorStop(0, "#5DC4CB"); lg.addColorStop(1, "#8A7FD4"); ctx.fillStyle = lg; roundRect(ctx, lx, 112, 44, 44, 12); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = "700 26px 'JetBrains Mono',monospace"; ctx.textAlign = "center"; ctx.fillText("L", lx + 22, 143); ctx.textAlign = "left"; ctx.font = "700 30px 'Schibsted Grotesk',sans-serif"; ctx.fillText("Lume", lx + 58, 143);
  ctx.fillStyle = "#fff"; ctx.font = "700 92px 'JetBrains Mono',monospace"; ctx.fillText(value, 88, 300);
  ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = "400 30px 'Schibsted Grotesk',sans-serif"; ctx.fillText(sub, 88, 356);
  const cw = W - 176, ch = 360, cx0 = 88, cy0 = 470, min = Math.min(...series), max = Math.max(...series), span = (max - min) || 1;
  const pts = series.map((v, i) => [cx0 + (i / (series.length - 1)) * cw, cy0 + ch - ((v - min) / span) * ch]);
  const grad = ctx.createLinearGradient(0, cy0, 0, cy0 + ch); grad.addColorStop(0, "rgba(143,224,222,.35)"); grad.addColorStop(1, "rgba(143,224,222,0)");
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const [x, y] = pts[i], [px, py] = pts[i - 1], mx = (px + x) / 2; ctx.bezierCurveTo(mx, py, mx, y, x, y); } ctx.lineTo(pts[pts.length - 1][0], cy0 + ch); ctx.lineTo(pts[0][0], cy0 + ch); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const [x, y] = pts[i], [px, py] = pts[i - 1], mx = (px + x) / 2; ctx.bezierCurveTo(mx, py, mx, y, x, y); } ctx.strokeStyle = "#8FE0DE"; ctx.lineWidth = 6; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.stroke();
  const last = pts[pts.length - 1]; ctx.fillStyle = "#8FE0DE"; ctx.beginPath(); ctx.arc(last[0], last[1], 11, 0, 7); ctx.fill(); ctx.fillStyle = "#1B3A54"; ctx.beginPath(); ctx.arc(last[0], last[1], 5, 0, 7); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.14)"; ctx.beginPath(); ctx.moveTo(88, H - 118); ctx.lineTo(W - 88, H - 118); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.font = "400 26px 'Schibsted Grotesk',sans-serif"; ctx.fillText(footer || "Tracked in Lume", 88, H - 74);
}

/* ============================ MAIN ============================ */
export default function LumeTracker() {
  const [data, setData] = useState(null);
  const [screen, setScreen] = useState("signin");
  const [sheet, setSheet] = useState(null); // share | add | account
  const [privacy, setPrivacy] = useState(false);
  const [tf, setTf] = useState("6M");
  const [shareTf, setShareTf] = useState("6M");
  const [shareChart, setShareChart] = useState("nw");
  const [shareBlur, setShareBlur] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hhView, setHhView] = useState("household");
  const [wealthOwner, setWealthOwner] = useState("All");
  const [sec, setSec] = useState({ faceId: true, appLock: true, privLaunch: false, hideSwitcher: true });
  const [editExpense, setEditExpense] = useState(null); // expense object or "new"
  const [editAccount, setEditAccount] = useState(null); // account object or "new"
  const [editMember, setEditMember] = useState(null);   // member object or "new"
  const [paywallFeature, setPaywallFeature] = useState("");
  const [backups, setBackups] = useState([]);
  const [planOwner, setPlanOwner] = useState("Combined");
  const [showPropCosts, setShowPropCosts] = useState(false);
  const [openOvClass, setOpenOvClass] = useState(null);
  const [showAmort, setShowAmort] = useState(false);
  const [projHover, setProjHover] = useState(null);
  const shareCanvas = useRef(null);

  /* ---- load / persist (shared storage) ---- */
  useEffect(() => {
    const l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
    document.head.appendChild(l);
    (async () => {
      try { const r = await store.get("lume-data-v1", true); if (r && r.value) { setData(migrate(JSON.parse(r.value))); return; } } catch (e) {}
      setData(SEED);
      try { await store.set("lume-data-v1", JSON.stringify(SEED), true); } catch (e) {}
    })();
    return () => { try { document.head.removeChild(l); } catch (e) {} };
  }, []);
  useEffect(() => { const t = setTimeout(() => { try { store.list(BAK_PREFIX, true).then(r => setBackups((r?.keys || []).sort().reverse().slice(0, 8))); } catch (e) {} }, 400); return () => clearTimeout(t); }, []);

  const pruneBackups = async () => { try { const r = await store.list(BAK_PREFIX, true); const keys = (r?.keys || []).sort().reverse(); for (const k of keys.slice(8)) await store.delete(k, true); } catch (e) {} };
  const persist = async (next) => {
    setData(next);
    try {
      await store.set("lume-data-v1", JSON.stringify(next), true);
      // rolling automatic backup: one snapshot per day, keep the last 8 backups
      await store.set(BAK_PREFIX + "auto-" + new Date().toISOString().slice(0, 10), JSON.stringify(next), true);
      pruneBackups();
    } catch (e) {}
  };
  const writeBackup = async (tag, downloadToo) => {
    const key = BAK_PREFIX + tag + "-" + new Date().toISOString().slice(0, 16).replace(/[:T]/g, "");
    try { await store.set(key, JSON.stringify(data), true); await pruneBackups(); } catch (e) {}
    if (downloadToo) downloadBlob(JSON.stringify(data, null, 2), "application/json", key + ".json");
    refreshBackups();
  };
  const refreshBackups = async () => { try { const r = await store.list(BAK_PREFIX, true); setBackups((r?.keys || []).sort().reverse().slice(0, 8)); } catch (e) {} };
  const restoreBackup = async (key) => {
    try { const r = await store.get(key, true); if (r?.value && confirm("Restore this backup? Current data will be replaced.")) persist(migrate(JSON.parse(r.value))); } catch (e) {}
  };

  const isPremium = !!(data && data.premium);
  const openPaywall = (f) => { setPaywallFeature(f); setSheet("paywall"); };
  const upgrade = () => { persist({ ...data, premium: true }); setSheet(null); };
  const downgrade = () => { persist({ ...data, premium: false }); };
  const mask = (t) => (privacy ? "S$ ••••••" : t);
  const openShare = () => { setShareChart(screen === "expenses" ? "spend" : "nw"); setSaved(false); setSheet("share"); };

  if (!data) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#141A24", color: "rgba(255,255,255,.5)", fontFamily: F_MONO }}>loading…</div>;

  /* ---- derived ---- */
  const assetsTotal = data.accounts.filter(a => a.type === "asset").reduce((s, a) => s + toSGD(a), 0);
  const balSum = assetsTotal + data.accounts.filter(a => a.type === "liability").reduce((s, a) => s + toSGD(a), 0) || 1;
  const liabsTotal = data.accounts.filter(a => a.type === "liability").reduce((s, a) => s + toSGD(a), 0);
  const NW = assetsTotal - liabsTotal;
  const groupTotal = (g) => data.accounts.filter(a => a.group === g && a.type === "asset").reduce((s, a) => s + toSGD(a), 0);

  const assetGroups = [...GROUP_ORDER.filter(g => data.accounts.some(a => a.group === g && a.type === "asset")),
    ...[...new Set(data.accounts.filter(a => a.type === "asset" && !GROUP_ORDER.includes(a.group)).map(a => a.group))]];
  const liabAccounts = data.accounts.filter(a => a.type === "liability");

  const alloc = assetGroups.map(g => ({ label: g, v: groupTotal(g), color: (GROUP_META[g]?.color) || "#94A7BE" }));

  const ownerNet = (who) => data.accounts.reduce((s, a) => {
    const v = toSGD(a) * (a.type === "liability" ? -1 : 1);
    if (a.owner === who) return s + v;
    if (a.owner === JOINT) return s + v / 2;
    return s;
  }, 0);

  /* ---- members & permissions ---- */
  const members = data.members || [];
  const me = members.find(m => m.id === data.currentUserId) || members[0];
  const memberByName = (n) => members.find(m => m.name === n);
  const ownerNames = [...members.map(m => m.name), JOINT];
  const hiddenForMe = (data.hidden && data.hidden[me?.id]) || [];
  // Household label derived from members' surnames (falls back gracefully when cleared)
  const householdName = (() => {
    if (data.demo) return "Demo household";
    const surnames = [...new Set(members.map(m => (m.fullName || "").trim().split(/\s+/).slice(1).join(" ")).filter(Boolean))];
    if (surnames.length === 1) return surnames[0] + " household";
    if (members.length === 1) return (members[0].fullName || members[0].name) + "'s household";
    return "Our household";
  })();
  const householdSlug = householdName.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "") || "Household";
  const grantsFor = (ownerId) => (data.grants && data.grants[ownerId]) || [];
  const canEditAccount = (a) => {
    if (!me) return false;
    if (a.owner === me.name) return true;          // your own data
    if (a.owner === JOINT) return true;            // joint = shared edit
    const ownerM = memberByName(a.owner);
    if (ownerM && grantsFor(ownerM.id).includes(me.id)) return true; // granted access
    return false;
  };
  const IVAN = ownerNet("Ivan"), PHOEBE = ownerNet("Phoebe");

  const outflows = data.expenses.filter(e => e.dir === "out");
  const inflows = data.expenses.filter(e => e.dir === "in");
  const monthSpend = outflows.reduce((s, e) => s + expSGD(e), 0);
  const monthIn = inflows.reduce((s, e) => s + expSGD(e), 0);
  const budgetLeft = data.budget - monthSpend;
  const budgetPct = Math.min(100, (monthSpend / data.budget) * 100);

  const catAgg = {};
  outflows.forEach(e => { const c = data.categories.find(x => x.name === e.category); catAgg[e.category] = catAgg[e.category] || { name: e.category, v: 0, color: c?.color || "#94A7BE" }; catAgg[e.category].v += expSGD(e); });
  const catRows = Object.values(catAgg).sort((a, b) => b.v - a.v);
  const catMax = catRows[0]?.v || 1;

  const heroSeries = (() => {
    const last = Math.round(NW / 1000);
    if (data.demo) { const arr = [...TRENDS[tf]]; const scale = arr[arr.length - 1] ? last / arr[arr.length - 1] : 0; return arr.map(v => Math.max(0, Math.round(v * scale))); }
    if (last <= 0) return [0, 0, 0, 0, 0, 0];
    const n = TRENDS[tf].length; // no real history yet: gentle flat-ish line at current NW
    return Array.from({ length: n }, (_, i) => Math.round(last * (0.97 + 0.03 * i / (n - 1))));
  })();

  const shareTitles = { nw: "Net worth · " + shareTf, spend: "Spending · last 6 months", alloc: "Asset allocation" };
  const topAllocPct = alloc.length ? Math.round(alloc[0].v / assetsTotal * 100) : 0;
  const shareVals = { nw: fmt(NW), spend: fmt(monthSpend) + " / mo", alloc: fmt(assetsTotal) };
  const shareSubs = { nw: (data.demo ? "Demo household net worth" : householdName + " net worth"), spend: (catRows[0]?.name || "—") + " is the top category", alloc: alloc.slice(0, 4).map(a => Math.round(a.v / assetsTotal * 100) + "% " + a.label.toLowerCase()).join(" · ") };
  const shareBlurVals = { nw: "+12.4% YTD", spend: "−2% vs May", alloc: alloc.length + " asset classes" };
  const spendSeries = data.demo ? SPEND_TREND : (monthSpend > 0 ? Array.from({ length: 6 }, (_, i) => +((monthSpend / 1000) * (0.97 + 0.03 * i / 5)).toFixed(1)) : [0, 0, 0, 0, 0, 0]);
  const shareData = shareChart === "spend" ? spendSeries : heroSeries;
  const shareP = buildPath(shareData, 330, 76, 8, false);

  const saveShareImage = () => {
    if (shareCanvas.current) {
      drawShareCard(shareCanvas.current, { title: shareTitles[shareChart], value: shareBlur ? shareBlurVals[shareChart] : shareVals[shareChart], sub: shareBlur ? "Amounts hidden · percentages only" : shareSubs[shareChart], series: shareData, footer: householdName + " · tracked in Lume" });
      const a = document.createElement("a"); a.href = shareCanvas.current.toDataURL("image/png"); a.download = `lume-${shareChart}-${shareTf}.png`; a.click();
    }
    setSaved(true);
  };

  /* ---- mutations ---- */
  const saveExpenseRecord = (rec) => {
    const list = data.expenses.some(e => e.id === rec.id) ? data.expenses.map(e => e.id === rec.id ? rec : e) : [rec, ...data.expenses];
    persist({ ...data, expenses: list }); setEditExpense(null); setSheet(null); setScreen("expenses");
  };
  const deleteExpense = (id) => { persist({ ...data, expenses: data.expenses.filter(e => e.id !== id) }); setEditExpense(null); setSheet(null); };
  const addCategory = (name, color, kind) => { if (!name || data.categories.some(c => c.name === name)) return; persist({ ...data, categories: [...data.categories, { name, color, kind: kind || "out" }] }); };

  const saveAccountRecord = (rec) => {
    let list;
    if (data.accounts.some(a => a.id === rec.id)) {
      list = data.accounts.map(a => {
        if (a.id !== rec.id) return a;
        const hist = [...(a.history || [])];
        if (a.balance !== rec.balance) { const last = hist[hist.length - 1]; if (last && last.date === "2026-06") hist[hist.length - 1] = { date: "2026-06", balance: rec.balance }; else hist.push({ date: "2026-06", balance: rec.balance }); }
        return { ...rec, history: hist };
      });
    } else {
      list = [{ ...rec, history: [{ date: "2026-06", balance: rec.balance }] }, ...data.accounts];
    }
    // Property with a recorded loan: create/update an auto-linked mortgage liability
    if (rec.group === "Property" && rec.type === "asset") {
      const loanId = rec.id + "-loan";
      const loanAmt = parseFloat(rec.loanAmount) || 0;
      const existing = list.find(a => a.id === loanId);
      if (loanAmt > 0) {
        const loanRec = {
          id: loanId, type: "liability", group: "Liabilities",
          name: rec.name + " mortgage", sub: "Auto-linked to " + rec.name,
          balance: loanAmt, currency: rec.currency, owner: rec.owner,
          rate: rec.loanRatePct ? rec.loanRatePct + "%" : "", notes: "", badge: "", holdingType: "",
          purchasePrice: "", loanAmount: "", loanTenorYrs: "", loanRatePct: "",
          linkedTo: rec.id,
          history: existing ? (() => { const h = [...(existing.history || [])]; const last = h[h.length - 1]; if (last && last.date === "2026-06") h[h.length - 1] = { date: "2026-06", balance: loanAmt }; else h.push({ date: "2026-06", balance: loanAmt }); return h; })() : [{ date: "2026-06", balance: loanAmt }],
        };
        list = existing ? list.map(a => a.id === loanId ? loanRec : a) : [...list, loanRec];
      } else if (existing) {
        list = list.filter(a => a.id !== loanId); // loan cleared -> remove linked liability
      }
    }
    persist({ ...data, accounts: list }); setEditAccount(null); setSheet(null);
  };
  const deleteAccount = (id) => { persist({ ...data, accounts: data.accounts.filter(a => a.id !== id && a.linkedTo !== id) }); setEditAccount(null); setSheet(null); };

  const saveMember = (rec) => {
    const exists = members.some(m => m.id === rec.id);
    if (!exists && members.length >= 2 && !isPremium) { setEditMember(null); setSheet(null); openPaywall("Unlimited household members"); return; }
    const list = exists ? members.map(m => m.id === rec.id ? { ...m, ...rec } : m) : [...members, rec];
    persist({ ...data, members: list }); setEditMember(null); setSheet(null);
  };
  const removeMemberFromView = (id) => {
    const cur = { ...(data.hidden || {}) }; cur[me.id] = [...new Set([...(cur[me.id] || []), id])];
    persist({ ...data, hidden: cur }); setEditMember(null); setSheet(null);
  };
  const unhideMember = (id) => {
    const cur = { ...(data.hidden || {}) }; cur[me.id] = (cur[me.id] || []).filter(x => x !== id);
    persist({ ...data, hidden: cur });
  };
  const deleteMemberFully = (id) => { // only for a member you own (yourself) — removes member + their accounts
    persist({ ...data, members: members.filter(m => m.id !== id), accounts: data.accounts.filter(a => memberByName(a.owner)?.id !== id) });
    setEditMember(null); setSheet(null);
  };
  const toggleGrant = (ownerId, granteeId) => {
    const g = { ...(data.grants || {}) }; const arr = new Set(g[ownerId] || []);
    arr.has(granteeId) ? arr.delete(granteeId) : arr.add(granteeId); g[ownerId] = [...arr];
    persist({ ...data, grants: g });
  };
  const setActingUser = (id) => persist({ ...data, currentUserId: id });
  const setPlanning = (patch) => persist({ ...data, planning: { ...data.planning, ...patch } });
  const PS = data.propertySim || DEFAULT_PROP;
  const setPropertySim = (patch) => persist({ ...data, propertySim: { ...PS, ...patch } });
  const CP = data.cpfPlan || { monthlyContrib: 3700 };
  const setCpfPlan = (patch) => persist({ ...data, cpfPlan: { ...CP, ...patch } });
  const setScenarioB = (v) => persist({ ...data, scenarioB: v });
  const L = data.legacy || SEED.legacy;
  const setLegacy = (patch) => persist({ ...data, legacy: { ...L, ...patch } });
  const toggleCheck = (memberId, key) => {
    const cl = { ...(L.checklist || {}) };
    cl[memberId] = { ...(cl[memberId] || {}), [key]: !(cl[memberId] || {})[key] };
    setLegacy({ checklist: cl });
  };
  const saveDoc = (doc) => {
    const docs = L.docs.some(d => d.id === doc.id) ? L.docs.map(d => d.id === doc.id ? doc : d) : [...L.docs, doc];
    setLegacy({ docs });
  };
  const removeDoc = (id) => setLegacy({ docs: L.docs.filter(d => d.id !== id) });

  /* ---- shared chrome ---- */
  const scrollScreen = { position: "relative", height: "100%", overflowY: "auto", padding: "76px 18px 140px", animation: "rise .35s ease-out" };
  const demoPill = { ...mono(9, 700), letterSpacing: ".08em", padding: "3px 8px", borderRadius: 999, background: "rgba(217,164,65,.2)", color: "#A06E15", flexShrink: 0 };
  const Avatar = () => (
    <button onClick={() => setScreen("settings")} style={{ width: 40, height: 40, borderRadius: 20, border: "1px solid rgba(255,255,255,.7)", background: me?.gradient || GRADIENTS._palette[0], cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: "inset 0 1px 0 rgba(255,255,255,.5)", flexShrink: 0 }}>{me?.initials || "?"}</button>
  );
  const Header = ({ over, title, onShare, back }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {back && <IconBtn as={ChevronLeft} onClick={() => setScreen("home")} />}
        <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, color: "rgba(20,38,61,.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{over}</div><div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.01em", display: "flex", alignItems: "center", gap: 8 }}>{title}{data.demo && <span style={demoPill}>DEMO</span>}</div></div>
      </div>
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        {onShare && <IconBtn as={Share2} onClick={onShare} />}
        <Avatar />
      </div>
    </div>
  );

  /* ============================ SCREENS ============================ */
  const SignIn = () => (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", padding: "56px 24px 32px", overflowY: "auto", animation: "fadein .4s" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginTop: 24 }}>
        <div style={{ width: 74, height: 74, borderRadius: 24, ...glass(24, 24), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 36px -16px rgba(23,42,72,.35), inset 0 1px 0 rgba(255,255,255,.85)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: "linear-gradient(135deg,#5DC4CB,#8A7FD4)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.6)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontWeight: 700, fontSize: 20, color: "#fff" }}>L</span></div>
        </div>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-.02em" }}>Lume</div><div style={{ fontSize: 15, color: "rgba(20,38,61,.6)", marginTop: 6, lineHeight: 1.5, maxWidth: 270 }}>See your whole financial picture — cash, CPF, property and spending — in one calm place.</div></div>
      </div>
      <div style={{ marginTop: "auto", paddingTop: 28, display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
        <button onClick={() => setScreen("home")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 52, border: "none", borderRadius: 26, background: INK, color: "#fff", fontFamily: F_UI, fontSize: 15.5, fontWeight: 600, cursor: "pointer", boxShadow: "0 14px 26px -12px rgba(20,38,61,.5)" }}>
          <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#fff" d="M21.35 11.1H12v3.7h5.4c-.5 2.4-2.6 3.9-5.4 3.9a6.7 6.7 0 1 1 0-13.4c1.7 0 3.2.6 4.3 1.7l2.7-2.7A10.4 10.4 0 1 0 12 22.4c6 0 10-4.2 10-10.1 0-.4 0-.8-.1-1.2Z" /></svg>Continue with Google
        </button>
        <button onClick={() => setScreen("home")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 52, border: "none", borderRadius: 26, background: "#000", color: "#fff", fontFamily: F_UI, fontSize: 15.5, fontWeight: 600, cursor: "pointer", boxShadow: "0 14px 26px -12px rgba(0,0,0,.5)" }}>
          <svg width="16" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.05 12.04c-.03-2.6 2.13-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.9-1.74.03-3.35 1.01-4.25 2.57-1.81 3.15-.46 7.82 1.3 10.38.86 1.25 1.89 2.66 3.23 2.61 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.02 2.29-1.28 3.15-2.54.99-1.46 1.4-2.87 1.42-2.94-.03-.01-2.72-1.05-2.75-4.15M14.53 4.4c.72-.87 1.2-2.08 1.07-3.28-1.03.04-2.28.69-3.02 1.55-.66.77-1.24 2-1.08 3.18 1.15.09 2.33-.59 3.03-1.45"/></svg> Continue with Apple
        </button>
        <button onClick={() => setScreen("home")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 52, ...glass(26, 20, 0.55), color: INK, fontFamily: F_UI, fontSize: 15.5, fontWeight: 600, cursor: "pointer" }}>
          <Ico as={Mail} size={17} color="rgba(20,38,61,.7)" /> Continue with email
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 8, color: "rgba(20,38,61,.5)", fontSize: 11.5 }}><Ico as={Lock} size={13} color="rgba(20,38,61,.5)" /> Manual entry only — Lume never links to your bank.</div>
      </div>
    </div>
  );

  const homeChips = [
    { label: "CPF total", icon: Landmark, color: "#3D5A9E", value: mask(fmt(groupTotal("CPF"))), sub: "OA · SA · MA", subColor: "rgba(20,38,61,.45)", go: () => setScreen("wealth") },
    { label: "Investments", icon: TrendingUp, color: "#4FA37E", value: mask(fmt(groupTotal("Investments"))), sub: "+2.1% this month", subColor: POS, go: () => setScreen("wealth") },
    { label: "Property", icon: Home, color: "#D9A554", value: mask(fmt(groupTotal("Property"))), sub: data.accounts.filter(a => a.group === "Property" && a.type === "asset").length + " properties · est. value", subColor: "rgba(20,38,61,.45)", go: () => setScreen("wealth") },
    { label: "June spend", icon: Receipt, color: "#C87F91", value: mask(fmt(monthSpend)), sub: Math.round(budgetPct) + "% of budget", subColor: "rgba(20,38,61,.45)", go: () => setScreen("expenses") },
  ];
  const HomeScreen = () => (
    <div style={scrollScreen}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div><div style={{ fontSize: 12.5, color: "rgba(20,38,61,.55)" }}>Good morning, {me?.name}</div><div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.01em", display: "flex", alignItems: "center", gap: 8 }}>Your net worth{data.demo && <span style={demoPill}>DEMO</span>}</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <IconBtn as={privacy ? EyeOff : Eye} onClick={() => setPrivacy(!privacy)} />
          <button onClick={() => setScreen("settings")} style={{ width: 40, height: 40, borderRadius: 20, border: "1px solid rgba(255,255,255,.7)", background: me?.gradient || "linear-gradient(135deg,#F0C98F,#D98E6B)", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: "inset 0 1px 0 rgba(255,255,255,.5)" }}>{me?.initials || "?"}</button>
        </div>
      </div>
      <div style={{ ...heroGlass, padding: "20px 20px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={eyebrow}>Household · SGD</div>
            <div style={{ ...mono(34), letterSpacing: "-.02em", marginTop: 4 }}>{mask(fmt(NW))}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>{data.demo ? (<><span style={{ ...mono(12.5, 600), color: POS, background: "rgba(21,138,98,.12)", borderRadius: 999, padding: "3px 9px" }}>{privacy ? "+ ••• ▲" : "+S$4,100 · 0.9%"}</span><span style={{ fontSize: 11.5, color: "rgba(20,38,61,.45)" }}>this month · sample</span></>) : (<span style={{ fontSize: 11.5, color: "rgba(20,38,61,.45)" }}>across {data.accounts.length} account{data.accounts.length === 1 ? "" : "s"}</span>)}</div>
          </div>
          <IconBtn as={Share2} onClick={openShare} size={38} />
        </div>
        <AreaChart data={heroSeries} />
        <div style={{ marginTop: 8 }}><Seg items={["1M", "6M", "1Y", "All"]} value={tf} onChange={setTf} /></div>
      </div>
      <div style={{ ...glass(24), padding: "17px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 11 }}><span style={eyebrow}>Assets vs liabilities</span><span style={{ ...mono(11, 400), color: "rgba(20,38,61,.45)" }}>debt ratio {assetsTotal > 0 ? Math.round(liabsTotal / assetsTotal * 100) : 0}%</span></div>
        <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", gap: 2 }}>
          <div style={{ width: (assetsTotal / balSum * 100).toFixed(1) + "%", background: "linear-gradient(90deg,#2E93A6,#5DC4CB)", borderRadius: 6 }} />
          <div style={{ width: (liabsTotal / balSum * 100).toFixed(1) + "%", background: "linear-gradient(90deg,#D9A554,#C87F4E)", borderRadius: 6 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: "#2E93A6" }} /><span style={{ fontSize: 12, color: "rgba(20,38,61,.6)" }}>Assets</span><span style={mono(12, 600)}>{mask(fmt(assetsTotal))}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: "#D9A554" }} /><span style={{ fontSize: 12, color: "rgba(20,38,61,.6)" }}>Liabilities</span><span style={mono(12, 600)}>{mask(fmt(liabsTotal))}</span></div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        {homeChips.map((c) => (
          <button key={c.label} onClick={c.go} style={{ textAlign: "left", ...glass(22, 20, 0.45), padding: "14px 15px", cursor: "pointer", fontFamily: F_UI }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}><Ico as={c.icon} size={14} color={c.color} /><span style={{ fontSize: 12, fontWeight: 600, color: "rgba(20,38,61,.6)" }}>{c.label}</span></div>
            <div style={{ ...mono(16.5), color: INK }}>{c.value}</div><div style={{ fontSize: 11, color: c.subColor, marginTop: 3 }}>{c.sub}</div>
          </button>
        ))}
      </div>
      <div style={{ ...glass(24), padding: "17px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}><span style={eyebrow}>June cashflow</span><button onClick={() => setScreen("expenses")} style={{ border: "none", background: "none", fontFamily: F_UI, fontSize: 12, fontWeight: 600, color: ACCENT, cursor: "pointer", padding: 0 }}>See expenses →</button></div>
        <div style={{ display: "flex", gap: 14 }}>
          {[["Money in", mask(fmt(monthIn)), POS], ["Money out", mask(fmt(monthSpend)), NEG], ["Saved", mask(fmt(monthIn - monthSpend)), INK]].map(([l, v, col], i) => (
            <div key={l} style={{ flex: 1, borderLeft: i ? "1px solid rgba(20,38,61,.1)" : "none", paddingLeft: i ? 14 : 0 }}><div style={{ fontSize: 11.5, color: "rgba(20,38,61,.5)" }}>{l}</div><div style={{ ...mono(15), color: col, marginTop: 2 }}>{v}</div></div>
          ))}
        </div>
      </div>
    </div>
  );

  const ExpensesScreen = () => (
    <div style={scrollScreen}>
      <Header over="June 2026" title="Expenses" onShare={openShare} />
      <div style={{ ...heroGlass, borderRadius: 26, padding: "19px 19px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div><div style={eyebrow}>Spent so far</div><div style={{ ...mono(28), marginTop: 3 }}>{mask(fmt(monthSpend))}</div></div>
          <div style={{ textAlign: "right" }}><button onClick={() => { const v = prompt("Monthly budget (S$)", data.budget); const n = parseFloat(v); if (!isNaN(n) && n > 0) persist({ ...data, budget: n }); }} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: F_UI, fontSize: 11, color: ACCENT, fontWeight: 600 }}>Budget {fmt(data.budget)} ✎</button><div style={{ ...mono(13, 600), color: budgetLeft >= 0 ? POS : NEG, marginTop: 2 }}>{privacy ? "••••" : (budgetLeft >= 0 ? fmt(budgetLeft) + " left" : fmt(-budgetLeft) + " over")}</div></div>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: "rgba(20,38,61,.08)", marginTop: 12, overflow: "hidden" }}><div style={{ height: "100%", width: budgetPct + "%", borderRadius: 5, background: `linear-gradient(90deg,#2E93A6,${ACCENT})`, transition: "width .4s" }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}><span style={{ fontSize: 11, color: "rgba(20,38,61,.45)" }}>{Math.round(budgetPct)}% of budget</span><span style={{ fontSize: 11, color: "rgba(20,38,61,.45)" }}>{outflows.length} expenses</span></div>
      </div>
      <div style={{ ...glass(24), padding: "17px 18px", marginBottom: 14 }}>
        <div style={{ ...eyebrow, marginBottom: 13 }}>By category</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {catRows.map((c) => (
            <div key={c.name}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Ico as={G(CAT_ICON[c.name] || "Receipt")} size={14} color={c.color} /><span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span></div>
                <span style={mono(12.5, 600)}>{privacy ? "••••" : fmt(c.v)}</span>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: "rgba(20,38,61,.07)", overflow: "hidden" }}><div style={{ height: "100%", width: (c.v / catMax * 100).toFixed(0) + "%", borderRadius: 4, background: c.color }} /></div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ ...glass(24), padding: "8px 6px" }}>
        <div style={{ ...eyebrow, padding: "11px 13px 5px" }}>Recent · tap to edit</div>
        {data.expenses.map((t) => {
          const c = data.categories.find(x => x.name === t.category); const color = c?.color || "#94A7BE";
          const nd = t.recurring ? nextDue(t.date, t.recurring) : null;
          return (
            <button key={t.id} onClick={() => { setEditExpense(t); setSheet("add"); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 13px", borderRadius: 16, border: "none", background: "none", width: "100%", cursor: "pointer", textAlign: "left", fontFamily: F_UI }}>
              <div style={{ width: 38, height: 38, borderRadius: 13, background: color + "1F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico as={G(CAT_ICON[t.category] || "Receipt")} size={16} color={color} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>{t.recurring && <Ico as={RefreshCw} size={11} color={ACCENT} style={{ flexShrink: 0 }} />}</div>
                <div style={{ fontSize: 11.5, color: "rgba(20,38,61,.5)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.category} · {t.owner}{nd && nd !== "ended" ? " · next " + nd : ""}{t.notes ? " · " + t.notes : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...mono(13.5, 600), color: t.dir === "in" ? POS : INK }}>{privacy ? "••••" : (t.dir === "in" ? "+" : "−") + fmt(expSGD(t))}</div>
                {t.currency !== "SGD" && <div style={{ ...mono(10.5, 400), color: "rgba(20,38,61,.45)", marginTop: 1 }}>{CUR_SYM[t.currency]}{t.amount.toLocaleString()}</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const WealthScreen = () => {
    const filterItems = ["All", ...visibleMembers.map(m => m.name), JOINT];
    const effOwner = filterItems.includes(wealthOwner) ? wealthOwner : "All";
    const isAll = effOwner === "All";
    const memberView = !isAll && effOwner !== JOINT;
    const inView = (a) => isAll ? true : effOwner === JOINT ? a.owner === JOINT : (a.owner === effOwner || a.owner === JOINT);
    const wf = (a) => toSGD(a) * (memberView && a.owner === JOINT ? 0.5 : 1); // Joint counts half in a member view
    const viewAssets = data.accounts.filter(a => a.type === "asset" && inView(a));
    const viewLiabs = data.accounts.filter(a => a.type === "liability" && inView(a));
    const vAssetsTotal = viewAssets.reduce((s, a) => s + wf(a), 0) || 1;
    const vLiabsTotal = viewLiabs.reduce((s, a) => s + wf(a), 0);
    const vGroups = [...GROUP_ORDER.filter(g => viewAssets.some(a => a.group === g)), ...[...new Set(viewAssets.filter(a => !GROUP_ORDER.includes(a.group)).map(a => a.group))]];
    const vGroupTotal = (g) => viewAssets.filter(a => a.group === g).reduce((s, a) => s + wf(a), 0);
    const vAlloc = vGroups.map(g => ({ label: g, v: vGroupTotal(g), color: GROUP_META[g]?.color || "#94A7BE" }));
    const jointNote = !isAll && viewAssets.concat(viewLiabs).some(a => a.owner === "Joint");
    return (
      <div style={scrollScreen}>
        <Header over="Assets & liabilities" title="Wealth" onShare={openShare} />
        <div style={{ marginBottom: 14 }}><Seg items={filterItems} value={effOwner} onChange={setWealthOwner} scroll /></div>
        <div style={{ ...glass(24), padding: "16px 18px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={eyebrow}>{isAll ? "Allocation" : effOwner + " · net " + fmt(vAssetsTotal - vLiabsTotal)}</span>
            <button onClick={() => { setEditAccount("new"); setSheet("account"); }} style={{ display: "flex", alignItems: "center", gap: 5, border: "none", background: "none", color: ACCENT, fontFamily: F_UI, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}><Ico as={Plus} size={13} color={ACCENT} />Add asset / liability</button>
          </div>
          <div style={{ ...mono(20), marginBottom: 11 }}>{privacy ? "S$ ••••••" : fmt(vAssetsTotal)}<span style={{ fontSize: 11, color: "rgba(20,38,61,.45)", fontFamily: F_UI, fontWeight: 400 }}> assets</span></div>
          <div style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", gap: 2 }}>
            {vAlloc.map((a) => <div key={a.label} title={a.label} style={{ width: (a.v / vAssetsTotal * 100).toFixed(1) + "%", background: a.color, borderRadius: 4 }} />)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 14px", marginTop: 11 }}>
            {vAlloc.map((a) => <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: a.color }} /><span style={{ fontSize: 11.5, color: "rgba(20,38,61,.6)" }}>{a.label}</span><span style={mono(11.5, 600)}>{(a.v / vAssetsTotal * 100).toFixed(0)}%</span></div>)}
          </div>
        </div>
        {vGroups.map((g) => {
          const rows = viewAssets.filter(a => a.group === g);
          const meta = GROUP_META[g] || { icon: "Wallet", color: "#94A7BE" };
          return (
            <div key={g} style={{ ...glass(24), padding: "8px 6px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 13px 5px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Ico as={G(meta.icon)} size={14} color={meta.color} /><span style={eyebrow}>{g}</span></div>
                <span style={{ ...mono(12.5), color: INK }}>{privacy ? "••••" : fmt(vGroupTotal(g))}</span>
              </div>
              {rows.map((r) => (
                <button key={r.id} onClick={() => { setEditAccount(r); setSheet("account"); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 13px", borderRadius: 16, border: "none", background: "none", width: "100%", cursor: "pointer", textAlign: "left", fontFamily: F_UI }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}><span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>{r.owner === "Joint" && <span style={{ ...mono(9, 700), letterSpacing: ".04em", padding: "2px 6px", borderRadius: 999, background: "rgba(46,147,166,.14)", color: "#2E93A6", flexShrink: 0 }}>JOINT</span>}{r.badge && <span style={{ ...mono(9.5, 700), letterSpacing: ".04em", padding: "2px 6px", borderRadius: 999, background: "rgba(61,90,158,.12)", color: "#3D5A9E", flexShrink: 0 }}>{r.badge}</span>}</div>
                    <div style={{ fontSize: 11.5, color: "rgba(20,38,61,.5)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.sub}{r.acctNumber ? " · " + r.acctNumber : ""}</div>
                  </div>
                  <div style={{ ...mono(13.5, 600), color: INK, flexShrink: 0 }}>{privacy ? "••••" : fmt(wf(r))}</div>
                </button>
              ))}
            </div>
          );
        })}
        {viewLiabs.length > 0 && (
          <div style={{ ...glass(24), padding: "8px 6px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 13px 5px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Ico as={CreditCard} size={14} color="#B4453A" /><span style={eyebrow}>Liabilities</span></div>
              <span style={{ ...mono(12.5), color: NEG }}>{privacy ? "••••" : "−" + fmt(vLiabsTotal)}</span>
            </div>
            {viewLiabs.map((r) => (
              <button key={r.id} onClick={() => { setEditAccount(r); setSheet("account"); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 13px", borderRadius: 16, border: "none", background: "none", width: "100%", cursor: "pointer", textAlign: "left", fontFamily: F_UI }}>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>{r.owner === "Joint" && <span style={{ ...mono(9, 700), letterSpacing: ".04em", padding: "2px 6px", borderRadius: 999, background: "rgba(46,147,166,.14)", color: "#2E93A6", flexShrink: 0 }}>JOINT</span>}</div><div style={{ fontSize: 11.5, color: "rgba(20,38,61,.5)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.sub}</div></div>
                <div style={{ ...mono(13.5, 600), color: NEG, flexShrink: 0 }}>{privacy ? "••••" : "−" + fmt(wf(r))}</div>
              </button>
            ))}
          </div>
        )}
        <p style={{ fontSize: 11, color: "rgba(20,38,61,.4)", lineHeight: 1.55, margin: "2px 4px 0" }}>
          {memberView && jointNote ? "Joint accounts are split 50/50 in a member view. " : ""}Tap any item to edit its balance — each edit is saved to that account's history so it trends over time.
        </p>
      </div>
    );
  };

  const visibleMembers = members.filter(m => m.id === me?.id || !hiddenForMe.includes(m.id));
  const memberNet = (m) => ownerNet(m.name);
  const activity = (() => {
    const memberByNameLocal = (n) => members.find(m => m.name === n);
    const av = (n) => { const m = memberByNameLocal(n); return { initial: m?.initials || (n === JOINT ? "J" : "?"), avatarBg: m?.gradient || "linear-gradient(135deg,#94A7BE,#6E8299)" }; };
    const items = [];
    (data.expenses || []).forEach((e) => {
      items.push({ ...av(e.owner), sort: e.date || "", text: `${e.owner} ${e.dir === "in" ? "logged income" : "logged"} ${e.name} — ${CUR_SYM[e.currency] || ""}${Math.round(e.amount).toLocaleString()}${e.category ? " (" + e.category + ")" : ""}`, when: e.date || "" });
    });
    (data.accounts || []).forEach((a) => {
      const h = a.history || [];
      if (h.length < 2) return;
      const last = h[h.length - 1], prev = h[h.length - 2];
      if (!last || last.balance === prev.balance) return;
      items.push({ ...av(a.owner), sort: last.date || "", text: `${a.owner} updated ${a.name} — ${last.balance > prev.balance ? "up" : "down"} ${fmt(Math.abs(last.balance - prev.balance))}`, when: last.date || "" });
    });
    return items.sort((x, y) => (y.sort || "").localeCompare(x.sort || "")).slice(0, 6);
  })();
  const netMembers = visibleMembers.map(m => ({ m, net: memberNet(m) }));
  const netSum = netMembers.reduce((s, x) => s + Math.max(0, x.net), 0) || 1;
  const hhSelected = hhView === "household" ? null : visibleMembers.find(m => m.id === hhView);
  const hhValue = hhSelected ? memberNet(hhSelected) : NW;
  const hiddenList = members.filter(m => hiddenForMe.includes(m.id));
  const HouseholdScreen = () => (
    <div style={scrollScreen}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div><div style={{ fontSize: 12.5, color: "rgba(20,38,61,.55)" }}>{data.demo ? "Demo household" : "Your household"} · viewing as {me?.name}</div><div style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.01em", display: "flex", alignItems: "center", gap: 8 }}>Household{data.demo && <span style={demoPill}>DEMO</span>}</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <IconBtn as={Plus} onClick={() => { setEditMember("new"); setSheet("member"); }} />
          <Avatar />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <Seg items={["Combined", ...visibleMembers.map(m => m.name)]} value={hhSelected ? hhSelected.name : "Combined"} onChange={(k) => setHhView(k === "Combined" ? "household" : (visibleMembers.find(m => m.name === k)?.id))} scroll />
      </div>
      <div style={{ ...heroGlass, borderRadius: 26, padding: 19, marginBottom: 14 }}>
        <div style={eyebrow}>{hhSelected ? hhSelected.name + " — net worth" : "Combined net worth"}</div>
        <div style={{ ...mono(30), marginTop: 4 }}>{mask(fmt(hhValue))}</div>
        <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", gap: 2, marginTop: 14 }}>
          {netMembers.map(({ m, net }) => <div key={m.id} title={m.name} style={{ width: (Math.max(0, net) / netSum * 100).toFixed(1) + "%", background: m.color, borderRadius: 6, opacity: hhSelected && hhSelected.id !== m.id ? 0.3 : 1 }} />)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 9 }}>
          {netMembers.map(({ m, net }) => <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: m.color }} /><span style={{ fontSize: 12, color: "rgba(20,38,61,.6)" }}>{m.name}</span><span style={mono(12, 600)}>{mask(fmt(net))}</span></div>)}
        </div>
      </div>
      <div style={{ ...glass(24), padding: "8px 6px", marginBottom: 14 }}>
        <div style={{ ...eyebrow, padding: "11px 13px 5px" }}>Members</div>
        {visibleMembers.map((m) => {
          const isMe = m.id === me?.id;
          const grantedToMe = !isMe && grantsFor(m.id).includes(me?.id);
          return (
            <button key={m.id} onClick={() => { setEditMember(m); setSheet("member"); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 13px", borderRadius: 16, border: "none", background: "none", width: "100%", cursor: "pointer", textAlign: "left", fontFamily: F_UI }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: m.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: "inset 0 1px 0 rgba(255,255,255,.5)" }}>{m.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.fullName || m.name}{isMe && <span style={{ color: "rgba(20,38,61,.4)", fontWeight: 400 }}> · you</span>}</div>
                <div style={{ fontSize: 11.5, color: "rgba(20,38,61,.5)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isMe ? "Full control of your data" : grantedToMe ? "You can edit · access granted" : "View only · request to edit"}</div>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, background: m.role === "owner" ? "rgba(20,38,61,.85)" : "rgba(61,90,158,.14)", color: m.role === "owner" ? "#fff" : "#3D5A9E" }}>{m.role}</span>
            </button>
          );
        })}
        <button onClick={() => { setEditMember("new"); setSheet("member"); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 13px", borderRadius: 16, border: "none", background: "none", width: "100%", cursor: "pointer", fontFamily: F_UI, textAlign: "left" }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, border: "1.5px dashed rgba(20,38,61,.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(20,38,61,.45)" }}><Ico as={Plus} size={16} color="rgba(20,38,61,.45)" /></div>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: ACCENT }}>Add a member</div><div style={{ fontSize: 11.5, color: "rgba(20,38,61,.5)", marginTop: 1 }}>They control their own data · you approve before they join</div></div>
        </button>
      </div>
      {hiddenList.length > 0 && (
        <div style={{ ...glass(24), padding: "8px 6px", marginBottom: 14 }}>
          <div style={{ ...eyebrow, padding: "11px 13px 5px" }}>Hidden from your view</div>
          {hiddenList.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 13px" }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: m.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>{m.initials}</div>
              <div style={{ flex: 1, fontSize: 13.5 }}>{m.name}</div>
              <button onClick={() => unhideMember(m.id)} style={{ border: "none", background: "none", color: ACCENT, fontFamily: F_UI, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Unhide</button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setScreen("legacy")} style={{ ...heroGlass, borderRadius: 24, padding: "16px 18px", width: "100%", border: "1px solid rgba(255,255,255,.7)", cursor: "pointer", fontFamily: F_UI, textAlign: "left", display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 15, background: "rgba(79,163,126,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico as={ShieldCheck} size={19} color="#4FA37E" /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>Legacy & estate planning</div>
          <div style={{ fontSize: 11.5, color: "rgba(20,38,61,.55)", marginTop: 2 }}>Schedule of Assets for your will · CPF nominations · readiness checklist</div>
        </div>
        <Ico as={ChevronRight} size={16} color="rgba(20,38,61,.35)" />
      </button>
      <div style={{ ...glass(24), padding: "8px 6px", marginBottom: 14 }}>
        <div style={{ ...eyebrow, padding: "11px 13px 5px" }}>Activity</div>
        {activity.length === 0 && (
          <div style={{ fontSize: 12, color: "rgba(20,38,61,.5)", padding: "6px 13px 12px", lineHeight: 1.5 }}>No activity yet — logging a transaction or updating a balance will show up here.</div>
        )}
        {activity.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 11, padding: "9px 13px", alignItems: "flex-start" }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: a.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 10, flexShrink: 0, marginTop: 1 }}>{a.initial}</div>
            <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, lineHeight: 1.45, color: "rgba(20,38,61,.8)" }}>{a.text}</div><div style={{ fontSize: 10.5, color: "rgba(20,38,61,.4)", marginTop: 2 }}>{a.when}</div></div>
          </div>
        ))}
      </div>
      <div style={{ ...glass(20, 18, 0.4), padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <Ico as={Users} size={16} color="rgba(20,38,61,.55)" />
        <div style={{ flex: 1, fontSize: 11.5, color: "rgba(20,38,61,.6)" }}>Viewing as <b>{me?.name}</b> — tap to switch</div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {members.map((m) => { const on = m.id === me?.id; return (
            <button key={m.id} onClick={() => setActingUser(m.id)} title={m.name} style={{ width: 34, height: 34, borderRadius: 17, border: on ? `2px solid ${ACCENT}` : "2px solid transparent", padding: 0, background: m.gradient, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", opacity: on ? 1 : 0.55, boxShadow: on ? "0 4px 10px -3px rgba(14,112,134,.5)" : "none", transition: "opacity .15s", flexShrink: 0 }}>{m.initials}</button>
          ); })}
        </div>
      </div>
    </div>
  );

  const secToggles = [
    { key: "faceId", label: "Face ID unlock", sub: "Required every time the app opens", icon: ScanFace },
    { key: "appLock", label: "Auto-lock", sub: "Lock after 60 seconds in background", icon: Lock },
    { key: "privLaunch", label: "Open in privacy mode", sub: "Amounts hidden until you tap the eye", icon: EyeOff },
    { key: "hideSwitcher", label: "Hide in app switcher", sub: "Blur the preview when multitasking", icon: AppWindow },
  ];
  const exportAllData = () => {
    const rows = [["record", "member", "type", "group_or_category", "name", "details", "currency", "amount_or_balance"].join(",")];
    data.accounts.forEach(a => rows.push(["account", a.owner, a.type, a.group, `"${a.name}"`, `"${(a.sub || "").replace(/"/g, "'")}"`, a.currency, a.balance].join(",")));
    data.expenses.forEach(e => rows.push(["transaction", e.owner, e.dir, e.category, `"${e.name}"`, `"${(e.notes || "").replace(/"/g, "'")}"`, e.currency, e.amount].join(",")));
    downloadBlob(rows.join("\n"), "text/csv", "lume-export.csv");
    downloadBlob(JSON.stringify(data, null, 2), "application/json", "lume-backup.json");
  };
  const clearAllData = async () => {
    if (!confirm("Erase ALL accounts, transactions, members and legacy info? A backup is saved and downloaded first.")) return;
    await writeBackup("prewipe", true);
    persist(emptyData(me));
  };
  const deleteAccountFully = async () => {
    if (!confirm("Delete your Lume account and ALL data? A final backup will download first.")) return;
    if (!confirm("Really delete everything? There is no recovery inside the app.")) return;
    await writeBackup("predelete", true);
    persist(emptyData(me)); setScreen("signin");
  };
  const loadDemo = async () => {
    if (!confirm("Load the generic demo household (Alex & Sam)? Your current data is backed up first.")) return;
    await writeBackup("predemo", true);
    persist(DEMO);
  };
  const dataRows = [
    { label: "Export my data", sub: "Downloads CSV + full JSON backup", icon: Download, color: INK, onClick: exportAllData },
    { label: "Two-factor authentication", sub: "On · authenticator app", icon: ShieldCheck, color: INK },
    { label: "Active sessions", sub: "Samsung Galaxy S22 · this device", icon: Smartphone, color: INK },
    { label: "Load demo data", sub: "Generic sample household · marked DEMO", icon: RefreshCw, color: INK, onClick: loadDemo },
    { label: "Clear all data", sub: "Erase everything, keep your profile", icon: EyeOff, color: NEG, onClick: clearAllData },
    { label: "Delete account & data", sub: "Permanent · double-confirmed", icon: Trash2, color: NEG, onClick: deleteAccountFully },
  ];
  const SettingsScreen = () => (
    <div style={scrollScreen}>
      <Header over={(me?.fullName || me?.name || "You") + " · " + (me?.name || "you").toLowerCase() + "@lume.app"} title="Security & privacy" back />
      <div style={{ ...heroGlass, borderRadius: 24, padding: "16px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 42, height: 42, borderRadius: 15, background: "linear-gradient(135deg,#5DC4CB,#8A7FD4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>L</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>Lume Plus {isPremium && <span style={{ ...mono(9, 700), letterSpacing: ".05em", padding: "2px 7px", borderRadius: 999, background: "rgba(21,138,98,.14)", color: POS, verticalAlign: "middle" }}>ACTIVE</span>}</div>
          <div style={{ fontSize: 11.5, color: "rgba(20,38,61,.55)", marginTop: 2 }}>{isPremium ? "Projections, exports & unlimited members unlocked" : "Projections · schedule exports · unlimited members"}</div>
        </div>
        {isPremium
          ? <button onClick={() => { if (confirm("Cancel Lume Plus? (demo toggle)")) downgrade(); }} style={{ border: "1px solid rgba(20,38,61,.15)", borderRadius: 18, background: "rgba(255,255,255,.6)", color: INK, fontFamily: F_UI, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "8px 14px" }}>Manage</button>
          : <button onClick={() => openPaywall("Lume Plus")} style={{ border: "none", borderRadius: 18, background: INK, color: "#fff", fontFamily: F_UI, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "8px 14px" }}>Upgrade</button>}
      </div>
      <div style={{ ...glass(24), padding: "8px 6px", marginBottom: 14 }}>
        <div style={{ ...eyebrow, padding: "11px 13px 5px" }}>App security</div>
        {secToggles.map((t) => (
          <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 16 }}>
            <Ico as={t.icon} size={17} color="rgba(20,38,61,.55)" />
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</div><div style={{ fontSize: 11, color: "rgba(20,38,61,.5)", marginTop: 1 }}>{t.sub}</div></div>
            <Toggle on={sec[t.key]} onClick={() => setSec({ ...sec, [t.key]: !sec[t.key] })} />
          </div>
        ))}
      </div>
      <div style={{ ...glass(24), padding: "8px 6px", marginBottom: 14 }}>
        <div style={{ ...eyebrow, padding: "11px 13px 5px" }}>Your data</div>
        {dataRows.map((d) => (
          <button key={d.label} onClick={d.onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 16, border: "none", background: "none", width: "100%", cursor: "pointer", fontFamily: F_UI, textAlign: "left" }}>
            <Ico as={d.icon} size={17} color={d.color} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: d.color }}>{d.label}</div><div style={{ fontSize: 11, color: "rgba(20,38,61,.5)", marginTop: 1 }}>{d.sub}</div></div>
            <Ico as={ChevronRight} size={15} color="rgba(20,38,61,.3)" />
          </button>
        ))}
      </div>
      <div style={{ ...glass(24), padding: "8px 6px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 13px 5px" }}>
          <span style={eyebrow}>Backups</span>
          <button onClick={() => writeBackup("manual", true)} style={{ display: "flex", alignItems: "center", gap: 5, border: "none", background: "none", color: ACCENT, fontFamily: F_UI, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}><Ico as={Download} size={13} color={ACCENT} />Back up now</button>
        </div>
        {backups.length === 0 && <div style={{ fontSize: 12, color: "rgba(20,38,61,.5)", padding: "6px 13px 10px" }}>No stored backups yet — a snapshot is saved automatically each day you use Lume.</div>}
        {backups.map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 13px" }}>
            <Ico as={RefreshCw} size={13} color="rgba(20,38,61,.4)" />
            <span style={{ flex: 1, ...mono(11.5, 500), color: "rgba(20,38,61,.7)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.replace(BAK_PREFIX, "")}</span>
            <button onClick={() => restoreBackup(k)} style={{ border: "none", background: "none", color: ACCENT, fontFamily: F_UI, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Restore</button>
          </div>
        ))}
        <div style={{ fontSize: 11, color: "rgba(20,38,61,.45)", lineHeight: 1.5, padding: "4px 13px 10px" }}>Snapshots are stored automatically once per day, before any wipe, and on demand (last 8 kept). Once cloud sync (Supabase) is connected, every change saves in real time and these become an extra safety net.</div>
      </div>
      <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,.6)", background: "rgba(255,255,255,.35)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", padding: "14px 16px", display: "flex", gap: 11, alignItems: "flex-start" }}>
        <Ico as={ShieldCheck} size={17} color="#158A62" style={{ marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.55, color: "rgba(20,38,61,.6)" }}>Your data is encrypted on device and in transit. Lume stores no bank credentials — everything you see was entered by you or your household.</p>
      </div>
    </div>
  );

  /* ---- PLAN SCREEN ---- */
  const P = data.planning || SEED.planning;
  const fireNum = fireNumber(P.annualExpenses, P.swr);
  const yearsToRetire = Math.max(0, P.retireAge - P.currentAge);
  const planMemberView = planOwner !== "Combined" && visibleMembers.some((mm) => mm.name === planOwner);
  const planAccounts = data.accounts.filter((a) => !planMemberView || a.owner === planOwner || a.owner === "Joint");
  const pw = (a) => toSGD(a) * (planMemberView && a.owner === "Joint" ? 0.5 : 1);
  const NWp = planAccounts.reduce((s, a) => s + pw(a) * (a.type === "liability" ? -1 : 1), 0);
  const fireProgress = Math.min(100, NWp / fireNum * 100);
  const mode = P.classRates ? "custom" : (P.mode || "base");
  const rates = P.classRates || CLASS_PRESETS[P.mode || "base"];
  const rateMode = P.rateMode || "mixed";   // mixed | class | individual
  const clsOf = (a) => a.type === "liability" ? "Liabilities" : (Object.prototype.hasOwnProperty.call(CLASS_PRESETS.base, a.group) ? a.group : "Other");
  // resolve each asset's growth rate under the active rate mode
  const ownRateOf = (a) => {
    if (a.type === "liability") return null;
    const own = parseRateStr(a.rate);
    if (rateMode === "class") return null;              // ignore individual rates entirely
    if (rateMode === "individual") return own ?? 0;     // only explicit rates grow; rest held flat
    return own;                                          // mixed: individual wins where set
  };
  const buckets = planAccounts.map((a) => ({ v: pw(a), cls: clsOf(a), own: ownRateOf(a) }));
  const classBal = buckets.reduce((b, x) => { b[x.cls] = (b[x.cls] || 0) + x.v; return b; }, { Cash: 0, CPF: 0, Investments: 0, Property: 0, Crypto: 0, Other: 0, Liabilities: 0 });
  // assets carrying an explicit individual rate, grouped by class (for the drill-down UI)
  const ovByClass = {};
  planAccounts.forEach((a) => { if (a.type === "liability") return; const r = parseRateStr(a.rate); if (r == null) return; (ovByClass[clsOf(a)] = ovByClass[clsOf(a)] || []).push({ a, r }); });
  const overrides = Object.values(ovByClass).reduce((s, l) => s + l.length, 0);
  const effReturn = +blendedReturnBuckets(buckets, rates).toFixed(1); // balance-weighted nominal return
  const coastNum = coastNumber(fireNum, effReturn - P.inflation, yearsToRetire);
  const coastHit = NWp >= coastNum;
  const projYears = (yearsToRetire || 20);
  const proj = projectWealthByBuckets({ buckets, rates, monthlyInvest: P.monthlyInvest, inflation: P.inflation, years: projYears });
  const yrsToFire = yearsToTarget({ startNW: NWp, monthlyInvest: P.monthlyInvest, returnRate: effReturn, inflation: P.inflation, target: fireNum });
  const fireAge = yrsToFire == null ? null : P.currentAge + yrsToFire;
  const B = data.scenarioB;
  const bRates = B ? (B.classRates || CLASS_PRESETS[B.mode || "base"]) : null;
  const projB = B ? projectWealthByBuckets({ buckets, rates: bRates, monthlyInvest: B.monthlyInvest, inflation: B.inflation, years: projYears }) : null;
  const projMax = Math.max(...proj.high, ...(projB ? projB.expected : [0])), projMin = Math.min(NWp, ...proj.low);
  const bandPath = (arr) => {
    const w = 320, h = 150, pad = 4;
    const pts = arr.map((v, i) => [pad + (i / (arr.length - 1)) * (w - pad * 2), h - pad - ((v - projMin) / ((projMax - projMin) || 1)) * (h - pad * 2)]);
    let d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (let i = 1; i < pts.length; i++) { const [x, y] = pts[i], [px, py] = pts[i - 1], cx = (px + x) / 2; d += " C" + cx.toFixed(1) + " " + py.toFixed(1) + " " + cx.toFixed(1) + " " + y.toFixed(1) + " " + x.toFixed(1) + " " + y.toFixed(1); }
    return { d, pts };
  };
  const highP = bandPath(proj.high), lowP = bandPath(proj.low), expP = bandPath(proj.expected);
  const expB = projB ? bandPath(projB.expected) : null;
  const endB = projB ? projB.expected[projB.expected.length - 1] : null;
  const fireY = (() => { const h = 150, pad = 4; return h - pad - ((fireNum - projMin) / ((projMax - projMin) || 1)) * (h - pad * 2); })();
  const endExpected = proj.expected[proj.expected.length - 1];
  const propRes = propertySim(PS, effReturn);
  const cpfNow = classBal.CPF;
  const cpfYrs = Math.max(0, 55 - P.currentAge);
  const cpfG = 0.032; // blended OA/SA/MA growth
  const cpfAt55 = cpfNow * Math.pow(1 + cpfG, cpfYrs) + (CP.monthlyContrib * 12) * (cpfYrs > 0 ? (Math.pow(1 + cpfG, cpfYrs) - 1) / cpfG : 0);
  const frsHouseholdAt55 = 213000 * Math.pow(1.035, cpfYrs) * (planMemberView ? 1 : 2); // escalating FRS × members in view
  const cpfPct = Math.min(100, cpfAt55 / frsHouseholdAt55 * 100);
  const pillBtn = { border: "1px solid rgba(20,38,61,.15)", borderRadius: 999, background: "rgba(255,255,255,.55)", color: INK, fontFamily: F_UI, fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: "7px 12px" };
  const stepBtn = { width: 26, height: 26, borderRadius: 8, border: "1px solid rgba(20,38,61,.15)", background: "rgba(255,255,255,.7)", color: INK, fontSize: 16, fontWeight: 600, cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" };
  const primaryBtnRow = { flex: 1, height: 48, border: "none", borderRadius: 24, background: INK, color: "#fff", fontFamily: F_UI, fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 };
  const ghostBtnRow = { flex: 1, height: 48, border: "1px solid rgba(20,38,61,.15)", borderRadius: 24, background: "rgba(255,255,255,.6)", color: INK, fontFamily: F_UI, fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 };
  const ring = (pct, color, size = 128) => { const r = (size - 16) / 2, c = 2 * Math.PI * r; return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(20,38,61,.09)" strokeWidth="12" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  ); };
  const AssumptionRow = ({ label, val, unit, onDec, onInc, onSet, tip }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(20,38,61,.06)" }}>
      <span style={{ fontSize: 13, color: "rgba(20,38,61,.7)", display: "flex", alignItems: "center", minWidth: 0 }}><span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>{tip && <Tip text={tip} />}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onDec} style={stepBtn}>–</button>
        <button onClick={() => { if (!onSet) return; const v = prompt(label, String(val)); if (v == null) return; const nn = parseFloat(String(v).replace(/[^0-9.\-]/g, "")); if (!isNaN(nn)) onSet(nn); }} title={onSet ? "Tap to type a value" : undefined} style={{ ...mono(13, 600), minWidth: 74, textAlign: "center", background: "none", border: "none", padding: 0, cursor: onSet ? "pointer" : "default", color: INK, textDecoration: onSet ? "underline dotted rgba(20,38,61,.4)" : "none", textUnderlineOffset: 3 }}>{unit === "$" ? fmt(val) : val + unit}</button>
        <button onClick={onInc} style={stepBtn}>+</button>
      </div>
    </div>
  );
  const PlanScreen = () => (
    <div style={scrollScreen}>
      <Header over="Retire on your terms" title="Plan" onShare={openShare} />
      <div style={{ marginBottom: 14 }}><Seg items={["Combined", ...visibleMembers.map((mm) => mm.name)]} value={planMemberView ? planOwner : "Combined"} onChange={setPlanOwner} scroll /></div>
      <div style={{ ...heroGlass, borderRadius: 26, padding: 22, marginBottom: 14, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={eyebrow}>FIRE progress</div>
        <div style={{ position: "relative", margin: "12px 0 4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {ring(fireProgress, ACCENT)}
          <div style={{ position: "absolute", textAlign: "center" }}>
            <div style={{ ...mono(24) }}>{Math.round(fireProgress)}%</div>
            <div style={{ fontSize: 10.5, color: "rgba(20,38,61,.5)" }}>to FIRE</div>
          </div>
        </div>
        <div style={{ ...mono(20), marginTop: 4 }}>{mask(fmt(fireNum))}</div>
        <div style={{ fontSize: 12, color: "rgba(20,38,61,.55)", marginTop: 2, textAlign: "center" }}>target at {P.swr}% withdrawal · {fmt(P.annualExpenses)}/yr spend — set under “FIRE target” ↓</div>
        {planMemberView && <div style={{ fontSize: 11, color: "#A06E15", marginTop: 4, textAlign: "center" }}>{planOwner}’s share (joint × ½) vs the household target</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ ...mono(12, 600), color: fireAge ? POS : NEG, background: (fireAge ? "rgba(21,138,98,.12)" : "rgba(180,69,58,.12)"), borderRadius: 999, padding: "5px 12px" }}>{fireAge ? `FIRE at ~age ${fireAge}` : "Increase savings to reach FIRE"}</span>
          <span style={{ ...mono(12, 600), color: coastHit ? POS : "rgba(20,38,61,.6)", background: coastHit ? "rgba(21,138,98,.12)" : "rgba(20,38,61,.06)", borderRadius: 999, padding: "5px 12px" }}>{coastHit ? "Coast FIRE reached ✓" : "Coast at " + fmt(coastNum)}</span>
        </div>
      </div>

      <div style={{ position: "relative" }}>
      <div style={{ ...glass(24), padding: "17px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <span style={eyebrow}>Wealth projection</span>
          <span style={{ ...mono(11), color: "rgba(20,38,61,.45)" }}>real terms · {projYears}y</span>
        </div>
        <div style={{ ...mono(22), marginBottom: 2 }}>{mask(fmt(endExpected))}</div>
        <div style={{ fontSize: 11.5, color: "rgba(20,38,61,.5)", marginBottom: 10 }}>at age {P.currentAge + projYears} · blended {effReturn}% nominal · {mode} case</div>
        <div style={{ position: "relative" }}>
        <svg width="100%" height="150" viewBox="0 0 320 150" preserveAspectRatio="none" style={{ display: "block", touchAction: "pan-y" }}
          onMouseMove={(e) => { const rc = e.currentTarget.getBoundingClientRect(); const fr = Math.min(1, Math.max(0, (e.clientX - rc.left) / rc.width)); setProjHover(Math.round(fr * (proj.expected.length - 1))); }}
          onMouseLeave={() => setProjHover(null)}
          onTouchStart={(e) => { const rc = e.currentTarget.getBoundingClientRect(); const fr = Math.min(1, Math.max(0, (e.touches[0].clientX - rc.left) / rc.width)); setProjHover(Math.round(fr * (proj.expected.length - 1))); }}
          onTouchMove={(e) => { const rc = e.currentTarget.getBoundingClientRect(); const fr = Math.min(1, Math.max(0, (e.touches[0].clientX - rc.left) / rc.width)); setProjHover(Math.round(fr * (proj.expected.length - 1))); }}
          onTouchEnd={() => setTimeout(() => setProjHover(null), 1500)}>
          <defs><linearGradient id="band" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ACCENT} stopOpacity=".22" /><stop offset="1" stopColor={ACCENT} stopOpacity=".03" /></linearGradient></defs>
          <path d={highP.d + " L" + lowP.pts[lowP.pts.length-1][0].toFixed(1) + " " + lowP.pts[lowP.pts.length-1][1].toFixed(1) + " " + [...lowP.pts].reverse().map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" L ") + " Z"} fill="url(#band)" />
          {fireY > 0 && fireY < 150 && <line x1="0" y1={fireY} x2="320" y2={fireY} stroke="#D9A554" strokeWidth="1.5" strokeDasharray="4 3" />}
          <path d={expP.d} fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" />
          {expB && <path d={expB.d} fill="none" stroke="#8A7FD4" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />}
          <circle cx={expP.pts[expP.pts.length-1][0]} cy={expP.pts[expP.pts.length-1][1]} r="4" fill={ACCENT} stroke="#fff" strokeWidth="2" />
          {projHover != null && expP.pts[projHover] && (<g>
            <line x1={expP.pts[projHover][0]} y1="0" x2={expP.pts[projHover][0]} y2="150" stroke="rgba(20,38,61,.3)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={expP.pts[projHover][0]} cy={expP.pts[projHover][1]} r="4.5" fill="#fff" stroke={ACCENT} strokeWidth="2.5" />
            {expB && expB.pts[projHover] && <circle cx={expB.pts[projHover][0]} cy={expB.pts[projHover][1]} r="4" fill="#fff" stroke="#8A7FD4" strokeWidth="2" />}
          </g>)}
        </svg>
        {projHover != null && proj.expected[projHover] != null && (
          <div style={{ position: "absolute", top: 2, left: `${(4 + (projHover / (proj.expected.length - 1)) * 312) / 320 * 100}%`, transform: `translateX(${projHover > proj.expected.length * 0.7 ? "-100%" : projHover < proj.expected.length * 0.3 ? "0" : "-50%"})`, background: "rgba(20,38,61,.94)", color: "#fff", borderRadius: 10, padding: "6px 10px", fontSize: 11, fontFamily: F_MONO, whiteSpace: "nowrap", pointerEvents: "none", zIndex: 2, lineHeight: 1.5 }}>
            Age {P.currentAge + projHover}{"\u2003"}{privacy ? "••••" : fmt(proj.expected[projHover])}{projB && projB.expected[projHover] != null ? <><br />B{"\u2003"}{privacy ? "••••" : fmt(projB.expected[projHover])}</> : null}
          </div>
        )}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(20,38,61,.6)" }}><span style={{ width: 14, height: 3, background: ACCENT, borderRadius: 2 }} />Expected</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(20,38,61,.6)" }}><span style={{ width: 14, height: 8, background: "rgba(14,112,134,.18)", borderRadius: 2 }} />Range</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(20,38,61,.6)" }}><span style={{ width: 14, height: 2, borderTop: "1.5px dashed #D9A554" }} />FIRE target</span>
          {expB && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(20,38,61,.6)" }}><span style={{ width: 14, height: 2, borderTop: "1.5px dashed #8A7FD4" }} />Scenario B</span>}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
          {!B ? (
            <button style={pillBtn} onClick={() => setScenarioB({ ...P, mode, classRates: rates })}>+ Save as Scenario B, then tweak</button>
          ) : (
            <>
              <button style={pillBtn} onClick={() => setScenarioB({ ...P, mode, classRates: rates })}>Update B ← current</button>
              <button style={{ ...pillBtn, color: NEG }} onClick={() => setScenarioB(null)}>Clear B</button>
            </>
          )}
        </div>
        {B && endB != null && (
          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, background: "rgba(138,127,212,.1)", fontSize: 12, lineHeight: 1.5 }}>
            <b>A</b> ends {fmt(endExpected)} · <b>B</b> ({fmt(B.monthlyInvest)}/m · {B.classRates ? "custom" : (B.mode || "base")} case · retire {B.retireAge}) ends {fmt(endB)} — <b style={{ color: endExpected >= endB ? POS : "#8A7FD4" }}>{endExpected >= endB ? "A ahead by " + fmt(endExpected - endB) : "B ahead by " + fmt(endB - endExpected)}</b>
          </div>
        )}
      </div>

      <div style={{ ...glass(24), padding: "17px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={eyebrow}>Growth by asset class</span>
          <span style={{ ...mono(11), color: "rgba(20,38,61,.45)" }}>synced from Wealth</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
          {["bear", "base", "bull"].map((k) => { const on = mode === k; return (
            <button key={k} onClick={() => setPlanning({ mode: k, classRates: null })} style={{ ...pillBtn, flex: 1, textTransform: "capitalize", background: on ? INK : "rgba(255,255,255,.55)", color: on ? "#fff" : "rgba(20,38,61,.65)", borderColor: on ? INK : "rgba(20,38,61,.15)" }}>{k}</button>
          ); })}
          {mode === "custom" && <span style={{ ...pillBtn, background: "rgba(217,164,65,.18)", color: "#A06E15", borderColor: "transparent", cursor: "default" }}>Custom</span>}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "stretch" }}>
          {[
            { k: "mixed", label: "Mixed", tip: "Recommended. Each asset uses its own Growth % where you've set one; every other asset follows its class rate above." },
            { k: "class", label: "Class only", tip: "Ignore all individual Growth % values — every asset follows its class rate. Useful for a clean top-down view." },
            { k: "individual", label: "Individual only", tip: "Only assets with their own Growth % grow; everything else is held flat at 0%. A conservative view counting only what you've explicitly modelled." },
          ].map((o) => { const on = rateMode === o.k; return (
            <button key={o.k} onClick={() => setPlanning({ rateMode: o.k })} style={{ flex: 1, border: `1px solid ${on ? (o.k === "class" ? INK : ACCENT) : "rgba(20,38,61,.15)"}`, borderRadius: 12, background: on ? (o.k === "class" ? INK : "rgba(14,112,134,.1)") : "rgba(255,255,255,.5)", color: on ? (o.k === "class" ? "#fff" : ACCENT) : "rgba(20,38,61,.6)", fontFamily: F_UI, fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "8px 4px", lineHeight: 1.3 }}>{o.label}</button>
          ); })}
        </div>
        <div style={{ fontSize: 10.5, color: "rgba(20,38,61,.5)", lineHeight: 1.5, marginBottom: 10, display: "flex", alignItems: "center" }}>
          <span>{rateMode === "mixed" ? "Individual rates win; class rates fill the rest." : rateMode === "class" ? "Individual rates ignored — class rates only." : "Only assets with an individual rate grow; others flat at 0%."}</span>
          <Tip text={rateMode === "mixed" ? "Assets with their own Growth % (teal below) use it. All other assets follow the class rate on the same row." : rateMode === "class" ? "Every asset follows its class rate. Individual Growth % values are kept on the assets but not applied here." : "Assets without an individual Growth % are held flat at 0% — nothing is assumed about them."} />
        </div>
        {CLASS_ORDER.filter((c) => (classBal[c] || 0) > 0).map((c) => {
          const ovs = ovByClass[c] || [];
          const ovTotal = ovs.reduce((s, o) => s + pw(o.a), 0);
          const classDriven = rateMode !== "class" && ovs.length > 0 && Math.abs(ovTotal - (classBal[c] || 0)) < 1; // whole class overridden
          const open = openOvClass === c;
          return (
          <div key={c} style={{ borderBottom: "1px solid rgba(20,38,61,.06)", padding: "8px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {c === "Liabilities" ? "Liabilities · paydown" : c}
                  {ovs.length > 0 && c !== "Liabilities" && (
                    <button onClick={() => setOpenOvClass(open ? null : c)} style={{ ...mono(9, 700), letterSpacing: ".03em", padding: "2px 7px", borderRadius: 999, border: "none", cursor: "pointer", background: rateMode === "class" ? "rgba(20,38,61,.1)" : "rgba(14,112,134,.16)", color: rateMode === "class" ? "rgba(20,38,61,.45)" : ACCENT, textDecoration: rateMode === "class" ? "line-through" : "none" }}>{ovs.length} INDIVIDUAL {open ? "▴" : "▾"}</button>
                  )}
                </div>
                <div style={{ ...mono(10.5, 500), color: "rgba(20,38,61,.45)" }}>{privacy ? "••••" : fmtShort(classBal[c])}{classDriven && rateMode !== "class" ? " · fully individual" : ""}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: (rateMode === "individual" || classDriven) && c !== "Liabilities" ? 0.4 : 1 }}>
                <button onClick={() => setPlanning({ mode: "custom", classRates: { ...rates, [c]: +((rates[c] || 0) - 0.5).toFixed(1) } })} style={stepBtn}>–</button>
                <button onClick={() => { const v = prompt(c + " growth % / yr", String(rates[c] || 0)); if (v == null) return; const nn = parseFloat(String(v).replace(/[^0-9.\-]/g, "")); if (!isNaN(nn)) setPlanning({ mode: "custom", classRates: { ...rates, [c]: +nn.toFixed(1) } }); }} style={{ ...mono(12.5, 600), minWidth: 56, textAlign: "center", background: "none", border: "none", padding: 0, cursor: "pointer", color: INK, textDecoration: "underline dotted rgba(20,38,61,.4)", textUnderlineOffset: 3 }}>{(rates[c] || 0).toFixed(1)}%</button>
                <button onClick={() => setPlanning({ mode: "custom", classRates: { ...rates, [c]: +((rates[c] || 0) + 0.5).toFixed(1) } })} style={stepBtn}>+</button>
              </div>
            </div>
            {open && ovs.length > 0 && (
              <div style={{ marginTop: 8, marginBottom: 2, borderRadius: 12, background: "rgba(14,112,134,.07)", border: "1px solid rgba(14,112,134,.18)", padding: "8px 10px" }}>
                {ovs.map(({ a, r }) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                    <span style={{ flex: 1, fontSize: 12, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}<span style={{ color: "rgba(20,38,61,.45)" }}> · {privacy ? "••••" : fmtShort(pw(a))}</span></span>
                    <span style={{ ...mono(11.5, 700), color: rateMode === "class" ? "rgba(20,38,61,.35)" : ACCENT, textDecoration: rateMode === "class" ? "line-through" : "none", flexShrink: 0 }}>{r.toFixed(2)}%</span>
                    <button onClick={() => { setEditAccount(a); setSheet("account"); }} style={{ border: "none", background: "none", color: ACCENT, fontFamily: F_UI, fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: 0, flexShrink: 0 }}>Edit</button>
                  </div>
                ))}
                <div style={{ fontSize: 10.5, color: "rgba(20,38,61,.5)", marginTop: 4, lineHeight: 1.45 }}>{rateMode === "class" ? "Ignored in Class only mode." : "These rates override the class rate above."}</div>
              </div>
            )}
          </div>
        ); })}
        <div style={{ fontSize: 11, color: "rgba(20,38,61,.45)", marginTop: 8, lineHeight: 1.5 }}>Balances sync live from your Wealth accounts. New monthly savings are assumed to go into Investments. Blended: <b>{effReturn}%</b> nominal, weighted by your balances.{overrides > 0 ? <> <span style={{ color: ACCENT, fontWeight: 600 }}>{overrides} asset{overrides > 1 ? "s" : ""}</span> carr{overrides > 1 ? "y" : "ies"} an individual Growth % — tap a teal badge to see and edit them.</> : <> Set a Growth % on any asset (in its edit sheet) to override its class rate.</>}</div>
      </div>

      <div style={{ ...glass(24), padding: "17px 18px", marginBottom: 14 }}>
        <div style={{ ...eyebrow, marginBottom: 6 }}>FIRE target · drives the ring & gold line</div>
        <AssumptionRow label="Annual spend in retirement" val={P.annualExpenses} unit="$" onDec={() => setPlanning({ annualExpenses: Math.max(12000, P.annualExpenses - 6000) })} onInc={() => setPlanning({ annualExpenses: P.annualExpenses + 6000 })} onSet={(nn) => setPlanning({ annualExpenses: Math.max(0, Math.round(nn)) })} />
        <AssumptionRow label="Safe withdrawal rate" val={P.swr} unit="%" onDec={() => setPlanning({ swr: Math.max(2, +(P.swr - 0.5).toFixed(1)) })} onInc={() => setPlanning({ swr: Math.min(6, +(P.swr + 0.5).toFixed(1)) })} onSet={(nn) => setPlanning({ swr: Math.min(10, Math.max(1, +nn.toFixed(2))) })} />
        <div style={{ ...eyebrow, margin: "14px 0 6px" }}>Projection engine · drives the fan chart</div>
        <AssumptionRow label="Monthly investing" val={P.monthlyInvest} unit="$" onDec={() => setPlanning({ monthlyInvest: Math.max(0, P.monthlyInvest - 1000) })} onInc={() => setPlanning({ monthlyInvest: P.monthlyInvest + 1000 })} onSet={(nn) => setPlanning({ monthlyInvest: Math.max(0, Math.round(nn)) })} />
        <AssumptionRow label="Inflation" val={P.inflation} unit="%" onDec={() => setPlanning({ inflation: Math.max(0, +(P.inflation - 0.5).toFixed(1)) })} onInc={() => setPlanning({ inflation: +(P.inflation + 0.5).toFixed(1) })} onSet={(nn) => setPlanning({ inflation: Math.min(15, Math.max(0, +nn.toFixed(2))) })} />
        <AssumptionRow label="Target retirement age" val={P.retireAge} unit="" onDec={() => setPlanning({ retireAge: Math.max(P.currentAge + 1, P.retireAge - 1) })} onInc={() => setPlanning({ retireAge: P.retireAge + 1 })} onSet={(nn) => setPlanning({ retireAge: Math.max(P.currentAge + 1, Math.round(nn)) })} />
        <div style={{ fontSize: 11, color: "rgba(20,38,61,.45)", marginTop: 8, lineHeight: 1.5 }}>Asset balances come from Wealth automatically; growth rates from the card above. FIRE ring = net worth ÷ (spend ÷ SWR). Chart = balances compounding at class rates + monthly investing, to your target age.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div style={{ ...glass(20, 18, 0.45), padding: "14px 15px" }}>
          <div style={{ fontSize: 11.5, color: "rgba(20,38,61,.55)", fontWeight: 600 }}>Years to FIRE</div>
          <div style={{ ...mono(20), marginTop: 5 }}>{yrsToFire == null ? "—" : yrsToFire + " yrs"}</div>
        </div>
        <div style={{ ...glass(20, 18, 0.45), padding: "14px 15px" }}>
          <div style={{ fontSize: 11.5, color: "rgba(20,38,61,.55)", fontWeight: 600 }}>Gap to target</div>
          <div style={{ ...mono(20), marginTop: 5 }}>{mask(fmt(Math.max(0, fireNum - NWp)))}</div>
        </div>
      </div>
      <div style={{ ...glass(24), padding: "17px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <span style={eyebrow}>Property as an investment</span>
          <span style={{ ...mono(11), color: "rgba(20,38,61,.45)" }}>SG stamp duties modelled</span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(20,38,61,.55)", marginBottom: 10, lineHeight: 1.5 }}>{PS.rental ? "Rent out" : "Buy"} a {fmt(PS.price)} property, hold {PS.holdYrs} years — vs investing the same upfront cash at your blended {effReturn}%. Toggle "Rent it out" for an investment view.</div>
        {data.accounts.some((a) => a.group === "Property" && a.type === "asset") && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {data.accounts.filter((a) => a.group === "Property" && a.type === "asset").map((a) => { const on = PS.sourceId === a.id; return (
              <button key={a.id} onClick={() => { const price = Math.round(((parseFloat(a.purchasePrice) || toSGD(a)) / 10000)) * 10000; const patch = { price, sourceId: a.id }; const pp = parseFloat(a.purchasePrice), la = parseFloat(a.loanAmount); if (pp > 0 && la > 0) patch.downPct = Math.min(75, Math.max(5, Math.round((1 - la / pp) * 100))); if (parseFloat(a.loanRatePct) > 0) patch.ratePct = +parseFloat(a.loanRatePct).toFixed(2); if (parseFloat(a.loanTenorYrs) > 0) patch.tenorYrs = Math.round(parseFloat(a.loanTenorYrs)); setPropertySim(patch); }} style={{ ...pillBtn, background: on ? INK : "rgba(255,255,255,.55)", color: on ? "#fff" : "rgba(20,38,61,.65)", borderColor: on ? INK : "rgba(20,38,61,.15)" }}>{a.name}</button>
            ); })}
            <button onClick={() => setPropertySim({ sourceId: null })} style={{ ...pillBtn, background: !PS.sourceId ? INK : "rgba(255,255,255,.55)", color: !PS.sourceId ? "#fff" : "rgba(20,38,61,.65)", borderColor: !PS.sourceId ? INK : "rgba(20,38,61,.15)" }}>Custom</button>
          </div>
        )}
        <AssumptionRow label="Purchase price" val={PS.price} unit="$" onDec={() => setPropertySim({ price: Math.max(300000, PS.price - 100000), sourceId: null })} onInc={() => setPropertySim({ price: PS.price + 100000, sourceId: null })} onSet={(nn) => setPropertySim({ price: Math.max(100000, Math.round(nn)), sourceId: null })} />
        <AssumptionRow label="Down payment" val={PS.downPct} unit="%" onDec={() => setPropertySim({ downPct: Math.max(5, PS.downPct - 5) })} onInc={() => setPropertySim({ downPct: Math.min(75, PS.downPct + 5) })} onSet={(nn) => setPropertySim({ downPct: Math.min(100, Math.max(5, Math.round(nn))) })} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(20,38,61,.06)" }}>
          <span style={{ fontSize: 13, color: "rgba(20,38,61,.7)" }}>ABSD profile</span>
          <div style={{ display: "flex", gap: 6 }}>
            {[["1st · 0%", 0], ["2nd · 20%", 20], ["3rd+ · 30%", 30]].map(([lb, v]) => (
              <button key={v} onClick={() => setPropertySim({ absdPct: v })} style={{ ...pillBtn, padding: "6px 10px", fontSize: 10.5, background: PS.absdPct === v ? INK : "rgba(255,255,255,.55)", color: PS.absdPct === v ? "#fff" : "rgba(20,38,61,.65)", borderColor: PS.absdPct === v ? INK : "rgba(20,38,61,.15)" }}>{lb}</button>
            ))}
          </div>
        </div>
        <AssumptionRow label="Loan rate" val={PS.ratePct} unit="%" onDec={() => setPropertySim({ ratePct: Math.max(1, +(PS.ratePct - 0.25).toFixed(2)) })} onInc={() => setPropertySim({ ratePct: +(PS.ratePct + 0.25).toFixed(2) })} onSet={(nn) => setPropertySim({ ratePct: Math.min(10, Math.max(0.5, +nn.toFixed(2))) })} />
        <AssumptionRow label="Loan tenure" val={PS.tenorYrs} unit=" yrs" tip="Max tenure is typically 30 years, capped so the loan ends by age 65. Longer tenure lowers monthly payments but raises total interest." onDec={() => setPropertySim({ tenorYrs: Math.max(5, PS.tenorYrs - 5) })} onInc={() => setPropertySim({ tenorYrs: Math.min(35, PS.tenorYrs + 5) })} onSet={(nn) => setPropertySim({ tenorYrs: Math.min(35, Math.max(5, Math.round(nn))) })} />
        <AssumptionRow label="Price appreciation" val={PS.apprPct} unit="%" onDec={() => setPropertySim({ apprPct: Math.max(-2, +(PS.apprPct - 0.5).toFixed(1)) })} onInc={() => setPropertySim({ apprPct: +(PS.apprPct + 0.5).toFixed(1) })} onSet={(nn) => setPropertySim({ apprPct: Math.min(15, Math.max(-5, +nn.toFixed(1))) })} />
        <AssumptionRow label="Holding period" val={PS.holdYrs} unit=" yrs" tip="How long you hold before selling. Selling within 3 years triggers Seller's Stamp Duty (SSD)." onDec={() => setPropertySim({ holdYrs: Math.max(1, PS.holdYrs - 1) })} onInc={() => setPropertySim({ holdYrs: Math.min(30, PS.holdYrs + 1) })} onSet={(nn) => setPropertySim({ holdYrs: Math.min(40, Math.max(1, Math.round(nn))) })} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(20,38,61,.06)" }}>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center" }}>Rent it out<Tip text="Off = you live in it (own-stay): no rent, no letting fees. On = investment: rental income and rental fees apply." /></div><div style={{ fontSize: 10.5, color: "rgba(20,38,61,.45)" }}>{PS.rental ? "Investment · rented out" : "Own-stay · you live in it"}</div></div>
          <Toggle on={!!PS.rental} onClick={() => setPropertySim({ rental: !PS.rental })} />
        </div>
        {PS.rental && <AssumptionRow label="Gross rental yield" val={PS.rentYieldPct} unit="%" tip="Annual rent ÷ property price. Singapore private condos typically yield 2.5–3.5% gross." onDec={() => setPropertySim({ rentYieldPct: Math.max(0, +(PS.rentYieldPct - 0.25).toFixed(2)) })} onInc={() => setPropertySim({ rentYieldPct: +(PS.rentYieldPct + 0.25).toFixed(2) })} onSet={(nn) => setPropertySim({ rentYieldPct: Math.min(10, Math.max(0, +nn.toFixed(2))) })} />}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(20,38,61,.06)" }}>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center" }}>New launch (BUC)<Tip text="Building Under Construction: paid progressively during construction, no rent or MCST until it's completed (TOP)." /></div><div style={{ fontSize: 10.5, color: "rgba(20,38,61,.45)" }}>{PS.newLaunch ? "Progressive payments to TOP" : "Completed / resale"}</div></div>
          <Toggle on={!!PS.newLaunch} onClick={() => setPropertySim({ newLaunch: !PS.newLaunch })} />
        </div>
        {PS.newLaunch && <AssumptionRow label="Years to TOP" val={PS.topYrs ?? 3} unit=" yrs" tip="Time from purchase to completion (TOP). Rent and MCST/property tax only begin after this." onDec={() => setPropertySim({ topYrs: Math.max(1, +((PS.topYrs ?? 3) - 0.5).toFixed(1)) })} onInc={() => setPropertySim({ topYrs: Math.min(6, +((PS.topYrs ?? 3) + 0.5).toFixed(1)) })} onSet={(nn) => setPropertySim({ topYrs: Math.min(6, Math.max(0.5, +nn.toFixed(1))) })} />}
        <button onClick={() => setShowPropCosts(!showPropCosts)} style={{ width: "100%", textAlign: "left", border: "none", background: "none", padding: "10px 0", cursor: "pointer", fontFamily: F_UI, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(20,38,61,.06)" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>{showPropCosts ? "Hide running costs ▴" : "Customise running costs ▾"}</span>
          <span style={{ ...mono(11.5, 500), color: "rgba(20,38,61,.5)" }}>≈ {fmt(propRes.monthlyCosts)}/mo all-in</span>
        </button>
        {showPropCosts && (<div style={{ padding: "2px 0 4px" }}>
          <div style={{ ...eyebrow, margin: "8px 0 2px", color: "rgba(20,38,61,.5)" }}>Holding costs · whenever you own it</div>
          <AssumptionRow label="Maintenance / MCST" val={PS.maintMo ?? 300} unit="$" tip="Monthly condo maintenance / sinking fund paid to the MCST. Typically S$300–500 for a condo unit." onDec={() => setPropertySim({ maintMo: Math.max(0, (PS.maintMo ?? 300) - 50) })} onInc={() => setPropertySim({ maintMo: (PS.maintMo ?? 300) + 50 })} onSet={(nn) => setPropertySim({ maintMo: Math.max(0, Math.round(nn)) })} />
          <AssumptionRow label="Property tax (of value / yr)" val={PS.propTaxPct ?? 0.5} unit="%" tip="IRAS property tax. Owner-occupied rates are lower and progressive; non-owner-occupied (rented) rates are higher. ~0.5% is a rough blended proxy." onDec={() => setPropertySim({ propTaxPct: Math.max(0, +((PS.propTaxPct ?? 0.5) - 0.1).toFixed(1)) })} onInc={() => setPropertySim({ propTaxPct: +((PS.propTaxPct ?? 0.5) + 0.1).toFixed(1) })} onSet={(nn) => setPropertySim({ propTaxPct: Math.min(3, Math.max(0, +nn.toFixed(2))) })} />
          {PS.rental && <>
            <div style={{ ...eyebrow, margin: "12px 0 2px", color: "rgba(20,38,61,.5)" }}>Rental costs · only when rented out</div>
            <div style={{ fontSize: 10.5, color: "rgba(20,38,61,.45)", lineHeight: 1.5, padding: "2px 0 4px" }}>Rented for the whole holding period{propRes.topM > 0 ? " after TOP" : ""} ({(propRes.effRent > 0 ? (PS.holdYrs * 12 - propRes.topM) : 0)} months), less the vacancy buffer below.</div>
            <AssumptionRow label="Lease term (sets agent fee)" val={PS.leaseYrs ?? 2} unit=" yr" tip="Just the letting-agent commission convention — not how long you rent out. 1-year lease → 0.5 month's rent; 2-year lease → 1 month's rent. Tapping this sets the agent fee below; you can then override it." onDec={() => { const ly = 1; setPropertySim({ leaseYrs: ly, rentAgentPct: +(0.5 / (ly * 12) * 100).toFixed(2) }); }} onInc={() => { const ly = 2; setPropertySim({ leaseYrs: ly, rentAgentPct: +(1 / (ly * 12) * 100).toFixed(2) }); }} onSet={(nn) => { const ly = nn >= 2 ? 2 : 1; setPropertySim({ leaseYrs: ly, rentAgentPct: +((ly >= 2 ? 1 : 0.5) / (ly * 12) * 100).toFixed(2) }); }} />
            <AssumptionRow label="Rental agent fee (of rent)" val={PS.rentAgentPct ?? 4.17} unit="%" tip="Letting commission expressed as a % of monthly rent, amortised over the lease. Default derives from the lease term (≈4.17% for a 2-year lease = 1 month over 24). Override if your agent charges differently." onDec={() => setPropertySim({ rentAgentPct: Math.max(0, +((PS.rentAgentPct ?? 4.17) - 0.5).toFixed(2)) })} onInc={() => setPropertySim({ rentAgentPct: +((PS.rentAgentPct ?? 4.17) + 0.5).toFixed(2) })} onSet={(nn) => setPropertySim({ rentAgentPct: Math.min(15, Math.max(0, +nn.toFixed(2))) })} />
            <AssumptionRow label="Vacancy buffer" val={PS.vacancyPct ?? 5} unit="%" tip="Share of time the unit sits empty between tenancies. Typical Singapore condos see ~1 month between 2-year leases (≈4–5%). Reduces effective rent." onDec={() => setPropertySim({ vacancyPct: Math.max(0, +((PS.vacancyPct ?? 5) - 1).toFixed(0)) })} onInc={() => setPropertySim({ vacancyPct: Math.min(50, +((PS.vacancyPct ?? 5) + 1).toFixed(0)) })} onSet={(nn) => setPropertySim({ vacancyPct: Math.min(50, Math.max(0, Math.round(nn))) })} />
            <AssumptionRow label="Income tax on net rent" val={PS.rentTaxPct ?? 0} unit="%" tip="Net rental income is taxable at your marginal rate. Set your effective rate, or leave 0 to ignore. Mortgage interest and these costs are deductible." onDec={() => setPropertySim({ rentTaxPct: Math.max(0, +((PS.rentTaxPct ?? 0) - 1).toFixed(0)) })} onInc={() => setPropertySim({ rentTaxPct: +((PS.rentTaxPct ?? 0) + 1).toFixed(0) })} onSet={(nn) => setPropertySim({ rentTaxPct: Math.min(24, Math.max(0, Math.round(nn))) })} />
          </>}
          <div style={{ ...eyebrow, margin: "12px 0 2px", color: "rgba(20,38,61,.5)" }}>Buying & selling · one-offs</div>
          <AssumptionRow label="Legal & misc (buy)" val={PS.legal ?? 3000} unit="$" tip="Conveyancing lawyer, valuation and disbursements on purchase. ~S$2,500–3,500." onDec={() => setPropertySim({ legal: Math.max(0, (PS.legal ?? 3000) - 500) })} onInc={() => setPropertySim({ legal: (PS.legal ?? 3000) + 500 })} onSet={(nn) => setPropertySim({ legal: Math.max(0, Math.round(nn)) })} />
          <AssumptionRow label="Renovation (buy, optional)" val={PS.renoCost ?? 0} unit="$" tip="Optional upfront renovation / furnishing. Adds to cash needed and lowers your return on cash." onDec={() => setPropertySim({ renoCost: Math.max(0, (PS.renoCost ?? 0) - 5000) })} onInc={() => setPropertySim({ renoCost: (PS.renoCost ?? 0) + 5000 })} onSet={(nn) => setPropertySim({ renoCost: Math.max(0, Math.round(nn)) })} />
          <AssumptionRow label="Sale agent fee (of price)" val={PS.sellAgentPct ?? 2} unit="%" tip="Commission to the marketing agent when you sell. Typically ~2% of the sale price, + GST." onDec={() => setPropertySim({ sellAgentPct: Math.max(0, +((PS.sellAgentPct ?? 2) - 0.5).toFixed(1)) })} onInc={() => setPropertySim({ sellAgentPct: +((PS.sellAgentPct ?? 2) + 0.5).toFixed(1) })} onSet={(nn) => setPropertySim({ sellAgentPct: Math.min(5, Math.max(0, +nn.toFixed(1))) })} />
          <AssumptionRow label="Sale legal & misc" val={PS.sellLegal ?? 2000} unit="$" tip="Conveyancing and disbursements on sale. ~S$2,000." onDec={() => setPropertySim({ sellLegal: Math.max(0, (PS.sellLegal ?? 2000) - 500) })} onInc={() => setPropertySim({ sellLegal: (PS.sellLegal ?? 2000) + 500 })} onSet={(nn) => setPropertySim({ sellLegal: Math.max(0, Math.round(nn)) })} />
          <div style={{ fontSize: 11, color: "rgba(20,38,61,.45)", marginTop: 8, lineHeight: 1.5 }}>BSD, ABSD and SSD are always computed automatically from price, buyer profile and holding period — you don't need to enter them.</div>
        </div>)}
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}><span style={{ color: "rgba(20,38,61,.6)" }}>Upfront cash (down + BSD {fmtShort(propRes.bsd)}{PS.absdPct > 0 ? " + ABSD " + fmtShort(propRes.absd) : ""}{(PS.renoCost ?? 0) > 0 ? " + reno " + fmtShort(PS.renoCost) : ""})</span><span style={mono(12.5, 600)}>{fmt(propRes.cashIn)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}><span style={{ color: "rgba(20,38,61,.6)" }}>{propRes.isRental ? "Monthly cashflow (rent − loan − costs" + (propRes.topM > 0 ? " · after TOP" : "") + ")" : "Monthly carrying cost (loan + holding)"}</span><span style={{ ...mono(12.5, 600), color: propRes.cashflow >= 0 ? POS : NEG }}>{propRes.cashflow >= 0 ? "+" : "−"}{fmt(Math.abs(propRes.cashflow))}</span></div>
          <div style={{ borderTop: "1px dashed rgba(20,38,61,.15)", margin: "4px 0 2px", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
            <span style={{ color: "rgba(20,38,61,.6)" }}>Selling price · yr {PS.holdYrs} — tap to set</span>
            <button onClick={() => { const v = prompt("Target selling price (S$) — appreciation will be solved to match", String(Math.round(propRes.exitValue))); if (v == null) return; const sell = parseFloat(String(v).replace(/[^0-9.]/g, "")); if (!(sell > 0)) return; const ap = (Math.pow(sell / PS.price, 1 / PS.holdYrs) - 1) * 100; setPropertySim({ apprPct: +Math.min(20, Math.max(-10, ap)).toFixed(1) }); }} style={{ ...mono(12.5, 700), background: "none", border: "none", padding: 0, cursor: "pointer", color: ACCENT, textDecoration: "underline dotted rgba(14,112,134,.5)", textUnderlineOffset: 3 }}>{fmt(propRes.exitValue)}</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}><span style={{ color: "rgba(20,38,61,.6)" }}>− Outstanding loan (yr {PS.holdYrs})</span><span style={{ ...mono(12.5, 600), color: NEG }}>−{fmt(propRes.balance)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}><span style={{ color: "rgba(20,38,61,.6)" }}>− Selling costs (agent {PS.sellAgentPct ?? 2}% + legal{propRes.ssdAmt > 0 ? " + SSD " + fmtShort(propRes.ssdAmt) : ""})</span><span style={{ ...mono(12.5, 600), color: NEG }}>−{fmt(propRes.sellCosts)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 700 }}><span>= Equity at exit</span><span style={mono(12.5, 700)}>{fmt(propRes.equityAtExit)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}><span style={{ color: "rgba(20,38,61,.6)" }}>Net profit (equity − cash in + cum. cashflow)</span><span style={{ ...mono(12.5, 600), color: propRes.netProfit >= 0 ? POS : NEG }}>{propRes.netProfit >= 0 ? "+" : "−"}{fmt(Math.abs(propRes.netProfit))}</span></div>
        </div>
        {propRes.ssdRate > 0 && (
          <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 10, background: "rgba(180,69,58,.1)", fontSize: 11.5, color: "#B4453A", lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 7 }}>
            <Ico as={AlertTriangle} size={14} color="#B4453A" style={{ marginTop: 1, flexShrink: 0 }} />
            <span>Selling in year {PS.holdYrs} incurs <b>{(propRes.ssdRate * 100).toFixed(0)}% SSD</b> ({fmt(propRes.ssdAmt)}). SSD applies to sales within 3 years — hold to year 4+ to avoid it entirely.</span>
          </div>
        )}
        <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 12, background: propRes.netProfit >= propRes.altProfit ? "rgba(21,138,98,.1)" : "rgba(217,164,65,.12)", fontSize: 12.5, lineHeight: 1.55 }}>
          Property: <b>{propRes.cagr == null ? "—" : propRes.cagr.toFixed(1) + "%/yr"}</b> on cash · Same {fmt(propRes.cashIn)} at {effReturn}% instead: <b>{fmt(propRes.altEnd)}</b> ({propRes.altProfit >= 0 ? "+" : ""}{fmt(propRes.altProfit)}).{" "}
          <b>{propRes.netProfit > propRes.altProfit ? "Property edges it on these assumptions." : "Simply investing beats this property on these assumptions."}</b>
        </div>
        <button onClick={() => setShowAmort(!showAmort)} style={{ width: "100%", textAlign: "left", border: "none", background: "none", padding: "12px 0 0", cursor: "pointer", fontFamily: F_UI, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>{showAmort ? "Hide amortisation ▴" : "Amortisation schedule ▾"}</span>
          <span style={{ ...mono(11.5, 500), color: "rgba(20,38,61,.5)" }}>{fmt(propRes.pay)}/mo · {PS.tenorYrs}y loan</span>
        </button>
        {showAmort && (
          <div style={{ marginTop: 10, maxHeight: 250, overflowY: "auto", borderRadius: 12, border: "1px solid rgba(20,38,61,.1)", background: "rgba(255,255,255,.4)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5, fontFamily: F_MONO }}>
              <thead><tr>{["Yr", "Paid", "Interest", "Principal", "Balance"].map((h, i) => <th key={h} style={{ position: "sticky", top: 0, background: "rgba(240,244,250,.98)", textAlign: i === 0 ? "left" : "right", padding: "7px 8px", fontWeight: 700, color: "rgba(20,38,61,.55)", borderBottom: "1px solid rgba(20,38,61,.12)" }}>{h}</th>)}</tr></thead>
              <tbody>
                {amortSchedule(PS.price * (1 - PS.downPct / 100), PS.ratePct, PS.tenorYrs).map((rw) => (
                  <tr key={rw.y} style={{ background: rw.y === PS.holdYrs ? "rgba(14,112,134,.12)" : "transparent" }}>
                    <td style={{ padding: "5px 8px", fontWeight: rw.y === PS.holdYrs ? 700 : 400 }}>{rw.y}{rw.y === PS.holdYrs ? " ◂ exit" : ""}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right" }}>{privacy ? "••••" : fmtShort(rw.pay)}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right", color: NEG }}>{privacy ? "••••" : fmtShort(rw.int)}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right", color: POS }}>{privacy ? "••••" : fmtShort(rw.prin)}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right" }}>{privacy ? "••••" : fmtShort(rw.bal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ ...glass(24), padding: "17px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <span style={eyebrow}>CPF at 55</span>
          <span style={{ ...mono(11), color: "rgba(20,38,61,.45)" }}>vs 2× Full Retirement Sum</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div><div style={{ ...mono(22) }}>{mask(fmt(cpfAt55))}</div><div style={{ fontSize: 11.5, color: "rgba(20,38,61,.5)", marginTop: 2 }}>projected {planMemberView ? planOwner + "’s" : "household"} CPF at 55 · from {fmt(cpfNow)} today</div></div>
          <div style={{ textAlign: "right" }}><div style={{ ...mono(14, 600), color: cpfPct >= 100 ? POS : INK }}>{Math.round(cpfPct)}%</div><div style={{ fontSize: 10.5, color: "rgba(20,38,61,.45)" }}>of {fmtShort(frsHouseholdAt55)}</div></div>
        </div>
        <div style={{ height: 9, borderRadius: 5, background: "rgba(20,38,61,.08)", margin: "10px 0 12px", overflow: "hidden" }}><div style={{ height: "100%", width: cpfPct + "%", borderRadius: 5, background: cpfPct >= 100 ? POS : "linear-gradient(90deg,#3D5A9E,#0E7086)" }} /></div>
        <AssumptionRow label="Monthly CPF inflows" val={CP.monthlyContrib} unit="$" onDec={() => setCpfPlan({ monthlyContrib: Math.max(0, CP.monthlyContrib - 250) })} onInc={() => setCpfPlan({ monthlyContrib: CP.monthlyContrib + 250 })} onSet={(nn) => setCpfPlan({ monthlyContrib: Math.max(0, Math.round(nn)) })} />
        <div style={{ fontSize: 11, color: "rgba(20,38,61,.45)", marginTop: 8, lineHeight: 1.5 }}>Blended 3.2% CPF growth · FRS escalated ~3.5%/yr · nominal dollars. CPF LIFE payout modelling comes next.</div>
      </div>

      {!isPremium && (
        <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "rgba(233,238,246,.45)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 5 }}>
          <div style={{ width: 44, height: 44, borderRadius: 16, background: "rgba(255,255,255,.85)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px -10px rgba(23,42,72,.35)" }}><Ico as={Lock} size={19} color={ACCENT} /></div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Projections are part of Lume Plus</div>
          <div style={{ fontSize: 12, color: "rgba(20,38,61,.6)", textAlign: "center", maxWidth: 240, lineHeight: 1.5 }}>Your FIRE number stays free. See how it plays out over {projYears} years with Plus.</div>
          <button onClick={() => openPaywall("Wealth projections")} style={{ border: "none", borderRadius: 22, background: INK, color: "#fff", fontFamily: F_UI, fontSize: 13.5, fontWeight: 600, cursor: "pointer", padding: "11px 22px", boxShadow: "0 12px 24px -10px rgba(20,38,61,.5)" }}>Unlock with Plus</button>
        </div>
      )}
      </div>

      <div style={{ ...glass(20, 18, 0.4), padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start", opacity: .9 }}>
        <Ico as={ShieldCheck} size={16} color="#158A62" style={{ marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: "rgba(20,38,61,.55)" }}>Projections use your assumptions and are shown in today's dollars (returns net of inflation). This is a planning estimate, not financial advice. A future release adds CPF Life modelling and saved scenarios.</p>
      </div>
    </div>
  );

  /* ---- LEGACY SCREEN ---- */
  const CHECK_ITEMS = [
    { key: "will", label: "Will signed & witnessed" },
    { key: "cpfNom", label: "CPF nomination made" },
    { key: "insNom", label: "Insurance nominations current" },
    { key: "lpa", label: "LPA registered" },
  ];
  const checkTotal = visibleMembers.length * CHECK_ITEMS.length;
  const checkDone = visibleMembers.reduce((s, m) => s + CHECK_ITEMS.filter(it => (L.checklist[m.id] || {})[it.key]).length, 0);
  const readiness = checkTotal ? Math.round(checkDone / checkTotal * 100) : 0;
  const scheduleFor = (m) => {
    const rows = data.accounts.filter(a => a.owner === m.name || a.owner === JOINT);
    return { assets: rows.filter(a => a.type === "asset"), liabs: rows.filter(a => a.type === "liability") };
  };
  const passChip = (p) => <span style={{ ...mono(9, 700), letterSpacing: ".03em", padding: "2px 7px", borderRadius: 999, background: (PASS_COLORS[p] || "#94A7BE") + "1F", color: PASS_COLORS[p] || "#94A7BE", whiteSpace: "nowrap" }}>{p}</span>;

  const buildScheduleHTML = () => {
    const rowsHtml = members.map(m => {
      const { assets, liabs } = scheduleFor(m);
      const at = assets.reduce((s, a) => s + toSGD(a) * (a.owner === JOINT ? 0.5 : 1), 0);
      const lt = liabs.reduce((s, a) => s + toSGD(a) * (a.owner === JOINT ? 0.5 : 1), 0);
      const tr = (a) => `<tr><td>${a.name}${a.owner === JOINT ? " (joint, ½ share)" : ""}</td><td>${[a.sub, a.acctNumber ? "Acct: " + a.acctNumber : ""].filter(Boolean).join(" · ")}</td><td>${passesBy(a)}</td><td style="text-align:right">${(a.type === "liability" ? "−" : "") + fmt(toSGD(a) * (a.owner === JOINT ? 0.5 : 1))}</td></tr>`;
      return `<h2>${m.fullName || m.name}</h2>
        <table><thead><tr><th>Asset / Liability</th><th>Details</th><th>Passes by</th><th style="text-align:right">Est. value (SGD)</th></tr></thead>
        <tbody>${assets.map(tr).join("")}${liabs.map(tr).join("")}</tbody>
        <tfoot><tr><td colspan="3">Net estate-relevant position</td><td style="text-align:right"><b>${fmt(at - lt)}</b></td></tr></tfoot></table>`;
    }).join("");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Schedule of Assets — ${householdName}</title>
<style>body{font-family:Georgia,serif;color:#1a2433;max-width:800px;margin:40px auto;padding:0 24px;line-height:1.5}
h1{font-size:26px;border-bottom:2px solid #1a2433;padding-bottom:8px}h2{font-size:18px;margin-top:32px}
table{width:100%;border-collapse:collapse;font-size:13px}th,td{border-bottom:1px solid #ccd3dd;padding:7px 8px;text-align:left;vertical-align:top}
th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#5a6a80}tfoot td{border-top:2px solid #1a2433;border-bottom:none;font-size:14px}
.meta{color:#5a6a80;font-size:12px}.note{margin-top:28px;padding:14px;background:#f4f6f9;border-left:3px solid #0E7086;font-size:12px}
@media print{body{margin:12mm}}</style></head><body>
<h1>Schedule of Assets &amp; Liabilities</h1>
<p class="meta">${householdName} · prepared ${TODAY} · values are estimates in SGD · generated by Lume</p>
<p class="meta">Executor: ${L.executor || "—"} · Will location: ${L.willLocation || "—"} · Lawyer: ${L.lawyer || "—"}</p>
${rowsHtml}
<div class="note"><b>Important.</b> CPF savings pass by CPF nomination and do not form part of the estate. Jointly-held assets and joint-tenancy property pass by right of survivorship. Insurance policies with valid nominations pay nominees directly. This document is an organizational aid, not legal advice — review it with your solicitor when updating your will.</div>
</body></html>`;
  };
  const exportScheduleHTML = () => downloadBlob(buildScheduleHTML(), "text/html", `Schedule_of_Assets_${householdSlug}.html`);
  const exportScheduleCSV = () => {
    const lines = [["Member", "Type", "Group", "Name", "Account no.", "Details", "Passes by", "Est. value SGD"].join(",")];
    members.forEach(m => { const { assets, liabs } = scheduleFor(m); [...assets, ...liabs].forEach(a => {
      lines.push([m.name, a.type, a.group, `"${a.name}"`, `"${(a.acctNumber || "").replace(/"/g, "'")}"`, `"${(a.sub || "").replace(/"/g, "'")}"`, passesBy(a), Math.round(toSGD(a) * (a.owner === JOINT ? 0.5 : 1))].join(","));
    }); });
    downloadBlob(lines.join("\n"), "text/csv", `Schedule_of_Assets_${householdSlug}.csv`);
  };

  const LegacyScreen = () => (
    <div style={scrollScreen}>
      <Header over="Estate readiness" title="Legacy" back />
      <div style={{ ...heroGlass, borderRadius: 26, padding: 22, marginBottom: 14, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {ring(readiness, "#4FA37E", 104)}
          <div style={{ position: "absolute", textAlign: "center" }}><div style={{ ...mono(20) }}>{readiness}%</div><div style={{ fontSize: 9.5, color: "rgba(20,38,61,.5)" }}>ready</div></div>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Estate readiness</div>
          <div style={{ fontSize: 12, color: "rgba(20,38,61,.55)", lineHeight: 1.5, marginTop: 3 }}>{checkDone} of {checkTotal} steps done across {visibleMembers.length} members. Your Schedule of Assets updates itself as you track.</div>
        </div>
      </div>

      <div style={{ ...glass(24), padding: "17px 18px", marginBottom: 14 }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Checklist</div>
        {visibleMembers.map(m => (
          <div key={m.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: 12, background: m.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 10 }}>{m.initials}</div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</span>
            </div>
            {CHECK_ITEMS.map(it => { const on = !!(L.checklist[m.id] || {})[it.key]; return (
              <button key={it.key} onClick={() => toggleCheck(m.id, it.key)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "7px 2px", border: "none", background: "none", cursor: "pointer", fontFamily: F_UI, textAlign: "left" }}>
                <span style={{ width: 20, height: 20, borderRadius: 7, border: on ? "none" : "1.5px solid rgba(20,38,61,.25)", background: on ? "#4FA37E" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{on ? "✓" : ""}</span>
                <span style={{ fontSize: 13, color: on ? "rgba(20,38,61,.45)" : INK, textDecoration: on ? "line-through" : "none" }}>{it.label}</span>
              </button>
            ); })}
          </div>
        ))}
        <div style={{ fontSize: 11, color: "rgba(20,38,61,.45)", lineHeight: 1.5 }}>CPF nominations are made at cpf.gov.sg. LPAs are registered via the Office of the Public Guardian.</div>
      </div>

      <div style={{ ...glass(24), padding: "17px 18px", marginBottom: 14 }}>
        <div style={{ ...eyebrow, marginBottom: 10 }}>Key contacts & locations</div>
        <div style={{ marginBottom: 10 }}><label style={fieldLabel}>Executor</label><input defaultValue={L.executor} onBlur={(e) => setLegacy({ executor: e.target.value })} placeholder="e.g. spouse / sibling" style={field} /></div>
        <div style={{ marginBottom: 10 }}><label style={fieldLabel}>Will location</label><input defaultValue={L.willLocation} onBlur={(e) => setLegacy({ willLocation: e.target.value })} placeholder="e.g. Fireproof box + lawyer's office" style={field} /></div>
        <div><label style={fieldLabel}>Lawyer / will-writing service</label><input defaultValue={L.lawyer} onBlur={(e) => setLegacy({ lawyer: e.target.value })} placeholder="Firm & contact" style={field} /></div>
      </div>

      <div style={{ ...glass(24), padding: "8px 6px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 13px 5px" }}>
          <span style={eyebrow}>Document locker</span>
          <button onClick={() => saveDoc({ id: "d_" + uid(), name: "New document", where: "Where it's kept" })} style={{ display: "flex", alignItems: "center", gap: 5, border: "none", background: "none", color: ACCENT, fontFamily: F_UI, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}><Ico as={Plus} size={13} color={ACCENT} />Add</button>
        </div>
        {L.docs.map(d => (
          <div key={d.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 13px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input defaultValue={d.name} onBlur={(e) => saveDoc({ ...d, name: e.target.value })} style={{ ...field, padding: "6px 9px", fontSize: 13, fontWeight: 600, marginBottom: 4 }} />
              <input defaultValue={d.where} onBlur={(e) => saveDoc({ ...d, where: e.target.value })} style={{ ...field, padding: "6px 9px", fontSize: 12, color: "rgba(20,38,61,.65)" }} />
            </div>
            <button onClick={() => removeDoc(d.id)} style={{ border: "none", background: "none", cursor: "pointer", padding: 6, marginTop: 2 }}><Ico as={Trash2} size={14} color={NEG} /></button>
          </div>
        ))}
        <div style={{ fontSize: 11, color: "rgba(20,38,61,.45)", lineHeight: 1.5, padding: "4px 13px 10px" }}>Record where things are, not the contents. For crypto, note where recovery instructions are stored — never seed phrases.</div>
      </div>

      <div style={{ ...glass(24), padding: "8px 6px", marginBottom: 14 }}>
        <div style={{ ...eyebrow, padding: "11px 13px 8px" }}>Schedule of Assets · live</div>
        {visibleMembers.map(m => {
          const { assets, liabs } = scheduleFor(m);
          const net = assets.reduce((s, a) => s + toSGD(a) * (a.owner === JOINT ? 0.5 : 1), 0) - liabs.reduce((s, a) => s + toSGD(a) * (a.owner === JOINT ? 0.5 : 1), 0);
          return (
            <div key={m.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 12, background: m.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 10 }}>{m.initials}</div>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</span>
                </div>
                <span style={mono(12.5, 600)}>{privacy ? "••••" : fmt(net)}</span>
              </div>
              {[...assets, ...liabs].map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 13px 6px 45px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}{a.owner === JOINT ? " · ½" : ""}</div>
                  </div>
                  {passChip(passesBy(a))}
                  <span style={{ ...mono(11.5, 600), color: a.type === "liability" ? NEG : INK, minWidth: 64, textAlign: "right" }}>{privacy ? "••••" : (a.type === "liability" ? "−" : "") + fmtShort(toSGD(a) * (a.owner === JOINT ? 0.5 : 1))}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button onClick={() => isPremium ? exportScheduleHTML() : openPaywall("Schedule of Assets exports")} style={{ ...primaryBtnRow }}><Ico as={Download} size={15} color="#fff" /> Printable schedule{!isPremium && " · PLUS"}</button>
        <button onClick={() => isPremium ? exportScheduleCSV() : openPaywall("Schedule of Assets exports")} style={{ ...ghostBtnRow }}><Ico as={Download} size={15} color={INK} /> CSV</button>
      </div>

      <div style={{ ...glass(20, 18, 0.4), padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Ico as={ShieldCheck} size={16} color="#158A62" style={{ marginTop: 1 }} />
        <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: "rgba(20,38,61,.55)" }}>CPF passes by nomination, joint assets by survivorship — not through your will. Lume organizes; it doesn't draft wills or give legal advice. Review the exported schedule with your solicitor.</p>
      </div>
    </div>
  );

  const tabs = [{ label: "Home", k: "home", icon: Home }, { label: "Spend", k: "expenses", icon: Receipt }, { label: "Wealth", k: "wealth", icon: PieChart }, { label: "Plan", k: "plan", icon: TrendingUp }, { label: "Family", k: "household", icon: Users }];
  const Dock = () => (
    <div style={{ position: "absolute", left: 12, right: 12, bottom: 20, zIndex: 30, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-around", height: 62, borderRadius: 31, background: "rgba(255,255,255,.55)", backdropFilter: "blur(28px) saturate(1.9)", WebkitBackdropFilter: "blur(28px) saturate(1.9)", border: "1px solid rgba(255,255,255,.75)", boxShadow: "0 18px 38px -14px rgba(23,42,72,.4), inset 0 1px 0 rgba(255,255,255,.9)", padding: "0 4px" }}>
        {tabs.map((t) => { const on = screen === t.k; return (
          <button key={t.k} onClick={() => { setScreen(t.k); setSheet(null); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, border: "none", background: on ? "rgba(20,38,61,.08)" : "transparent", cursor: "pointer", padding: "7px 9px", borderRadius: 18, fontFamily: F_UI }}>
            <Ico as={t.icon} size={18} color={on ? INK : "rgba(20,38,61,.42)"} /><span style={{ fontSize: 9, fontWeight: 700, color: on ? INK : "rgba(20,38,61,.42)" }}>{t.label}</span>
          </button>
        ); })}
      </div>
      <button onClick={() => { setEditExpense("new"); setSheet("add"); }} style={{ width: 60, height: 60, borderRadius: 30, border: "none", cursor: "pointer", background: INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 34px -12px rgba(20,38,61,.55), inset 0 1px 0 rgba(255,255,255,.2)", flexShrink: 0 }}><Ico as={Plus} size={22} color="#fff" /></button>
    </div>
  );

  /* ---- SHARE SHEET ---- */
  const ShareSheet = () => (
    <SheetShell title="Share a chart" onClose={() => setSheet(null)}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[["Net worth", "nw"], ["Spending", "spend"], ["Allocation", "alloc"]].map(([label, k]) => { const on = shareChart === k; return <button key={k} onClick={() => setShareChart(k)} style={{ flex: 1, border: `1px solid ${on ? INK : "rgba(255,255,255,.85)"}`, borderRadius: 14, background: on ? INK : "rgba(255,255,255,.55)", color: on ? "#fff" : "rgba(20,38,61,.6)", fontFamily: F_UI, fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: "9px 4px" }}>{label}</button>; })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 190 }}><Seg items={["1M", "6M", "1Y", "All"]} value={shareTf} onChange={setShareTf} small /></div>
        <button onClick={() => setShareBlur(!shareBlur)} style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${shareBlur ? ACCENT : "rgba(20,38,61,.14)"}`, borderRadius: 999, background: shareBlur ? "rgba(14,112,134,.12)" : "rgba(255,255,255,.55)", color: shareBlur ? ACCENT : "rgba(20,38,61,.55)", fontFamily: F_UI, fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: "7px 12px", whiteSpace: "nowrap" }}><Ico as={EyeOff} size={13} color={shareBlur ? ACCENT : "rgba(20,38,61,.55)"} /> Hide amounts</button>
      </div>
      <div style={{ borderRadius: 24, padding: 20, background: "linear-gradient(150deg,#1B3A54 0%,#25546E 55%,#3A7A88 100%)", color: "#fff", boxShadow: "0 16px 34px -14px rgba(15,40,60,.55)", position: "relative", overflow: "hidden", marginBottom: 14 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 60% at 80% 0%,rgba(138,127,212,.35),transparent 60%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}><span style={{ ...eyebrow, color: "rgba(255,255,255,.6)" }}>{shareTitles[shareChart]}</span><span style={{ fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 16, height: 16, borderRadius: 5, background: "linear-gradient(135deg,#5DC4CB,#8A7FD4)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>L</span>Lume</span></div>
        <div style={{ ...mono(26), marginTop: 8, position: "relative" }}>{shareBlur ? shareBlurVals[shareChart] : shareVals[shareChart]}</div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.65)", marginTop: 2, position: "relative" }}>{shareBlur ? "Amounts hidden · percentages only" : shareSubs[shareChart]}</div>
        <svg width="100%" height="76" viewBox="0 0 330 76" preserveAspectRatio="none" style={{ display: "block", marginTop: 10, position: "relative" }}><path d={shareP.d} fill="none" stroke="#8FE0DE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={saveShareImage} style={{ flex: 1, height: 48, border: "none", borderRadius: 24, background: INK, color: "#fff", fontFamily: F_UI, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Ico as={ImageDown} size={16} color="#fff" />{saved ? "Saved to Photos ✓" : "Save image"}</button>
        <button style={{ flex: 1, height: 48, border: "1px solid rgba(20,38,61,.15)", borderRadius: 24, background: "rgba(255,255,255,.6)", color: INK, fontFamily: F_UI, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Ico as={LinkI} size={15} color={INK} />Copy link</button>
      </div>
    </SheetShell>
  );

  const screens = { signin: SignIn, home: HomeScreen, expenses: ExpensesScreen, wealth: WealthScreen, plan: PlanScreen, household: HouseholdScreen, legacy: LegacyScreen, settings: SettingsScreen };
  const acctReadOnly = editAccount && editAccount !== "new" && !canEditAccount(editAccount);
  const acctOwnerName = editAccount && editAccount !== "new" ? editAccount.owner : null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "radial-gradient(1000px 700px at 70% 20%,#1D2736 0%,#141A24 60%),#141A24", fontFamily: F_UI }}>
      <style>{`@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes sheetup{from{transform:translateY(100%)}to{transform:none}}@keyframes fadein{from{opacity:0}to{opacity:1}}.lume-phone ::-webkit-scrollbar{width:0;height:0}.lume-phone input::placeholder,.lume-phone textarea::placeholder{color:rgba(20,38,61,.35)}
      .lume-phone{position:relative;width:402px;height:840px;max-height:94vh;border-radius:44px;overflow:hidden;background:#E9EEF6;color:${INK};box-shadow:0 40px 90px -30px rgba(0,0,0,.7),0 0 0 10px #0c1119,0 0 0 11px rgba(255,255,255,.06)}
      @media (max-width:520px){body{margin:0}.lume-phone{width:100vw!important;height:100dvh!important;max-height:none!important;border-radius:0!important;box-shadow:none!important}}
      @media (min-width:521px) and (max-width:900px){.lume-phone{width:min(92vw,402px)}}`}</style>
      <div className="lume-phone">
        <div style={{ position: "absolute", inset: 0, background: AMBIENT, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 60% at 50% -10%,rgba(255,255,255,.55),transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", height: "100%" }}>
          {/* screens render as function calls (not components) so state updates
             don't remount the subtree — preserves scroll position and focus.
             key only changes on navigation, replaying the entrance animation. */}
          <div key={screen} style={{ height: "100%" }}>{screens[screen]()}</div>
          {screen !== "signin" && Dock()}
          {sheet === "share" && ShareSheet()}
          {sheet === "add" && <ExpenseSheet expense={editExpense} owners={ownerNames} meName={me?.name} data={data} onClose={() => { setSheet(null); setEditExpense(null); }} onSave={saveExpenseRecord} onDelete={deleteExpense} onAddCategory={addCategory} />}
          {sheet === "account" && <AccountSheet account={editAccount} owners={ownerNames} meName={me?.name} existingGroups={[...new Set(data.accounts.filter(a => a.type === "asset" && !GROUP_ORDER.includes(a.group)).map(a => a.group))]} readOnly={acctReadOnly} ownerLabel={acctOwnerName} onClose={() => { setSheet(null); setEditAccount(null); }} onSave={saveAccountRecord} onDelete={deleteAccount} />}
          {sheet === "paywall" && <PaywallSheet feature={paywallFeature} onClose={() => setSheet(null)} onUpgrade={upgrade} />}
          {sheet === "member" && <MemberSheet member={editMember} me={me} members={members} grants={data.grants || {}} onToggleGrant={toggleGrant} onClose={() => { setSheet(null); setEditMember(null); }} onSave={saveMember} onRemoveFromView={removeMemberFromView} onDeleteFully={deleteMemberFully} />}
        </div>
      </div>
      <canvas ref={shareCanvas} style={{ display: "none" }} />
    </div>
  );
}

/* ============================ SHEET SHELL ============================ */
function SheetShell({ title, onClose, children }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,30,45,.35)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", animation: "fadein .25s" }} />
      <div style={{ position: "relative", maxHeight: "88%", overflowY: "auto", borderRadius: "32px 32px 0 0", background: "rgba(248,250,253,.9)", backdropFilter: "blur(34px) saturate(1.9)", WebkitBackdropFilter: "blur(34px) saturate(1.9)", border: "1px solid rgba(255,255,255,.8)", boxShadow: "0 -20px 50px rgba(15,25,40,.3)", padding: "14px 20px 34px", animation: "sheetup .32s cubic-bezier(.22,.68,.32,1)" }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: "rgba(20,38,61,.15)", margin: "0 auto 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><span style={{ fontSize: 17, fontWeight: 700 }}>{title}</span><button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, border: "none", background: "rgba(20,38,61,.07)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico as={X} size={14} color="rgba(20,38,61,.55)" /></button></div>
        {children}
      </div>
    </div>
  );
}

/* ============================ EXPENSE SHEET ============================ */
function ExpenseSheet({ expense, data, owners, meName, onClose, onSave, onDelete, onAddCategory }) {
  const editing = expense && expense !== "new";
  const [name, setName] = useState(editing ? expense.name : "");
  const [amount, setAmount] = useState(editing ? String(expense.amount) : "");
  const [currency, setCurrency] = useState(editing ? expense.currency : "SGD");
  const catsOf = (d) => data.categories.filter(c => (c.kind || "out") === d);
  const [category, setCategory] = useState(editing ? expense.category : (catsOf(editing ? expense.dir : "out")[0]?.name || "Others"));
  const [owner, setOwner] = useState(editing ? expense.owner : (meName || owners[0]));
  const [notes, setNotes] = useState(editing ? expense.notes : "");
  const [dir, setDir] = useState(editing ? expense.dir : "out");
  const [rec, setRec] = useState(editing ? !!expense.recurring : false);
  const [interval, setInterval] = useState(editing && expense.recurring ? expense.recurring.interval : "monthly");
  const [every, setEvery] = useState(editing && expense.recurring ? String(expense.recurring.every) : "1");
  const [endDate, setEndDate] = useState(editing && expense.recurring ? expense.recurring.endDate : "");
  const [addingCat, setAddingCat] = useState(false);
  const [newCat, setNewCat] = useState(""); const [newColor, setNewColor] = useState(SWATCHES[0]);

  const submit = () => {
    const rc = { id: editing ? expense.id : uid(), name: name || category, category, amount: parseFloat(amount) || 0, currency, owner, notes, dir, date: editing ? expense.date : TODAY, fxManual: editing ? expense.fxManual : undefined, recurring: rec ? { interval, every: parseInt(every) || 1, endDate } : null };
    onSave(rc);
  };
  const commitCat = () => { if (newCat.trim()) { onAddCategory(newCat.trim(), newColor, dir); setCategory(newCat.trim()); } setAddingCat(false); setNewCat(""); };

  return (
    <SheetShell title={editing ? (expense.dir === "in" ? "Edit income" : "Edit expense") : "Log a transaction"} onClose={onClose}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <div style={{ flex: 1 }}><Seg items={["Money out", "Money in"]} value={dir === "out" ? "Money out" : "Money in"} onChange={(v) => { const d = v === "Money out" ? "out" : "in"; setDir(d); const list = catsOf(d); if (!list.some(c => c.name === category)) setCategory(list[0]?.name || ""); }} small /></div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 3, background: "rgba(20,38,61,.06)", borderRadius: 999, padding: 3 }}>
          {["SGD", "MYR", "USD"].map((k) => { const on = currency === k; return <button key={k} onClick={() => setCurrency(k)} style={{ border: "none", cursor: "pointer", padding: "7px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, fontFamily: F_MONO, background: on ? "#fff" : "transparent", color: on ? INK : "rgba(20,38,61,.5)", boxShadow: on ? "0 2px 6px rgba(23,42,72,.18)" : "none" }}>{k}</button>; })}
        </div>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0.00" style={{ flex: 1, border: "none", background: "none", textAlign: "right", ...mono(22), color: INK, outline: "none", width: "100%" }} />
      </div>
      <div style={{ marginBottom: 12 }}><label style={fieldLabel}>Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder={dir === "in" ? "e.g. June salary, SGX dividend" : "e.g. NTUC FairPrice"} style={field} /></div>
      <div style={{ marginBottom: 12 }}>
        <label style={fieldLabel}>Category</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {catsOf(dir).map((c) => { const on = category === c.name; return <button key={c.name} onClick={() => setCategory(c.name)} style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${on ? INK : "rgba(255,255,255,.8)"}`, borderRadius: 999, background: on ? INK : "rgba(255,255,255,.55)", color: on ? "#fff" : "rgba(20,38,61,.65)", fontFamily: F_UI, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: "7px 12px", whiteSpace: "nowrap" }}><span style={{ width: 8, height: 8, borderRadius: 4, background: c.color }} />{c.name}</button>; })}
          <button onClick={() => setAddingCat(!addingCat)} style={{ display: "flex", alignItems: "center", gap: 5, border: "1px dashed rgba(20,38,61,.3)", borderRadius: 999, background: "none", color: ACCENT, fontFamily: F_UI, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: "7px 12px" }}><Ico as={Plus} size={12} color={ACCENT} />New</button>
        </div>
        {addingCat && (
          <div style={{ marginTop: 10, padding: 12, borderRadius: 14, background: "rgba(255,255,255,.5)", border: "1px solid rgba(255,255,255,.7)" }}>
            <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Category name" style={{ ...field, marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
              {SWATCHES.map((s) => <button key={s} onClick={() => setNewColor(s)} style={{ width: 26, height: 26, borderRadius: 8, background: s, border: newColor === s ? "2px solid #14263D" : "2px solid transparent", cursor: "pointer" }} />)}
            </div>
            <button onClick={commitCat} style={{ ...primaryBtn, height: 40, fontSize: 13 }}>Add {dir === "in" ? "income" : "expense"} category</button>
          </div>
        )}
      </div>
      <div style={{ marginBottom: 12 }}><label style={fieldLabel}>Paid by</label><Chips items={owners} value={owner} onChange={setOwner} /></div>
      <div style={{ marginBottom: 14 }}><label style={fieldLabel}>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" style={{ ...field, minHeight: 52, resize: "vertical" }} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 16, background: "rgba(255,255,255,.45)", marginBottom: rec ? 10 : 14 }}>
        <Ico as={RefreshCw} size={17} color="rgba(20,38,61,.55)" />
        <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>Recurring</div><div style={{ fontSize: 11, color: "rgba(20,38,61,.5)", marginTop: 1 }}>Repeat automatically at a set interval</div></div>
        <Toggle on={rec} onClick={() => setRec(!rec)} />
      </div>
      {rec && (
        <div style={{ padding: 12, borderRadius: 14, background: "rgba(255,255,255,.45)", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}><label style={fieldLabel}>Every</label><input value={every} onChange={(e) => setEvery(e.target.value)} inputMode="numeric" style={field} /></div>
            <div style={{ flex: 2 }}><label style={fieldLabel}>Interval</label>
              <select value={interval} onChange={(e) => setInterval(e.target.value)} style={{ ...field, appearance: "none" }}>
                <option value="daily">day(s)</option><option value="weekly">week(s)</option><option value="monthly">month(s)</option><option value="yearly">year(s)</option>
              </select>
            </div>
          </div>
          <label style={fieldLabel}>Until (optional)</label><input value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="YYYY-MM · leave blank for no end" style={field} />
        </div>
      )}
      <button onClick={submit} style={primaryBtn}>{editing ? "Save changes" : dir === "in" ? "Save income" : "Save expense"}</button>
      {editing && <button onClick={() => onDelete(expense.id)} style={{ ...ghostBtn, color: NEG, marginTop: 10 }}><Ico as={Trash2} size={15} color={NEG} /> Delete expense</button>}
    </SheetShell>
  );
}

/* ============================ ACCOUNT SHEET ============================ */
function AccountSheet({ account, owners, meName, existingGroups, readOnly, ownerLabel, onClose, onSave, onDelete }) {
  const editing = account && account !== "new";
  const [type, setType] = useState(editing ? account.type : "asset");
  const [group, setGroup] = useState(editing ? account.group : "Cash");
  const [customGroup, setCustomGroup] = useState("");
  const [name, setName] = useState(editing ? account.name : "");
  const [sub, setSub] = useState(editing ? account.sub : "");
  const [balance, setBalance] = useState(editing ? String(account.balance) : "");
  const [currency, setCurrency] = useState(editing ? account.currency : "SGD");
  const [owner, setOwner] = useState(editing ? account.owner : (meName || owners[0]));
  const [rate, setRate] = useState(editing ? account.rate : "");
  const [notes, setNotes] = useState(editing ? account.notes : "");
  const [acctNumber, setAcctNumber] = useState(editing ? (account.acctNumber || "") : "");
  const [holdingType, setHoldingType] = useState(editing ? (account.holdingType || "—") : "—");
  const [purchasePrice, setPurchasePrice] = useState(editing ? (account.purchasePrice || "") : "");
  const [loanAmount, setLoanAmount] = useState(editing ? (account.loanAmount || "") : "");
  const [loanTenorYrs, setLoanTenorYrs] = useState(editing ? (account.loanTenorYrs || "") : "");
  const [loanRatePct, setLoanRatePct] = useState(editing ? (account.loanRatePct || "") : "");

  const groupOptions = type === "liability" ? ["Liabilities"] : [...new Set([...GROUP_ORDER, ...(existingGroups || [])]), "Custom…"];
  const effectiveGroup = type === "liability" ? "Liabilities" : (group === "Custom…" ? (customGroup.trim() || "Other") : group);

  const submit = () => {
    const rc = { id: editing ? account.id : uid(), type, group: effectiveGroup, name: name || "Account", sub, balance: parseFloat(balance) || 0, currency, owner, rate, notes, holdingType: holdingType === "—" ? "" : holdingType, acctNumber, purchasePrice, loanAmount, loanTenorYrs, loanRatePct, linkedTo: editing ? account.linkedTo : undefined, badge: currency !== "SGD" ? currency : (editing ? account.badge : ""), history: editing ? account.history : undefined };
    onSave(rc);
  };
  const hist = editing && account.history ? account.history.map(h => h.balance) : null;
  const line = hist && hist.length > 1 ? buildPath(hist, 300, 60, 6, false) : null;

  return (
    <SheetShell title={readOnly ? "Details" : (editing ? "Edit asset / liability" : "Add asset / liability")} onClose={onClose}>
      {readOnly && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 14, background: "rgba(217,165,84,.12)", border: "1px solid rgba(217,165,84,.35)", marginBottom: 14 }}>
          <Ico as={Lock} size={16} color="#B07A20" style={{ marginTop: 1 }} />
          <div style={{ fontSize: 12, lineHeight: 1.45, color: "rgba(20,38,61,.7)" }}>This belongs to <b>{ownerLabel}</b>. You can view it, but only {ownerLabel} can change it unless they grant you edit access.</div>
        </div>
      )}
      <fieldset disabled={readOnly} style={{ border: "none", padding: 0, margin: 0, opacity: readOnly ? 0.6 : 1, pointerEvents: readOnly ? "none" : "auto" }}>
      <div style={{ marginBottom: 14 }}><Seg items={["asset", "liability"]} value={type} onChange={(v) => { setType(v); if (v === "liability") setGroup("Liabilities"); else setGroup("Cash"); }} /></div>
      {editing && line && (
        <div style={{ ...glass(16, 16, 0.4), padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ ...eyebrow, fontSize: 10 }}>History</span><span style={mono(12, 600)}>{fmt(toSGD({ balance: parseFloat(balance) || 0, currency }))}</span></div>
          <svg width="100%" height="60" viewBox="0 0 300 60" preserveAspectRatio="none"><path d={line.d} fill="none" stroke={type === "liability" ? NEG : ACCENT} strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
      )}
      {type === "asset" && (
        <div style={{ marginBottom: 12 }}>
          <label style={fieldLabel}>Group</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {groupOptions.map((g) => { const on = group === g; return <button key={g} onClick={() => setGroup(g)} style={{ border: `1px solid ${on ? INK : "rgba(255,255,255,.8)"}`, borderRadius: 999, background: on ? INK : "rgba(255,255,255,.55)", color: on ? "#fff" : "rgba(20,38,61,.65)", fontFamily: F_UI, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: "7px 12px" }}>{g}</button>; })}
          </div>
          {group === "Custom…" && <input value={customGroup} onChange={(e) => setCustomGroup(e.target.value)} placeholder="New group name" style={{ ...field, marginTop: 10 }} />}
        </div>
      )}
      <div style={{ marginBottom: 12 }}><label style={fieldLabel}>Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder={type === "liability" ? "e.g. Car loan" : "e.g. DBS Multiplier"} style={field} /></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}><label style={fieldLabel}>Balance</label>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ display: "flex", gap: 2, background: "rgba(20,38,61,.06)", borderRadius: 10, padding: 2 }}>
              {["SGD", "MYR", "USD"].map((k) => { const on = currency === k; return <button key={k} onClick={() => setCurrency(k)} style={{ border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 8, fontSize: 10.5, fontWeight: 700, fontFamily: F_MONO, background: on ? "#fff" : "transparent", color: on ? INK : "rgba(20,38,61,.5)" }}>{k}</button>; })}
            </div>
            <input value={balance} onChange={(e) => setBalance(e.target.value)} inputMode="decimal" placeholder="0" style={{ ...field, ...mono(15, 600) }} />
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}><label style={fieldLabel}>Owner</label><Chips items={owners} value={owner} onChange={setOwner} /></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1 }}><label style={fieldLabel}>Sub-label</label><input value={sub} onChange={(e) => setSub(e.target.value)} placeholder="e.g. 2.5% p.a." style={field} /></div>
        <div style={{ width: 96 }}><label style={fieldLabel}>Growth %</label><input value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. 4" style={field} /></div>
      </div>
      <div style={{ fontSize: 10.5, color: "rgba(20,38,61,.45)", margin: "-6px 0 12px", lineHeight: 1.45 }}>Growth % is optional: leave blank to use the asset-class assumption in Plan, or set this asset's own expected growth (e.g. CPF SA 4.08).</div>
      {effectiveGroup === "Property" && (
        <div style={{ marginBottom: 12 }}>
          <label style={fieldLabel}>Manner of holding <span style={{ textTransform: "none", letterSpacing: 0 }}>(affects how it passes on death)</span></label>
          <Chips items={["—", "Sole", "Joint tenancy", "Tenancy-in-common"]} value={holdingType} onChange={setHoldingType} />
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <div style={{ flex: 1 }}><label style={fieldLabel}>Purchase price</label><input value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} inputMode="numeric" placeholder="e.g. 1698000" style={field} /></div>
            <div style={{ flex: 1 }}><label style={fieldLabel}>Loan quantum</label><input value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} inputMode="numeric" placeholder="outstanding" style={field} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <div style={{ flex: 1 }}><label style={fieldLabel}>Loan tenure (yrs)</label><input value={loanTenorYrs} onChange={(e) => setLoanTenorYrs(e.target.value)} inputMode="numeric" placeholder="e.g. 30" style={field} /></div>
            <div style={{ flex: 1 }}><label style={fieldLabel}>Interest %</label><input value={loanRatePct} onChange={(e) => setLoanRatePct(e.target.value)} inputMode="decimal" placeholder="e.g. 3.5" style={field} /></div>
          </div>
          <div style={{ fontSize: 10.5, color: "rgba(20,38,61,.45)", marginTop: 6, lineHeight: 1.45 }}>A loan quantum automatically creates and updates a linked mortgage under Liabilities. Purchase price & loan terms preload the property calculator in Plan.</div>
        </div>
      )}
      <div style={{ marginBottom: 14 }}><label style={fieldLabel}>Account number <span style={{ textTransform: "none", letterSpacing: 0, color: "rgba(20,38,61,.4)" }}>(optional)</span></label><input value={acctNumber} onChange={(e) => setAcctNumber(e.target.value)} placeholder="e.g. ****4821 or policy no." style={field} /><div style={{ fontSize: 10.5, color: "rgba(20,38,61,.45)", marginTop: 4, lineHeight: 1.45 }}>Appears on your Schedule of Assets to help your executor locate it. Tip: store only the last few digits.</div></div>
      <div style={{ marginBottom: 14 }}><label style={fieldLabel}>Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" style={{ ...field, minHeight: 48, resize: "vertical" }} /></div>
      {currency !== "SGD" && <div style={{ fontSize: 11, color: "rgba(20,38,61,.5)", marginBottom: 12, fontFamily: F_MONO }}>≈ {fmt((parseFloat(balance) || 0) * FX[currency])} at rate {FX[currency]}</div>}
      </fieldset>
      {readOnly ? (
        <button onClick={onClose} style={{ ...primaryBtn, background: ACCENT }}>Request edit access</button>
      ) : (
        <>
          <button onClick={submit} style={primaryBtn}>{editing ? "Save changes" : "Add"}</button>
          {editing && <button onClick={() => onDelete(account.id)} style={{ ...ghostBtn, color: NEG, marginTop: 10 }}><Ico as={Trash2} size={15} color={NEG} /> Delete</button>}
        </>
      )}
    </SheetShell>
  );
}

const primaryBtn = { width: "100%", height: 50, border: "none", borderRadius: 25, background: INK, color: "#fff", fontFamily: F_UI, fontSize: 15, fontWeight: 600, cursor: "pointer" };
const ghostBtn = { width: "100%", height: 46, border: "1px solid rgba(20,38,61,.14)", borderRadius: 23, background: "rgba(255,255,255,.5)", fontFamily: F_UI, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 };

/* ============================ MEMBER SHEET ============================ */
function MemberSheet({ member, me, members, grants, onToggleGrant, onClose, onSave, onRemoveFromView, onDeleteFully }) {
  const adding = member === "new";
  const isMe = !adding && member.id === me.id;
  const canEditProfile = adding || isMe || me.role === "owner"; // owners manage the household; everyone manages self
  const [name, setName] = useState(adding ? "" : (member.fullName || member.name));
  const [role, setRole] = useState(adding ? "editor" : member.role);

  const initials = (name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2) || "?").toUpperCase();
  const soleOwner = !adding && member.role === "owner" && members.filter(m => m.role === "owner").length === 1;
  const submit = () => {
    const finalRole = soleOwner ? "owner" : role; // household must keep at least one owner
    if (adding) {
      const idx = members.length % GRADIENTS._palette.length;
      onSave({ id: "m_" + uid(), name: name.trim().split(/\s+/)[0] || "Member", fullName: name.trim() || "Member", initials, gradient: GRADIENTS._palette[idx], color: MEMBER_COLOR._palette[idx], role: finalRole, joined: "Just now" });
    } else {
      onSave({ ...member, name: name.trim().split(/\s+/)[0] || member.name, fullName: name.trim(), role: finalRole });
    }
  };

  const otherMembers = members.filter(m => m.id !== (adding ? "" : member.id));
  const myGrantList = !adding ? (grants[member.id] || []) : []; // who member allows to edit member's data

  return (
    <SheetShell title={adding ? "Add member" : (isMe ? "Your profile" : (member.fullName || member.name))} onClose={onClose}>
      {!adding && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: member.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>{member.initials}</div>
          <div><div style={{ fontSize: 16, fontWeight: 700 }}>{member.fullName || member.name}</div><div style={{ fontSize: 12, color: "rgba(20,38,61,.5)", fontFamily: F_MONO }}>{member.role} · joined {member.joined || "—"}</div></div>
        </div>
      )}

      {canEditProfile ? (
        <>
          <div style={{ marginBottom: 12 }}><label style={fieldLabel}>Full name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder={"e.g. " + (me?.fullName || me?.name || "full name")} style={field} /></div>
          <div style={{ marginBottom: 16 }}><label style={fieldLabel}>Role</label><Seg items={["owner", "editor"]} value={soleOwner ? "owner" : role} onChange={setRole} small /><div style={{ fontSize: 11, color: "rgba(20,38,61,.45)", marginTop: 6 }}>{soleOwner ? "You're the only owner — assign another owner before changing your role." : "Owners manage the household & members. Editors manage their own accounts."}</div></div>
          <button onClick={submit} style={primaryBtn}>{adding ? "Add to household" : "Save profile"}</button>
        </>
      ) : (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 14, background: "rgba(20,38,61,.05)", marginBottom: 14 }}>
          <Ico as={Lock} size={16} color="rgba(20,38,61,.5)" style={{ marginTop: 1 }} />
          <div style={{ fontSize: 12, lineHeight: 1.45, color: "rgba(20,38,61,.65)" }}>Only {member.name} can change their own profile. You control what's visible in your view below.</div>
        </div>
      )}

      {/* Permission controls */}
      {isMe && otherMembers.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ ...eyebrow, marginBottom: 8 }}>Who can edit your assets & liabilities</div>
          {otherMembers.map((o) => { const on = myGrantList.includes(o.id); return (
            <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
              <div style={{ width: 30, height: 30, borderRadius: 15, background: o.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11 }}>{o.initials}</div>
              <div style={{ flex: 1, fontSize: 13.5 }}>{o.name}</div>
              <Toggle on={on} onClick={() => onToggleGrant(member.id, o.id)} />
            </div>
          ); })}
          <div style={{ fontSize: 11, color: "rgba(20,38,61,.45)", marginTop: 4 }}>Granting access lets them edit your assets, liabilities and expenses on your behalf.</div>
        </div>
      )}

      {!adding && !isMe && (
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14, background: "rgba(255,255,255,.5)" }}>
            <Ico as={grants[member.id]?.includes(me.id) ? ShieldCheck : Lock} size={16} color={grants[member.id]?.includes(me.id) ? POS : "rgba(20,38,61,.5)"} />
            <div style={{ flex: 1, fontSize: 12.5, color: "rgba(20,38,61,.7)" }}>{grants[member.id]?.includes(me.id) ? "You have edit access to " + member.name + "'s entries" : "You have view-only access. Ask " + member.name + " to grant editing."}</div>
          </div>
          <button onClick={() => onRemoveFromView(member.id)} style={{ ...ghostBtn }}><Ico as={EyeOff} size={15} color={INK} /> Remove from my view</button>
          {me.role === "owner" && <button onClick={() => { if (confirm("Remove " + member.name + " from the household? Their accounts and balances will be removed too. This cannot be undone here.")) onDeleteFully(member.id); }} style={{ ...ghostBtn, color: NEG }}><Ico as={Trash2} size={15} color={NEG} /> Remove from household</button>}
        </div>
      )}
    </SheetShell>
  );
}

/* ============================ PAYWALL SHEET (placeholder checkout) ============================ */
function PaywallSheet({ feature, onClose, onUpgrade }) {
  const [plan, setPlan] = useState("annual");
  const perks = [
    "Wealth projections & FIRE planning",
    "Schedule of Assets exports (print & CSV)",
    "Unlimited household members",
    "Asset history & trends",
  ];
  return (
    <SheetShell title="Lume Plus" onClose={onClose}>
      <div style={{ fontSize: 13, color: "rgba(20,38,61,.65)", lineHeight: 1.5, marginBottom: 16 }}>
        <b style={{ color: INK }}>{feature}</b> is part of Lume Plus. Everything you track stays free — Plus unlocks the tools that look ahead.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {perks.map(p => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 20, height: 20, borderRadius: 10, background: "rgba(21,138,98,.14)", color: "#158A62", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: 13.5 }}>{p}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[
          { k: "monthly", title: "Monthly", price: "S$8.90", sub: "per month" },
          { k: "annual", title: "Annual", price: "S$79", sub: "per year · save 26%", best: true },
        ].map(pl => { const on = plan === pl.k; return (
          <button key={pl.k} onClick={() => setPlan(pl.k)} style={{ flex: 1, position: "relative", textAlign: "left", border: `1.5px solid ${on ? ACCENT : "rgba(20,38,61,.12)"}`, borderRadius: 18, background: on ? "rgba(14,112,134,.07)" : "rgba(255,255,255,.55)", cursor: "pointer", padding: "14px 14px 12px", fontFamily: F_UI }}>
            {pl.best && <span style={{ position: "absolute", top: -9, right: 10, ...mono(8.5, 700), letterSpacing: ".06em", padding: "3px 8px", borderRadius: 999, background: ACCENT, color: "#fff" }}>BEST VALUE</span>}
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>{pl.title}</div>
            <div style={{ ...mono(19), marginTop: 4 }}>{pl.price}</div>
            <div style={{ fontSize: 10.5, color: "rgba(20,38,61,.5)", marginTop: 1 }}>{pl.sub}</div>
          </button>
        ); })}
      </div>
      <button onClick={onUpgrade} style={primaryBtn}>Start 14-day free trial</button>
      <button onClick={onClose} style={{ ...ghostBtn, marginTop: 10 }}>Maybe later</button>
      <div style={{ fontSize: 10.5, color: "rgba(20,38,61,.45)", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
        Demo checkout — this button simply activates Plus locally.<br />Production: Stripe Checkout on web · StoreKit / Play Billing in the wrapped apps.
      </div>
    </SheetShell>
  );
}
