#!/usr/bin/env node
"use strict";

// Source-constrained p50-derived key-consumer gates.
// Run: node sims/lp2_p50_derived_key_consumer_sft.cjs
// Uses only canonical repository source files; no fitted phase or text.

const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}
function fail(message) { throw new Error(message); }
function mod(x, m = 29) { return ((x % m) + m) % m; }
function phi(n) {
  if (n === 0) return 0; // zero-preserving extension; also test strict zero omission below
  let x = n, out = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      out -= out / p;
    }
  }
  if (x > 1) out -= out / x;
  return Math.round(out);
}
function ioc(values) {
  const counts = new Array(29).fill(0);
  for (const x of values) counts[x]++;
  const n = values.length;
  return counts.reduce((sum, f) => sum + f * (f - 1), 0) / (n * (n - 1));
}
function directDecode(cipher, key, sign, repeat) {
  if (!repeat && key.length < cipher.length) fail("One-use key is shorter than receiver");
  return cipher.map((x, i) => mod(x + sign * key[repeat ? i % key.length : i]));
}
function decodeTransparentF(cipher, key, sign, repeat) {
  // Exact p56-style rule: plaintext F=0 is transparent and does not consume
  // key state. Ciphertext F may alternatively be a consuming non-F symbol.
  let states = new Map([[0, [[]]]]);
  for (const c of cipher) {
    const next = new Map();
    const push = (j, a) => {
      if (!next.has(j)) next.set(j, []);
      next.get(j).push(a);
    };
    for (const [j, paths] of states) {
      for (const path of paths) {
        if (c === 0) push(j, path.concat(0));
        if (repeat || j < key.length) {
          const p = mod(c + sign * key[repeat ? j % key.length : j]);
          if (p !== 0) push(repeat ? (j + 1) % key.length : j + 1, path.concat(p));
        }
      }
    }
    states = next;
    if (states.size === 0) break;
  }
  return [...states.values()].flat();
}
function encodeTransparentF(plain, key, sign, repeat) {
  let j = 0;
  const out = [];
  for (const p of plain) {
    if (p === 0) {
      out.push(0);
      continue;
    }
    if (!repeat && j >= key.length) fail("One-use key exhausted in positive control");
    out.push(mod(p - sign * key[repeat ? j % key.length : j]));
    j++;
  }
  return out;
}
function includesExact(paths, target) {
  return paths.some(path => path.length === target.length &&
    path.every((x, i) => x === target[i]));
}
function bestPath(paths) {
  if (!paths.length) return null;
  let best = paths[0], score = ioc(best);
  for (let i = 1; i < paths.length; i++) {
    const candidateScore = ioc(paths[i]);
    if (candidateScore > score) {
      best = paths[i];
      score = candidateScore;
    }
  }
  return { score, values: best };
}
function runeString(values, translit) {
  return values.map(x => translit[x]).join("");
}
function decomposeFunctionalGraph(mapping) {
  const n = mapping.length;
  const component = new Int16Array(n).fill(-1);
  const position = new Int16Array(n).fill(-1);
  const cycles = [];
  let componentCount = 0;
  for (let start = 0; start < n; start++) {
    if (component[start] >= 0) continue;
    const pathNodes = [];
    let node = start;
    while (component[node] < 0 && position[node] < 0) {
      position[node] = pathNodes.length;
      pathNodes.push(node);
      node = mapping[node];
    }
    let id;
    if (position[node] >= 0) {
      const cycleStart = position[node];
      const cycleNodes = pathNodes.slice(cycleStart);
      id = componentCount++;
      cycles.push(cycleNodes);
      for (let i = cycleStart; i < pathNodes.length; i++) component[pathNodes[i]] = id;
      for (let i = cycleStart - 1; i >= 0; i--) component[pathNodes[i]] = id;
    } else {
      id = component[node];
      for (let i = pathNodes.length - 1; i >= 0; i--) component[pathNodes[i]] = id;
    }
    for (const x of pathNodes) position[x] = -1;
  }
  const basins = new Array(componentCount).fill(0);
  for (let i = 0; i < n; i++) basins[component[i]]++;
  return cycles.map((nodes, i) => ({ nodes, basin: basins[i] }));
}
function walkUntilRepeat(start, mapping) {
  const seen = new Map(), pathNodes = [];
  let node = start;
  while (!seen.has(node)) {
    seen.set(node, pathNodes.length);
    pathNodes.push(node);
    node = mapping[node];
  }
  const entryIndex = seen.get(node);
  return { path: pathNodes, entry: node, depth: entryIndex };
}
function rotateCycle(cycle, start) {
  const i = cycle.indexOf(start);
  if (i < 0) fail("Requested cycle start is not in cycle");
  return cycle.slice(i).concat(cycle.slice(0, i));
}

function main() {
  const grid = readJson("resources/liber-primus/lp2-grid-256.json");
  const corpus = readJson("resources/liber-primus/lp2-corpus.json");
  const signed = fs.readFileSync(
    path.join(ROOT, "resources/historical/cicada2016-4gq25-outguess.asc"), "utf8"
  );
  const pages = new Map(corpus.pages.map(p => [p.page, p.indices]));
  const p57 = pages.get(57);
  const p0 = pages.get(0);
  const pre = pages.get(48).slice(-72).concat(pages.get(49));
  const post = pages.get(51).concat(pages.get(52).slice(0, 78));
  const p0Body = p0.slice(13);

  if (grid.bytes.length !== 256 || grid.byte_count !== 256) fail("Expected 256 table values");
  if (pre.length !== 138 || post.length !== 170 || p0Body.length !== 249 || p57.length !== 95) {
    fail("Original receiver lengths changed");
  }
  const zeroPositions = grid.bytes.map((x, i) => x === 0 ? i : null).filter(x => x !== null);
  if (zeroPositions.join(",") !== "192,229") fail("Table zero positions changed");
  if (p0Body.filter(x => x === 0).length !== 13) fail("p0 black-body F count changed");

  // Gate A: the LP1 p05 explicit totient clue transferred to the 256-cell
  // p49-p51 table, row-major, as a one-use GP29 key for its two flanking
  // complete sentences. The table's base-60 byte rule is itself provisional.
  const phiKey = grid.bytes.map(x => phi(x) % 29);
  const phiKeySkipZero = grid.bytes.filter(x => x !== 0).map(x => phi(x) % 29);
  if (phiKeySkipZero.length !== 254 ||
      phiKey.slice(0, 170).some((x, i) => x !== phiKeySkipZero[i])) {
    fail("Zero convention unexpectedly affects tested key prefix");
  }
  const phiReceivers = [];
  for (const receiver of [{ name: "pretable p48-49", cipher: pre },
                          { name: "posttable p51-52", cipher: post }]) {
    for (const sign of [-1, 1]) {
      const direct = directDecode(receiver.cipher, phiKey, sign, false);
      const transparent = decodeTransparentF(receiver.cipher, phiKey, sign, false);
      const best = bestPath(transparent);
      phiReceivers.push({
        receiver: receiver.name,
        sign: sign < 0 ? "C-K" : "C+K",
        directIoC: ioc(direct),
        transparentPathCount: transparent.length,
        bestTransparentIoC: best ? best.score : null,
        bestTransparentText: best ? runeString(best.values, corpus.translit) : null
      });
      const planted = encodeTransparentF(p57, phiKey, sign, false);
      if (!includesExact(decodeTransparentF(planted, phiKey, sign, false), p57)) {
        fail("p57 planted positive control failed for totient-table key");
      }
    }
  }

  // Gate B: the source-oriented p50 functional-graph nodes select pairs of
  // words in the first 29 words of the signed 2016 message. Test only the
  // natural GP0 word-sum difference (direction) and sum as a rival, as
  // 13-periodic keys on the p0 black body. No phase search is permitted.
  const start = signed.indexOf("Hello.");
  const end = signed.indexOf("-----BEGIN PGP SIGNATURE-----", start);
  if (start < 0 || end < 0) fail("Could not isolate signed 2016 message body");
  const words = signed.slice(start, end).replace(/\b7A35090F\b/g, " ")
    .match(/[A-Za-z]+/g) || [];
  if (words.length !== 43) fail("Expected 43 signed-message words");

  const runeTokens = corpus.translit.map((token, index) => ({
    token: String(token).toLowerCase(), index
  })).sort((a, b) => b.token.length - a.token.length);
  function wordRunes(word) {
    let remaining = String(word).toLowerCase()
      .replace(/v/g, "u").replace(/k/g, "c").replace(/z/g, "s");
    const out = [];
    while (remaining.length) {
      const match = runeTokens.find(x => remaining.startsWith(x.token));
      if (!match) fail("Unmapped GP transliteration: " + word + " at " + remaining);
      out.push(match.index);
      remaining = remaining.slice(match.token.length);
    }
    return out;
  }
  const wordValues = words.map(word => wordRunes(word).reduce((sum, x) => sum + x, 0));
  if (words[1].toLowerCase() !== "the" || wordValues[1] !== 20) {
    fail("2016 first-THE source address changed");
  }
  const graph = decomposeFunctionalGraph(grid.bytes);
  const c2 = graph.find(x => x.nodes.length === 2);
  const c11 = graph.find(x => x.nodes.length === 11);
  if (graph.length !== 2 || !c2 || !c11 ||
      c2.basin !== 4 || c11.basin !== 252) fail("p50 functional graph signature changed");
  const twoStart = c2.nodes.find(n => Math.floor(n / 29) === 5);
  const firstTheWalk = walkUntilRepeat(wordValues[1], grid.bytes);
  if (!c11.nodes.includes(firstTheWalk.entry)) fail("First THE no longer enters 11-cycle");
  const orderedNodes = rotateCycle(c2.nodes, twoStart)
    .concat(rotateCycle(c11.nodes, firstTheWalk.entry));
  const expectedNodes = [158, 249, 115, 247, 192, 0, 203, 68, 199, 47, 76, 114, 197];
  if (orderedNodes.join(",") !== expectedNodes.join(",")) fail("Source-oriented graph order changed");
  const pairs = orderedNodes.map(n => ({ q: Math.floor(n / 29), r: n % 29 }));
  const diffKey = pairs.map(p => mod(wordValues[p.q] - wordValues[p.r]));
  const sumKey = pairs.map(p => mod(wordValues[p.q] + wordValues[p.r]));
  const p0Residual = [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19];
  if (diffKey.join(",") === p0Residual.join(",") ||
      sumKey.join(",") === p0Residual.join(",")) {
    fail("Unexpected equality with the pre-existing p0 residual");
  }

  const wordPairReceivers = [];
  for (const item of [{ name: "word-pair GP0 difference", key: diffKey },
                      { name: "word-pair GP0 sum", key: sumKey }]) {
    for (const sign of [-1, 1]) {
      const direct = directDecode(p0Body, item.key, sign, true);
      const transparent = decodeTransparentF(p0Body, item.key, sign, true);
      const best = bestPath(transparent);
      wordPairReceivers.push({
        key: item.name,
        keyValues: item.key,
        sign: sign < 0 ? "C-K" : "C+K",
        directIoC: ioc(direct),
        transparentPathCount: transparent.length,
        bestTransparentIoC: best ? best.score : null,
        bestTransparentText: best ? runeString(best.values, corpus.translit) : null
      });
      const planted = encodeTransparentF(p57, item.key, sign, true);
      if (!includesExact(decodeTransparentF(planted, item.key, sign, true), p57)) {
        fail("p57 planted positive control failed for " + item.name);
      }
    }
  }

  // Direct use of the two base-29 coordinate streams is an even simpler
  // p0 consumer than the word-value arithmetic above: use q or r itself as
  // the 13-symbol periodic key, in the source-oriented graph order.
  const directCoordinateReceivers = [];
  for (const item of [{ name: "quotient q", key: pairs.map(p => p.q) },
                      { name: "remainder r", key: pairs.map(p => p.r) }]) {
    for (const sign of [-1, 1]) {
      const direct = directDecode(p0Body, item.key, sign, true);
      const transparent = decodeTransparentF(p0Body, item.key, sign, true);
      const best = bestPath(transparent);
      directCoordinateReceivers.push({
        key: item.name,
        keyValues: item.key,
        sign: sign < 0 ? "C-K" : "C+K",
        directIoC: ioc(direct),
        transparentPathCount: transparent.length,
        bestTransparentIoC: best ? best.score : null,
        bestTransparentText: best ? runeString(best.values, corpus.translit) : null
      });
      const planted = encodeTransparentF(p57, item.key, sign, true);
      if (!includesExact(decodeTransparentF(planted, item.key, sign, true), p57)) {
        fail("p57 planted positive control failed for " + item.name);
      }
    }
  }

  // A further source-motivated state-key candidate: the DH shared secret
  // K=2 and the first signed-message THE address (GP0=20) both enter the
  // same 11-cycle at 115. Test cycle states and cycle-edge deltas as
  // phase-zero 11-periodic keys on the p0 body.
  const dhKWalk = walkUntilRepeat(2, grid.bytes);
  if (dhKWalk.entry !== firstTheWalk.entry) {
    fail("DH shared secret K=2 and first THE no longer enter the same cycle node");
  }
  const cycle11 = rotateCycle(c11.nodes, firstTheWalk.entry);
  const cycle11StateKey = cycle11.map(n => mod(n));
  const cycle11DeltaKey = cycle11.map((n, i) =>
    mod(cycle11[(i + 1) % cycle11.length] - n)
  );
  const cycle11Receivers = [];
  for (const item of [
    { name: "11-cycle state residues", key: cycle11StateKey },
    { name: "11-cycle edge deltas", key: cycle11DeltaKey }
  ]) {
    for (const sign of [-1, 1]) {
      const direct = directDecode(p0Body, item.key, sign, true);
      const transparent = decodeTransparentF(p0Body, item.key, sign, true);
      const best = bestPath(transparent);
      cycle11Receivers.push({
        key: item.name,
        keyValues: item.key,
        sign: sign < 0 ? "C-K" : "C+K",
        directIoC: ioc(direct),
        transparentPathCount: transparent.length,
        bestTransparentIoC: best ? best.score : null,
        bestTransparentText: best ? runeString(best.values, corpus.translit) : null
      });
      const planted = encodeTransparentF(p57, item.key, sign, true);
      if (!includesExact(decodeTransparentF(planted, item.key, sign, true), p57)) {
        fail("p57 planted positive control failed for " + item.name);
      }
    }
  }

  const output = {
    classification: "bounded negative tests; no unknown plaintext or key recovered",
    sources: {
      grid: "resources/liber-primus/lp2-grid-256.json",
      corpus: "resources/liber-primus/lp2-corpus.json",
      signed2016: "resources/historical/cicada2016-4gq25-outguess.asc",
      p05TotientInstruction: "resources/transcriptions/liber_primus_master.txt"
    },
    sourceFacts: {
      tableCells: grid.byte_count,
      tableShape: grid.shape,
      tableByteRule: grid.byte_rule,
      tableByteRuleStatus: "hypothesis, not authenticated",
      tableZeroPositions: zeroPositions,
      pretableReceiverRunes: pre.length,
      posttableReceiverRunes: post.length,
      p0BodyRunes: p0Body.length,
      p0BodyCiphertextFCount: p0Body.filter(x => x === 0).length,
      p57ControlRunes: p57.length,
      p57IoC: ioc(p57)
    },
    totientTableKey: {
      rule: "row-major base-60 byte values -> Euler phi(value) mod29; one-use, phase0",
      zeroPolicy: "phi(0)=0 extension and strict omission give identical tested prefixes because zero cells are at indices 192 and 229",
      keyLengthZeroExtension: phiKey.length,
      keyLengthStrictOmission: phiKeySkipZero.length,
      receivers: phiReceivers
    },
    functionalGraph11CycleKey: {
      dhSharedSecretSeed: 2,
      dhKOrbitDepth: dhKWalk.depth,
      dhKCycleEntry: dhKWalk.entry,
      firstTheOrbitDepth: firstTheWalk.depth,
      firstTheCycleEntry: firstTheWalk.entry,
      orderedCycle11: cycle11,
      stateResidueKey: cycle11StateKey,
      edgeDeltaKey: cycle11DeltaKey,
      receivers: cycle11Receivers
    },
    functionalGraphDirectCoordinateKey: {
      quotientQ: pairs.map(p => p.q),
      remainderR: pairs.map(p => p.r),
      receivers: directCoordinateReceivers
    },
    functionalGraphWordPairKey: {
      orderedNodes,
      pairs: pairs.map((p, i) => ({
        node: orderedNodes[i], q: p.q, r: p.r,
        qWord: words[p.q], rWord: words[p.r],
        qWordGP0: wordValues[p.q], rWordGP0: wordValues[p.r]
      })),
      differenceKey: diffKey,
      sumKey: sumKey,
      preExistingP0Residual: p0Residual,
      receivers: wordPairReceivers
    },
    positiveControls: "For every tested key/sign, p57 PARABLE was synthetically encrypted and decrypted under the p56-style plaintext-F-transparent rule; the inverse recovered all 95 original p57 symbols."
  };
  console.log(JSON.stringify(output, null, 2));
}
main();
