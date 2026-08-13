import type { ProgrammeTotal, RuleResult } from "@/lib/milesCalculator";

export interface Snapshot {
  results: RuleResult[];
  portfolio: ProgrammeTotal[];
  entryContext: Map<string, { bankName: string; groupName: string; nickname: string; entered: number }>;
}
