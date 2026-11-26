'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const paths = [
  'resources/liber-primus/lp2-corpus.json',
  'resources/external/2013-book-of-law-I.txt',
  'resources/external/2013-book-of-law-II.txt',
  'resources/external/2013-book-of-law-III.txt',
  'resources/external/cicada2012-blake-marriage-gutenberg45315.txt'
];
const check = (ok, message) => { if (!ok) throw new Error(message); };
const inputs = paths.map(p => fs.readFileSync(path.join(root, p), 'utf8'));
const corpus = JSON.parse(inputs[0]);
const source = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
check(source.length === 12956, 'physical p0-p55 source length');
check(corpus.translit[0] === 'F', 'GP29 index zero must be F');
const tokens = corpus.translit.map((t, i) => [t, i]).sort((a, b) => b[0].length - a[0].length);
function gp(s) {
  s = s.toUpperCase().replaceAll('V', 'U').replaceAll('K', 'C');
  const out = [];
  for (let i = 0; i < s.length;) {
    const t = tokens.find(x => s.startsWith(x[0], i));
    if (t) { out.push(t[1]); i += t[0].length; } else i++;
  }
  return out;
}
const crowley = gp(inputs.slice(1, 4).join('\n'));
const blakeText = inputs[4];
const blake = gp(blakeText.slice(blakeText.indexOf('THE ARGUMENT'), blakeText.indexOf('*** END OF THIS PROJECT GUTENBERG EBOOK')));
check(crowley.length === 21611 && blake.length === 18631, 'pinned donor corpus lengths');
const N = source.length;
const donors = [
  { name: 'Crowley-0', tape: crowley.slice(0, N) },
  { name: 'Crowley-4327', tape: crowley.slice(4327, 4327 + N) },
  { name: 'Crowley-8655', tape: crowley.slice(8655, 8655 + N) },
  { name: 'Blake-0', tape: blake.slice(0, N) },
  { name: 'Blake-5675', tape: blake.slice(5675, 5675 + N) }
];
check(donors.every(d => d.tape.length === N), 'all donor windows must match original length');
function permutations(xs) {
  return xs.length ? xs.flatMap((v, i) => permutations(xs.filter((_, j) => j !== i)).map(p => [v, ...p])) : [[]];
}
const orders = permutations([0, 1, 2, 3]);
function permute(x, p, spans, origin = 0) {
  const out = x.slice();
  for (const [s, e] of spans) {
    for (let i = s + origin; i + 3 < e; i += 4) {
      for (let j = 0; j < 4; j++) out[i + p[j]] = x[i + j];
    }
  }
  return out;
}
function lagPair(P, C, spans) {
  const maxSpan = Math.max(...spans.map(([s, e]) => e - s));
  const pLag = new Uint32Array(maxSpan);
  const cLag = new Uint32Array(maxSpan);
  let fCount = 0, fMismatch = 0, firstMismatch = null, consumed = 0;
  for (const [s, e] of spans) {
    const byP = Array.from({ length: 29 }, () => []);
    const byC = Array.from({ length: 29 }, () => []);
    let compact = 0;
    for (let i = s; i < e; i++) {
      if (P[i] === 0) {
        fCount++;
        if (C[i] !== 0) {
          fMismatch++;
          if (!firstMismatch) firstMismatch = { position: i, cipher: C[i] };
        }
      } else {
        byP[P[i]].push(compact);
        byC[C[i]].push(compact);
        compact++;
        consumed++;
      }
    }
    for (let v = 0; v < 29; v++) {
      const pp = byP[v], cp = byC[v];
      for (let j = 0; j < pp.length; j++) for (let k = 0; k < j; k++) pLag[pp[j] - pp[k]]++;
      for (let j = 0; j < cp.length; j++) for (let k = 0; k < j; k++) cLag[cp[j] - cp[k]]++;
    }
  }
  return { pLag, cLag, fCount, fMismatch, firstMismatch, consumed };
}
function collisionSummary(pLag, cLag, maxQ) {
  let minGap = Infinity, worstQ = null, failures = 0, informative = 0, passingInformative = 0, firstFailure = null;
  for (let q = 1; q <= maxQ; q++) {
    let mp = 0, mc = 0;
    for (let d = q; d < pLag.length; d += q) { mp += pLag[d]; mc += cLag[d]; }
    const gap = mc - mp;
    if (mp > 0) { informative++; if (gap >= 0) passingInformative++; }
    if (gap < 0) {
      failures++;
      if (!firstFailure) firstFailure = { q, plaintextPairs: mp, ciphertextPairs: mc, deficit: -gap };
    }
    if (gap < minGap) { minGap = gap; worstQ = q; }
  }
  return { minGap, worstQ, failures, informative, passingInformative, firstFailure };
}
const chapterCuts = [0, 729, 1874, 3603, 5506, 6761, 7960, 9640, 12648, 12956];
const regimes = [
  { name: 'global-consuming-register', spans: [[0, N]], maxQ: 3301 },
  { name: 'nine-chapter-reset-register', spans: chapterCuts.slice(1).map((e, i) => [chapterCuts[i], e]), maxQ: 1033 }
];
const originalResults = [];
for (const regime of regimes) {
  const donorResults = [];
  const survivors = [];
  for (const donor of donors) {
    const orderResults = [];
    for (const p of orders) {
      const P = permute(donor.tape, p, regime.spans, 0);
      const h = lagPair(P, source, regime.spans);
      let result;
      if (h.fMismatch > 0) {
        result = { p, fCount: h.fCount, fMismatch: h.fMismatch, firstMismatch: h.firstMismatch, collision: null, feasible: false };
      } else {
        const collision = collisionSummary(h.pLag, h.cLag, regime.maxQ);
        const feasible = collision.failures === 0;
        result = { p, fCount: h.fCount, fMismatch: 0, collision, feasible };
        if (feasible) survivors.push({ donor: donor.name, p, fCount: h.fCount, collision });
      }
      orderResults.push(result);
    }
    const fMin = Math.min(...orderResults.map(x => x.fMismatch));
    const fCompatible = orderResults.filter(x => x.fMismatch === 0);
    const best = orderResults.filter(x => x.fMismatch === fMin).slice(0, 3);
    donorResults.push({
      donor: donor.name,
      compatibleOrders: fCompatible.length,
      minimumFPositionMismatches: fMin,
      closestOrders: best.map(x => ({
        p: x.p,
        fMismatch: x.fMismatch,
        firstMismatch: x.firstMismatch,
        collision: x.collision
      })),
      compatibleOrderResults: fCompatible.map(x => ({ p: x.p, feasible: x.feasible, collision: x.collision }))
    });
  }
  originalResults.push({ regime: regime.name, maxQ: regime.maxQ, donors: donorResults, survivors });
}
function encrypt(P, p, key, origin = 0, startPhase = 0) {
  const pp = permute(P, p, [[0, P.length]], origin);
  const C = new Array(pp.length);
  let phase = startPhase % key.length;
  let consumed = 0;
  for (let i = 0; i < pp.length; i++) {
    if (pp[i] === 0) C[i] = 0;
    else { C[i] = (pp[i] + key[phase]) % 29; phase = (phase + 1) % key.length; consumed++; }
  }
  return { C, consumed, endPhase: phase };
}
function solveKnown(P, C, origin, maxQ = 20) {
  const solutions = [];
  for (const p of orders) {
    const pp = permute(P, p, [[0, P.length]], origin);
    for (let q = 1; q <= maxQ; q++) {
      const key = new Array(q).fill(-1);
      let phase = 0, ok = true;
      for (let i = 0; i < pp.length; i++) {
        if (pp[i] === 0) { if (C[i] !== 0) { ok = false; break; } }
        else {
          const shift = (C[i] - pp[i] + 29) % 29;
          if (key[phase] === -1) key[phase] = shift;
          else if (key[phase] !== shift) { ok = false; break; }
          phase = (phase + 1) % q;
        }
      }
      if (ok && key.every(x => x >= 0)) solutions.push({ p, q, key });
    }
  }
  return solutions;
}
function same(a, b) { return a.length === b.length && a.every((x, i) => x === b[i]); }
const train = donors[0].tape.slice(0, 728);
const holdout = donors[1].tape.slice(728, 728 + 1144);
check(train.length === 728 && holdout.length === 1144, 'control split');
const plants = [
  { q: 7, p: [2, 0, 3, 1], key: [1, 12, 7, 19, 4, 25, 11] },
  { q: 8, p: [1, 3, 0, 2], key: [3, 17, 8, 21, 4, 12, 25, 6] },
  { q: 13, p: [3, 1, 2, 0], key: [4, 17, 8, 21, 5, 12, 25, 6, 19, 2, 15, 9, 24] }
];
const calibration = [];
for (const plant of plants) {
  const ct = encrypt(train, plant.p, plant.key, 0, 0).C;
  const ch = encrypt(holdout, plant.p, plant.key, 0, 0).C;
  const found = solveKnown(train, ct, 0, 20);
  check(found.length > 0, 'plant q=' + plant.q + ': solver must find a solution');
  const minQ = Math.min(...found.map(x => x.q));
  const minimal = found.filter(x => x.q === minQ);
  check(minimal.length === 1, 'plant q=' + plant.q + ': minimal solution must be unique');
  const winner = minimal[0];
  check(winner.q === plant.q && same(winner.p, plant.p) && same(winner.key, plant.key), 'plant q=' + plant.q + ': recover exact hidden order/key');
  const predicted = encrypt(holdout, winner.p, winner.key, 0, 0).C;
  check(same(predicted, ch), 'plant q=' + plant.q + ': exact withheld F-hold continuation');
  const wrongRegisters = [];
  for (let origin = 1; origin <= 3; origin++) {
    const wrong = solveKnown(train, ct, origin, 20);
    const wrongMinQ = wrong.length ? Math.min(...wrong.map(x => x.q)) : null;
    const wrongMin = wrong.filter(x => x.q === wrongMinQ);
    const wrongHoldoutPredictions = wrongMin.filter(x => same(encrypt(holdout, x.p, x.key, origin, 0).C, ch)).length;
    wrongRegisters.push({
      testedOrigin: origin,
      trainingSolutions: wrong.length,
      minimalPeriod: wrongMinQ,
      minimalSolutions: wrongMin.length,
      exactHoldoutPredictions: wrongHoldoutPredictions
    });
  }
  calibration.push({
    trueOrigin: 0,
    q: plant.q,
    trueOrder: plant.p,
    recoveredOrder: winner.p,
    recoveredKey: winner.key,
    trainingRunes: train.length,
    withheldRunes: holdout.length,
    withheldExact: true,
    wrongRegisters
  });
}
const summary = {
  source: {
    physicalPages: 'p0-p55',
    runes: N,
    ciphertextFCount: source.filter(x => x === 0).length,
    chapterCuts: chapterCuts.length - 1,
    donors: donors.map(d => ({ name: d.name, runes: d.tape.length, plaintextFCount: d.tape.filter(x => x === 0).length }))
  },
  model: 'common within-four-position permutation before GP29 additive encryption; plaintext F emits F and does not consume; arbitrary deterministic phase maps; no word-boundary or language score',
  invariant: 'For each segment and each q, compact away plaintext-F holds. If equal plaintext runes share a consuming phase, their ciphertext runes must be equal; therefore M_cipher(q) >= M_plain(q). The candidate F positions must also be a subset of visible ciphertext-F positions.',
  calibration,
  originalResults
};
console.log(JSON.stringify(summary, null, 2));
