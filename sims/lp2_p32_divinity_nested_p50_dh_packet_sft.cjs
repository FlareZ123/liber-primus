"use strict";

/**
 * P32 FIND DIVINITY WITHIN -> nested DIVINITY -> p50/base29 DH packet.
 *
 * Source route:
 *   signed EPIPHANY SEEKS THE DEVOTED -> 23-step base60 path -> p32
 *   EMPTY@step7 -> p32 HOMEXWDSLFD
 *   B=19 maps WDSL prime remainders to LIKE/FIND/DIVINITY/WITHIN.
 *
 * New test:
 *   repeatedly shed DIVINITY's circumference, address p50 by each layer GP0,
 *   decode each printed token in native base60, then divide by 29.
 *   The five outputs reconstruct the existing p28 DH state and separately
 *   select the authenticated WILL target plus its p0 receiver. The already
 *   frozen WILL and FOUND inverses are then replayed exactly.
 *
 * A fresh terminal consequence is also frozen: the empty layer points to p0
 * offset203, an eight-rune word. Direct/H/H^-1 serializations of the four
 * nonempty packet pairs, both signs, do not decrypt it to DIVINITY.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let out = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * x) % modulus;
    x = (x * x) % modulus;
    e >>= 1;
  }
  return out;
}

/** @param {number} value @param {number} modulus @returns {number} */
function inverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error("no modular inverse");
}

/** @param {number} base @param {number} target @param {number} modulus @returns {number} */
function discreteLog(base, target, modulus) {
  let value = 1;
  for (let exponent = 0; exponent < modulus; exponent += 1) {
    if (value === target) return exponent;
    value = value * base % modulus;
  }
  throw new Error("discrete log not found");
}

/** @param {number} left @param {number} right @returns {number[]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number} difference @param {number} sum @returns {number[]} */
function Hinv(difference, sum) {
  const inv2 = 15;
  return [
    mod29((difference + sum) * inv2),
    mod29((sum - difference) * inv2),
  ];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
assert.equal(tokens.length, 256);
assert.equal(alphabet60.length, 60);

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gpEnglish(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {string} token @returns {number} */
function base60(token) {
  const high = alphabet60.indexOf(token[0]);
  const low = alphabet60.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 60 + low;
}

/** @param {string} token @returns {number} */
function low60(token) {
  const low = alphabet60.indexOf(token[1]);
  assert.ok(low >= 0);
  return low;
}

/** @param {number} value @returns {number[]} */
function base29Pair(value) {
  return [Math.floor(value / 29), value % 29];
}

/**
 * Parse page-local rune fragments. Slash/newline are line wraps; punctuation
 * terminates a fragment.
 * @param {string} page
 * @returns {Array<{start:number,len:number,values:number[],text:string}>}
 */
function pageFragments(page) {
  const fragments = [];
  let values = [];
  let start = 0;
  let count = 0;

  function flush() {
    if (!values.length) return;
    fragments.push({
      start,
      len: values.length,
      values: values.slice(),
      text: values.map((value) => corpus.translit[value]).join(""),
    });
    values = [];
  }

  for (const char of [...page]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!values.length) start = count;
      values.push(value);
      count += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
  return fragments;
}

/**
 * Parse ordinary complete words on one physical page.
 * @param {string} page
 * @returns {Array<{index:number,start:number,end:number,values:number[]}>}
 */
function pageWords(page) {
  const words = [];
  let values = [];
  let start = 0;
  let count = 0;

  function flush() {
    if (!values.length) return;
    words.push({
      index: words.length,
      start,
      end: start + values.length - 1,
      values: values.slice(),
    });
    values = [];
  }

  for (const char of [...page]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!values.length) start = count;
      values.push(value);
      count += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

const parts = transcription.split(/^\s*%\s*$/m);

// Reconstruct the independently frozen p=23 base60 route.
const seeks = sum(gpEnglish("SEEKS"));
const route = [seeks];
for (let step = 0; step < 23; step += 1) {
  route.push(base60(tokens[route.at(-1)]));
}
assert.deepEqual(route, [
  71,108,14,183,81,58,146,92,236,238,129,179,
  175,18,15,212,70,169,228,144,125,20,102,32,
]);
assert.equal(route[7], sum(gpEnglish("EMPTY")));
assert.equal(route[21], sum(gpEnglish("THE")));
assert.equal(route[22], sum(gpEnglish("DEVOTED")));
assert.equal(route[23], 32);

const p32Fragments = pageFragments(parts[32]);
const selected = p32Fragments[7];
assert.deepEqual(
  { start: selected.start, len: selected.len, text: selected.text },
  { start: 33, len: 11, text: "HOMEXWDSLFD" }
);

// The source-selected p57 body has B=19 words.
const parable = [
  "LIKE","THE","INSTAR","TUNNELING","TO","THE","SURFACE",
  "WE","MUST","SHED","OUR","OWN","CIRCUMFERENCES","FIND",
  "THE","DIVINITY","WITHIN","AND","EMERGE",
];
assert.equal(parable.length, 19);

const payload = selected.values.slice(5, 9); // W D S L
assert.equal(payload.map((value) => corpus.translit[value]).join(""), "WDSL");
const payloadPrimePairs = payload.map((value) => {
  const prime = corpus.prime[value];
  return [Math.floor(prime / 19), prime % 19];
});
assert.deepEqual(payloadPrimePairs, [[1,0],[4,13],[2,15],[3,16]]);
assert.deepEqual(
  payloadPrimePairs.map((pair) => parable[pair[1]]),
  ["LIKE","FIND","DIVINITY","WITHIN"]
);

// Repeatedly shed DIVINITY's first/last GP runes.
const divinity = gpEnglish("DIVINITY");
assert.deepEqual(divinity, [23,10,1,10,9,10,16,26]);

const layers = [];
for (let depth = 0; depth <= divinity.length / 2; depth += 1) {
  const values = divinity.slice(depth, divinity.length - depth);
  const address = sum(values);
  assert.ok(address >= 0 && address < tokens.length);
  const token = tokens[address];
  const value60 = base60(token);
  layers.push({
    depth,
    values,
    length: values.length,
    address,
    token,
    value60,
    pair29: base29Pair(value60),
  });
}

assert.deepEqual(layers.map((row) => row.length), [8,6,4,2,0]);
assert.deepEqual(layers.map((row) => row.address), [105,56,30,19,0]);
assert.deepEqual(layers.map((row) => row.token), ["13","4E","2L","0X","3N"]);
assert.deepEqual(layers.map((row) => row.value60), [63,254,141,33,203]);
assert.deepEqual(layers.map((row) => row.pair29), [
  [2,5],[8,22],[4,25],[1,4],[7,0],
]);

// Reconstruct the DH state from the first three packet pairs plus the
// independently typed W marker in the p32 payload.
const K = layers[0].pair29[0];
const g = layers[0].pair29[1];
const A = layers[1].pair29[0];
const p = layers[1].pair29[1] + 1;
const q = layers[2].pair29[0];
assert.equal(layers[2].pair29[1], p + K);

const B = corpus.prime[payload[0]];
assert.equal(B, 19);
const a = discreteLog(g, A, p);
const b = discreteLog(g, B, p);
const e = inverse(b, p - 1);
assert.deepEqual({ p,g,a,b,A,B,K,e,q }, {
  p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4,
});
assert.equal(modPow(B, a, p), K);
assert.equal(modPow(A, b, p), K);

assert.deepEqual(payloadPrimePairs.map((pair) => pair[0]), [1,q,K,e]);
assert.deepEqual(layers.map((row) => row.length), [A,a,q,K,0]);
assert.deepEqual(layers.map((row) => row.pair29), [
  [K,g],
  [A,p-1],
  [q,p+K],
  [1,q],
  [g+K,0],
]);

// The outermost token literally matches p32's source-recorded 13-dot mark.
const p32Ink = ink.pages.find((page) => page.page === 32);
assert.ok(p32Ink);
assert.deepEqual(p32Ink.large_punctuation, [[121,13,"red"]]);
assert.equal(layers[0].token, "13");

// Full p57-word census for the exact first-three nested packet.
const p57Words = ["PARABLE", ...parable];
const packetPrefix = layers.slice(0, 3).map((row) => row.pair29);
const prefixMatches = [];
for (const word of p57Words) {
  const values = gpEnglish(word);
  if (values.length < 4) continue;
  const candidate = [];
  let valid = true;
  for (let depth = 0; depth < 3; depth += 1) {
    const interior = values.slice(depth, values.length - depth);
    const address = sum(interior);
    if (address < 0 || address >= tokens.length) {
      valid = false;
      break;
    }
    candidate.push(base29Pair(base60(tokens[address])));
  }
  if (valid && JSON.stringify(candidate) === JSON.stringify(packetPrefix)) {
    prefixMatches.push(word);
  }
}
assert.deepEqual(prefixMatches, ["DIVINITY"]);

// Parse authenticated signed words.
const signedBody = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");

const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((word, index) => {
  const values = gpEnglish(word);
  return { index, word: word.toUpperCase(), values, gp0: sum(values) };
});
assert.equal(signedWords.length, 43);

// The IN layer selects the WILL target by signed index; the next outer UINI
// layer selects its p0 receiver by full base60 offset.
assert.equal(layers[3].token, "0X");
assert.equal(low60(layers[3].token), 33);
const will = signedWords[low60(layers[3].token)];
assert.equal(will.word, "WILL");
assert.equal(will.gp0, 57);

assert.equal(layers[2].token, "2L");
assert.equal(base60(layers[2].token), 141);
assert.equal((will.word.match(/L/g) || []).length, 2);

const p0Words = pageWords(parts[0]);
const willReceiver = p0Words.find((word) => word.start === 141);
assert.ok(willReceiver);
assert.deepEqual(willReceiver.values, [19,16,9,18]);

const willKey = [K*a, a, ...H(A,B)];
assert.deepEqual(willKey, [12,6,18,27]);
const willPlain = willReceiver.values.map((value, index) =>
  mod29(value - willKey[index])
);
assert.deepEqual(willPlain, will.values);
assert.deepEqual(willPlain, [7,10,20,20]);
assert.deepEqual(
  willPlain.map((value, index) => mod29(value + willKey[index])),
  willReceiver.values
);

// Continue with the already frozen K-hop WILL -> BE -> FOUND navigation and
// FOUND key grammar, unchanged.
let walkState = will.gp0;
const walkStates = [walkState];
for (let step = 0; step < K; step += 1) {
  walkState = base60(tokens[walkState]);
  walkStates.push(walkState);
}
assert.deepEqual(walkStates, [57,118,35]);
const be = signedWords[will.index + 1];
const found = signedWords[will.index + 2];
assert.equal(be.word, "BE");
assert.equal(be.gp0, 35);
assert.equal(found.word, "FOUND");

const foundReceiver = p0Words.find((word) =>
  word.start <= 118 && word.end >= 118
);
assert.ok(foundReceiver);
assert.deepEqual(
  { start: foundReceiver.start, end: foundReceiver.end, values: foundReceiver.values },
  { start:117, end:121, values:[12,2,11,10,2] }
);

const foundKey = [
  K*a,
  mod29(g-a),
  mod29(K*g),
  mod29(a-g),
  A,
];
assert.deepEqual(foundKey, [12,28,10,1,8]);
const foundPlain = foundReceiver.values.map((value, index) =>
  mod29(value - foundKey[index])
);
assert.deepEqual(foundPlain, found.values);
assert.deepEqual(foundPlain, [0,3,1,9,23]);
assert.deepEqual(
  foundPlain.map((value, index) => mod29(value + foundKey[index])),
  foundReceiver.values
);

// Fresh terminal consequence. The empty layer points to p0 offset203, and that
// position is exactly an eight-rune word boundary, matching DIVINITY's length.
assert.equal(layers[4].value60, 203);
const terminalReceiver = p0Words.find((word) => word.start === 203);
assert.ok(terminalReceiver);
assert.equal(terminalReceiver.values.length, divinity.length);

// Freeze the lowest-description key family from the four nonempty packet
// base29 pairs: direct, H, H^-1; both additive directions. None yields DIVINITY.
const nonemptyPairs = layers.slice(0, 4).map((row) => row.pair29);
const packetKeys = {
  direct: nonemptyPairs.flat(),
  H: nonemptyPairs.flatMap(([left,right]) => H(left,right)),
  Hinv: nonemptyPairs.flatMap(([left,right]) => Hinv(left,right)),
};
const terminalTests = [];
for (const [name, key] of Object.entries(packetKeys)) {
  for (const sign of [-1, 1]) {
    const plain = terminalReceiver.values.map((value, index) =>
      mod29(value + sign * key[index])
    );
    terminalTests.push({
      name,
      sign,
      key,
      plain,
      target: JSON.stringify(plain) === JSON.stringify(divinity),
    });
  }
}
assert.equal(terminalTests.length, 6);
assert.equal(terminalTests.filter((row) => row.target).length, 0);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "source-connected nested DIVINITY/p50 DH packet; exact WILL and FOUND replay; terminal p0:203 direct packet consumer negative",
  p32: {
    route,
    selected: { start:selected.start, len:selected.len, text:selected.text },
    payload: "WDSL",
    payloadPrimePairs,
    payloadWords: payloadPrimePairs.map((pair) => parable[pair[1]]),
    payloadQuotients: payloadPrimePairs.map((pair) => pair[0]),
    marker: p32Ink.large_punctuation,
  },
  nestedDivinity: {
    layers: layers.map((row) => ({
      depth:row.depth,
      length:row.length,
      address:row.address,
      token:row.token,
      value60:row.value60,
      pair29:row.pair29,
    })),
    prefixMatches,
  },
  reconstructedState: { p,g,a,b,A,B,K,e,q },
  will: {
    targetIndex: will.index,
    targetGp0: will.gp0,
    targetToken: layers[3].token,
    receiverToken: layers[2].token,
    receiverStart: willReceiver.start,
    key: willKey,
    plaintext: willPlain,
  },
  found: {
    walkStates,
    receiverStart: foundReceiver.start,
    receiverEnd: foundReceiver.end,
    key: foundKey,
    plaintext: foundPlain,
  },
  terminalHoldout: {
    pointerToken: layers[4].token,
    receiverStart: terminalReceiver.start,
    receiverLength: terminalReceiver.values.length,
    target: divinity,
    tests: terminalTests,
    hits: 0,
  },
}, null, 2));
