'use strict';

/**
 * Source-locked train/holdout comparison of adjacent-repeat event hazards.
 * Issue #1121. Windows / Node >=20, no packages or network operations.
 * A proper scoring rule is used; no unknown plaintext is inferred.
 *
 * Run: node sims/lp2_doublet_visible_chapter_restart_holdout_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @type {{runes:string[], pages:{page:number,indices:number[]}[]}} */
const corpus = JSON.parse(fs.readFileSync(path.join(sourcePath, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(sourcePath, 'lp2-transcription.txt'), 'utf8').split('%');
const runeSet = new Set(corpus.runes);
// Chapter endpoints are original source-visible p2,p7,p14,p22,p26,p32,p39,p53,p55.
const ends = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const starts = [0, ...ends.slice(0, -1)];
/** @typedef {{p:number,ch:number,y:number,word:number,wrap:number,linePos:number,chapterPhase:number,continuousPhase:number}} Row */
/** @type {Row[]} */
const rows = [];
let global = 0;
for (let p = 0; p < 56; p++) {
  const printed = p === 50 ? '' : transcription[p < 50 ? p : p - 1];
  const original = corpus.pages[p].indices.map(i => corpus.runes[i]);
  /** @type {{rune:string,line:number,sep:string}[]} */
  const glyphs = [];
  let line = 0, sep = '';
  for (let i = 0; i < printed.length; i++) {
    const z = printed[i];
    if (z === '/' || (z === '\n' && i > 0 && printed[i - 1] !== '/' && printed[i - 1] !== '\r')) line++;
    if (runeSet.has(z)) {
      glyphs.push({rune: z, line, sep});
      sep = '';
    } else sep += z;
  }
  assert.deepEqual(glyphs.map(x => x.rune), original, 'printed-source runes, physical page ' + p);
  const lengths = new Map();
  for (const x of glyphs) lengths.set(x.line, (lengths.get(x.line) || 0) + 1);
  const ranks = new Map();
  for (let i = 0; i < glyphs.length; i++) {
    const x = glyphs[i], rank = ranks.get(x.line) || 0;
    ranks.set(x.line, rank + 1);
    if (i === 0) continue; // original same-page eligibility; no cross-page phantom doublets
    const before = glyphs[i - 1], site = global + i - 1;
    const ch = ends.findIndex(end => site < end);
    assert.ok(ch >= 0);
    const precedingRank = rank > 0 ? rank - 1 : (lengths.get(before.line) - 1);
    const precedingLength = lengths.get(before.line);
    rows.push({
      p, ch, y: Number(before.rune === x.rune),
      word: Number(/[.\-&$]/.test(x.sep)),
      wrap: Number(before.line !== x.line),
      linePos: precedingRank / Math.max(1, precedingLength - 1),
      chapterPhase: (site - starts[ch]) / (ends[ch] - starts[ch]),
      continuousPhase: site / 12956
    });
  }
  global += original.length;
}
assert.equal(global, 12956);
assert.equal(rows.length, 12901);
assert.equal(rows.reduce((s, r) => s + r.y, 0), 86);
const train = rows.filter(r => r.p < 40);
const hold = rows.filter(r => r.p >= 40);
assert.deepEqual([train.length, hold.length], [9600, 3301]);
assert.deepEqual([train.reduce((s,r)=>s+r.y,0),hold.reduce((s,r)=>s+r.y,0)], [65,21]);
assert.deepEqual([0,1,2,3,4,5,6,7,8].map(ch=>rows.filter(r=>r.ch===ch).reduce((s,r)=>s+r.y,0)), [4,6,9,10,11,13,12,18,3]);

/** @param {number} z */
const sigmoid = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
/** @param {Row} r @param {'flat'|'continuous'|'restart'} mode */
function features(r, mode) {
  return [1, r.word, r.wrap, r.linePos - 0.5,
    mode === 'restart' ? r.chapterPhase - 0.5 : mode === 'continuous' ? r.continuousPhase - 0.5 : 0];
}
/** @param {number[][]} a @param {number[]} b */
function solve(a, b) {
  const n = b.length;
  const m = a.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let pivot = c;
    for (let i = c + 1; i < n; i++) if (Math.abs(m[i][c]) > Math.abs(m[pivot][c])) pivot = i;
    [m[c], m[pivot]] = [m[pivot], m[c]];
    assert.ok(Math.abs(m[c][c]) > 1e-10, 'ridge must make system full rank');
    const d = m[c][c];
    for (let j = c; j <= n; j++) m[c][j] /= d;
    for (let i = 0; i < n; i++) {
      if (i === c) continue;
      const z = m[i][c];
      for (let j = c; j <= n; j++) m[i][j] -= z * m[c][j];
    }
  }
  return m.map(row => row[n]);
}
/** @param {Row[]} data @param {'flat'|'continuous'|'restart'} mode */
function fit(data, mode) {
  let b = [-5, 0, 0, 0, 0];
  const penalty = [0.001, 1, 1, 1, 1]; // common ridge prior for all models, fixed beforehand
  for (let iteration = 0; iteration < 16; iteration++) {
    const grad = b.map((z, j) => -penalty[j] * z);
    const h = b.map((_, i) => b.map((__, j) => i === j ? penalty[i] : 0));
    for (const r of data) {
      const x = features(r, mode);
      const prob = sigmoid(x.reduce((s, v, i) => s + v * b[i], 0));
      const error = r.y - prob, variance = prob * (1 - prob);
      for (let i = 0; i < 5; i++) {
        grad[i] += x[i] * error;
        for (let j = 0; j < 5; j++) h[i][j] += variance * x[i] * x[j];
      }
    }
    const step = solve(h, grad);
    b = b.map((v, j) => v + step[j]);
    if (Math.max(...step.map(Math.abs)) < 1e-9) break;
  }
  return b;
}
/** @param {Row[]} data @param {'flat'|'continuous'|'restart'} mode @param {number[]} b */
function score(data, mode, b) {
  let logScore = 0, predictedEvents = 0, events = 0;
  for (const r of data) {
    const prob = sigmoid(features(r, mode).reduce((s,v,i) => s + v * b[i], 0));
    logScore += r.y * Math.log(prob) + (1 - r.y) * Math.log1p(-prob);
    predictedEvents += prob; events += r.y;
  }
  return {n:data.length,events,predictedEvents,logScore};
}
const modes = /** @type {const} */ (['flat', 'continuous', 'restart']);
const estimated = Object.fromEntries(modes.map(mode => {
  const b = fit(train, mode);
  return [mode, {coefficient:b, train:score(train,mode,b), hold:score(hold,mode,b),
    heldoutChapters:[7,8].map(ch=>({chapter:ch,...score(hold.filter(r=>r.ch===ch),mode,b)}))}];
}));
const scoreFlat = estimated.flat.hold.logScore;
const gapReset = estimated.restart.hold.logScore - scoreFlat;
const gapDrift = estimated.continuous.hold.logScore - scoreFlat;
assert.ok(Math.abs(estimated.flat.train.logScore + 388.3687) < 0.02);
assert.ok(Math.abs(estimated.restart.train.logScore + 385.7802) < 0.02);
assert.ok(Math.abs(estimated.flat.hold.logScore + 128.0134) < 0.02);
assert.ok(Math.abs(gapReset + 0.0448) < 0.02);
assert.ok(Math.abs(gapDrift + 1.0008) < 0.02);

// Solved controls use independent authentic source symbols.
const withinPage = indices => ({
  eligible: Math.max(0,indices.length-1),
  equal: indices.slice(1).reduce((n,v,i)=>n+Number(v===indices[i]),0)
});
const p56 = withinPage(corpus.pages[56].indices), p57 = withinPage(corpus.pages[57].indices);
assert.deepEqual(p57,{eligible:94,equal:1});
const lp1 = fs.readFileSync(path.join(__dirname,'..','resources','transcriptions','lp1_wulfic_canonical.txt'),'utf8').split('%');
const nativeIndices = [3,8,9,10,11,14];
const lp1Parts = nativeIndices.flatMap(i => lp1[i].split('&').map(s => [...s].filter(c=>runeSet.has(c))).filter(x=>x.length));
const nativeClear = lp1Parts.reduce((a,part)=>{const c=withinPage(part);a.eligible+=c.eligible;a.equal+=c.equal;return a},{eligible:0,equal:0});
assert.deepEqual(nativeClear,{eligible:991,equal:28});
const encryptedIndices = [0,1,2,4,5,6,7,12,13]; // solved LP1 cipher pages, source-authenticated
const encryptedParts = encryptedIndices.flatMap(i => lp1[i].split('&').map(s => [...s].filter(c=>runeSet.has(c))).filter(x=>x.length));
const nativeEncrypted = encryptedParts.reduce((a,part)=>{
  const c=withinPage(part);a.eligible+=c.eligible;a.equal+=c.equal;return a;
},{eligible:0,equal:0});
assert.deepEqual(nativeEncrypted,{eligible:1785,equal:44});

// Positive controls on source-identical 29-rune page/line layout. Each
// Bernoulli event is realized by repeating the actual prior rune or by
// selecting one of the other 28, making a valid source-shaped rune stream.
// Their only use is testing this model comparison's ability to detect a
// generated chapter reset, under known synthetic alternatives.
let randState = 0x33011221;
/** @returns {number} */
function random() { randState ^= randState << 13; randState ^= randState >>> 17; randState ^= randState << 5; return (randState >>> 0) / 4294967296; }
/** @param {'flat'|'continuous'|'restart'} truth @param {number} strength @returns {Row[]} */
function synthetic(truth,strength=2) {
  let prev = -1, lastPage = -1;
  return rows.map(r => {
    if (r.p !== lastPage) {prev = Math.floor(random() * 29);lastPage = r.p;}
    const phase = truth === 'restart' ? r.chapterPhase - 0.5 : truth === 'continuous' ? r.continuousPhase - 0.5 : 0;
    const slope = truth === 'restart' ? -strength : truth === 'continuous' ? strength : 0;
    const prob = sigmoid(-5.1 + 0.2*r.word - 0.4*r.wrap + 0.4*(r.linePos-0.5) + slope*phase);
    const y = Number(random() < prob);
    const nextRune = y ? prev : (prev + 1 + Math.floor(random() * 28)) % 29;
    assert.equal(Number(nextRune===prev),y);
    prev = nextRune;
    return {...r,y};
  });
}
const syntheticControls = {};
const nPlants = 32;
for (const truth of modes) {
  let resetWins = 0, correctWins = 0, totalResetGain = 0, totalContinuousGain = 0;
  for (let k = 0; k < nPlants; k++) {
    const plant = synthetic(truth), plTrain = plant.filter(r=>r.p<40), plHold = plant.filter(r=>r.p>=40);
    const s = Object.fromEntries(modes.map(mode => [mode,
      score(plHold, mode, fit(plTrain,mode)).logScore]));
    resetWins += Number(s.restart > s.flat);
    totalResetGain += s.restart - s.flat;
    totalContinuousGain += s.continuous - s.flat;
    const winner = modes.reduce((best,mode) => s[mode] > s[best] ? mode : best, 'flat');
    correctWins += Number(winner === truth);
  }
  syntheticControls[truth] = {plants:nPlants,resetBeatsFlat:resetWins,
    correctModeHighest:correctWins,
    meanRestartMinusFlat:totalResetGain/nPlants,
    meanContinuousMinusFlat:totalContinuousGain/nPlants};
}

// At the weaker source-fitted chapter slope, test whether an unchanged
// held-out split can reliably distinguish a real synthetic restart.
let moderateWins = 0, moderateGain = 0;
for (let k = 0; k < nPlants; k++) {
  const plant = synthetic('restart', 0.8426);
  const plTrain = plant.filter(r=>r.p<40), plHold = plant.filter(r=>r.p>=40);
  const fitReset = fit(plTrain,'restart'), fitFlat = fit(plTrain,'flat');
  const gain = score(plHold,'restart',fitReset).logScore-score(plHold,'flat',fitFlat).logScore;
  moderateWins += Number(gain > 0);moderateGain += gain;
}
syntheticControls.restartTrainingScale = {plants:nPlants,trueSlope:-0.8426,
  resetBeatsFlat:moderateWins,meanRestartMinusFlat:moderateGain/nPlants};

console.log(JSON.stringify({
  source:{unknownRunes:12956,eligible:12901,doublets:86,originalPages:56,
    chapterEnds:ends,trainPages:'p0–39',holdPages:'p40–55',
    nuisance:['printed word boundary','physical line wrap','fractional position in printed line'],
    prior:'ridge slopes 1.0, intercept 0.001',positiveSeed:'0x33011221'},
  scoreUnits:'natural-log probability per eligible adjacent pair, sum over entire split',
  estimate:estimated,holdoutRestartMinusFlat:gapReset,holdoutContinuousMinusFlat:gapDrift,
  authenticControls:{lp1Clear:nativeClear,lp1SolvedEncrypted:nativeEncrypted,solvedP56Encrypted:p56,solvedP57Clear:p57},
  syntheticControls,
  conclusion:gapReset<=0?'No prospective original advantage for source-visible chapter resets':'prospective chapter-reset advantage; requires original key and lossless inverse',
  limitation:'Rate-only model and 32-plant calibration, not an encryption inverse; any source-selected hidden state/key remains untested',
  status:'PASS'
},null,2));
