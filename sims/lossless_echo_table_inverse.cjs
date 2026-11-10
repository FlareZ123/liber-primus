"use strict";
/**
 * Reversible GP29 context-dependent cipher counterexample and source-key test.
 * The transparent channels and English letter allocations were selected
 * after the original LP2 echo statistics were known. They are illustrative,
 * not an authenticated Cicada mechanism.
 *
 * Tests a genuinely bijective map at EVERY rune, versus the previously
 * considered lossy echo overwrites. Also tests the historical 256-byte grid
 * as a key to the remaining alphabet ranks, without fitting any plaintext.
 *
 * Node 22: node sims/lossless_echo_table_inverse.cjs
 * @module lossless_echo_table_inverse
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const load = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const GP = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const GRID = JSON.parse(load("resources/liber-primus/base60-grid.json"));
const RAW = load("resources/lp2-transcription.txt");
const SHAKESPEARE = load("resources/control/shakespeare_first300k.txt");
const SYMBOL = new Map(GP.runes.map((r, i) => [r, i]));
const WORDS = parseSharedCorpus().words.map(w =>
  [...w.runes].map(c => SYMBOL.get(c)));
const ORIGINAL = WORDS.flat();
assert.equal(WORDS.length, 2896);
assert.equal(ORIGINAL.length, 12956);
assert.equal(GRID.byte_rows.length, 32);
assert.equal(GRID.byte_rows[0].length, 8);
const M = 29;
const mod = x => ((x % M) + M) % M;
const EXP = [];
for (let x = 1, i = 0; i < 28; i++, x = x * 15 % 29) EXP.push(x);
assert.equal(new Set(EXP).size, 28);
const SOURCE_TOKENS = GP.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} text @returns {number[]} */
function gpText(text) {
  const all = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG");
    const encoded = [];
    for (let i = 0; i < word.length;) {
      const match = SOURCE_TOKENS.find(t => word.startsWith(t.s, i));
      if (!match) {encoded.length = 0; break;}
      encoded.push(match.i);
      i += match.s.length;
    }
    all.push(...encoded);
  }
  return all;
}
const META = [];
let section = 0, page = 0, sectionAt = 0, pageAt = 0;
for (const c of RAW.split("%").slice(0, 55).join("%")) {
  if (SYMBOL.has(c)) META.push({section, page, sectionAt:sectionAt++, pageAt:pageAt++});
  else if (c === "%") {page++;pageAt = 0;}
  else if (c === "$") {section++;sectionAt = 0;}
}
assert.equal(section, 8);
assert.equal(META.length, ORIGINAL.length);
assert.deepEqual(META.map((_, i) => ORIGINAL[i]),
  GP.pages.filter(x => x.page <= 55 && x.indices.length)
    .flatMap(x => x.indices));

/**
 * Calculate the complete permutation from available published history.
 * GP EA emits the predecessor, GP T emits the six-back affine target,
 * GP U emits the five-back target, with conditional GP E after a five-back
 * match or when the antecedent is the visible GP S rune.
 * Earlier reservations win ties, later ones take the first remaining
 * field-unit output in the original p40 primitive-root-15 order.
 * The secret byte rotates the remaining 26--28 symbols.
 *
 * @param {number} previous Published preceding rune
 * @param {number[]} history Published current word prefix
 * @param {number} i Word-local position
 * @returns {{reserved:Int8Array,assigned:Int8Array,free:number[],outputs:number[]}}
 */
function partial(previous, history, i) {
  const reserved = new Int8Array(29).fill(-1);
  const assigned = new Int8Array(29).fill(-1);
  const used = new Uint8Array(29);
  function take(plain, target) {
    let output = target;
    if (used[output]) for (const e of EXP) {
      const v = mod(previous + e);
      if (!used[v]) {output = v;break;}
    }
    assert.equal(used[output], 0);
    reserved[output] = plain;
    assigned[plain] = output;
    used[output] = 1;
  }
  take(28, previous);
  if (i >= 6) take(16, mod(24 - 2 * history[i - 6]));
  if (i >= 5) {
    const special = history[i - 5] === 15 ||
      (i >= 6 && history[i - 1] === history[i - 6]);
    take(special ? 18 : 1, history[i - 5]);
  }
  const outputs = EXP.map(e => mod(previous + e)).filter(x => !used[x]);
  const free = [];
  for (let p = 0; p < 28; p++) if (assigned[p] < 0) free.push(p);
  assert.equal(outputs.length, free.length);
  assert.equal(outputs.length + (29 - free.length), 29);
  return {reserved, assigned, free, outputs};
}

/** @param {ReturnType<typeof partial>} a @param {number} key */
function permutation(a, key) {
  const out = Array.from(a.assigned);
  const n = a.free.length;
  for (let j = 0; j < n; j++)
    out[a.free[j]] = a.outputs[(j + key % n) % n];
  assert.equal(new Set(out).size, 29);
  return out;
}

/** @param {number} seed */
function random(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;x ^= x >>> 17;x ^= x << 5;
    return x >>> 0;
  };
}

/**
 * @param {number[]} plaintext 12,956 continuous GP symbols
 * @param {(global:number, n:number)=>number} keyAt
 * @returns {number[][]}
 */
function encrypt(plaintext, keyAt) {
  assert.equal(plaintext.length, ORIGINAL.length);
  const out = [];
  let previous = 8, at = 0;
  for (const originalWord of WORDS) {
    const word = [];
    for (let i = 0; i < originalWord.length; i++) {
      const a = partial(previous, word, i);
      const n = a.free.length;
      const row = permutation(a, keyAt(at, n));
      const c = row[plaintext[at++]];
      word.push(c);
      previous = c;
    }
    out.push(word);
  }
  assert.equal(at, plaintext.length);
  return out;
}

/** @param {number[][]} ciphertext @returns {Array<{fixed:number,rank:number,free:number[]}>} */
function descriptors(ciphertext) {
  const result = [];
  let previous = 8;
  for (const word of ciphertext) for (let i = 0; i < word.length; i++) {
    const c = word[i], a = partial(previous, word, i);
    const fixed = a.reserved[c], rank = a.outputs.indexOf(c);
    assert.ok(fixed >= 0 || rank >= 0);
    result.push({fixed, rank, free:a.free});
    previous = c;
  }
  assert.equal(result.length, ORIGINAL.length);
  return result;
}
/**
 * @param {ReturnType<typeof descriptors>} prepared
 * @param {(global:number, n:number)=>number} keyAt
 */
function decryptPrepared(prepared, keyAt) {
  return prepared.map((a, i) => {
    if (a.fixed >= 0) return a.fixed;
    const n = a.free.length;
    return a.free[(a.rank - keyAt(i, n) % n + n) % n];
  });
}
const rows = GRID.byte_rows;
const row = rows.flat();
const col = Array.from({length:8}, (_, j) => rows.map(r => r[j])).flat();
const STREAMS = {
  row, column:col, "reverse-row":row.slice().reverse(),
  "reverse-column":col.slice().reverse()
};

/**
 * @param {{kind:string,scope:string,mapping:string,phase:number}} mode
 * @returns {(i:number,n:number)=>number}
 */
function gridKey(mode) {
  return (i, n) => {
    const m = META[i];
    const clock = mode.scope === "page" ? m.pageAt :
      mode.scope === "section" ? m.sectionAt : i;
    const b = mode.kind === "section-column" ?
      rows[(clock + mode.phase) % 32][m.section] :
      STREAMS[mode.kind][(clock + mode.phase) % 256];
    return mode.mapping === "scaled" ? Math.floor(b * n / 256) : b % n;
  };
}

/** @param {number[][]} book */
function features(book) {
  const m = {doublets:0, first:0, last:0, six:0, five:0,
    sFive:0, fivePairs:0, antecedentS:0, nonadjacent:0};
  let previous = -1;
  for (const word of book) for (let i = 0; i < word.length; i++) {
    const c = word[i];
    if (c === previous) {
      m.doublets++;
      if (i === 0) m.first++;
      if (i === word.length - 1) m.last++;
    }
    if (i >= 6 && c === mod(24 - 2 * word[i - 6])) m.six++;
    if (i >= 5) {
      if (word[i - 5] === 15) {
        m.antecedentS++;
        if (c === 15) m.sFive++;
      }
      if (c === word[i - 5]) {
        m.five++;
        if (i >= 6 && word[i - 1] === word[i - 6]) m.fivePairs++;
      }
    }
    if (word.length >= 4 && word.length <= 9)
      for (let j = 0; j < i - 1; j++)
        if (c === word[j]) m.nonadjacent++;
    previous = c;
  }
  return m;
}

/** @param {number[]} source */
function unigramModel(source) {
  const counts = new Float64Array(29).fill(.5);
  for (const s of source) counts[s]++;
  const sum = counts.reduce((a, b) => a + b, 0);
  return Float64Array.from(counts, x => Math.log(29 * x / sum));
}
/** @param {ReturnType<typeof descriptors>} prepared @param {Float64Array} prior */
function scanGrid(prepared, prior) {
  const choices = [], half = META.map(m => Number(m.section >= 4));
  for (const kind of [...Object.keys(STREAMS), "section-column"])
    for (const scope of ["book", "section", "page"])
      for (const mapping of ["mod", "scaled"]) {
        let best = null;
        const nPhases = kind === "section-column" ? 32 : 256;
        for (let phase = 0; phase < nPhases; phase++) {
          const mode = {kind, scope, mapping, phase}, key = gridKey(mode);
          let tr = 0, te = 0, nt = 0, ne = 0;
          for (let i = 0; i < prepared.length; i++) {
            const a = prepared[i], n = a.free.length;
            const p = a.fixed >= 0 ? a.fixed :
              a.free[(a.rank - key(i, n) % n + n) % n];
            if (half[i]) {te += prior[p];ne++;}
            else {tr += prior[p];nt++;}
          }
          const v = {...mode, train:tr / nt, holdout:te / ne};
          if (!best || v.train > best.train) best = v;
        }
        choices.push(best);
      }
  return choices.sort((a, b) => b.train - a.train);
}

function main() {
  const measured = features(WORDS);
  assert.deepEqual(measured, {doublets:86,first:23,last:19,six:80,five:104,
    sFive:11,fivePairs:9,antecedentS:74,nonadjacent:526});
  const first = gpText(SHAKESPEARE.slice(0, 190000));
  const hold = gpText(SHAKESPEARE.slice(190000));
  assert.ok(hold.length >= 12956);
  const prior = unigramModel(first);
  const r = random(0x17952601);
  const trials = 256, plants = [];
  for (let t = 0; t < trials; t++) {
    const start = r() % (hold.length - ORIGINAL.length + 1);
    const sample = hold.slice(start, start + ORIGINAL.length);
    const printed = encrypt(sample, () => r());
    const inverse = decryptPrepared(descriptors(printed), () => 0);
    assert.equal(inverse.length, sample.length);
    plants.push(features(printed));
  }
  const summary = {};
  for (const field of Object.keys(measured)) {
    const a = plants.map(p => p[field]).sort((x, y) => x - y);
    summary[field] = {real:measured[field],
      mean:a.reduce((x,y)=>x+y,0)/trials,
      p05:a[13],median:a[128],p95:a[243],min:a[0],max:a.at(-1)};
  }
  const source = hold.slice(5000, 5000 + ORIGINAL.length);
  const trueMode = {kind:"section-column",scope:"section",mapping:"mod",phase:7};
  const positive = encrypt(source, gridKey(trueMode));
  const trueInverse = decryptPrepared(descriptors(positive),gridKey(trueMode));
  assert.deepEqual(trueInverse, source);
  assert.deepEqual(encrypt(trueInverse,gridKey(trueMode)),positive);
  const score = (xs) => xs.reduce((s,p)=>s+prior[p],0)/xs.length;
  const positiveLanguage = score(trueInverse);
  const scanOriginal = scanGrid(descriptors(WORDS),prior);
  const originalWinner = scanOriginal[0];
  const decoded = decryptPrepared(descriptors(WORDS),gridKey(originalWinner));
  assert.deepEqual(encrypt(decoded,gridKey(originalWinner)), WORDS);
  const selected = scanGrid(descriptors(positive),prior);
  assert.ok(selected[0].train > 0.10);
  assert.ok(positiveLanguage > 0.10);
  return {
    status:"Constructive reversible alternative; post-selected alphabet roles; no original LP2 plaintext or key",
    originalSha256:createHash("sha256").update(RAW).digest("hex"),
    sources:{unresolvedRunes:ORIGINAL.length,words:WORDS.length,
      GPTrainingRunes:first.length,GPHeldoutRunes:hold.length},
    actual:measured,
    generator:{seed:"0x17952601",trials,summary,
      key:"independent uniform xorshift byte every rune",
      plaintext:"contiguous held-out Shakespeare GP runes; cipher words independent of plaintext words"},
    originalGrid:{settings:6336,byTraining:scanOriginal.slice(0,10),
      bestTrainingOriginal:originalWinner.train,
      unchangedHeldoutOriginal:originalWinner.holdout,
      scoreRelativeToUniform:"mean log(29*q[decodedRune])"},
    sourceMatchedGridPlant:{trueMode,matched:source.length,
      scoreOriginalTrueKey:positiveLanguage,
      topByTraining:selected.slice(0,6)},
    interpretation:"Model explains selected profile through plaintext-symbol channels, but its transparent symbols were chosen from original anomalies. All grid-key inversions require external independent plaintext validation; only the authentic original ciphertext test can establish a real key."
  };
}
if (require.main === module) console.log(JSON.stringify(main(),null,2));
module.exports={gpText,partial,permutation,encrypt,descriptors,decryptPrepared,
  gridKey,features,unigramModel,scanGrid,main};
