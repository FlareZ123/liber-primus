"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const {
  parseLP2Words,
  parseSharedCorpus
} = require("./lp2_word_pages.cjs");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const read = file => fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/lp2-transcription.txt");
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const mod = n => ((n % 29) + 29) % 29;

const parsed = parseSharedCorpus();
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.crossPageWords, 32);

const words = parsed.words.map(w => ({
  indices: [...w.runes].map(r => {
    assert(runeMap.has(r), "unmapped original rune");
    return runeMap.get(r);
  }),
  startPage: w.startPage,
  endPage: w.endPage
}));
assert.equal(words.reduce((n, w) => n + w.indices.length, 0), 12956);

const p57 = parseLP2Words(raw, 58).byStartPage[57].map(w =>
  [...w.runes].map(r => runeMap.get(r)));
assert.equal(p57.length, 20);
assert.equal(p57.reduce((n, w) => n + w.length, 0), 95);

const maps = {
  index: i => i,
  prime: i => gp.prime[i] % 29,
  phi: i => (gp.prime[i] - 1) % 29
};

function keyFor(word, map) {
  const x = word.indices;
  return [map(x[0]), map(x[x.length - 1])];
}

/*
 * The proposed source-shaped operation preserves the two original
 * endpoint runes and alternates them as a two-symbol key over that
 * word's strict interior. Key phase resets at each printed word.
 */
function encryptWord(plain, map, sign, transparentF) {
  if (plain.length <= 2) return plain.slice();
  const key = [map(plain[0]), map(plain[plain.length - 1])];
  let phase = 0;
  const out = [plain[0]];
  for (const p of plain.slice(1, -1)) {
    if (transparentF && p === 0) {
      out.push(0);
      continue;
    }
    out.push(mod(p + sign * key[phase]));
    phase = (phase + 1) % 2;
  }
  out.push(plain[plain.length - 1]);
  return out;
}

function inverseCandidates(cipher, map, sign, transparentF) {
  if (cipher.length <= 2) return [cipher.slice()];
  const key = [map(cipher[0]), map(cipher[cipher.length - 1])];
  if (!transparentF) {
    const out = [cipher[0]];
    for (let j = 1; j < cipher.length - 1; j++) {
      out.push(mod(cipher[j] - sign * key[(j - 1) % 2]));
    }
    out.push(cipher[cipher.length - 1]);
    return [out];
  }

  let states = [{ phase: 0, middle: [] }];
  for (const c of cipher.slice(1, -1)) {
    const next = [];
    for (const state of states) {
      // Authentic Cicada rule: plaintext F is emitted literally and
      // does not consume a key symbol.
      if (c === 0) next.push({
        phase: state.phase,
        middle: [...state.middle, 0]
      });
      // A ciphertext F may also be an encrypted non-F plaintext rune.
      const p = mod(c - sign * key[state.phase]);
      if (p !== 0) next.push({
        phase: (state.phase + 1) % 2,
        middle: [...state.middle, p]
      });
    }
    const seen = new Set();
    states = next.filter(s => {
      const k = s.phase + ":" + s.middle.join(",");
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    if (!states.length) break;
  }
  return states.map(s => [
    cipher[0], ...s.middle, cipher[cipher.length - 1]
  ]);
}

function dictionarySet() {
  const out = new Set();
  const lines = read("resources/control/english_wordfreq_textblob.txt")
    .split("\n");
  for (const line of lines) {
    const m = line.match(/^([a-z]+)\s+\d+$/i);
    if (!m) continue;
    try { out.add(encodeSourceNativeGP(m[1]).join(",")); } catch {}
  }
  return out;
}

function quadgramModel() {
  const counts = new Map();
  let total = 0;
  for (const line of read("resources/control/duko_round27_english_quadgrams.txt").split("\n")) {
    const m = line.match(/^([A-Z]{4})\s+(\d+)$/);
    if (!m) continue;
    counts.set(m[1], Number(m[2]));
    total += Number(m[2]);
  }
  return { counts, total };
}

function quadgramScore(indices, model) {
  const letters = indices.map(i => gp.translit[i]).join("");
  const denominator = model.total + 0.1 * model.counts.size;
  let score = 0, n = 0;
  for (let i = 0; i + 4 <= letters.length; i++) {
    score += Math.log(((model.counts.get(letters.slice(i, i + 4)) || 0) + 0.1) /
      denominator);
    n++;
  }
  return score / Math.max(1, n);
}

const dict = dictionarySet();
const quadgrams = quadgramModel();
const rawIndices = words.flatMap(w => w.indices);
const rawDictionaryHits = words.filter(w =>
  dict.has(w.indices.join(","))).length;
const rawQuadgram = quadgramScore(rawIndices, quadgrams);

const results = [];
for (const [mapName, map] of Object.entries(maps)) {
  for (const sign of [1, -1]) {
    // First, the unique all-consuming inverse.
    const decoded = words.map(w =>
      inverseCandidates(w.indices, map, sign, false)[0]);
    const flat = decoded.flat();
    const allConsumingHits = decoded.filter(w =>
      dict.has(w.join(","))).length;
    results.push({
      map: mapName,
      direction: sign > 0 ? "subtract key from ciphertext" :
        "add key to ciphertext",
      plaintextFTransparent: false,
      dictionaryHits: allConsumingHits,
      quadgramScore: quadgramScore(flat, quadgrams),
      noPathWords: 0
    });

    // Then retain every legal literal-F / encrypted-non-F interpretation.
    let noPathWords = 0;
    let maximumDictionaryHits = 0;
    let totalPaths = 0;
    for (const w of words) {
      const candidates = inverseCandidates(w.indices, map, sign, true);
      totalPaths += candidates.length;
      if (!candidates.length) {
        noPathWords++;
        continue;
      }
      if (candidates.some(x => dict.has(x.join(",")))) {
        // Optimistic upper bound: choose a dictionary-valid path separately
        // for every word. This is not a claimed coherent natural-language decode.
        maximumDictionaryHits++;
      }
    }
    results.push({
      map: mapName,
      direction: sign > 0 ? "subtract key from ciphertext" :
        "add key to ciphertext",
      plaintextFTransparent: true,
      noPathWords,
      meanLegalPathsPerWord: totalPaths / words.length,
      maximumDictionaryHits
    });

    // Positive control: the known-clear p57 words are planted under this
    // exact endpoint-derived key and must be present in the inverse set.
    let plantedRunes = 0;
    for (const plain of p57) {
      const cipher = encryptWord(plain, map, sign, true);
      const candidates = inverseCandidates(cipher, map, sign, true);
      assert(candidates.some(x => x.join(",") === plain.join(",")),
        "p57 transparent-F planted inverse failed");
      plantedRunes += plain.length;
    }
    assert.equal(plantedRunes, 95);
  }
}

const summary = {
  status: "bounded negative; no unknown plaintext or key recovered",
  originalSource: {
    words: words.length,
    runes: rawIndices.length,
    crossPageWords: parsed.crossPageWords,
    p57PositiveControlWords: p57.length,
    p57PositiveControlRunes: 95
  },
  diagnostics: {
    encodableTextBlobDictionaryEntries: dict.size,
    rawCiphertextDictionaryHits: rawDictionaryHits,
    rawCiphertextQuadgramScore: rawQuadgram
  },
  keyDefinition: "preserve each word's first and last rune; alternate their mapped values as a two-symbol Vigenere key over the strict interior; reset at each original printed word",
  keyMappings: {
    index: "rune index",
    prime: "Gematria prime value modulo 29",
    phi: "Gematria prime value minus one modulo 29"
  },
  variants: results
};

console.log(JSON.stringify(summary, null, 2));
