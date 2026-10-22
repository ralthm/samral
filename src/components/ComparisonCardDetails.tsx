import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cashbackName, CASHBACK_CATEGORIES, type CashbackProduct } from "@/data/cashbackCards";
import { completeCashbackTerms } from "@/lib/cashbackStrategy";
import { getCardById } from "@/data/milesCalculator";
import { usableMilesTerms, transferForCard, earningUnit } from "@/data/rewardComparison";
import { getCountryForCard } from "@/data/milesCalculator";

export default function ComparisonCardDetails({ cashback, cardId, programme, children }: { cashback?: CashbackProduct; cardId?: string; programme?: string; children?: ReactNode }) {
  const card = cardId ? getCardById(cardId) : undefined;
  const country = card ? getCountryForCard(card) : undefined;
  const terms = cardId && (country === "SG" || country === "MY") ? usableMilesTerms(cardId, country) : undefined;
  const transfer = cardId && programme ? transferForCard(cardId, programme) : undefined;
  return <Dialog><DialogTrigger asChild><Button variant="link" size="sm" className="h-auto px-0 py-0 text-xs">Card details</Button></DialogTrigger>
    <DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{cashback ? cashbackName(cashback) : card?.name ?? "Illustrative miles"}</DialogTitle></DialogHeader>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        {cashback ? <>
          <p>{completeCashbackTerms(cashback) ? `Verified ongoing issuer terms · checked ${cashback.verifiedOn}.` : `Incomplete terms: ${cashback.reviewNotes ?? "Awaiting verification."} No issuer calculation is available.`}</p>
          {completeCashbackTerms(cashback) && <><p>{cashback.baseRatePercent}% base cashback. Standard annual fee {cashback.country === "SG" ? "S$" : "RM"}{cashback.annualFee?.toFixed(2)}. No waiver assumed. {cashback.minimumMonthlySpend ? `Monthly minimum ${cashback.minimumMonthlySpend}.` : "No earning minimum."} {cashback.monthlyCap === undefined ? "No overall cashback cap." : `Monthly cap ${cashback.monthlyCap}.`}</p>
            {cashback.rules.map((r, i) => <p key={i}>{r.categories.map(c => CASHBACK_CATEGORIES[c]).join(" / ")}: {r.ratePercent}%{r.monthlyCap !== undefined ? `; monthly cap ${r.monthlyCap}` : ""}{r.monthlySpendCap !== undefined ? `; on up to ${r.monthlySpendCap} monthly spending` : ""}; {r.fallbackPercent}% beyond the bonus.</p>)}
            <p>Excluded: {cashback.exclusions.join("; ")}.</p>
            {cashback.excludedMccs && <p className="break-words">Excluded merchant codes: {cashback.excludedMccs.join(", ")}. {cashback.excludedDescriptions?.join("; ")}</p>}
            {cashback.reducedRateMccs && <p className="break-words">Reduced-rate merchant codes: {cashback.reducedRateMccs.join(", ")}.</p>}
            <p>{cashback.payoutNotes}</p>{cashback.requirements.map(r => <p key={r}>{r}</p>)}</>}
          {cashback.sourceUrls.map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer" className="block break-words underline">Official issuer source {i + 1}</a>)}
        </> : <>
          <p>{terms ? `Verified eligible-local-spending terms: ${terms.ratePerDollar} ${earningUnit(cardId ?? "")} per local dollar · checked ${terms.verifiedOn}. Standard annual fee ${country === "SG" ? "S$" : "RM"}${terms.annualFee?.toFixed(2)}. Exclusions: ${terms.exclusions.join("; ")}.` : card ? "Spending earning rates, annual fees and exclusions are not completely verified for this card. Enter your checked terms in the accuracy section; transfer data alone does not verify earning rewards." : "Manual miles earning and annual-fee assumptions are editable, not a verified issuer offer."}</p>
          {terms?.assumptions?.map(note => <p key={note}>{note}</p>)}
          {terms && [terms.sourceUrl, ...(terms.sourceUrls ?? [])].map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer" className="block break-words underline">Official miles issuer source {i + 1}</a>)}
          {transfer && <><p>Published conversion: {transfer.bankPointsPerBlock} bank points → {transfer.partnerPointsPerBlock} partner miles. Checked {transfer.verifiedOn}. {transfer.notes}</p><a href={transfer.sourceUrl} target="_blank" rel="noreferrer" className="block underline">Transfer source</a></>}
        </>}
        {children}
      </div>
    </DialogContent>
  </Dialog>;
}