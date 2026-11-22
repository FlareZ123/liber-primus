'use strict';

/**
 * Source-selected mod-79 primitive-root key challenge.
 * LP2 red sum p40/29 =15, GP prime[15]=53, red sum p15/29=22,
 * ordinary prime[22]=79, red sum p53/29=78 = phi(79).
 * 53 has multiplicative order 78 modulo 79. This defines a 78-cycle.
 *
 * The GP alphabet has 29 symbols; a joint (t modulo29, 53^t modulo79)
 * clock has 2262 states. The reduction of a mod-79 unit to F29 is
 * conjectural, not a historically attested part of Liber Primus.
 * Explicit finite additive and affine inverse models are tested.
 *
 * Run: node sims/red_field79_generator_heldout.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('./affine_echo_literary_control.cjs');
const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const mod = (x) => (x % 29 + 29) % 29;

/** @param {number} page @param {number} start */
function sourceSum(page, start) {
  const source = ink.pages.find(p => p.page === page).red_spans
    .find(s => s.start === start);
  const gp = [...source.runes].map(r => corpus.runes.indexOf(r));
  assert.ok(gp.every(i => i >= 0));
  assert.deepEqual(gp, corpus.pages[page].indices.slice(
    source.start, source.start + source.length));
  return gp.reduce((s, i) => s + corpus.prime[i], 0);
}

/** @returns {number[]} Complete nonzero power cycle in F79. */
function cycle() {
  assert.equal(sourceSum(40, 0), 435);
  assert.equal(sourceSum(15, 0), 638);
  assert.equal(sourceSum(53, 128), 2262);
  assert.equal(435 / 29, 15);
  assert.equal(638 / 29, 22);
  assert.equal(2262 / 29, 78);
  assert.equal(corpus.prime[15], 53);
  assert.equal(corpus.prime[21], 79);
  const list = [];
  let v = 1;
  for (let i = 0; i < 78; i++) {
    assert.ok(!list.includes(v), 'Premature power-cycle repeat');
    list.push(v);
    v = v * 53 % 79;
  }
  assert.equal(v, 1);
  assert.equal(new Set(list).size, 78);
  return list;
}

const powers = cycle();
const inv29 = Array.from({length: 29}, (_, a) => {
  if (a === 0) return 0;
  const inverse = Array.from({length: 28}, (_, i) => i + 1)
    .find(v => v * a % 29 === 1);
  assert.ok(inverse);
  return inverse;
});
/**
 * @typedef {{family:'affine'|'add'|'rawadd',phase:number,shift:number,
 * sign:-1|1,reset:boolean}} Config
 */
/** @param {number[][]} groups @param {Config} cfg @param {boolean} encrypt */
function transform(groups, cfg, encrypt = false) {
  let time = 0;
  return groups.map(group => {
    if (cfg.reset) time = 0;
    return group.map(input => {
      const t = time++;
      const v = powers[(t + cfg.phase) % 78];
      const a = 1 + ((v - 1) % 28);
      const b = (t + cfg.shift) % 29;
      if (cfg.family === 'affine')
        return encrypt ? mod(cfg.sign * a * input + b)
          : mod(cfg.sign * inv29[a] * (input - b));
      const pad = cfg.family === 'add' ? a + b : v % 29 + b;
      return mod(input + (encrypt ? 1 : -1) * cfg.sign * pad);
    });
  });
}
/** @param {number[][]} groups */
function ioc(groups) {
  const hist = Array(29).fill(0);
  let n = 0;
  for (const page of groups) for (const rune of page) {
    hist[rune]++; n++;
  }
  return hist.reduce((s, k) => s + k * (k - 1), 0) / (n * (n - 1));
}
/** @param {number} first @param {number} last */
function pages(first, last) {
  return corpus.pages.filter(p => p.page >= first && p.page <= last
    && p.indices.length > 0).map(p => p.indices);
}
/** @returns {object} Reproducible test record. */
function run() {
  const train = pages(16, 18);
  const heldout = pages(19, 22);
  const external = [...pages(40, 40), ...pages(53, 53)];
  assert.equal(train.flat().length, 800);
  assert.equal(heldout.flat().length, 944);
  const candidates = [];
  for (const family of ['affine', 'add', 'rawadd'])
    for (const phase of [0, 15, 22, 53])
      for (const shift of [0, 15, 22])
        for (const sign of [-1, 1])
          for (const reset of [true, false]) {
            const cfg = {family, phase, shift, sign, reset};
            candidates.push({...cfg, train: ioc(transform(train, cfg)),
              heldout: ioc(transform(heldout, cfg)),
              external: ioc(transform(external, cfg))});
          }
  assert.equal(candidates.length, 144);
  candidates.sort((a, b) => b.train - a.train);
  const best = candidates[0];
  assert.equal(best.family, 'add');
  assert.equal(best.phase, 0);
  assert.equal(best.sign, 1);
  assert.equal(best.reset, true);
  assert.ok(best.train < 0.037);
  assert.ok(best.heldout < 0.04);

  // Independently authored GP-English control, not original unknown LP2.
  const shakespeare = fs.readFileSync(path.join(
    ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8');
  const english = (shakespeare.match(/[A-Za-z]+/g) || []).flatMap(encode);
  const lengths = [...train, ...heldout].map(p => p.length);
  let at = 0;
  const plain = lengths.map(n => {
    const slice = english.slice(at, at + n);
    assert.equal(slice.length, n);
    at += n;
    return slice;
  });
  const plantedCfg = {
    family: 'affine', phase: 53, shift: 22, sign: -1, reset: false
  };
  const plantedCipher = transform(plain, plantedCfg, true);
  assert.deepEqual(transform(plantedCipher, plantedCfg), plain);
  const stream = corpus.pages.filter(p => p.page <= 55)
    .flatMap(p => p.indices);
  assert.equal(stream.length, 12956);
  const selectedLags = [53, 78, 79, 638, 2262];
  const lagData = selectedLags.map(lag => {
    let equal = 0;
    for (let i = lag; i < stream.length; i++)
      if (stream[i] === stream[i - lag]) equal++;
    return {lag, equal, comparisons: stream.length - lag,
      rate: equal / (stream.length - lag)};
  });
  const out = {
    source: {redQuotients: [15,22,78], gpPrime15: 53,
      ordinaryPrime22:79, multiplicativeOrder: powers.length,
      generatorPowersFirst8: powers.slice(0,8),
      jointClockPeriod: 29 * powers.length},
    tested: {models: candidates.length, trainPages: [16,17,18],
      heldoutPages:[19,20,21,22], externalPages:[40,53]},
    rawIoC: {train:ioc(train), heldout:ioc(heldout), external:ioc(external)},
    bestFit: candidates.slice(0,5),
    originalLagEquality:lagData,
    planted: {sourceRunes: at, sourceIoC:ioc(plain),
      encryptedIoC:ioc(plantedCipher), exactRecovery: true},
    outcome: 'Source-defined generator is real; no original GP-English decryption in this finite 78/2262-cycle family.'
  };
  console.log(JSON.stringify(out, null, 2));
  return out;
}
if (require.main === module) run();
module.exports = {cycle, transform, ioc, run};
