import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { banks, cards, getBankById } from "@/data/milesCalculator";

/**
 * Admin · Card Images.
 *
 * Image-management layer only. Nothing on this page touches conversion rules,
 * promotions, redemption data or calculator maths — it reads the existing card
 * catalogue (`src/data/milesCalculator.ts`) as the single source of card
 * identity and attaches artwork to the exact internal card id.
 *
 * Every privileged operation (crawling, downloading, storage writes) happens
 * inside the `card-images-admin` edge function behind an authenticated
 * admin-role check. The browser never holds ingestion or storage credentials.
 */

type CardImageRow = {
  card_id: string;
  bank_id: string;
  card_name: string;
  card_image_path: string | null;
  card_image_variants: Record<string, string> | null;
  card_image_source_url: string | null;
  card_image_origin_url: string | null;
  card_image_source_type: string | null;
  card_image_status: string;
  card_image_verified_at: string | null;
  last_checked_at: string | null;
  review_notes: string | null;
};

type CandidateRow = {
  id: string;
  card_id: string;
  image_url: string;
  source_url: string;
  source_type: string;
  discovery_method: string;
  score: number;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  needs_review: "Needs review",
  verified: "Verified",
  rejected: "Rejected",
  not_found: "Not found",
  stale: "Stale — re-check",
};

/** The exact catalogue payload sent to the edge function. */
function catalogue() {
  return cards.map((c) => {
    const bank = getBankById(c.bankId);
    return {
      cardId: c.id,
      bankId: c.bankId,
      bankName: bank?.name ?? c.bankId,
      cardName: c.name,
      officialSourceUrl: c.officialSourceUrl,
      bankRewardsUrl: bank?.officialRewardsUrl,
    };
  });
}

export default function AdminCardImages() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    document.title = "Admin · Card Images | Samral";
    const meta = document.querySelector('meta[name="robots"]') ?? document.createElement("meta");
    meta.setAttribute("name", "robots");
    meta.setAttribute("content", "noindex, nofollow");
    if (!meta.parentNode) document.head.appendChild(meta);

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(null);
      return;
    }
    supabase
      .rpc("has_role", { _user_id: session.user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [session]);

  if (!session) return <SignIn />;
  if (isAdmin === null) return <Shell><p className="text-sm text-ink/60">Checking access…</p></Shell>;
  if (!isAdmin) {
    return (
      <Shell>
        <h1 className="font-display text-3xl text-ink">No admin access</h1>
        <p className="mt-3 text-sm text-ink/70">
          This account is signed in but does not hold the admin role, so the card image tools stay hidden.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-6 rounded-sm border border-border px-4 py-2 text-sm text-ink"
        >
          Sign out
        </button>
      </Shell>
    );
  }

  return <Queue />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-5 py-20">
        <Link to="/" className="font-display text-2xl text-ink">Samral</Link>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

function SignIn() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Shell>
      <h1 className="font-display text-3xl text-ink">
        {mode === "signin" ? "Admin sign in" : "Create admin account"}
      </h1>
      <p className="mt-3 text-sm text-ink/70">
        Card image management is restricted to Samral admin accounts. Creating an account does not grant
        access on its own — the admin role is issued only to the approved Samral address.
      </p>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setNotice("");
          if (mode === "signin") {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
          } else {
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: `${window.location.origin}/admin/card-images` },
            });
            if (error) setError(error.message);
            else if (!data.session) {
              setNotice("Account created. Confirm the link in your inbox, then sign in here.");
              setMode("signin");
            }
          }
          setBusy(false);
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          required
          className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          minLength={8}
          required
          className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
        />
        {error && <p className="text-[13px] text-destructive">{error}</p>}
        {notice && <p className="text-[13px] text-ink/70">{notice}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-sm bg-ink px-4 py-2.5 text-sm text-background disabled:opacity-60"
        >
          {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button
        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setNotice(""); }}
        className="mt-4 text-[13px] text-ink/70 underline underline-offset-4 hover:text-ink"
      >
        {mode === "signin" ? "First time here? Create your account" : "Already have an account? Sign in"}
      </button>
    </Shell>
  );
}


function Queue() {
  const [rows, setRows] = useState<CardImageRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [bankFilter, setBankFilter] = useState("");
  const cancelRun = useRef(false);

  const call = useCallback(async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("card-images-admin", { body });
    if (error) {
      const detail = "context" in error && error.context ? await error.context.text().catch(() => "") : "";
      throw new Error(detail || error.message);
    }
    if (data && typeof data === "object" && "error" in data) throw new Error(String(data.error));
    return data;
  }, []);

  const refresh = useCallback(async () => {
    const [{ data: imageRows }, { data: candidateRows }] = await Promise.all([
      supabase.from("card_images").select("*").order("card_id"),
      supabase.from("card_image_candidates").select("*").eq("status", "pending").order("score", { ascending: false }),
    ]);
    setRows((imageRows ?? []) as CardImageRow[]);
    setCandidates((candidateRows ?? []) as CandidateRow[]);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await call({ action: "sync", cards: catalogue() });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      await refresh();
      setLoading(false);
    })();
  }, [call, refresh]);

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), []);
  const candidatesByCard = useMemo(() => {
    const map = new Map<string, CandidateRow[]>();
    for (const c of candidates) {
      const list = map.get(c.card_id) ?? [];
      list.push(c);
      map.set(c.card_id, list);
    }
    return map;
  }, [candidates]);

  const pending = rows.filter(
    (r) => r.card_image_status !== "verified" && (!bankFilter || r.bank_id === bankFilter),
  );
  const verified = rows.filter((r) => r.card_image_status === "verified");

  async function runIngestion(targets: CardImageRow[]) {
    cancelRun.current = false;
    setError("");
    const payload = catalogue().filter((c) => targets.some((t) => t.card_id === c.cardId));
    const batches: (typeof payload)[] = [];
    for (let i = 0; i < payload.length; i += 10) batches.push(payload.slice(i, i + 10));

    for (let i = 0; i < batches.length; i++) {
      if (cancelRun.current) break;
      setStatus(`Searching official sources… batch ${i + 1} of ${batches.length}`);
      try {
        await call({ action: "ingest", cards: batches[i] });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        break;
      }
      await refresh();
    }
    setStatus("");
  }

  async function act(body: Record<string, unknown>, label: string) {
    setStatus(label);
    setError("");
    try {
      await call(body);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setStatus("");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6 md:px-12">
          <Link to="/" className="font-display text-2xl text-ink">Samral</Link>
          <p className="text-[12px] uppercase tracking-[0.18em] text-ink/55">Admin · Card Images</p>
          <button onClick={() => supabase.auth.signOut()} className="text-[13px] text-ink/70 hover:text-ink">
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] space-y-10 px-5 py-10 sm:px-6 md:px-12">
        <div className="rounded-sm border border-clay/40 bg-clay/5 p-4 text-[13px] text-ink/80">
          <p className="font-medium text-ink">Nothing here is customer-facing until you approve it.</p>
          <p className="mt-1">
            Candidates are collected only from the card's own official bank page and that bank's official catalogue.
            Approving downloads a Samral-hosted copy, generates 160/320/640px versions and links them permanently to
            the exact internal card id.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Cards in catalogue" value={cards.length} />
          <Stat label="Verified artwork" value={verified.length} />
          <Stat label="Awaiting review" value={rows.filter((r) => r.card_image_status === "needs_review").length} />
          <Stat label="Not found / stale" value={rows.filter((r) => ["not_found", "stale"].includes(r.card_image_status)).length} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => runIngestion(rows.filter((r) => r.card_image_status !== "verified"))}
            disabled={Boolean(status)}
            className="rounded-sm bg-ink px-4 py-2.5 text-sm text-background disabled:opacity-60"
          >
            Run ingestion for missing images
          </button>
          <button
            onClick={() => runIngestion(verified)}
            disabled={Boolean(status)}
            className="rounded-sm border border-border px-4 py-2.5 text-sm text-ink disabled:opacity-60"
          >
            Re-check verified artwork
          </button>
          {status && (
            <button onClick={() => { cancelRun.current = true; }} className="text-[13px] text-ink/60 underline">
              Stop
            </button>
          )}
          <select
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
            className="rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
          >
            <option value="">All banks</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {status && <p className="text-[13px] text-ink/70">{status}</p>}
        {error && <p className="rounded-sm border border-destructive/40 bg-destructive/5 p-3 text-[13px] text-destructive">{error}</p>}
        {loading && <p className="text-sm text-ink/60">Loading queue…</p>}

        <section>
          <h2 className="font-display text-2xl text-ink">
            Review queue <span className="text-ink/50">({pending.length})</span>
          </h2>
          <div className="mt-4 space-y-4">
            {pending.map((row) => (
              <ReviewCard
                key={row.card_id}
                row={row}
                bankName={getBankById(row.bank_id)?.name ?? row.bank_id}
                subtitle={byId.get(row.card_id)?.subtitle}
                candidates={candidatesByCard.get(row.card_id) ?? []}
                busy={Boolean(status)}
                onFind={() => runIngestion([row])}
                onApprove={(candidateId) =>
                  act(
                    { action: "approve", cardId: row.card_id, cardName: row.card_name, candidateId },
                    `Downloading and optimising artwork for ${row.card_name}…`,
                  )
                }
                onReject={(candidateId) =>
                  act({ action: "reject", cardId: row.card_id, candidateId }, "Rejecting candidate…")
                }
                onUpload={(fileBase64, contentType) =>
                  act(
                    { action: "upload", cardId: row.card_id, cardName: row.card_name, fileBase64, contentType },
                    `Uploading artwork for ${row.card_name}…`,
                  )
                }
              />
            ))}
            {!loading && pending.length === 0 && <p className="text-[13px] text-ink/60">Nothing waiting for review.</p>}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink">
            Verified <span className="text-ink/50">({verified.length})</span>
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-[0.14em] text-ink/60">
                  <th className="py-2 pr-4">Card</th>
                  <th className="py-2 pr-4">Bank</th>
                  <th className="py-2 pr-4">Source type</th>
                  <th className="py-2 pr-4">Approved</th>
                  <th className="py-2 pr-4">Last checked</th>
                  <th className="py-2 pr-4">Source</th>
                </tr>
              </thead>
              <tbody>
                {verified.map((r) => (
                  <tr key={r.card_id} className="border-b border-border/70">
                    <td className="py-2 pr-4">{r.card_name}</td>
                    <td className="py-2 pr-4">{getBankById(r.bank_id)?.name ?? r.bank_id}</td>
                    <td className="py-2 pr-4">{r.card_image_source_type ?? "—"}</td>
                    <td className="py-2 pr-4">{r.card_image_verified_at?.slice(0, 10) ?? "—"}</td>
                    <td className="py-2 pr-4">{r.last_checked_at?.slice(0, 10) ?? "—"}</td>
                    <td className="py-2 pr-4">
                      {r.card_image_source_url ? (
                        <a href={r.card_image_source_url} target="_blank" rel="noopener noreferrer" className="underline">
                          Link
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
                {verified.length === 0 && (
                  <tr><td className="py-4 text-ink/60" colSpan={6}>No verified artwork yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-border bg-background p-4">
      <p className="font-display text-3xl text-ink">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink/60">{label}</p>
    </div>
  );
}

function ReviewCard({
  row,
  bankName,
  subtitle,
  candidates,
  busy,
  onFind,
  onApprove,
  onReject,
  onUpload,
}: {
  row: CardImageRow;
  bankName: string;
  subtitle?: string;
  candidates: CandidateRow[];
  busy: boolean;
  onFind: () => void;
  onApprove: (candidateId: string) => void;
  onReject: (candidateId: string) => void;
  onUpload: (base64: string, contentType: string) => void;
}) {
  return (
    <div className="rounded-sm border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{row.card_name}</p>
          {subtitle && <p className="text-[12px] text-ink/55">{subtitle}</p>}
          <p className="mt-1 text-[12px] text-ink/60">
            {bankName} · <span className="font-mono text-[11px]">{row.card_id}</span>
          </p>
          {row.card_image_source_url && (
            <a
              href={row.card_image_source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-[12px] text-ink underline underline-offset-4"
            >
              Official source page
            </a>
          )}
          {row.review_notes && <p className="mt-1 text-[12px] text-ink/60">{row.review_notes}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-sm border border-border px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-ink/60">
            {STATUS_LABEL[row.card_image_status] ?? row.card_image_status}
          </span>
          <button onClick={onFind} disabled={busy} className="text-[13px] text-ink underline disabled:opacity-50">
            Find another
          </button>
          <UploadButton disabled={busy} onUpload={onUpload} />
        </div>
      </div>

      {candidates.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c) => (
            <div key={c.id} className="rounded-sm border border-border p-3">
              <div className="flex h-28 items-center justify-center bg-[repeating-conic-gradient(#f5f5f4_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px]">
                {/* Candidate previews hotlink deliberately: they are admin-only
                    and are never shown to customers. */}
                <img src={c.image_url} alt="Candidate artwork" className="max-h-28 max-w-full object-contain" />
              </div>
              <p className="mt-2 truncate text-[11px] text-ink/55" title={c.image_url}>{c.image_url}</p>
              <p className="text-[11px] text-ink/55">{c.discovery_method} · {c.source_type} · score {c.score}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => onApprove(c.id)}
                  disabled={busy}
                  className="rounded-sm bg-ink px-3 py-1.5 text-[12px] text-background disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject(c.id)}
                  disabled={busy}
                  className="rounded-sm border border-border px-3 py-1.5 text-[12px] text-ink disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadButton({
  disabled,
  onUpload,
}: {
  disabled: boolean;
  onUpload: (base64: string, contentType: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        onClick={() => ref.current?.click()}
        disabled={disabled}
        className="text-[13px] text-ink underline disabled:opacity-50"
      >
        Upload manually
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const buffer = new Uint8Array(await file.arrayBuffer());
          let binary = "";
          for (let i = 0; i < buffer.length; i += 8192) {
            binary += String.fromCharCode(...buffer.subarray(i, i + 8192));
          }
          onUpload(btoa(binary), file.type || "image/png");
        }}
      />
    </>
  );
}
