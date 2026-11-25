"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const ROOT = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const midi = JSON.parse(read("im-results/2012-midi-chorus-p36-238-inputs.json"));
const chorusDoc = read("resources/control/cicada2012_blake_chorus.txt");
const sourceText = chorusDoc.split("BEGIN SOURCE TEXT")[1]
  .split("END SOURCE TEXT")[0].trim();
const letters = sourceText.replace(/[^A-Za-z]/g, "").toUpperCase().split("");
const p36 = corpus.pages.find((page) => page.page === 36).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
const P = 29;

assert.equal(letters.length, 238);
assert.equal(p36.length, 238);
assert.equal(midi.first_cycle_note_plus_delta_sums.length, 238);
assert.equal(midi.source.track2_note_off_events, 714);
assert.equal(midi.source.track2_unique_note_plus_delta_sums, 23);
assert.equal(midi.source.repeat_count, 3);

const keyAlphabet = midi.source.track2_key_alphabet;
const sums = midi.first_cycle_note_plus_delta_sums;
const sortedSums = [...new Set(sums)].sort((a, b) => a - b);
const rankKey = sums.map((sum) => sortedSums.indexOf(sum));
assert.equal(sortedSums.length, 23);
assert.equal(rankKey.map((rank) => keyAlphabet[rank]).join(""),
  letters.join("").toLowerCase());

const gpMap = new Map(corpus.translit.map((value, index) => [value, index]));
gpMap.set("K", gpMap.get("C"));
gpMap.set("V", gpMap.get("U"));
const gpKey = letters.map((letter) => gpMap.get(letter));
assert.ok(gpKey.every(Number.isInteger));
assert.equal(new Set(gpKey).size, 21);

const barCounts = midi.timing_gate.p36_bar_alignment.midi_chorus_bar_note_on_counts;
assert.equal(barCounts.length, 23);

function mod(value) {
  return ((value % P) + P) % P;
}

function ioc(values) {
  const counts = Array(P).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}

function columnLengths(length, width) {
  const full = Math.floor(length / width);
  const remainder = length % width;
  return Array.from({ length: width }, (_, column) =>
    full + (column < remainder ? 1 : 0));
}

function columnOrder(descending) {
  return Array.from({ length: 23 }, (_, column) => column)
    .sort((a, b) =>
      (descending ? barCounts[b] - barCounts[a] : barCounts[a] - barCounts[b])
      || a - b);
}

function forwardColumnar(input, order) {
  const columns = Array.from({ length: 23 }, (_, column) =>
    input.filter((_, index) => index % 23 === column));
  return order.flatMap((column) => columns[column]);
}

function inverseColumnar(input, order) {
  const lengths = columnLengths(input.length, 23);
  const columns = Array(23);
  let offset = 0;
  for (const column of order) {
    columns[column] = input.slice(offset, offset + lengths[column]);
    offset += lengths[column];
  }
  assert.equal(offset, input.length);
  const output = [];
  for (let row = 0; row < Math.max(...lengths); row++) {
    for (let column = 0; column < 23; column++) {
      if (row < columns[column].length) output.push(columns[column][row]);
    }
  }
  return output;
}

const lengths = columnLengths(gpKey.length, 23);
assert.deepEqual(lengths, [11,11,11,11,11,11,11,11,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10]);

const variants = [];
for (const descending of [false, true]) {
  const order = columnOrder(descending);
  const forward = forwardColumnar(gpKey, order);
  const inverse = inverseColumnar(gpKey, order);
  assert.deepEqual(inverseColumnar(forward, order), gpKey);
  assert.deepEqual(forwardColumnar(inverse, order), gpKey);

  for (const [direction, key] of [["forward", forward], ["inverse", inverse]]) {
    assert.equal(key.length, 238);
    assert.equal(ioc(key), ioc(gpKey));

    // Positive control: the selected key always round-trips a planted 238-rune stream.
    const plant = Array.from({ length: 238 }, (_, index) => (index * 7 + 3) % P);
    for (const sign of [-1, 1]) {
      const encrypted = plant.map((value, index) => mod(value + sign * key[index]));
      const recovered = encrypted.map((value, index) => mod(value - sign * key[index]));
      assert.deepEqual(recovered, plant);
    }

    for (const sign of [-1, 1]) {
      const output = p36.map((value, index) => mod(value + sign * key[index]));
      variants.push({
        bar_count_order: descending ? "descending" : "ascending",
        transposition: direction,
        sign: sign === -1 ? "C-K" : "C+K",
        column_order: order,
        key_ioc: ioc(key),
        output_ioc: ioc(output),
        preview_first_80: output.slice(0, 80).map((value) => corpus.translit[value]).join(" ")
      });
    }
  }
}

const result = {
  hypothesis: "Use the 23 MIDI bars as 23 columns; sort columns by per-bar Track-2 note-on counts; use the resulting transposed GP29 chorus as a running key for p36.",
  source: {
    midi_blob_sha1: midi.source.blob_sha1,
    midi_note_off_events: midi.source.track2_note_off_events,
    chorus_length: letters.length,
    midi_bar_note_on_counts: barCounts,
    gp29_key_distinct_symbols: new Set(gpKey).size
  },
  dimensions: {
    p36_runes: p36.length,
    chorus_letters: letters.length,
    columns: 23,
    column_lengths: lengths,
    p36_ioc: ioc(p36),
    chorus_gp29_ioc: ioc(gpKey),
    p57_native_ioc: ioc(p57),
    uniform_ioc: 1 / P
  },
  variants,
  decision: "All eight fixed variants remain near the random GP29 IoC baseline; this 23-bar note-count columnar running-key receiver does not recover p36 plaintext."
};

assert.equal(variants.length, 8);
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
