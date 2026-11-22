"use strict";
/**
 * SFT: original LP2 p42–43 quotations versus a frozen full English GEB text.
 *
 * Uses a pinned Git blob from kylevedder/JChains as a *source witness*. The
 * edition, OCR, and typography are not authenticated as the Cicada-used copy.
 * Downloads the source only at execution time; copyrighted prose is not
 * redistributed in this repository or printed in the result.
 *
 * Windows 11 / Node.js 22: node sims/lp2_geb_original_quote_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const sha256 = value => createHash("sha256").update(value, "utf8").digest("hex");
const SOURCE = {
  repository: "kylevedder/JChains",
  path: "inputs/GEB.txt",
  blob: "03c403fa3db18dd9ee966e555e4978036b5f6b56",
  size: 1953906,
};
const EXPECTED = [
  {
    index: 4,
    lengths: [9,8,3,4,6,3,10,2,4,7,6,2,4],
    hash: "5396834f1468f0efde79621ad13fcb02a8f5f31909552ed9db904e96c8b8ba88",
  },
  {
    index: 5,
    lengths: [4,2,4,6,6,8,8,3,5,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5],
    hash: "910ed2b11ffad802b8d269297296731a486a98c1fc17a232fa03bcf92d9c2a7e",
  },
];
const gpUnits = /ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g;

/** Preserve original printed word breaks; page and line wraps are continuous. */
function originalWords(raw, runeSet) {
  const words = [];
  let glyphs = "";
  let start = 0;
  let offset = 0;
  const emit = () => {
    if (glyphs) words.push({start, end:offset, glyphs, length:[...glyphs].length});
    glyphs = "";
  };
  for (const ch of raw.split("%").slice(0, 55).join("%")) {
    if (runeSet.has(ch)) {
      if (!glyphs) start = offset;
      glyphs += ch;
      offset++;
    } else if (ch !== "%" && ch !== "/" && !/\s/u.test(ch)) {
      emit();
    }
  }
  emit();
  assert.equal(offset, 12956);
  assert.equal(words.length, 2896);
  return words;
}

/** @returns {{raw:number,gp:number}[]} Exact source-word order. */
function sourceWordLengths(text) {
  const tokens = text.toUpperCase().match(/[A-Z]+(?:['’][A-Z]+)*/g) || [];
  return tokens.map(token => {
    const letters = token.replace(/['’]/g, "");
    return {raw:letters.length, gp:(letters.match(gpUnits) || []).length};
  });
}

/** Exhaustive uninterrupted word-length alignment, with partial diagnostics. */
function match(lengths, target) {
  const dp = new Uint8Array(target.length);
  const prefix = [0];
  for (const n of target) prefix.push(prefix.at(-1) + n);
  let full = 0, maxWords = 0, maxRunes = 0, qualifying = 0;
  for (let i = 0; i < lengths.length; i++) {
    for (let j = target.length - 1; j >= 0; j--) {
      const n = dp[j] = lengths[i] === target[j] ? (j ? dp[j-1] + 1 : 1) : 0;
      if (!n) continue;
      maxWords = Math.max(maxWords, n);
      const runeCoverage = prefix[j+1] - prefix[j+1-n];
      maxRunes = Math.max(maxRunes, runeCoverage);
      if (n === target.length) full++;
      if (n >= 12 && runeCoverage >= 40) qualifying++;
    }
  }
  return {maxWords, maxRunes, full, qualifying};
}

function shuffle(values) {
  const out = values.slice();
  let state = 0x33012014;
  for (let i = out.length - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const j = (state >>> 0) % (i+1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

async function main() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const annotations = JSON.parse(read("resources/liber-primus/lp2-quote-punctuation-spans.json"));
  const words = originalWords(read("resources/lp2-transcription.txt"), new Set(corpus.runes));
  const prepared = EXPECTED.map(spec => {
    const span = annotations.quotes[spec.index];
    const selected = words.filter(word => word.start >= span.start && word.end <= span.end);
    assert.equal(selected[0].start, span.start);
    assert.equal(selected.at(-1).end, span.end);
    assert.deepEqual(selected.map(word => word.length), spec.lengths);
    assert.equal(sha256(selected.map(word => word.glyphs).join("")), spec.hash);
    return {...spec, span:[span.start, span.end]};
  });
  const url = "https://api.github.com/repos/" + SOURCE.repository + "/git/blobs/" + SOURCE.blob;
  const response = await fetch(url, {headers:{"Accept":"application/vnd.github+json"}});
  assert.equal(response.status, 200, "Pinned GitHub blob must be reachable");
  const blob = await response.json();
  assert.equal(blob.encoding, "base64");
  const bytes = Buffer.from(blob.content.replace(/\s/g, ""), "base64");
  assert.equal(bytes.length, SOURCE.size);
  const identity = createHash("sha1").update("blob " + bytes.length + "\0").update(bytes).digest("hex");
  assert.equal(identity, SOURCE.blob);
  const lengths = sourceWordLengths(bytes.toString("utf8"));
  assert.equal(lengths.length, 318443);
  for (const kind of ["gp", "raw"]) {
    const tape = lengths.map(word => word[kind]);
    const planted = tape.slice(200, 234);
    assert.equal(match(tape, planted).full >= 1, true, "Source-native positive plant");
    for (const target of prepared) {
      const observed = match(tape, target.lengths);
      const negative = match(shuffle(tape), target.lengths);
      assert.equal(observed.full, 0, "Unexpected original whole-quote match merits investigation");
      assert.equal(observed.qualifying, 0, "Unexpected 12-word / 40-rune crib merits investigation");
      assert.ok(negative.maxWords < 12);
      console.log(JSON.stringify({source:SOURCE.blob,sourceWords:tape.length,
        quote:target.index,originalSpan:target.span,kind,observed,
        shuffledMaxWords:negative.maxWords,sourcePositive:"34-word plant recovered"}));
    }
  }
  console.log("PASS: original source word-shape gate; no GEB witness attribution or plaintext");
}
main().catch(error => {console.error(error);process.exitCode=1;});
