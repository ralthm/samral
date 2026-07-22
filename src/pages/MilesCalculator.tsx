import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
  eligibleCardGroups,
  getBankById,
  getCardGroupsByRewardProduct,
  getProgrammeById,
  getPublicRulesForCardGroup,
  getRewardProductById,
  getRewardProductsByBank,
  loyaltyProgrammes,
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

const STRATEGY_URL = "/points-strategy";
const PRIORITY_PROGRAMMES = ["enrich", "krisflyer", "asia-miles"];

type UiState = "idle" | "calculated" | "stale" | "error";

interface Entry {
  id: string;
  bankId: string;
  rewardProductId: string;
  cardGroupId: string;
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
  rewardProductId: "",
  cardGroupId: "",
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
    const usableEntries = entries.filter((e) => e.cardGroupId || e.rawInput.trim());

    if (usableEntries.length === 0) {
      errs.push("Add at least one bank balance to calculate.");
    }
    for (const e of usableEntries) {
      if (!e.bankId) errs.push("Select a bank for every entry.");
      else if (!e.cardGroupId) errs.push("Select a card group for every entry.");
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
  const bankProducts = entry.bankId ? getRewardProductsByBank(entry.bankId) : [];
  const product = entry.rewardProductId ? getRewardProductById(entry.rewardProductId) : undefined;
  const cardGroups = entry.rewardProductId ? getCardGroupsByRewardProduct(entry.rewardProductId) : [];
  const bank = entry.bankId ? getBankById(entry.bankId) : undefined;

  const pointsValue = parseIntSafe(entry.rawInput);
  const pointsError = entry.rawInput && !Number.isFinite(pointsValue)
    ? "Enter whole numbers only (commas are fine)."
    : null;

  const validReported = useRef(false);
  useEffect(() => {
    if (!validReported.current && entry.cardGroupId && pointsValue > 0) {
      validReported.current = true;
      onFirstValid();
    }
  }, [entry.cardGroupId, pointsValue, onFirstValid]);

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
            onChange={(e) => onChange({ ...entry, bankId: e.target.value, rewardProductId: "", cardGroupId: "" })}
            className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="">Select bank</option>
            {banks.filter((b) => b.active).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Card group / rewards programme" htmlFor={`product-${entry.id}`}>
          <select
            id={`product-${entry.id}`}
            value={entry.rewardProductId}
            onChange={(e) => {
              const productId = e.target.value;
              const groups = productId ? getCardGroupsByRewardProduct(productId) : [];
              const cardGroupId = groups.length === 1 ? groups[0].id : "";
              onChange({ ...entry, rewardProductId: productId, cardGroupId });
            }}
            disabled={!entry.bankId}
            className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none disabled:bg-muted"
          >
            <option value="">{entry.bankId ? "Select card group" : "Select bank first"}</option>
            {bankProducts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>

        {cardGroups.length > 1 && (
          <Field label="Specific eligible cards" htmlFor={`cardgroup-${entry.id}`}>
            <select
              id={`cardgroup-${entry.id}`}
              value={entry.cardGroupId}
              onChange={(e) => onChange({ ...entry, cardGroupId: e.target.value })}
              className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            >
              <option value="">Select card group</option>
              {cardGroups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label={`${product?.rewardCurrencyName ?? "Points"} balance`} htmlFor={`points-${entry.id}`}>
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

type TabKey = "airline" | "hotel" | "other";

function categorise(type: string): TabKey {
  if (type === "hotel_points") return "hotel";
  if (type === "other_travel_points") return "other";
  return "airline";
}

function sortProgrammes(items: ProgrammeTotal[]): ProgrammeTotal[] {
  return [...items].sort((a, b) => {
    const ai = PRIORITY_PROGRAMMES.indexOf(a.programmeId);
    const bi = PRIORITY_PROGRAMMES.indexOf(b.programmeId);
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    return a.programmeName.localeCompare(b.programmeName);
  });
}

function ResultsDashboard({
  snapshot, isStale, onEdit,
}: {
  snapshot: Snapshot;
  isStale: boolean;
  onEdit: () => void;
}) {
  const { results, portfolio, entryContext } = snapshot;

  const grouped = useMemo(() => {
    const g: Record<TabKey, ProgrammeTotal[]> = { airline: [], hotel: [], other: [] };
    for (const p of portfolio) g[categorise(p.programmeType)].push(p);
    (Object.keys(g) as TabKey[]).forEach((k) => { g[k] = sortProgrammes(g[k]); });
    return g;
  }, [portfolio]);

  const availableTabs: TabKey[] = (["airline", "hotel", "other"] as TabKey[]).filter((k) => grouped[k].length > 0);
  const [tab, setTab] = useState<TabKey>(availableTabs[0] ?? "airline");
  useEffect(() => {
    if (!availableTabs.includes(tab) && availableTabs[0]) setTab(availableTabs[0]);
  }, [availableTabs, tab]);

  const hero = portfolio[0];
  const totalEntered = Array.from(entryContext.values()).reduce((s, v) => s + v.entered, 0);
  const totalUsedByEntry = useMemo(() => {
    const perEntry = new Map<string, number>();
    for (const [id, ctx] of entryContext) perEntry.set(id, ctx.entered);
    for (const r of results) {
      // For each entry, the "best utilisation" is the highest bankPointsUsed across its rules
      const cur = perEntry.get(r.entryId) ?? 0;
      const usedEquiv = r.bankPointsUsed;
      // We want remaining = entered - max(bankPointsUsed). Track as min-remaining.
      const currentRemaining = cur;
      const candidateRemaining = (entryContext.get(r.entryId)?.entered ?? 0) - usedEquiv;
      if (candidateRemaining < currentRemaining) perEntry.set(r.entryId, candidateRemaining);
    }
    return perEntry;
  }, [results, entryContext]);

  const totalRemaining = Array.from(totalUsedByEntry.values()).reduce((s, v) => s + Math.max(0, v), 0);
  const bankBalanceCount = entryContext.size;

  return (
    <section className="border-b border-border bg-sand/40">
      <div className="mx-auto max-w-[1100px] px-5 py-16 sm:px-6 md:px-12 md:py-20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-ink/60">Results</p>
            <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">
              What your points can become
            </h2>
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

        {/* Hero result */}
        {hero && (
          <div className="mt-8 rounded-sm border border-border bg-background p-8 md:p-10">
            <p className="text-[12px] uppercase tracking-[0.16em] text-ink/55">
              Your highest potential balance
            </p>
            <p className="mt-3 font-display text-5xl leading-none text-ink md:text-6xl">
              {formatInt(hero.potentialTotal)}{" "}
              <span className="text-3xl md:text-4xl">{hero.programmeName}</span>
            </p>
            <p className="mt-4 max-w-xl text-[14px] text-ink/70">
              {heroSupportLine(hero)}
            </p>
            <p className="mt-3 text-[11px] text-ink/50">
              A larger points balance does not necessarily mean greater redemption value.
            </p>
          </div>
        )}

        {/* Summary metrics */}
        <dl className="mt-6 grid grid-cols-3 gap-3">
          <MetricCard label="Programmes available" value={formatInt(portfolio.length)} />
          <MetricCard label="Bank balances calculated" value={formatInt(bankBalanceCount)} />
          <MetricCard label="Bank points remaining" value={formatInt(totalRemaining)} sub={`of ${formatInt(totalEntered)} entered`} />
        </dl>

        {/* Tabs */}
        {availableTabs.length > 0 && (
          <div className="mt-10">
            <div role="tablist" aria-label="Result categories" className="flex flex-wrap gap-2 border-b border-border">
              {availableTabs.map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={`-mb-px border-b-2 px-4 py-3 text-[13px] transition-colors ${
                    tab === k ? "border-ink text-ink" : "border-transparent text-ink/55 hover:text-ink"
                  }`}
                >
                  {tabLabel(k)} <span className="ml-1 text-ink/40">{grouped[k].length}</span>
                </button>
              ))}
            </div>

            {/* Bar visual */}
            <div className="mt-8">
              <h3 className="text-[11px] uppercase tracking-[0.16em] text-ink/55">
                Potential balances by programme
              </h3>
              <BarVisual items={grouped[tab]} />
            </div>

            {/* Comparison table / cards */}
            <div className="mt-8">
              <ComparisonTable items={grouped[tab]} results={results} entryContext={entryContext} />
            </div>
          </div>
        )}

        {/* Points remaining */}
        <PointsRemaining entryContext={entryContext} totalUsedByEntry={totalUsedByEntry} />
      </div>
    </section>
  );
}

function heroSupportLine(hero: ProgrammeTotal): string {
  const parts: string[] = [];
  const n = hero.transferredFromEntries.length;
  if (n > 0) parts.push(`From ${n} bank balance${n === 1 ? "" : "s"}`);
  if (hero.existingBalance > 0) parts.push(`your existing ${hero.programmeName} balance`);
  if (parts.length === 0) return "";
  return parts.join(" plus ") + ".";
}

function tabLabel(k: TabKey): string {
  return k === "airline" ? "Airline programmes" : k === "hotel" ? "Hotel programmes" : "Other travel rewards";
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-sm border border-border bg-background p-4">
      <p className="font-display text-2xl text-ink md:text-3xl">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink/60">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-ink/50">{sub}</p>}
    </div>
  );
}

/* ---------- Bar visual ---------- */

function BarVisual({ items }: { items: ProgrammeTotal[] }) {
  if (items.length === 0) return null;
  const max = Math.max(...items.map((i) => i.potentialTotal), 1);
  return (
    <ul className="mt-4 space-y-3">
      {items.map((p) => {
        const pct = Math.max(4, Math.round((p.potentialTotal / max) * 100));
        return (
          <li key={p.programmeId}>
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-ink">{p.programmeName}</span>
              <span className="font-display text-lg text-ink">{formatInt(p.potentialTotal)}</span>
            </div>
            <div className="mt-1 h-2 w-full bg-sand" aria-hidden="true">
              <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Comparison table ---------- */

function ComparisonTable({
  items, results, entryContext,
}: {
  items: ProgrammeTotal[];
  results: RuleResult[];
  entryContext: Snapshot["entryContext"];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (pid: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid);
      else { next.add(pid); track("result_programme_expanded", { programme: pid }); }
      return next;
    });
  };

  const resultsByProgramme = useMemo(() => {
    const m = new Map<string, RuleResult[]>();
    for (const r of results) {
      const arr = m.get(r.programmeId) ?? [];
      arr.push(r);
      m.set(r.programmeId, arr);
    }
    return m;
  }, [results]);

  if (items.length === 0) {
    return <p className="text-sm text-ink/60">No results in this category.</p>;
  }

  const remainingLabel = (n: number) => (n > 0 ? formatInt(n) : "—");

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.14em] text-ink/60">
              <th scope="col" className="py-3 pr-4">Programme</th>
              <th scope="col" className="py-3 pr-4 text-right">From transfers</th>
              <th scope="col" className="py-3 pr-4 text-right">Existing</th>
              <th scope="col" className="py-3 pr-4 text-right">Potential total</th>
              <th scope="col" className="py-3 pr-4 text-right">Points remaining</th>
              <th scope="col" className="py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const isOpen = expanded.has(p.programmeId);
              const rowResults = resultsByProgramme.get(p.programmeId) ?? [];
              const remaining = rowResults.reduce((s, r) => s + r.bankPointsRemaining, 0);
              return (
                <>
                  <tr key={p.programmeId} className="border-b border-border/70 text-ink">
                    <td className="py-4 pr-4">
                      <p className="font-display text-lg text-ink">{p.programmeName}</p>
                    </td>
                    <td className="py-4 pr-4 text-right">{remainingLabel(p.transferredTotal)}</td>
                    <td className="py-4 pr-4 text-right">{remainingLabel(p.existingBalance)}</td>
                    <td className="py-4 pr-4 text-right font-display text-xl text-ink">
                      {formatInt(p.potentialTotal)}
                    </td>
                    <td className="py-4 pr-4 text-right text-ink/70">{remainingLabel(remaining)}</td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggle(p.programmeId)}
                        aria-expanded={isOpen}
                        className="inline-flex items-center gap-1 text-[12px] text-ink underline underline-offset-4 hover:no-underline"
                      >
                        {isOpen ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={6} className="border-b border-border bg-sand/30 px-4 py-6">
                        <ProgrammeDetails p={p} rowResults={rowResults} entryContext={entryContext} />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {items.map((p) => {
          const isOpen = expanded.has(p.programmeId);
          const rowResults = resultsByProgramme.get(p.programmeId) ?? [];
          return (
            <div key={p.programmeId} className="rounded-sm border border-border bg-background p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-lg text-ink">{p.programmeName}</p>
                <p className="font-display text-2xl text-ink">{formatInt(p.potentialTotal)}</p>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-y-1 text-[12px]">
                <dt className="text-ink/55">From transfers</dt>
                <dd className="text-right text-ink">{remainingLabel(p.transferredTotal)}</dd>
                <dt className="text-ink/55">Existing balance</dt>
                <dd className="text-right text-ink">{remainingLabel(p.existingBalance)}</dd>
              </dl>
              <button
                type="button"
                onClick={() => toggle(p.programmeId)}
                aria-expanded={isOpen}
                className="mt-4 inline-flex items-center gap-1 text-[12px] text-ink underline underline-offset-4"
              >
                {isOpen ? "Hide calculation" : "View calculation"}
              </button>
              {isOpen && (
                <div className="mt-4 border-t border-border pt-4">
                  <ProgrammeDetails p={p} rowResults={rowResults} entryContext={entryContext} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
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
    <div className="space-y-5">
      {p.existingBalance > 0 && (
        <p className="text-[13px] text-ink/70">
          Includes an existing balance of {formatInt(p.existingBalance)} {p.programmeName}.
        </p>
      )}
      {rowResults.map((r) => {
        const ctx = entryContext.get(r.entryId);
        const nextBlockNeed = r.bankPointsRemaining > 0 ? r.bankPointsPerBlock - r.bankPointsRemaining : 0;
        const showNote = r.notes && !notesSeen.has(r.notes);
        if (r.notes) notesSeen.add(r.notes);
        return (
          <div key={`${r.entryId}-${r.programmeId}`} className="rounded-sm border border-border bg-background p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-base text-ink">
                {ctx?.nickname || `${r.bankName} — ${r.cardGroupName}`}
              </p>
              <p className="font-display text-lg text-ink">
                +{formatInt(r.partnerPointsReceived)} {r.programmeName}
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
            {nextBlockNeed > 0 && (
              <p className="mt-3 rounded-sm bg-sand/70 px-3 py-2 text-[12px] text-ink">
                {formatInt(nextBlockNeed)} more {r.rewardCurrencyName} would complete the next {r.programmeName} transfer block.
              </p>
            )}
            {r.fullBlocks === 0 && (
              <p className="mt-3 rounded-sm bg-sand/70 px-3 py-2 text-[12px] text-ink">
                {formatInt(r.pointsShortOfNextBlock)} more {r.rewardCurrencyName} needed to reach the first transfer block.
              </p>
            )}
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
    </div>
  );
}

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
  // Look up the product currency via the calculated results is complex — infer from group name.
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
