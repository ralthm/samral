import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  banks,
  conversionRules,
  eligibleCardGroups,
  getBankById,
  getCardGroupById,
  getProgrammeById,
  getRewardProductById,
  isRulePublic,
  auditMaybankInventory,
} from "@/data/milesCalculator";
import { calculateEntry, formatInt } from "@/lib/milesCalculator";

/**
 * Admin review dashboard for the Miles Calculator.
 *
 * Because this project has no backend enabled, all conversion rules live in
 * `src/data/milesCalculator.ts`. This page is a read-only auditor: it shows
 * which rules are publicly displayed, which need review, which have not been
 * verified in 90+ days, and lets you preview the calculator with a sample
 * balance for any card group. Editing rules still requires a code change.
 *
 * Gated by a lightweight session password prompt. This is client-side only;
 * it is a soft deterrent, not real access control. Enable Lovable Cloud if
 * you need real authentication.
 */

const ADMIN_PASS_KEY = "samral_admin_miles_pass_ok";
// Change this by editing the file. A real deployment should move it to
// Lovable Cloud with a Supabase auth role.
const ADMIN_PASS = "samral-admin";

const STALE_DAYS = 90;

export default function AdminMilesCalculator() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    document.title = "Admin · Miles Calculator | Samral";
    const meta = document.querySelector('meta[name="robots"]');
    const created = !meta;
    const tag = meta ?? document.createElement("meta");
    tag.setAttribute("name", "robots");
    tag.setAttribute("content", "noindex, nofollow");
    if (created) document.head.appendChild(tag);
    if (sessionStorage.getItem(ADMIN_PASS_KEY) === "1") setAuthed(true);
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
          <Link to="/" className="font-display text-2xl text-ink">Samral</Link>
          <h1 className="mt-8 font-display text-3xl text-ink">Admin access</h1>
          <p className="mt-3 text-sm text-ink/70">
            This dashboard is not public. Enter the admin password to continue.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pw === ADMIN_PASS) {
                sessionStorage.setItem(ADMIN_PASS_KEY, "1");
                setAuthed(true);
              } else {
                setErr("Incorrect password.");
              }
            }}
            className="mt-6 space-y-3"
          >
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setErr(""); }}
              className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
              placeholder="Password"
              autoFocus
            />
            {err && <p className="text-[13px] text-destructive">{err}</p>}
            <button type="submit" className="w-full rounded-sm bg-ink px-4 py-2.5 text-sm text-background">
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const today = new Date();
  const staleThreshold = new Date(today);
  staleThreshold.setDate(staleThreshold.getDate() - STALE_DAYS);

  const enriched = useMemo(() => {
    return conversionRules.map((r) => {
      const cg = getCardGroupById(r.eligibleCardGroupId);
      const product = cg ? getRewardProductById(cg.rewardProductId) : undefined;
      const bank = product ? getBankById(product.bankId) : undefined;
      const prog = getProgrammeById(r.loyaltyProgrammeId);
      const verifiedDate = new Date(r.verifiedOn + "T00:00:00Z");
      const ageDays = Math.floor((today.getTime() - verifiedDate.getTime()) / 86400000);
      return {
        rule: r,
        bank: bank?.name ?? "?",
        product: product?.name ?? "?",
        cardGroup: cg?.name ?? "?",
        programme: prog?.name ?? "?",
        isPublic: isRulePublic(r),
        ageDays,
        stale: ageDays > STALE_DAYS,
      };
    });
  }, [today]);

  const needsReview = enriched.filter((e) => e.rule.status !== "verified");
  const stale = enriched.filter((e) => e.stale && e.rule.status === "verified");
  const missingSource = enriched.filter((e) => !e.rule.sourceUrl || !e.rule.verifiedOn);

  const [previewCg, setPreviewCg] = useState(eligibleCardGroups[0]?.id ?? "");
  const [previewPts, setPreviewPts] = useState(645000);
  const previewResults = previewCg
    ? calculateEntry({
        entryId: "preview",
        cardGroupId: previewCg,
        bankPoints: previewPts,
      })
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-6 md:px-12">
          <Link to="/" className="font-display text-2xl text-ink">Samral</Link>
          <p className="text-[12px] uppercase tracking-[0.18em] text-ink/55">Admin · Miles Calculator</p>
          <button
            onClick={() => { sessionStorage.removeItem(ADMIN_PASS_KEY); location.reload(); }}
            className="text-[13px] text-ink/70 hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] space-y-12 px-5 py-10 sm:px-6 md:px-12">
        <div className="rounded-sm border border-clay/40 bg-clay/5 p-4 text-[13px] text-ink/80">
          <p className="font-medium text-ink">Read-only review dashboard.</p>
          <p className="mt-1">
            Conversion rules live in <code>src/data/milesCalculator.ts</code>. Edit that file to add banks, card groups, programmes and rules. Enable Lovable Cloud for a real admin CRUD interface and role-based auth.
          </p>
        </div>

        <StatGrid stats={[
          { label: "Total rules", value: conversionRules.length },
          { label: "Public (verified)", value: enriched.filter((e) => e.isPublic).length },
          { label: "Needs review", value: needsReview.length },
          { label: `Verified > ${STALE_DAYS} days ago`, value: stale.length },
        ]} />
        <MaybankAuditPanel />


        <Section title={`Rules needing review`} count={needsReview.length}>
          <RuleTable rows={needsReview} />
        </Section>

        <Section title={`Verified but stale (>${STALE_DAYS} days)`} count={stale.length}>
          <RuleTable rows={stale} />
        </Section>

        <Section title="Missing source or verification" count={missingSource.length}>
          <RuleTable rows={missingSource} />
        </Section>

        <Section title="Calculator preview" count={previewResults.length}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[12px] uppercase tracking-[0.14em] text-ink/60">
              Card group
              <select
                value={previewCg}
                onChange={(e) => setPreviewCg(e.target.value)}
                className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal"
              >
                {eligibleCardGroups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </label>
            <label className="text-[12px] uppercase tracking-[0.14em] text-ink/60">
              Sample bank points
              <input
                type="number"
                value={previewPts}
                min={0}
                onChange={(e) => setPreviewPts(Math.max(0, Number(e.target.value) || 0))}
                className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm normal-case"
              />
            </label>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.14em] text-ink/60">
                  <th className="py-2 pr-4">Programme</th>
                  <th className="py-2 pr-4 text-right">Block</th>
                  <th className="py-2 pr-4 text-right">Full blocks</th>
                  <th className="py-2 pr-4 text-right">Used</th>
                  <th className="py-2 pr-4 text-right">Remaining</th>
                  <th className="py-2 pr-4 text-right">Received</th>
                </tr>
              </thead>
              <tbody>
                {previewResults.map((r) => (
                  <tr key={r.programmeId} className="border-b border-border/70">
                    <td className="py-2 pr-4">{r.programmeName}</td>
                    <td className="py-2 pr-4 text-right">
                      {formatInt(r.bankPointsPerBlock)} → {formatInt(r.partnerPointsPerBlock)}
                    </td>
                    <td className="py-2 pr-4 text-right">{formatInt(r.fullBlocks)}</td>
                    <td className="py-2 pr-4 text-right">{formatInt(r.bankPointsUsed)}</td>
                    <td className="py-2 pr-4 text-right">{formatInt(r.bankPointsRemaining)}</td>
                    <td className="py-2 pr-4 text-right font-medium">{formatInt(r.partnerPointsReceived)}</td>
                  </tr>
                ))}
                {previewResults.length === 0 && (
                  <tr><td className="py-4 text-ink/60" colSpan={6}>No verified public rules for this card group.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="All rules" count={enriched.length}>
          <RuleTable rows={enriched} />
        </Section>

        <Section title="Banks" count={banks.length}>
          <ul className="text-[13px] text-ink/80">
            {banks.map((b) => (
              <li key={b.id} className="flex justify-between border-b border-border py-2">
                <span>{b.name}</span>
                <a href={b.officialRewardsUrl} target="_blank" rel="noopener noreferrer" className="text-ink hover:underline">
                  Source
                </a>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function StatGrid({ stats }: { stats: { label: string; value: number }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-sm border border-border bg-background p-4">
          <p className="font-display text-3xl text-ink">{formatInt(s.value)}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink/60">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-ink">
        {title} <span className="text-ink/50">({count})</span>
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type Row = {
  rule: (typeof conversionRules)[number];
  bank: string;
  cardGroup: string;
  programme: string;
  isPublic: boolean;
  ageDays: number;
};

function RuleTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) return <p className="text-[13px] text-ink/60">None.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-[0.14em] text-ink/60">
            <th className="py-2 pr-4">Bank</th>
            <th className="py-2 pr-4">Card group</th>
            <th className="py-2 pr-4">Programme</th>
            <th className="py-2 pr-4">Block</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Verified</th>
            <th className="py-2 pr-4">Public</th>
            <th className="py-2 pr-4">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ rule, bank, cardGroup, programme, isPublic, ageDays }) => (
            <tr key={rule.id} className="border-b border-border/70">
              <td className="py-2 pr-4">{bank}</td>
              <td className="py-2 pr-4">{cardGroup}</td>
              <td className="py-2 pr-4">{programme}</td>
              <td className="py-2 pr-4">
                {formatInt(rule.bankPointsPerBlock)} → {formatInt(rule.partnerPointsPerBlock)}
              </td>
              <td className="py-2 pr-4">{rule.status}</td>
              <td className="py-2 pr-4">{rule.verifiedOn} <span className="text-ink/50">({ageDays}d)</span></td>
              <td className="py-2 pr-4">{isPublic ? "Yes" : "No"}</td>
              <td className="py-2 pr-4">
                {rule.sourceUrl ? (
                  <a href={rule.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-ink hover:underline">
                    Link
                  </a>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MaybankAuditPanel() {
  const audit = auditMaybankInventory();
  const ok = audit.present === audit.expected && audit.missingIds.length === 0 && audit.unexpectedIds.length === 0;
  return (
    <section>
      <h2 className="font-display text-2xl text-ink">
        Maybank inventory audit{" "}
        <span className={ok ? "text-emerald-700" : "text-red-700"}>
          ({audit.present}/{audit.expected})
        </span>
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-sm border border-border bg-background p-4 text-[13px] text-ink/80">
          <p className="font-medium text-ink">Current catalogue</p>
          <p className="mt-1">Expected: {audit.expected}</p>
          <p>Present: {audit.present}</p>
          <p className="mt-2 text-ink/70">Missing card IDs ({audit.missingIds.length}):</p>
          <p className="font-mono text-[11px] text-ink/70">{audit.missingIds.length ? audit.missingIds.join(", ") : "—"}</p>
          <p className="mt-2 text-ink/70">Unexpected current card IDs ({audit.unexpectedIds.length}):</p>
          <p className="font-mono text-[11px] text-ink/70">{audit.unexpectedIds.length ? audit.unexpectedIds.join(", ") : "—"}</p>
        </div>
        <div className="rounded-sm border border-border bg-background p-4 text-[13px] text-ink/80">
          <p className="font-medium text-ink">Legacy inventory</p>
          <p className="mt-1 text-ink/70">Legacy card IDs ({audit.legacyIds.length}):</p>
          <p className="font-mono text-[11px] text-ink/70">{audit.legacyIds.length ? audit.legacyIds.join(", ") : "—"}</p>
          <p className="mt-2 text-ink/70">Unverified legacy card IDs ({audit.unverifiedLegacyIds.length}):</p>
          <p className="font-mono text-[11px] text-ink/70">{audit.unverifiedLegacyIds.length ? audit.unverifiedLegacyIds.join(", ") : "—"}</p>
        </div>
      </div>
    </section>
  );
}
