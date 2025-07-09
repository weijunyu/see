// Assume timestamps are always stored in UTC, so we need to parse them as UTC
export function formatForDisplay(date: string) {
  if (!date.endsWith("Z")) {
    date += "Z";
  }
  return new Date(date).toLocaleString();
}
