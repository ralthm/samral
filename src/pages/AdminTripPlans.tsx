import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

/**
 * Admin · Trip Plan orders.
 *
 * Internal visibility only: lists paid Points Trip Plan orders with their
 * intake state, delivery deadline and refund state, and lets an admin flip
 * fulfilment status / leave notes. Refunds are issued manually in Stripe;
 * the webhook marks the order refunded afterwards.
 */

type OrderRow = Tables<"trip_plan_orders">;
type IntakeRow = Tables<"trip_intake_submissions">;

const ORDER_STATUSES = [
  "pending_payment",
  "paid_awaiting_intake",
  "intake_received",
  "in_progress",
  "delivered",
  "refunded",
  "cancelled",
] as const;

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending payment",
  paid_awaiting_intake: "Paid · awaiting intake",
  intake_received: "Intake received",
  in_progress: "In progress",
  delivered: "Delivered",
  refunded: "Refunded",
  cancelled: "Cancelled",
  payment_failed: "Payment failed",
  expired: "Expired",
};

const fmt = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";
const money = (cents: number | null, currency: string | null) =>
  cents == null ? "—" : `${(cents / 100).toFixed(2)} ${(currency ?? "usd").toUpperCase()}`;

export default function AdminTripPlans() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    document.title = "Admin · Trip Plans | Samral";
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
        <p className="mt-3 text-sm text-ink/70">This account does not hold the admin role.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-6 rounded-sm border border-border px-4 py-2 text-sm text-ink">
          Sign out
        </button>
      </Shell>
    );
  }
  return <Orders />;
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Shell>
      <h1 className="font-display text-3xl text-ink">Admin sign in</h1>
      <p className="mt-3 text-sm text-ink/70">Trip Plan orders are restricted to Samral admin accounts.</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) setError(error.message);
          setBusy(false);
        }}
      >
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" required className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm" />
        {error && <p className="text-[13px] text-destructive">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-sm bg-ink px-4 py-2.5 text-sm text-background disabled:opacity-60">
          {busy ? "Working…" : "Sign in"}
        </button>
      </form>
    </Shell>
  );
}

function Orders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [intakes, setIntakes] = useState<Record<string, IntakeRow>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "all">("open");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [{ data: o, error: oe }, { data: i, error: ie }] = await Promise.all([
      supabase.from("trip_plan_orders").select("*").order("created_at", { ascending: false }).limit(300),
      supabase.from("trip_intake_submissions").select("*").order("created_at", { ascending: false }).limit(300),
    ]);
    if (oe || ie) setError((oe ?? ie)?.message ?? "Failed to load");
    setOrders((o ?? []) as OrderRow[]);
    const map: Record<string, IntakeRow> = {};
    for (const row of (i ?? []) as IntakeRow[]) if (row.order_id) map[row.order_id] = row;
    setIntakes(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = orders.filter((o) =>
    filter === "all" ? true : !["delivered", "refunded", "cancelled", "expired", "payment_failed"].includes(o.status),
  );

  const save = async (id: string, patch: Partial<Pick<OrderRow, "status" | "internal_notes" | "delivered_at">>) => {
    const { error } = await supabase.from("trip_plan_orders").update(patch).eq("id", id);
    if (error) setError(error.message);
    else await load();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1180px] px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link to="/" className="font-display text-2xl text-ink">Samral</Link>
            <h1 className="mt-4 font-display text-3xl text-ink">Trip Plan orders</h1>
            <p className="mt-2 text-sm text-ink/60">
              Paid Points Trip Plans, intake state and delivery deadlines. Refunds are issued in Stripe; the
              order is marked refunded automatically.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button onClick={() => setFilter("open")} className={`rounded-sm border px-3 py-1.5 ${filter === "open" ? "border-ink bg-ink text-background" : "border-border text-ink"}`}>Open</button>
            <button onClick={() => setFilter("all")} className={`rounded-sm border px-3 py-1.5 ${filter === "all" ? "border-ink bg-ink text-background" : "border-border text-ink"}`}>All</button>
            <button onClick={load} className="rounded-sm border border-border px-3 py-1.5 text-ink">Refresh</button>
            <Link to="/admin/card-images" className="text-ink/60 underline underline-offset-4">Card images</Link>
            <button onClick={() => supabase.auth.signOut()} className="text-ink/60 underline underline-offset-4">Sign out</button>
          </div>
        </div>

        {error && <p className="mt-6 border border-destructive/40 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">{error}</p>}
        {loading && <p className="mt-8 text-sm text-ink/60">Loading…</p>}
        {!loading && visible.length === 0 && <p className="mt-8 text-sm text-ink/60">No orders {filter === "open" ? "open" : "yet"}.</p>}

        <div className="mt-8 space-y-3">
          {visible.map((o) => {
            const intake = intakes[o.id];
            const open = openId === o.id;
            const overdue = o.delivery_deadline && !o.delivered_at && new Date(o.delivery_deadline) < new Date();
            return (
              <div key={o.id} className="rounded-sm border border-border">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : o.id)}
                  className="grid w-full grid-cols-2 gap-3 px-4 py-3 text-left text-[13px] md:grid-cols-[130px_1fr_1fr_160px_150px_110px]"
                >
                  <span className="font-medium text-ink">{o.order_number}{!o.stripe_livemode && <span className="ml-2 rounded-sm bg-ink/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink/60">test</span>}</span>
                  <span className="truncate text-ink/80">{o.customer_name ?? "—"}<br /><span className="text-ink/50">{o.customer_email ?? "—"}</span></span>
                  <span className="text-ink/80">
                    {intake ? `${intake.departure_airport} → ${intake.destination}` : <span className="text-ink/40">No intake yet</span>}
                    <br /><span className="text-ink/50">{intake ? `${fmtDate(intake.departure_date)} · ${intake.travellers} pax · ${intake.cabin_preference}` : ""}</span>
                  </span>
                  <span className="text-ink/80">{STATUS_LABEL[o.status] ?? o.status}<br /><span className="text-ink/50">{o.payment_status}{o.refund_status !== "none" ? ` · ${o.refund_status}` : ""}</span></span>
                  <span className={overdue ? "text-destructive" : "text-ink/80"}>
                    {o.delivery_deadline ? `Due ${fmtDate(o.delivery_deadline)}` : "—"}
                    <br /><span className="text-ink/50">Paid {fmtDate(o.purchased_at)}</span>
                  </span>
                  <span className="text-ink/80">{money(o.amount_total, o.currency)}</span>
                </button>

                {open && (
                  <div className="border-t border-border px-4 py-5 text-[13px]">
                    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
                      <div>
                        {intake ? <IntakeDetail i={intake} /> : <p className="text-ink/60">Customer paid but has not submitted the trip form yet.</p>}
                      </div>
                      <OrderControls o={o} onSave={(patch) => save(o.id, patch)} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IntakeDetail({ i }: { i: IntakeRow }) {
  const points = Array.isArray(i.points_balances) ? (i.points_balances as { programme?: string; balance?: string }[]) : [];
  const rows: [string, React.ReactNode][] = [
    ["Route", `${i.departure_airport} → ${i.destination}`],
    ["Dates", `${fmtDate(i.departure_date)} – ${fmtDate(i.return_date)} (${i.date_flexibility})`],
    ["Travellers", `${i.travellers} (${i.adults ?? "?"} adults, ${i.children ?? 0} children)`],
    ["Cabin", i.cabin_preference],
    ["Points", points.length ? points.map((p, idx) => <div key={idx}>{p.programme || "—"}: {p.balance || "—"}</div>) : "—"],
    ["Priorities", i.priorities?.length ? i.priorities.join(", ") : "—"],
    ["Cash fare", i.found_cash_fare ? `${i.cash_fare_amount ?? "?"} ${i.cash_fare_currency ?? ""}` : "Not found yet"],
    ["Avoid", i.airlines_to_avoid ?? "—"],
    ["Status", i.airline_status ?? "—"],
    ["Special", i.special_requirements ?? "—"],
    ["Notes", i.notes ?? "—"],
    ["Contact", `${i.name} · ${i.email}`],
    ["Submitted", fmt(i.created_at)],
  ];
  return (
    <dl className="grid grid-cols-[110px_1fr] gap-y-2">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-[11px] uppercase tracking-[0.12em] text-ink/50">{k}</dt>
          <dd className="whitespace-pre-wrap text-ink/85">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function OrderControls({
  o,
  onSave,
}: {
  o: OrderRow;
  onSave: (patch: Partial<Pick<OrderRow, "status" | "internal_notes" | "delivered_at">>) => Promise<void>;
}) {
  const [status, setStatus] = useState(o.status);
  const [notes, setNotes] = useState(o.internal_notes ?? "");
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3 rounded-sm bg-ink/[0.03] p-4">
      <div className="grid grid-cols-[90px_1fr] gap-y-1 text-[12px] text-ink/70">
        <span className="text-ink/50">Session</span><span className="truncate font-mono">{o.stripe_checkout_session_id}</span>
        <span className="text-ink/50">Payment</span><span className="truncate font-mono">{o.stripe_payment_intent_id ?? "—"}</span>
        <span className="text-ink/50">Customer</span><span className="truncate font-mono">{o.stripe_customer_id ?? "—"}</span>
        <span className="text-ink/50">Refund</span><span>{o.refund_status}{o.refund_amount != null ? ` · ${money(o.refund_amount, o.currency)}` : ""}{o.refunded_at ? ` · ${fmtDate(o.refunded_at)}` : ""}</span>
        <span className="text-ink/50">Delivered</span><span>{fmt(o.delivered_at)}</span>
      </div>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.12em] text-ink/50">Status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm">
          {[...ORDER_STATUSES, ...(ORDER_STATUSES.includes(o.status as never) ? [] : [o.status])].map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.12em] text-ink/50">Internal notes</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 min-h-[80px] w-full rounded-sm border border-border bg-background px-2 py-2 text-sm" />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onSave({
              status,
              internal_notes: notes.trim() || null,
              delivered_at: status === "delivered" ? o.delivered_at ?? new Date().toISOString() : o.delivered_at,
            });
            setBusy(false);
          }}
          className="rounded-sm bg-ink px-4 py-2 text-sm text-background disabled:opacity-60"
        >
          Save
        </button>
        {o.status !== "delivered" && (
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onSave({ status: "delivered", delivered_at: new Date().toISOString(), internal_notes: notes.trim() || null });
              setBusy(false);
            }}
            className="rounded-sm border border-border px-4 py-2 text-sm text-ink disabled:opacity-60"
          >
            Mark delivered
          </button>
        )}
      </div>
    </div>
  );
}
