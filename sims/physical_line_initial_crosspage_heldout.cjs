'use strict';

/**
 * Physical LP2 printed-line initial symbol cross-page replication.
 *
 * The held-out diagnostic is the product of page-marginal-standardized
 * residuals for alternating physical pages: the null pagewise rotates its
 * original rune stream, preserving every page's exact composition and
 * glyph sequence while leaving typographic boundaries fixed.
 *
 * This test does not recover original plaintext or posit a secret key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const CORPUS = JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const SOURCE = fs.readFileSync(path.join(
  ROOT, 'resources/transcriptions/liber_primus_master.txt'), 'utf8');
const INDEX = new Map(CORPUS.runes.map((rune, i) => [rune, i]));
const ALPHABET = 29;
const TRAINING_SEED = 0x3301ae45;
const REPS = Number(process.env.NULL_TRIALS || 50000);

/**
 * @typedef {{
 *   page:number,runic:number[],starts:number[],ends:number[],
 *   continueWords:number[],beginWords:number[],wordStarts:number[],
 *   count:Float64Array
 * }} PrintedPage
 */

/** @param {string} segment */
function parseLines(segment) {
  return segment.split('/').map(line => ({
    visible:line.trim(),
    runic:[...line].filter(c => INDEX.has(c)).map(c => INDEX.get(c))
  })).filter(line => line.runic.length);
}

/** @returns {PrintedPage[]} */
function pages() {
  const original = SOURCE.split('%');
  const pages = [];
  for (let page = 0; page <= 55; page++) {
    if (page === 50) continue;
    const transcript = original[page + 16];
    assert.ok(transcript, 'Missing source page ' + page);
    const rows = parseLines(transcript);
    const runic = rows.flatMap(row => row.runic);
    const reference = CORPUS.pages.find(p => p.page === page);
    assert.deepEqual(runic, reference.indices,
      'Original rune manuscript mismatch on physical page ' + page);
    const count = new Float64Array(ALPHABET);
    runic.forEach(x => count[x]++);
    const starts = [], ends = [], continueWords = [], beginWords = [];
    let offset = 0;
    for (let line = 0; line < rows.length; line++) {
      const row = rows[line];
      starts.push(offset);
      if (line > 0) {
        const previousText = rows[line - 1].visible;
        const leading = row.visible[0];
        const ending = previousText.at(-1);
        if (INDEX.has(leading) && INDEX.has(ending)) continueWords.push(offset);
        else beginWords.push(offset);
      }
      offset += row.runic.length;
      ends.push(offset - 1);
    }
    assert.equal(offset, runic.length);
    pages.push({page, runic, starts, ends,
      continueWords, beginWords, wordStarts:[], count});
  }

  // Scan the original all-manuscript transcription for source word initials.
  // Percent/page marks and slash/line wraps never terminate a rune word.
  const byPage = new Map(pages.map(page => [page.page,page]));
  let page = 0, pos = 0, needsStart = true;
  for (const chr of SOURCE.split('%').slice(16, 72).join('%')) {
    if (INDEX.has(chr)) {
      const current = byPage.get(page);
      if (!current) {
        assert.equal(page, 50, 'Missing rune-bearing page '+page);
        throw Error('Unexpected rune in grid-only page');
      }
      if (needsStart) current.wordStarts.push(pos);
      pos++;
      needsStart = false;
    } else if (chr === '%') {
      page++;
      pos = 0;
    } else if (chr === '/' || /\s/u.test(chr)) {
      // Physical line/section spacing is typographic only.
    } else {
      needsStart = true;
    }
  }
  const totals = pages.reduce((a,p) => ({
    glyphs:a.glyphs+p.runic.length,lines:a.lines+p.starts.length,
    wraps:a.wraps+p.continueWords.length+p.beginWords.length,
    continuation:a.continuation+p.continueWords.length,
    newWord:a.newWord+p.beginWords.length,
    wordStarts:a.wordStarts+p.wordStarts.length,
  }),{glyphs:0,lines:0,wraps:0,continuation:0,newWord:0,wordStarts:0});
  assert.deepEqual({glyphs:totals.glyphs,lines:totals.lines,wraps:totals.wraps},
    {glyphs:12956,lines:594,wraps:539});
  assert.equal(totals.wordStarts,2896,'Word-start accounting mismatch');
  return pages;
}

/**
 * @param {PrintedPage[]} source
 * @param {'starts'|'ends'|'continueWords'|'beginWords'|'wordStarts'} kind
 * @param {number[]|null} shifts The page-indexed rotation for the null.
 */
function residual(source, kind, shifts = null) {
  const observed = new Float64Array(ALPHABET);
  const expected = new Float64Array(ALPHABET);
  let positions = 0;
  for (const page of source) {
    const sites = page[kind];
    const shift = shifts ? shifts[page.page] : 0;
    for (const site of sites) {
      const v = page.runic[(site + shift) % page.runic.length];
      observed[v]++;
      positions++;
    }
    const factor = sites.length / page.runic.length;
    for (let i = 0; i < ALPHABET; i++)
      expected[i] += page.count[i] * factor;
  }
  const z = Float64Array.from(observed,
    (value, i) => (value - expected[i]) / Math.sqrt(expected[i]));
  const chi = z.reduce((sum, value) => sum + value * value, 0);
  return {positions, z,chi,observed,expected};
}

/** @param {Float64Array} a @param {Float64Array} b */
function dot(a,b) {
  let result = 0;
  for (let i = 0; i < a.length; i++) result += a[i] * b[i];
  return result;
}

/** @param {number} seed @returns {()=>number} */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[]} shifts @param {PrintedPage[]} manuscript @param {()=>number} random */
function randomRotation(shifts, manuscript, random) {
  for (const page of manuscript)
    shifts[page.page] = random() % page.runic.length;
}

/**
 * @param {PrintedPage[]} source
 * @param {string[]} channels
 * @param {number} replicates
 * @param {number} seed
 */
function crossTest(source, channels, replicates, seed) {
  const even = source.filter(page => page.page % 2 === 0);
  const odd = source.filter(page => page.page % 2 === 1);
  const frozen = channels.map(channel => {
    const train = residual(even,channel);
    const test = residual(odd,channel);
    const agree = dot(train.z, test.z);
    return {channel,observedDot:agree,cosine:agree/Math.sqrt(train.chi*test.chi),
      trainChi:train.chi,testChi:test.chi,trainN:train.positions,
      testN:test.positions,train,test};
  });
  const nulls = frozen.map(()=>({ge:0,sum:0,max:-Infinity}));
  const shifts = Array(56).fill(0);
  const random = prng(seed);
  for (let sample = 0; sample < replicates;sample++) {
    randomRotation(shifts,source,random);
    for (let channel = 0; channel < channels.length;channel++) {
      const test = frozen[channel];
      const score = dot(residual(even,channels[channel],shifts).z,
        residual(odd,channels[channel],shifts).z);
      const acc = nulls[channel];
      acc.sum += score;
      if (score >= test.observedDot) acc.ge++;
      if (score > acc.max) acc.max = score;
    }
  }
  const output = {};
  for (let j = 0; j < channels.length; j++) {
    const sample = frozen[j], nullStats = nulls[j];
    output[sample.channel] = {
      observedDot: sample.observedDot,cosine:sample.cosine,
      trainN:sample.trainN,testN:sample.testN,
      trainChi:sample.trainChi,testChi:sample.testChi,
      nullExceedances:nullStats.ge,
      addOneUpperTail:(nullStats.ge+1)/(replicates+1),
      nullMean:nullStats.sum/replicates,nullMaximum:nullStats.max,
    };
  }
  const primary = frozen.find(x=>x.channel==='starts');
  if (primary) {
    output.leadingGlyphs = CORPUS.runes.map((glyph,j) => ({
      glyph,index:j,
      evenZ:primary.train.z[j],
      oddZ:primary.test.z[j],
      product:primary.train.z[j]*primary.test.z[j],
    })).sort((a,b)=>b.product-a.product).slice(0,8);
  }
  return output;
}

function run() {
  assert.ok(Number.isInteger(REPS) && REPS >= 100);
  const source = pages();
  const totals = source.reduce((count,page) => {
    for (const type of ['starts','ends','continueWords','beginWords','wordStarts'])
      count[type] += page[type].length;
    return count;
  },{starts:0,ends:0,continueWords:0,beginWords:0,wordStarts:0});
  const names = ['starts','ends','continueWords','beginWords','wordStarts'];
  const statistics = crossTest(source,names,REPS,TRAINING_SEED);
  assert.ok(statistics.starts.observedDot > 20);
  assert.ok(statistics.ends.observedDot < 5);
  const report = {
    question:'Printed LP2 line-beginning rune preferences replicate between physical-page halves',
    class:'exact original ciphertext structural replication, no decrypted text',
    sourceSha256:createHash('sha256').update(SOURCE).digest('hex'),
    sourcePages:source.length,originalRunes:source.reduce((s,p)=>s+p.runic.length,0),
    totals,split:'alternating physical pages p mod 2, 0..55 except 50',
    test:'standardized 29-rune start-frequency residual dot product between halves',
    null:'independent uniform pagewise circular rune rotations; preserve original page glyph string and page and printed layout',
    seed:'0x'+TRAINING_SEED.toString(16), nullReplicates:REPS,
    statistics,
    caution:'A typesetting rule, printed boundary selection or other visual mechanism could create the bias; nominal rotation p values do not correct the history of choosing line starts.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}
if (require.main === module) run();
module.exports = {pages,residual,dot,prng,randomRotation,crossTest,run};
