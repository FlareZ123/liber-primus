"use strict";
// Exact #2658 inverse for reversed shared plaintext under independent q8/q13
// GP29 additive keys with literal plaintext-F holds. Read-only, Node 22, no deps.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const MOD = 29;
const mod = (x, m = MOD) => ((x % m) + m) % m;
const countNonzero = a => a.reduce((n, x) => n + (x === 0 ? 0 : 1), 0);
const sameArray = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

function inverse(A, B, qA, qB, orientation, holds, m = MOD) {
  assert.equal(A.length, B.length);
  const n = A.length, variables = qA + qB, held = new Set(holds);
  const prefix = Array(n).fill(0);
  let activeTotal = 0;
  for (let i = 0; i < n; i++) {
    prefix[i] = activeTotal;
    if (!held.has(i)) activeTotal++;
  }
  const parent = Array.from({ length: variables }, (_, i) => i);
  const potential = Array(variables).fill(0), rank = Array(variables).fill(0);
  const forbidden = Array.from({ length: variables }, () => []);
  function find(x) {
    if (parent[x] === x) return [x, 0];
    const [root, offset] = find(parent[x]);
    potential[x] = mod(potential[x] + offset, m);
    parent[x] = root;
    return [root, potential[x]];
  }
  function join(x, y, difference) {
    const [rx, px] = find(x), [ry, py] = find(y);
    if (rx === ry) return mod(py - px, m) === difference;
    if (rank[rx] >= rank[ry]) {
      parent[ry] = rx;
      potential[ry] = mod(difference + px - py, m);
      if (rank[rx] === rank[ry]) rank[rx]++;
    } else {
      parent[rx] = ry;
      potential[rx] = mod(py - px - difference, m);
    }
    return true;
  }
  for (let i = 0; i < n; i++) {
    if (held.has(i)) continue;
    const j = orientation === "reverse" ? n - 1 - i : i;
    const a = A[i], b = B[j];
    const phaseA = prefix[i] % qA;
    const phaseB = (orientation === "reverse"
      ? activeTotal - prefix[i] - 1
      : prefix[i]) % qB;
    if (!join(phaseA, qA + phaseB, mod(b - a, m))) return null;
    forbidden[phaseA].push(a);
    forbidden[qA + phaseB].push(b);
  }
  const rootOf = Array(variables), offsetOf = Array(variables);
  for (let v = 0; v < variables; v++) {
    const [root, offset] = find(v);
    rootOf[v] = root; offsetOf[v] = offset;
  }
  const groups = new Map();
  for (let v = 0; v < variables; v++) {
    const root = rootOf[v];
    if (!groups.has(root)) groups.set(root, { nodes: [], forbidden: new Set() });
    const group = groups.get(root);
    group.nodes.push(v);
    for (const f of forbidden[v]) group.forbidden.add(mod(f - offsetOf[v], m));
  }
  const components = [];
  let assignmentCount = 1;
  for (const [root, group] of groups) {
    const allowed = Array.from({ length: m }, (_, x) => x)
      .filter(x => !group.forbidden.has(x));
    if (allowed.length === 0) return null;
    assignmentCount *= allowed.length;
    components.push({ root, nodes: group.nodes, allowed });
  }
  return { activeTotal, components, offsetOf, assignmentCount };
}

function scan(Apage, Bpage, qA, qB, orientation) {
  const feasible = [], doubleZeroDistribution = {};
  let maskTests = 0, maxDoubleZeros = 0;
  for (let offset = 0; offset <= Apage.length - Bpage.length; offset++) {
    const A = Apage.slice(offset, offset + Bpage.length), B = Bpage;
    const doubleZeros = [];
    for (let i = 0; i < A.length; i++) {
      const j = orientation === "reverse" ? B.length - 1 - i : i;
      if (A[i] === 0 && B[j] === 0) doubleZeros.push(i);
    }
    maxDoubleZeros = Math.max(maxDoubleZeros, doubleZeros.length);
    doubleZeroDistribution[doubleZeros.length] =
      (doubleZeroDistribution[doubleZeros.length] || 0) + 1;
    assert.ok(doubleZeros.length <= 20);
    for (let mask = 0; mask < (1 << doubleZeros.length); mask++) {
      maskTests++;
      const holds = doubleZeros.filter((_, k) => (mask >> k) & 1);
      const solution = inverse(A, B, qA, qB, orientation, holds);
      if (solution) feasible.push({ offset, holds, solution });
    }
  }
  return {
    placements: Apage.length - Bpage.length + 1,
    maskTests, maxDoubleZeros, doubleZeroDistribution, feasible
  };
}

function nativeRunes(sectionName, corpus, donor) {
  const section = donor.sections.find(s => s.name === sectionName);
  assert.ok(section, "missing native donor section " + sectionName);
  return [...section.source_text]
    .filter(ch => corpus.runes.includes(ch))
    .map(ch => corpus.runes.indexOf(ch));
}

function bestWindow(values, length = 76) {
  assert.ok(values.length >= length);
  let best = null;
  for (let start = 0; start <= values.length - length; start++) {
    const window = values.slice(start, start + length);
    const fCount = window.filter(x => x === 0).length;
    if (!best || fCount > best.fCount) best = { start, fCount, values: window };
  }
  return best;
}

function makeRng(initialSeed) {
  let seed = initialSeed >>> 0;
  return () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return seed >>> 0;
  };
}

function encrypt(plain, key, period, phase = 0) {
  let cursor = phase;
  return plain.map(p => {
    if (p === 0) return 0;
    const c = mod(p + key[cursor % period]);
    cursor++;
    return c;
  });
}

function makePositivePlant(plain76, qA, qB, offset, random) {
  const prefix = Array.from({ length: offset }, () => random() % MOD);
  const suffix = Array.from({ length: 121 - offset - 76 }, () => random() % MOD);
  const plainA = prefix.concat(plain76, suffix);
  const keyA = Array.from({ length: qA }, () => random() % MOD);
  const keyB = Array.from({ length: qB }, () => random() % MOD);
  const phaseA = random() % qA, phaseB = random() % qB;
  const forcedIndex = plain76.findIndex(x => x !== 0);
  assert.ok(forcedIndex >= 0);
  const phaseAtA = (phaseA + countNonzero(prefix) +
    countNonzero(plain76.slice(0, forcedIndex))) % qA;
  const phaseAtB = (phaseB + countNonzero(plain76.slice(forcedIndex + 1))) % qB;
  keyA[phaseAtA] = mod(-plain76[forcedIndex]);
  keyB[phaseAtB] = mod(-plain76[forcedIndex]);
  return {
    A: encrypt(plainA, keyA, qA, phaseA),
    B: encrypt(plain76.slice().reverse(), keyB, qB, phaseB),
    plain76, keyA, keyB, phaseA, phaseB, prefix, offset, forcedIndex
  };
}

function checkPositivePlant(plant, qA, qB, solution) {
  const A = plant.A.slice(plant.offset, plant.offset + 76);
  const Breversed = plant.B.slice().reverse();
  const prefixActive = countNonzero(plant.prefix), holds = [];
  let generatedConsumingDoubleZero = false;
  for (let i = 0; i < 76; i++) {
    const p = plant.plain76[i];
    if (p === 0) {
      holds.push(i);
      assert.equal(A[i], 0); assert.equal(Breversed[i], 0);
    } else {
      const phaseA = (plant.phaseA + prefixActive +
        countNonzero(plant.plain76.slice(0, i))) % qA;
      const phaseB = (plant.phaseB +
        countNonzero(plant.plain76.slice(i + 1))) % qB;
      assert.equal(A[i], mod(p + plant.keyA[phaseA]));
      assert.equal(Breversed[i], mod(p + plant.keyB[phaseB]));
      if (A[i] === 0 && Breversed[i] === 0) generatedConsumingDoubleZero = true;
    }
  }
  assert.equal(A[plant.forcedIndex], 0);
  assert.equal(Breversed[plant.forcedIndex], 0);
  assert.ok(generatedConsumingDoubleZero);
  const actualValues = Array(qA + qB);
  for (let a = 0; a < qA; a++) {
    actualValues[a] = plant.keyA[(plant.phaseA + prefixActive + a) % qA];
  }
  for (let b = 0; b < qB; b++) {
    actualValues[qA + b] = plant.keyB[(plant.phaseB + b) % qB];
  }
  for (const component of solution.components) {
    const roots = component.nodes.map(v => mod(actualValues[v] - solution.offsetOf[v]));
    assert.equal(new Set(roots).size, 1);
    assert.ok(component.allowed.includes(roots[0]));
  }
  return {
    holds, generatedConsumingDoubleZero,
    componentCount: solution.components.length,
    rootChoices: solution.components.map(c => c.allowed.length)
  };
}

function smallFieldInverse(A, B, qA, qB, orientation, holds, m) {
  const n = A.length, H = new Set(holds), prefix = Array(n).fill(0);
  let total = 0;
  for (let i = 0; i < n; i++) { prefix[i] = total; if (!H.has(i)) total++; }
  const vars = qA + qB, parent = Array.from({ length: vars }, (_, i) => i);
  const pot = Array(vars).fill(0), rank = Array(vars).fill(0);
  const forbidden = Array.from({ length: vars }, () => []), md = x => mod(x, m);
  function find(x) {
    if (parent[x] === x) return [x, 0];
    const [r, p] = find(parent[x]);
    pot[x] = md(pot[x] + p); parent[x] = r; return [r, pot[x]];
  }
  function join(x, y, d) {
    const [rx, px] = find(x), [ry, py] = find(y);
    if (rx === ry) return md(py - px) === d;
    if (rank[rx] >= rank[ry]) {
      parent[ry] = rx; pot[ry] = md(d + px - py);
      if (rank[rx] === rank[ry]) rank[rx]++;
    } else { parent[rx] = ry; pot[rx] = md(py - px - d); }
    return true;
  }
  for (let i = 0; i < n; i++) {
    if (H.has(i)) continue;
    const j = orientation === "reverse" ? n - 1 - i : i;
    const pa = prefix[i] % qA;
    const pb = (orientation === "reverse" ? total - prefix[i] - 1 : prefix[i]) % qB;
    if (!join(pa, qA + pb, md(B[j] - A[i]))) return false;
    forbidden[pa].push(A[i]); forbidden[qA + pb].push(B[j]);
  }
  const roots = new Map();
  for (let v = 0; v < vars; v++) {
    const [r, off] = find(v);
    if (!roots.has(r)) roots.set(r, new Set());
    for (const f of forbidden[v]) roots.get(r).add(md(f - off));
  }
  for (const blocked of roots.values()) if (blocked.size === m) return false;
  return true;
}

function smallFieldBrute(A, B, qA, qB, orientation, holds, m) {
  const n = A.length, H = new Set(holds), prefix = Array(n).fill(0);
  let total = 0;
  for (let i = 0; i < n; i++) { prefix[i] = total; if (!H.has(i)) total++; }
  const keys = [];
  function enumerate(i, values) {
    if (i === qA + qB) { keys.push(values.slice()); return; }
    for (let x = 0; x < m; x++) { values[i] = x; enumerate(i + 1, values); }
  }
  enumerate(0, []);
  for (const key of keys) {
    let valid = true;
    for (let i = 0; i < n; i++) {
      const j = orientation === "reverse" ? n - 1 - i : i;
      if (H.has(i)) {
        if (A[i] !== 0 || B[j] !== 0) { valid = false; break; }
        continue;
      }
      const pa = prefix[i] % qA;
      const pb = (orientation === "reverse" ? total - prefix[i] - 1 : prefix[i]) % qB;
      const p = mod(A[i] - key[pa], m);
      if (p === 0 || mod(p + key[qA + pb], m) !== B[j]) { valid = false; break; }
    }
    if (valid) return true;
  }
  return false;
}

function smallFieldChecks() {
  const random = makeRng(0x2660beef), checks = [];
  for (let t = 0; t < 100; t++) {
    const m = 5, qA = 2, qB = 3, n = 6;
    const orientation = t % 2 ? "reverse" : "forward";
    const A = Array.from({ length: n }, () => random() % m);
    const B = Array.from({ length: n }, () => random() % m);
    const doubleZeros = [];
    for (let i = 0; i < n; i++) {
      const j = orientation === "reverse" ? n - 1 - i : i;
      if (A[i] === 0 && B[j] === 0) doubleZeros.push(i);
    }
    for (let mask = 0; mask < (1 << doubleZeros.length); mask++) {
      const holds = doubleZeros.filter((_, k) => (mask >> k) & 1);
      checks.push(smallFieldInverse(A, B, qA, qB, orientation, holds, m) ===
        smallFieldBrute(A, B, qA, qB, orientation, holds, m));
    }
  }
  assert.equal(checks.length, 125);
  assert.ok(checks.every(Boolean));
  return { cases: checks.length, mismatches: 0 };
}

function run() {
  const root = path.resolve(__dirname, "..");
  const corpus = JSON.parse(fs.readFileSync(path.join(root,
    "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const donor = JSON.parse(fs.readFileSync(path.join(root,
    "resources/external/relikd-solved-gp29-native-v1.json"), "utf8"));
  const p32 = corpus.pages.find(p => p.page === 32).indices;
  const p55 = corpus.pages.find(p => p.page === 55).indices;
  assert.equal(p32.length, 121); assert.equal(p55.length, 76);

  const original = {};
  for (const orientation of ["reverse", "forward"]) {
    for (const [qA, qB] of [[8, 13], [13, 8]]) {
      const result = scan(p32, p55, qA, qB, orientation);
      assert.equal(result.placements, 46);
      assert.equal(result.feasible.length, 0);
      original[orientation + "_" + qA + "_" + qB] = {
        placements: result.placements, maskTests: result.maskTests,
        doubleZeroDistribution: result.doubleZeroDistribution,
        feasibleBranches: result.feasible.length
      };
    }
  }
  assert.equal(original.reverse_8_13.maskTests, 47);
  assert.equal(original.reverse_13_8.maskTests, 47);
  assert.equal(original.forward_8_13.maskTests, 53);
  assert.equal(original.forward_13_8.maskTests, 53);

  const random = makeRng(0x2658c33), positive = [];
  for (const [section, qA, qB, offset] of [
    ["0_welcome", 8, 13, 11], ["0_koan_1", 13, 8, 29]
  ]) {
    const window = bestWindow(nativeRunes(section, corpus, donor));
    const plant = makePositivePlant(window.values, qA, qB, offset, random);
    const reverse = scan(plant.A, plant.B, qA, qB, "reverse");
    const forward = scan(plant.A, plant.B, qA, qB, "forward");
    const trueHolds = window.values.map((x, i) => x === 0 ? i : -1).filter(i => i >= 0);
    const trueHit = reverse.feasible.find(h =>
      h.offset === offset && sameArray(h.holds, trueHolds));
    assert.ok(trueHit, "true reversed native plant was not retained");
    assert.equal(forward.feasible.length, 0);
    const check = checkPositivePlant(plant, qA, qB, trueHit.solution);
    const offsets = [...new Set(reverse.feasible.map(h => h.offset))];
    assert.deepEqual(offsets, [offset]);
    positive.push({
      donorSection: section, sourceWindowStart: window.start,
      sourceFCount: window.fCount, qA, qB, plantedOffset: offset,
      trueFHoldPositions: check.holds,
      forcedConsumingDoubleZeroPosition: plant.forcedIndex,
      truePlacementRetained: true,
      branchesAtTrueOffset: reverse.feasible.filter(h => h.offset === offset).length,
      otherFeasibleOffsets: offsets.filter(x => x !== offset),
      keyComponents: check.componentCount, absoluteRootChoices: check.rootChoices,
      plantedKeyClassIncluded: true, forwardBaselineBranches: forward.feasible.length
    });
  }

  const negative = [];
  for (const [sectionA, sectionB, qA, qB] of [
    ["0_koan_1", "0_loss_of_divinity", 8, 13],
    ["0_welcome", "jpg107-167", 13, 8]
  ]) {
    const plainA = nativeRunes(sectionA, corpus, donor).slice(0, 121);
    const windowB = bestWindow(nativeRunes(sectionB, corpus, donor));
    const plainB = windowB.values;
    const keyA = Array.from({ length: qA }, () => random() % MOD);
    const keyB = Array.from({ length: qB }, () => random() % MOD);
    const cipherA = encrypt(plainA, keyA, qA, random() % qA);
    const cipherB = encrypt(plainB.slice().reverse(), keyB, qB, random() % qB);
    const result = scan(cipherA, cipherB, qA, qB, "reverse");
    assert.equal(result.feasible.length, 0);
    negative.push({
      unrelatedSections: [sectionA, sectionB],
      secondWindowStart: windowB.start, qA, qB,
      feasibleBranches: result.feasible.length
    });
  }

  const output = {
    schema: "lp2-p32-p55-reverse-period-key-gate-v1",
    sourceLengths: { p32: p32.length, p55: p55.length },
    original, positive, unrelatedNativeNegatives: negative,
    smallField: smallFieldChecks()
  };
  console.log(JSON.stringify(output, null, 2));
  return output;
}

if (require.main === module) run();
module.exports = { inverse, scan, run };
