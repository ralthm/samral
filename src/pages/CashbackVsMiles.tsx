import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import CashbackCardPicker from "@/components/CashbackCardPicker";
import MilesCardPicker from "@/components/MilesCardPicker";
import ComparisonCardDetails from "@/components/ComparisonCardDetails";
import { CardArtwork } from "@/components/milesCalculator/CardArtwork";
import { getProgrammeById, isDirectEarnCard, getCardById } from "@/data/milesCalculator";
import { CATEGORY_LABELS, DESTINATIONS, cardProgrammes, comparisonTargets, earningUnit, usableMilesTerms, returnMiles, publishedEconomyReturnMiles, transferForCard, type ComparisonCountry, type SpendingCategory } from "@/data/rewardComparison";
import { rewardScenario } from "@/data/rewardScenarios";
import { type RewardCategory, type RewardComparisonInput } from "@/lib/rewardComparison";
import { compareFeeScenarios, annualFlightCoverage, type AnnualFeeStatus } from "@/lib/rewardOutcomes";
import { applySeoHead } from "@/lib/seoHead";
import { track } from "@/lib/track";
import CashbackStrategyPanel from "@/components/CashbackStrategyPanel";
import { cashbackProducts } from "@/data/cashbackCards";
import { completeCashbackTerms, evaluateCashback, type SpendingProfile } from "@/lib/cashbackStrategy";

const inputClass = "min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const categories = Object.keys(CATEGORY_LABELS) as SpendingCategory[];

function NumberField({ label, value, onChange, suffix, optional = false, max }: {
  label: string; value: number | undefined; onChange: (n: number | undefined) => void; suffix?: string; optional?: boolean; max?: number;
}) {
  return <label className="grid min-w-0 gap-2 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <div className="relative">
      <input aria-label={label} type="number" inputMode="decimal" min={0} max={max} step="any" value={value ?? ""} onChange={e => {
        const n = e.target.value === "" ? undefined : Number(e.target.value);
        onChange(n === undefined ? undefined : Math.min(max ?? Infinity, Math.max(0, n)));
      }} placeholder={optional ? "Not entered" : "Enter amount"} className={`${inputClass} ${suffix ? "pr-20" : ""}`} />
      {suffix && <span className="pointer-events-none absolute right-3 top-3 text-xs text-muted-foreground">{suffix}</span>}
    </div>
  </label>;
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (s: string) => void; children: React.ReactNode }) {
  return <label className="grid min-w-0 gap-2 text-sm"><span className="text-muted-foreground">{label}</span>
    <select aria-label={label} className={inputClass} value={value} onChange={e => onChange(e.target.value)}>{children}</select>
  </label>;
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div><dt className="text-xs leading-relaxed text-muted-foreground">{label}</dt><dd className="mt-1 text-lg font-medium tabular-nums">{value}</dd>{detail && <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</dd>}</div>;
}

export default function CashbackVsMiles() {
  const [country, setCountry] = useState<ComparisonCountry>("SG");
  const [spend, setSpend] = useState<number | undefined>(3000);
  const [cashbackPercent, setCashbackPercent] = useState<number | undefined>(1.7);
  const [cashbackCap, setCashbackCap] = useState<number | undefined>();
  const [cashbackId, setCashbackId] = useState("");
  const [cardId, setCardId] = useState("");
  const [earningRate, setEarningRate] = useState<number | undefined>(1.4);
  const [city, setCity] = useState("Tokyo");
  const [programme, setProgramme] = useState("krisflyer");
  const [cabin, setCabin] = useState<"Economy" | "Business">("Economy");
  const [passengers, setPassengers] = useState(1);
  const [mode, setMode] = useState("illustrative");
  const [cashFare, setCashFare] = useState<number | undefined>(1100);
  const [taxes, setTaxes] = useState<number | undefined>(100);
  const [awardOverride, setAwardOverride] = useState<number | undefined>();
  const [targetId, setTargetId] = useState("");
  const [existing, setExisting] = useState(0);
  const [excluded, setExcluded] = useState(0);
  const [cashFee, setCashFee] = useState<number | undefined>();
  const [milesFee, setMilesFee] = useState<number | undefined>();
  const [cashFeeStatus, setCashFeeStatus] = useState<AnnualFeeStatus>("unknown");
  const [milesFeeStatus, setMilesFeeStatus] = useState<AnnualFeeStatus>("unknown");
  const [feeOverride, setFeeOverride] = useState<number | undefined>();
  const [feeConfirmed, setFeeConfirmed] = useState(false);
  const [cashMinimum, setCashMinimum] = useState(0);
  const [quarterCap, setQuarterCap] = useState<number | undefined>();
  const [cashFallback, setCashFallback] = useState(0);
  const [earnCap, setEarnCap] = useState<number | undefined>();
  const [earnFallback, setEarnFallback] = useState(0);
  const [useCategories, setUseCategories] = useState(false);
  const [categoryInputs, setCategoryInputs] = useState<Partial<Record<SpendingCategory, RewardCategory>>>({});
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [accuracyOpen, setAccuracyOpen] = useState(false);
  const [discovery, setDiscovery] = useState(false);
  const [spendingProfile, setSpendingProfile] = useState<SpendingProfile>({ monthlySpend: 3000, excludedMonthlySpend: 0, categories: {}, categoriesConfirmed: false, requirementsConfirmed: false });

  useEffect(() => applySeoHead({
    title: "Cashback vs Miles Calculator | Samral",
    description: "Compare cashback and airline miles using your spending, realistic flight costs and transfer rules. Free Singapore and Malaysia comparison with clear assumptions.",
    canonical: "https://www.samral.com/cashback-vs-miles", ogType: "website",
  }), []);
  useEffect(() => { track("cashback_vs_miles_viewed"); }, []);

  const currency = country === "SG" ? "SGD" : "MYR";
  const symbol = country === "SG" ? "S$" : "RM";
  const cash = (n: number | null) => n === null ? "—" : `${symbol}${n.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const count = (n: number) => n.toLocaleString("en-SG", { maximumFractionDigits: 2 });
  const terms = usableMilesTerms(cardId, country);
  const programmes = terms?.supportedProgrammes ?? (getCardById(cardId) ? cardProgrammes(cardId).filter(id => getProgrammeById(id)?.programmeType === "airline_miles") : ["krisflyer", "enrich", "asia-miles"]);
  const targets = useMemo(() => comparisonTargets(country, city, cabin, programme), [country, city, cabin, programme]);
  const target = targets.find(t => t.id === targetId) ?? targets[0];
  const example = rewardScenario(country, city, cabin, programme, passengers);
  const scenarioFare = mode === "illustrative" ? example.cashFare : cashFare;
  const scenarioTaxes = mode === "illustrative" ? example.awardTaxes : taxes;
  const required = awardOverride ?? (target ? returnMiles(target, passengers) : mode === "illustrative" ? example.awardMiles : undefined);
  const editFare = (value: number | undefined) => { setCashFare(value); setTaxes(scenarioTaxes); setMode("custom"); };
  const editTaxes = (value: number | undefined) => { setTaxes(value); setCashFare(scenarioFare); setMode("custom"); };
  const transfer = transferForCard(cardId, programme);
  const card = getCardById(cardId);
  const direct = isDirectEarnCard(card);
  const knownFee = terms?.transferFeeAmount ?? (transfer?.transferFeeCurrency === currency ? transfer.transferFeeAmount : undefined);
  const transferFee = feeOverride ?? knownFee ?? 0;
  const feeUnknown = !!card && !direct && knownFee === undefined && !transfer?.transferFeeSchedule && feeOverride === undefined;
  const earningConfirmed = earningRate !== undefined && (cardId === "" || !!terms || feeConfirmed);
  const inputComplete = spend !== undefined && cashbackPercent !== undefined && earningRate !== undefined;
  const selectedCashback = cashbackProducts.find(c => c.id === cashbackId && c.country === country);
  const issuerProfile = { ...spendingProfile, monthlySpend: spend ?? 0, excludedMonthlySpend: excluded };
  // Evaluate the explicit all-other-eligible assumption without changing the issuer engine.
  const provisionalCategories = !!selectedCashback && completeCashbackTerms(selectedCashback) && selectedCashback.rules.length > 0 && !spendingProfile.categoriesConfirmed;
  const estimateProfile = provisionalCategories ? { ...issuerProfile, categoriesConfirmed: true } : issuerProfile;
  const issuerCashback = selectedCashback ? evaluateCashback(selectedCashback, estimateProfile) : undefined;
  const cashbackComplete = !selectedCashback || issuerCashback?.grossAnnual != null;
  const effectiveCashFee = selectedCashback?.annualFee ?? cashFee;
  const plannedMonths = departure ? Math.max(0, (Date.parse(departure) - Date.now()) / (365.25 / 12 * 86400000)) : undefined;
  const comparisonInput: RewardComparisonInput = {
    monthlySpend: spend ?? 0, excludedMonthlySpend: excluded,
    cashbackPercent: cashbackPercent ?? 0, cashbackMonthlyCap: cashbackCap, cashbackQuarterlyCap: quarterCap,
    cashbackMinimumMonthlySpend: cashMinimum, cashbackFallbackPercent: cashFallback, cashbackAnnualFee: effectiveCashFee,
    cashbackGrossAnnualOverride: issuerCashback?.grossAnnual ?? undefined,
    earningRate: earningRate ?? 0, earningBonusSpendCap: earnCap, earningFallbackRate: earnFallback, milesAnnualFee: milesFee,
    annualTransferFee: transferFee,
    transfer: transfer ? { ...transfer, feeSchedule: feeOverride === undefined ? transfer.transferFeeSchedule : undefined } : undefined,
    categories: useCategories ? categories.map(c => categoryInputs[c] ?? { monthlySpend: 0 }) : undefined,
    cashFare: scenarioFare, awardMiles: required, awardTaxes: scenarioTaxes, existingMiles: existing, plannedMonths,
    assumptionsConfirmed: inputComplete && cashbackComplete && earningConfirmed && (!card || direct || !!transfer) && !feeUnknown,
  };
  const feeScenarios = compareFeeScenarios(comparisonInput, { status: cashFeeStatus, amount: effectiveCashFee }, { status: milesFeeStatus, amount: milesFee });
  const primaryScenario = feeScenarios[0];
  const result = primaryScenario.result;
  const unresolvedFees = primaryScenario.cashback.basis === "unresolved" || primaryScenario.miles.basis === "unresolved";
  const conditionalFees = unresolvedFees || feeScenarios.length > 1;
  const feeBasis = (basis: string, amount: number) => basis === "unresolved" ? "annual fee unknown; no deduction modelled" : basis === "waived" ? "annual fee waived" : amount === 0 ? "zero annual fee entered or sourced" : "annual fee paid";
  const coverage = annualFlightCoverage(result.annualMiles, publishedEconomyReturnMiles(target, awardOverride !== undefined));

  const resetFlight = () => { setAwardOverride(undefined); setTargetId(""); };
  const selectCountry = (value: string) => {
    setCountry(value as ComparisonCountry); setCardId(""); setCashbackId(""); setProgramme(value === "MY" ? "enrich" : "krisflyer"); setExisting(0);
    setCashbackPercent(1.7); setCashMinimum(0); setCashFallback(0); setEarnCap(undefined); setEarnFallback(0); setEarningRate(1.4); setFeeOverride(undefined); setFeeConfirmed(false); resetFlight();
    setMode("illustrative"); setCashFare(undefined); setTaxes(undefined);
    setCashFee(undefined); setMilesFee(undefined); setCashFeeStatus("unknown"); setMilesFeeStatus("unknown"); setCashbackCap(undefined); setQuarterCap(undefined);
    setUseCategories(false); setCategoryInputs({});
    setSpendingProfile({ monthlySpend: spend ?? 0, excludedMonthlySpend: 0, categories: {}, categoriesConfirmed: false, requirementsConfirmed: false }); setExcluded(0);
  };
  const selectCard = (value: string) => {
    const verified = usableMilesTerms(value, country);
    setCardId(value); setExisting(0); const available = verified?.supportedProgrammes ?? (getCardById(value) ? cardProgrammes(value).filter(id => getProgrammeById(id)?.programmeType === "airline_miles") : [country === "MY" ? "enrich" : "krisflyer"]);
    setProgramme(available.includes(programme) ? programme : available[0] ?? "krisflyer");
    setEarningRate(value ? verified?.ratePerDollar : 1.4); setMilesFee(verified?.annualFee); setMilesFeeStatus("unknown"); setFeeConfirmed(false); setFeeOverride(undefined); resetFlight();
    setEarnCap(undefined); setEarnFallback(0); setUseCategories(false); setCategoryInputs({});
    if (value && !verified) setAccuracyOpen(true);
  };
  const updateCategory = (category: SpendingCategory, key: keyof RewardCategory, value: number | undefined) => {
    setCategoryInputs(current => ({ ...current, [category]: { monthlySpend: 0, ...current[category], [key]: value } }));
  };
  const selectCashback = (id: string) => {
    setCashbackId(id); setSpendingProfile(p => ({ ...p, requirementsConfirmed: false }));
    const product = cashbackProducts.find(c => c.id === id);
    setCashbackPercent(product?.baseRatePercent ?? 1.7); setCashFee(product?.annualFee); setCashFeeStatus("unknown");
    setCashbackCap(undefined); setQuarterCap(undefined); setCashMinimum(0); setCashFallback(0);
  };

  let heading = "This card needs checked terms before comparison.";
  if (result.winner === "miles") heading = `Miles could give you ${cash(result.difference)} more estimated value per year.`;
  if (result.winner === "cashback") heading = `Cashback could give you ${cash(Math.abs(result.difference ?? 0))} more value per year.`;
  if (result.winner === "close") heading = "It’s close. Cashback and miles offer similar estimated value.";
  if (result.winner !== "incomplete" && conditionalFees) heading = `${unresolvedFees ? "Before unknown annual fees: " : "With the annual fees shown: "}${heading.charAt(0).toLowerCase()}${heading.slice(1)}`;

  return <><SiteHeader />
    <main>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1000px] px-5 pb-6 pt-7 sm:px-6 md:px-12">
          <p className="eyebrow text-muted-foreground">Samral · Free calculator</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-foreground md:text-5xl">Cashback vs Miles Calculator</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">Which gives you more value? Compare your spending with a flight you’d actually take.</p>
        </div>
      </section>

      <div className="mx-auto max-w-[1000px] px-5 py-7 sm:px-6 md:px-12">
        <div className="grid items-start gap-7">
          <section aria-label="Comparison inputs" className="min-w-0">
            <div className="mb-5 flex items-center justify-between gap-4"><p className="text-sm font-medium">Your spending & travel</p><select aria-label="Country" className="min-h-9 rounded-md border border-input bg-background px-2 text-sm" value={country} onChange={e => selectCountry(e.target.value)}><option value="SG">Singapore</option><option value="MY">Malaysia</option></select></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField label="Monthly credit card spending" value={spend} onChange={setSpend} suffix={symbol} />
              <div className="grid min-w-0 gap-2 text-sm"><div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Cashback card</span>{selectedCashback && <ComparisonCardDetails cashback={selectedCashback} />}</div><CashbackCardPicker cards={cashbackProducts.filter(c => c.country === country)} value={cashbackId} onChange={selectCashback} /></div>
              <div className="grid min-w-0 gap-2 text-sm"><div className="flex items-center justify-between gap-2"><span className="text-muted-foreground">Miles card</span><ComparisonCardDetails cardId={cardId} programme={programme} /></div><MilesCardPicker country={country} value={cardId} onChange={selectCard} rate={earningRate} /></div>
              <SelectField label="Travel destination" value={city} onChange={v => { setCity(v); resetFlight(); setMode("illustrative"); }}>{DESTINATIONS.map(d => <option key={d.name}>{d.name}</option>)}</SelectField>
            </div>
          </section>
          <section aria-label="Your comparison" className="min-w-0">
            <p className="eyebrow text-muted-foreground">{provisionalCategories ? "Provisional spending estimate" : mode === "illustrative" ? "Illustrative estimate" : "Estimate using your inputs"}</p>
            <h2 aria-live="polite" className="mt-3 font-display text-2xl leading-tight md:text-3xl">{heading}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <article className="rounded-md border border-border bg-card p-5"><h3 className="text-sm text-muted-foreground">Estimated annual cashback</h3><p className="mt-2 text-3xl font-medium tabular-nums">{inputComplete && cashbackComplete && !result.invalidCategories ? cash(result.netCashback) : "—"}</p>{inputComplete && cashbackComplete && !result.invalidCategories && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{cash(result.grossCashback)} cashback − {cash(primaryScenario.cashback.fee)} annual fee.<br />{feeBasis(primaryScenario.cashback.basis, primaryScenario.cashback.fee)}.</p>}</article>
              <article className="rounded-md border border-border bg-secondary/40 p-5"><h3 className="text-sm text-muted-foreground">Estimated annual miles value</h3><p className="mt-2 text-3xl font-medium tabular-nums">{result.winner === "incomplete" ? "—" : cash(result.netMilesValue)}</p>{result.winner !== "incomplete" && <><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{cash(result.grossMilesValue)} estimated gross miles value − {cash(primaryScenario.miles.fee)} annual fee − {cash(result.transferFee)} transfer fee.<br />{feeBasis(primaryScenario.miles.basis, primaryScenario.miles.fee)}.</p><p className="mt-2 text-xs text-muted-foreground">{count(result.annualMiles)} newly transferable miles per year</p>{coverage ? <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">Theoretically covers {count(coverage.completeReturns)} complete {city} return economy {coverage.completeReturns === 1 ? "redemption" : "redemptions"} for one traveller, with {count(coverage.remainingMiles)} miles remaining. Published requirement: {count(coverage.requiredMiles)} miles per return · {target?.programmeName}, {target?.operatingAirline}. Existing miles excluded; award availability not checked. This flight count is separate from the estimated value of all new miles.</p> : <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Annual economy flight coverage unavailable: {cabin !== "Economy" ? "economy is not selected" : awardOverride !== undefined ? "a manual award requirement is selected" : "no matching published return economy requirement"}. No flight count inferred from hypothetical mileage.</p>}</>}</article>
            </div>
            {result.winner !== "incomplete" && <p className="mt-4 text-sm font-medium">Difference: {cash(Math.abs(result.difference ?? 0))} per year</p>}
            {conditionalFees && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{unresolvedFees ? "One or both annual fee amounts are unknown. The displayed estimate deducts known fees only; an illustrative card’s missing fee is not a verified zero or waiver. Enter its annual fee or confirm a waiver in the accuracy section for a fairer comparison." : "Your fee payment status is unknown. The main estimate assumes known annual fees are paid; waiver scenarios below may change the outcome."}</p>}
            {feeScenarios.length > 1 && result.winner !== "incomplete" && <div aria-label="Annual fee scenarios" className="mt-3 border-y border-border py-3"><h3 className="text-sm font-medium">If annual fees are waived</h3><ul className="mt-2 space-y-2 text-xs leading-relaxed text-muted-foreground">{feeScenarios.slice(1).map((s, i) => <li key={i}>Cashback: {feeBasis(s.cashback.basis, s.cashback.fee)}; miles: {feeBasis(s.miles.basis, s.miles.fee)}. Cashback {cash(s.result.netCashback)} · miles value {cash(s.result.netMilesValue)} · {s.result.winner === "close" ? "similar value" : `${s.result.winner === "cashback" ? "cashback" : "miles"} ahead by ${cash(Math.abs(s.result.difference ?? 0))}`}{unresolvedFees ? " before unknown fees" : ""}.</li>)}</ul></div>}
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.winner === "incomplete" ? "Open the accuracy section to enter missing earning or fee terms. Unverified issuer terms are never replaced by a made-up card rate." : result.winner === "cashback" ? "For this flight’s estimated redemption value, cashback comes out ahead after the included fees." : result.winner === "close" ? "The values are close. Flexibility and whether you’ll use the miles matter more here." : `Your new miles are valued against a ${city} return flight. Their estimated travel value is higher, but only if you redeem at a similar value.`}</p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{mode === "illustrative" ? "Hypothetical flight fare and award charges. " : "Your entered flight fare and charges. "}{!terms || !selectedCashback ? "Manual card assumptions included. " : ""}Annual fee treatment shown above; miles value is not cash savings. No award availability checked.</p>
            {terms && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Provisional miles assumption: all eligible spending is in local currency at the base rate; no category, foreign-currency or promotional bonuses included. Monthly totals approximate transaction rounding. Annual-fee bonus miles excluded in both paid and waived spending-only scenarios. {useCategories ? "Your manual category overrides are included, not verified issuer bonuses. " : ""}Rate and fee adjustments are your inputs; Card details shows the issuer’s checked terms.</p>}
            {selectedCashback && cashbackComplete && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{provisionalCategories ? "Provisional assumption: all spending is other eligible purchases; reduced-rate spending is assumed zero. Edit the breakdown below to improve accuracy." : "Issuer cashback rules applied to your entered eligible spending; actual credits may differ with exclusions and transaction rounding."}</p>}
            {(!cashbackComplete || result.invalidCategories || feeUnknown || (cardId && !earningConfirmed) || (spend ?? 0) < excluded) && <p role="status" className="mt-3 text-sm text-destructive">{!cashbackComplete ? "This cashback card’s complete terms are unavailable; use manual assumptions or another verified card." : result.invalidCategories || (spend ?? 0) < excluded ? "Spending amounts exceed your monthly total." : feeUnknown ? "Enter a checked transfer fee in the accuracy section." : "Enter and confirm this miles card’s earning terms in the accuracy section."}</p>}
          </section>
        </div>
            <details open={accuracyOpen} onToggle={e => setAccuracyOpen(e.currentTarget.open)} className="mt-7 border-y border-border py-5">
              <summary className="cursor-pointer text-sm font-medium">Make my comparison more accurate</summary>
              <div className="mt-6 space-y-6">
                <CashbackStrategyPanel country={country} selectedId={cashbackId} onSelect={selectCashback} discovery={discovery} onDiscovery={setDiscovery} profile={issuerProfile} onProfile={p => { setSpendingProfile(p); setExcluded(p.excludedMonthlySpend); }} manualNet={result.netCashback} milesValue={result.winner === "incomplete" ? null : result.netMilesValue} />
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-lg font-medium">01 / Your cashback</h2>
              {!selectedCashback && <><div className="mt-4 grid grid-cols-2 gap-4"><NumberField label="Cashback rate" value={cashbackPercent} onChange={setCashbackPercent} suffix="%" max={100} />
                <NumberField label="Monthly cashback cap" value={cashbackCap} onChange={setCashbackCap} suffix={symbol} optional />
              </div>
              <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={cashbackCap === undefined} onChange={e => setCashbackCap(e.target.checked ? undefined : 100)} className="h-4 w-4 accent-primary" /> Uncapped cashback</label></>}
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{selectedCashback ? "Issuer terms control this card’s cashback and standard fee amount. Your paid/waived setting changes only the fee deducted, not verified earning rules. To change rates or caps, select Manual / unsupported card above." : "Manual estimate. Enter a rate that applies to your eligible spending, not an advertised category maximum."}</p>
            </div>

            <div className="mt-7 border-t border-border pt-6">
              <h2 className="text-lg font-medium">02 / Your miles</h2>
              {card && <div className="mt-3 flex items-center gap-3"><CardArtwork cardId={card.id} cardName={card.name} /><p className="text-xs leading-relaxed text-muted-foreground">{direct ? "Miles earned directly. No bank-points transfer." : `Earnings entered as ${earningUnit(cardId)}, then converted using the selected programme’s published rules.`}</p></div>}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <NumberField label={card && !direct ? `${earningUnit(cardId)} per ${symbol}1` : `Miles per ${symbol}1`} value={earningRate} onChange={setEarningRate} />
                <SelectField label="Airline programme" value={programme} onChange={v => { setProgramme(v); setExisting(0); setFeeOverride(undefined); setFeeConfirmed(false); resetFlight(); }}>
                  {programmes.map(p => <option key={p} value={p}>{getProgrammeById(p)?.name ?? p}</option>)}
                </SelectField>
              </div>
              {cardId && !terms ? <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><input type="checkbox" checked={feeConfirmed} onChange={e => setFeeConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />I’ve checked the earning rate, annual fee and exclusions for my spending. Samral’s transfer data does not verify these earning terms.</label> : <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{terms ? `Earning terms checked ${terms.verifiedOn}.` : "1.4 miles per dollar is an illustrative starting point, not a verified card rate."}</p>}
            </div>

            <div className="mt-7 border-t border-border pt-6">
              <h2 className="text-lg font-medium">03 / A flight you’d take</h2>
              <div className="mt-4 flex gap-2"><Button variant={mode === "illustrative" ? "default" : "outline"} onClick={() => { setMode("illustrative"); resetFlight(); }}>Example flight</Button><Button variant={mode === "custom" ? "default" : "outline"} onClick={() => { setCashFare(scenarioFare); setTaxes(scenarioTaxes); setMode("custom"); }}>My actual quote</Button></div>
              <p className="mt-2 text-xs text-muted-foreground">Return trip · {country === "SG" ? "from Singapore" : "from Kuala Lumpur"} · {passengers} {passengers === 1 ? "traveller" : "travellers"} · {cabin}</p>
              {targets.length > 1 && <div className="mt-4"><SelectField label="Itinerary" value={target?.id ?? ""} onChange={v => { setTargetId(v); setAwardOverride(undefined); setCashFare(undefined); setTaxes(undefined); }}>
                {targets.map(t => <option key={t.id} value={t.id}>{t.operatingAirline} · {t.originAirport}–{t.destination}{t.connectionAirports.length ? ` via ${t.connectionAirports.join(", ")}` : " · direct"}</option>)}
              </SelectField></div>}
              <div className="mt-4 grid grid-cols-2 gap-4"><NumberField label={mode === "illustrative" ? "Example cash fare (total)" : "Cash fare (total)"} value={scenarioFare} onChange={editFare} suffix={symbol} />
                <NumberField label="Award taxes & fees (total)" value={scenarioTaxes} onChange={editTaxes} suffix={symbol} /></div>
              <div className="mt-4"><NumberField label="Award miles (total return trip)" value={required} onChange={setAwardOverride} /></div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{awardOverride !== undefined ? `Your entered requirement for ${getProgrammeById(programme)?.name}. Check that it covers the full return trip for all travellers.` : target ? <>{target.programmeName} · {target.operatingAirline} · {target.originAirport} ↔ {target.destination}{target.connectionAirports.length ? ` via ${target.connectionAirports.join(", ")}` : " · direct"}. Published award requirement checked {target.awardPriceVerifiedDate ?? target.verifiedOn}. <a className="underline underline-offset-2" href={target.sourceUrl} target="_blank" rel="noreferrer">Award source</a>. Availability not checked.</> : "No matching verified award requirement in Samral’s data. The example mileage is hypothetical, not a published award. Replace it with your programme’s quote to rely on this comparison."}</p>
            </div>


                <div className="grid grid-cols-2 gap-4">
                  <SelectField label="Cabin" value={cabin} onChange={v => { setCabin(v as "Economy" | "Business"); resetFlight(); setCashFare(undefined); setTaxes(undefined); }}><option>Economy</option><option>Business</option></SelectField>
                  <NumberField label="Travellers" value={passengers} max={20} onChange={v => { setPassengers(Math.max(1, Math.floor(v ?? 1))); setAwardOverride(undefined); setCashFare(undefined); setTaxes(undefined); }} />
                  <NumberField label="Existing miles in this programme" value={existing} onChange={v => setExisting(v ?? 0)} />
                  <NumberField label="Excluded spending / month" value={excluded} onChange={v => setExcluded(v ?? 0)} suffix={symbol} />
                  <label className="grid gap-2 text-sm text-muted-foreground">Departure date<input type="date" className={inputClass} value={departure} onChange={e => setDeparture(e.target.value)} /></label>
                  <label className="grid gap-2 text-sm text-muted-foreground">Return date<input type="date" min={departure} className={inputClass} value={returnDate} onChange={e => setReturnDate(e.target.value)} /></label>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">Dates only estimate your earning timeline. They do not check flights or availability. Existing miles must belong to the selected programme; they are not counted as newly earned rewards.</p>
                <fieldset className="border-t border-border pt-4"><legend className="pr-3 text-sm font-medium">Do you actually pay the annual fees?</legend><div className="mt-3 grid grid-cols-2 gap-4">
                  <SelectField label="Cashback annual fee status" value={cashFeeStatus} onChange={v => setCashFeeStatus(v as AnnualFeeStatus)}><option value="unknown">Unknown</option><option value="paid">Paid</option><option value="waived">Waived</option></SelectField>
                  <SelectField label="Miles annual fee status" value={milesFeeStatus} onChange={v => setMilesFeeStatus(v as AnnualFeeStatus)}><option value="unknown">Unknown</option><option value="paid">Paid</option><option value="waived">Waived</option></SelectField>
                  {!selectedCashback ? <NumberField label="Cashback card annual fee" value={cashFee} onChange={setCashFee} suffix={symbol} optional /> : <p className="text-xs leading-relaxed text-muted-foreground">Sourced cashback standard annual fee: {effectiveCashFee === undefined ? "unknown" : cash(effectiveCashFee)}. Fee payment status is your input.</p>}
                  <NumberField label="Miles card annual fee" value={milesFee} onChange={setMilesFee} suffix={symbol} optional />
                </div><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Unknown payment status shows paid and waived scenarios when a positive annual fee amount is available. An unknown amount stays unresolved; no fee is invented. Waived removes only the annual card fee, not transfer charges. Annual-fee bonus miles remain excluded.</p></fieldset>
                <div className="grid grid-cols-2 gap-4">
                  {!selectedCashback && <><NumberField label="Cashback minimum spend / month" value={cashMinimum} onChange={v => setCashMinimum(v ?? 0)} suffix={symbol} />
                  <NumberField label="Quarterly cashback cap" value={quarterCap} onChange={setQuarterCap} suffix={symbol} optional />
                  <NumberField label="Base cashback outside bonuses" value={cashFallback} onChange={v => setCashFallback(v ?? 0)} suffix="%" max={100} /></>}
                  <NumberField label="One annual transfer fee" value={feeOverride ?? knownFee ?? (direct || !cardId ? 0 : undefined)} onChange={setFeeOverride} suffix={symbol} optional />
                  <NumberField label="Bonus earning spend cap / month" value={earnCap} onChange={setEarnCap} suffix={symbol} optional />
                  <NumberField label="Earning rate beyond bonus cap" value={earnFallback} onChange={v => setEarnFallback(v ?? 0)} />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">Fee amounts should include any tax. One bank-points transfer per year is assumed; additional transfers can cost more. A monthly transfer limit applies to that single transfer, not twelve transfers.</p>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-primary" checked={useCategories} onChange={e => setUseCategories(e.target.checked)} /> {selectedCashback ? "Add category miles earning assumptions" : "Add my spending categories"}</label>
                {useCategories && <div className="space-y-5">
                  <p className="text-xs leading-relaxed text-muted-foreground">Optional user-entered rates, not verified card bonuses. Leave rates blank to use your main rate. Unallocated eligible spending uses the main rate. Category totals must not exceed eligible monthly spending.</p>
                  {categories.map(c => <fieldset key={c} className="border-t border-border pt-4"><legend className="pr-3 text-sm font-medium">{CATEGORY_LABELS[c]}</legend>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberField label={`${CATEGORY_LABELS[c]} spending`} value={categoryInputs[c]?.monthlySpend ?? 0} onChange={v => updateCategory(c, "monthlySpend", v ?? 0)} suffix={symbol} />
                      {!selectedCashback && <><NumberField label="Category cashback" value={categoryInputs[c]?.cashbackPercent} onChange={v => updateCategory(c, "cashbackPercent", v)} suffix="%" max={100} optional />
                      <NumberField label="Category cashback cap / month" value={categoryInputs[c]?.cashbackMonthlyCap} onChange={v => updateCategory(c, "cashbackMonthlyCap", v)} suffix={symbol} optional />
                      <NumberField label="Base cashback after category cap" value={categoryInputs[c]?.cashbackFallbackPercent} onChange={v => updateCategory(c, "cashbackFallbackPercent", v)} suffix="%" max={100} optional /></>}
                      <NumberField label="Category earning rate" value={categoryInputs[c]?.milesRate} onChange={v => updateCategory(c, "milesRate", v)} optional />
                      <NumberField label="Category bonus spend cap" value={categoryInputs[c]?.milesBonusSpendCap} onChange={v => updateCategory(c, "milesBonusSpendCap", v)} suffix={symbol} optional />
                      <NumberField label="Base earning rate after cap" value={categoryInputs[c]?.milesFallbackRate} onChange={v => updateCategory(c, "milesFallbackRate", v)} optional />
                    </div>
                  </fieldset>)}
                </div>}
            <div className="mt-7 border-t border-border pt-6">
              <h3 className="text-lg font-medium">When could miles be worth it?</h3>
              <p className="mt-4 text-sm leading-relaxed">{result.winner === "incomplete" || result.breakEvenFare === null ? "Complete your assumptions to find the ticket price where miles could be better value." : `If your ${city} return ticket costs more than ${cash(result.breakEvenFare)}, miles could give you better value under these assumptions. Below that price, cashback could be better.`}</p>
              <div className="mt-4">
              <dl className="mt-4 grid grid-cols-2 gap-4"><Stat label="Break-even value per mile" value={result.winner === "incomplete" || result.breakEvenCents === null ? "—" : `${result.breakEvenCents.toFixed(3)}¢`} detail={`${currency} cents, including entered card and transfer fees`} /><Stat label="Break-even comparable cash fare" value={result.winner === "incomplete" ? "—" : cash(result.breakEvenFare)} detail="Full return trip, all travellers" /></dl>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Below these values, cashback offers more estimated value; above them, miles do. The comparison depends on what you would actually pay for a similar flight, not the highest advertised ticket price.</p></div>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <h3 className="text-lg font-medium">What those miles could cover</h3>
              <dl className="mt-4 grid grid-cols-2 gap-4"><Stat label="Miles for your return trip" value={required ? count(required) : "Not entered"} /><Stat label="Estimated time to earn enough" value={!earningConfirmed ? "Confirm earning rate" : result.monthsNeeded === 0 ? "Already covered" : result.monthsNeeded === null ? "Not reached" : `${result.monthsNeeded} months`} /></dl>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{existing > 0 ? `${count(existing)} existing ${getProgrammeById(programme)?.name ?? programme} miles counted only toward trip coverage, not annual rewards. ` : "No existing miles included. "}{result.monthsNeeded === 0 ? "Redeeming your current balance is a separate decision from choosing a card for future spending. " : ""}{result.readyByTrip === true ? "Your entered spending could reach the requirement by your departure date. " : result.readyByTrip === false ? "Your entered spending would not reach this award by departure. " : ""}Assumes steady spending, one transfer, no expiry and unchanged rules. Availability and transfer timing may change.</p>
            </div>

            <div className="mt-6 border-y border-border py-4"><h3 className="text-sm font-medium">How we calculated this</h3>
              <div className="mt-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
                <p>Annual eligible spending: {cash(result.annualEligibleSpend)}. Monthly and category cashback caps are applied before annualising. Quarterly caps apply four times. Annual card fees are deducted once.</p>
                <p>Net value per mile = (cash fare − award taxes and fees) ÷ award miles. Negative flight value is treated as zero, not savings. Annual miles value = newly transferable miles × this value, less the miles card annual fee and one transfer fee.</p>
                <p>Break-even value = (net annual cashback + miles card fee + transfer fee) ÷ newly transferable miles. Break-even fare adds award taxes to this value × the selected award requirement.</p>
                <p>Close means an annual value difference of no more than 0.1 percentage points of eligible spending. This is a comparison tolerance, not a card term.</p>
                <p>{selectedCashback ? "The selected issuer’s sourced cashback rules control eligible category rates and standard fees. You supply the eligible monthly amounts and exclusions. Per-transaction rounding is approximated when only monthly totals are available; actual statement credits may differ." : "Without category inputs, rates apply to eligible spending as a manual estimate. Category bonuses, excluded transactions, payment rounding and expiry are not automatically verified. Check your actual terms."} No temporary transfer bonus is included.</p>
                {transfer && <><p>Transfer ratio: {count(transfer.bankPointsPerBlock)} {earningUnit(cardId)} → {count(transfer.partnerPointsPerBlock)} {getProgrammeById(programme)?.name} miles. {count(result.untransferredRewards)} bank reward units remain outside this annual transfer. Transfer data checked {transfer.verifiedOn}.</p><p><a href={transfer.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">Published transfer source</a>. {transfer.processingTime ?? "Transfer timing is not confirmed here."} {transfer.notes}</p></>}
                <p>Transfer fee in this annual scenario: {cash(result.transferFee)}. Annual fees deducted: cashback {cash(primaryScenario.cashback.fee)} ({feeBasis(primaryScenario.cashback.basis, primaryScenario.cashback.fee)}), miles {cash(primaryScenario.miles.fee)} ({feeBasis(primaryScenario.miles.basis, primaryScenario.miles.fee)}). Unknown fee amounts are not verified zeroes. Points expiry is not verified for this comparison.</p>
                <p>{mode === "illustrative" ? "Illustrative fares and taxes are hypothetical, with no fare source or verification date claimed. Award miles use a matching published itinerary where available; otherwise the example requirement is also hypothetical." : "Custom fares, taxes and overridden award requirements are supplied by you, not independently verified by Samral."} No live prices or award availability are checked.</p>
              </div>
            </div>
              </div>
            </details>
            <div className="mt-7"><h3 className="text-lg font-medium">Already have bank points or airline miles?</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Samral can help you work out which flights your existing points could cover and whether redeeming them makes financial sense.</p>
              <Button asChild variant="outline" className="mt-4"><Link to="/trip-planning" onClick={() => track("cashback_vs_miles_trip_plan_clicked")}>Explore Points Trip Planning <ArrowRight aria-hidden="true" /></Link></Button>
              <Link to="/miles-calculator" className="mt-4 block text-xs text-muted-foreground underline underline-offset-4">Convert my existing bank points with the Miles Calculator</Link>
            </div>
      </div>
    </main><SiteFooter /></>;
}