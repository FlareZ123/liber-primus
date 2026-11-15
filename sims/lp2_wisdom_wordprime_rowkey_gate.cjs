'use strict';

/*
 * Frozen hypothesis:
 * 2014 LP1 p05 5x5 Wisdom square -> phi(cell) mod 29 key row.
 * Current plaintext word's GP-prime sum mod 5 selects the row.
 * Rune position within the printed word selects the column (period 5).
 * Cipher = plaintext + key mod 29; word boundary resets phase.
 * Test the solved p56 transparent-plaintext-F rule separately.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const parsed = parseSharedCorpus();
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = n => ((n % 29) + 29) % 29;
const prime = corpus.prime;
const F = 0;

assert.equal(corpus.runes.length, 29);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);

const square = [
  [272,138,341,131,151],
  [366,199,130,320,18],
  [226,245,91,245,226],
  [18,320,130,199,366],
  [151,131,341,138,272],
];
function phi(n) {
  let x = n, result = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p !== 0) continue;
    while (x % p === 0) x /= p;
    result -= result / p;
  }
  if (x > 1) result -= result / x;
  return Math.round(result);
}
assert(square.every(row => row.reduce((a,b)=>a+b,0) === 1033));
assert(Array.from({length:5}, (_,c)=>square.reduce((s,row)=>s+row[c],0)).every(x=>x===1033));
const keyRows = square.map(row => row.map(n => phi(n) % 29));

function indices(word) {
  return Array.from(word, r => {
    const i = runeIndex.get(r);
    assert(Number.isInteger(i), 'unknown GP rune '+r);
    return i;
  });
}
function primeSumMod5(values) {
  return values.reduce((s, v) => s + prime[v], 0) % 5;
}
function encodeWord(plain, row, transparentF) {
  let phase = 0;
  const out = [];
  for (const p of plain) {
    if (transparentF && p === F) {
      out.push(F);
      continue;
    }
    out.push(mod(p + keyRows[row][phase]));
    phase = (phase + 1) % 5;
  }
  return out;
}
function capAdd(dp, phase, sum, count) {
  dp[phase][sum] = Math.min(2, dp[phase][sum] + count);
}
function countSelfConsistentPaths(cipher, row, transparentF) {
  let dp = Array.from({length:5}, () => Array(5).fill(0));
  dp[0][0] = 1;
  for (const c of cipher) {
    const next = Array.from({length:5}, () => Array(5).fill(0));
    for (let phase = 0; phase < 5; phase++) {
      for (let sum = 0; sum < 5; sum++) {
        const count = dp[phase][sum];
        if (!count) continue;
        if (transparentF && c === F) {
          // Literal plaintext F: emits F and does not consume a key cell.
          capAdd(next, phase, (sum + prime[F]) % 5, count);
        }
        // A ciphertext F can also be an encrypted non-F rune. Under the
        // transparent-F rule, ordinary encryption may not yield plaintext F.
        const p = mod(c - keyRows[row][phase]);
        if (!transparentF || p !== F) {
          capAdd(next, (phase + 1) % 5, (sum + prime[p]) % 5, count);
        }
      }
    }
    dp = next;
  }
  let count = 0;
  for (let phase = 0; phase < 5; phase++) count = Math.min(2, count + dp[phase][row]);
  return count;
}
function summarizeModel(words, transparentF) {
  const categories = {impossible:0, unique:0, ambiguous:0};
  const rowHits = Array(5).fill(0);
  for (const cipher of words) {
    let total = 0;
    for (let row = 0; row < 5; row++) {
      const count = countSelfConsistentPaths(cipher, row, transparentF);
      if (count) rowHits[row]++;
      total = Math.min(2, total + count);
    }
    if (!total) categories.impossible++;
    else if (total === 1) categories.unique++;
    else categories.ambiguous++;
  }
  return {categories, selfConsistentWordsByRow:rowHits};
}

// Four original image-confirmed apostrophe words are held-out morphology
// anchors. Offset is the zero-based rune immediately following the tick.
const sites = [
  {page:4, afterTick:1110, stem:3, label:"MXI'W", cipher:[19,14,10,7],
    candidates:['DONT','CANT','WONT','AINT','ISNT','LETS','GODS','ONES','MANS','MENS','SHED','YOUD','ALLS']},
  {page:21, afterTick:5138, stem:2, label:"AEO'Y", cipher:[25,3,26],
    candidates:['ITS','HES','WED','HED','ITD','DOS']},
  {page:35, afterTick:8515, stem:2, label:"PE'T", cipher:[13,18,16],
    candidates:['ITS','HES','WED','HED','ITD','DOS']},
  {page:41, afterTick:10089, stem:3, label:"XLJ'C", cipher:[14,20,11,5],
    candidates:['DONT','CANT','WONT','AINT','ISNT','LETS','GODS','ONES','MANS','MENS','SHED','YOUD','ALLS']},
];
const wordRecords = [];
let offset = 0;
for (const w of parsed.words) {
  const values = indices(w.runes);
  wordRecords.push({...w, values, globalStart:offset, globalEnd:offset+values.length});
  offset += values.length;
}
assert.equal(offset, 12956);
const anchorResults = sites.map(site => {
  const wordStart = site.afterTick - site.stem;
  const record = wordRecords.find(w => w.globalStart <= wordStart && w.globalEnd > wordStart);
  assert(record, 'apostrophe anchor word missing '+site.label);
  assert.equal(record.globalStart, wordStart);
  assert.equal(record.startPage, site.page);
  assert.equal(record.values.length, site.cipher.length);
  assert.deepEqual(record.values, site.cipher);
  const matches = [];
  const tested = [];
  for (const candidate of site.candidates) {
    const plain = Array.from(candidate, ch => {
      const i = corpus.translit.indexOf(ch);
      assert(i >= 0 && corpus.translit[i].length === 1, 'candidate not single-GP-letter '+ch);
      return i;
    });
    const row = primeSumMod5(plain);
    const encoded = encodeWord(plain, row, true);
    const match = encoded.every((v,i)=>v===site.cipher[i]);
    tested.push({candidate,row,encoded,match});
    if (match) matches.push({candidate,row});
  }
  return {
    page:site.page, afterTick:site.afterTick, word:site.label,
    globalStart:record.globalStart,
    ciphertextPrimeSumMod5:primeSumMod5(record.values),
    candidatesTested:tested.length, matches, tested,
  };
});

const cipherWords = wordRecords.map(w => w.values);
const noBypass = summarizeModel(cipherWords, false);
const transparentF = summarizeModel(cipherWords, true);

// Reproducible source-shaped plant: generate words, select each row from the
// true plaintext prime sum, encrypt, and require the exact row to survive the
// full self-consistency inverse. The forward byte-for-byte check is explicit.
let rng = 0x33011033;
function random32() {
  rng ^= rng << 13; rng >>>= 0;
  rng ^= rng >>> 17; rng >>>= 0;
  rng ^= rng << 5; rng >>>= 0;
  return rng >>> 0;
}
let planted = 0, plantedUnique = 0, plantedAmbiguous = 0;
for (let n = 0; n < 500; n++) {
  const len = 3 + (random32() % 18);
  const plain = Array.from({length:len}, () => random32() % 29);
  const row = primeSumMod5(plain);
  const cipher = encodeWord(plain, row, true);
  assert.deepEqual(encodeWord(plain, row, true), cipher);
  assert(countSelfConsistentPaths(cipher, row, true) > 0);
  const total = Array.from({length:5}, (_,r)=>countSelfConsistentPaths(cipher,r,true))
    .reduce((s,x)=>Math.min(2,s+x),0);
  if (total === 1) plantedUnique++;
  else plantedAmbiguous++;
  planted++;
}
assert.equal(planted,500);

const result = {
  hypothesis: {
    square:"2014 LP1 p05 Wisdom 5x5, magic constant 1033",
    key:"phi(square[row][column]) mod 29",
    rowSelector:"sum of plaintext GP-prime weights modulo 5",
    phase:"rune position within printed word modulo 5; reset each word",
    operation:"cipher = plaintext + key mod 29",
    transparentF:"tested separately; literal plaintext F emits F without consuming phase",
  },
  source: {
    runeCount:parsed.runeCount, wordCount:parsed.words.length,
    crossPageWords:parsed.crossPageWords, keyRows,
    anchors:anchorResults,
  },
  originalCipher: {noBypass, transparentF},
  plantedPositive: {
    seed:"0x33011033", words:planted,
    exactRowSurvivesSelfConsistency:planted,
    uniqueSelfConsistent:plantedUnique, ambiguousSelfConsistent:plantedAmbiguous,
  },
};
console.log(JSON.stringify(result,null,2));
assert(anchorResults.every(x=>x.matches.length===0));
