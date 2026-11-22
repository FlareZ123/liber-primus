"use strict";

/**
 * SFT: second-passage checksum selector for the LP2 p0-p2 27x27 route.
 *
 * The original 27x27 mirror graph generates source-node candidates from the
 * recorded IDEA endpoint and subsequent candidate ciphertext endpoints.
 * Stages 12 and 13 are not supplied as fixed source coordinates.
 *
 * The test does NOT supply plaintext or per-block ciphertext lengths. It
 * allows both direct and center-totient key variants, every in-bounds straight
 * contiguous ciphertext segment compatible with the locked total of 12 runes,
 * and the published Reports 01-19 transition gates.
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
const TARGET = Object.freeze({runes: 12, indexSum: 151, gpSum: 553});
const MAX_REPORT = 11;
assert.equal(MAX_REPORT, 11);

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
    (MAX_REPORT >= 11 && operation.phase === 2 && S % 7 === 6) ||
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
  const observedRay = rayOffset(leftmost(current.cipher), cipher[0]);
  if (MAX_REPORT >= 12) {
    if (observedRay !== expectedRay(current)) return null;
  } else {
    const E = current.cipher.at(-1);
    const allowance = Number(mu(n0(E)) === 0 && mu(n3(E)) === 0);
    if (observedRay > allowance) return null;
  }

  const nextRaw = nextNode.map(at);
  if (Number(nextRaw[0] === nextRaw[2]) !== expectedMirror(current)) return null;
  if (mod2(leftmost(cipher)[1]) !== expectedColumnParity(current)) return null;
  if (!squarefreeGcdOk(center, cipher)) return null;
  if (MAX_REPORT >= 13) {
    const observedAxis = keyAxis(nextNode);
    const expectedAxis = expectedKeyAxis(current);
    if (MAX_REPORT >= 14) {
      if (observedAxis !== expectedAxis) return null;
    } else if (Math.floor(observedAxis / 2) !== Math.floor(expectedAxis / 2)) {
      return null;
    }
  }
  if (
    MAX_REPORT >= 15 &&
    mod2(radius(nextNode)) !== expectedRadiusParity(current)
  ) return null;
  if (MAX_REPORT >= 17 && !acceptsReport17(current, center)) return null;
  if (
    MAX_REPORT >= 18 &&
    predictReport18(current).join(",") !==
    observeReport18(current, cipher).join(",")
  ) return null;
  if (
    MAX_REPORT >= 19 &&
    !acceptsReport19(current, previousBeginning, cipher[0])
  ) return null;

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

const MIRROR_AXES = [[0, 1], [1, 0], [1, 1], [1, -1]];
const mirrors = [];
for (let row = 1; row <= 27; row++) {
  for (let column = 1; column <= 27; column++) {
    for (const [dr, dc] of MIRROR_AXES) {
      for (let r = 1; r <= 26; r++) {
        const first = [row - dr * r, column - dc * r];
        const last = [row + dr * r, column + dc * r];
        if (
          first[0] < 1 || first[0] > 27 ||
          first[1] < 1 || first[1] > 27 ||
          last[0] < 1 || last[0] > 27 ||
          last[1] < 1 || last[1] > 27
        ) break;
        if (at(first) === at(last)) {
          mirrors.push({
            node: [first, [row, column], last],
            axis: [dr, dc],
            radius: r,
          });
        }
      }
    }
  }
}

/** @param {[number, number]} a @param {[number, number]} b */
function sameCell(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

/** @param {Array<[number, number]>} node */
function nodeId(node) {
  return node.map(cell => cell.join(",")).join(">");
}

/** @param {[number, number]} cell */
function centeredMirrors(cell) {
  return mirrors.filter(row => sameCell(row.node[1], cell));
}

/** @param {[number, number]} cell */
function outerMirrors(cell) {
  return mirrors.filter(row =>
    sameCell(row.node[0], cell) || sameCell(row.node[2], cell));
}

/**
 * Source-only mirror-overlap successor family.
 *
 * Stage 09: every mirror centered on the preceding IDEA endpoint.
 * Stage 10: if the IDEA beginning is one outer of stage 09's mirror, take
 *           mirrors centered on the opposite outer.
 * Stage 11: take unvisited mirrors having stage 10's center as an outer.
 * Stage 12: from the candidate stage-11 ciphertext endpoint, enter every
 *           mirror for which that endpoint is an outer, then expand to another
 *           mirror sharing its center and axis.
 * Stage 13: from the candidate stage-12 endpoint, enter every centered mirror,
 *           move one source radius in either perpendicular direction, and take
 *           every mirror centered on the landing cell.
 *
 * No plaintext, dictionary, checksum total, or recorded stage-12/13 source
 * coordinate enters these successor rules.
 *
 * @param {number} stage zero-based stage 09..13
 * @param {object} candidatePath
 */
function sourceNodeCandidates(stage, candidatePath) {
  let rows = [];

  if (stage === 0) {
    rows = centeredMirrors(candidatePath.current.cipher.at(-1));
  } else if (stage === 1) {
    const previous = candidatePath.steps[0].nextNode;
    const begin = initial.cipher[0];
    const anchors = [];
    if (sameCell(previous[0], begin)) anchors.push(previous[2]);
    if (sameCell(previous[2], begin)) anchors.push(previous[0]);
    for (const anchor of anchors) rows.push(...centeredMirrors(anchor));
  } else if (stage === 2) {
    const stage09 = candidatePath.steps[0].nextNode;
    const stage10 = candidatePath.steps[1].nextNode;
    const anchor = stage10[1];
    rows = outerMirrors(anchor).filter(row => nodeId(row.node) !== nodeId(stage09));
  } else if (stage === 3) {
    const endpoint = candidatePath.current.cipher.at(-1);
    for (const entry of outerMirrors(endpoint)) {
      const [dr, dc] = entry.axis;
      for (const other of centeredMirrors(entry.node[1])) {
        if (
          nodeId(other.node) !== nodeId(entry.node) &&
          other.axis[0] === dr &&
          other.axis[1] === dc
        ) rows.push(other);
      }
    }
  } else if (stage === 4) {
    const endpoint = candidatePath.current.cipher.at(-1);
    for (const entry of centeredMirrors(endpoint)) {
      const [dr, dc] = entry.axis;
      const perpendiculars = [[-dc, dr], [dc, -dr]];
      for (const [pr, pc] of perpendiculars) {
        const landing = [
          endpoint[0] + pr * entry.radius,
          endpoint[1] + pc * entry.radius,
        ];
        if (
          landing[0] < 1 || landing[0] > 27 ||
          landing[1] < 1 || landing[1] > 27
        ) continue;
        rows.push(...centeredMirrors(landing));
      }
    }
  }

  const unique = new Map();
  for (const row of rows) {
    // Report 00's source domain is rune indices 1..28. Rune index 0 (F)
    // is never an admissible source component in the published search family.
    if (row.node.some(cell => at(cell) === 0)) continue;
    unique.set(nodeId(row.node), row.node);
  }
  return [...unique.values()];
}

const initialNode = [[8, 13], [11, 16], [14, 19]];
const initial = {
  node: initialNode,
  cipher: [[15, 20], [16, 19], [17, 18]], // IDEA
  raw: initialNode.map(at),
  phase: 1,
};

const segments = allStraightSegments(4);
let paths = [{
  current: initial,
  previousBeginning: [11, 16], // preceding NOW THE start
  S: 7,
  a: 0,
  runes: 0,
  indexSum: 0,
  gpSum: 0,
  steps: [],
}];
const pathCountsAfterEachStage = [];

for (let stage = 0; stage < 5; stage++) {
  const nextPaths = [];

  for (const candidatePath of paths) {
    const remainingStages = 5 - stage;
    const maxLength =
      TARGET.runes - candidatePath.runes - 2 * (remainingStages - 1);
    if (maxLength < 2) continue;

    for (const nextNode of sourceNodeCandidates(stage, candidatePath)) {
      for (const operation of keyVariants(nextNode)) {
        // Pre-IDEA source-class rule: every selected equal-outer mirror in
        // blocks 02, 04, 05, 06, 07 and 08 applies phi to its center.
        // sourceNodeCandidates() generates equal-outer mirror nodes only.
        if (!operation.transformCenter) continue;
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

const expectedCipher = [
  [[18, 15], [18, 16]],
  [[19, 17], [19, 16]],
  [[19, 23], [20, 23], [21, 23]],
  [[21, 9], [21, 10]],
  [[26, 3], [26, 2], [26, 1]],
];

const recordedHits = hits.filter(candidate =>
  JSON.stringify(candidate.steps.map(step => step.cipher)) ===
  JSON.stringify(expectedCipher));

assert.ok(recordedHits.length >= 1, "recorded route must survive Report11 plus pre-IDEA mirror→phi rule");
assert.equal(hits.length, 1);

const recorded = recordedHits[0];
assert.deepEqual(
  recorded.steps.map(step => step.plain.map(value => translit[value]).join(" ")),
  ["O F", "TH E", "E N D", "I S", "D EA TH"]);

console.log(JSON.stringify({
  reportLevel: MAX_REPORT,
  target: TARGET,
  pathCountsAfterEachStage,
  exactChecksumHits: hits.length,
  recordedRouteHits: recordedHits.length,
  recordedPlaintextRunes: recorded.steps.map(step =>
    step.plain.map(value => translit[value])),
  exactHitDetails: hits.map((candidate, hitIndex) => ({
    hitIndex,
    sourceCoordinates: candidate.steps.map(step => step.nextNode),
    sourceRunes: candidate.steps.map(step =>
      step.nextNode.map(at).map(value => translit[value])),
    centerTotient: candidate.steps.map(step => step.operation.transformCenter),
    keys: candidate.steps.map(step =>
      step.operation.key.map(value => translit[value])),
    ciphertext: candidate.steps.map(step => step.cipher),
    plaintextRunes: candidate.steps.map(step =>
      step.plain.map(value => translit[value])),
  })),
}, null, 2));
