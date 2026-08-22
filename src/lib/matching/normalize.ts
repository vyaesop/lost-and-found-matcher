// Words that carry no signal when comparing lost and found reports.
const STOPWORDS = new Set([
  "a", "an", "the", "i", "my", "me", "mine", "your", "our",
  "of", "in", "on", "at", "near", "by", "beside", "next", "to",
  "was", "is", "are", "it", "its", "and", "or", "with", "for",
  "from", "this", "that", "these", "those", "around", "about",
  "have", "has", "had", "there", "here", "some", "someone",
  "lost", "found", "item", "please", "help", "yesterday", "today",
  "morning", "afternoon", "evening", "night", "am", "pm",
]);

// Deliberately small: only groups that showed up in realistic reports.
const SYNONYM_GROUPS: string[][] = [
  ["backpack", "bag", "rucksack", "knapsack", "bookbag"],
  ["earbuds", "earbud", "airpods", "airpod", "earphones", "headphones", "earpods"],
  ["phone", "iphone", "smartphone", "mobile"],
  ["laptop", "macbook", "notebook", "computer"],
  ["wallet", "purse", "billfold"],
  ["bottle", "flask", "thermos", "tumbler"],
  ["cafeteria", "canteen", "cafe", "coffee", "coffeeshop"],
  ["gym", "fieldhouse", "rec"],
  ["key", "keys", "keychain", "keyring"],
  ["glasses", "spectacles", "eyeglasses"],
  ["jacket", "coat"],
  ["hoodie", "sweatshirt", "sweater", "jumper"],
  ["dorm", "dormitory"],
  ["charger", "adapter"],
  ["watch", "wristwatch"],
  ["black", "dark", "charcoal"],
  ["gray", "grey"],
  ["blue", "navy"],
];

const CANONICAL = new Map<string, string>();
for (const group of SYNONYM_GROUPS) {
  for (const word of group) CANONICAL.set(word, group[0]);
}

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Naive singularizer, good enough for everyday nouns.
function singularize(token: string): string {
  if (token.length > 4 && token.endsWith("ies")) return token.slice(0, -3) + "y";
  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss")) {
    return token.slice(0, -1);
  }
  return token;
}

function canonicalize(token: string): string {
  const direct = CANONICAL.get(token);
  if (direct) return direct;
  const singular = singularize(token);
  return CANONICAL.get(singular) ?? singular;
}

export function tokenize(input: string): string[] {
  const seen = new Set<string>();
  for (const raw of normalizeText(input).split(" ")) {
    // Single digits stay: room numbers like "hall 3" are real signal.
    if ((raw.length < 2 && !/^\d$/.test(raw)) || STOPWORDS.has(raw)) continue;
    seen.add(canonicalize(raw));
  }
  return [...seen];
}
