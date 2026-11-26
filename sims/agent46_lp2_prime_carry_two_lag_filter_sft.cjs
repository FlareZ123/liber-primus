'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const GP = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const SOL = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const M = 29;
const F = 0;
const mod = x => (x % M + M) % M;
assert.deepEqual(GP.runes, SOL.runes, 'source rune alphabets must match');

function primes(n) {
  const out = [];
  for (let x = 2; out.length < n; x++) {
    let ok = true;
    for (const p of out) {
      if (p * p > x) break;
      if (x % p === 0) { ok = false; break; }
    }
    if (ok) out.push(x);
  }
  return out;
}
const CLOCK = primes(5000).map(p => (p - 1) % M);
assert.equal(CLOCK[0], 1, 'prime-minus-one clock must start at 2-1');

const runeIndex = new Map(GP.runes.map((r, i) => [r, i]));
function gpText(s) {
  return Array.from(s).filter(ch => runeIndex.has(ch)).map(ch => runeIndex.get(ch));
}
const tokens = GP.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
function nativeEnglish(raw) {
  const out = [];
  for (let w of (raw.toUpperCase().match(/[A-Z]+/g) || [])) {
    w = w.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S')
      .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
    for (let i = 0; i < w.length;) {
      const t = tokens.find(x => w.startsWith(x.s, i));
      if (!t) throw new Error('Unmapped source text at ' + w.slice(i));
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}
function prefixBoundary(raw, limit) {
  const x = raw.lastIndexOf(' ', limit);
  return x > 0 ? x : limit;
}
function buildUnigram(sequences) {
  const counts = new Float64Array(M).fill(0.5);
  let total = 0;
  for (const seq of sequences) for (const x of seq) { counts[x]++; total++; }
  const denom = total + 0.5 * M;
  return Float64Array.from(counts, x => Math.log(x / denom));
}
function stats(c) {
  const hist = new Uint32Array(M);
  let repeats = 0;
  for (let i = 0; i < c.length; i++) {
    hist[c[i]]++;
    if (i && c[i] === c[i - 1]) repeats++;
  }
  const numerator = hist.reduce((s, n) => s + n * (n - 1), 0);
  const ioc = numerator / (c.length * (c.length - 1));
  return { n: c.length, repeats, ioc, zeros: hist[0], maxBin: Math.max(...hist) };
}
function encode(plain, a, b) {
  const c = new Uint8Array(plain.length);
  let j = 0;
  for (let i = 0; i < plain.length; i++) {
    const p = plain[i];
    if (p === F) { c[i] = F; continue; }
    const c1 = i ? c[i - 1] : 0;
    const c2 = i > 1 ? c[i - 2] : 0;
    c[i] = mod(p + a * c1 + b * c2 + CLOCK[j]);
    j++;
  }
  return { c: Array.from(c), consumed: j };
}

/*
 * Exact inverse for:
 *   C_i = P_i + a*C_(i-1) + b*C_(i-2) + (prime_j - 1) mod 29
 * when P_i != F; plaintext F is emitted literally and does not advance j.
 * h is the number of F holds before position i, so j = i - h.
 * The only state uncertainty is the exact F-hold/consume ambiguity at C_i=F.
 * Initial ciphertext registers are fixed to zero; there are no page resets,
 * fitted clock offsets, scale factors, or extra secret state.
 */
function unigramDP(c, a, b, logp, lo, hi, initialH = 0, trace = false) {
  let zeroCount = 0;
  for (let i = lo; i < hi; i++) if (c[i] === F) zeroCount++;
  const maxH = initialH + zeroCount;
  const width = maxH + 1;
  let cur = new Float64Array(width);
  let next = new Float64Array(width);
  cur.fill(-Infinity);
  cur[initialH] = 0;
  let hMax = initialH;
  const parent = trace ? new Int32Array((hi - lo) * width).fill(-1) : null;
  const op = trace ? new Uint8Array((hi - lo) * width) : null;

  for (let i = lo; i < hi; i++) {
    next.fill(-Infinity);
    const c1 = i ? c[i - 1] : 0;
    const c2 = i > 1 ? c[i - 2] : 0;
    const feedback = mod(a * c1 + b * c2);
    for (let h = initialH; h <= hMax; h++) {
      const old = cur[h];
      if (!Number.isFinite(old)) continue;
      const j = i - h;
      if (j < 0 || j >= CLOCK.length) continue;
      const p = mod(c[i] - feedback - CLOCK[j]);
      if (c[i] === F) {
        const nh = h + 1;
        const value = old + logp[F];
        if (value > next[nh]) {
          next[nh] = value;
          if (trace) {
            const k = (i - lo) * width + nh;
            parent[k] = h;
            op[k] = 0;
          }
        }
      }
      if (p !== F) {
        const value = old + logp[p];
        if (value > next[h]) {
          next[h] = value;
          if (trace) {
            const k = (i - lo) * width + h;
            parent[k] = h;
            op[k] = 1;
          }
        }
      }
    }
    if (c[i] === F) hMax++;
    const tmp = cur; cur = next; next = tmp;
  }

  let bestH = -1, bestScore = -Infinity;
  for (let h = initialH; h <= hMax; h++) {
    if (cur[h] > bestScore) { bestScore = cur[h]; bestH = h; }
  }
  if (bestH < 0 || !Number.isFinite(bestScore)) return null;
  if (!trace) return { score: bestScore, finalH: bestH };

  const plain = new Uint8Array(hi - lo);
  let h = bestH;
  for (let i = hi - 1; i >= lo; i--) {
    const k = (i - lo) * width + h;
    const ph = parent[k];
    if (ph < 0) throw new Error('broken Viterbi backpointer');
    if (op[k] === 0) {
      plain[i - lo] = F;
    } else {
      const j = i - ph;
      const c1 = i ? c[i - 1] : 0;
      const c2 = i > 1 ? c[i - 2] : 0;
      plain[i - lo] = mod(c[i] - mod(a * c1 + b * c2) - CLOCK[j]);
    }
    h = ph;
  }
  return { score: bestScore, finalH: bestH, plain: Array.from(plain) };
}
function rankKeys(c, split, logp) {
  const out = [];
  for (let a = 0; a < M; a++) for (let b = 1; b < M; b++) {
    const r = unigramDP(c, a, b, logp, 0, split, 0, false);
    out.push({ a, b, score: r ? r.score : -Infinity, holds: r ? r.finalH : null });
  }
  out.sort((x, y) => y.score - x.score);
  return out;
}
function decodeFrozen(c, a, b, split, logp) {
  const train = unigramDP(c, a, b, logp, 0, split, 0, true);
  if (!train) return null;
  const held = unigramDP(c, a, b, logp, split, c.length, train.finalH, true);
  if (!held) return null;
  const plain = train.plain.concat(held.plain);
  const replay = encode(plain, a, b).c;
  return {
    plain, train, held, replay: replay.every((x, i) => x === c[i]),
    trainMean: train.score / split,
    heldMean: held.score / (c.length - split),
    holds: held.finalH,
    consumed: c.length - held.finalH
  };
}
function sampleSd(xs) {
  const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
  const variance = xs.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, xs.length - 1);
  return { mean, sd: Math.sqrt(variance) };
}

function run() {
  const N = 3008;
  const SPLIT = 1500;
  const lp1 = SOL.sections.filter(s => !s.name.startsWith('p56') && !s.name.startsWith('p57'))
    .map(s => gpText(s.source_text));
  const shRaw = read('resources/control/shakespeare_first300k.txt');
  const giRaw = read('resources/control/gibran_prophet_58585.txt');
  const emRaw = read('resources/control/emerson_essays_2944.txt');
  const shCut = prefixBoundary(shRaw, 180000);
  const giCut = prefixBoundary(giRaw, 20000);
  const emCut = prefixBoundary(emRaw, 20000);
  const sh = nativeEnglish(shRaw), gi = nativeEnglish(giRaw), em = nativeEnglish(emRaw);
  const shTrainN = nativeEnglish(shRaw.slice(0, shCut)).length;
  const giTrainN = nativeEnglish(giRaw.slice(0, giCut)).length;
  const emTrainN = nativeEnglish(emRaw.slice(0, emCut)).length;
  const logp = buildUnigram([
    ...lp1,
    nativeEnglish(shRaw.slice(0, shCut)),
    nativeEnglish(giRaw.slice(0, giCut)),
    nativeEnglish(emRaw.slice(0, emCut))
  ]);

  const sources = [
    { name: 'Shakespeare', seq: sh, start: shTrainN, key: [7, 11] },
    { name: 'Gibran', seq: gi, start: giTrainN, key: [13, 5] },
    { name: 'Emerson', seq: em, start: emTrainN, key: [19, 8] }
  ];
  const plants = [];
  for (const s of sources) {
    const plain = s.seq.slice(s.start, s.start + N);
    assert.equal(plain.length, N, s.name + ' plant length');
    const planted = encode(plain, s.key[0], s.key[1]);
    const ranked = rankKeys(planted.c, SPLIT, logp);
    const rank = ranked.findIndex(x => x.a === s.key[0] && x.b === s.key[1]) + 1;
    const frozen = decodeFrozen(planted.c, s.key[0], s.key[1], SPLIT, logp);
    const exact = frozen && frozen.plain.filter((x, i) => x === plain[i]).length;
    plants.push({
      name: s.name, trueKey: s.key, trueKeyTrainingRank: rank,
      bestTrainingKey: [ranked[0].a, ranked[0].b],
      trainingCandidates: ranked.filter(x => Number.isFinite(x.score)).length,
      decodedExact: exact, total: N,
      trainExact: frozen ? frozen.plain.slice(0, SPLIT).filter((x, i) => x === plain[i]).length : 0,
      heldExact: frozen ? frozen.plain.slice(SPLIT).filter((x, i) => x === plain[SPLIT + i]).length : 0,
      forwardReplay: !!frozen?.replay,
      trainScorePerRune: frozen?.trainMean ?? null,
      heldScorePerRune: frozen?.heldMean ?? null
    });
  }

  const targetPages = GP.pages.filter(p => p.page >= 40 && p.page <= 53);
  const target = targetPages.flatMap(p => p.indices);
  assert.equal(target.length, N, 'p40-p53 original continuous rune tape');
  const targetStats = stats(target);

  const featureWindows = [];
  for (const s of sources) {
    for (const offset of [4000, 8000, 12000]) {
      const w = s.seq.slice(s.start + offset, s.start + offset + N);
      assert.equal(w.length, N, s.name + ' feature window ' + offset);
      featureWindows.push({ name: s.name + '+' + offset, plain: w });
    }
  }
  const featureRows = [];
  for (let a = 0; a < M; a++) for (let b = 1; b < M; b++) {
    const rs = [], is = [];
    for (const w of featureWindows) {
      const c = encode(w.plain, a, b).c;
      const z = stats(c);
      rs.push(z.repeats);
      is.push(z.ioc);
    }
    const R = sampleSd(rs), I = sampleSd(is);
    const zR = R.sd ? Math.abs(targetStats.repeats - R.mean) / R.sd : Infinity;
    const zI = I.sd ? Math.abs(targetStats.ioc - I.mean) / I.sd : Infinity;
    featureRows.push({ a, b, meanRepeats: R.mean, sdRepeats: R.sd,
      meanIoc: I.mean, sdIoc: I.sd, zRepeat: zR, zIoc: zI, maxZ: Math.max(zR, zI) });
  }
  featureRows.sort((x, y) => x.maxZ - y.maxZ);
  const featurePass = featureRows.filter(x => x.zRepeat <= 3 && x.zIoc <= 3);

  let original = {
    n: target.length, split: SPLIT, stats: targetStats,
    models: M * (M - 1), nonzeroSecondLag: true,
    initialization: 'two prior ciphertext registers are zero at p40 chapter start',
    clock: 'r_j=(prime_j-1) mod29, prime_0=2; one continuous clock, plaintext F holds'
  };
  if (featurePass.length) {
    const ranked = rankKeys(target, SPLIT, logp);
    const best = ranked[0];
    const decoded = decodeFrozen(target, best.a, best.b, SPLIT, logp);
    original = {
      ...original,
      featureGate: {
        independentWindows: featureWindows.length,
        threeSigmaPasses: featurePass.length,
        closest: featureRows[0],
        passingKeys: featurePass.slice(0, 12).map(x => [x.a, x.b])
      },
      topKeys: ranked.slice(0, 12).map(x => ({
        a: x.a, b: x.b, trainScorePerRune: x.score / SPLIT, holds: x.holds
      })),
      selectedKey: [best.a, best.b],
      legalTrainingKeys: ranked.filter(x => Number.isFinite(x.score)).length,
      prospective: decoded ? {
        trainScorePerRune: decoded.trainMean,
        heldScorePerRune: decoded.heldMean,
        trainingHolds: decoded.train.finalH,
        finalHolds: decoded.holds,
        heldoutNewHolds: decoded.holds - decoded.train.finalH,
        forwardReplay: decoded.replay,
        decodedExactKnown: null,
        trainingPreview: decoded.plain.slice(0, 180).map(x => GP.translit[x]).join(''),
        heldoutPreview: decoded.plain.slice(SPLIT, SPLIT + 220).map(x => GP.translit[x]).join(''),
        plaintextIoc: stats(decoded.plain).ioc,
        plaintextRepeats: stats(decoded.plain).repeats
      } : null
    };
  } else {
    original.featureGate = {
      independentWindows: featureWindows.length,
      threeSigmaPasses: 0,
      closest: featureRows[0],
      passingKeys: []
    };
    original.decision = 'The source-clocked two-lag family fails the preregistered joint repeat/IoC native-control gate; no original key fit was run.';
  }

  const p56Plain = gpText(SOL.sections.find(s => s.name === 'p56_an_end').source_text);
  const p56Cipher = GP.pages.find(p => p.page === 56).indices;
  const p56Replay = encode(p56Plain, 0, 0);
  assert.deepEqual(p56Replay.c, p56Cipher, 'a=b=0 must reproduce authentic p56 prime/F control');

  return {
    model: 'C_i=P_i+a*C_(i-1)+b*C_(i-2)+(prime_j-1) mod29; P_i=F emits C_i=F and holds j',
    search: 'a=0..28, b=1..28; 812 keys; fixed clock origin 0; no page resets or fitted clock transforms',
    priorArtReduction: [
      'ordinary ciphertext-only lag-2 affine inverse is the same law with the prime input removed',
      'second-order key recurrence evolves K from K states and is not ciphertext-visible',
      'p56 authentic prime/F receiver is the a=b=0 special case'
    ],
    p56Control: {
      runes: p56Plain.length, plaintextFHolds: p56Plain.filter(x => x === F).length,
      exactCipherReplay: true, consumedPrimeSteps: p56Replay.consumed
    },
    languageModel: {
      source: 'LP1 solved GP29 sections plus disjoint prefixes of pinned Shakespeare, Gibran and Emerson',
      runeCounts: { lp1: lp1.reduce((s, x) => s + x.length, 0),
        shakespeareTrain: shTrainN, gibranTrain: giTrainN, emersonTrain: emTrainN }
    },
    hiddenNativePlants: plants,
    original
  };
}
const result = run();
const rendered = JSON.stringify(result, null, 2);
console.log(rendered);
if (process.env.RUNNER_TEMP) fs.writeFileSync(path.join(process.env.RUNNER_TEMP, 'source-test-output.json'), rendered + '\n');
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    '### Agent46 source-clocked two-lag filter\n\n```json\n' + rendered + '\n```\n');
}
