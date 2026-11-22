#!/usr/bin/env node
"use strict";

// Reproduce the finite row-major CUNEIFORM_STREAM experiment from
// cicada-solvers/JBO-cicada_tools without copying its code or wordlist.
// Usage: node sims/lp2_cuneiform_table256_rowmajor_keystream_sft.cjs /path/to/english_wordlist.txt /path/to/JBO-cicada_tools/liber_primus

const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const WORDLIST_GIT_BLOB_SHA = "29deee2071c60b907f071f5d0a1ebfa1a3c57a18";
const WORDLIST_URL = "https://github.com/cicada-solvers/JBO-cicada_tools/blob/main/english_wordlist.txt";
const SECTION_SPECS = [
  { name: "011_mayfly", pages: [23, 24, 25, 26], runes: 1021 },
  { name: "012_wing_tree", pages: [27, 28, 29, 30, 31, 32], runes: 1433 },
  { name: "013_cuneiform", pages: [33, 34, 35, 36, 37, 38, 39], runes: 1680 },
  { name: "014_spiral_branches", pages: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53], runes: 3008 },
  { name: "015_hollow", pages: [54, 55], runes: 308 },
];
const CHUNK_PERMUTATIONS = [
  ["digits", "upper", "lower"],
  ["digits", "lower", "upper"],
  ["upper", "digits", "lower"],
  ["upper", "lower", "digits"],
  ["lower", "digits", "upper"],
  ["lower", "upper", "digits"],
];
const CHUNKS = {
  digits: "0123456789",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwx",
};

function fail(message) {
  throw new Error(message);
}
function englishToRunes(word, runes, latin) {
  let s = Array.from(word).filter(ch => /[A-Za-z]/.test(ch)).join("").toUpperCase();
  for (const [from, to] of [["ING", "NG"], ["IO", "IA"], ["QU", "CW"], ["K", "C"], ["U", "V"], ["Z", "S"], ["Q", "C"]]) {
    s = s.split(from).join(to);
  }
  for (let i = 0; i < runes.length; i++) if (latin[i].length > 1) s = s.split(latin[i]).join(runes[i]);
  for (let i = 0; i < runes.length; i++) s = s.split(latin[i]).join(runes[i]);
  return s;
}
function normalizedIoc(indices) {
  const counts = Array(29).fill(0);
  for (const x of indices) counts[x]++;
  const n = indices.length;
  return 29 * counts.reduce((sum, f) => sum + f * (f - 1), 0) / (n * (n - 1));
}
function transform(indices, key, sign) {
  const out = indices.slice();
  for (let i = 0; i < Math.min(256, out.length); i++) out[i] = (out[i] + sign * key[i] + 2900) % 29;
  return out;
}
function runeWords(raw, processed, runes, runeIndex) {
  let out = "", ri = 0;
  for (const ch of Array.from(raw)) {
    if (runeIndex.has(ch)) out += runes[processed[ri++]];
    else if (ch === "-") out += " ";
    else if (ch === ".") out += ". ";
    else out += ch;
  }
  const filtered = Array.from(out.replace(/\./g, " ")).filter(ch => runeIndex.has(ch) || ch === " ").join("");
  return filtered.split(" ").filter(Boolean);
}
function main() {
  const wordlistPath = process.argv[2];
  const sectionsDir = process.argv[3];
  if (!wordlistPath || !sectionsDir) {
    fail("Usage: node sims/lp2_cuneiform_table256_rowmajor_keystream_sft.cjs <english_wordlist.txt> <JBO-cicada_tools/liber_primus>; wordlist: " + WORDLIST_URL);
  }
  const wordBytes = fs.readFileSync(wordlistPath);
  const blobSha = createHash("sha1")
    .update(Buffer.from("blob " + wordBytes.length + "\0", "utf8"))
    .update(wordBytes)
    .digest("hex");
  if (blobSha !== WORDLIST_GIT_BLOB_SHA) fail("Wordlist Git blob SHA mismatch: " + blobSha);

  const grid = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
  const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const runes = corpus.runes;
  const latin = corpus.translit;
  const runeIndex = new Map(runes.map((r, i) => [r, i]));
  const tokens = grid.pages.flatMap(p => p.tokens);
  if (tokens.length !== 256) fail("Expected exactly 256 row-major table tokens");
  const pageMap = new Map(corpus.pages.map(p => [p.page, p.indices]));

  const wordlist = wordBytes.toString("utf8").split(/\r?\n/).filter(Boolean);
  const wordSet = new Set(wordlist.map(w => englishToRunes(w, runes, latin)).filter(Boolean));
  const sections = SECTION_SPECS.map(spec => {
    const file = path.join(sectionsDir, spec.name, "section.json");
    const section = JSON.parse(fs.readFileSync(file, "utf8"));
    const actualPages = section.pages.map(p => Number(p.number));
    if (JSON.stringify(actualPages) !== JSON.stringify(spec.pages)) fail("Unexpected page grouping for " + spec.name);
    const raw = section.pages.map(p => p.text).join("\n");
    const indices = spec.pages.flatMap(p => pageMap.get(p));
    const fromText = Array.from(raw).filter(ch => runeIndex.has(ch)).map(ch => runeIndex.get(ch));
    if (fromText.length !== indices.length || fromText.some((x, i) => x !== indices[i])) {
      fail("Original section text/corpus rune mismatch in " + spec.name);
    }
    if (indices.length !== spec.runes) fail("Unexpected rune count for " + spec.name);
    return { ...spec, raw, indices };
  });

  const configs = [];
  for (const base of [59, 60]) {
    for (const permutation of CHUNK_PERMUTATIONS) {
      let alphabet = permutation.map(k => CHUNKS[k]).join("");
      if (base === 59) alphabet = alphabet.replace("f", "");
      const values = tokens.map(token => {
        const a = alphabet.indexOf(token[0]), b = alphabet.indexOf(token[1]);
        if (a < 0 || b < 0) fail("Token outside base" + base + " alphabet: " + token);
        return a * base + b;
      });
      for (const reverse of [false, true]) {
        const stream = reverse ? values.slice().reverse() : values;
        for (const add of [false, true]) {
          configs.push({
            base,
            permutation: permutation.join("-"),
            reverse,
            add,
            key: stream.map(v => v % 29),
          });
        }
      }
    }
  }

  const results = [];
  let roundTripControls = 0;
  for (const section of sections) {
    for (const config of configs) {
      const sign = config.add ? 1 : -1;
      const processed = transform(section.indices, config.key, sign);
      const words = runeWords(section.raw, processed, runes, runeIndex);
      let prefixWords = 0;
      for (const word of words) {
        if (!wordSet.has(word)) break;
        prefixWords++;
      }
      const ioc = normalizedIoc(processed);
      const restored = transform(processed, config.key, -sign);
      if (restored.length !== section.indices.length || restored.some((x, i) => x !== section.indices[i])) {
        fail("Round-trip control failed for " + section.name);
      }
      roundTripControls++;
      results.push({
        section: section.name,
        base: config.base,
        permutation: config.permutation,
        reverse: config.reverse,
        add: config.add,
        prefixWords,
        normalizedIoc: ioc,
        firstWordsRunes: words.slice(0, 5),
      });
    }
  }

  const passing = results.filter(r => r.prefixWords >= 3 && r.normalizedIoc >= 1.4);
  const maxPrefixWords = Math.max(...results.map(r => r.prefixWords));
  const maxNormalizedIoc = Math.max(...results.map(r => r.normalizedIoc));
  const perSection = sections.map(section => {
    const rs = results.filter(r => r.section === section.name);
    const best = rs.slice().sort((a, b) => b.prefixWords - a.prefixWords || b.normalizedIoc - a.normalizedIoc)[0];
    return {
      section: section.name,
      pages: section.pages,
      runes: section.indices.length,
      maxPrefixWords: Math.max(...rs.map(r => r.prefixWords)),
      maxNormalizedIoc: Math.max(...rs.map(r => r.normalizedIoc)),
      best,
    };
  });
  if (passing.length !== 0 || maxPrefixWords !== 1 || maxNormalizedIoc >= 1.4) {
    fail("Expected bounded negative changed; inspect candidate output");
  }

  console.log(JSON.stringify({
    source: "local lp2-grid-256.json row-major tokens; external JBO CUNEIFORM_STREAM exact token match",
    wordlistGitBlobSha: blobSha,
    wordlistLines: wordlist.length,
    uniqueRunicWordForms: wordSet.size,
    keyTokens: tokens.length,
    configurations: configs.length,
    sections: sections.length,
    candidates: results.length,
    roundTripControls,
    passing,
    maxPrefixWords,
    maxNormalizedIoc,
    perSection,
  }, null, 2));
}
main();
