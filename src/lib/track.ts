/** DataFast analytics helper. Safe no-op when the deferred script has not loaded. */
export const track = (event: string, payload: Record<string, unknown> = {}) => {
  try {
    const w = window as unknown as {
      datafast?: (event: string, payload?: Record<string, unknown>) => void;
    };
    if (typeof w.datafast === "function") w.datafast(event, payload);
  } catch {
    /* no-op */
  }
};
