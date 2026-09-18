import { useState } from "react";
import { Info } from "lucide-react";
import { getAllianceInfo } from "@/data/alliances";
import { TRIP_PLAN_FORM_URL } from "@/lib/commerce";

interface Props {
  programmeId: string;
  programmeName: string;
  /** Optional calculator context retained for callers that use this component. */
  ctaContext?: {
    calculatedBalance?: number;
    destination?: string;
    cabin?: string;
    travellers?: number;
    selectedRedemption?: string;
  };
}

export function AllianceBadge({ programmeId }: { programmeId: string }) {
  const info = getAllianceInfo(programmeId);
  if (!info) return null;
  return (
    <span
      className="inline-flex items-center rounded-sm border border-border bg-sand/40 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-ink/70"
      aria-label={`${info.allianceDisplayName} member`}
    >
      {info.allianceDisplayName}
    </span>
  );
}

export function AllianceInfo({ programmeId, programmeName }: Props) {
  const info = getAllianceInfo(programmeId);
  const [open, setOpen] = useState(false);
  if (!info) return null;

  const compact =
    info.allianceCode === "OW"
      ? "Also usable for eligible oneworld partner-airline awards through this loyalty programme."
      : "Also usable for eligible Star Alliance partner-airline awards through this loyalty programme.";

  return (
    <div className="mt-3 border-t border-border pt-3 text-[12px] text-ink/70">
      <p className="flex flex-wrap items-start gap-1.5">
        <Info className="mt-[2px] h-3.5 w-3.5 flex-shrink-0 text-ink/50" aria-hidden />
        <span>
          {compact}{" "}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="text-ink underline underline-offset-2 hover:no-underline"
          >
            {open ? "Hide details" : "How partner awards work"}
          </button>
        </span>
      </p>

      {open && (
        <div className="mt-3 space-y-3 rounded-sm border border-border bg-sand/30 p-4 text-[12px] leading-relaxed text-ink/80">
          <div>
            <p className="font-display text-sm text-ink">Use your miles on partner airlines</p>
            <p className="mt-1.5">
              Your miles remain in {programmeName}. You do not transfer them to the alliance or to another
              airline. Instead, you use {programmeName} to book an eligible partner-airline award, subject to its
              own award pricing, availability, taxes, fees and booking rules.
            </p>
          </div>

          <p>
            Partner-airline availability is not the same as ordinary cash-ticket availability. Some awards may
            not appear online and may require the loyalty programme's customer service team.
          </p>

          {info.partnerAwardDisclaimer && (
            <p className="border-l-2 border-ink/20 pl-3 italic text-ink/70">{info.partnerAwardDisclaimer}</p>
          )}

          <p className="text-ink/60">
            Samral's calculator currently estimates redemptions on the programme's primary airline
            ({info.primaryAirline}) only. Alliance access is shown for awareness and does not mean that every
            partner airline, route or cabin is available.
          </p>

          <div className="border-t border-border pt-3">
            <a
              href={TRIP_PLAN_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-ink bg-ink px-4 py-2 text-[12px] font-medium text-background hover:bg-ink/90"
            >
              Get my Points Trip Plan — US$99
            </a>
            <p className="mt-2 text-[11px] text-ink/60">
              One-time payment · Delivered within 2 business days
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-ink/40">
              Source: {info.allianceDisplayName} ·{" "}
              <a href={info.officialSourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
                official programme info
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
