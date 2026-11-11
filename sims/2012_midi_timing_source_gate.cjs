#!/usr/bin/env node
"use strict";

// Reproduce the raw 2012 MIDI timing gate against the pinned decrypted archive.
// Usage: node sims/2012_midi_timing_source_gate.cjs /path/to/song.mid
// No dependencies. The input must match the pinned Git blob exactly.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const EXPECTED_BLOB_SHA1 = "11924e0e195208c2eea757655035e149fb8a190f";
const MIDI_PATH = process.argv[2];
if (!MIDI_PATH) {
  throw new Error("Usage: node sims/2012_midi_timing_source_gate.cjs /path/to/song.mid");
}
const bytes = fs.readFileSync(MIDI_PATH);
const gitBlobSha1 = crypto.createHash("sha1")
  .update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]))
  .digest("hex");
assert.equal(bytes.length, 10889, "unexpected MIDI byte length");
assert.equal(gitBlobSha1, EXPECTED_BLOB_SHA1, "input is not the pinned song.mid Git blob");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
assert.equal(corpus.translit.length, 29, "expected published GP29 transliteration order");

function readVlq(buf, state, end) {
  let value = 0;
  for (let i = 0; i < 4; i++) {
    if (state.offset >= end) throw new Error("truncated MIDI variable-length quantity");
    const byte = buf[state.offset++];
    value = value * 128 + (byte & 0x7f);
    if ((byte & 0x80) === 0) return value;
  }
  throw new Error("MIDI variable-length quantity exceeds four bytes");
}

function parseMidi(buf) {
  if (buf.toString("ascii", 0, 4) !== "MThd") throw new Error("missing MThd");
  const headerLength = buf.readUInt32BE(4);
  const format = buf.readUInt16BE(8);
  const trackCount = buf.readUInt16BE(10);
  const division = buf.readUInt16BE(12);
  let offset = 8 + headerLength;
  const tracks = [];

  for (let trackIndex = 0; trackIndex < trackCount; trackIndex++) {
    if (buf.toString("ascii", offset, offset + 4) !== "MTrk") {
      throw new Error(`missing MTrk for track ${trackIndex}`);
    }
    const length = buf.readUInt32BE(offset + 4);
    offset += 8;
    const end = offset + length;
    let tick = 0;
    let runningStatus = 0;
    const events = [];
    const meta = [];

    while (offset < end) {
      const state = { offset };
      const delta = readVlq(buf, state, end);
      offset = state.offset;
      tick += delta;

      let status = buf[offset++];
      if (status < 0x80) {
        offset--;
        if (!runningStatus) throw new Error("data byte without running status");
        status = runningStatus;
      } else if (status < 0xf0) {
        runningStatus = status;
      }

      if (status === 0xff) {
        const type = buf[offset++];
        const state = { offset };
        const size = readVlq(buf, state, end);
        offset = state.offset;
        const data = Buffer.from(buf.subarray(offset, offset + size));
        offset += size;
        meta.push({ type, tick, data });
        continue;
      }

      if (status === 0xf0 || status === 0xf7) {
        const state = { offset };
        const size = readVlq(buf, state, end);
        offset = state.offset + size;
        continue;
      }

      const type = status & 0xf0;
      const channel = status & 0x0f;
      const note = buf[offset++];
      const oneDataByte = type === 0xc0 || type === 0xd0;
      const velocity = oneDataByte ? 0 : buf[offset++];

      if (type === 0x90 && velocity > 0) {
        events.push({ kind: "on", channel, note, velocity, delta, tick });
      } else if (type === 0x80 || (type === 0x90 && velocity === 0)) {
        events.push({ kind: "off", channel, note, velocity, delta, tick });
      }
    }

    if (offset !== end) throw new Error(`track ${trackIndex} length mismatch`);
    tracks.push({ events, meta, endTick: tick });
    offset = end;
  }

  return { format, trackCount, division, tracks };
}

const midi = parseMidi(bytes);
assert.equal(midi.format, 1);
assert.equal(midi.trackCount, 3);
assert.equal(midi.division, 96);

const textEvent = midi.tracks[0].meta.find(e => e.type === 0x01);
const timeSigEvents = midi.tracks.slice(1).map(t => t.meta.find(e => e.type === 0x58));
const tempoEvents = midi.tracks.slice(1).map(t => t.meta.find(e => e.type === 0x51));
const keySigEvent = midi.tracks[1].meta.find(e => e.type === 0x59);
assert(textEvent, "missing MIDI text timestamp");
assert(timeSigEvents.every(Boolean), "missing time signature in a musical track");
assert(tempoEvents.every(Boolean), "missing tempo in a musical track");

const timeSig = timeSigEvents[0].data;
const numerator = timeSig[0];
const denominator = 2 ** timeSig[1];
assert.equal(numerator, 7);
assert.equal(denominator, 2);
assert(timeSigEvents.every(e => e.data.equals(timeSig)), "tracks disagree on time signature");
const ticksPerQuarter = midi.division;
const ticksPerBar = numerator * (4 / denominator) * ticksPerQuarter;
assert.equal(ticksPerBar, 1344);

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a - b);
}

function summarizeTrack(track) {
  const ons = track.events.filter(e => e.kind === "on");
  const offs = track.events.filter(e => e.kind === "off");
  const pending = new Map();
  const pairs = [];
  let unmatchedOff = 0;

  for (const event of track.events) {
    const key = `${event.channel}:${event.note}`;
    if (event.kind === "on") {
      if (!pending.has(key)) pending.set(key, []);
      pending.get(key).push(event.tick);
    } else {
      const queue = pending.get(key) || [];
      if (!queue.length) {
        unmatchedOff++;
      } else {
        const onTick = queue.shift();
        pairs.push({
          note: event.note,
          onTick,
          offTick: event.tick,
          offDelta: event.delta,
          duration: event.tick - onTick
        });
      }
    }
  }

  const unmatchedOn = [...pending.values()].reduce((n, queue) => n + queue.length, 0);
  const durations = pairs.map(p => p.duration);
  const offSums = offs.map(e => e.note + e.delta);
  const onSums = ons.map(e => e.note + e.delta);
  const barPositionSums = offs.map(e => e.note + (e.tick % ticksPerBar));
  const barIndexSums = offs.map(e => e.note + Math.floor(e.tick / ticksPerBar));

  return {
    noteOnEvents: ons.length,
    noteOffEvents: offs.length,
    pairedNotes: pairs.length,
    unmatchedOn,
    unmatchedOff,
    noteOffDeltaEqualsPairedDuration: pairs.every(p => p.offDelta === p.duration),
    durationTicks: uniqueSorted(durations),
    uniqueNotePlusOffDelta: uniqueSorted(offSums).length,
    uniqueNotePlusDuration: uniqueSorted(pairs.map(p => p.note + p.duration)).length,
    uniqueNotePlusOnDelta: uniqueSorted(onSums).length,
    uniqueNotePlusBarPosition: uniqueSorted(barPositionSums).length,
    uniqueNotePlusBarIndex: uniqueSorted(barIndexSums).length,
    notePlusOffDeltaValues: uniqueSorted(offSums),
    pairs
  };
}

const track1 = summarizeTrack(midi.tracks[1]);
const track2 = summarizeTrack(midi.tracks[2]);
assert.equal(track1.noteOnEvents, 558);
assert.equal(track1.noteOffEvents, 558);
assert.equal(track1.pairedNotes, 558);
assert.equal(track1.unmatchedOn + track1.unmatchedOff, 0);
assert(track1.noteOffDeltaEqualsPairedDuration);
assert.equal(track1.uniqueNotePlusOffDelta, 25);
assert.equal(track1.uniqueNotePlusOnDelta, 30);

assert.equal(track2.noteOnEvents, 714);
assert.equal(track2.noteOffEvents, 714);
assert.equal(track2.pairedNotes, 714);
assert.equal(track2.unmatchedOn + track2.unmatchedOff, 0);
assert(track2.noteOffDeltaEqualsPairedDuration);
assert.equal(track2.uniqueNotePlusOffDelta, 23);
assert.equal(track2.uniqueNotePlusOnDelta, 26);

const sequence = track2.pairs.map(p => `${p.note}:${p.offDelta}`);
function minimalPeriod(seq) {
  for (let period = 1; period <= seq.length; period++) {
    if (seq.length % period !== 0) continue;
    let valid = true;
    for (let i = period; i < seq.length; i++) {
      if (seq[i] !== seq[i % period]) { valid = false; break; }
    }
    if (valid) return period;
  }
  return seq.length;
}
const cycleEvents = minimalPeriod(sequence);
const repeatCount = sequence.length / cycleEvents;
const cycles = Array.from({ length: repeatCount }, (_, i) =>
  track2.pairs.slice(i * cycleEvents, (i + 1) * cycleEvents)
);
const cycleTicks = cycles.map(c => c[c.length - 1].offTick - c[0].onTick);
const cycleBars = cycleTicks.map(t => t / ticksPerBar);
assert.equal(cycleEvents, 238);
assert.equal(repeatCount, 3);
assert(cycles.every(c => c.length === 238));
assert(cycleBars.every(n => n === 23));
assert(cycles.every(c =>
  c.every((p, j) => `${p.note}:${p.offDelta}` === sequence[j])
));

const onsetFreq = new Map();
for (const e of midi.tracks[1].events.filter(e => e.kind === "on")) {
  const value = e.note + e.delta;
  onsetFreq.set(value, (onsetFreq.get(value) || 0) + 1);
}
const spaceCandidate = [...onsetFreq.entries()]
  .sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
const onsetValues = uniqueSorted([...onsetFreq.keys()]);
const runeValues = onsetValues.filter(v => v !== spaceCandidate[0]);
assert.equal(runeValues.length, 29);
const onsetMap = new Map(runeValues.map((v, i) => [v, corpus.translit[i]]));
const onsetPreview = midi.tracks[1].events
  .filter(e => e.kind === "on")
  .map(e => e.note + e.delta === spaceCandidate[0]
    ? " "
    : onsetMap.get(e.note + e.delta))
  .join("");
const combinedOffSums = uniqueSorted([
  ...track1.notePlusOffDeltaValues,
  ...track2.notePlusOffDeltaValues
]);
const transcription = fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-transcription.txt"),
  "utf8"
).replace(/\\r/g, "");
const page36Text = transcription.split(/\\n%\\n/)[36];
assert(page36Text, "missing page 36 in the project transcription");
const runeSet = new Set(corpus.runes);
const p36LineLengths = page36Text.split(/\\n/)
  .filter(line => line && line !== "&" && line !== "$" && line !== "%")
  .map(line => [...line].filter(ch => runeSet.has(ch)).length)
  .filter(n => n > 0);
const p36GroupLengths = page36Text.split("-")
  .map(group => [...group].filter(ch => runeSet.has(ch)).length)
  .filter(n => n > 0);
const barNoteOnCounts = Array.from({ length: cycleBars[0] }, () => 0);
for (const pair of track2.pairs.slice(0, cycleEvents)) {
  barNoteOnCounts[Math.floor(pair.onTick / ticksPerBar)]++;
}
function hasContiguousPartition(groupLengths, targets) {
  const dp = Array.from({ length: targets.length + 1 },
    () => Array(groupLengths.length + 1).fill(false));
  dp[0][0] = true;
  for (let j = 1; j <= targets.length; j++) {
    for (let i = 1; i <= groupLengths.length; i++) {
      let sum = 0;
      for (let k = i; k >= 1; k--) {
        sum += groupLengths[k - 1];
        if (sum > targets[j - 1]) break;
        if (sum === targets[j - 1] && dp[j - 1][k - 1]) {
          dp[j][i] = true;
          break;
        }
      }
    }
  }
  return dp[targets.length][groupLengths.length];
}
const p36BarAlignment = {
  transcription: "resources/liber-primus/lp2-transcription.txt",
  page: 36,
  runes: p36LineLengths.reduce((a, b) => a + b, 0),
  printedLines: p36LineLengths.length,
  lineRuneCounts: p36LineLengths,
  hyphenDelimitedGroups: p36GroupLengths.length,
  groupRuneCounts: p36GroupLengths,
  midiChorusBarNoteOnCounts: barNoteOnCounts,
  barCountsSum: barNoteOnCounts.reduce((a, b) => a + b, 0),
  directBarToLineMatch: JSON.stringify(barNoteOnCounts) === JSON.stringify(p36LineLengths),
  contiguousGroupPartitionMatchesBars: hasContiguousPartition(p36GroupLengths, barNoteOnCounts)
};
assert.equal(p36BarAlignment.runes, 238);
assert.equal(p36BarAlignment.printedLines, 11);
assert.equal(p36BarAlignment.hyphenDelimitedGroups, 50);
assert.equal(p36BarAlignment.barCountsSum, 238);
assert.equal(p36BarAlignment.directBarToLineMatch, false);
assert.equal(p36BarAlignment.contiguousGroupPartitionMatchesBars, false);

const keySignature = keySigEvent
  ? { signedSharpsFlats: keySigEvent.data[0] > 127 ? keySigEvent.data[0] - 256 : keySigEvent.data[0], minor: !!keySigEvent.data[1] }
  : null;

const output = {
  source: {
    repository: "neuroretransmit/cicada",
    commit: "b13600373d3400d75ec4208198019f3d92a304dd",
    path: "2012/009-midi-puzzle/song.mid",
    gitBlobSha1,
    sizeBytes: bytes.length,
    timestamp: textEvent.data.toString("utf8")
  },
  midi: {
    format: midi.format,
    trackCount: midi.trackCount,
    ticksPerQuarter,
    tempoMicrosecondsPerQuarter: tempoEvents[0].data.readUIntBE(0, 3),
    timeSignature: { numerator, denominator, ticksPerBar },
    keySignature
  },
  track1: { ...track1, pairs: undefined },
  track2: {
    ...track2,
    pairs: undefined,
    cycles: repeatCount,
    eventsPerCycle: cycleEvents,
    cycleTicks,
    cycleBars,
    totalBars: track2.pairs.at(-1).offTick / ticksPerBar,
    repeatedNoteAndOffDeltaCycles: true
  },
  combinedDistinctNotePlusOffDelta: combinedOffSums.length,
  noteOnGp29PlusBoundaryProbe: {
    track1UniqueStates: onsetValues.length,
    track2UniqueStates: track2.uniqueNotePlusOnDelta,
    mostFrequentStateAsBoundary: { value: spaceCandidate[0], frequency: spaceCandidate[1] },
    remainingStatesMappedInSortedOrderToPublishedGp29Transliteration: true,
    decodedWordCount: onsetPreview.trim().split(/\s+/).length,
    decodedPreview: onsetPreview.slice(0, 160),
    readablePlaintext: false,
    classification: "exploratory only; note-on timing is not selected by the historical decoder"
  },
  decision: "No source-selected 29-symbol LP2 key or reusable key stream. The historical note-off mapping remains a 25/23-symbol 2012 substitution; the 23-bar/23-pair equality is internal to the chorus. The 30-state note-on alternative does not decode to readable text and has no independent selector.",
  p36BarAlignment
};
console.log(JSON.stringify(output, null, 2));
