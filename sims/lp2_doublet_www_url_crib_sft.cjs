"use strict";
const assert = require("node:assert/strict");
const source = require("../resources/liber-primus/lp2-corpus.json");
const mod = (n, k = 29) => ((n % k) + k) % k;

/** Extract the repeated-rune successor symbols without resetting between pages. */
function extract() {
  let prior = -1;
  const events = [];
  let count = 0;
  for (const page of source.pages.filter((p) => p.page <= 55)) {
    for (let i = 0; i < page.indices.length; i++) {
      const v = page.indices[i];
      if (v === prior) events.push({page: page.page, value: v, offset: i});
      prior = v;
      count++;
    }
  }
  assert.equal(count, 12956);
  assert.equal(events.length, 86);
  return events;
}

/** Solve the cyclic GP29 additive key prescribed by one contiguous literal crib. */
function fit(cipher, start, plain, length) {
  const keys = Array(length).fill(null);
  for (let i = 0; i < plain.length; i++) {
    const needed = mod(cipher[start + i] - plain[i]);
    if (keys[i % length] !== null && keys[i % length] !== needed) return null;
    keys[i % length] = needed;
  }
  return keys;
}

/** Decode the complete event stream, clocked from the crib start. */
function inverse(cipher, start, key) {
  return cipher.map((c, i) => mod(c - key[mod(i - start, key.length)]));
}

/** Collision probability over all different positions. */
function ioc(values) {
  const freq = Array(29).fill(0);
  for (const x of values) freq[x]++;
  return freq.reduce((n, c) => n + c * (c - 1), 0) / (values.length * (values.length - 1));
}

/** Detect the historically noticed isolated, terminal WWW event triplet. */
function motif(values) {
  let equalPairs = 0;
  let triples = 0;
  let tripleIndex = -1;
  let tripleValue = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1]) {
      equalPairs++;
      if (i >= 2 && values[i] === values[i - 2]) {
        triples++;
        tripleIndex = i - 2;
        tripleValue = values[i];
      }
    }
  }
  return {
    onlyTriple: equalPairs === 2 && triples === 1,
    terminalWWW: equalPairs === 2 && triples === 1 &&
      tripleValue === source.translit.indexOf("W") && tripleIndex >= values.length - 7
  };
}

/** Shuffle the fixed event-glyph inventories separately in each image-defined chapter. */
function chapterControl(events, rounds) {
  const ends = [2, 7, 14, 22, 26, 32, 39, 53, 55];
  const chunks = ends.map((end, chapter) =>
    events.map((event, i) => ({page: event.page, i}))
      .filter((row) => row.page > (chapter ? ends[chapter - 1] : -1) && row.page <= end)
      .map((row) => row.i));
  assert.deepEqual(chunks.map((a) => a.length), [4, 6, 9, 10, 11, 13, 12, 18, 3]);
  const start = events.map((event) => event.value);
  let seed = 0x3301a5c3;
  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0x100000000;
  }
  let onlyTriple = 0, terminalWWW = 0;
  for (let trial = 0; trial < rounds; trial++) {
    const values = start.slice();
    for (const chunk of chunks) {
      for (let i = chunk.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [values[chunk[i]], values[chunk[j]]] = [values[chunk[j]], values[chunk[i]]];
      }
    }
    const result = motif(values);
    onlyTriple += Number(result.onlyTriple);
    terminalWWW += Number(result.terminalWWW);
  }
  return {rounds, onlyTriple, terminalWWW};
}

function main() {
  const events = extract();
  const cipher = events.map((event) => event.value);
  const W = source.translit.indexOf("W");
  assert.deepEqual(cipher.slice(79, 82), [W, W, W]);
  assert.deepEqual(events.slice(79, 82).map((event) => event.page), [47, 48, 51]);
  assert.deepEqual(motif(cipher), {onlyTriple: true, terminalWWW: true});

  for (const trial of [
    {word: "HTTPWWW", start: 75, period: 7, key: [10, 16, 2, 0, 0, 0, 0], expected: 0.03255813953488372},
    {word: "HTTPSWWW", start: 74, period: 8, key: [6, 2, 16, 5, 27, 0, 0, 0], expected: 0.03228454172366621}
  ]) {
    const plain = [...trial.word].map((letter) => source.translit.indexOf(letter));
    assert.ok(plain.every((x) => x >= 0));
    for (let k = 1; k < trial.period; k++) {
      assert.equal(fit(cipher, trial.start, plain, k), null);
    }
    const recoveredKey = fit(cipher, trial.start, plain, trial.period);
    assert.deepEqual(recoveredKey, trial.key);
    const output = inverse(cipher, trial.start, recoveredKey);
    assert.ok(Math.abs(ioc(output) - trial.expected) < 1e-12);

    const native = source.pages.find((page) => page.page === 57).indices.slice(0, 86);
    for (let i = 0; i < plain.length; i++) native[trial.start + i] = plain[i];
    const plantKey = Array.from({length: trial.period}, (_, i) => i + 1);
    const plant = native.map((p, i) => mod(p + plantKey[mod(i - trial.start, trial.period)]));
    assert.deepEqual(fit(plant, trial.start, plain, trial.period), plantKey);
    assert.deepEqual(inverse(plant, trial.start, plantKey), native);
    console.log(trial.word + " period>=" + trial.period + " key=" + JSON.stringify(recoveredKey) +
      " IoC=" + ioc(output).toFixed(12) + " plant recovered 86/86");
    console.log("original inverse: " + output.map((i) => source.translit[i]).join(" "));
  }
  const calibration = chapterControl(events, 250000);
  assert.ok(calibration.terminalWWW > 100 && calibration.terminalWWW < 600);
  console.log("Chapter-inventory permutation results: " + JSON.stringify(calibration));
  console.log("Terminal WWW one-sided exploratory tail: " +
    ((calibration.terminalWWW + 1) / (calibration.rounds + 1)).toFixed(9));
  console.log("PASS");
}
main();
