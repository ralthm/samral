import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Menu, Plus, Trash2, X } from "lucide-react";
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
  RuleResult,
} from "@/lib/milesCalculator";

const STRATEGY_URL = "/points-strategy";

interface Entry {
  id: string;
  bankId: string;
  rewardProductId: string;
  cardGroupId: string;
  nickname: string;
  rawInput: string;
}

const newEntry = (): Entry => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Math.random()),
  bankId: "",
  rewardProductId: "",
  cardGroupId: "",
  nickname: "",
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
      <Calculator />
      <QuickReference />
      <Explainer />
      <StrategyCTA />
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

/* ---------- Nav (matches site pattern) ---------- */

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
          See exactly how many airline miles your Malaysian credit card points can become — including transfer blocks, usable points and leftover balances.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#calculator"
            className="inline-block rounded-sm bg-ink px-8 py-4 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
          >
            Calculate My Miles
          </a>
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

/* ---------- Calculator ---------- */

function Calculator() {
  const [entries, setEntries] = useState<Entry[]>([newEntry()]);
  const [existing, setExisting] = useState<Record<string, string>>({});

  const results = useMemo<RuleResult[]>(() => {
    const list: RuleResult[] = [];
    for (const e of entries) {
      if (!e.cardGroupId) continue;
      const points = parseIntSafe(e.rawInput);
      if (!Number.isFinite(points) || points <= 0) continue;
      list.push(
        ...calculateEntry({
          entryId: e.id,
          cardGroupId: e.cardGroupId,
          nickname: e.nickname,
          bankPoints: points,
        }),
      );
    }
    return list;
  }, [entries]);

  const existingBalances = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(existing)) {
      const n = parseIntSafe(v);
      if (Number.isFinite(n) && n > 0) out[k] = n;
    }
    return out;
  }, [existing]);

  const portfolio = useMemo(
    () => computePortfolioTotals(results, existingBalances),
    [results, existingBalances],
  );

  const resultsByEntry = useMemo(() => {
    const m = new Map<string, RuleResult[]>();
    for (const r of results) {
      const arr = m.get(r.entryId) ?? [];
      arr.push(r);
      m.set(r.entryId, arr);
    }
    return m;
  }, [results]);

  return (
    <section id="calculator" className="border-b border-border">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-6 md:px-12 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column */}
          <div>
            <h2 className="font-display text-3xl text-ink md:text-4xl">Your points</h2>
            <p className="mt-3 max-w-md text-sm text-ink/70">
              Add a balance for each card group you hold. Multiple entries from the same bank are fine.
            </p>

            <div className="mt-8 space-y-6">
              {entries.map((entry, idx) => (
                <EntryCard
                  key={entry.id}
                  index={idx}
                  entry={entry}
                  canRemove={entries.length > 1}
                  onChange={(next) =>
                    setEntries((prev) => prev.map((e) => (e.id === entry.id ? next : e)))
                  }
                  onRemove={() =>
                    setEntries((prev) => prev.filter((e) => e.id !== entry.id))
                  }
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setEntries((prev) => [...prev, newEntry()]);
                track("additional_balance_added");
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-sm border border-ink/70 px-5 py-3 text-[13px] text-ink transition-colors hover:bg-ink hover:text-background"
            >
              <Plus className="h-4 w-4" /> Add another points balance
            </button>

            <ExistingBalances
              existing={existing}
              onChange={(pid, value) => {
                setExisting((prev) => ({ ...prev, [pid]: value }));
                if (parseIntSafe(value) > 0) track("existing_miles_added", { programme: pid });
              }}
            />
          </div>

          {/* Right column */}
          <div>
            <h2 className="font-display text-3xl text-ink md:text-4xl">Your conversion results</h2>
            <p className="mt-3 max-w-md text-sm text-ink/70">
              Integer arithmetic only. Full transfer blocks. Leftover bank points stay in your account.
            </p>

            <div className="mt-8 space-y-6" aria-live="polite">
              {results.length === 0 && (
                <div className="rounded-sm border border-dashed border-border p-8 text-center text-sm text-ink/60">
                  Choose a bank, card group and enter a points balance to see conversions.
                </div>
              )}

              {entries.map((e) => {
                const bank = e.bankId ? getBankById(e.bankId) : undefined;
                const group = e.cardGroupId
                  ? eligibleCardGroups.find((g) => g.id === e.cardGroupId)
                  : undefined;
                if (!group) return null;
                const points = parseIntSafe(e.rawInput);
                if (!Number.isFinite(points) || points <= 0) return null;
                const list = resultsByEntry.get(e.id) ?? [];

                if (list.length === 0) {
                  return (
                    <div key={e.id} className="rounded-sm border border-border p-6 text-sm text-ink/70">
                      <p className="font-medium text-ink">
                        {e.nickname || `${bank?.name ?? "Bank"} — ${group.name}`}
                      </p>
                      <p className="mt-2">
                        Unavailable — no active verified transfer routes are recorded for this card group.
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={e.id} className="space-y-4">
                    <p className="eyebrow text-ink/60">
                      {e.nickname || `${bank?.name} — ${group.name}`}
                    </p>
                    {list.map((r) => (
                      <ResultCard key={`${r.entryId}-${r.programmeId}`} r={r} />
                    ))}
                  </div>
                );
              })}
            </div>

            {portfolio.length > 0 && (
              <div className="mt-12">
                <h3 className="font-display text-2xl text-ink md:text-3xl">
                  Potential portfolio totals
                </h3>
                <p className="mt-2 text-sm text-ink/70">
                  Totals are shown per destination programme. Points cannot ordinarily be combined across programmes.
                </p>
                <div className="mt-6 divide-y divide-border border-y border-border">
                  {portfolio.map((p) => (
                    <div key={p.programmeId} className="grid gap-4 py-5 md:grid-cols-[1fr_auto] md:items-baseline">
                      <div>
                        <p className="font-display text-xl text-ink">{p.programmeName}</p>
                        <p className="mt-1 text-[12px] text-ink/55">
                          {p.transferredFromEntries.length > 0 && (
                            <>
                              Transfer:{" "}
                              {p.transferredFromEntries
                                .map((t) => `${t.bankName} ${formatInt(t.partnerPointsReceived)}`)
                                .join(" + ")}
                            </>
                          )}
                          {p.existingBalance > 0 && (
                            <>
                              {p.transferredFromEntries.length > 0 ? " + " : ""}
                              existing {formatInt(p.existingBalance)}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-display text-3xl text-ink">
                          {formatInt(p.potentialTotal)}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-ink/55">
                          {p.existingBalance > 0 ? "Potential balance after transfer" : "From transfers"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Entry card ---------- */

function EntryCard({
  entry,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  entry: Entry;
  index: number;
  canRemove: boolean;
  onChange: (next: Entry) => void;
  onRemove: () => void;
}) {
  const bankProducts = entry.bankId ? getRewardProductsByBank(entry.bankId) : [];
  const product = entry.rewardProductId ? getRewardProductById(entry.rewardProductId) : undefined;
  const cardGroups = entry.rewardProductId ? getCardGroupsByRewardProduct(entry.rewardProductId) : [];

  const pointsValue = parseIntSafe(entry.rawInput);
  const pointsError = entry.rawInput && !Number.isFinite(pointsValue)
    ? "Enter whole numbers only (commas are fine)."
    : null;

  return (
    <div className="rounded-sm border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink/50">
          Entry {String(index + 1).padStart(2, "0")}
        </p>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove entry"
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
              onChange({
                ...entry,
                bankId: e.target.value,
                rewardProductId: "",
                cardGroupId: "",
              });
              track("bank_selected", { bank: e.target.value });
            }}
            className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="">Select bank</option>
            {banks.filter((b) => b.active).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Card group / reward programme" htmlFor={`product-${entry.id}`}>
          <select
            id={`product-${entry.id}`}
            value={entry.rewardProductId}
            onChange={(e) => {
              const productId = e.target.value;
              const groups = productId ? getCardGroupsByRewardProduct(productId) : [];
              const cardGroupId = groups.length === 1 ? groups[0].id : "";
              onChange({ ...entry, rewardProductId: productId, cardGroupId });
              track("card_group_selected", { product: productId });
            }}
            disabled={!entry.bankId}
            className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none disabled:bg-muted"
          >
            <option value="">
              {entry.bankId ? "Select card group" : "Select bank first"}
            </option>
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
            placeholder="e.g. 645,000"
            value={entry.rawInput}
            onChange={(e) => onChange({ ...entry, rawInput: e.target.value })}
            onBlur={() => {
              if (parseIntSafe(entry.rawInput) > 0) track("points_balance_entered");
            }}
            aria-invalid={!!pointsError}
            aria-describedby={pointsError ? `points-err-${entry.id}` : undefined}
            className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
          />
          {pointsError && (
            <p id={`points-err-${entry.id}`} className="mt-2 text-[12px] text-destructive">
              {pointsError}
            </p>
          )}
        </Field>

        <Field label="Nickname (optional)" htmlFor={`nickname-${entry.id}`}>
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
      </div>
    </div>
  );
}

function Field({
  label, htmlFor, children,
}: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink/70">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ---------- Result card ---------- */

function ResultCard({ r }: { r: RuleResult }) {
  const noBlocks = r.fullBlocks === 0;
  return (
    <article className="rounded-sm border border-border bg-background p-6">
      <header className="flex items-baseline justify-between gap-4">
        <h4 className="font-display text-2xl text-ink">{r.programmeName}</h4>
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink/55">
          {programmeTypeLabel(r.programmeType)}
        </p>
      </header>

      <p className="mt-2 text-sm text-ink/70">
        {formatInt(r.bankPointsEntered)} {r.rewardCurrencyName} entered
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-y-3 text-sm">
        <dt className="text-ink/60">Conversion</dt>
        <dd className="text-right text-ink">
          {formatInt(r.bankPointsPerBlock)} {r.rewardCurrencyName} → {formatInt(r.partnerPointsPerBlock)} {r.programmeName}
        </dd>

        <dt className="text-ink/60">Full blocks</dt>
        <dd className="text-right text-ink">{formatInt(r.fullBlocks)}</dd>

        <dt className="text-ink/60">Points used</dt>
        <dd className="text-right text-ink">{formatInt(r.bankPointsUsed)}</dd>

        <dt className="text-ink/60">Points remaining</dt>
        <dd className="text-right text-ink">{formatInt(r.bankPointsRemaining)}</dd>

        <dt className="text-ink/60">You receive</dt>
        <dd className="text-right font-display text-xl text-ink">
          {formatInt(r.partnerPointsReceived)} {shortProgramme(r.programmeName)}
        </dd>
      </dl>

      {noBlocks && (
        <p className="mt-4 rounded-sm bg-sand/70 px-3 py-2 text-[13px] text-ink">
          You need another {formatInt(r.pointsShortOfNextBlock)} {r.rewardCurrencyName} to complete the first transfer block.
        </p>
      )}

      {r.notes && (
        <p className="mt-4 text-[12px] leading-relaxed text-ink/65">{r.notes}</p>
      )}

      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-[12px] text-ink/60">
        <span>
          Last verified {formatDate(r.verifiedOn)} against {r.sourceTitle}.
        </span>
        <a
          href={r.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("official_source_clicked", { programme: r.programmeId })}
          className="inline-flex items-center gap-1 text-ink hover:underline"
        >
          View official source <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </footer>
    </article>
  );
}

function programmeTypeLabel(t: string): string {
  switch (t) {
    case "airline_miles": return "Airline miles";
    case "airline_points": return "Airline points";
    case "hotel_points": return "Hotel points";
    default: return "Travel points";
  }
}

function shortProgramme(name: string): string {
  if (name === "Cathay") return "Cathay pts";
  if (name === "AirAsia rewards") return "AirAsia pts";
  if (name === "Batik Air Club") return "Batik units";
  if (name === "British Airways Club" || name === "Qatar Airways Privilege Club") return "Avios";
  if (name === "IHG One Rewards" || name === "Marriott Bonvoy" || name === "ALL Accor") return "pts";
  return "miles";
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

/* ---------- Existing balances ---------- */

function ExistingBalances({
  existing, onChange,
}: {
  existing: Record<string, string>;
  onChange: (programmeId: string, value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const supported = loyaltyProgrammes
    .filter((p) => p.active && p.programmeType !== "other_travel_points")
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="mt-10 rounded-sm border border-border bg-background p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span>
          <span className="font-display text-xl text-ink">Add your existing airline balances</span>
          <span className="mt-1 block text-[12px] text-ink/60">
            Optional. See the potential total in each programme after transferring.
          </span>
        </span>
        <span className="text-[12px] text-ink/60">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {supported.map((p) => (
            <Field key={p.id} label={p.name} htmlFor={`existing-${p.id}`}>
              <input
                id={`existing-${p.id}`}
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={existing[p.id] ?? ""}
                onChange={(e) => onChange(p.id, e.target.value)}
                className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
              />
            </Field>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Quick reference ---------- */

function QuickReference() {
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
        };
      });
    }).filter((r) => (!bankFilter || r.bankId === bankFilter) && (!progFilter || r.programmeId === progFilter));
  }, [bankFilter, progFilter]);

  return (
    <section className="border-b border-border bg-sand/40">
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-6 md:px-12 md:py-20">
        <h2 className="font-display text-3xl text-ink md:text-4xl">Quick reference</h2>
        <p className="mt-3 max-w-xl text-sm text-ink/70">
          Every verified conversion route currently in our database.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <select value={bankFilter} onChange={(e) => setBankFilter(e.target.value)} className="rounded-sm border border-border bg-background px-3 py-2 text-sm">
            <option value="">All banks</option>
            {banks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={progFilter} onChange={(e) => setProgFilter(e.target.value)} className="rounded-sm border border-border bg-background px-3 py-2 text-sm">
            <option value="">All programmes</option>
            {loyaltyProgrammes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="mt-8 hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left text-[13px]">
            <caption className="sr-only">Malaysian credit card points to airline/hotel programme conversion rates</caption>
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.14em] text-ink/60">
                <th scope="col" className="py-3 pr-4">Bank</th>
                <th scope="col" className="py-3 pr-4">Card group</th>
                <th scope="col" className="py-3 pr-4">Reward currency</th>
                <th scope="col" className="py-3 pr-4">Programme</th>
                <th scope="col" className="py-3 pr-4 text-right">Bank points</th>
                <th scope="col" className="py-3 pr-4 text-right">Partner points</th>
                <th scope="col" className="py-3 pr-4">Effective</th>
                <th scope="col" className="py-3">Verified</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-border/70 text-ink">
                  <td className="py-3 pr-4">{r.bank}</td>
                  <td className="py-3 pr-4">{r.cardGroup}</td>
                  <td className="py-3 pr-4">{r.rewardCurrency}</td>
                  <td className="py-3 pr-4">{r.programme}</td>
                  <td className="py-3 pr-4 text-right">{formatInt(r.bankPoints)}</td>
                  <td className="py-3 pr-4 text-right">{formatInt(r.partnerPoints)}</td>
                  <td className="py-3 pr-4 text-ink/60">{r.effectiveFrom ? formatDate(r.effectiveFrom) : "—"}</td>
                  <td className="py-3 text-ink/60">{formatDate(r.verifiedOn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-4 md:hidden">
          {rows.map((r) => (
            <div key={r.key} className="rounded-sm border border-border bg-background p-4 text-[13px]">
              <p className="font-display text-lg text-ink">{r.bank} → {r.programme}</p>
              <p className="mt-1 text-ink/70">{r.cardGroup}</p>
              <p className="mt-2 text-ink">
                {formatInt(r.bankPoints)} {r.rewardCurrency} → {formatInt(r.partnerPoints)} {r.programme}
              </p>
              <p className="mt-2 text-[11px] text-ink/55">
                Verified {formatDate(r.verifiedOn)}{r.effectiveFrom ? ` · Effective ${formatDate(r.effectiveFrom)}` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Avoid circular naming with the imported helper by wrapping it here.


/* ---------- Explainer content ---------- */

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
          Points tell only half the story.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-background/75">
          Samral can help assess whether your current cards, spending pattern and airline programmes match the trips you actually want to take.
        </p>
        <Link
          to={STRATEGY_URL}
          onClick={() => track("strategy_cta_clicked")}
          className="mt-8 inline-block rounded-sm bg-background px-8 py-4 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
        >
          Get a Personalised Points Strategy
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

/* ---------- Footer (matches site) ---------- */

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
            { label: "Points Trip Planning", to: "/trip-planning" },
            { label: "About", to: "/about" },
          ]} />
          <FooterCol title="Our products" items={[{ label: "Software", to: "/products" }]} />
          <FooterCol title="Legal" items={[
            { label: "Terms of Service", to: "/terms" },
            { label: "Privacy Notice", to: "/privacy" },
          ]} />
        </div>
        <p className="mt-12 border-t border-border pt-6 text-[12px] text-ink/50">
          © {new Date().getFullYear()} Samral — Points &amp; miles advisory
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">{title}</p>
      <ul className="mt-4 space-y-2 text-[13px] text-ink/80">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="hover:opacity-70">{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
