// RANKING OF THE BLOCK CATALOGUE (node step 577-1). One function for every question «which section or block fits this need»:
// the Blocks agent's `npm run blocks -- place` (stage 1 of the block lifecycle) now, the door `block-find` and `npm run blocks -- find`
// of the elements later (577-4). No model, no network: words of the need against the words of a section or a block.
//
// How a score is made. The need and every field are cut into words (letters and digits of any alphabet), common English words are
// dropped, endings are trimmed (`numbers` → `number`, `prices` → `price`). For each word of the need the best field it appears in
// gives that field's weight; the sum is divided by the number of the need's words. A score is 0…1: 1 — every word of the need is in
// the title or a case of the block; 0 — none is anywhere.
//
// 🛑 The weights below are a first guess, not a measurement. 577-4 measures the ranking by self-retrieval: the situation of every case
// must find its own block in the first three. Change the weights only against that number.

const STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'that', 'this', 'these', 'those', 'is', 'are', 'be', 'it',
  'its', 'as', 'by', 'at', 'from', 'into', 'your', 'you', 'we', 'our', 'which', 'what', 'when', 'where', 'how', 'each', 'every',
  'one', 'any', 'some', 'can', 'may', 'will', 'not', 'no', 'but', 'if', 'so', 'than', 'then', 'there', 'their', 'they', 'them',
  'has', 'have', 'was', 'were', 'about', 'all', 'more', 'most', 'other', 'such', 'only', 'own', 'same', 'too', 'very', 'just',
  'block', 'blocks', 'section', 'page', 'need', 'want', 'show', 'shows',
])

/** A word without its common English ending: numbers → number, prices → price, cases → case, stories → story. */
export function stem(word) {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`
  if (word.length > 4 && word.endsWith('sses')) return word.slice(0, -2)
  if (word.length > 4 && word.endsWith('ing')) return word.slice(0, -3)
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('es') && /(ch|sh|x|z)es$/.test(word)) return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

/** The words of a text: lower case, any alphabet, common words dropped, endings trimmed. */
export function words(text) {
  const out = new Set()
  for (const raw of String(text ?? '').toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
    if (raw.length < 2 || STOP.has(raw)) continue
    out.add(stem(raw))
  }
  return out
}

/**
 * The score of one candidate for a need: `fields` — [{ text, weight }], weight 0…1.
 * Returns { score, matched } — matched: the words of the need that were found, for the agent to see why.
 */
// A word of five letters or more that shares its first five with a word of the field counts at 0.7 of the field's weight:
// «compare» finds «comparison», «language» finds «languages», «numbers» finds «numeric» — endings the stem does not trim.
const PREFIX = 5
const PARTIAL = 0.7
const near = (w, fieldWords) => {
  if (w.length < PREFIX) return false
  const head = w.slice(0, PREFIX)
  for (const f of fieldWords) if (f.length >= PREFIX && f.slice(0, PREFIX) === head) return true
  return false
}

export function score(needWords, fields) {
  if (!needWords.size) return { score: 0, matched: [] }
  const prepared = fields.map((f) => ({ weight: f.weight, words: words(f.text) }))
  let sum = 0
  const matched = []
  for (const w of needWords) {
    let best = 0
    for (const f of prepared) {
      const got = f.words.has(w) ? f.weight : near(w, f.words) ? f.weight * PARTIAL : 0
      if (got > best) best = got
    }
    if (best > 0) matched.push(w)
    sum += best
  }
  return { score: Math.round((sum / needWords.size) * 1000) / 1000, matched }
}

/** The first `limit` candidates by score, ties by name; candidates with score 0 are dropped. */
export function rank(need, candidates, limit = 5) {
  const needWords = words(need)
  return candidates
    .map((c) => ({ ...c, ...score(needWords, c.fields) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)))
    .slice(0, limit)
    .map(({ fields, ...rest }) => rest)
}
