import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ExternalLink,
  Menu,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  banks,
  Card,
  eligibleCardGroups,
  getBankById,
  getCardById,
  getCardGroupById,
  getProgrammeById,
  getPublicRulesForCardGroup,
  getRewardCurrencyForCard,
  getRewardProductById,
  loyaltyProgrammes,
  searchCardsInBank,
  summaryCounters,
} from "@/data/milesCalculator";
import {
  calculateEntry,
  computePortfolioTotals,
  formatInt,
  parseIntSafe,
  ProgrammeTotal,
  RuleResult,
} from "@/lib/milesCalculator";
import {
  Cabin,
  CABINS,
  computeRequiredPoints,
  isTargetPublic,
  outboundPointsForParty,
  pointsPerPersonPerDirection,
  RedemptionTarget,
  redemptionTargets,
  Region,
  REGIONS,
  SUPPORTED_PROGRAMMES,
  verifiedCabinsPresent,
} from "@/data/redemptionTargets";
import { getActivePromotions, Promotion } from "@/data/promotions";
import { saveTripContext, TripContext } from "@/lib/tripContext";


const STRATEGY_URL = "/points-strategy";
const PRIORITY_PROGRAMMES = ["enrich", "krisflyer", "asia-miles"];

type UiState = "idle" | "calculated" | "stale" | "error";

interface UnknownCard {
  cardName: string;
  currency: string; // "TreatsPoints" | "Membership Rewards" | "UNIRM" | "TBP" | "CIMB Bonus Points" | "Other"
}

interface Entry {
  id: string;
  bankId: string;
  cardId: string;
  /** Derived from cardId; kept here so calculation and validation can read it directly. */
  cardGroupId: string;
  /** True when the user chose "I can't find my card". */
  notFound: boolean;
  unknown?: UnknownCard;
  nickname: string;
  showLabel: boolean;
  rawInput: string;
}

interface ExistingRow {
  id: string;
  programmeId: string;
  rawInput: string;
}

interface Snapshot {
  results: RuleResult[];
  portfolio: ProgrammeTotal[];
  entryContext: Map<string, { bankName: string; groupName: string; nickname: string; entered: number }>;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Math.random());

const newEntry = (): Entry => ({
  id: uid(),
  bankId: "",
  cardId: "",
  cardGroupId: "",
  notFound: false,
  nickname: "",
  showLabel: false,
  rawInput: "",
});

const track = (event: string, payload: Record<string, unknown> = {}) => {
  try {
    const w = window as unknown as {
      datafast?: (event: string, payload?: Record<string, unknown>) => void;
    };
    if (typeof w.datafast === "function") w.datafast(event, payload);
  } catch {
    /* no-op */
  }
};

export default function MilesCalculator() {
  useEffect(() => {
    document.title =
      "Malaysia Credit Card Points to Airline Miles Calculator | Samral";
    const desc =
      "Convert Malaysian credit card points into Enrich Points, KrisFlyer miles, Asia Miles, Avios and other airline rewards. See exact conversion blocks, usable points and leftover balances.";
    upsertMeta("description", desc);
    upsertLink("canonical", "https://www.samral.com/miles-calculator");
    upsertMetaProperty("og:title", "Malaysia Credit Card Points Calculator | Samral");
    upsertMetaProperty("og:description", desc);
    upsertMetaProperty("og:url", "https://www.samral.com/miles-calculator");
    upsertMetaProperty("og:type", "website");
    track("miles_calculator_viewed");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <CalculatorFlow />
      <Explainer />
      <Disclaimer />
      <Footer />
    </div>
  );
}

/* ---------- Head helpers ---------- */

function upsertMeta(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}
function upsertMetaProperty(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}
function upsertLink(rel: string, href: string) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

/* ---------- Nav ---------- */

function Nav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links = [
    { label: "Home", to: "/" },
    { label: "Miles Calculator", to: "/miles-calculator" },
    { label: "Cards Strategy", to: "/points-strategy" },
    { label: "About", to: "/about" },
  ];

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-6 md:px-12 md:py-8">
        <Link to="/" aria-label="Samral home" className="font-display text-2xl leading-none text-ink md:text-[26px]">
          Samral
        </Link>
        <nav className="hidden items-center gap-9 text-[13px] text-ink/80 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="transition-opacity hover:opacity-70">
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center text-ink md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-background text-ink md:hidden">
          <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-5 sm:px-6">
            <Link to="/" onClick={() => setOpen(false)} className="font-display text-2xl leading-none text-ink">
              Samral
            </Link>
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="inline-flex h-11 w-11 items-center justify-center">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-2 px-5 pt-6 sm:px-6">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="border-b border-border py-4 font-display text-2xl leading-tight text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  const counters = useMemo(() => summaryCounters(), []);
  return (
    <section className="border-b border-border bg-sand/60">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <p className="eyebrow text-ink/60">Updated for 2026</p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-6xl md:leading-[1.02]">
          Malaysia&rsquo;s Credit Card Points Calculator
        </h1>
        <p className="mt-6 max-w-[640px] text-[15px] leading-relaxed text-ink/75 md:text-lg">
          Enter your credit card point balances, add any existing airline or hotel balances, then see exactly what you can transfer — with full blocks, leftover points and verified sources.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => {
              document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-block rounded-sm bg-ink px-8 py-4 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
          >
            Start calculating
          </button>
          <p className="text-[13px] text-ink/60">
            Conversion data checked against official bank sources.
          </p>
        </div>
        <dl className="mt-12 grid grid-cols-2 gap-y-6 border-t border-border pt-8 md:grid-cols-4">
          <Counter label="Banks covered" value={counters.banks} />
          <Counter label="Card programmes" value={counters.cardProgrammes} />
          <Counter label="Travel partners" value={counters.partners} />
          <Counter label="Conversion routes" value={counters.routes} />
        </dl>
      </div>
    </section>
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dd className="font-display text-4xl text-ink md:text-5xl">{formatInt(value)}</dd>
      <dt className="mt-2 text-[12px] uppercase tracking-[0.16em] text-ink/60">{label}</dt>
    </div>
  );
}

/* ---------- Calculator flow (state machine) ---------- */

function CalculatorFlow() {
  const [entries, setEntries] = useState<Entry[]>([newEntry()]);
  const [existingRows, setExistingRows] = useState<ExistingRow[]>([]);
  const [state, setState] = useState<UiState>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [startedTracked, setStartedTracked] = useState(false);

  const calcRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const markStarted = useCallback(() => {
    if (!startedTracked) {
      track("calculator_started");
      setStartedTracked(true);
    }
  }, [startedTracked]);

  const mutateEntries = useCallback((fn: (prev: Entry[]) => Entry[]) => {
    setEntries((prev) => fn(prev));
    if (snapshot) setState("stale");
    markStarted();
  }, [snapshot, markStarted]);

  const mutateExisting = useCallback((fn: (prev: ExistingRow[]) => ExistingRow[]) => {
    setExistingRows((prev) => fn(prev));
    if (snapshot) setState("stale");
    markStarted();
  }, [snapshot, markStarted]);

  const handleCalculate = () => {
    // Validate
    const errs: string[] = [];
    const usableEntries = entries.filter((e) => e.bankId || e.cardId || e.rawInput.trim());

    if (usableEntries.length === 0) {
      errs.push("Add at least one bank balance to calculate.");
    }
    for (const e of usableEntries) {
      if (!e.bankId) errs.push("Select a bank for every entry.");
      else if (e.notFound) errs.push("We need to verify your unlisted card before calculating. Submit it for verification or pick another card.");
      else if (!e.cardId) errs.push("Select the exact credit card for every entry.");
      const pts = parseIntSafe(e.rawInput);
      if (!Number.isFinite(pts) || pts <= 0) errs.push("Enter a valid points balance greater than zero.");
    }
    for (const r of existingRows) {
      if (!r.programmeId) errs.push("Choose a programme for every existing balance.");
      const pts = parseIntSafe(r.rawInput);
      if (!Number.isFinite(pts) || pts <= 0) errs.push("Enter a valid existing balance greater than zero.");
    }

    const deduped = Array.from(new Set(errs));
    if (deduped.length > 0) {
      setErrors(deduped);
      setState("error");
      return;
    }
    setErrors([]);

    track(state === "stale" ? "recalculate_clicked" : "calculate_clicked", {
      entries: usableEntries.length,
      existing: existingRows.length,
    });

    setIsCalculating(true);

    setTimeout(() => {
      const results: RuleResult[] = [];
      const entryContext = new Map<string, { bankName: string; groupName: string; nickname: string; entered: number }>();
      for (const e of usableEntries) {
        const points = parseIntSafe(e.rawInput);
        const bank = getBankById(e.bankId);
        const group = eligibleCardGroups.find((g) => g.id === e.cardGroupId);
        entryContext.set(e.id, {
          bankName: bank?.name ?? "",
          groupName: group?.name ?? "",
          nickname: e.nickname,
          entered: points,
        });
        results.push(
          ...calculateEntry({
            entryId: e.id,
            cardGroupId: e.cardGroupId,
            nickname: e.nickname,
            bankPoints: points,
          }),
        );
      }
      const existingBalances: Record<string, number> = {};
      for (const r of existingRows) {
        const n = parseIntSafe(r.rawInput);
        if (Number.isFinite(n) && n > 0 && r.programmeId) existingBalances[r.programmeId] = n;
      }
      const portfolio = computePortfolioTotals(results, existingBalances);

      setSnapshot({ results, portfolio, entryContext });
      setState("calculated");
      setIsCalculating(false);
      track("calculation_completed", { programmes: portfolio.length });

      requestAnimationFrame(() => {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        resultRef.current?.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start",
        });
      });
    }, 350);
  };

  const scrollToCalculator = () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    calcRef.current?.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
    track("balances_edited");
  };

  const showResults = state === "calculated" || state === "stale";
  const buttonLabel = state === "stale" ? "Update Results" : "Calculate My Miles";

  return (
    <>
      <section id="calculator" ref={calcRef} className="border-b border-border">
        <div className="mx-auto max-w-[880px] px-5 py-16 sm:px-6 md:py-24">
          <div className="max-w-[640px]">
            <p className="eyebrow text-ink/60">Step 1</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">
              Your credit card balances
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              Add one card group per entry. You can add several from the same bank.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {entries.map((entry, idx) => (
              <EntryCard
                key={entry.id}
                index={idx}
                entry={entry}
                canRemove={entries.length > 1}
                onChange={(next) => mutateEntries((prev) => prev.map((e) => (e.id === entry.id ? next : e)))}
                onRemove={() => mutateEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                onFirstValid={() => track("bank_balance_added")}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              mutateEntries((prev) => [...prev, newEntry()]);
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-sm border border-ink/70 px-5 py-3 text-[13px] text-ink transition-colors hover:bg-ink hover:text-background"
          >
            <Plus className="h-4 w-4" /> Add another bank balance
          </button>

          <div className="mt-14 max-w-[640px]">
            <p className="eyebrow text-ink/60">Step 2 · optional</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">
              Existing airline or hotel balances
            </h2>
          </div>

          <ExistingBalancesPanel
            rows={existingRows}
            onAdd={(row) => {
              mutateExisting((prev) => [...prev, row]);
              track("existing_balance_added", { programme: row.programmeId });
            }}
            onRemove={(id) => mutateExisting((prev) => prev.filter((r) => r.id !== id))}
          />

          {/* Calculate action */}
          <div className="mt-14 border-t border-border pt-10">
            {state === "error" && errors.length > 0 && (
              <div role="alert" className="mb-6 rounded-sm border border-destructive/40 bg-destructive/5 p-4 text-[13px] text-ink">
                <p className="font-medium text-destructive">Please fix the following:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/80">
                  {errors.map((e) => <li key={e}>{e}</li>)}
                </ul>
              </div>
            )}
            {state === "stale" && (
              <div className="mb-6 rounded-sm border border-ink/30 bg-sand/50 p-4 text-[13px] text-ink/80">
                Your balances have changed. Update the results to recalculate.
              </div>
            )}
            <button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculating}
              className="inline-flex w-full items-center justify-center rounded-sm bg-ink px-8 py-5 text-base font-medium text-background transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 md:w-auto md:min-w-[320px]"
            >
              {isCalculating ? "Calculating full transfer blocks…" : buttonLabel}
            </button>
            <p className="mt-3 text-[12px] text-ink/55">
              We calculate locally in your browser. Nothing is sent to a server.
            </p>
          </div>
        </div>
      </section>

      {showResults && snapshot && (
        <div ref={resultRef}>
          <ResultsDashboard
            snapshot={snapshot}
            isStale={state === "stale"}
            onEdit={scrollToCalculator}
          />
          <StrategyCTA />
        </div>
      )}

      {showResults && <QuickReference />}
    </>
  );
}

/* ---------- Entry card ---------- */

const UNKNOWN_CURRENCIES = [
  "TreatsPoints",
  "Membership Rewards",
  "UNIRM",
  "Three-year Bonus Points (TBP)",
  "CIMB Bonus Points",
  "Other / not sure",
];

function EntryCard({
  entry, index, canRemove, onChange, onRemove, onFirstValid,
}: {
  entry: Entry;
  index: number;
  canRemove: boolean;
  onChange: (next: Entry) => void;
  onRemove: () => void;
  onFirstValid: () => void;
}) {
  const bank = entry.bankId ? getBankById(entry.bankId) : undefined;
  const card = entry.cardId ? getCardById(entry.cardId) : undefined;
  const currency = card ? getRewardCurrencyForCard(card) : undefined;
  const selectedGroup = card ? getCardGroupById(card.cardGroupId) : undefined;
  const rulesForSelected = card ? getPublicRulesForCardGroup(card.cardGroupId) : [];
  const hasNoRules = !!card && rulesForSelected.length === 0;
  const rateUnconfirmed = card?.status === "rate_unconfirmed" || hasNoRules;

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const matches = useMemo(() => {
    if (!entry.bankId) return [];
    return searchCardsInBank(entry.bankId, query).slice(0, 12);
  }, [entry.bankId, query]);

  const pointsValue = parseIntSafe(entry.rawInput);
  const pointsError = entry.rawInput && !Number.isFinite(pointsValue)
    ? "Enter whole numbers only (commas are fine)."
    : null;

  const validReported = useRef(false);
  useEffect(() => {
    if (!validReported.current && entry.cardId && !rateUnconfirmed && pointsValue > 0) {
      validReported.current = true;
      onFirstValid();
    }
  }, [entry.cardId, rateUnconfirmed, pointsValue, onFirstValid]);

  const currencyLabel = entry.notFound
    ? (entry.unknown?.currency && entry.unknown.currency !== "Other / not sure" ? entry.unknown.currency : "Points")
    : (currency?.currencyName ?? "Points");

  const pickCard = (c: Card) => {
    onChange({
      ...entry,
      cardId: c.id,
      cardGroupId: c.cardGroupId,
      notFound: false,
      unknown: undefined,
    });
    setQuery(c.name);
    setSearchOpen(false);
  };

  const clearCard = () => {
    onChange({ ...entry, cardId: "", cardGroupId: "", notFound: false, unknown: undefined });
    setQuery("");
    setSearchOpen(true);
  };

  return (
    <div className="rounded-sm border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50">
          {bank ? bank.name : `Balance ${String(index + 1).padStart(2, "0")}`}
        </p>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove balance"
            className="inline-flex h-9 items-center gap-1.5 rounded-sm px-2 text-[12px] text-ink/60 hover:text-ink"
          >
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Bank" htmlFor={`bank-${entry.id}`}>
          <select
            id={`bank-${entry.id}`}
            value={entry.bankId}
            onChange={(e) => {
              onChange({ ...entry, bankId: e.target.value, cardId: "", cardGroupId: "", notFound: false, unknown: undefined });
              setQuery("");
              setSearchOpen(false);
            }}
            className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="">Select bank</option>
            {banks.filter((b) => b.active).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Credit card" htmlFor={`card-${entry.id}`}>
          {card && !searchOpen ? (
            <div className="mt-2 flex items-center justify-between gap-3 rounded-sm border border-border bg-sand/40 px-3 py-2.5 text-sm text-ink">
              <span className="truncate">{card.name}</span>
              <button
                type="button"
                onClick={clearCard}
                className="shrink-0 text-[12px] text-ink/60 underline underline-offset-4 hover:text-ink"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                id={`card-${entry.id}`}
                type="text"
                autoComplete="off"
                placeholder={entry.bankId ? "Search by card name" : "Select bank first"}
                disabled={!entry.bankId}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none disabled:bg-muted"
              />
              {searchOpen && entry.bankId && (
                <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-sm border border-border bg-background shadow-md">
                  {matches.length === 0 && (
                    <p className="px-3 py-2 text-[13px] text-ink/60">No cards match that name.</p>
                  )}
                  {matches.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => pickCard(c)}
                      className="flex w-full items-center justify-between gap-3 border-b border-border/60 px-3 py-2 text-left text-[13px] text-ink hover:bg-sand/50"
                    >
                      <span className="truncate">{c.name}</span>
                      {c.status === "rate_unconfirmed" && (
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-ink/50">Rate to confirm</span>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ ...entry, cardId: "", cardGroupId: "", notFound: true, unknown: { cardName: query, currency: "" } });
                      setSearchOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink/80 hover:bg-sand/50"
                  >
                    <Plus className="h-3.5 w-3.5" /> I can’t find my card
                  </button>
                </div>
              )}
            </div>
          )}
          {(card || entry.notFound) && (
            <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-ink/55">
              Rewards currency:{" "}
              <span className="normal-case tracking-normal text-ink/80">
                {entry.notFound
                  ? (entry.unknown?.currency || "to be confirmed")
                  : (currency?.currencyName ?? "—")}
              </span>
            </p>
          )}
        </Field>

        <Field label={`${currencyLabel} balance`} htmlFor={`points-${entry.id}`}>
          <input
            id={`points-${entry.id}`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="e.g. 163,000"
            value={entry.rawInput}
            onChange={(e) => onChange({ ...entry, rawInput: e.target.value })}
            onBlur={() => {
              const n = parseIntSafe(entry.rawInput);
              if (Number.isFinite(n) && n > 0) onChange({ ...entry, rawInput: formatInt(n) });
            }}
            aria-invalid={!!pointsError}
            aria-describedby={pointsError ? `points-err-${entry.id}` : undefined}
            className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
          />
          {pointsError && (
            <p id={`points-err-${entry.id}`} className="mt-2 text-[12px] text-destructive">{pointsError}</p>
          )}
        </Field>
      </div>

      {entry.notFound && (
        <UnknownCardPanel
          value={entry.unknown ?? { cardName: query, currency: "" }}
          onChange={(u) => onChange({ ...entry, unknown: u })}
          onCancel={() => {
            onChange({ ...entry, notFound: false, unknown: undefined });
            setSearchOpen(true);
          }}
        />
      )}

      {rateUnconfirmed && card && (
        <div role="note" className="mt-3 rounded-sm border border-ink/30 bg-background p-3 text-[12px] leading-relaxed text-ink/80">
          <p className="font-medium text-ink">Current air-mile rate requires confirmation</p>
          <p className="mt-1">
            {selectedGroup?.unverifiedNotice ??
              "We cannot confirm a preferential UNIRM conversion rate for this card from the currently recorded official source. Check the Air Miles section in UOB TMRW, or select another UOB card you hold."}
          </p>
        </div>
      )}

      <div className="mt-4">
        {entry.showLabel || entry.nickname ? (
          <Field label="Label (optional)" htmlFor={`nickname-${entry.id}`}>
            <input
              id={`nickname-${entry.id}`}
              type="text"
              maxLength={60}
              placeholder="e.g. Mum's Maybank card"
              value={entry.nickname}
              onChange={(e) => onChange({ ...entry, nickname: e.target.value })}
              className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </Field>
        ) : (
          <button
            type="button"
            onClick={() => onChange({ ...entry, showLabel: true })}
            className="inline-flex items-center gap-1.5 text-[12px] text-ink/60 hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" /> Add a label
          </button>
        )}
      </div>
    </div>
  );
}

function UnknownCardPanel({
  value, onChange, onCancel,
}: {
  value: UnknownCard;
  onChange: (u: UnknownCard) => void;
  onCancel: () => void;
}) {
  const mailtoBody = encodeURIComponent(
    `Card name: ${value.cardName || "(unspecified)"}\nStatement currency: ${value.currency || "(unspecified)"}\n\nPlease verify the conversion entitlement for this card.`,
  );
  const canSubmit = value.cardName.trim().length > 1 && !!value.currency;
  return (
    <div className="mt-4 rounded-sm border border-ink/30 bg-sand/40 p-4 text-[12px] text-ink/80">
      <p className="font-medium text-ink">We need to confirm this card’s conversion entitlement before providing a definitive result.</p>
      <p className="mt-1 text-ink/65">Answer the two questions below so we can add your card to the database.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Exact name printed on the card" htmlFor="unknown-name">
          <input
            id="unknown-name"
            type="text"
            value={value.cardName}
            onChange={(e) => onChange({ ...value, cardName: e.target.value })}
            className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </Field>
        <Field label="Which currency does your statement show?" htmlFor="unknown-currency">
          <select
            id="unknown-currency"
            value={value.currency}
            onChange={(e) => onChange({ ...value, currency: e.target.value })}
            className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="">Select currency</option>
            {UNKNOWN_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={canSubmit ? `mailto:hello@samral.com?subject=${encodeURIComponent("Card verification: " + value.cardName)}&body=${mailtoBody}` : undefined}
          onClick={(e) => { if (!canSubmit) e.preventDefault(); }}
          className={`inline-flex items-center rounded-sm px-4 py-2 text-[13px] ${canSubmit ? "bg-ink text-background hover:-translate-y-0.5 transition-transform" : "cursor-not-allowed bg-ink/30 text-background/70"}`}
        >
          Submit card for verification
        </a>
        <button
          type="button"
          onClick={onCancel}
          className="text-[12px] text-ink/60 underline underline-offset-4 hover:text-ink"
        >
          Pick a different card
        </button>
      </div>
    </div>
  );
}


function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink/70">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ---------- Existing balances panel ---------- */

function ExistingBalancesPanel({
  rows, onAdd, onRemove,
}: {
  rows: ExistingRow[];
  onAdd: (row: ExistingRow) => void;
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [programmeId, setProgrammeId] = useState("");
  const [raw, setRaw] = useState("");

  const supported = useMemo(
    () => loyaltyProgrammes
      .filter((p) => p.active)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const usedIds = new Set(rows.map((r) => r.programmeId));

  const canAdd = programmeId && parseIntSafe(raw) > 0;

  const doAdd = () => {
    if (!canAdd) return;
    onAdd({ id: uid(), programmeId, rawInput: formatInt(parseIntSafe(raw)) });
    setProgrammeId("");
    setRaw("");
  };

  return (
    <div className="mt-6 rounded-sm border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span>
          <span className="font-display text-lg text-ink md:text-xl">
            Do you already have airline or hotel points?
          </span>
          <span className="mt-1 block text-[12px] text-ink/60">
            Optional. Include them to see your potential balance per programme.
          </span>
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-ink/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-border px-5 py-5">
          {rows.length > 0 && (
            <ul className="mb-5 flex flex-wrap gap-2">
              {rows.map((r) => {
                const prog = getProgrammeById(r.programmeId);
                return (
                  <li key={r.id} className="inline-flex items-center gap-2 rounded-sm border border-border bg-sand/40 px-3 py-2 text-[13px] text-ink">
                    <span className="font-medium">{prog?.name ?? "Programme"}</span>
                    <span className="text-ink/70">{r.rawInput}</span>
                    <button
                      type="button"
                      onClick={() => onRemove(r.id)}
                      aria-label={`Remove ${prog?.name ?? "balance"}`}
                      className="text-ink/50 hover:text-ink"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Programme" htmlFor="existing-prog">
              <select
                id="existing-prog"
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
                className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
              >
                <option value="">Select programme</option>
                {supported.map((p) => (
                  <option key={p.id} value={p.id} disabled={usedIds.has(p.id)}>
                    {p.name}{usedIds.has(p.id) ? " (added)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Balance" htmlFor="existing-bal">
              <input
                id="existing-bal"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 3,100"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                onBlur={() => {
                  const n = parseIntSafe(raw);
                  if (Number.isFinite(n) && n > 0) setRaw(formatInt(n));
                }}
                className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
              />
            </Field>
            <button
              type="button"
              onClick={doAdd}
              disabled={!canAdd}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-ink px-5 text-[13px] text-ink transition-colors hover:bg-ink hover:text-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Add balance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Results dashboard ---------- */

type GroupKey = "airline" | "travel" | "hotel";

function groupOf(type: string): GroupKey {
  if (type === "hotel_points") return "hotel";
  if (type === "other_travel_points" || type === "airline_points") return "travel";
  return "airline";
}

const GROUP_LABEL: Record<GroupKey, string> = {
  airline: "Airline programmes",
  travel: "Travel rewards",
  hotel: "Hotel programmes",
};

function ResultsDashboard({
  snapshot, isStale, onEdit,
}: {
  snapshot: Snapshot;
  isStale: boolean;
  onEdit: () => void;
}) {
  const { results, portfolio, entryContext } = snapshot;

  const grouped = useMemo(() => {
    const g: Record<GroupKey, ProgrammeTotal[]> = { airline: [], travel: [], hotel: [] };
    for (const p of portfolio) g[groupOf(p.programmeType)].push(p);
    (Object.keys(g) as GroupKey[]).forEach((k) => {
      g[k].sort((a, b) => {
        const ai = PRIORITY_PROGRAMMES.indexOf(a.programmeId);
        const bi = PRIORITY_PROGRAMMES.indexOf(b.programmeId);
        if (ai !== -1 || bi !== -1) {
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        }
        return a.programmeName.localeCompare(b.programmeName);
      });
    });
    return g;
  }, [portfolio]);

  const resultsByProgramme = useMemo(() => {
    const m = new Map<string, RuleResult[]>();
    for (const r of results) {
      const arr = m.get(r.programmeId) ?? [];
      arr.push(r);
      m.set(r.programmeId, arr);
    }
    return m;
  }, [results]);

  // Points remaining per entry (min across rules for that entry)
  const totalUsedByEntry = useMemo(() => {
    const perEntry = new Map<string, number>();
    for (const [id, ctx] of entryContext) perEntry.set(id, ctx.entered);
    for (const r of results) {
      const currentRemaining = perEntry.get(r.entryId) ?? (entryContext.get(r.entryId)?.entered ?? 0);
      const candidateRemaining = (entryContext.get(r.entryId)?.entered ?? 0) - r.bankPointsUsed;
      if (candidateRemaining < currentRemaining) perEntry.set(r.entryId, candidateRemaining);
    }
    return perEntry;
  }, [results, entryContext]);

  useEffect(() => {
    for (const p of portfolio) {
      track("programme_result_viewed", { programme: p.programmeId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="border-b border-border bg-sand/40">
      <div className="mx-auto max-w-[1100px] px-5 py-16 sm:px-6 md:px-12 md:py-20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-ink/60">Results</p>
            <h2 className="mt-2 font-display text-4xl text-ink md:text-5xl">
              Your travel power
            </h2>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink/70">
              What each loyalty programme balance would look like after transferring your bank points. Programmes are shown separately — different currencies aren&rsquo;t comparable.
            </p>
          </div>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-sm border border-ink/70 px-4 py-2.5 text-[13px] text-ink transition-colors hover:bg-ink hover:text-background"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit balances
          </button>
        </div>

        {isStale && (
          <div className="mt-6 rounded-sm border border-ink/30 bg-background p-4 text-[13px] text-ink/80">
            Your balances have changed. These results are out of date — update the results to recalculate.
          </div>
        )}

        <PromoBanner portfolio={portfolio} />

        {portfolio.length > 1 && (
          <div className="mt-6 rounded-sm border border-ink/30 bg-background p-4 text-[13px] leading-relaxed text-ink/80">
            Your bank points can be transferred into different loyalty programmes. The full balances shown are alternative transfer scenarios unless you choose to split your bank points between programmes.
          </div>
        )}

        {/* Programme balance cards */}
        <div className="mt-10 space-y-10">
          {(Object.keys(grouped) as GroupKey[]).map((k) =>
            grouped[k].length === 0 ? null : (
              <div key={k}>
                <h3 className="text-[11px] uppercase tracking-[0.18em] text-ink/55">{GROUP_LABEL[k]}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {grouped[k].map((p) => (
                    <ProgrammeBalanceCard
                      key={p.programmeId}
                      programme={p}
                      rowResults={resultsByProgramme.get(p.programmeId) ?? []}
                      entryContext={entryContext}
                    />
                  ))}
                </div>
              </div>
            ),
          )}
        </div>

        {/* Destination discovery */}
        <DestinationDiscovery portfolio={portfolio} />

        {/* Points remaining */}
        <PointsRemaining entryContext={entryContext} totalUsedByEntry={totalUsedByEntry} />
      </div>
    </section>
  );
}

/* ---------- Promotion banner ---------- */

function PromoBanner({ portfolio }: { portfolio: ProgrammeTotal[] }) {
  const active = useMemo(() => {
    const promos = getActivePromotions();
    const portfolioProgrammeIds = new Set(portfolio.map((p) => p.programmeId));
    return promos.filter((p) => portfolioProgrammeIds.has(p.programmeId));
  }, [portfolio]);

  useEffect(() => {
    for (const p of active) track("promotion_shown", { promotion: p.id });
  }, [active]);

  if (active.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      {active.map((p) => {
        const programme = loyaltyProgrammes.find((lp) => lp.id === p.programmeId);
        const bonusLabel = p.bonusType === "percentage"
          ? `${p.bonusPercentage ?? 0}% Bonus ${programme?.name ?? "Points"}`
          : `+${formatInt(p.bonusFixed ?? 0)} Bonus ${programme?.name ?? "Points"}`;
        return (
          <div
            key={p.id}
            role="status"
            className="rounded-sm border border-ink bg-background p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink">
                  <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Promotion currently active
                </p>
                <p className="mt-2 font-display text-2xl text-ink md:text-3xl">{bonusLabel}</p>
                <p className="mt-1 text-[13px] text-ink/70">
                  Valid until {formatDate(p.endDate)}. Eligible bank conversions receive an additional {" "}
                  {p.bonusType === "percentage" ? `${p.bonusPercentage}% ${programme?.name ?? ""}` : `${formatInt(p.bonusFixed ?? 0)} ${programme?.name ?? ""}`} after successful transfer.
                </p>
              </div>
              <a
                href={p.officialSource}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-[12px] text-ink underline underline-offset-4 hover:no-underline"
              >
                See terms <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Programme balance card ---------- */

function ProgrammeBalanceCard({
  programme, rowResults, entryContext,
}: {
  programme: ProgrammeTotal;
  rowResults: RuleResult[];
  entryContext: Snapshot["entryContext"];
}) {
  const [open, setOpen] = useState(false);

  // Breakdown by bank-side currency (never sum different currencies).
  const byCurrency = useMemo(() => {
    const m = new Map<string, { bankName: string; currency: string; used: number; remaining: number }>();
    for (const r of rowResults) {
      const key = `${r.bankName}::${r.rewardCurrencyName}`;
      const existing = m.get(key) ?? { bankName: r.bankName, currency: r.rewardCurrencyName, used: 0, remaining: 0 };
      existing.used += r.bankPointsUsed;
      m.set(key, existing);
    }
    // Remaining per entry uses the min across rules for that entry (points not used by best route).
    const perEntryRemaining = new Map<string, { bankName: string; currency: string; remaining: number }>();
    for (const [entryId, ctx] of entryContext) {
      const rs = rowResults.filter((r) => r.entryId === entryId);
      if (rs.length === 0) continue;
      const minRemaining = rs.reduce((min, r) => Math.min(min, r.bankPointsRemaining), ctx.entered);
      const currency = rs[0].rewardCurrencyName;
      perEntryRemaining.set(entryId, { bankName: rs[0].bankName, currency, remaining: minRemaining });
    }
    for (const { bankName, currency, remaining } of perEntryRemaining.values()) {
      const key = `${bankName}::${currency}`;
      const existing = m.get(key);
      if (existing) existing.remaining += remaining;
    }
    return Array.from(m.values());
  }, [rowResults, entryContext]);

  const hasPromo = programme.bonusTotal > 0;
  const activePromos = programme.activePromotionIds
    .map((id) => getActivePromotions().find((p) => p.id === id))
    .filter(Boolean) as Promotion[];

  return (
    <div className={`rounded-sm border bg-background p-6 ${hasPromo ? "border-ink" : "border-border"}`}>
      {hasPromo ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/55">Standard</p>
            <p className="mt-2 font-display text-3xl leading-none text-ink/70 md:text-[36px]">
              {formatInt(programme.potentialTotal)}
            </p>
            <p className="mt-2 text-[12px] text-ink/60">{programme.programmeName}</p>
          </div>
          <div className="sm:border-l sm:border-border sm:pl-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink">
              During current promotion
            </p>
            <p className="mt-2 font-display text-4xl leading-none text-ink md:text-[44px]">
              {formatInt(programme.promotionalTotal)}
            </p>
            <p className="mt-2 text-[12px] text-ink">
              +{formatInt(programme.bonusTotal)} bonus {programme.programmeName}
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink/55">Potential balance</p>
          <p className="mt-2 font-display text-4xl leading-none text-ink md:text-[44px]">
            {formatInt(programme.potentialTotal)}
          </p>
          <p className="mt-2 text-[13px] text-ink/70">{programme.programmeName}</p>
        </>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-y-2 border-t border-border pt-4 text-[12px]">
        <dt className="text-ink/55">Standard transfer</dt>
        <dd className="text-right text-ink">{formatInt(programme.transferredTotal)} {programme.programmeName}</dd>
        {hasPromo && (
          <>
            <dt className="text-ink">
              {activePromos[0]?.bonusType === "percentage" && activePromos[0]?.bonusPercentage
                ? `${activePromos[0].bonusPercentage}% bonus`
                : "Promotional bonus"}
            </dt>
            <dd className="text-right text-ink">+{formatInt(programme.bonusTotal)} {programme.programmeName}</dd>
          </>
        )}
        <dt className="text-ink/55">Existing balance</dt>
        <dd className="text-right text-ink">{formatInt(programme.existingBalance)} {programme.programmeName}</dd>
        {hasPromo && (
          <>
            <dt className="border-t border-border pt-2 font-medium text-ink">Final promotional balance</dt>
            <dd className="border-t border-border pt-2 text-right font-medium text-ink">
              {formatInt(programme.promotionalTotal)} {programme.programmeName}
            </dd>
          </>
        )}
      </dl>

      {hasPromo && activePromos[0] && (
        <p className="mt-3 text-[11px] leading-relaxed text-ink/60">
          Bonus from <span className="text-ink">{activePromos[0].name}</span> · valid until {formatDate(activePromos[0].endDate)}.
          {activePromos[0].postingTimeline ? " " + activePromos[0].postingTimeline : ""}
        </p>
      )}
      {!hasPromo && (
        <p className="mt-3 text-[11px] text-ink/50">No active transfer promotion for this programme.</p>
      )}


      {byCurrency.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/55">Bank points used &amp; remaining</p>
          <ul className="mt-2 space-y-1.5 text-[12px]">
            {byCurrency.map((c) => (
              <li key={c.bankName + c.currency} className="grid grid-cols-[1fr_auto_auto] gap-3">
                <span className="text-ink/70">{c.bankName} {c.currency}</span>
                <span className="text-ink">used {formatInt(c.used)}</span>
                <span className="text-ink/70">left {formatInt(c.remaining)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-ink/50">Bank point currencies are shown separately and are never summed.</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) track("result_programme_expanded", { programme: programme.programmeId });
        }}
        aria-expanded={open}
        className="mt-4 inline-flex items-center gap-1 text-[12px] text-ink underline underline-offset-4 hover:no-underline"
      >
        {open ? "Hide calculation" : "See calculation"}
      </button>

      {open && (
        <div className="mt-5 space-y-4 border-t border-border pt-5">
          <ProgrammeDetails p={programme} rowResults={rowResults} entryContext={entryContext} />
        </div>
      )}
    </div>
  );
}

function ProgrammeDetails({
  p, rowResults, entryContext,
}: {
  p: ProgrammeTotal;
  rowResults: RuleResult[];
  entryContext: Snapshot["entryContext"];
}) {
  const notesSeen = new Set<string>();
  return (
    <>
      {p.existingBalance > 0 && (
        <p className="text-[12px] text-ink/70">
          Includes an existing balance of {formatInt(p.existingBalance)} {p.programmeName}.
        </p>
      )}
      {rowResults.map((r) => {
        const ctx = entryContext.get(r.entryId);
        const showNote = r.notes && !notesSeen.has(r.notes);
        if (r.notes) notesSeen.add(r.notes);
        return (
          <div key={`${r.entryId}-${r.programmeId}`} className="rounded-sm border border-border bg-sand/30 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-base text-ink">
                {ctx?.nickname || `${r.bankName} — ${r.cardGroupName}`}
              </p>
              <p className="font-display text-lg text-ink">
                +{formatInt(r.partnerPointsReceived)}
              </p>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-[12px]">
              <dt className="text-ink/55">Bank points entered</dt>
              <dd className="text-right text-ink">{formatInt(r.bankPointsEntered)} {r.rewardCurrencyName}</dd>
              <dt className="text-ink/55">Conversion block</dt>
              <dd className="text-right text-ink">{formatInt(r.bankPointsPerBlock)} → {formatInt(r.partnerPointsPerBlock)}</dd>
              <dt className="text-ink/55">Full blocks</dt>
              <dd className="text-right text-ink">{formatInt(r.fullBlocks)}</dd>
              <dt className="text-ink/55">Points used</dt>
              <dd className="text-right text-ink">{formatInt(r.bankPointsUsed)}</dd>
              <dt className="text-ink/55">Points remaining</dt>
              <dd className="text-right text-ink">{formatInt(r.bankPointsRemaining)}</dd>
            </dl>
            {showNote && (
              <p className="mt-3 text-[11px] leading-relaxed text-ink/60">{r.notes}</p>
            )}
            <p className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-ink/55">
              <span>Last verified {formatDate(r.verifiedOn)}</span>
              <a
                href={r.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-ink hover:underline"
              >
                Official source <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        );
      })}
    </>
  );
}

/* ---------- Destination discovery ---------- */

function DestinationDiscovery({ portfolio }: { portfolio: ProgrammeTotal[] }) {
  const navigate = useNavigate();
  const balances = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of portfolio) m.set(p.programmeId, p.potentialTotal);
    return m;
  }, [portfolio]);

  const cabinsPresent = useMemo(() => verifiedCabinsPresent(), []);

  // Programme filter = intersection of programmes reachable from the user's
  // portfolio AND programmes with a completed redemption engine. Never a fixed
  // catalogue and never hard-coded to a single programme.
  const programmeOptions = useMemo(() => {
    const supported = new Set<string>(SUPPORTED_PROGRAMMES);
    const portfolioIds = new Set<string>(portfolio.map((p) => p.programmeId));
    // If the user hasn't entered any balances yet, show all supported engines
    // so the page still functions as a browse view.
    const source: string[] = portfolioIds.size > 0
      ? Array.from(portfolioIds).filter((id) => supported.has(id))
      : Array.from(supported);
    return source
      .map((id) => ({ id, name: loyaltyProgrammes.find((p) => p.id === id)?.name ?? id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [portfolio]);

  const [region, setRegion] = useState<Region | "">("");
  const [cabin, setCabin] = useState<Cabin | "">("");
  const [tripType, setTripType] = useState<"one_way" | "return">("return");
  const [travellers, setTravellers] = useState(1);
  const [programmeId, setProgrammeId] = useState<string>("");
  const [showAll, setShowAll] = useState(false);

  const emitFilter = useCallback((key: string, value: unknown) => {
    track("destination_filter_changed", { key, value });
  }, []);

  // Only targets whose programme is both supported AND reachable from the
  // user's portfolio (falls back to all supported when portfolio is empty).
  const eligibleProgrammes = useMemo(() => new Set(programmeOptions.map((o) => o.id)), [programmeOptions]);

  const targets = useMemo(() => {
    return redemptionTargets.filter((t) => {
      if (!isTargetPublic(t)) return false;
      if (!eligibleProgrammes.has(t.programmeId)) return false;
      if (region && t.region !== region) return false;
      if (cabin && t.cabin !== cabin) return false;
      if (programmeId && t.programmeId !== programmeId) return false;
      return true;
    });
  }, [region, cabin, programmeId, eligibleProgrammes]);

  interface Enriched {
    t: RedemptionTarget;
    required: number;              // full points needed for the selected trip type (party size included)
    perDirectionPerPerson: number; // useful for Enrich wording
    outboundPartyTotal: number;    // one-way for the whole party
    balance: number;
    delta: number;                 // balance - required (positive = unlocked)
    ratio: number;
  }

  const enriched: Enriched[] = useMemo(() => {
    return targets.map((t) => {
      const required = computeRequiredPoints(t, tripType, travellers);
      const balance = balances.get(t.programmeId) ?? 0;
      const delta = balance - required;
      const ratio = required > 0 ? balance / required : 0;
      const outboundPartyTotal = outboundPointsForParty(t, travellers);
      return {
        t,
        required,
        perDirectionPerPerson: pointsPerPersonPerDirection(t),
        outboundPartyTotal,
        balance,
        delta,
        ratio,
      };
    });
  }, [targets, tripType, travellers, balances]);

  // Ranking: threshold met > direct > larger remaining > smaller shortfall >
  // more recent verifiedOn. Then cap per programme so no single programme
  // dominates the "reach these now" band.
  const rankUnlocked = (a: Enriched, b: Enriched) => {
    if ((a.t.directOrConnecting === "direct") !== (b.t.directOrConnecting === "direct")) {
      return a.t.directOrConnecting === "direct" ? -1 : 1;
    }
    if (b.delta !== a.delta) return b.delta - a.delta;
    return b.t.verifiedOn.localeCompare(a.t.verifiedOn);
  };
  const rankAlmost = (a: Enriched, b: Enriched) => b.ratio - a.ratio || a.required - b.required;
  const rankFuture = (a: Enriched, b: Enriched) => a.required - b.required;

  const unlockedAll = enriched.filter((e) => e.delta >= 0).sort(rankUnlocked);
  const almostAll = enriched.filter((e) => e.delta < 0 && e.ratio >= 0.75).sort(rankAlmost);
  const futureAll = enriched.filter((e) => e.ratio < 0.75).sort(rankFuture);

  // Per-programme cap of 3 when "All programmes" is selected and the user
  // hasn't asked for the unfiltered view.
  const capPerProgramme = (list: Enriched[]) => {
    if (programmeId || showAll) return list;
    const counts = new Map<string, number>();
    const out: Enriched[] = [];
    for (const e of list) {
      const c = counts.get(e.t.programmeId) ?? 0;
      if (c >= 3) continue;
      counts.set(e.t.programmeId, c + 1);
      out.push(e);
    }
    return out;
  };
  const unlocked = capPerProgramme(unlockedAll);
  const almost = capPerProgramme(almostAll);
  const future = capPerProgramme(futureAll);
  const capped = !programmeId && !showAll &&
    (unlocked.length < unlockedAll.length || almost.length < almostAll.length || future.length < futureAll.length);

  useEffect(() => {
    if (unlocked.length > 0) {
      track("unlocked_destination_viewed", { count: unlocked.length });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked.length]);

  const availableCabins = CABINS.filter((c) => cabinsPresent.has(c));

  const handlePlan = (e: Enriched) => {
    const prog = loyaltyProgrammes.find((p) => p.id === e.t.programmeId);
    const ctx: TripContext = {
      origin: e.t.origin,
      destination: e.t.destination,
      destinationName: e.t.destinationName,
      cabin: e.t.cabin,
      tripType: e.t.returnBookingRequired ? "return" : tripType,
      travellers,
      loyaltyProgrammeId: e.t.programmeId,
      loyaltyProgrammeName: prog?.name ?? "",
      operatingAirline: e.t.operatingAirline,
      redemptionType: e.t.redemptionType,
      requiredPoints: e.required,
      potentialProgrammeBalance: e.balance,
      remainingAfterRedemption: Math.max(0, e.delta),
      verifiedOn: e.t.verifiedOn,
      createdAt: new Date().toISOString(),
    };
    saveTripContext(ctx);
    track("plan_trip_clicked", { destination: e.t.destination, cabin: e.t.cabin, programme: e.t.programmeId });
    navigate("/trip-planning");
  };

  const handleStrategy = (e: Enriched, event: "almost" | "future") => {
    track("points_strategy_clicked", {
      state: event, destination: e.t.destination, programme: e.t.programmeId,
    });
    navigate(STRATEGY_URL);
  };

  return (
    <section className="mt-16 border-t border-border pt-12">
      <div>
        <h2 className="font-display text-3xl text-ink md:text-4xl">
          Where can your points take you?
        </h2>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink/70">
          Verified redemption opportunities across the programmes your cards can reach. Programme balances shown are alternative transfer scenarios — the same bank points cannot become their full potential balance in more than one programme at the same time.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 grid gap-3 rounded-sm border border-border bg-background p-4 sm:grid-cols-2 md:grid-cols-5">
        <FilterField label="Region">
          <select
            value={region}
            onChange={(e) => { setRegion(e.target.value as Region | ""); emitFilter("region", e.target.value); }}
            className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-ink"
          >
            <option value="">All regions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </FilterField>

        {availableCabins.length > 0 && (
          <FilterField label="Cabin">
            <select
              value={cabin}
              onChange={(e) => { setCabin(e.target.value as Cabin | ""); emitFilter("cabin", e.target.value); }}
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-ink"
            >
              <option value="">All cabins</option>
              {availableCabins.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FilterField>
        )}

        <FilterField label="Trip type">
          <select
            value={tripType}
            onChange={(e) => { setTripType(e.target.value as "one_way" | "return"); emitFilter("tripType", e.target.value); }}
            className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-ink"
          >
            <option value="return">Return</option>
            <option value="one_way">One way</option>
          </select>
        </FilterField>

        <FilterField label="Travellers">
          <input
            type="number"
            min={1}
            max={9}
            value={travellers}
            onChange={(e) => {
              const n = Math.max(1, Math.min(9, Math.floor(Number(e.target.value) || 1)));
              setTravellers(n); emitFilter("travellers", n);
            }}
            className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-ink"
          />
        </FilterField>

        <FilterField label="Programme">
          <select
            value={programmeId}
            onChange={(e) => { setProgrammeId(e.target.value); setShowAll(false); emitFilter("programme", e.target.value); }}
            className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-ink"
          >
            <option value="">All programmes</option>
            {programmeOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </FilterField>
      </div>

      {/* Groups */}
      <div className="mt-10 space-y-12">
        <DestinationGroup
          title="You can reach these now"
          empty="No unlocked destinations yet. Adjust filters or add more balances."
          items={unlocked}
          state="unlocked"
          tripType={tripType}
          travellers={travellers}
          onPrimary={handlePlan}
          onSecondary={handleStrategy}
        />
        <DestinationGroup
          title="You’re close"
          empty="Nothing within 25% of a target right now."
          items={almost}
          state="almost"
          tripType={tripType}
          travellers={travellers}
          onPrimary={handlePlan}
          onSecondary={handleStrategy}
        />
        <DestinationGroup
          title="Future goals"
          empty="No further destinations to display."
          items={future}
          state="future"
          tripType={tripType}
          travellers={travellers}
          onPrimary={handlePlan}
          onSecondary={handleStrategy}
        />
        {capped && (
          <div>
            <button
              type="button"
              onClick={() => { setShowAll(true); track("destination_view_all_clicked"); }}
              className="inline-flex items-center rounded-sm border border-ink px-4 py-2 text-[13px] text-ink hover:bg-ink hover:text-background"
            >
              View all results
            </button>
            <p className="mt-2 text-[11px] text-ink/55">Showing up to three results per programme. Filter by programme or click above to see the full list.</p>
          </div>
        )}
      </div>

      <p className="mt-10 rounded-sm border border-border bg-background p-4 text-[12px] leading-relaxed text-ink/65">
        Award-seat availability has not been checked. Taxes, fees and airline surcharges apply on top of the points requirement. Enrich Saver is valid for round-trip bookings on Malaysia Airlines-operated flights only. KrisFlyer Saver uses the Singapore Airlines award chart effective 1 November 2025 for Singapore Airlines-operated itineraries. Asia Miles opportunities cover Cathay Pacific-operated flights only. Partner-airline awards on any programme require separate pricing and are not shown here.
      </p>
    </section>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-ink/60">{label}</p>
      {children}
    </div>
  );
}

interface EnrichedT {
  t: RedemptionTarget;
  required: number;
  perDirectionPerPerson: number;
  outboundPartyTotal: number;
  balance: number;
  delta: number;
  ratio: number;
  
}

function DestinationGroup({
  title, empty, items, state, tripType, travellers, onPrimary, onSecondary,
}: {
  title: string;
  empty: string;
  items: EnrichedT[];
  state: "unlocked" | "almost" | "future";
  tripType: "one_way" | "return";
  travellers: number;
  onPrimary: (e: EnrichedT) => void;
  onSecondary: (e: EnrichedT, state: "almost" | "future") => void;
}) {
  return (
    <div>
      <h3 className="font-display text-2xl text-ink md:text-3xl">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-[13px] text-ink/55">{empty}</p>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {items.map((e) => (
            <DestinationCard
              key={e.t.id + state}
              e={e}
              state={state}
              tripType={tripType}
              travellers={travellers}
              onPrimary={() => onPrimary(e)}
              onSecondary={() => state !== "unlocked" && onSecondary(e, state)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function itineraryLabel(t: RedemptionTarget): string {
  if (t.connectionAirports.length === 0) return `${t.origin} → ${t.destination}`;
  return `${t.origin} → ${t.connectionAirports.join(" → ")} → ${t.destination}`;
}

function connectionLabel(t: RedemptionTarget): string | null {
  if (t.connectionAirports.length === 0) return null;
  if (t.connectionAirports[0] === "SIN") return "Connecting via Singapore";
  if (t.connectionAirports[0] === "HKG") return "Connecting via Hong Kong";
  return `Connecting via ${t.connectionAirports.join(", ")}`;
}

function DestinationCard({
  e, state, tripType, travellers, onPrimary, onSecondary,
}: {
  e: EnrichedT;
  state: "unlocked" | "almost" | "future";
  tripType: "one_way" | "return";
  travellers: number;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const t = e.t;
  const shortfall = Math.max(0, -e.delta);
  const remaining = Math.max(0, e.delta);
  const isEnrich = t.programmeId === "enrich";
  const isNeedsReview = t.status === "needs_review";

  const badge = isNeedsReview
    ? { label: "Verification needed", cls: "border border-ink/40 text-ink/70" }
    : state === "unlocked" ? { label: "Points threshold met", cls: "bg-ink text-background" }
    : state === "almost" ? { label: "Almost there", cls: "border border-ink text-ink" }
    : { label: "Future goal", cls: "border border-ink/40 text-ink/70" };

  const primaryLabel = state === "unlocked" ? "Find My Best Redemption" : "Get My Points Strategy";
  const conn = connectionLabel(t);
  const tripLabel = tripType === "return" ? "return" : "one way";
  const tripLabelTitle = tripType === "return" ? "Return" : "One way";

  return (
    <article className="rounded-sm border border-border bg-background p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/55">
            {itineraryLabel(t)} · {t.country}
          </p>
          <h4 className="mt-1 font-display text-2xl text-ink md:text-3xl">{t.destinationName}</h4>
          <p className="mt-1 text-[13px] text-ink/70">
            {t.cabin} · {t.operatingAirline}
          </p>
          <p className="mt-0.5 text-[12px] text-ink/60">{t.awardType}</p>
          {conn && <p className="mt-1 text-[12px] text-ink/60">{conn}</p>}
        </div>
        <span className={`inline-flex shrink-0 items-center rounded-sm px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      {isNeedsReview ? (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-[13px] text-ink">Current points requirement needs verification.</p>
          <p className="mt-1 text-[12px] text-ink/60">We’ll confirm the live award chart before recommending a transfer.</p>
        </div>
      ) : isEnrich ? (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/55">
            {tripLabelTitle} · {formatInt(e.perDirectionPerPerson)} Enrich per person
          </p>
          <p className="mt-1 font-display text-3xl text-ink">
            {formatInt(e.required)} <span className="text-base text-ink/70">Enrich</span>
          </p>
          <p className="mt-1 text-[12px] text-ink/60">
            {travellers} traveller{travellers === 1 ? "" : "s"} · {tripLabel} · quoted per person, per direction
          </p>
        </div>
      ) : (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/55">
            Required for {travellers} traveller{travellers === 1 ? "" : "s"}, {tripLabel}
          </p>
          <p className="mt-1 font-display text-3xl text-ink">
            {formatInt(e.required)} <span className="text-base text-ink/70">{t.programmeName === "Cathay — Asia Miles" ? "Asia Miles" : t.programmeName}</span>
          </p>
          <p className="mt-1 text-[12px] text-ink/60">
            {formatInt(e.perDirectionPerPerson)} per person, one way
          </p>
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-y-1.5 text-[12px]">
        <dt className="text-ink/55">Your potential {t.programmeName === "Cathay — Asia Miles" ? "Asia Miles" : t.programmeName} balance</dt>
        <dd className="text-right text-ink">{formatInt(e.balance)}</dd>
        {!isNeedsReview && (
          state === "unlocked" ? (
            <>
              <dt className="text-ink/55">Remaining</dt>
              <dd className="text-right text-ink">{formatInt(remaining)}</dd>
            </>
          ) : (
            <>
              <dt className="text-ink/55">Shortfall</dt>
              <dd className="text-right text-ink">{formatInt(shortfall)}</dd>
            </>
          )
        )}
      </dl>

      {e.tripTypeMismatch && (
        <p className="mt-3 rounded-sm border border-ink/30 bg-sand/40 p-3 text-[11px] leading-relaxed text-ink/75">
          You selected one way, but {t.awardType} requires a return booking. The requirement above reflects the return itinerary.
        </p>
      )}

      <p className="mt-4 text-[11px] leading-relaxed text-ink/60">
        {isEnrich && "Malaysia Airlines-operated flight only. "}
        Award-seat availability has not been checked.
        {state === "almost" && ` You are ${formatInt(shortfall)} points away from this target.`}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={state === "unlocked" ? onPrimary : onSecondary}
          className="inline-flex items-center rounded-sm bg-ink px-5 py-2.5 text-[13px] text-background hover:-translate-y-0.5 transition-transform"
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            const next = !detailsOpen;
            setDetailsOpen(next);
            if (next) track("destination_details_opened", { destination: t.destination });
          }}
          className="text-[12px] text-ink underline underline-offset-4 hover:no-underline"
        >
          {detailsOpen ? "Hide details" : "See details"}
        </button>
      </div>

      {detailsOpen && (
        <div className="mt-4 border-t border-border pt-4 text-[12px] leading-relaxed text-ink/70">
          <dl className="grid grid-cols-2 gap-y-1.5">
            <dt className="text-ink/55">Operating airline</dt>
            <dd className="text-right text-ink">{t.operatingAirline}</dd>
            <dt className="text-ink/55">Award type</dt>
            <dd className="text-right text-ink">{t.awardType}</dd>
            <dt className="text-ink/55">Itinerary</dt>
            <dd className="text-right text-ink">{itineraryLabel(t)}</dd>
            <dt className="text-ink/55">Segments</dt>
            <dd className="text-right text-ink">{t.numberOfSegments} · {t.directOrConnecting}</dd>
            <dt className="text-ink/55">Trip basis</dt>
            <dd className="text-right text-ink">{tripLabelTitle}</dd>
            <dt className="text-ink/55">Travellers</dt>
            <dd className="text-right text-ink">{travellers}</dd>
            <dt className="text-ink/55">Verified</dt>
            <dd className="text-right text-ink">
              <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                {formatDate(t.verifiedOn)} <ExternalLink className="h-3 w-3" />
              </a>
            </dd>
            {t.effectiveFrom && (
              <>
                <dt className="text-ink/55">Chart effective from</dt>
                <dd className="text-right text-ink">{formatDate(t.effectiveFrom)}</dd>
              </>
            )}
          </dl>
          <p className="mt-3 text-[11px] text-ink/55">{t.taxesAndFeesNote}</p>
          {t.notes && <p className="mt-2 text-[11px] text-ink/55">{t.notes}</p>}
        </div>
      )}
    </article>
  );
}



/* ---------- Points remaining ---------- */

function PointsRemaining({
  entryContext, totalUsedByEntry,
}: {
  entryContext: Snapshot["entryContext"];
  totalUsedByEntry: Map<string, number>;
}) {
  const rows: { id: string; label: string; remaining: number; currency: string }[] = [];
  for (const [id, ctx] of entryContext) {
    const remaining = totalUsedByEntry.get(id) ?? ctx.entered;
    if (remaining <= 0) continue;
    rows.push({
      id,
      label: ctx.nickname || `${ctx.bankName} — ${ctx.groupName}`,
      remaining,
      currency: currencyForEntry(id, entryContext),
    });
  }
  if (rows.length === 0) return null;
  return (
    <div className="mt-12 rounded-sm border border-border bg-background p-6">
      <h3 className="font-display text-xl text-ink md:text-2xl">Points remaining in your bank accounts</h3>
      <p className="mt-2 text-[12px] text-ink/60">
        Left over after your best-utilised transfer. They stay in your account.
      </p>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {rows.map((r) => (
          <li key={r.id} className="flex items-baseline justify-between gap-4 py-3 text-[13px]">
            <span className="text-ink">{r.label}</span>
            <span className="font-display text-lg text-ink">{formatInt(r.remaining)} {r.currency}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function currencyForEntry(entryId: string, entryContext: Snapshot["entryContext"]): string {
  const ctx = entryContext.get(entryId);
  if (!ctx) return "points";
  const group = eligibleCardGroups.find((g) => g.name === ctx.groupName);
  const product = group ? getRewardProductById(group.rewardProductId) : undefined;
  return product?.rewardCurrencyName ?? "points";
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/* ---------- Quick reference (collapsed) ---------- */

function QuickReference() {
  const [open, setOpen] = useState(false);
  const [bankFilter, setBankFilter] = useState("");
  const [progFilter, setProgFilter] = useState("");

  const rows = useMemo(() => {
    return eligibleCardGroups.flatMap((cg) => {
      const product = getRewardProductById(cg.rewardProductId);
      const bank = product ? getBankById(product.bankId) : undefined;
      if (!bank || !product) return [];
      const rules = getPublicRulesForCardGroup(cg.id);
      return rules.map((r) => {
        const prog = getProgrammeById(r.loyaltyProgrammeId);
        return {
          key: r.id,
          bank: bank.name,
          bankId: bank.id,
          cardGroup: cg.name,
          rewardCurrency: product.rewardCurrencyName,
          programme: prog?.name ?? "",
          programmeId: prog?.id ?? "",
          bankPoints: r.bankPointsPerBlock,
          partnerPoints: r.partnerPointsPerBlock,
          effectiveFrom: r.effectiveFrom,
          verifiedOn: r.verifiedOn,
          sourceUrl: r.sourceUrl,
        };
      });
    }).filter((r) => (!bankFilter || r.bankId === bankFilter) && (!progFilter || r.programmeId === progFilter));
  }, [bankFilter, progFilter]);

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-6 md:px-12 md:py-14">
        <button
          type="button"
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) track("rates_directory_opened");
          }}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <span>
            <span className="font-display text-2xl text-ink md:text-3xl">Browse all Malaysian conversion rates</span>
            <span className="mt-1 block text-[12px] text-ink/60">
              Every verified transfer route currently in our database.
            </span>
          </span>
          <ChevronDown className={`h-5 w-5 shrink-0 text-ink/60 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        <div hidden={!open} className="mt-8">
          <div className="flex flex-wrap gap-4">
            <select value={bankFilter} onChange={(e) => setBankFilter(e.target.value)} className="rounded-sm border border-border bg-background px-3 py-2 text-sm">
              <option value="">All banks</option>
              {banks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select value={progFilter} onChange={(e) => setProgFilter(e.target.value)} className="rounded-sm border border-border bg-background px-3 py-2 text-sm">
              <option value="">All programmes</option>
              {loyaltyProgrammes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-[13px]">
              <caption className="sr-only">Malaysian credit card points to airline/hotel programme conversion rates</caption>
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.14em] text-ink/60">
                  <th scope="col" className="py-3 pr-4">Bank</th>
                  <th scope="col" className="py-3 pr-4">Card group</th>
                  <th scope="col" className="py-3 pr-4">Programme</th>
                  <th scope="col" className="py-3 pr-4 text-right">Bank points</th>
                  <th scope="col" className="py-3 pr-4 text-right">Partner points</th>
                  <th scope="col" className="py-3">Verified</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="border-b border-border/70 text-ink">
                    <td className="py-3 pr-4">{r.bank}</td>
                    <td className="py-3 pr-4">{r.cardGroup}</td>
                    <td className="py-3 pr-4">{r.programme}</td>
                    <td className="py-3 pr-4 text-right">{formatInt(r.bankPoints)}</td>
                    <td className="py-3 pr-4 text-right">{formatInt(r.partnerPoints)}</td>
                    <td className="py-3 text-ink/60">
                      <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                        {formatDate(r.verifiedOn)} <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-3 md:hidden">
            {rows.map((r) => (
              <div key={r.key} className="rounded-sm border border-border bg-background p-4 text-[13px]">
                <p className="font-display text-lg text-ink">{r.bank} → {r.programme}</p>
                <p className="mt-1 text-ink/70">{r.cardGroup}</p>
                <p className="mt-2 text-ink">
                  {formatInt(r.bankPoints)} {r.rewardCurrency} → {formatInt(r.partnerPoints)} {r.programme}
                </p>
                <p className="mt-2 text-[11px] text-ink/55">Verified {formatDate(r.verifiedOn)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Explainer ---------- */

function Explainer() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[860px] px-5 py-16 sm:px-6 md:py-24">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              How Malaysian credit card point conversions work
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink/75">
              Malaysian banks commonly require transfers in fixed blocks. If a transfer requires 20,000 bank points for every 1,000 airline points, a balance of 645,000 bank points does not convert into 32,250 miles. Only 640,000 points form complete blocks, producing 32,000 miles, while 5,000 points remain in the bank account.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              Why your exact card matters
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink/75">
              Customers of the same bank may receive different airline-mile conversion rates depending on the card or rewards programme they hold. Always choose your exact card group before calculating.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Strategy CTA ---------- */

function StrategyCTA() {
  return (
    <section className="border-b border-border bg-ink text-background">
      <div className="mx-auto max-w-[900px] px-5 py-16 text-center sm:px-6 md:py-24">
        <h2 className="font-display text-3xl leading-tight md:text-5xl">
          You know what your points can become. Now find out whether you are earning them efficiently.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-background/75">
          Get a personalised review of your cards, spending pattern and travel goals.
        </p>
        <Link
          to={STRATEGY_URL}
          onClick={() => track("strategy_cta_clicked")}
          className="mt-8 inline-block rounded-sm bg-background px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
        >
          Get My Points Strategy
        </Link>
      </div>
    </section>
  );
}

/* ---------- Disclaimer ---------- */

function Disclaimer() {
  return (
    <section className="border-b border-border bg-sand/40">
      <div className="mx-auto max-w-[900px] px-5 py-10 text-center text-[13px] leading-relaxed text-ink/70 sm:px-6">
        Rates and transfer rules may change without notice. Samral calculates results using the latest official information recorded in our database. Confirm the applicable rate in your bank&rsquo;s app or official rewards portal before transferring. Transfers are commonly irreversible.
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-6 md:px-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="font-display text-2xl text-ink">Samral</p>
            <p className="mt-3 max-w-xs text-[13px] text-ink/60">
              Points &amp; miles advisory for Malaysian card holders.
            </p>
          </div>
          <FooterCol title="Explore" items={[
            { label: "Home", to: "/" },
            { label: "Miles Calculator", to: "/miles-calculator" },
            { label: "Cards Strategy", to: "/points-strategy" },
            { label: "About", to: "/about" },
          ]} />
          <FooterCol title="Software" items={[{ label: "Our products", to: "/products" }]} />
          <FooterCol title="Legal" items={[
            { label: "Terms", to: "/terms" },
            { label: "Privacy", to: "/privacy" },
          ]} />
        </div>
        <p className="mt-12 border-t border-border pt-6 text-[12px] text-ink/50">
          © 2026 Samral — Points &amp; miles advisory
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-ink/60">{title}</p>
      <ul className="mt-3 space-y-2 text-[13px] text-ink/80">
        {items.map((i) => (
          <li key={i.to}><Link to={i.to} className="hover:text-ink">{i.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
