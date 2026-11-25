#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const poem = read("resources/external/dickins1915-rune-poem-old-english.txt");
const native = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const mod = (x, n) => ((x % n) + n) % n;
const tokens = gp.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));

function keyText(text, ethMapping) {
  const out = [];
  const words = text.toUpperCase()
    .replace(/Æ/g, "AE")
    .replace(/Þ/g, "TH")
    .replace(/Ð/g, ethMapping)
    .match(/[A-Z]+/g) || [];
  for (let word of words) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/[KQ]/g, "C").replace(/Z/g, "S")
      .replace(/ING/g, "NG").replace(/IO/g, "IA");
    while (word.length) {
      const token = tokens.find((t) => word.startsWith(t.s));
      if (!token) throw new Error("Unmapped source text: " + word);
      out.push(token.i);
      word = word.slice(token.s.length);
    }
  }
  return out;
}

const stanzas = poem.trim().split(/\n\s*\n/);
if (stanzas.length !== 29) throw new Error("Expected 29 Rune Poem stanzas");
const pages = gp.pages.slice(0, 3);
const pageLengths = pages.map((p) => p.indices.length);
const ciphertext = pages.flatMap((p) => p.indices).slice(13);
if (ciphertext.length !== 716) throw new Error("Unexpected p0-p2 black-body length");

const nativeSections = native.sections.map((section) =>
  Array.from(section.source_text.match(/[\u16a0-\u16ff]/gu) || [], (r) => {
    const i = runeIndex.get(r);
    if (i === undefined) throw new Error("Native section contains non-GP29 rune " + r);
    return i;
  })
);
const counts = new Float64Array(30 * 30 * 29).fill(0.2);
const denominators = new Float64Array(30 * 30).fill(29 * 0.2);
for (const section of nativeSections) {
  let a = 29, b = 29;
  for (const x of section) {
    const cell = a * 30 + b;
    counts[cell * 29 + x] += 1;
    denominators[cell] += 1;
    a = b;
    b = x;
  }
}

function scoreAndIoc(plain) {
  let score = 0, a = 29, b = 29;
  const frequencies = new Map();
  for (const x of plain) {
    const cell = a * 30 + b;
    score += Math.log(counts[cell * 29 + x] / denominators[cell]);
    frequencies.set(x, (frequencies.get(x) || 0) + 1);
    a = b;
    b = x;
  }
  const iocNumerator = [...frequencies.values()].reduce((s, n) => s + n * (n - 1), 0);
  return {
    native_trigram_nats_per_rune: score / plain.length,
    index_of_coincidence: iocNumerator / (plain.length * (plain.length - 1))
  };
}

const results = ["TH", "D"].map((ethMapping) => {
  const stanzaKeys = stanzas.map((stanza) => keyText(stanza, ethMapping));
  const startOffset = stanzaKeys[0].length + stanzaKeys[1].length;
  const runningKey = stanzaKeys.slice(2).flat();
  if (runningKey.length < ciphertext.length) throw new Error("Running key is too short");
  const plain = ciphertext.map((c, i) => mod(c - runningKey[i], 29));
  return {
    eth_mapping: ethMapping,
    stanza_count: stanzas.length,
    first_two_stanza_lengths: stanzaKeys.slice(0, 2).map((x) => x.length),
    key_offset_at_thorn: startOffset,
    running_key_length: runningKey.length,
    ciphertext_length: ciphertext.length,
    first_key_rune: gp.translit[runningKey[0]],
    first_cipher_rune: gp.translit[ciphertext[0]],
    first_plain_rune: gp.translit[plain[0]],
    ...scoreAndIoc(plain),
    first_50_plain_runes: plain.slice(0, 50).map((x) => gp.translit[x]).join(" ")
  };
});

console.log(JSON.stringify({
  source: "Dickins 1915 Anglo-Saxon Rune Poem, Old English text",
  selector: "p0 twig -> Thorn, stanza 3; no phase search",
  operation: "P = C - K mod 29; nonrepeating continuous running key; no page resets",
  page_lengths: pageLengths,
  p0_red_heading_runes_dropped: 13,
  black_body_tape_length: ciphertext.length,
  native_sections: nativeSections.length,
  results
}, null, 2));
