"use strict";
/**
 * Issue #1936: source-selected p2 tortoise-shell / word-interior key gate.
 * Run: node sims/lp2_p2_tortoise_shell_wordkey_sft.cjs
 * Read-only; Node built-ins only.
 *
 * Frozen model:
 *   - whole words continue across '/' line breaks and '%' page breaks;
 *   - only '-.&$§' end a word;
 *   - shell is first+last GP29 rune (singleton exactly once);
 *   - shell is a repeating, word-local GP29 key for that word's strict interior;
 *   - decrypt interior by C - K mod 29, with no page reset.
 *
 * The p2 footer tortoise/turtle was the only source cue for the shell-key
 * interpretation. This script tests that one operation; it does not search
 * phases, signs, reversals, alternate segmentations or extra cipher layers.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const ALPHABET = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
const RUNES = new Set(ALPHABET);
const SOURCE_BLOB = "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7";
const SHAKESPEARE_BLOB = "94c677ad9dd50771c6670e0c4e4dad9052b46d85";
const GIBRAN_BLOB = "df260a07d56bf5998d40a6360b6132c35c252d10";

function gitBlob(text) {
  const bytes = Buffer.from(text, "utf8");
  return crypto.createHash("sha1")
    .update("blob " + bytes.length + "\0")
    .update(bytes)
    .digest("hex");
}
function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}
function parseWords(raw) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({ start, end: runes.length, values: current });
    current = [];
  };
  for (const ch of raw) {
    if (RUNES.has(ch)) {
      if (!current.length) start = runes.length;
      const value = ALPHABET.indexOf(ch);
      runes.push(value);
      current.push(value);
    } else if ("-.&$§".includes(ch)) {
      flush();
    }
  }
  flush();
  return { runes, words };
}
function gpWord(word, translit) {
  const ordered = translit.map((s, i) => ({ s, i }))
    .sort((a, b) => b.s.length - a.s.length);
  const text = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith("ING", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (text.startsWith("IO", i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const hit = ordered.find(x => text.startsWith(x.s, i));
    if (hit) {
      out.push(hit.i);
      i += hit.s.length;
    } else {
      i++;
    }
  }
  return out;
}
function pageRanges(corpus) {
  const out = new Map();
  let offset = 0;
  for (const page of corpus.pages) {
    out.set(page.page, { start: offset, end: offset + page.runic_count });
    offset += page.runic_count;
  }
  return { out, total: offset };
}
function pageData(page, words, range) {
  const overlapping = words.filter(w => w.end > range.start && w.start < range.end);
  const shellOffsets = [];
  const interiorOffsets = [];
  const rawSegments = [];
  const decodedSegments = [];
  for (const word of overlapping) {
    const n = word.values.length;
    const shell = n === 1
      ? [word.values[0]]
      : [word.values[0], word.values[n - 1]];
    const endpoints = n === 1 ? [word.start] : [word.start, word.end - 1];
    for (const position of endpoints) {
      if (position >= range.start && position < range.end) shellOffsets.push(position - range.start);
    }
    const rawPart = [];
    const decodedPart = [];
    const inside = word.values.slice(1, -1);
    for (let j = 0; j < inside.length; j++) {
      const position = word.start + 1 + j;
      if (position < range.start || position >= range.end) continue;
      const cipher = inside[j];
      const key = shell[j % shell.length];
      rawPart.push(cipher);
      decodedPart.push((cipher - key + 29) % 29);
      interiorOffsets.push(position - range.start);
    }
    if (rawPart.length) {
      rawSegments.push(rawPart);
      decodedSegments.push(decodedPart);
    }
  }
  return {
    page, range, overlappingWords: overlapping.length,
    firstWord: overlapping.length
      ? { start: overlapping[0].start, end: overlapping[0].end, length: overlapping[0].values.length }
      : null,
    shellOffsets, interiorOffsets, rawSegments, decodedSegments,
    raw: rawSegments.flat(), decoded: decodedSegments.flat()
  };
}
function makeBigramModel(text, translit) {
  const model = new Float64Array(29 * 29).fill(2);
  const totals = new Float64Array(29).fill(58);
  const reference = (text.match(/[A-Za-z]+/g) || []).flatMap(w => gpWord(w, translit));
  for (let i = 1; i < reference.length; i++) {
    model[29 * reference[i - 1] + reference[i]]++;
    totals[reference[i - 1]]++;
  }
  return { model, totals, referenceRunes: reference.length };
}
function measure(segments, model, totals) {
  let log = 0, pairs = 0;
  const histogram = new Float64Array(29);
  for (const segment of segments) {
    for (const value of segment) histogram[value]++;
    for (let i = 1; i < segment.length; i++) {
      log += Math.log(model[29 * segment[i - 1] + segment[i]] / totals[segment[i - 1]]);
      pairs++;
    }
  }
  const n = histogram.reduce((a, b) => a + b, 0);
  const ioc = histogram.reduce((sum, x) => sum + x * (x - 1), 0) / (n * (n - 1));
  return { runes: n, pairs, logBigramPerPair: log / pairs, ioc };
}
function assertRoundTrip(gibranWords) {
  let checked = 0;
  for (const word of gibranWords) {
    if (word.length < 3) continue;
    const shell = [word[0], word[word.length - 1]];
    const inside = word.slice(1, -1);
    const cipher = inside.map((x, i) => (x + shell[i % shell.length]) % 29);
    const recovered = cipher.map((x, i) => (x - shell[i % shell.length] + 29) % 29);
    assert.deepEqual(recovered, inside);
    checked++;
    if (checked === 256) break;
  }
  assert.equal(checked, 256);
  return checked;
}
function run() {
  const raw = read("resources/liber-primus/lp2-transcription.txt");
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const shakespeare = read("resources/control/shakespeare_first300k.txt");
  const gibran = read("resources/control/gibran_prophet_58585.txt");

  assert.equal(gitBlob(raw), SOURCE_BLOB);
  assert.equal(gitBlob(shakespeare), SHAKESPEARE_BLOB);
  assert.equal(gitBlob(gibran), GIBRAN_BLOB);
  assert.deepEqual(corpus.runes, ALPHABET);

  const parsed = parseWords(raw);
  const corpusRunes = corpus.pages.flatMap(p => p.indices).map(i => ALPHABET[i]).join("");
  assert.equal(parsed.runes.length, 13136);
  assert.equal(parsed.words.length, 2941);
  assert.equal(parsed.runes.map(i => ALPHABET[i]).join(""), corpusRunes);
  assert.equal(parsed.words.filter(w => w.start < 12956).length, 2896);

  const ranges = pageRanges(corpus);
  assert.equal(ranges.total, 13136);
  assert.deepEqual(ranges.out.get(1), { start: 262, end: 528 });
  assert.deepEqual(ranges.out.get(2), { start: 528, end: 729 });

  const p1 = pageData(1, parsed.words, ranges.out.get(1));
  const p2 = pageData(2, parsed.words, ranges.out.get(2));
  assert.equal(p2.overlappingWords, 38);
  assert.deepEqual(p2.firstWord, { start: 525, end: 530, length: 5 });
  assert.equal(p2.shellOffsets.length, 73);
  assert.equal(p2.interiorOffsets.length, 128);
  assert.equal(p1.interiorOffsets.length, 143);

  const language = makeBigramModel(shakespeare, corpus.translit);
  assert.equal(language.referenceRunes, 217106);
  const p1Raw = measure(p1.rawSegments, language.model, language.totals);
  const p1Decoded = measure(p1.decodedSegments, language.model, language.totals);
  const p2Raw = measure(p2.rawSegments, language.model, language.totals);
  const p2Decoded = measure(p2.decodedSegments, language.model, language.totals);

  const gibranWords = (gibran.match(/[A-Za-z]+/g) || [])
    .map(w => gpWord(w, corpus.translit)).filter(w => w.length);
  const gibranSegments = gibranWords.map(w => w.slice(1, -1)).filter(w => w.length);
  const gibranControl = measure(gibranSegments, language.model, language.totals);
  const roundTripWords = assertRoundTrip(gibranWords);

  assert.equal(p2Decoded.runes, 128);
  assert.equal(p2Decoded.pairs, 98);
  assert.ok(p2Decoded.logBigramPerPair < p2Raw.logBigramPerPair);
  assert.ok(p2Decoded.logBigramPerPair < gibranControl.logBigramPerPair - 1.5);
  assert.ok(p2Decoded.ioc < 0.04);
  assert.ok(gibranControl.ioc > 0.07);

  const decodedText = p2.decoded.map(x => corpus.translit[x]).join("");
  const result = {
    status: "rejected: p2 word-local shell-key model does not recover plaintext",
    source: {
      transcriptionGitBlob: SOURCE_BLOB,
      shakespeareGitBlob: SHAKESPEARE_BLOB,
      gibranGitBlob: GIBRAN_BLOB
    },
    frozenRule: {
      wordEnders: "-.&$§",
      lineAndPageBreaksEndWords: false,
      singletonShellCount: 1,
      key: "ordered first+last GP29 rune of each complete word",
      transform: "interior[j] - shell[j mod shell.length] mod29",
      reset: "printed word only"
    },
    p2: {
      range: p2.range,
      overlappingWords: p2.overlappingWords,
      carriedFirstWord: p2.firstWord,
      shellRunesInPage: p2.shellOffsets.length,
      interiorRunesInPage: p2.interiorOffsets.length,
      shellOffsets: p2.shellOffsets,
      interiorOffsets: p2.interiorOffsets,
      raw: p2Raw,
      decoded: p2Decoded,
      decodedSha256: sha256(p2.decoded.map(x => ALPHABET[x]).join("")),
      decodedTransliterationPreview: decodedText.slice(0, 96)
    },
    p1MatchedControl: {
      range: p1.range,
      interiorRunesInPage: p1.interiorOffsets.length,
      raw: p1Raw,
      decoded: p1Decoded
    },
    nativeGibranPositiveControl: gibranControl,
    implementationRoundTripWords: roundTripWords
  };
  console.log(JSON.stringify(result, null, 2));
}
run();
