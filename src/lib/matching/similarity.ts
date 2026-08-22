export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

// Tokens match exactly, or within one edit for longer words (typo tolerance).
export function tokensMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 5 || b.length < 5) return false;
  if (Math.abs(a.length - b.length) > 1) return false;
  return levenshtein(a, b) <= 1;
}

// Dice coefficient over two token sets with fuzzy token matching.
export function tokenSetSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;

  const used = new Array<boolean>(b.length).fill(false);
  let matches = 0;
  for (const tokenA of a) {
    for (let j = 0; j < b.length; j++) {
      if (!used[j] && tokensMatch(tokenA, b[j])) {
        used[j] = true;
        matches++;
        break;
      }
    }
  }
  return (2 * matches) / (a.length + b.length);
}
