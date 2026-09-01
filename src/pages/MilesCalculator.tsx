import { forwardRef, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { CardArtwork } from "@/components/milesCalculator/CardArtwork";

import {
  COUNTRIES,
  CountryCode,
  getBanksByCountry,
  Card,
  getBankById,
  getCardById,
  getCardGroupById,
  getDirectEarnProgrammeId,
  getDirectEarnRates,
  getProgrammeById,
  getPublicRulesForCardGroup,
  getRewardCurrencyForCard,
  isDirectEarnCard,
  isNonConvertibleCard,
  isConversionUnverifiedCard,
  loyaltyProgrammes,
  searchCardsInBank,
  summaryCounters,
} from "@/data/milesCalculator";
import { formatInt, parseIntSafe } from "@/lib/milesCalculator";
import { track } from "@/lib/track";
import { blockExampleFor } from "@/lib/blockExample";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import type { Snapshot } from "@/components/milesCalculator/types";

import {
  hasCalculableInput as pipelineHasCalculableInput,
  runCalculation as runCalculatorPipeline,
} from "@/lib/calculatorPipeline";

/**
 * Results, destination discovery and the quick-reference table live in their
 * own chunk. They cannot be seen until a calculation runs, and they carry the
 * heavy redemption dataset, so they are fetched on demand.
 */
const loadResultsSection = () => import("@/components/milesCalculator/ResultsSection");
const ResultsSection = lazyWithRetry(loadResultsSection);

/** Subtle placeholder while the results chunk arrives. Same rhythm as the real panel. */
function ResultsSkeleton() {
  return (
    <section className="border-b border-border" aria-busy="true" aria-label="Preparing your results">
      <div className="mx-auto max-w-[880px] px-5 py-16 sm:px-6 md:py-24">
        <div className="h-3 w-24 animate-pulse rounded-sm bg-ink/10" />
        <div className="mt-5 h-8 w-2/3 animate-pulse rounded-sm bg-ink/10" />
        <div className="mt-10 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-sm bg-ink/[0.06]" />
          ))}
        </div>
      </div>
    </section>
  );
}


const STRATEGY_URL = "/points-strategy";
const TRIP_PLANNING_DISCOVERY_URL = "https://cal.com/samral/trip-planning-discovery-call-20-mins";
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

/** Uncommitted Step 2 input (typed, not yet added). */
interface ExistingDraft {
  programmeId: string;
  rawInput: string;
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

export default function MilesCalculator() {
  /**
   * Country scope. Malaysia stays the default so existing behaviour and
   * existing links are unchanged. Switching only swaps which dataset the
   * selectors read — the calculation engine is shared.
   */
  const [country, setCountry] = useState<CountryCode>("MY");
  /** Card groups chosen in Step 1, used to keep the explainer example real. */
  const [selectedCardGroupIds, setSelectedCardGroupIds] = useState<string[]>([]);

  useEffect(() => {
    const isSg = country === "SG";
    document.title = isSg
      ? "Singapore Credit Card Points to Airline Miles Calculator | Samral"
      : "Malaysia Credit Card Points to Airline Miles Calculator | Samral";
    const desc = isSg
      ? "Convert DBS Points, UNI$, Citi ThankYou Points, Citi Miles, HSBC Reward Points, OCBC$, VOYAGE Miles, Membership Rewards and 360° Rewards Points into KrisFlyer miles, Asia Miles, Avios and more — with exact transfer blocks and leftover points."
      : "Convert Malaysian credit card points into Enrich Points, KrisFlyer miles, Asia Miles, Avios and other airline rewards. See exact conversion blocks, usable points and leftover balances.";
    upsertMeta("description", desc);
    upsertLink("canonical", "https://www.samral.com/miles-calculator");
    upsertMetaProperty(
      "og:title",
      isSg ? "Singapore Credit Card Points Calculator | Samral" : "Malaysia Credit Card Points Calculator | Samral",
    );
    upsertMetaProperty("og:description", desc);
    upsertMetaProperty("og:url", "https://www.samral.com/miles-calculator");
    upsertMetaProperty("og:type", "website");
  }, [country]);

  useEffect(() => {
    track("miles_calculator_viewed");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero country={country} />
      <CalculatorFlow country={country} onCountryChange={setCountry} onSelectionChange={setSelectedCardGroupIds} />
      <Explainer country={country} selectedCardGroupIds={selectedCardGroupIds} />
      <TripPlanningCTA />
      <Disclaimer country={country} />
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
  return <SiteHeader />;
}

/* ---------- Hero ---------- */

function Hero({ country }: { country: CountryCode }) {
  const counters = useMemo(() => summaryCounters(country), [country]);
  return (
    <section className="border-b border-border bg-sand/60">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <p className="eyebrow text-ink/60">Updated for 2026</p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink md:text-6xl md:leading-[1.02]">
          Samral Miles Calculator
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
          <Counter label="Issuers covered" value={counters.issuers} />
          <Counter label="Rewards programmes" value={counters.cardProgrammes} />
          <Counter label="Transfer partners" value={counters.partners} />
          <Counter label="Verified conversion routes" value={counters.routes} />
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

function CalculatorFlow({
  country,
  onCountryChange,
  onSelectionChange,
}: {
  country: CountryCode;
  onCountryChange: (next: CountryCode) => void;
  onSelectionChange?: (cardGroupIds: string[]) => void;
}) {
  const [entries, setEntries] = useState<Entry[]>([newEntry()]);
  const [existingRows, setExistingRows] = useState<ExistingRow[]>([]);
  const [existingDraft, setExistingDraft] = useState<ExistingDraft>({ programmeId: "", rawInput: "" });
  const [state, setState] = useState<UiState>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [startedTracked, setStartedTracked] = useState(false);
  const [registeredPromotionIds, setRegisteredPromotionIds] = useState<string[]>([]);

  /**
   * Switching country clears the working state: a Malaysian card can never
   * appear in a Singapore calculation, or the reverse.
   */
  const switchCountry = useCallback((next: CountryCode) => {
    if (next === country) return;
    onCountryChange(next);
    setEntries([newEntry()]);
    setExistingRows([]);
    setExistingDraft({ programmeId: "", rawInput: "" });
    setSnapshot(null);
    setErrors([]);
    setState("idle");
    setRegisteredPromotionIds([]);
    track("calculator_country_changed", { country: next });
  }, [country, onCountryChange]);

  // Surface the selected card groups so the explainer can demonstrate block
  // flooring with a rate that actually belongs to the user's own card.
  useEffect(() => {
    onSelectionChange?.(entries.map((e) => e.cardGroupId).filter(Boolean));
  }, [entries, onSelectionChange]);

  const calcRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const existingRef = useRef<HTMLDivElement>(null);
  const [existingOpen, setExistingOpen] = useState(false);
  const [existingPreselect, setExistingPreselect] = useState("");

  /** Direct-earning cards route the customer to Step 2 instead of a bank balance. */
  const focusExistingBalances = useCallback((programmeId: string) => {
    setExistingPreselect(programmeId);
    setExistingOpen(true);
    requestAnimationFrame(() => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      existingRef.current?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
      document.getElementById("existing-bal")?.focus();
    });
    track("direct_earn_step2_focused", { programme: programmeId });
  }, []);

  const markStarted = useCallback(() => {
    if (!startedTracked) {
      // Warm the results chunk as soon as the customer engages, so the
      // Calculate click never waits on a network round trip.
      void loadResultsSection();
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

  /**
   * A Step 2 balance the customer has typed but not yet committed with
   * "Add balance". It must never be silently dropped at calculation time.
   */
  const setDraft = useCallback((next: ExistingDraft) => {
    setExistingDraft(next);
    if (snapshot) setState("stale");
    markStarted();
  }, [snapshot, markStarted]);

  /** Committed rows plus a valid uncommitted draft. */
  const effectiveExistingRows = useMemo(() => {
    const draftPoints = parseIntSafe(existingDraft.rawInput);
    if (
      !existingDraft.programmeId ||
      !Number.isFinite(draftPoints) ||
      draftPoints <= 0 ||
      existingRows.some((r) => r.programmeId === existingDraft.programmeId)
    ) return existingRows;
    return [...existingRows, { id: "draft-existing", programmeId: existingDraft.programmeId, rawInput: existingDraft.rawInput }];
  }, [existingRows, existingDraft]);

  const runCalculation = useCallback(
    (regIds: string[]) => runCalculatorPipeline(entries, effectiveExistingRows, regIds),
    [entries, effectiveExistingRows],
  );

  /**
   * Inputs that can actually contribute to a loyalty-programme balance.
   * Derived directly from state — no effects, no mirrored state.
   */
  const hasCalculableInput = useMemo(
    () => pipelineHasCalculableInput(entries, effectiveExistingRows),
    [entries, effectiveExistingRows],
  );

  /**
   * When the only selected card earns airline miles directly, the next action is
   * a Step 2 balance — say so explicitly instead of the generic hint.
   */
  const directEarnOnlyProgrammeName = useMemo(() => {
    const selected = entries.map((e) => getCardById(e.cardId)).filter(Boolean);
    if (selected.length === 0 || !selected.every((c) => isDirectEarnCard(c))) return null;
    const programmeId = getDirectEarnProgrammeId(selected[0]!.cardGroupId);
    return programmeId ? (getProgrammeById(programmeId)?.name ?? null) : null;
  }, [entries]);

  const disabledCalculateHint = directEarnOnlyProgrammeName
    ? `Enter your current ${directEarnOnlyProgrammeName} balance in Step 2 to calculate.`
    : "Add another points-earning card or an existing loyalty balance to calculate.";


  const handleCalculate = () => {
    // Validate
    const errs: string[] = [];
    const usableEntries = entries.filter((e) => e.bankId || e.cardId || e.rawInput.trim());

    // Guard clause: nothing valid to calculate — never start the pipeline.
    if (!hasCalculableInput) {
      setErrors([
        usableEntries.length === 0
          ? "Add at least one bank balance to calculate."
          : disabledCalculateHint,
      ]);
      setState("error");
      return;
    }

    for (const e of usableEntries) {
      if (!e.bankId) errs.push("Select a bank for every entry.");
      else if (e.notFound) errs.push("We need to verify your unlisted card before calculating. Submit it for verification or pick another card.");
      else if (!e.cardId) errs.push("Select the exact credit card for every entry.");
      const entryCard = getCardById(e.cardId);
      // Non-convertible, unverified and direct-earning cards carry no bank
      // balance to validate — they are excluded from calculation entirely.
      if (
        isNonConvertibleCard(entryCard) ||
        isDirectEarnCard(entryCard) ||
        isConversionUnverifiedCard(entryCard)
      ) continue;
      const pts = parseIntSafe(e.rawInput);
      if (!Number.isFinite(pts) || pts <= 0) errs.push("Enter a valid points balance greater than zero.");
    }

    for (const r of effectiveExistingRows) {
      if (!r.programmeId) errs.push("Choose a programme for every existing balance.");
      const pts = parseIntSafe(r.rawInput);
      if (!Number.isFinite(pts) || pts <= 0) errs.push("Enter a valid existing balance greater than zero.");
    }
    // A half-filled Step 2 draft must be surfaced, never silently ignored.
    if (parseIntSafe(existingDraft.rawInput) > 0 && !existingDraft.programmeId) {
      errs.push("Choose a programme for the existing balance you entered in Step 2.");
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
      existing: effectiveExistingRows.length,
    });

    setIsCalculating(true);
    void loadResultsSection();

    setTimeout(() => {
      const next = runCalculation(registeredPromotionIds);
      setSnapshot(next);
      setState("calculated");
      setIsCalculating(false);
      track("calculation_completed", { programmes: next.portfolio.length });
      window.dispatchEvent(new CustomEvent("samral:calculation-completed"));

      requestAnimationFrame(() => {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        resultRef.current?.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start",
        });
      });
    }, 350);
  };

  const handleToggleRegistration = useCallback((promotionId: string, registered: boolean) => {
    setRegisteredPromotionIds((prev) => {
      const set = new Set(prev);
      if (registered) set.add(promotionId);
      else set.delete(promotionId);
      const nextIds = Array.from(set);
      // Recompute snapshot immediately if we already have one.
      if (snapshot) {
        const next = runCalculation(nextIds);
        setSnapshot(next);
        setState("calculated");
      }
      track("promotion_registration_toggled", { promotion: promotionId, registered });
      return nextIds;
    });
  }, [snapshot, runCalculation]);


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
            <p className="eyebrow text-ink/60">Where are your cards issued?</p>
            <div
              role="radiogroup"
              aria-label="Country"
              className="mt-3 inline-flex w-full flex-wrap gap-2 rounded-sm border border-border bg-sand/40 p-1 sm:w-auto"
            >
              {COUNTRIES.map((c) => {
                const selected = c.code === country;
                return (
                  <button
                    key={c.code}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => switchCountry(c.code)}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-[13px] transition-colors sm:flex-none ${
                      selected ? "bg-ink text-background" : "text-ink/70 hover:text-ink"
                    }`}
                  >
                    <span aria-hidden="true">{c.flag}</span> {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 max-w-[640px]">
            <p className="eyebrow text-ink/60">Step 1</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">
              Your credit card points
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              Add one card group per entry. You can add several from the same bank.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {entries.map((entry, idx) => (
              <EntryCard
                key={entry.id}
                country={country}
                index={idx}
                entry={entry}
                canRemove={entries.length > 1}
                onChange={(next) => mutateEntries((prev) => prev.map((e) => (e.id === entry.id ? next : e)))}
                onRemove={() => mutateEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                onFirstValid={() => track("bank_balance_added")}
                onAddProgrammeBalance={focusExistingBalances}
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

          <div id="step-2" className="mt-14 max-w-[640px]">
            <p className="eyebrow text-ink/60">Step 2 · optional</p>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">
              Existing airline or hotel balances
            </h2>
          </div>

          <ExistingBalancesPanel
            ref={existingRef}
            open={existingOpen}
            onOpenChange={setExistingOpen}
            preselectProgrammeId={existingPreselect}
            rows={existingRows}
            draft={existingDraft}
            onDraftChange={setDraft}
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
              disabled={isCalculating || !hasCalculableInput}
              aria-disabled={!hasCalculableInput}
              data-testid="calculate-button"
              className="inline-flex w-full items-center justify-center rounded-sm bg-ink px-8 py-5 text-base font-medium text-background transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto md:min-w-[320px]"
            >
              {isCalculating ? "Calculating full transfer blocks…" : buttonLabel}
            </button>
            {!hasCalculableInput && (
              <p className="mt-3 text-[13px] text-ink/70">
                {disabledCalculateHint}
              </p>
            )}
            <p className="mt-3 text-[12px] text-ink/55">
              We calculate locally in your browser. Nothing is sent to a server.
            </p>
          </div>

        </div>
      </section>

      {showResults && snapshot && (
        <div ref={resultRef}>
          <Suspense fallback={<ResultsSkeleton />}>
            <ResultsSection
              snapshot={snapshot}
              country={country}
              isStale={state === "stale"}
              onEdit={scrollToCalculator}
              registeredPromotionIds={registeredPromotionIds}
              onToggleRegistration={handleToggleRegistration}
            />
          </Suspense>
        </div>
      )}

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
  entry, country, index, canRemove, onChange, onRemove, onFirstValid, onAddProgrammeBalance,
}: {
  entry: Entry;
  country: CountryCode;
  index: number;
  canRemove: boolean;
  onChange: (next: Entry) => void;
  onRemove: () => void;
  onFirstValid: () => void;
  onAddProgrammeBalance: (programmeId: string) => void;
}) {
  const bank = entry.bankId ? getBankById(entry.bankId) : undefined;
  const card = entry.cardId ? getCardById(entry.cardId) : undefined;
  const currency = card ? getRewardCurrencyForCard(card) : undefined;
  const selectedGroup = card ? getCardGroupById(card.cardGroupId) : undefined;
  // Non-convertible cards (cashback, merchant coins) are an early-exit state:
  // derived straight from card metadata, never through chained effects, and
  // never routed into conversion-rule lookups.
  const nonConvertible = isNonConvertibleCard(card);
  // Distinct from non-convertible: the route may exist, but Samral has not
  // verified it, so the card is non-calculable rather than zero-earning.
  const unverified = isConversionUnverifiedCard(card);
  // Group-level facts first, card-specific facts (e.g. a per-card conversion
  // fee) next, and the "still unverified" caveat last.
  const groupDetails = selectedGroup?.unverifiedKnownDetails ?? [];
  const knownDetails = [
    ...groupDetails.slice(0, Math.max(groupDetails.length - 1, 0)),
    ...(card?.unverifiedKnownDetails ?? []),
    ...groupDetails.slice(Math.max(groupDetails.length - 1, 0)),
  ];

  const rulesForSelected = card && !nonConvertible ? getPublicRulesForCardGroup(card.cardGroupId) : [];
  // Direct airline-earning cards never take a bank-points balance.
  const directEarn = isDirectEarnCard(card);
  const directProgrammeId = card ? getDirectEarnProgrammeId(card.cardGroupId) : undefined;
  const directProgramme = directProgrammeId ? getProgrammeById(directProgrammeId) : undefined;
  const directProgrammeName = directProgramme?.name ?? "airline";
  const directEarnRates = getDirectEarnRates(card);
  const hasNoRules = !!card && rulesForSelected.length === 0;
  const rateUnconfirmed =
    !nonConvertible && !unverified && (
    card?.status === "rate_unconfirmed" ||
    card?.status === "rate_pending_verification" ||
    card?.status === "direct_airline" ||
    card?.status === "cashback_only" ||
    hasNoRules);

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const matches = useMemo(() => {
    if (!entry.bankId) return [];
    // Search operates over the FULL inventory for the selected bank, not a truncated view.
    // The dropdown container is scrollable (max-h + overflow-auto), so every match is reachable.
    return searchCardsInBank(entry.bankId, query);
  }, [entry.bankId, query]);

  const pointsValue = parseIntSafe(entry.rawInput);
  const pointsError = entry.rawInput && !Number.isFinite(pointsValue)
    ? "Enter whole numbers only (commas are fine)."
    : null;

  // Never carry a stale bank balance into a direct-earning or non-convertible card.
  useEffect(() => {
    if ((directEarn || nonConvertible || unverified) && entry.rawInput) onChange({ ...entry, rawInput: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directEarn, nonConvertible, unverified, entry.rawInput]);

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
      rawInput:
        isDirectEarnCard(c) || isNonConvertibleCard(c) || isConversionUnverifiedCard(c)
          ? ""
          : entry.rawInput,
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
            {getBanksByCountry(country).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Credit card" htmlFor={`card-${entry.id}`}>
          {card && !searchOpen ? (
            <div className="mt-2 flex items-center justify-between gap-3 rounded-sm border border-border bg-sand/40 px-3 py-2.5 text-sm text-ink">
              <span className="flex min-w-0 items-center gap-2.5">
                <CardArtwork cardId={card.id} cardName={card.name} className="h-9 w-[58px]" sizes="58px" />
                <span className="min-w-0 truncate">
                  <span className="truncate">{card.name}</span>
                  {card.subtitle && (
                    <span className="ml-1 text-[12px] text-ink/55">· {card.subtitle}</span>
                  )}
                </span>
              </span>

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
                      className="flex w-full items-start justify-between gap-3 border-b border-border/60 px-3 py-2 text-left text-[13px] text-ink hover:bg-sand/50"
                    >
                      <CardArtwork cardId={c.id} cardName={c.name} className="mt-0.5 h-7 w-[46px]" sizes="46px" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{c.name}</span>
                        {c.subtitle && (
                          <span className="block truncate text-[11px] text-ink/55">{c.subtitle}</span>
                        )}
                      </span>

                      {(c.status === "rate_unconfirmed" || c.status === "rate_pending_verification") && (
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-ink/50">Rate to confirm</span>
                      )}
                      {c.status === "legacy" && (
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-ink/50">Legacy</span>
                      )}
                      {c.status === "direct_airline" && (
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-ink/50">Direct-earning</span>
                      )}
                      {c.status === "cashback_only" && (
                        <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-ink/50">Not convertible</span>
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
              {directEarn ? "Rewards type: " : "Rewards currency: "}
              <span className="normal-case tracking-normal text-ink/80">
                {entry.notFound
                  ? (entry.unknown?.currency || "to be confirmed")
                  : directEarn
                    ? `Direct ${directProgrammeName} earning`
                    : (currency?.currencyName ?? "—")}
              </span>
            </p>
          )}
        </Field>

        {!directEarn && !nonConvertible && !unverified && (
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
        )}
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

      {directEarn && card && (
        <div role="note" className="mt-4 rounded-sm border border-ink/30 bg-sand/40 p-4 text-[12px] leading-relaxed text-ink/80">
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink/60">Direct airline-earning card</p>
          <p className="mt-2 text-[15px] font-medium text-ink">
            Your {directProgrammeName} Points are already in {directProgrammeName}
          </p>
          <p className="mt-2 text-[13px] text-ink/80">
            This card earns {directProgrammeName} Points directly rather than bank reward points that need to
            be transferred. Enter your current {directProgrammeName} balance below to see where your points can take you.
          </p>
          {directProgrammeId && (
            <button
              type="button"
              onClick={() => onAddProgrammeBalance(directProgrammeId)}
              data-testid="direct-earn-cta"
              className="mt-4 inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-3 text-[14px] font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" /> Add My {directProgrammeName} Balance
            </button>
          )}
          {directEarnRates.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink/55">Current earning rates</p>
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {directEarnRates.map((r) => (
                  <li key={r.category} className="flex items-baseline justify-between gap-4 py-1.5">
                    <span className="text-ink/70">{r.category}</span>
                    <span className="text-ink">{r.rate}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-ink/55">
                Earn rates are reference information only. They are never used to estimate your balance.
              </p>
            </div>
          )}
        </div>
      )}



      {nonConvertible && card && (
        <div role="note" data-testid="non-convertible-note" className="mt-4 rounded-sm border border-ink/30 bg-sand/40 p-4 text-[12px] leading-relaxed text-ink/80">
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink/60">Not convertible</p>
          <p className="mt-2 text-[13px] font-medium text-ink">Card does not earn convertible points</p>
          <p className="mt-1">
            This card earns cashback or another reward that Samral does not currently convert into
            airline or hotel points. You can still add existing airline or hotel balances in Step&nbsp;2.
          </p>
          <button
            type="button"
            onClick={() => onAddProgrammeBalance("")}
            className="mt-4 inline-flex items-center gap-2 rounded-sm border border-ink px-4 py-2.5 text-[13px] text-ink transition-colors hover:bg-ink hover:text-background"
          >
            <Plus className="h-3.5 w-3.5" /> Add an existing airline or hotel balance
          </button>
        </div>
      )}

      {unverified && card && (
        <div role="note" data-testid="conversion-unverified-note" className="mt-4 rounded-sm border border-ink/30 bg-sand/40 p-4 text-[12px] leading-relaxed text-ink/80">
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink/60">Not calculable yet</p>
          <p className="mt-2 text-[13px] font-medium text-ink">
            {selectedGroup?.unverifiedHeadline ?? "Conversion not yet verified"}
          </p>
          <p className="mt-1">
            {selectedGroup?.unverifiedNotice ??
              "Samral has not yet verified a current conversion route for this card, so we won’t estimate a transfer value."}
          </p>
          {knownDetails.length > 0 && (
            <div className="mt-3" data-testid="unverified-known-details">
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink/60">Known details</p>
              <ul className="mt-1 space-y-1">
                {knownDetails.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span aria-hidden className="text-ink/40">—</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedGroup?.processingNotes?.length ? (
            <div className="mt-3" data-testid="unverified-processing-notes">
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink/60">
                Indicative processing time
              </p>
              <ul className="mt-1 space-y-1">
                {selectedGroup.processingNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p className="mt-1 text-ink/60">These are indicative only, not guaranteed.</p>
            </div>
          ) : null}
          <p className="mt-3">
            Add another card with a verified transfer route, or add an existing airline or hotel
            balance in Step&nbsp;2.
          </p>

          <button
            type="button"
            onClick={() => onAddProgrammeBalance("")}
            className="mt-4 inline-flex items-center gap-2 rounded-sm border border-ink px-4 py-2.5 text-[13px] text-ink transition-colors hover:bg-ink hover:text-background"
          >
            <Plus className="h-3.5 w-3.5" /> Add an existing airline or hotel balance
          </button>
        </div>
      )}

      {rateUnconfirmed && !directEarn && !unverified && card && (
        <div role="note" className="mt-3 rounded-sm border border-ink/30 bg-background p-3 text-[12px] leading-relaxed text-ink/80">
          <p className="font-medium text-ink">
            {card.status === "direct_airline"
              ? "Direct airline-earning card"
              : card.status === "rate_pending_verification"
                ? "Conversion profile pending verification"
                : card.status === "cashback_only"
                  ? (card.cardGroupId === "cg-mbb-myimpact"
                      ? "Existing points only — no new points earned"
                      : "Card does not earn convertible points")
                  : card.status === "legacy"
                    ? "Older or discontinued card"
                    : "Current air-mile rate requires confirmation"}
          </p>
          <p className="mt-1">
            {card.status === "rate_pending_verification"
              ? "We have identified your exact card, but its current programme-level conversion profile has not yet been fully verified."
              : (selectedGroup?.unverifiedNotice ??
                "We cannot confirm a preferential conversion rate for this card from the currently recorded official source. Select another card you hold, or submit this card for verification.")}
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

const ExistingBalancesPanel = forwardRef<HTMLDivElement, {
  rows: ExistingRow[];
  /** Typed-but-not-added balance, owned by the parent so it is never dropped. */
  draft: ExistingDraft;
  onDraftChange: (draft: ExistingDraft) => void;
  onAdd: (row: ExistingRow) => void;
  onRemove: (id: string) => void;
  /** Controlled open state so a direct-earning card can expand Step 2. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Programme preselected when Step 2 is opened from a direct-earning card. */
  preselectProgrammeId?: string;
}>(function ExistingBalancesPanel({
  rows, draft, onDraftChange, onAdd, onRemove, open: openProp, onOpenChange, preselectProgrammeId,
}, ref) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const programmeId = draft.programmeId;
  const raw = draft.rawInput;
  const setProgrammeId = (next: string) => onDraftChange({ programmeId: next, rawInput: raw });
  const setRaw = (next: string) => onDraftChange({ programmeId, rawInput: next });

  useEffect(() => {
    if (preselectProgrammeId) onDraftChange({ programmeId: preselectProgrammeId, rawInput: raw });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectProgrammeId]);


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
    onDraftChange({ programmeId: "", rawInput: "" });
  };

  return (
    <div ref={ref} className="mt-6 rounded-sm border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen(!open)}
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
});


/* ---------- Explainer ---------- */

function Explainer({ country, selectedCardGroupIds = [] }: { country: CountryCode; selectedCardGroupIds?: string[] }) {
  const where = country === "SG" ? "Singapore" : "Malaysian";
  const example = useMemo(
    () => blockExampleFor(selectedCardGroupIds, country),
    [selectedCardGroupIds, country],
  );
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[860px] px-5 py-16 sm:px-6 md:py-24">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl text-ink md:text-4xl">
              How {country === "SG" ? "Singapore" : "Malaysian"} credit card point conversions work
            </h2>
            {example ? (
              <>
                <p className="mt-5 text-[15px] leading-relaxed text-ink/75">
                  {where} banks commonly require transfers in fixed blocks. {example.bankName} converts{" "}
                  {formatInt(example.bankPointsPerBlock)} {example.currencyName} into{" "}
                  {formatInt(example.partnerPointsPerBlock)} {example.programmeName} per block, so a balance of{" "}
                  {formatInt(example.enteredPoints)} {example.currencyName} does not convert proportionally. Only{" "}
                  {formatInt(example.usedPoints)} form complete blocks, producing{" "}
                  {formatInt(example.receivedPoints)} {example.programmeName}, while{" "}
                  {formatInt(example.leftoverPoints)} {example.currencyName} remain in the {example.bankName} account.
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-ink/55">
                  {example.fromSelection
                    ? "This example uses a verified conversion rate for the card you selected."
                    : `This example uses a verified ${where} conversion rate currently in our database.`}
                </p>
              </>
            ) : (
              <p className="mt-5 text-[15px] leading-relaxed text-ink/75">
                {where} banks commonly require transfers in fixed blocks. Incomplete blocks are not converted &mdash; the leftover points simply stay in your bank account. Select your card above to see this demonstrated with your own verified conversion rate.
              </p>
            )}
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


/* ---------- Trip Planning CTA ---------- */

function TripPlanningCTA() {
  const [calculated, setCalculated] = useState(false);

  useEffect(() => {
    const handler = () => setCalculated(true);
    window.addEventListener("samral:calculation-completed", handler);
    return () => window.removeEventListener("samral:calculation-completed", handler);
  }, []);

  const handleClick = () => {
    track("trip_planning_discovery_click", {
      source: "miles_calculator_bottom_cta",
      calculated,
    });
  };

  const headline = calculated
    ? "Found your points potential. Need help turning it into a trip?"
    : "Have the points. Not sure what to book?";

  const body = calculated
    ? "If you're unsure which redemption to pursue or you're having trouble making the booking work, book a free 20-minute discovery call."
    : "Book a free 20-minute discovery call and we'll look at what you're trying to do with your points, where you want to go, and what may be getting in the way of making the booking.";

  const targetUrl = `${TRIP_PLANNING_DISCOVERY_URL}?source=miles_calculator_bottom_cta`;

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[860px] px-5 py-20 text-center sm:px-6 md:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink/55">
          Points Trip Planning
        </p>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl leading-tight text-ink md:text-[2.5rem]">
          {headline}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-ink/75">
          {body}
        </p>
        <a
          href={targetUrl}
          onClick={handleClick}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-sm bg-ink px-8 py-4 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
        >
          Book a Free Discovery Call
        </a>
        <p className="mt-4 text-[13px] text-ink/55">
          Free discovery call · No obligation
        </p>
      </div>
    </section>
  );
}

/* ---------- Disclaimer ---------- */

function Disclaimer({ country }: { country: CountryCode }) {
  if (country === "SG") {
    return (
      <section className="border-b border-border bg-sand/40">
        <div className="mx-auto max-w-[900px] px-5 py-10 text-center text-[13px] leading-relaxed text-ink/70 sm:px-6">
          Conversion rates, transfer fees and programme terms may change. Samral does not transfer your points. Always verify the latest details with your bank or loyalty programme before making a transfer.
        </div>
      </section>
    );
  }
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
  return <SiteFooter />;
}
