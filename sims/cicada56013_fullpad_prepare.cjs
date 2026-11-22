'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const raw = fs.readFileSync(path.join(ROOT, 'resources/control/gibran_prophet_58585.txt'), 'utf8');
const translit = corpus.translit;
const tokens = translit.map((word, index) => ({ word, index })).sort((a, b) => b.word.length - a.word.length);

/** @param {string} source @returns {number[]} */
function encode(source) {
  const output = [];
  for (let word of source.toUpperCase().split(/[^A-Z]+/)) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
    for (let i = 0; i < word.length;) {
      const token = tokens.find((x) => word.startsWith(x.word, i));
      if (token) {
        output.push(token.index);
        i += token.word.length;
      } else i++;
    }
  }
  return output;
}

function main() {
  const target = corpus.pages.filter((p) => p.page === 54 || p.page === 55)
    .flatMap((p) => p.indices);
  assert.equal(target.length, 308);
  const native = encode(raw);
  const cut = Math.floor(native.length * .7);
  const train = native.slice(0, cut);
  const plant = native.slice(cut, cut + 308);
  assert.equal(plant.length, 308);
  const counts = new Float64Array(29 ** 3);
  for (let i = 0; i < train.length - 2; i++) {
    counts[train[i] * 841 + train[i + 1] * 29 + train[i + 2]]++;
  }
  const denominator = train.length - 2 + .05 * counts.length;
  const logp = new Float64Array(counts.length);
  for (let i = 0; i < counts.length; i++) {
    logp[i] = Math.log((counts[i] + .05) / denominator);
  }
  const mean = (seq) => {
    let total = 0;
    for (let i = 0; i < seq.length - 2; i++) {
      total += logp[seq[i] * 841 + seq[i + 1] * 29 + seq[i + 2]];
    }
    return total / (seq.length - 2);
  };
  assert.ok(mean(plant) > mean(target) + 2);
  const dest = process.argv[2];
  assert.ok(dest, 'Specify a unique runner-temporary output');
  const buf = Buffer.alloc(12 + logp.length * 8 + target.length + plant.length);
  buf.writeUInt32LE(logp.length, 0);
  buf.writeUInt32LE(target.length, 4);
  buf.writeUInt32LE(plant.length, 8);
  let offset = 12;
  for (const p of logp) { buf.writeDoubleLE(p, offset); offset += 8; }
  for (const r of target) buf[offset++] = r;
  for (const r of plant) buf[offset++] = r;
  assert.equal(offset, buf.length);
  // Creation is exclusive, and the runner gives each invocation its own temporary directory.
  const fd = fs.openSync(dest, 'wx', 0o600);
  try { fs.writeFileSync(fd, buf); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  console.log(JSON.stringify({
    originalRunes: target.length, trainRunes: train.length,
    sourceNativePlantRunes: plant.length,
    rawScore: mean(target), nativeHeldoutScore: mean(plant),
    scoringStart: 'physical p54 first red rune, continuous through p55',
    keyedStage: 'byte mod29, direct additive, every byte offset',
  }));
}
main();
