'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const readText = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const readJson = p => JSON.parse(readText(p));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const mod = x => (x % 29 + 29) % 29;
const blobSha1 = value => {
  const b = Buffer.isBuffer(value) ? value : Buffer.from(value, 'utf8');
  return crypto.createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex');
};

const corpusText = readText('resources/liber-primus/lp2-corpus.json');
const relikdText = readText('resources/external/relikd-solved-gp29-native-v1.json');
const wulficText = readText('resources/transcriptions/lp1_wulfic_canonical.txt');
const freqText = readText('resources/control/english_wordfreq_textblob.txt');
const gp = JSON.parse(corpusText);
const relikd = JSON.parse(relikdText);
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const extractRunes = s => Array.from(s).filter(ch => runeIndex.has(ch)).map(ch => runeIndex.get(ch));
const renderTokens = a => a.map(x => gp.translit[x]).join(' ');
const renderRunes = a => a.map(x => gp.runes[x]).join('');

const page54 = gp.pages.find(p => p.page === 54);
const page55 = gp.pages.find(p => p.page === 55);
assert(page54 && page55, 'missing original p54/p55 records');
assert(page54.indices.length === 232 && page55.indices.length === 76, 'unexpected p54/p55 source lengths');
const headingRunes = 19;
const p54 = page54.indices.slice(headingRunes);
const p55 = page55.indices.slice();
assert(p54.length === 213, 'p54 black-body fit must be 213 runes after its 19-rune heading');

const K8 = [23, 10, 1, 10, 9, 10, 16, 26];       // DIUINITY
const K13 = [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18]; // FIRFUMFERENFE

function encodeWord(word) {
  let s = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S');
  const tokens = gp.translit.map((text, index) => ({ text, index }))
    .sort((a, b) => b.text.length - a.text.length);
  const out = [];
  while (s.length) {
    if (s.startsWith('ING')) { out.push(21); s = s.slice(3); continue; }
    if (s.startsWith('IO')) { out.push(27); s = s.slice(2); continue; }
    const t = tokens.find(x => s.startsWith(x.text));
    if (!t) return [];
    out.push(t.index);
    s = s.slice(t.text.length);
  }
  return out;
}

function buildTrigramModel(text) {
  const u = new Float64Array(29); u.fill(1);
  const b = new Float64Array(30 * 29);
  const t = new Float64Array(30 * 30 * 29);
  const first = new Float64Array(29);
  const last = new Float64Array(29);
  const single = new Float64Array(29);
  const prefix = new Float64Array(29 * 29);
  const suffix = new Float64Array(29 * 29);
  let W = 0, rows = 0;
  for (const line of text.split(/\r?\n/)) {
    const m = /^([a-z]+) (\d+)$/.exec(line);
    if (!m) continue;
    const a = encodeWord(m[1]);
    const weight = Number(m[2]);
    if (!a.length || !Number.isSafeInteger(weight)) continue;
    W += weight; rows++;
    first[a[0]] += weight;
    last[a[a.length - 1]] += weight;
    for (const x of a) u[x] += weight;
    for (let i = 0; i + 1 < a.length; i++) b[a[i] * 29 + a[i + 1]] += weight;
    for (let i = 0; i + 2 < a.length; i++) t[(a[i] * 30 + a[i + 1]) * 29 + a[i + 2]] += weight;
    if (a.length === 1) single[a[0]] += weight;
    else {
      prefix[a[0] * 29 + a[1]] += weight;
      suffix[a[a.length - 2] * 29 + a[a.length - 1]] += weight;
    }
  }
  assert(rows === 29157 && W === 1105285, 'TextBlob frequency corpus cardinality changed');
  for (let x = 0; x < 29; x++) {
    for (let y = 0; y < 29; y++) b[x * 29 + y] += last[x] * first[y] / W;
  }
  for (let y = 0; y < 29; y++) b[29 * 29 + y] = first[y];
  for (let x = 0; x < 29; x++) {
    for (let y = 0; y < 29; y++) {
      for (let z = 0; z < 29; z++) {
        const i = (x * 30 + y) * 29 + z;
        t[i] += suffix[x * 29 + y] * first[z] / W
          + last[x] * prefix[y * 29 + z] / W
          + last[x] * single[y] * first[z] / (W * W);
      }
    }
  }
  let uSum = 0;
  for (const x of u) uSum += x;
  const p1 = new Float64Array(29);
  for (let x = 0; x < 29; x++) p1[x] = u[x] / uSum;
  const p2 = new Float64Array(30 * 29);
  for (let x = 0; x < 30; x++) {
    let sum = 0;
    for (let y = 0; y < 29; y++) sum += b[x * 29 + y];
    for (let y = 0; y < 29; y++) p2[x * 29 + y] = (b[x * 29 + y] + 20 * p1[y]) / (sum + 20);
  }
  const logp = new Float32Array(30 * 30 * 29);
  for (let x = 0; x < 30; x++) {
    for (let y = 0; y < 30; y++) {
      let sum = 0;
      for (let z = 0; z < 29; z++) sum += t[(x * 30 + y) * 29 + z];
      for (let z = 0; z < 29; z++) {
        const i = (x * 30 + y) * 29 + z;
        logp[i] = Math.fround(Math.log((t[i] + 20 * p2[y * 29 + z]) / (sum + 20)));
      }
    }
  }
  return {
    logp,
    rows,
    wordWeight: W,
    sha256: crypto.createHash('sha256').update(Buffer.from(logp.buffer)).digest('hex')
  };
}

function makeTransitions(order) {
  const q1 = order.k1.length, q2 = order.k2.length;
  const trans = Array.from({ length: 29 }, () => Array.from({ length: q1 * q2 }, () => []));
  for (let c = 0; c < 29; c++) {
    for (let pair = 0; pair < q1 * q2; pair++) {
      const p1 = Math.floor(pair / q2), p2 = pair % q2;
      const out = trans[c][pair];
      const push = (p, n1, n2) => out.push({ p, nextPair: n1 * q2 + n2 });
      if (c === 0) {
        // Both layers hold: P=F, intermediate=F, final=F.
        push(0, p1, p2);
        // Second layer holds; first layer consumes a non-F plaintext to F.
        const pFirst = mod(-order.k1[p1]);
        if (pFirst !== 0) push(pFirst, (p1 + 1) % q1, p2);
        // Second layer consumes to F; first layer must also consume.
        const mid = mod(-order.k2[p2]);
        if (mid !== 0) {
          const p = mod(mid - order.k1[p1]);
          if (p !== 0) push(p, (p1 + 1) % q1, (p2 + 1) % q2);
        }
      } else {
        // A non-F final symbol forces both layers to consume.
        const mid = mod(c - order.k2[p2]);
        if (mid !== 0) {
          const p = mod(mid - order.k1[p1]);
          if (p !== 0) push(p, (p1 + 1) % q1, (p2 + 1) % q2);
        }
      }
    }
  }
  return trans;
}

function phaseState(p1, p2, prev2, prev1, q2) {
  return (p1 * q2 + p2) * 900 + prev2 * 30 + prev1;
}
function unpackState(s, q2) {
  const pair = Math.floor(s / 900);
  const h = s % 900;
  return {
    phase1: Math.floor(pair / q2),
    phase2: pair % q2,
    prev2: Math.floor(h / 30),
    prev1: h % 30
  };
}

function viterbi(cipher, order, logp, initialStates, trace) {
  const q1 = order.k1.length, q2 = order.k2.length;
  const N = q1 * q2 * 900;
  const transitions = makeTransitions(order);
  let score = new Float64Array(N);
  score.fill(-Infinity);
  let active = [];
  for (const s of initialStates) {
    if (score[s] === -Infinity) { score[s] = 0; active.push(s); }
  }
  const back = trace ? new Array(cipher.length) : null;
  const emit = trace ? new Array(cipher.length) : null;
  let maxActive = active.length;
  let transitionCount = 0;
  for (let t = 0; t < cipher.length; t++) {
    const priorActiveStates = active.length;
    const next = new Float64Array(N);
    next.fill(-Infinity);
    const nextActive = [];
    const bp = trace ? new Int32Array(N) : null;
    const ep = trace ? new Uint8Array(N) : null;
    if (trace) bp.fill(-1);
    const c = cipher[t];
    for (const s of active) {
      const cur = score[s];
      const pair = Math.floor(s / 900);
      const h = s % 900;
      const prev2 = Math.floor(h / 30);
      const prev1 = h % 30;
      const opts = transitions[c][pair];
      for (const o of opts) {
        transitionCount++;
        const ns = o.nextPair * 900 + prev1 * 30 + o.p;
        const candidate = cur + logp[(prev2 * 30 + prev1) * 29 + o.p];
        const old = next[ns];
        if (old === -Infinity) nextActive.push(ns);
        if (candidate > old) {
          next[ns] = candidate;
          if (trace) { bp[ns] = s; ep[ns] = o.p; }
        }
      }
    }
    score = next;
    active = nextActive;
    if (active.length > maxActive) maxActive = active.length;
    if (trace) { back[t] = bp; emit[t] = ep; }
    if (active.length === 0) return { feasible: false, noPathAt: t, priorActiveStates, maxActive, finalActive: 0, transitionCount };
  }
  let bestState = -1, bestScore = -Infinity;
  for (const s of active) {
    if (score[s] > bestScore) { bestScore = score[s]; bestState = s; }
  }
  let plain = null, initialState = null;
  if (trace) {
    plain = new Uint8Array(cipher.length);
    let s = bestState;
    for (let t = cipher.length - 1; t >= 0; t--) {
      plain[t] = emit[t][s];
      s = back[t][s];
      assert(s >= 0, 'broken Viterbi backpointer');
    }
    initialState = s;
  }
  return { feasible: true, bestScore, bestState, plain, initialState, maxActive, finalActive: active.length, transitionCount };
}

function forward(plain, order, phase1, phase2) {
  const q1 = order.k1.length, q2 = order.k2.length;
  const cipher = new Uint8Array(plain.length);
  let p1 = phase1, p2 = phase2, intermediateF = 0, plaintextF = 0;
  for (let i = 0; i < plain.length; i++) {
    const p = plain[i];
    let mid;
    if (p === 0) { mid = 0; plaintextF++; }
    else { mid = mod(p + order.k1[p1]); p1 = (p1 + 1) % q1; }
    if (mid === 0) { cipher[i] = 0; intermediateF++; }
    else { cipher[i] = mod(mid + order.k2[p2]); p2 = (p2 + 1) % q2; }
  }
  return { cipher, end1: p1, end2: p2, plaintextF, intermediateF };
}

function scoreSequence(seq, logp, prev2 = 29, prev1 = 29) {
  let score = 0;
  for (const p of seq) {
    score += logp[(prev2 * 30 + prev1) * 29 + p];
    prev2 = prev1; prev1 = p;
  }
  return score;
}

function allInitialStates(order) {
  const out = [];
  for (let p1 = 0; p1 < order.k1.length; p1++) {
    for (let p2 = 0; p2 < order.k2.length; p2++) out.push(phaseState(p1, p2, 29, 29, order.k2.length));
  }
  return out;
}

function decodeOneLayer(plain, key) {
  const out = new Uint8Array(plain.length);
  let phase = 0;
  for (let i = 0; i < plain.length; i++) {
    if (plain[i] === 0) out[i] = 0;
    else { out[i] = mod(plain[i] + key[phase]); phase = (phase + 1) % key.length; }
  }
  return { out, endPhase: phase };
}

function validateTransducer(orders) {
  const results = [];
  for (const order of orders) {
    const trans = makeTransitions(order);
    let cases = 0, failures = 0;
    for (let p1 = 0; p1 < order.k1.length; p1++) {
      for (let p2 = 0; p2 < order.k2.length; p2++) {
        for (let plain = 0; plain < 29; plain++) {
          const f = forward(Uint8Array.of(plain), order, p1, p2);
          const pair = p1 * order.k2.length + p2;
          const nextPair = f.end1 * order.k2.length + f.end2;
          const ok = trans[f.cipher[0]][pair].some(o => o.p === plain && o.nextPair === nextPair);
          cases++;
          if (!ok) failures++;
        }
      }
    }
    assert(failures === 0, 'inverse transition validation failed for ' + order.name);
    results.push({ order: order.name, cases, failures });
  }
  return results;
}

function verifyHistoricalKeys() {
  const wulficChunks = wulficText.split('$');
  const welcome = extractRunes(relikd.sections.find(s => s.name === '0_welcome').source_text);
  const welcomeCipher = extractRunes(wulficChunks[1]);
  const koan = extractRunes(relikd.sections.find(s => s.name === 'jpg107-167').source_text);
  const koanCipher = extractRunes(wulficChunks[5]);
  assert(welcome.length === 515 && welcomeCipher.length === 515, 'WELCOME control geometry changed');
  assert(koan.length === 319 && koanCipher.length === 319, 'second KOAN control geometry changed');
  const w = decodeOneLayer(welcome, K8);
  const k = decodeOneLayer(koan, K13);
  assert(w.out.every((x, i) => x === welcomeCipher[i]) && w.endPhase === 0, 'q8 WELCOME forward control failed');
  assert(k.out.every((x, i) => x === koanCipher[i]) && k.endPhase === 5, 'q13 second KOAN forward control failed');
  return {
    welcomeRunes: welcome.length,
    welcomeForwardExact: true,
    welcomeEndPhase: w.endPhase,
    koanRunes: koan.length,
    koanForwardExact: true,
    koanEndPhase: k.endPhase
  };
}

function runControl(sectionName, order, start1, start2, model) {
  const section = relikd.sections.find(s => s.name === sectionName);
  assert(section, 'missing native control section ' + sectionName);
  const plain = extractRunes(section.source_text).slice(0, 289);
  assert(plain.length === 289, 'native control too short: ' + sectionName);
  const enc = forward(plain, order, start1, start2);
  const fit = viterbi(enc.cipher.slice(0, 213), order, model, allInitialStates(order), true);
  if (!fit.feasible) return { section: sectionName, order: order.name, feasible: false, noPathAt: fit.noPathAt, priorActiveStates: fit.priorActiveStates, maxActiveStates: fit.maxActive, transitionCount: fit.transitionCount };
  const continuation = viterbi(enc.cipher.slice(213), order, model, [fit.bestState], true);
  if (!continuation.feasible) return { section: sectionName, order: order.name, feasible: false, p54Feasible: true, p55NoPathAt: continuation.noPathAt };
  const recovered = Array.from(fit.plain).concat(Array.from(continuation.plain));
  const p54Exact = fit.plain.every((x, i) => x === plain[i]);
  const p55Exact = continuation.plain.every((x, i) => x === plain[213 + i]);
  const initial = unpackState(fit.initialState, order.k2.length);
  const exit = unpackState(fit.bestState, order.k2.length);
  const replay54 = forward(fit.plain, order, initial.phase1, initial.phase2);
  const replay55 = forward(continuation.plain, order, exit.phase1, exit.phase2);
  assert(replay54.cipher.every((x, i) => x === enc.cipher[i]), 'control p54 replay failed');
  assert(replay55.cipher.every((x, i) => x === enc.cipher[213 + i]), 'control p55 replay failed');
  return {
    section: sectionName,
    order: order.name,
    generatedStartPhases: [start1, start2],
    recoveredStartPhases: [initial.phase1, initial.phase2],
    p54Exact,
    p55Exact,
    wholeExact: p54Exact && p55Exact,
    trueP54ScorePerRune: scoreSequence(plain.slice(0, 213), model) / 213,
    bestP54ScorePerRune: fit.bestScore / 213,
    trueP55ScorePerRune: scoreSequence(plain.slice(213), model, plain[211], plain[212]) / 76,
    bestP55ScorePerRune: continuation.bestScore / 76,
    p54MaxActiveStates: fit.maxActive,
    p55MaxActiveStates: continuation.maxActive,
    replayExact: true,
    recoveredPreview: renderTokens(recovered.slice(0, 40))
  };
}

function runOriginal(order, model) {
  const fit = viterbi(p54, order, model, allInitialStates(order), true);
  if (!fit.feasible) return { order: order.name, p54Feasible: false, noPathAt: fit.noPathAt, priorActiveStates: fit.priorActiveStates, maxActiveStates: fit.maxActive, transitionsBeforeDeadEnd: fit.transitionCount };
  const initial = unpackState(fit.initialState, order.k2.length);
  const exit = unpackState(fit.bestState, order.k2.length);
  const continuation = viterbi(p55, order, model, [fit.bestState], true);
  if (!continuation.feasible) return { order: order.name, p54Feasible: true, p55Feasible: false, p55NoPathAt: continuation.noPathAt, p54InitialPhases: [initial.phase1, initial.phase2], p54ExitPhases: [unpackState(fit.bestState, order.k2.length).phase1, unpackState(fit.bestState, order.k2.length).phase2] };
  const replay54 = forward(fit.plain, order, initial.phase1, initial.phase2);
  const replay55 = forward(continuation.plain, order, exit.phase1, exit.phase2);
  assert(replay54.cipher.every((x, i) => x === p54[i]), 'original p54 forward replay failed');
  assert(replay55.cipher.every((x, i) => x === p55[i]), 'original p55 forward replay failed');
  assert(replay54.end1 === exit.phase1 && replay54.end2 === exit.phase2, 'p54 exit phase mismatch');
  return {
    order: order.name,
    initialPhases: [initial.phase1, initial.phase2],
    p54ExitPhases: [exit.phase1, exit.phase2],
    p55ExitPhases: [replay55.end1, replay55.end2],
    p54BestScore: fit.bestScore,
    p54BestScorePerRune: fit.bestScore / p54.length,
    p55ContinuationScore: continuation.bestScore,
    p55ContinuationScorePerRune: continuation.bestScore / p55.length,
    p54MaxActiveStates: fit.maxActive,
    p54FinalActiveStates: fit.finalActive,
    p54Transitions: fit.transitionCount,
    p55MaxActiveStates: continuation.maxActive,
    p55FinalActiveStates: continuation.finalActive,
    p55Transitions: continuation.transitionCount,
    p54PlainIndices: Array.from(fit.plain),
    p55PlainIndices: Array.from(continuation.plain),
    p54PlainTokens: renderTokens(fit.plain),
    p55PlainTokens: renderTokens(continuation.plain),
    p54PlainRunes: renderRunes(fit.plain),
    p55PlainRunes: renderRunes(continuation.plain),
    forwardReplayExact: true
  };
}

const historicalControls = verifyHistoricalKeys();
const model = buildTrigramModel(freqText);
const orders = [
  { name: 'q8-then-q13', k1: K8, k2: K13 },
  { name: 'q13-then-q8', k1: K13, k2: K8 }
];
const transitionValidation = validateTransducer(orders);
const originals = orders.map(order => runOriginal(order, model.logp));
const controls = [];
for (const order of orders) {
  controls.push(runControl('0_koan_1', order, 2, 5, model.logp));
  controls.push(runControl('0_loss_of_divinity', order, 6, 3, model.logp));
}

const inputs = {
  corpusBlob: blobSha1(corpusText),
  relikdBlob: blobSha1(relikdText),
  wulficBlob: blobSha1(wulficText),
  frequencyBlob: blobSha1(freqText),
  page54: { runeCount: page54.indices.length, headingRunes, bodyRunes: p54.length },
  page55: { runeCount: p55.length },
  key8: K8,
  key13: K13,
  model: { rows: model.rows, wordWeight: model.wordWeight, sha256: model.sha256 }
};
const output = {
  schema: 'lp2-q8-q13-independent-f-clock-composition-v1',
  method: 'Exact Viterbi over the complete finite transducer state (both independent key phases and the previous two plaintext runes); all 104 starting phase pairs are initialized. The score is the fixed smoothed GP29 character-trigram model built from the independent TextBlob word-frequency source. p55 is decoded only after freezing the best p54 path and carrying both exit phases without reset.',
  inputs,
  historicalControls,
  transitionValidation,
  controls,
  originals
};
const outDir = process.env.RUNNER_TEMP || require('node:os').tmpdir();
const outPath = path.join(outDir, 'source-test-output.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n', 'utf8');
process.stdout.write(JSON.stringify({
  artifact: outPath,
  historicalControls,
  transitionValidation,
  controls,
  originals: originals.map(x => ({
    order: x.order,
    p54Feasible: x.p54Feasible,
    noPathAt: x.noPathAt,
    priorActiveStates: x.priorActiveStates,
    maxActiveStates: x.maxActiveStates,
    transitionsBeforeDeadEnd: x.transitionsBeforeDeadEnd,
    p55Feasible: x.p55Feasible,
    p55NoPathAt: x.p55NoPathAt,
    initialPhases: x.initialPhases,
    p54ExitPhases: x.p54ExitPhases,
    p55ExitPhases: x.p55ExitPhases,
    p54BestScorePerRune: x.p54BestScorePerRune,
    p55ContinuationScorePerRune: x.p55ContinuationScorePerRune,
    p54MaxActiveStates: x.p54MaxActiveStates,
    p54FinalActiveStates: x.p54FinalActiveStates,
    p55MaxActiveStates: x.p55MaxActiveStates,
    p54PlainTokens: x.p54PlainTokens,
    p55PlainTokens: x.p55PlainTokens
  }))
}, null, 2) + '\n');
