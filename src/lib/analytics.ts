// Thin wrapper around the existing DataFast analytics script.
// No new analytics platform is introduced.
export function track(event: string, payload?: Record<string, unknown>) {
  const w = window as unknown as {
    datafast?: (e: string, p?: Record<string, unknown>) => void;
  };
  if (typeof w.datafast === "function") w.datafast(event, payload);
}
