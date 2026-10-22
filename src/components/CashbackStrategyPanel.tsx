import { Button } from "@/components/ui/button";
import CashbackCardPicker from "./CashbackCardPicker";
import { cashbackProducts, cashbackName, CASHBACK_CATEGORIES, type CashbackCategory } from "@/data/cashbackCards";
import { completeCashbackTerms, evaluateCashback, rankCashback, type SpendingProfile } from "@/lib/cashbackStrategy";
import type { ComparisonCountry } from "@/data/rewardComparison";

const fieldClass = "min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
export default function CashbackStrategyPanel({ country, selectedId, onSelect, discovery, onDiscovery, profile, onProfile, manualNet, milesValue }: {
  country: ComparisonCountry; selectedId: string; onSelect: (id: string) => void; discovery: boolean; onDiscovery: (value: boolean) => void;
  profile: SpendingProfile; onProfile: (profile: SpendingProfile) => void; manualNet: number; milesValue: number | null;
}) {
  const products = cashbackProducts.filter(c => c.country === country);
  const selected = products.find(c => c.id === selectedId);
  const verified = selected && completeCashbackTerms(selected);
  const needCategories = verified && selected.rules.length > 0 || discovery && products.some(c => completeCashbackTerms(c) && c.rules.length > 0);
  const needRequirements = verified && selected.requirements.length > 0 || discovery && products.some(c => completeCashbackTerms(c) && c.requirements.length > 0);
  const current = selected ? evaluateCashback(selected, profile) : null;
  const ranking = rankCashback(products, profile);
  const currentValue = selected ? current?.netAnnual : manualNet;
  const stronger = currentValue !== null && currentValue !== undefined ? ranking.find(r => r.card.id !== selectedId && r.netAnnual > currentValue) : undefined;
  const money = (n: number) => `${country === "SG" ? "S$" : "RM"}${n.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return <div className="mt-6 space-y-5">
    <div className="grid gap-2" role="group" aria-label="Card comparison goal">
      <Button variant={!discovery ? "default" : "outline"} aria-pressed={!discovery} className="h-auto min-h-11 whitespace-normal" onClick={() => onDiscovery(false)}>Compare cards I already have</Button>
      <Button variant={discovery ? "default" : "outline"} aria-pressed={discovery} className="h-auto min-h-11 whitespace-normal" onClick={() => onDiscovery(true)}>Find the best strategy for my spending</Button>
    </div>
    <CashbackCardPicker cards={products} value={selectedId} onChange={onSelect} />
    {selected ? <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
      <p>{verified ? `Principal-card ongoing spending terms checked ${selected.verifiedOn}. Standard annual fee ${money(selected.annualFee ?? 0)} deducted; no fee waiver assumed.` : `${selected.reviewNotes ?? "Complete issuer terms are not verified."} This card is not calculated or ranked. Use manual terms for your own estimate.`}</p>
      {verified && <><p>{selected.rules.length ? "Category cashback depends on eligible merchant codes and the breakdown below." : `${selected.baseRatePercent}% on eligible spending; no category breakdown required.`}{selected.minimumMonthlySpend ? ` Minimum eligible spending ${money(selected.minimumMonthlySpend)} per month.` : ""}{selected.monthlyCap !== undefined ? ` Overall monthly cap ${money(selected.monthlyCap)}.` : ""}</p>
        {selected.rules.map((r, i) => <p key={i}>{r.categories.map(c => CASHBACK_CATEGORIES[c]).join(" / ")}: {r.ratePercent}%{r.monthlyCap !== undefined ? `, capped at ${money(r.monthlyCap)} / month` : ""}{r.monthlySpendCap !== undefined ? ` on up to ${money(r.monthlySpendCap)} spending / month` : ""}; {r.fallbackPercent}% beyond the bonus.</p>)}
        <p>Excluded: {selected.exclusions.join("; ")}. Enter these transactions in excluded spending.</p>
        {selected.payoutNotes && <p>{selected.payoutNotes}</p>}
        {selected.reducedRateMccs && <details><summary className="cursor-pointer">Reduced-rate merchant codes</summary><p className="mt-2 break-words">{selected.reducedRateMccs.join(", ")}. Classify these and Grab wallet top-ups in the reduced-rate amount, not the normal spending buckets.</p></details>}
        {selected.excludedMccs && <details><summary className="cursor-pointer">Excluded merchant codes</summary><p className="mt-2 break-words">{selected.excludedMccs.join(", ")}. {selected.excludedDescriptions?.join("; ")}. The issuer’s current source controls any additional exclusions.</p></details>}
        {selected.requirements.map(r => <p key={r}>{r}</p>)}
      </>}
      {selected.sourceUrls.map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer" className="mr-3 inline-block underline underline-offset-2">Official issuer source {i + 1}</a>)}
    </div> : <p className="text-xs leading-relaxed text-muted-foreground">Manual card: your entered rate, caps and fees are assumptions, not verified issuer terms.</p>}
    {needCategories && <fieldset className="border-t border-border pt-4"><legend className="pr-3 text-sm font-medium">Eligible monthly spending</legend>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">Use mutually exclusive amounts. Unallocated spending is “Other”. In discovery, exclude anything ineligible for any compared card so every option uses the same eligible spending.</p>
      <div className="grid grid-cols-2 gap-3">{Object.entries(CASHBACK_CATEGORIES).filter(([key]) => key !== "other" && (discovery || selected?.rules.some(r => r.categories.includes(key as CashbackCategory)))).map(([key, label]) => <label key={key} className="grid min-w-0 gap-2 text-sm text-muted-foreground">{label}<input aria-label={`${label} eligible spending`} className={fieldClass} type="number" inputMode="decimal" min={0} value={profile.categories[key as CashbackCategory] ?? ""} placeholder="0" onChange={e => onProfile({ ...profile, categories: { ...profile.categories, [key]: Math.max(0, Number(e.target.value)) }, categoriesConfirmed: false })} /></label>)}</div>
      <label className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-primary" checked={profile.categoriesConfirmed} onChange={e => onProfile({ ...profile, categoriesConfirmed: e.target.checked })} />These amounts are eligible spending; the remaining amount is other eligible spending.</label>
    </fieldset>}
    {(verified || discovery) && <label className="grid gap-2 text-sm text-muted-foreground">Excluded transactions / month<input aria-label="Excluded transactions / month" type="number" inputMode="decimal" min={0} className={fieldClass} value={profile.excludedMonthlySpend} onChange={e => onProfile({ ...profile, excludedMonthlySpend: Math.max(0, Number(e.target.value)) })} /></label>}
    {needRequirements && <label className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-primary" checked={profile.requirementsConfirmed} onChange={e => onProfile({ ...profile, requirementsConfirmed: e.target.checked })} />I meet the non-spending requirements shown for the conditional cards, including eligible payment methods. Otherwise those cards are not ranked.</label>}
    {current?.reason && <p role="status" className="text-sm text-muted-foreground">{current.reason}</p>}
    {discovery && <section aria-label="Card strategy ranking" className="space-y-4 border-y border-border py-5">
      <h2 className="text-lg font-medium">Your single-card alternatives</h2>
      <p className="text-xs leading-relaxed text-muted-foreground">Estimated net annual value, after standard fees. Same eligible spending each month; no sign-up bonuses or assumed fee waivers. Per-transaction rounding is approximated from monthly totals where applicable. Limited to complete verified cards, not the whole market. Approval and personal eligibility are not assessed.</p>
      <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">Qualification and sources for compared cards</summary><div className="mt-3 space-y-3">{products.filter(c => completeCashbackTerms(c)).map(c => <div key={c.id}><p className="font-medium text-foreground">{cashbackName(c)} · checked {c.verifiedOn} · standard fee {money(c.annualFee ?? 0)}</p><p>{c.exclusions.join("; ")}. {c.payoutNotes}</p>{c.sourceUrls.map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer" className="mr-3 underline">Official source {i + 1}</a>)}</div>)}</div></details>
      <div><h3 className="text-sm font-medium">Current card · {selected ? cashbackName(selected) : "Manual cashback"}</h3><p className="text-sm text-muted-foreground">{currentValue == null ? "Insufficient verified terms" : `${money(currentValue)} / year${selected ? "" : " · your assumptions"}`}</p></div>
      <div><h3 className="text-sm font-medium">Stronger cashback alternative</h3>{stronger ? <><p className="text-sm">{cashbackName(stronger.card)} · {money(stronger.netAnnual)} / year</p><Button variant="outline" size="sm" className="mt-2" onClick={() => onSelect(stronger.card.id)}>Compare this card</Button></> : <p className="text-sm text-muted-foreground">{currentValue == null ? "Complete your current card details before judging an improvement." : "No stronger option established from the verified cards and your confirmed spending."}</p>}</div>
      <div><h3 className="text-sm font-medium">Miles alternative</h3><p className="text-sm text-muted-foreground">No fully verified spending-earning records yet; no actual miles card is ranked.{milesValue !== null ? ` Your current miles assumptions estimate ${money(milesValue)} / year, not a verified card offer.` : ""}</p></div>
      {ranking.length > 0 && <ol className="divide-y divide-border">{ranking.map((r, index) => <li key={r.card.id} className="py-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><span>{index + 1}. {cashbackName(r.card)}</span><span className="tabular-nums">{money(r.netAnnual)} / year</span></div>{r.reason && <p className="mt-1 text-xs text-muted-foreground">{r.reason}</p>}</li>)}</ol>}
      {!ranking.length && <p className="text-sm text-muted-foreground">No cards can be ranked with the current verified data and confirmed eligibility.</p>}
      {country === "MY" && <p className="text-xs text-muted-foreground">Malaysia uses the same comparison rules. Official spending terms are awaiting verification; manual comparisons remain available.</p>}
    </section>}
  </div>;
}