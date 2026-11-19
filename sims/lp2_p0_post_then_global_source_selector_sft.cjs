"use strict";

/**
 * SFT: through-THEN checksum selector for the LP2 p0-p2 27x27 route.
 *
 * Conditional upstream premise:
 *   the source-connected original key nodes for stages 14-17 are bounded by
 *   J-D-J, OE-J-OE, J-B-J, H-R-H, J-B-J after the recorded DEATH endpoint.
 *
 * Within that premise this test does NOT supply plaintext or per-block
 * ciphertext lengths. It allows both direct and center-totient key variants,
 * every in-bounds straight contiguous ciphertext segment compatible with the
 * locked total of 13 runes, and the published Reports 01-19 transition gates.
 *
 * The locked numerical residual after THE IDEA is:
 *   12 runes, rune-index sum 151, GP sum 553.
 *
 * Expected result: exactly one continuation survives, and it is the recorded
 * OF | THE | END | IS | DEATH geometry with center-totient keys.
 *
 * External transition-rule source revision:
 * d89cf1b16f849f6d59ca311553436e13075a71fb
 *
 * Run:
 *   node sims/lp2_p0_second_passage_checksum_selector_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = corpus.pages.filter(page => page.page <= 2)
  .flatMap(page => page.indices);
assert.equal(grid.length, 729);

const GP = corpus.prime;
const translit = corpus.translit;
const TARGET = Object.freeze({runes: 13, indexSum: 140, gpSum: 497});

/** @param {number} x */
const mod29 = x => (x % 29 + 29) % 29;
/** @param {number} x */
const mod3 = x => (x % 3 + 3) % 3;
/** @param {number} x */
const mod2 = x => (x % 2 + 2) % 2;

/** @param {number} n */
function phi(n) {
  let result = n;
  let rest = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    while (rest % p === 0) rest /= p;
    result -= result / p;
  }
  if (rest > 1) result -= result / rest;
  return result;
}

/** @param {number} n */
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let rest = n;
  let sign = 1;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p !== 0) continue;
    rest /= p;
    sign = -sign;
    if (rest % p === 0) return 0;
  }
  return rest > 1 ? -sign : sign;
}

/** @param {number} a @param {number} b */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {[number, number]} cell */
function at(cell) {
  const [r, c] = cell;
  return grid[(r - 1) * 27 + c - 1];
}

/** @param {[number, number]} cell */
const n0 = ([r, c]) => 27 * (r - 1) + c;
/** @param {[number, number]} cell */
const n1 = ([r, c]) => 27 * (c - 1) + 28 - r;
/** @param {[number, number]} cell */
const n2 = cell => 730 - n0(cell);
/** @param {[number, number]} cell */
const n3 = cell => 730 - n1(cell);

/** @param {Array<[number, number]>} cells */
function leftmost(cells) {
  return cells.reduce((best, cell) =>
    cell[1] < best[1] || (cell[1] === best[1] && cell[0] > best[0])
      ? cell : best);
}

/** @param {Array<[number, number]>} node */
function sortedNode(node) {
  return node.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

/** @param {Array<[number, number]>} node */
function keyAxis(node) {
  const dr = node[2][0] - node[0][0];
  const dc = node[2][1] - node[0][1];
  if (dr === 0) return 0;
  if (dc === 0) return 2;
  return dr * dc > 0 ? 1 : 3;
}

/** @param {Array<[number, number]>} node */
function radius(node) {
  return Math.max(
    Math.abs(node[0][0] - node[1][0]),
    Math.abs(node[0][1] - node[1][1]));
}

/** @param {number[]} unrotatedKey */
function keyPhase(unrotatedKey) {
  return mod3(unrotatedKey
    .map(value => mu(phi(value)))
    .reduce((a, b) => a + b, 0));
}

/**
 * Enumerate direct and center-totient variants, deduplicated by aligned key.
 * @param {Array<[number, number]>} node
 */
function keyVariants(node) {
  const raw = node.map(at);
  const out = [];
  for (const transformCenter of [false, true]) {
    const unrotated = [
      raw[0],
      transformCenter ? phi(raw[1]) : raw[1],
      raw[2],
    ];
    const phase = keyPhase(unrotated);
    const key = unrotated.slice(phase).concat(unrotated.slice(0, phase));
    const signature = unrotated.map(value => mu(phi(value)));
    const id = key.join(",");
    if (!out.some(row => row.id === id)) {
      out.push({id, transformCenter, unrotated, phase, key, signature});
    }
  }
  return out;
}

/** @param {number} S */
function cyclicMode(S) {
  const q = Math.floor(S / 7) % 4;
  return {
    reflected: q === 1 || q === 2,
    offset: q === 0 || q === 2 ? 1 : 0,
  };
}

/** @param {Array<[number, number]>} cipher @param {number} S */
function expectedPhase(cipher, S) {
  const mode = cyclicMode(S);
  const sum = cipher.reduce(
    (acc, cell) => acc + mu(mode.reflected ? n2(cell) : n0(cell)), 0);
  return mod3(mode.offset + sum);
}

/** @param {object} current @param {number} a */
function nextOuter(current, a) {
  return mod2(a + mu(n1(leftmost(current.cipher))));
}

/** @param {number} phase @param {number} outer */
function predictedSignature(phase, outer) {
  if (phase === 0) return outer ? [1, 1, 1] : [0, 0, 0];
  if (phase === 1) return outer ? [1, -1, 1] : [0, 1, 0];
  return outer ? [1, 0, 1] : [0, -1, 0];
}

/** @param {object} current */
function expectedAxisBoundary(current) {
  const B = current.cipher[0];
  const E = current.cipher.at(-1);
  const M = current.node[1];
  const score = mu(n2(B) + n0(M)) + mu(gcd(n1(E), n2(E)));
  return {
    axis: score === 0 ? "horizontal" : score > 0 ? "vertical" : "diagonal",
    tau: mod2(mu(n3(E)) + phi(current.raw[1])),
  };
}

/** @param {Array<[number, number]>} cipher */
function observedAxisBoundary(cipher) {
  const B = cipher[0];
  const E = cipher.at(-1);
  const dr = E[0] - B[0];
  const dc = E[1] - B[1];
  return {
    axis: dr === 0 ? "horizontal" : dc === 0 ? "vertical" : "diagonal",
    tau: Number(B[0] === leftmost(cipher)[0] && B[1] === leftmost(cipher)[1]),
  };
}

/** @param {object} current */
function expectedRows(current) {
  const B = current.cipher[0];
  const E = current.cipher.at(-1);
  const M = current.node[1];
  const b = mod2(1 + B[1] + E[0] + M[0] + mu(n2(B)));
  return {
    endpoint: mod2(1 + current.phase + mu(n2(M))),
    leftmost: mod2(b + 1 + current.phase + mu(M[0])),
  };
}

/** @param {Array<[number, number]>} cipher */
function observedRows(cipher) {
  return {
    endpoint: mod2(cipher.at(-1)[0]),
    leftmost: mod2(leftmost(cipher)[0]),
  };
}

/** @param {[number, number]} L @param {[number, number]} B */
function rayOffset(L, B) {
  const dr = Math.abs(B[0] - L[0]);
  const dc = Math.abs(B[1] - L[1]);
  return Math.min(dr, dc, Math.abs(dr - dc));
}

/** @param {object} current */
function expectedRay(current) {
  const B = current.cipher[0];
  const E = current.cipher.at(-1);
  return Number(
    mu(n0(E)) === 0 &&
    mu(n3(E)) === 0 &&
    !(mu(n0(B)) === 0 && mu(n1(B)) === 0));
}

/** @param {object} current */
function expectedMirror(current) {
  const Z = sortedNode(current.node).at(-1);
  const L = leftmost(current.cipher);
  const d = Math.max(Math.abs(Z[0] - L[0]), Math.abs(Z[1] - L[1]));
  return Number(d % 3 !== 2);
}

/** @param {object} current */
function expectedColumnParity(current) {
  const B = current.cipher[0];
  const M = current.node[1];
  const mirror = Number(current.raw[0] === current.raw[2]);
  const sum = current.cipher.reduce((acc, cell) => acc + mu(n1(cell)), 0);
  const centerIndex =
    current.phase === 0 ? n2(M) : current.phase === 1 ? n3(M) : n0(M);
  return mod2(B[0] + sum + mirror + mu(centerIndex));
}

/** @param {[number, number]} center @param {Array<[number, number]>} cipher */
function squarefreeGcdOk(center, cipher) {
  const B = cipher[0];
  const E = cipher.at(-1);
  const L = leftmost(cipher);
  return [
    gcd(n0(center), n0(B)),
    gcd(n0(center), n0(L)),
    gcd(n1(center), n3(E)),
    gcd(n0(center), n2(E)),
  ].every(value => mu(value) !== 0);
}

/** @param {object} current */
function expectedKeyAxis(current) {
  const M = current.node[1];
  const Z = sortedNode(current.node).at(-1);
  const L = leftmost(current.cipher);
  const group = Number(
    (mu(n1(M) + n2(Z)) < 0) === (mu(n1(L) + n2(Z)) < 0));
  const diagonal =
    Number(mu(gcd(n1(M), n3(Z))) < 0) ^
    Number(mu(current.raw.reduce((sum, value) => sum + GP[value], 0)) > 0) ^
    Number(mu(n0(M) + n3(Z)) !== 0);
  return 2 * group + diagonal;
}

/** @param {object} current */
function expectedRadiusParity(current) {
  const M = current.node[1];
  const Z = sortedNode(current.node).at(-1);
  const B = current.cipher[0];
  const E = current.cipher.at(-1);
  const L = leftmost(current.cipher);
  return (
    mod2(M[0] + M[1] + B[0] + B[1]) ^
    Number(mu(gcd(n2(Z), n2(L))) < 0) ^
    Number(mu(n1(B) + n1(E)) > 0)
  );
}

/** @param {object} current @param {[number, number]} nextCenter */
function acceptsReport17(current, nextCenter) {
  const value = n3(current.node[1]) ^ nextCenter[1];
  return value === 0 || mu(value) <= 0;
}

/** @param {object} current */
function predictReport18(current) {
  const [U, M, Z] = sortedNode(current.node);
  const B = current.cipher[0];
  const E = current.cipher.at(-1);
  const L = leftmost(current.cipher);
  return [
    Number(
      Boolean(mu(gcd(n2(M), n3(L))) < 0) ^
      Boolean(mu(n3(Z) + n2(B)) > 0) ^
      Boolean(mu(gcd(n3(M), n2(L))) < 0)),
    Number(
      Boolean(mu(gcd(n2(M), n0(L))) === 0) ^
      Boolean(mu(gcd(n1(M), n1(B))) === 0) ^
      Boolean(mu(gcd(n2(M), n0(E))) === 0)),
    Number(
      Boolean(mu(gcd(n1(U), n0(E))) === 0) ^
      Boolean(mu(gcd(n0(U), n2(B))) < 0) ^
      Boolean(Math.floor(n3(E) / 4) % 2 === 1)),
  ];
}

/**
 * @param {object} current
 * @param {Array<[number, number]>} cipher
 */
function observeReport18(current, cipher) {
  const U = sortedNode(current.node)[0];
  const B = cipher[0];
  const E = cipher.at(-1);
  return [
    Number(Math.abs(E[0] - U[0]) >= Math.abs(E[1] - U[1])),
    Number(mu(n0(E)) < 0),
    Number(B[1] > current.cipher[0][1]),
  ];
}

/** @param {[number, number]} a @param {[number, number]} b */
function gridDistance(a, b) {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
}

/**
 * @param {object} current
 * @param {[number, number]} previousBeginning
 * @param {[number, number]} nextBeginning
 */
function acceptsReport19(current, previousBeginning, nextBeginning) {
  const nearRequired =
    ((n2(current.cipher[0]) ^ n2(previousBeginning)) % 7 === 0) ===
    (mu(n0(sortedNode(current.node)[0]) + n0(current.cipher.at(-1))) < 0);
  return (
    (gridDistance(nextBeginning, current.cipher[0]) <= 7) === nearRequired &&
    (gridDistance(nextBeginning, leftmost(current.cipher)) <= 7) === nearRequired
  );
}

/**
 * Apply Reports 01-19 used by the external route.
 * @param {object} current
 * @param {[number, number]} previousBeginning
 * @param {number} S
 * @param {number} a
 * @param {Array<[number, number]>} nextNode
 * @param {object} operation
 * @param {Array<[number, number]>} cipher
 */
function transition(current, previousBeginning, S, a, nextNode, operation, cipher) {
  const phase = expectedPhase(current.cipher, S);
  const outer = nextOuter(current, a);
  if (
    operation.phase !== phase ||
    (operation.phase === 2 && S % 7 === 6) ||
    operation.signature.join(",") !== predictedSignature(phase, outer).join(",")
  ) return null;

  const center = nextNode[1];
  const centerParity = {
    row: mod2(
      1 + current.cipher[0][1] + current.cipher.at(-1)[0] +
      current.node[1][0] + mu(n2(current.cipher[0]))),
    column: mod2(
      1 + current.cipher[0][0] + current.cipher.at(-1)[0] +
      current.node[1][0]),
  };
  if (
    mod2(center[0]) !== centerParity.row ||
    mod2(center[1]) !== centerParity.column
  ) return null;

  if (
    JSON.stringify(expectedAxisBoundary(current)) !==
    JSON.stringify(observedAxisBoundary(cipher))
  ) return null;
  if (
    JSON.stringify(expectedRows(current)) !==
    JSON.stringify(observedRows(cipher))
  ) return null;
  if (rayOffset(leftmost(current.cipher), cipher[0]) !== expectedRay(current)) {
    return null;
  }

  const nextRaw = nextNode.map(at);
  if (Number(nextRaw[0] === nextRaw[2]) !== expectedMirror(current)) return null;
  if (mod2(leftmost(cipher)[1]) !== expectedColumnParity(current)) return null;
  if (!squarefreeGcdOk(center, cipher)) return null;
  if (keyAxis(nextNode) !== expectedKeyAxis(current)) return null;
  if (mod2(radius(nextNode)) !== expectedRadiusParity(current)) return null;
  if (!acceptsReport17(current, center)) return null;
  if (
    predictReport18(current).join(",") !==
    observeReport18(current, cipher).join(",")
  ) return null;
  if (!acceptsReport19(current, previousBeginning, cipher[0])) return null;

  const mode = cyclicMode(S);
  const allowed = mode.reflected ? [0, -1] : [0, 1];
  if (!allowed.includes(mu(n1(leftmost(cipher))))) return null;

  return {S: S + operation.phase, a: outer};
}

/** @param {number} maxLength */
function allStraightSegments(maxLength) {
  const out = [];
  for (let length = 2; length <= maxLength; length++) {
    for (let row = 1; row <= 27; row++) {
      for (let column = 1; column <= 27; column++) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const endRow = row + dr * (length - 1);
            const endColumn = column + dc * (length - 1);
            if (
              endRow < 1 || endRow > 27 ||
              endColumn < 1 || endColumn > 27
            ) continue;
            out.push(Array.from({length}, (_, i) =>
              [row + dr * i, column + dc * i]));
          }
        }
      }
    }
  }
  return out;
}

const sourceFamilies = [
  [
    [[25, 2], [25, 6], [25, 10]], // 14: EA-J-EA
  ],
  [
    [[5, 16], [16, 16], [27, 16]], // 15: P-R-P
  ],
  [
    [[25, 4], [25, 7], [25, 10]],  // 16a: L-C-EA
    [[15, 15], [20, 15], [25, 15]], // 16b: L-I-EA
    [[25, 8], [25, 14], [25, 20]], // 16c: L-EO-EA
  ],
  [
    [[25, 22], [26, 22], [27, 22]], // 17: IA-IA-IA
  ],
];

const initialNode = [[19, 16], [23, 12], [27, 8]];
const initial = {
  node: initialNode,
  cipher: [[26, 3], [26, 2], [26, 1]], // DEATH
  raw: initialNode.map(at),
  phase: 2,
};

const segments = allStraightSegments(7);
let paths = [{
  current: initial,
  previousBeginning: [21, 9], // preceding IS start
  S: 14,
  a: 1,
  runes: 0,
  indexSum: 0,
  gpSum: 0,
  steps: [],
}];
const pathCountsAfterEachStage = [];

for (let stage = 0; stage < sourceFamilies.length; stage++) {
  const nextPaths = [];

  for (const candidatePath of paths) {
    const remainingStages = sourceFamilies.length - stage;
    const maxLength =
      TARGET.runes - candidatePath.runes - 2 * (remainingStages - 1);
    if (maxLength < 2) continue;

    for (const nextNode of sourceFamilies[stage]) {
      for (const operation of keyVariants(nextNode)) {
        for (const cipher of segments) {
        if (cipher.length > maxLength) continue;
        const state = transition(
          candidatePath.current,
          candidatePath.previousBeginning,
          candidatePath.S,
          candidatePath.a,
          nextNode,
          operation,
          cipher);
        if (!state) continue;

        const plain = cipher.map((cell, i) =>
          mod29(at(cell) - operation.key[i % 3]));
        const runes = candidatePath.runes + plain.length;
        const indexSum =
          candidatePath.indexSum + plain.reduce((a, b) => a + b, 0);
        const gpSum =
          candidatePath.gpSum + plain.reduce((a, b) => a + GP[b], 0);

        // All contributions are nonnegative, so these target-bound prunes
        // cannot remove a later exact hit.
        if (
          runes > TARGET.runes ||
          indexSum > TARGET.indexSum ||
          gpSum > TARGET.gpSum
        ) continue;

          nextPaths.push({
            current: {
              node: nextNode,
              cipher,
              raw: nextNode.map(at),
              phase: operation.phase,
            },
            previousBeginning: candidatePath.current.cipher[0],
            S: state.S,
            a: state.a,
            runes,
            indexSum,
            gpSum,
            steps: candidatePath.steps.concat({
              nextNode,
              operation,
              cipher,
              plain,
            }),
          });
        }
      }
    }
  }

  paths = nextPaths;
  pathCountsAfterEachStage.push(paths.length);
}

const hits = paths.filter(row =>
  row.runes === TARGET.runes &&
  row.indexSum === TARGET.indexSum &&
  row.gpSum === TARGET.gpSum);

assert.ok(hits.length >= 1);

const expectedCipher = [
  [[25, 16], [26, 15], [27, 14]],
  [[27, 18], [26, 17], [25, 16]],
  [[25, 16], [25, 17], [25, 18], [25, 19]],
  [[25, 25], [25, 26], [25, 27]],
];

const recordedHits = hits.filter(candidate =>
  JSON.stringify(candidate.steps.map(step => step.cipher)) ===
  JSON.stringify(expectedCipher));

assert.ok(recordedHits.length >= 1, "recorded SEE..THEN geometry must survive");
const recorded = recordedHits[0];
assert.deepEqual(
  recorded.steps.map(step => step.plain.map(value => translit[value]).join(" ")),
  ["S E E", "Y O U", "S O O N", "TH E N"]);

console.log(JSON.stringify({
  status: hits.length === 1
    ? "unique checksum hit in fixed stage14-17 source family"
    : "checksum underselects fixed stage14-17 source family",
  target: TARGET,
  pathCountsAfterEachStage,
  hits: hits.length,
  recordedHits: recordedHits.length,
  selected: {
    source: recorded.steps.map(step =>
      step.nextNode.map(at).map(value => translit[value])),
    ciphertext: recorded.steps.map(step => step.cipher),
    plaintextRunes: recorded.steps.map(step =>
      step.plain.map(value => translit[value])),
    keys: recorded.steps.map(step =>
      step.operation.key.map(value => translit[value])),
    centerTotient: recorded.steps.map(step =>
      step.operation.transformCenter),
  },
}, null, 2));


/*
 * Prospective post-THEN selector.
 *
 * Starting state is the unique 13/140/497 route above. Reports 01-06 were
 * developed on the original first 17 blocks, so this second search uses only
 * those six pre-THEN transition rules. It enumerates every Report-00-admissible
 * equal-outer source mirror in the complete 27x27 grid, both direct and
 * center-totient source operations, and every straight two- or three-cell
 * ciphertext segment. Five blocks totaling 11 runes force exactly one
 * three-rune block and four two-rune blocks.
 *
 * Frozen target for blocks 18-22:
 *   11 runes, index sum 122, GP sum 429.
 */

/** @type {{runes:number,indexSum:number,gpSum:number}} */
const POST_THEN_TARGET = Object.freeze({runes: 11, indexSum: 122, gpSum: 429});

const POST_THEN_SOURCE_OPERATIONS = [];
for (let row = 1; row <= 27; row++) {
  for (let column = 1; column <= 27; column++) {
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      for (let radiusValue = 1; radiusValue <= 26; radiusValue++) {
        const first = [row - dr * radiusValue, column - dc * radiusValue];
        const last = [row + dr * radiusValue, column + dc * radiusValue];
        if (
          first[0] < 1 || first[0] > 27 ||
          first[1] < 1 || first[1] > 27 ||
          last[0] < 1 || last[0] > 27 ||
          last[1] < 1 || last[1] > 27
        ) break;
        if (at(first) !== at(last)) continue;

        const node = [first, [row, column], last];
        if (node.some(cell => at(cell) === 0)) continue;
        for (const operation of keyVariants(node)) {
          POST_THEN_SOURCE_OPERATIONS.push({node, operation});
        }
      }
    }
  }
}

/** @param {number} rowParity @param {number} columnParity @param {number} phase @param {string} signatureId */
function sourceIndexKey(rowParity, columnParity, phase, signatureId) {
  return rowParity + "|" + columnParity + "|" + phase + "|" + signatureId;
}

const POST_THEN_SOURCE_INDEX = new Map();
for (const row of POST_THEN_SOURCE_OPERATIONS) {
  const key = sourceIndexKey(
    mod2(row.node[1][0]),
    mod2(row.node[1][1]),
    row.operation.phase,
    row.operation.signature.join(","));
  const bucket = POST_THEN_SOURCE_INDEX.get(key);
  if (bucket) bucket.push(row);
  else POST_THEN_SOURCE_INDEX.set(key, [row]);
}

/** @param {object} current @param {number} S @param {number} a */
function sourceOperationsReport06(current, S, a) {
  const predictedPhase = expectedPhase(current.cipher, S);
  const outer = nextOuter(current, a);
  const signatureId = predictedSignature(predictedPhase, outer).join(",");
  const centerParity = {
    row: mod2(
      1 + current.cipher[0][1] + current.cipher.at(-1)[0] +
      current.node[1][0] + mu(n2(current.cipher[0]))),
    column: mod2(
      1 + current.cipher[0][0] + current.cipher.at(-1)[0] +
      current.node[1][0]),
  };

  const key = sourceIndexKey(
    centerParity.row,
    centerParity.column,
    predictedPhase,
    signatureId);
  return {
    outer,
    predictedPhase,
    rows: POST_THEN_SOURCE_INDEX.get(key) || [],
  };
}

const POST_THEN_SEGMENTS = allStraightSegments(3);

/** @param {object} boundary @param {object} rows @param {number} leftmostClass */
function cipherIndexKey(boundary, rows, leftmostClass) {
  return [
    boundary.axis,
    boundary.tau,
    rows.endpoint,
    rows.leftmost,
    leftmostClass,
  ].join("|");
}

const POST_THEN_CIPHER_INDEX = new Map();
for (const cipher of POST_THEN_SEGMENTS) {
  const key = cipherIndexKey(
    observedAxisBoundary(cipher),
    observedRows(cipher),
    mu(n1(leftmost(cipher))));
  const bucket = POST_THEN_CIPHER_INDEX.get(key);
  if (bucket) bucket.push(cipher);
  else POST_THEN_CIPHER_INDEX.set(key, [cipher]);
}

/** @param {object} current @param {number} S */
function ciphertextCandidatesReport06(current, S) {
  const expectedBoundary = expectedAxisBoundary(current);
  const expectedRowParity = expectedRows(current);
  const mode = cyclicMode(S);
  const allowedLeftmostClass = mode.reflected ? [0, -1] : [0, 1];
  const E = current.cipher.at(-1);
  const rayAllowance = Number(mu(n0(E)) === 0 && mu(n3(E)) === 0);
  const currentLeftmost = leftmost(current.cipher);
  const out = [];

  for (const leftmostClass of allowedLeftmostClass) {
    const key = cipherIndexKey(
      expectedBoundary,
      expectedRowParity,
      leftmostClass);
    for (const cipher of POST_THEN_CIPHER_INDEX.get(key) || []) {
      if (rayOffset(currentLeftmost, cipher[0]) <= rayAllowance) {
        out.push(cipher);
      }
    }
  }

  return out;
}

const POST_THEN_REACHABLE = Array.from(
  {length: POST_THEN_TARGET.runes + 1},
  () => new Set());
POST_THEN_REACHABLE[0].add("0|0");
for (let length = 1; length <= POST_THEN_TARGET.runes; length++) {
  for (const pair of POST_THEN_REACHABLE[length - 1]) {
    const [indexSum, gpSum] = pair.split("|").map(Number);
    for (let rune = 0; rune < 29; rune++) {
      const nextIndex = indexSum + rune;
      const nextGp = gpSum + GP[rune];
      if (
        nextIndex <= POST_THEN_TARGET.indexSum &&
        nextGp <= POST_THEN_TARGET.gpSum
      ) {
        POST_THEN_REACHABLE[length].add(nextIndex + "|" + nextGp);
      }
    }
  }
}

/*
 * The post-THEN search reaches many states only once. State-level caches made
 * memory grow with the DFS frontier. Static source and ciphertext attributes
 * are indexed once above, while the only state-dependent ray-offset test is
 * evaluated on demand. Candidate generation and acceptance predicates remain
 * unchanged.
 */

/** @param {object} current @param {number} S @param {number} a */
function cachedSourceOperations(current, S, a) {
  return sourceOperationsReport06(current, S, a);
}

/** @param {object} current @param {number} S */
function cachedCipherCandidates(current, S) {
  return ciphertextCandidatesReport06(current, S);
}

const expectedPostThenCipher = [
  [[22, 21], [21, 20]],
  [[21, 4], [20, 4], [19, 4]],
  [[18, 7], [19, 6]],
  [[9, 16], [8, 17]],
  [[9, 20], [9, 21]],
];

let postThenHits = 0;
let recordedPostThenHits = 0;
let firstPostThenHit = null;
const visitedByStage = [0, 0, 0, 0, 0, 0];

/**
 * @param {number} stage
 * @param {object} current
 * @param {number} S
 * @param {number} a
 * @param {number} runes
 * @param {number} indexSum
 * @param {number} gpSum
 * @param {Array<object>} steps
 * @param {boolean} recordedPrefix
 */
function searchPostThen(
  stage,
  current,
  S,
  a,
  runes,
  indexSum,
  gpSum,
  steps,
  recordedPrefix
) {
  visitedByStage[stage]++;

  if (stage === 5) {
    if (
      runes !== POST_THEN_TARGET.runes ||
      indexSum !== POST_THEN_TARGET.indexSum ||
      gpSum !== POST_THEN_TARGET.gpSum
    ) return;

    postThenHits++;
    if (recordedPrefix) recordedPostThenHits++;
    if (!firstPostThenHit) {
      firstPostThenHit = {current, S, a, runes, indexSum, gpSum, steps};
    }
    return;
  }

  const remainingStages = 5 - stage;
  const maxLength =
    POST_THEN_TARGET.runes - runes - 2 * (remainingStages - 1);
  if (maxLength < 2) return;

  const source = cachedSourceOperations(current, S, a);
  const ciphers = cachedCipherCandidates(current, S);

  for (const {node, operation} of source.rows) {
    for (const cipher of ciphers) {
      if (cipher.length > maxLength) continue;

      const plain = cipher.map((cell, i) =>
        mod29(at(cell) - operation.key[i % 3]));
      const nextRunes = runes + plain.length;
      const nextIndex =
        indexSum + plain.reduce((sum, value) => sum + value, 0);
      const nextGp =
        gpSum + plain.reduce((sum, value) => sum + GP[value], 0);

      if (
        nextRunes > POST_THEN_TARGET.runes ||
        nextIndex > POST_THEN_TARGET.indexSum ||
        nextGp > POST_THEN_TARGET.gpSum
      ) continue;

      const stagesLeft = 4 - stage;
      const runesLeft = POST_THEN_TARGET.runes - nextRunes;
      if (runesLeft < 2 * stagesLeft || runesLeft > 3 * stagesLeft) continue;

      const residualKey =
        (POST_THEN_TARGET.indexSum - nextIndex) + "|" +
        (POST_THEN_TARGET.gpSum - nextGp);
      if (!POST_THEN_REACHABLE[runesLeft].has(residualKey)) continue;

      const nextRecordedPrefix =
        recordedPrefix &&
        JSON.stringify(cipher) === JSON.stringify(expectedPostThenCipher[stage]);

      searchPostThen(
        stage + 1,
        {
          node,
          cipher,
          raw: node.map(at),
          phase: operation.phase,
        },
        S + operation.phase,
        source.outer,
        nextRunes,
        nextIndex,
        nextGp,
        steps.concat({node, operation, cipher, plain}),
        nextRecordedPrefix);
    }
  }
}

searchPostThen(
  0,
  recorded.current,
  recorded.S,
  recorded.a,
  0,
  0,
  0,
  [],
  true);

assert.ok(
  recordedPostThenHits >= 1,
  "recorded THE KEY IS TO GO geometry must survive prospective Reports 01-06");
assert.ok(firstPostThenHit, "at least one exact post-THEN target hit is required");

const postThenRecorded = recordedPostThenHits === 1 && postThenHits === 1
  ? firstPostThenHit
  : firstPostThenHit;


console.log(JSON.stringify({
  status: postThenHits === 1
    ? "unique 11/122/429 hit under global-source prospective Reports 01-06"
    : "11/122/429 underselects global-source prospective Reports 01-06",
  target: POST_THEN_TARGET,
  incomingState: {
    S: recorded.S,
    a: recorded.a,
    phase: recorded.current.phase,
    ciphertext: recorded.current.cipher,
  },
  pathCountsAfterEachStage: visitedByStage,
  hits: postThenHits,
  recordedHits: recordedPostThenHits,
  selected: {
    sources: firstPostThenHit.steps.map(step =>
      step.node.map(at).map(value => translit[value])),
    sourceCoordinates: firstPostThenHit.steps.map(step => step.node),
    ciphertext: firstPostThenHit.steps.map(step => step.cipher),
    plaintextRunes: firstPostThenHit.steps.map(step =>
      step.plain.map(value => translit[value])),
    keys: firstPostThenHit.steps.map(step =>
      step.operation.key.map(value => translit[value])),
    centerTotient: firstPostThenHit.steps.map(step =>
      step.operation.transformCenter),
  },
}, null, 2));
