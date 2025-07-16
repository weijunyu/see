/**
 * Convert number to base26 lowercase letters (a=0, b=1, ..., z=25, aa=26, etc.)
 */
export function encodeBase26(num: number): string {
  if (num === 0) return "a";

  let result = "";
  let n = num;
  while (n >= 0) {
    result = String.fromCharCode(97 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
    if (n < 0) break;
  }
  return result;
}
