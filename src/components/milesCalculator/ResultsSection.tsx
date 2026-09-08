/**
 * Results section of the Miles Calculator.
 *
 * Loaded lazily: none of this code (nor the redemption-target dataset it
 * pulls in) is required to render Step 1/Step 2, so it stays out of the
 * initial route chunk until a calculation actually produces results.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ExternalLink, Pencil } from "lucide-react";
import TravellersInput from "@/components/TravellersInput";
import { AllianceBadge, AllianceInfo } from "@/components/AllianceInfo";
import {
  eligibleCardGroups,
  getBankById,
  getBanksByCountry,
  getCardGroupById,
  getProgrammeById,
  getPublicRulesForCardGroup,
  getRewardProductById,
  loyaltyProgrammes,
} from "@/data/milesCalculator";
import { promotions as promotionRecords } from "@/data/promotions";
import { getActivePromotions, Promotion } from "@/data/promotions";
import type { PromotionApplication } from "@/lib/milesCalculator";
import { formatInt, ProgrammeTotal, RuleResult } from "@/lib/milesCalculator";
import {
  Cabin,
  CABINS,
  computeRequiredPoints,
  isTargetPublic,
  outboundPointsForParty,
  pointsPerPersonPerDirection,
  type MarketCountry,
  originLabelForCountry,
  RedemptionTarget,
  targetsForCountry,
  Region,
  REGIONS,
  SUPPORTED_PROGRAMMES,
  verifiedCabinsPresent,
} from "@/data/redemptionTargets";
import { classifyRedemption } from "@/lib/redemptionStatus";
import { awardDisclaimersFor, UNIVERSAL_AWARD_DISCLAIMER } from "@/lib/awardDisclaimers";
import { computeTransferFees, FEE_SYMBOL, formatFee } from "@/lib/transferFees";
import { ratesDirectoryCaption, ratesDirectoryHeading } from "@/lib/marketCopy";
import { saveTripContext, TripContext } from "@/lib/tripContext";
import { track } from "@/lib/track";
import type { Snapshot } from "./types";

const STRATEGY_URL = "/points-strategy";
const TRIP_PLANNING_DISCOVERY_URL = "https://cal.com/samral/trip-planning-discovery-call-20-mins";
const PRIORITY_PROGRAMMES = ["enrich", "krisflyer", "asia-miles"];

export default function ResultsSection(props: {
  snapshot: Snapshot;
  country: MarketCountry;
  isStale: boolean;
  onEdit: () => void;
  registeredPromotionIds: string[];
  onToggleRegistration: (promotionId: string, registered: boolean) => void;
}) {
  return (
    <>
      <ResultsDashboard {...props} />
      <PostCalcCTA />
      <QuickReference country={props.country} />
    </>
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
  snapshot, country, isStale, onEdit, registeredPromotionIds, onToggleRegistration,
}: {
  snapshot: Snapshot;
  country: MarketCountry;
  isStale: boolean;
  onEdit: () => void;
  registeredPromotionIds: string[];
  onToggleRegistration: (promotionId: string, registered: boolean) => void;
}) {
  const { results, portfolio, entryContext } = snapshot;
  const registeredSet = useMemo(() => new Set(registeredPromotionIds), [registeredPromotionIds]);

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

        <PromoBanner
          portfolio={portfolio}
          registeredSet={registeredSet}
          onToggleRegistration={onToggleRegistration}
        />

        {portfolio.length > 1 && (
          <div className="mt-6 rounded-sm border border-ink/30 bg-background p-4 text-[13px] leading-relaxed text-ink/80">
            Your bank points can be transferred into different loyalty programmes. The full balances shown are alternative transfer scenarios unless you choose to split your bank points between programmes.
          </div>
        )}

        {/* Programme balance cards */}
        <div className="mt-10 space-y-10">
          {(Object.keys(grouped) as GroupKey[]).map((k) => {
            if (grouped[k].length === 0) return null;
            const cards = (list: ProgrammeTotal[]) =>
              list.map((p) => (
                <ProgrammeBalanceCard
                  key={p.programmeId}
                  programme={p}
                  rowResults={resultsByProgramme.get(p.programmeId) ?? []}
                  entryContext={entryContext}
                  registeredSet={registeredSet}
                  onToggleRegistration={onToggleRegistration}
                />
              ));

            if (k === "airline") {
              return (
                <FeaturedAirlineProgrammes
                  key={k}
                  country={country}
                  programmes={grouped[k]}
                  renderCards={cards}
                />
              );
            }

            return (
              <div key={k}>
                <h3 className="text-[11px] uppercase tracking-[0.18em] text-ink/55">{GROUP_LABEL[k]}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">{cards(grouped[k])}</div>
              </div>
            );
          })}
        </div>

        {/* Destination discovery */}
        <DestinationDiscovery portfolio={portfolio} registeredSet={registeredSet} country={country} />

      </div>
    </section>
  );
}

/* ---------- Featured airline programmes ---------- */

/**
 * Commonly useful airline programmes per card-issuance market. This is an
 * editorial shortlist, not a ranking and not a claim of best value: no score
 * is computed and mileage balances never affect the order. A featured
 * programme is only shown when the user's own cards can actually reach it (or
 * they entered a balance in it) — the portfolio already guarantees that.
 */
const FEATURED_AIRLINE_PROGRAMMES: Record<MarketCountry, string[]> = {
  MY: ["enrich", "krisflyer", "asia-miles"],
  SG: ["krisflyer", "asia-miles", "ba"],
  HK: ["asia-miles", "krisflyer", "ba"],
};

const MARKET_NAME: Record<MarketCountry, string> = {
  MY: "Malaysia",
  SG: "Singapore",
  HK: "Hong Kong",
};

const FEATURED_LIMIT = 3;

function FeaturedAirlineProgrammes({
  country, programmes, renderCards,
}: {
  country: MarketCountry;
  programmes: ProgrammeTotal[];
  renderCards: (list: ProgrammeTotal[]) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  const { featured, rest } = useMemo(() => {
    const order = FEATURED_AIRLINE_PROGRAMMES[country] ?? [];
    const picked: ProgrammeTotal[] = [];
    for (const id of order) {
      const match = programmes.find((p) => p.programmeId === id);
      if (match) picked.push(match);
    }
    // Fill any empty slots with other reachable airline programmes, keeping
    // the existing list order.
    for (const p of programmes) {
      if (picked.length >= FEATURED_LIMIT) break;
      if (!picked.some((x) => x.programmeId === p.programmeId)) picked.push(p);
    }
    const top = picked.slice(0, FEATURED_LIMIT);
    return {
      featured: top,
      rest: programmes.filter((p) => !top.some((x) => x.programmeId === p.programmeId)),
    };
  }, [country, programmes]);

  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Featured programmes</h3>
      <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-ink/70">
        Commonly useful airline programmes for cards issued in {MARKET_NAME[country]}. Your best option depends on where and how you want to travel.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{renderCards(featured)}</div>

      {rest.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-4 inline-flex items-center gap-2 text-[13px] text-ink underline underline-offset-4"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Hide other airline programmes" : `View all airline programmes (${rest.length} more)`}
          </button>
          {expanded && <div className="mt-4 grid gap-4 md:grid-cols-2">{renderCards(rest)}</div>}
        </>
      )}
    </div>
  );
}

/** Human label for a source-provenance type. Distinguishes an official
 * published source from a verified current award reference. */
function sourceTypeLabel(t?: string): string {
  switch (t) {
    case "official_bank": return "official bank source";
    case "official_loyalty_programme": return "official programme source";
    case "official_airline": return "official airline source";
    case "verified_secondary": return "verified award reference";
    default: return "official source";
  }
}

/* ---------- Promotion helpers ---------- */

function promotionRecord(id: string) {
  return promotionRecords.find((p) => p.id === id);
}

/** Customer-facing attribution. Never describes the Enrich bank-conversion
 * promotion as "airline-funded" — it is an Enrich promotion run with
 * participating banks. */
function promotionSponsorLabel(p: PromotionApplication): string {
  const rec = promotionRecord(p.id);
  if (rec?.sponsorLabel) return rec.sponsorLabel;
  return p.sponsor === "airline" ? "Airline promotion" : "Bank promotion";
}

/** Subtle supporting information (points validity, per-member daily caps). */
function promotionValidityLines(p: PromotionApplication): string[] {
  const rec = promotionRecord(p.id);
  if (!rec) return [];
  const lines: string[] = [];
  if (rec.basePointsValidity) lines.push(rec.basePointsValidity);
  if (rec.bonusPointsValidity) lines.push(rec.bonusPointsValidity);
  if (rec.dailyCapPartnerPoints) {
    lines.push(`Maximum ${formatInt(rec.dailyCapPartnerPoints)} points per member per day under this promotion.`);
  }
  if (rec.sourceName) {
    lines.push(`Source: ${rec.sourceName}${rec.verifiedAt ? ` · Last verified ${formatDate(rec.verifiedAt)}` : ""}`);
  }
  return lines;
}

/* ---------- Promotion banner ---------- */

function PromoBanner({
  portfolio, registeredSet, onToggleRegistration,
}: {
  portfolio: ProgrammeTotal[];
  registeredSet: Set<string>;
  onToggleRegistration: (promotionId: string, registered: boolean) => void;
}) {
  // Group the currently-applicable promotions by programme so we can render
  // a stacked "Up to X% Extra …" campaign card when multiple sponsors share
  // the same destination programme (e.g. Cathay + CIMB Asia Miles).
  const groups = useMemo(() => {
    const byProgramme = new Map<string, ProgrammeTotal>();
    for (const p of portfolio) {
      if (p.promotions.length > 0) byProgramme.set(p.programmeId, p);
    }
    return Array.from(byProgramme.values());
  }, [portfolio]);

  useEffect(() => {
    for (const g of groups) {
      for (const p of g.promotions) track("promotion_shown", { promotion: p.id });
    }
  }, [groups]);

  if (groups.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      {groups.map((g) => {
        const totalPercent = g.promotions
          .filter((p) => p.bonusType === "percentage")
          .reduce((s, p) => s + (p.bonusPercentage ?? 0), 0);
        const title = totalPercent > 0
          ? `Up to ${totalPercent}% Extra ${g.programmeName}`
          : `Bonus ${g.programmeName}`;
        return (
          <div key={g.programmeId} role="status" className="rounded-sm border border-ink bg-background p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink">
                  <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Promotion currently active
                </p>
                <p className="mt-2 font-display text-2xl text-ink md:text-3xl">{title}</p>
                <ul className="mt-3 space-y-2 text-[13px] text-ink/80">
                  {g.promotions.map((p) => {
                    const registered = registeredSet.has(p.id);
                    return (
                      <li key={p.id} className="rounded-sm border border-border bg-sand/40 p-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-medium text-ink">
                            {promotionSponsorLabel(p)} · {p.bonusPercentage ?? 0}% bonus
                          </span>
                          <span className="text-[11px] text-ink/60">Ends {formatDate(p.endDate)}</span>
                        </div>
                        <p className="mt-1 text-[12px] text-ink/70">{p.name}</p>
                        {p.registrationRequired && (
                          <label className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-ink">
                            <input
                              type="checkbox"
                              checked={registered}
                              onChange={(e) => onToggleRegistration(p.id, e.target.checked)}
                              className="h-4 w-4"
                            />
                            <span>Yes, I have registered for this bonus.</span>
                          </label>
                        )}
                        {p.registrationRequired && !registered && (
                          <p className="mt-1 text-[11px] text-ink/60">
                            Registration must be completed BEFORE converting for this bonus to apply.
                          </p>
                        )}
                        {p.overallBonusCap && (
                          <p className="mt-1 text-[11px] text-ink/55">
                            Subject to a campaign-wide cap of {formatInt(p.overallBonusCap)} {g.programmeName}.
                          </p>
                        )}
                        {promotionValidityLines(p).map((line) => (
                          <p key={line} className="mt-1 text-[11px] text-ink/55">{line}</p>
                        ))}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3 text-[11px] leading-relaxed text-ink/60">
                  Confirm the promotion requirements and your loyalty membership details before transferring. Points conversions are generally irreversible.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {Array.from(new Set(g.promotions.map((p) => p.officialSource))).map((src) => (
                  <a
                    key={src}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] text-ink underline underline-offset-4 hover:no-underline"
                  >
                    See terms <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


/* ---------- Programme balance card ---------- */

function ProgrammeBalanceCard({
  programme, rowResults, entryContext, registeredSet, onToggleRegistration,
}: {
  programme: ProgrammeTotal;
  rowResults: RuleResult[];
  entryContext: Snapshot["entryContext"];
  registeredSet: Set<string>;
  onToggleRegistration: (promotionId: string, registered: boolean) => void;
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

  const applicablePromos = programme.promotions;
  const hasApplicablePromo = applicablePromos.length > 0;
  const hasAppliedBonus = programme.bonusTotal > 0;
  const hasConditionalBonus = programme.conditionalBonusTotal > 0;
  const headlineTotal = programme.maxPromotionalTotal > programme.potentialTotal
    ? programme.maxPromotionalTotal
    : programme.potentialTotal;

  // When this programme's balance comes from exactly one bank-point currency
  // and there are no unresolved conditional bonuses, the figure represents one
  // defined full-transfer scenario, so we can state it precisely rather than
  // hedging with "up to".
  const fullTransferBasis = useMemo(() => {
    if (hasConditionalBonus) return null;
    const currencies = new Set(rowResults.map((r) => r.rewardCurrencyName));
    if (currencies.size !== 1) return null;
    const points = rowResults.reduce((sum, r) => sum + r.bankPointsUsed, 0);
    if (points <= 0) return null;
    return { points, currency: rowResults[0].rewardCurrencyName };
  }, [rowResults, hasConditionalBonus]);

  // Cash conversion fees for THIS destination programme only. One transfer per
  // contributing bank; alternative programme scenarios are never summed.
  // A bank is only charged when it actually contributes a valid, non-zero
  // conversion to THIS programme. Below a minimum transfer, or with no bank
  // points used, that bank contributes no miles and therefore no fee.
  const fees = useMemo(
    () => computeTransferFees(rowResults
      .filter((r) => r.partnerPointsReceived > 0 && r.bankPointsUsed > 0)
      .map((r) => ({
      bankId: r.bankId,
      bankName: r.bankName,
      transferFeeAmount: r.transferFeeAmount,
      transferFeeCurrency: r.transferFeeCurrency,
      partnerPointsReceived: r.partnerPointsReceived,
    }))),
    [rowResults],
  );

  // Published bank conversion caps we cannot verify against the user's own
  // transfer history.
  const capWarnings = useMemo(
    () => Array.from(new Set(rowResults.map((r) => r.capWarning).filter(Boolean) as string[])),
    [rowResults],
  );
  const capsHit = useMemo(
    () => rowResults.filter((r) => r.capApplied),
    [rowResults],
  );

  return (
    <div className={`rounded-sm border bg-background p-6 ${hasApplicablePromo ? "border-ink" : "border-border"}`}>
      {hasApplicablePromo ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/55">Standard</p>
            <p className="mt-2 font-display text-3xl leading-none text-ink/70 md:text-[36px]">
              {formatInt(programme.potentialTotal)}
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-ink/60">
              <span>{programme.programmeName}</span>
              <AllianceBadge programmeId={programme.programmeId} />
            </p>
          </div>
          <div className="sm:border-l sm:border-border sm:pl-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink">
              {hasConditionalBonus ? "Maximum promotional potential" : "During current promotion"}
            </p>
            <p className="mt-2 font-display text-4xl leading-none text-ink md:text-[44px]">
              {formatInt(headlineTotal)}
            </p>
            <p className="mt-2 text-[12px] text-ink">
              {hasConditionalBonus ? "up to " : ""}+{formatInt(programme.bonusTotal + programme.conditionalBonusTotal)} bonus {programme.programmeName}
            </p>
            {fullTransferBasis && (
              <p className="mt-1 text-[11px] leading-relaxed text-ink/60">
                {formatInt(headlineTotal)} {programme.programmeName} if all {formatInt(fullTransferBasis.points)} {fullTransferBasis.currency} are transferred to {programme.programmeName}.
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <p className="text-[11px] uppercase tracking-[0.16em] text-ink/55">Potential balance</p>
          <p className="mt-2 font-display text-4xl leading-none text-ink md:text-[44px]">
            {formatInt(programme.potentialTotal)}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-ink/70">
            <span>{programme.programmeName}</span>
            <AllianceBadge programmeId={programme.programmeId} />
          </p>
        </>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-y-2 border-t border-border pt-4 text-[12px]">
        <dt className="text-ink/55">Transferable from bank points</dt>
        <dd className="text-right text-ink">{formatInt(programme.transferredTotal)}</dd>
        {applicablePromos.map((p) => {
          const isRegistered = registeredSet.has(p.id);
          const contributes = p.applied || !p.registrationRequired;
          const label = p.sponsor === "airline"
            ? `${p.name} (${p.bonusPercentage ?? 0}%)`
            : `${p.name} (${p.bonusPercentage ?? 0}%)`;
          // Per-programme bonus contribution = sum across rowResults for this promo id.
          const contribution = rowResults.reduce((s, r) => {
            const a = r.promotions.find((x) => x.id === p.id);
            return s + (a ? a.bonus : 0);
          }, 0);
          if (contribution <= 0) return null;
          return (
            <FragmentRow
              key={p.id}
              label={label}
              value={contributes
                ? `+${formatInt(contribution)}`
                : `+${formatInt(contribution)} (after registration)`}
              muted={!contributes}
            />
          );
        })}
        <dt className="text-ink/55">Existing balance</dt>
        <dd className="text-right text-ink">{formatInt(programme.existingBalance)}</dd>
        {hasApplicablePromo && (
          <>
            <dt className="border-t border-border pt-2 font-medium text-ink">
              {hasConditionalBonus ? "Potential after an eligible registered transfer" : "Final promotional balance"}
            </dt>
            <dd className="border-t border-border pt-2 text-right font-medium text-ink">
              {hasConditionalBonus ? "up to " : ""}{formatInt(headlineTotal)} {programme.programmeName}
            </dd>
          </>
        )}
      </dl>

      {applicablePromos.map((p) => {
        const isRegistered = registeredSet.has(p.id);
        if (!p.registrationRequired || isRegistered) return null;
        const contribution = rowResults.reduce((s, r) => {
          const a = r.promotions.find((x) => x.id === p.id);
          return s + (a ? a.bonus : 0);
        }, 0);
        if (contribution <= 0) return null;
        return (
          <div key={p.id} className="mt-3 rounded-sm border border-ink/30 bg-sand/40 p-3 text-[12px] text-ink">
            <p className="font-medium">
              Additional {formatInt(contribution)} {programme.programmeName} available after registration
            </p>
            <p className="mt-1 text-ink/70">
              {p.name} requires registration BEFORE the conversion. Confirm registration above to include this bonus in your balance.
            </p>
          </div>
        );
      })}

      {hasApplicablePromo && (
        <p className="mt-3 text-[11px] leading-relaxed text-ink/60">
          {applicablePromos.map((p) => `${p.name} — valid until ${formatDate(p.endDate)}`).join(" · ")}
        </p>
      )}

      {capsHit.length > 0 && (
        <div className="mt-3 rounded-sm border border-ink/30 bg-sand/40 p-3 text-[12px] text-ink">
          {capsHit.map((r) => (
            <p key={`${r.entryId}-cap`} className="mt-1 first:mt-0">
              {r.bankName} limits this conversion to {formatInt(r.capApplied!.limit)} {programme.programmeName}
              {r.capApplied!.type === "campaign"
                ? " per customer during a bonus campaign"
                : r.capApplied!.type === "annual"
                  ? " per customer per calendar year"
                  : " per customer per month"}
              . {formatInt(r.bankPointsRemaining)} {r.rewardCurrencyName} are shown as remaining and unconverted.
            </p>
          ))}
        </div>
      )}

      {capWarnings.map((w) => (
        <p key={w} className="mt-3 text-[11px] leading-relaxed text-ink/60">{w}</p>
      ))}

      <AllianceInfo
        programmeId={programme.programmeId}
        programmeName={programme.programmeName}
        ctaContext={{ calculatedBalance: programme.maxPromotionalTotal || programme.potentialTotal }}
      />

      {(fees.breakdown.length > 0 || fees.unknownBanks.length > 0) && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/55">Estimated transfer fees</p>
          {fees.breakdown.length > 0 && fees.currency && (
            <>
              <p className="mt-2 font-display text-xl text-ink">{formatFee(fees.total, fees.currency)}</p>
              <ul className="mt-2 space-y-1 text-[12px]">
                {fees.breakdown.map((b) => (
                  <li key={b.bankId} className="flex items-baseline justify-between gap-3">
                    <span className="text-ink/70">{b.bankName}</span>
                    <span className="text-ink">{formatFee(b.amount, b.currency)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] leading-relaxed text-ink/55">
                Cash cost of performing one transfer from each contributing bank into {programme.programmeName}. Fees are charged in addition to the transfer &mdash; they are never deducted from your miles, and fees for other programme scenarios are not included here.
              </p>
            </>
          )}
          {fees.unknownBanks.length > 0 && (
            <p className="mt-2 text-[11px] leading-relaxed text-ink/55">
              No verified conversion fee on record for {fees.unknownBanks.join(", ")}. Confirm the current fee with the bank before transferring.
            </p>
          )}
        </div>
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

function FragmentRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <>
      <dt className={muted ? "text-ink/55" : "text-ink"}>{label}</dt>
      <dd className={muted ? "text-right text-ink/60" : "text-right text-ink"}>{value}</dd>
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
              {typeof r.transferFeeAmount === "number" && (
                <>
                  <dt className="text-ink/55">Transfer fee</dt>
                  <dd className="text-right text-ink">
                    {r.transferFeeAmount === 0
                      ? "Waived"
                      : `${FEE_SYMBOL[r.transferFeeCurrency ?? "MYR"]}${r.transferFeeAmount.toFixed(2)}`}
                  </dd>
                </>
              )}
              {r.processingTime && (
                <>
                  <dt className="text-ink/55">Transfer time</dt>
                  <dd className="text-right text-ink">{r.processingTime}</dd>
                </>
              )}
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
                title={r.sourceName}
              >
                Source: {sourceTypeLabel(r.sourceType)} <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        );
      })}
    </>
  );
}

/* ---------- Destination discovery ---------- */

function DestinationDiscovery({ portfolio, registeredSet, country }: { portfolio: ProgrammeTotal[]; registeredSet: Set<string>; country: MarketCountry }) {
  // Every redemption record rendered below is scoped to the selected market.
  // A KUL-origin record can never appear in Singapore mode, and vice versa.
  const countryTargets = useMemo(() => targetsForCountry(country), [country]);
  const navigate = useNavigate();
  // Redemption gating uses the currently-applied promotional balance
  // (base + unconditional + confirmed-registered bonuses). It never assumes
  // an unregistered conditional bonus is available.
  const balances = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of portfolio) {
      const usable = Math.max(p.promotionalTotal ?? 0, p.potentialTotal ?? 0);
      m.set(p.programmeId, usable);
    }
    return m;
  }, [portfolio]);
  // Track whether a programme has additional headroom the user could unlock
  // by registering for a conditional promotion.
  const hasConditionalHeadroom = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of portfolio) m.set(p.programmeId, p.conditionalBonusTotal ?? 0);
    return m;
  }, [portfolio]);


  const cabinsPresent = useMemo(() => verifiedCabinsPresent(country), [country]);

  // Programme filter = intersection of programmes reachable from the user's
  // portfolio *with a verified transferable balance* AND programmes with a
  // completed redemption engine. Programmes whose balance is zero because
  // conversion rules are still unverified are excluded — we surface an
  // explanation in place of the destination grid rather than a browse fallback.
  const programmeOptions = useMemo(() => {
    const supported = new Set<string>(SUPPORTED_PROGRAMMES);
    // A programme only appears in the filter when this market actually has
    // redemption records for it — otherwise the option leads to an empty grid.
    const withRecords = new Set(countryTargets.filter(isTargetPublic).map((t) => t.programmeId));
    return portfolio
      .filter((p) => supported.has(p.programmeId) && withRecords.has(p.programmeId) && (balances.get(p.programmeId) ?? 0) > 0)
      .map((p) => ({ id: p.programmeId, name: loyaltyProgrammes.find((lp) => lp.id === p.programmeId)?.name ?? p.programmeId }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [portfolio, balances, countryTargets]);

  const hasVerifiedBalance = programmeOptions.length > 0;

  const [region, setRegion] = useState<Region | "">("");
  const [cabin, setCabin] = useState<Cabin | "">("");
  const [tripType, setTripType] = useState<"one_way" | "return">("return");
  const [travellers, setTravellers] = useState(1);
  const [programmeId, setProgrammeId] = useState<string>("");
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<"points" | "destination" | "region">("points");

  const emitFilter = useCallback((key: string, value: unknown) => {
    track("destination_filter_changed", { key, value });
  }, []);

  // Only targets whose programme is supported AND has a verified balance in
  // the user's portfolio.
  const eligibleProgrammes = useMemo(() => new Set(programmeOptions.map((o) => o.id)), [programmeOptions]);

  const targets = useMemo(() => {
    return countryTargets.filter((t) => {
      if (!isTargetPublic(t)) return false;
      if (!eligibleProgrammes.has(t.programmeId)) return false;
      if (region && t.region !== region) return false;
      if (cabin && t.cabin !== cabin) return false;
      if (programmeId && t.programmeId !== programmeId) return false;
      return true;
    });
  }, [region, cabin, programmeId, eligibleProgrammes, countryTargets]);

  // True when the user has picked a cabin that has zero verified records
  // across the programmes they currently hold a balance in (independent of
  // region/programme filters). Used to show a dataset-gap notice instead of
  // the generic "no unlocked destinations" empty state, so we never imply
  // the airline does not operate that cabin.
  const cabinMissingFromDataset = useMemo(() => {
    if (!cabin) return false;
    const eligibleFilter = programmeId ? new Set([programmeId]) : eligibleProgrammes;
    if (eligibleFilter.size === 0) return false;
    return !countryTargets.some(
      (t) => isTargetPublic(t) && eligibleFilter.has(t.programmeId) && t.cabin === cabin,
    );
  }, [cabin, programmeId, eligibleProgrammes, countryTargets]);

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

  // Affordability decides the band first; sorting only orders within a band.
  // "Lowest points required" is the default, and the reachable band is never
  // truncated to a handful of short-haul awards — breadth is the point of this
  // section, so long-haul destinations must survive alongside regional ones.
  const rankPoints = (a: Enriched, b: Enriched) =>
    a.required - b.required
    || a.t.destinationName.localeCompare(b.t.destinationName)
    || a.t.cabin.localeCompare(b.t.cabin);
  const rankDestination = (a: Enriched, b: Enriched) =>
    a.t.destinationName.localeCompare(b.t.destinationName) || a.required - b.required;
  const rankRegion = (a: Enriched, b: Enriched) =>
    a.t.region.localeCompare(b.t.region) || rankPoints(a, b);
  const ranker =
    sortBy === "destination" ? rankDestination
    : sortBy === "region" ? rankRegion
    : rankPoints;

  const classified = enriched.map((e) => ({ e, c: classifyRedemption(e.balance, e.required) }));
  const unlockedAll = classified.filter((x) => x.c.status === "reachable").map((x) => x.e).sort(ranker);
  const almostAll = classified.filter((x) => x.c.status === "close").map((x) => x.e)
    .sort(sortBy === "points" ? (a, b) => a.required - b.required : ranker);
  const futureAll = classified.filter((x) => x.c.status === "future").map((x) => x.e).sort(ranker);

  // Preview cap when "All programmes" is selected and the user hasn't asked for
  // the full list. Items are taken region by region so a cheap short-haul city
  // can never crowd out London, Sydney or Los Angeles.
  const PREVIEW_LIMIT = 12;
  const capPerProgramme = (list: Enriched[]) => {
    if (programmeId || showAll || list.length <= PREVIEW_LIMIT) return list;
    const byRegion = new Map<string, Enriched[]>();
    for (const e of list) {
      const key = `${e.t.programmeId}|${e.t.region}`;
      const bucket = byRegion.get(key);
      if (bucket) bucket.push(e); else byRegion.set(key, [e]);
    }
    const buckets = Array.from(byRegion.values());
    const picked: Enriched[] = [];
    for (let round = 0; picked.length < PREVIEW_LIMIT; round++) {
      let addedThisRound = false;
      for (const bucket of buckets) {
        if (round >= bucket.length) continue;
        picked.push(bucket[round]);
        addedThisRound = true;
        if (picked.length >= PREVIEW_LIMIT) break;
      }
      if (!addedThisRound) break;
    }
    return picked.sort(ranker);
  };
  const unlocked = capPerProgramme(unlockedAll);
  const almost = capPerProgramme(almostAll);
  const future = capPerProgramme(futureAll);
  const capped = !programmeId && !showAll &&
    (unlocked.length < unlockedAll.length || almost.length < almostAll.length || future.length < futureAll.length);

  // Programme-specific award disclaimers are keyed off the redemption cards
  // actually rendered, so an Enrich or Asia Miles note never appears when only
  // KrisFlyer opportunities are visible.
  const visibleProgrammeIds = cabinMissingFromDataset
    ? []
    : Array.from(new Set([...unlocked, ...almost, ...future].map((e) => e.t.programmeId)));



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
      origin: e.t.originAirport,
      destination: e.t.destination,
      destinationName: e.t.destinationName,
      cabin: e.t.cabin,
      tripType,
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

  if (!hasVerifiedBalance) {
    return (
      <section className="mt-16 border-t border-border pt-12">
        <div>
          <h2 className="font-display text-3xl text-ink md:text-4xl">
            Where can your points take you?
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink/70">
            Redemption planning is unavailable right now.
          </p>
        </div>
        <div className="mt-6 rounded-sm border border-ink/30 bg-background p-5 text-[13px] leading-relaxed text-ink/80">
          <p className="font-medium text-ink">No verified transferable balance yet</p>
          <p className="mt-2">
            We only show destination opportunities once a card you&rsquo;ve entered has a verified conversion route into a supported loyalty programme. The cards in your portfolio either have no confirmed conversion rate on record, earn miles directly with an airline (so their balance belongs in Step&nbsp;2), or convert only into programmes whose redemption engine isn&rsquo;t live yet.
          </p>
          <p className="mt-2">
            Add a card with a verified transfer route, or enter an existing balance in an airline programme in Step&nbsp;2, and destination results will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16 border-t border-border pt-12">
      <div>
        <h2 className="font-display text-3xl text-ink md:text-4xl">
          Where can your points take you?
        </h2>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink/70">
          Verified redemption opportunities departing {originLabelForCountry(country)}, across the programmes your cards can reach. Programme balances shown are alternative transfer scenarios — the same bank points cannot become their full potential balance in more than one programme at the same time.
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
          <TravellersInput
            value={travellers}
            onChange={(n) => { setTravellers(n); emitFilter("travellers", n); }}
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

        <FilterField label="Sort by">
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as "points" | "destination" | "region"); emitFilter("sort", e.target.value); }}
            className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-ink"
          >
            <option value="points">Lowest points required</option>
            <option value="destination">Destination</option>
            <option value="region">Region</option>
          </select>
        </FilterField>
      </div>

      <div className="mt-10 space-y-12">
        {cabinMissingFromDataset ? (
          (() => {
            const eligibleFilter = programmeId ? new Set([programmeId]) : eligibleProgrammes;
            const enrichOnlyPE = cabin === "Premium Economy" && eligibleFilter.size > 0 && Array.from(eligibleFilter).every((p) => p === "enrich");
            if (enrichOnlyPE) {
              return (
                <div className="rounded-sm border border-border bg-background p-6 text-sm leading-relaxed text-ink/75">
                  <p className="font-medium text-ink">No published Enrich Saver Premium Economy awards match these filters.</p>
                  <p className="mt-2 text-ink/65">
                    The current Enrich Saver chart publishes Economy and Business Saver pricing. This does not necessarily mean that no Malaysia Airlines flight has a Premium Economy cabin.
                  </p>
                </div>
              );
            }
            return (
              <div className="rounded-sm border border-border bg-background p-6 text-sm leading-relaxed text-ink/75">
                <p className="font-medium text-ink">No verified {cabin} redemption has been added to our database yet.</p>
                <p className="mt-2 text-ink/65">
                  This reflects a gap in our verified dataset for the programmes you hold — not an indication of whether the airline operates {cabin} on any given route. Switch cabin or check back as we expand coverage.
                </p>
              </div>
            );
          })()
        ) : (
          <>
            <DestinationGroup
              title="Your points are enough for these"
              subtitle="Based on published award requirements. Award-seat availability is not checked."
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
              empty="Nothing within 30% of a target right now."
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
                <p className="mt-2 text-[11px] text-ink/55">Showing a selection of verified opportunities across programmes and regions. Use the filters or View all results to explore the complete verified dataset.</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-10 rounded-sm border border-border bg-background p-4 text-[12px] leading-relaxed text-ink/65">
        <p>{UNIVERSAL_AWARD_DISCLAIMER}</p>
        {awardDisclaimersFor(visibleProgrammeIds).map((d) => (
          <p key={d} className="mt-2">{d}</p>
        ))}
      </div>
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
  title, subtitle, empty, items, state, tripType, travellers, onPrimary, onSecondary,
}: {
  title: string;
  subtitle?: string;
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
      {subtitle && <p className="mt-2 text-[13px] text-ink/60">{subtitle}</p>}
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
  if (t.connectionAirports.length === 0) return `${t.originAirport} → ${t.destination}`;
  return `${t.originAirport} → ${t.connectionAirports.join(" → ")} → ${t.destination}`;
}

function connectionLabel(t: RedemptionTarget): string | null {
  if (t.connectionAirports.length === 0) return null;
  if (t.connectionAirports[0] === "SIN") return "Connecting via Singapore";
  if (t.connectionAirports[0] === "HKG") return "Connecting via Hong Kong";
  return `Connecting via ${t.connectionAirports.join(", ")}`;
}

function DestinationCard({
  e, state: rawState, tripType, travellers, onPrimary, onSecondary,
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
  // Defensive: even if upstream banding were wrong, an affordable award can
  // never render as "almost there" with a zero or negative shortfall.
  const classification = classifyRedemption(e.balance, e.required);
  const state = classification.status === "reachable" ? "unlocked" : rawState;
  const shortfall = classification.shortfall ?? 0;
  const remaining = classification.remaining ?? 0;
  const isEnrich = t.programmeId === "enrich";
  const isNeedsReview = t.status === "needs_review";

  const badge = isNeedsReview
    ? { label: "Verification needed", cls: "border border-ink/40 text-ink/70" }
    : state === "unlocked" ? { label: "Enough points", cls: "bg-ink text-background" }
    : state === "almost" ? { label: "Almost there", cls: "border border-ink text-ink" }
    : { label: "Future goal", cls: "border border-ink/40 text-ink/70" };

  const primaryLabel =
    state === "unlocked" ? "Find My Best Redemption"
    : state === "almost" ? "Close My Points Gap"
    : "Build My Points Strategy";
  const conn = connectionLabel(t);
  const tripLabel = tripType === "return" ? "return" : "one way";
  const tripLabelTitle = tripType === "return" ? "Return" : "One way";
  const isObserved = t.verificationLevel === "observed-redemption-data";

  return (
    <article className="rounded-sm border border-border bg-background p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-ink/55">
            {itineraryLabel(t)} · {t.destinationCountry}
          </p>
          <h4 className="mt-1 font-display text-2xl text-ink md:text-3xl">{t.destinationName}</h4>
          <p className="mt-1 text-[13px] text-ink/70">
            {t.cabin} · {t.operatingAirline}
          </p>
          <p className="mt-0.5 text-[12px] text-ink/60">{t.awardType}</p>
          {isObserved && (
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink/60">
              Observed Enrich Saver pricing
            </p>
          )}
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
          <p className="font-display text-3xl text-ink">
            {formatInt(e.required)} <span className="text-base text-ink/70">Enrich total</span>
          </p>
          <p className="mt-2 text-[13px] text-ink/75">
            {formatInt(e.perDirectionPerPerson)} each way, per traveller
          </p>
          <p className="mt-1 text-[12px] text-ink/60">
            {travellers} traveller{travellers === 1 ? "" : "s"} · {tripLabel}
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
              <dt className="text-ink/55">Potential balance after redemption</dt>
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


      <p className="mt-4 text-[11px] leading-relaxed text-ink/60">
        {isEnrich && "Malaysia Airlines-operated flight only. "}
        {t.routingNote ? `${t.routingNote} ` : ""}
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
            <dt className="text-ink/55">Last verified</dt>
            <dd className="text-right text-ink">{formatDate(t.source?.verifiedAt ?? t.verifiedOn)}</dd>
            <dt className="text-ink/55">Source</dt>
            <dd className="text-right text-ink">
              <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline" title={t.source?.sourceName}>
                {sourceTypeLabel(t.source?.sourceType)} <ExternalLink className="h-3 w-3" />
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
          {t.source?.notes && <p className="mt-2 text-[11px] text-ink/55">{t.source.notes}</p>}
          {t.notes && <p className="mt-2 text-[11px] text-ink/55">{t.notes}</p>}
        </div>
      )}
    </article>
  );
}



function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/* ---------- Quick reference (collapsed) ---------- */

function QuickReference({ country }: { country: MarketCountry }) {
  const [open, setOpen] = useState(false);
  const [bankFilter, setBankFilter] = useState("");
  const [progFilter, setProgFilter] = useState("");

  // Issuers, and therefore rows, are scoped to the selected market: a
  // Malaysian route can never appear while Singapore is selected.
  const marketBanks = useMemo(() => getBanksByCountry(country), [country]);
  const marketBankIds = useMemo(() => new Set(marketBanks.map((b) => b.id)), [marketBanks]);

  const rows = useMemo(() => {
    return eligibleCardGroups.flatMap((cg) => {
      const product = getRewardProductById(cg.rewardProductId);
      const bank = product ? getBankById(product.bankId) : undefined;
      if (!bank || !product) return [];
      if (!marketBankIds.has(bank.id)) return [];
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
  }, [bankFilter, progFilter, marketBankIds]);

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
            <span className="font-display text-2xl text-ink md:text-3xl">{ratesDirectoryHeading(country)}</span>
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
              {marketBanks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select value={progFilter} onChange={(e) => setProgFilter(e.target.value)} className="rounded-sm border border-border bg-background px-3 py-2 text-sm">
              <option value="">All programmes</option>
              {loyaltyProgrammes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-[13px]">
              <caption className="sr-only">{ratesDirectoryCaption(country)}</caption>
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
/* ---------- Post-calculation CTA (Points Trip Planning) ---------- */

function PostCalcCTA() {
  return (
    <section className="border-b border-border bg-ink text-background">
      <div className="mx-auto max-w-[900px] px-5 py-16 text-center sm:px-6 md:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-background/55">
          Points Trip Planning
        </p>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl leading-tight md:text-[2.75rem]">
          You know what your points can become. Now turn them into a trip.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-background/75">
          If you have the points but are unsure which redemption to pursue, how to make the booking work, or what to do next, book a free 20-minute Points Trip Planning discovery call.
        </p>
        <Link
          to="/trip-planning"
          onClick={() =>
            track("trip_planning_cta_clicked", {
              source: "miles_calculator_post_calc",
            })
          }
          className="mt-8 inline-block rounded-sm bg-background px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
        >
          Book a Free 20-Minute Call
        </Link>
        <p className="mt-5 text-[13px] text-background/55">
          Want to earn points more efficiently instead?{" "}
          <Link
            to={STRATEGY_URL}
            onClick={() => track("cards_strategy_secondary_clicked")}
            className="underline decoration-background/40 underline-offset-4 transition-colors hover:text-background"
          >
            Explore Cards Strategy →
          </Link>
        </p>
      </div>
    </section>
  );
}