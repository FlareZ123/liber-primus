"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function shell(values) {
  const output = [];
  for (let left = 0, right = values.length - 1;
    left < right; left += 1, right -= 1) {
    output.push(
      mod29(values[left] - values[right]),
      mod29(values[left] + values[right]),
    );
  }
  if (values.length % 2 === 1) {
    output.push(values[(values.length - 1) / 2]);
  }
  return output;
}

/**
 * @param {string} source
 * @param {number} page
 * @returns {{page:number,start:number,end:number,values:number[]}[]}
 */
function parsePage(source, page) {
  const words = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;

  function finish() {
    if (!current.length) return;
    words.push({
      page,
      start,
      end: start + current.length - 1,
      values: current.slice(),
    });
    current = [];
  }

  for (const character of [...source]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((character === "-" || character === ".") && current.length) {
      finish();
    }
  }
  finish();
  return words;
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const output = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      output.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      output.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const sourceWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
});
const stateValues = Object.freeze(Object.values(state));
const stateSet = new Set(stateValues);
assert.equal(stateSet.size, 9);

const pages = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const sevenRuneWords = pages
  .flatMap((source, page) => parsePage(source, page))
  .filter((word) => word.values.length === 7);

assert.equal(sevenRuneWords.length, 214);

const selected = sevenRuneWords.find((word) =>
  word.page === 0 && word.start === 237 && word.end === 243
);
assert.ok(selected);
assert.deepEqual(selected.values, [15,22,16,22,21,1,4]);

const selectedShell = shell(selected.values);
assert.deepEqual(selectedShell, [11,19,21,23,24,8,22]);
assert.deepEqual(
  selectedShell,
  [
    mod29(state.B - state.A),
    state.B,
    mod29(state.p - state.K),
    state.p,
    mod29(-state.g),
    state.A,
    mod29(state.p - 1),
  ],
);

const familyHits = [];
for (const word of sevenRuneWords) {
  const h = shell(word.values);
  const x = h[1];
  const y = mod29(x - h[0]);
  const u = h[3];
  const v = mod29(u - h[2]);
  const w = mod29(-h[4]);
  const t = h[5];

  if (
    stateSet.has(x) &&
    stateSet.has(y) &&
    stateSet.has(u) &&
    stateSet.has(v) &&
    stateSet.has(w) &&
    stateSet.has(t) &&
    h[6] === mod29(u - 1)
  ) {
    familyHits.push({
      page: word.page,
      start: word.start,
      end: word.end,
      h,
      roles: { x, y, u, v, w, t },
    });
  }
}

assert.equal(9 ** 6, 531441);
assert.deepEqual(familyHits, [{
  page: 0,
  start: 237,
  end: 243,
  h: [11,19,21,23,24,8,22],
  roles: {
    x: state.B,
    y: state.A,
    u: state.p,
    v: state.K,
    w: state.g,
    t: state.A,
  },
}]);

assert.equal(sourceWords[state.B], "THEIR");
assert.equal(sourceWords[state.p], "ROAD");
assert.equal(sourceWords[state.A], "DEVOTED");

const devotedGp = gp("DEVOTED");
assert.deepEqual(devotedGp, [23,18,1,3,16,18,23]);

const devotedNumberReadout = devotedGp.map((index) => sourceWords[index]);
assert.deepEqual(
  devotedNumberReadout,
  ["ROAD","MAP","THE","LIES","ARE","MAP","ROAD"],
);

const devotedOneBasedControl = devotedGp.map((value) => {
  const index = value - 1;
  return index >= 0 ? sourceWords[index] : null;
});
assert.deepEqual(
  devotedOneBasedControl,
  ["THE","THE","HELLO","PATH","WORDS","THE","THE"],
);

const devotedPlainShell = shell(devotedGp);
assert.deepEqual(devotedPlainShell, [0,17,0,7,14,17,3]);
assert.deepEqual(
  devotedPlainShell,
  [
    0,
    mod29(state.B - state.K),
    0,
    mod29(state.g + state.K),
    mod29(-state.b),
    mod29(state.B - state.K),
    state.e,
  ],
);

const additiveKey = selected.values.map((value, index) =>
  mod29(value - devotedGp[index])
);
assert.deepEqual(additiveKey, [21,4,15,19,5,12,10]);
assert.deepEqual(
  shell(additiveKey),
  [
    mod29(state.B - state.A),
    state.K,
    mod29(state.p - state.K),
    mod29(state.B - state.e),
    mod29(state.A + state.K),
    mod29(state.p - state.e),
    state.B,
  ],
);

console.log(JSON.stringify({
  status: "PASS",
  selectedReceiver: {
    cipher: selected.values,
    h: selectedShell,
    typedH: ["B-A","B","p-K","p","-g","A","p-1"],
  },
  chargedTemplate: {
    assignments: 9 ** 6,
    sevenRuneWords: sevenRuneWords.length,
    hits: familyHits,
  },
  sourceStateReadout: {
    zeroBased: devotedNumberReadout,
    oneBasedControl: devotedOneBasedControl,
  },
  candidatePlaintextConsequence: {
    devotedGp,
    h: devotedPlainShell,
    typedH: ["0","B-K","0","g+K","-b","B-K","e"],
    additiveKey,
    keyH: ["B-A","K","p-K","B-e","A+K","p-e","B"],
  },
}, null, 2));
