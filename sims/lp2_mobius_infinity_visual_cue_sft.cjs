"use strict";

// Reproduce the bounded LP2 Möbius/infinity visual-cue tests.
// Run from repository root:
//   node sims/lp2_mobius_infinity_visual_cue_sft.cjs
// This is a falsification/identifiability screen, not a decoder.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const solved = JSON.parse(fs.readFileSync(path.join(root, "resources/external/relikd-solved-gp29-native-v1.json"), "utf8"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const alphabet = grid.alphabet;
const tokens = grid.pages.flatMap(p => p.tokens);
const mod = x => ((x % 29) + 29) % 29;

function base60(token) {
  return alphabet.indexOf(token[0]) * 60 + alphabet.indexOf(token[1]);
}
function wordsOf(sourceText) {
  return (sourceText.match(/[\\u16A0-\\u16FF]+/gu) || []).map((word, i) => ({
    i,
    word: [...word].map(r => corpus.translit[runeIndex.get(r)]).join(""),
    address: [...word].reduce((sum, r) => sum + runeIndex.get(r), 0)
  }));
}
function consecutiveEdges(words, nextAddress) {
  const edges = [];
  for (let i = 0; i + 1 < words.length; i++) {
    const next = nextAddress(words[i]);
    if (next !== null && next === words[i + 1].address) {
      edges.push({ from: words[i].word, to: words[i + 1].word, address: words[i].address, next });
    }
  }
  return edges;
}
const p0 = solved.sections.find(s => s.name === "0_wisdom");
const p56 = solved.sections.find(s => s.name === "p56_an_end");
const p57 = solved.sections.find(s => s.name === "p57_parable");
assert(p0 && p56 && p57);

function mobiusNext(cell) {
  const row = Math.floor(cell / 8), col = cell % 8;
  return row < 31 ? (row + 1) * 8 + col : 7 - col;
}
function mobiusAdvance(cell, steps) {
  for (let i = 0; i < steps % 64; i++) cell = mobiusNext(cell);
  return cell;
}
function rowMajorWalk(words) {
  return consecutiveEdges(words, word => {
    if (word.address < 0 || word.address >= 256) return null;
    const steps = base60(tokens[word.address]) % 64;
    return mobiusAdvance(word.address, steps);
  });
}
const p0Words = wordsOf(p0.source_text);
const p56Words = wordsOf(p56.source_text);
const p57Words = wordsOf(p57.source_text);
const rowMajorEdges = {
  p0: rowMajorWalk(p0Words),
  p56: rowMajorWalk(p56Words),
  p57: rowMajorWalk(p57Words)
};
const address67 = {
  p0: p0Words.filter(w => w.address === 67).map(w => w.word),
  p56: p56Words.filter(w => w.address === 67).map(w => w.word),
  p57: p57Words.filter(w => w.address === 67).map(w => w.word)
};

// Alternative natural convention: linearize four 64-cell Möbius cycles first.
const mobiusOrder = [];
for (let startCol = 0; startCol < 4; startCol++) {
  let row = 0, col = startCol;
  for (let i = 0; i < 64; i++) {
    mobiusOrder.push(row * 8 + col);
    if (row < 31) row++;
    else { row = 0; col = 7 - col; }
  }
}
assert.equal(new Set(mobiusOrder).size, 256);
function cycleLinearWalk(words) {
  return consecutiveEdges(words, word => {
    if (word.address < 0 || word.address >= 256) return null;
    const cell = mobiusOrder[word.address];
    const steps = base60(tokens[cell]) % 64;
    return Math.floor(word.address / 64) * 64 + ((word.address % 64 + steps) % 64);
  });
}
const cycleLinearEdges = {
  p0: cycleLinearWalk(p0Words),
  p56: cycleLinearWalk(p56Words),
  p57: cycleLinearWalk(p57Words)
};

// Four 2x2 matrices from consecutive quartets of the p15 spiral prime
// differences. This grouping is a tested hypothesis, not source-stated.
const p15Primes = [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817];
function inverse(a) {
  a = mod(a);
  for (let x = 1; x < 29; x++) if (mod(a * x) === 1) return x;
  throw new Error("non-unit in GF(29)");
}
const matrices = [];
for (let j = 0; j < 4; j++) {
  const [a, b, c, d] = p15Primes.slice(4 * j, 4 * j + 4).map(mod);
  matrices.push({ coefficients: [a, b, c, d], determinant: mod(a * d - b * c) });
}
assert.deepEqual(matrices.map(m => m.determinant), [28, 9, 12, 4]);
function inverseMobius(x, matrix) {
  const [a, b, c, d] = matrix.coefficients;
  const A = d, B = mod(-b), C = mod(-c), D = a;
  const denominator = mod(C * x + D);
  return denominator === 0 ? 29 : mod((A * x + B) * inverse(denominator));
}
const p50Blocks = [];
for (let block = 0; block < 4; block++) {
  let output = "";
  let infinityCount = 0;
  for (let i = block * 64; i < (block + 1) * 64; i++) {
    const x = mod(base60(tokens[i]));
    const y = inverseMobius(x, matrices[block]);
    if (y === 29) { output += "∞"; infinityCount++; }
    else output += corpus.translit[y];
  }
  p50Blocks.push({ block, output, infinityCount });
}

// Exhaustive global PGL(2,29) substitution screen. Hyphen is infinity.
const commonWords = new Set(("THE OF AND TO IN A THAT HE WAS IT HIS IS WITH AS I HAD FOR AT BY ON NOT BE FROM BUT YOU OR HER HIM WHICH WERE ALL THIS SHE THEY ARE HAVE SAID AN ONE WHO SO WHAT THERE THEIR WHEN BEEN MAY IF NO UP MY THEM INTO MORE OUT WOULD ME WE DID ONLY COULD NOW MAN ITS HAS WILL THEN SOME TIME AFTER DO OTHER ABOUT SUCH BEFORE VERY HOW SHOULD OVER YOUR THESE NEW THAN ANY THOSE WELL OLD FIRST MEN TWO DOWN SEE CAN LIKE OUR SAME KNOW WITHOUT WENT MADE LITTLE LONG CAME WHERE UNDER ROOM MUST EVEN EYES COME STILL BEING MOST GO THOUGHT PEOPLE WAR LIFE AGAIN WAY ANOTHER AWAY HAND LEFT DAY THROUGH BEGAN GREAT OWN ALSO WHILE JUST SAY BACK GOOD WHOLE SHALL HEAD RIGHT PART HERE YES US SOMETHING WHY HAVING PLACE MUCH STATE HOUSE AGAINST BETWEEN EVERY THOUGH NOTHING OFF BECAUSE YOUNG MANY ALWAYS SAW NEVER THREE YEARS ONCE LOOK LAST THINK FOUND POWER TOO BOTH SMALL GIVE SIDE FORM LET MAKE DURING QUITE TELL TOLD YET ALREADY MOMENT LOVE LARGE GET END WORDS FEW DAYS AMONG OFTEN GAVE BATTLE HISTORY CASE LAW POSITION DONE COUNTRY FREE SOON UNDERSTAND EACH KNOWN OTHERS BECOME FAR ORDER BEHIND WOMEN COURSE RESULT NIGHT WORK CAUSE WORLD QUESTION MIND POSSIBLE BODY MORNING LATER DEATH PRESENT MONEY OPEN UNTIL WANT ACT THINGS USE HALF SOUTH BUSINESS MOTHER THING NUMBER LEAVE ABOVE PARTY HOME FIND NEAR ENEMY FACT HIGH LETTER FOUR PUBLIC RED COMMON TALK EXAMPLE IMPORTANT FRIEND GOT NOR SECOND FIVE LAND SURFACE LIGHT NEXT USED DIFFERENT EVER FIRE AROUND EARLY BEST FULL BETTER NAME POLITICAL ROAD SINCE COLD HEART MEANS ASK KEPT LINE FORCE KING SHORT BLACK CLEAR HELP READY FORWARD HUNDRED RESULTS").split(" "));
const printedPages = transcript.split("%");
const pageArrays = [];
for (let p = 0; p < 56; p++) {
  const printed = p === 50 ? "" : printedPages[p < 50 ? p : p - 1];
  const symbols = [];
  for (const ch of printed) {
    if (runeIndex.has(ch)) symbols.push(runeIndex.get(ch));
    else if (ch === "-") symbols.push(29);
    else if ("/.&$§\\n\\r".includes(ch)) symbols.push(-1);
  }
  pageArrays.push(symbols);
}
const train = pageArrays.slice(0, 28).flat();
const test = pageArrays.slice(28).flat();
const inverses = new Uint8Array(29);
for (let x = 1; x < 29; x++) inverses[x] = inverse(x);
function score(symbols, map) {
  let word = "", matches = 0, matchedLetters = 0, totalLetters = 0, wordCount = 0;
  function finish() {
    if (!word) return;
    wordCount++;
    totalLetters += word.length;
    if (word.length >= 2 && commonWords.has(word)) {
      matches++;
      matchedLetters += word.length;
    }
    word = "";
  }
  for (const symbol of symbols) {
    if (symbol < 0) { finish(); continue; }
    const value = map[symbol];
    if (value === 29) finish();
    else word += corpus.translit[value];
  }
  finish();
  return { matches, matchedLetters, totalLetters, wordCount,
    coverage: totalLetters ? matchedLetters / totalLetters : 0,
    score: matches + 0.1 * matchedLetters };
}
let transformCount = 0;
let bestAffine = null, bestNonAffine = null;
for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++)
for (let c = 0; c < 29; c++) for (let d = 0; d < 29; d++) {
  if (mod(a * d - b * c) === 0) continue;
  const first = [a, b, c, d].find(x => x !== 0);
  if (first !== 1) continue;
  const map = new Uint8Array(30);
  for (let x = 0; x < 29; x++) {
    const denominator = mod(c * x + d);
    map[x] = denominator === 0 ? 29 : mod((a * x + b) * inverses[denominator]);
  }
  map[29] = c === 0 ? 29 : mod(a * inverses[c]);
  const candidate = { matrix: [a, b, c, d], train: score(train, map), test: score(test, map) };
  transformCount++;
  if (c === 0) {
    if (!bestAffine || candidate.train.score > bestAffine.train.score) bestAffine = candidate;
  } else if (!bestNonAffine || candidate.train.score > bestNonAffine.train.score) {
    bestNonAffine = candidate;
  }
}
assert.equal(transformCount, 24360);
const p57ControlMatches = p57Words.filter(w => w.word.length >= 2 && commonWords.has(w.word)).length;

console.log(JSON.stringify({
  sourceCue: "LP1 Some Wisdom MOBIUS/TOTIENT/PRIMES + LP2 p15 infinity + 29-symbol GP29",
  mobiusStrip: {
    p57RowMajorEdges: rowMajorEdges.p57,
    p56RowMajorEdges: rowMajorEdges.p56,
    p0RowMajorEdges: rowMajorEdges.p0,
    p57CycleLinearEdges: cycleLinearEdges.p57,
    p56CycleLinearEdges: cycleLinearEdges.p56,
    p0CycleLinearEdges: cycleLinearEdges.p0,
    address67Collisions: address67,
    oneHitUniformBaseline: { expected: 19 / 256, probabilityAtLeastOne: 1 - Math.pow(255 / 256, 19) }
  },
  p15PrimeMatrices: matrices,
  p50InverseTransformBlocks: p50Blocks,
  globalPGL229: {
    transformCount,
    trainSymbols: train.length,
    testSymbols: test.length,
    bestAffine,
    bestNonAffine,
    positiveControl: { p57Words: p57Words.length, commonWordMatches: p57ControlMatches }
  },
  status: "PASS",
  interpretation: "The cross-page cue motivates PGL(2,29), but tested direct/global interpretations do not recover plaintext or select a unique receiver."
}, null, 2));
