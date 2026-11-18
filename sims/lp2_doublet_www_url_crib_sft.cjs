"use strict";
const assert = require("node:assert/strict");
const source = require("../resources/liber-primus/lp2-corpus.json");
const mod = (n, k = 29) => ((n % k) + k) % k;

/** @param {number} value @returns {boolean} */
function prime(value) {
  if (value < 2) return false;
  for (let d = 2; d * d <= value; d++) if (value % d === 0) return false;
  return true;
}

/** @param {number} value @returns {number} */
function popcount(value) {
  let count = 0;
  for (let x = value; x > 0; x = Math.floor(x / 2)) count += x % 2;
  return count;
}

/** Generate A194954 terms no larger than maxValue. */
function a194954Through(maxValue) {
  const values = [2];
  for (let n = 2; ; n++) {
    const step = popcount(n - 1);
    let candidate = values[values.length - 1] + step;
    while (!prime(candidate)) candidate += step;
    if (candidate > maxValue) return values;
    values.push(candidate);
  }
}

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
  let onlyTriple = 0, terminalWWW = 0, exactBoundaryWWW = 0;
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
    exactBoundaryWWW += Number(
      result.onlyTriple &&
      values[79] === source.translit.indexOf("W") &&
      values[80] === source.translit.indexOf("W") &&
      values[81] === source.translit.indexOf("W")
    );
  }
  return {rounds, onlyTriple, terminalWWW, exactBoundaryWWW};
}


/** Recover a repeating additive key while a WWW marker or every W skips its key tick. */
function transparent(cipher, start, plaintext, mode) {
  const W = source.translit.indexOf("W");
  const skip = cipher.map((value, i) => mode === "all-W" ? value === W : i >= 79 && i <= 81);
  let consumed = 0;
  const tick = skip.map((s) => s ? null : consumed++);
  const length = plaintext.length;
  const keys = Array(length).fill(null);
  for (let i = 0; i < length; i++) {
    const at = start + i;
    assert.equal(skip[at], false);
    const needed = mod(cipher[at] - plaintext[i]);
    const phase = tick[at] % length;
    if (keys[phase] !== null && keys[phase] !== needed) return null;
    keys[phase] = needed;
  }
  assert.ok(keys.every((key) => key !== null));
  return {
    keys, tick, skip,
    output: cipher.map((c, i) => skip[i] ? c : mod(c - keys[tick[i] % length]))
  };
}


/** Test consistency of every potential fixed rune alphabet, without enumerating 29! keys. */
function fixedBijectionCompatible(cipher, plain) {
  assert.equal(cipher.length, plain.length);
  const forward = Array(29).fill(null);
  const reverse = Array(29).fill(null);
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i], p = plain[i];
    if ((forward[c] !== null && forward[c] !== p) ||
        (reverse[p] !== null && reverse[p] !== c)) return false;
    forward[c] = p;
    reverse[p] = c;
  }
  return true;
}

function main() {
  const events = extract();
  const cipher = events.map((event) => event.value);
  const W = source.translit.indexOf("W");
  assert.deepEqual(cipher.slice(79, 82), [W, W, W]);
  assert.deepEqual(events.slice(79, 82).map((event) => event.page), [47, 48, 51]);
  assert.deepEqual(motif(cipher), {onlyTriple: true, terminalWWW: true});

  // The independently preserved 2014 whitespace clue identifies A194954.
  // Exactly 19 terms fit inside this 86-event channel; the last is 79 and
  // the next term is 97. The manuscript's WWW begins at the next event.
  const a = a194954Through(events.length);
  assert.deepEqual(a, [2,3,5,7,11,13,17,23,29,31,37,43,47,53,59,67,71,73,79]);
  assert.equal(a.length, 19);
  assert.equal(a[a.length - 1], 79);
  assert.equal(a194954Through(97).at(-1), 97);
  assert.deepEqual(cipher.slice(a[a.length - 1], a[a.length - 1] + 3), [W, W, W]);

  // Read the source sequence as successive one-based jumps. The first eight
  // terms remain inside 86 events, landing at 2,5,10,17,28,41,58,81.
  // The ninth jump exits at 110. The final reachable event is the middle W of
  // the independently selected WWW triplet.
  const cumulative = [];
  let position = 0;
  for (const step of a) {
    if (position + step > events.length) break;
    position += step;
    cumulative.push(position);
  }
  assert.deepEqual(cumulative, [2, 5, 10, 17, 28, 41, 58, 81]);
  assert.equal(cumulative.reduce((_, value) => value, 0), 81);
  assert.equal(a.slice(0, cumulative.length).reduce((sum, value) => sum + value, 0), 81);
  assert.equal(events[80].page, 48);
  assert.equal(cipher[80], W);
  assert.equal(81 + a[cumulative.length], 110);

  const t = (value) => [...value].map((letter) => source.translit.indexOf(letter));
  assert.equal(fixedBijectionCompatible(cipher.slice(75, 79), t("HTTP")), false);
  assert.equal(fixedBijectionCompatible(cipher.slice(82, 86), t("HTTP")), false);
  assert.equal(fixedBijectionCompatible(cipher.slice(82, 86).reverse(), t("HTTP")), false);
  assert.equal(fixedBijectionCompatible(cipher.slice(74, 79), t("HTTPS")), false);
  assert.equal(fixedBijectionCompatible(t("HTTP"), t("HTTP")), true);
  for (const word of ["HTTP", "HTTPS"]) {
    const plain = t(word);
    for (let i = 0; i + plain.length <= cipher.length; i++) {
      assert.equal(fixedBijectionCompatible(cipher.slice(i, i + plain.length), plain), false,
        "No contiguous literal " + word + " anywhere under any 29-way bijection");
    }
  }
  console.log("All-secret fixed-alphabet HTTP(S) anywhere and both WWW directions PASS");
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
  for (const mode of ["WWW-only", "all-W"]) {
    for (const spelling of ["HTTP", "HTTPS"]) {
      const start = spelling.length === 4 ? 75 : 74;
      const plaintext = [...spelling].map((letter) => source.translit.indexOf(letter));
      const outcome = transparent(cipher, start, plaintext, mode);
      assert.ok(outcome);
      assert.deepEqual(outcome.output.slice(start, start + plaintext.length), plaintext);
      assert.deepEqual(outcome.output.slice(79, 82), [W, W, W]);
      const target = source.pages.find((page) => page.page === 57).indices.slice(0, 86);
      const plantedKey = Array.from({length: spelling.length}, (_, i) => i + 1);
      for (let i = 0; i < plaintext.length; i++) target[start + i] = plaintext[i];
      const plant = Array(86);
      for (let i = 0; i < 86; i++) {
        if (outcome.skip[i]) {
          target[i] = W;
          plant[i] = W;
        } else {
          let encrypted = mod(target[i] + plantedKey[outcome.tick[i] % spelling.length]);
          if (mode === "all-W" && encrypted === W) {
            target[i] = mod(target[i] + 1);
            encrypted = mod(target[i] + plantedKey[outcome.tick[i] % spelling.length]);
          }
          plant[i] = encrypted;
        }
      }
      const control = transparent(plant, start, plaintext, mode);
      assert.ok(control);
      assert.deepEqual(control.keys, plantedKey);
      assert.deepEqual(control.output, target);
      console.log(mode + " transparent " + spelling + " inferred-key=" +
        JSON.stringify(outcome.keys) + " full-original-IoC=" + ioc(outcome.output).toFixed(12) +
        " plant 86/86");
      console.log("original inverse: " + outcome.output.map((i) => source.translit[i]).join(" "));
    }
  }
  const calibration = chapterControl(events, 250000);
  assert.equal(calibration.onlyTriple, 2938);
  assert.equal(calibration.terminalWWW, 274);
  assert.equal(calibration.exactBoundaryWWW, 122);
  console.log("A194954 boundary: 19 terms <=86, last=79, events80-82=WWW");
  console.log("A194954 cumulative jumps: " + JSON.stringify(cumulative) +
    " final reachable event=81 (middle W), next=110 exits");
  console.log("Chapter-inventory permutation results: " + JSON.stringify(calibration));
  console.log("Terminal WWW one-sided exploratory tail: " +
    ((calibration.terminalWWW + 1) / (calibration.rounds + 1)).toFixed(9));
  console.log("Exact A194954-boundary WWW tail: " +
    ((calibration.exactBoundaryWWW + 1) / (calibration.rounds + 1)).toFixed(9));
  console.log("PASS");
}
main();
