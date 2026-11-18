"use strict";

/**
 * Source-key fingerprint scan using three independently source-selected p0 cribs:
 * EPIPHANY SEECS at 0..12, THE ROAD at 103..108, THE DEVOTED at 235..243.
 *
 * The scanner does not score English or tune ciphertext positions. For each fixed
 * affine slope a in GF(29), source sign +/- and source direction, it tests whether
 * checked-in resource streams can supply K_i = +/- (C_i - a*P_i) mod 29 at all
 * 28 predicted positions. It also records exact contiguous matches to each crib's
 * implied key fragment, which remains useful if a historical plaintext-F bypass
 * causes unknown key consumption between the separated crib blocks.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-grid-256.json"), "utf8"
));
const MOD = 29;
const mod = x => ((x % MOD) + MOD) % MOD;
const p0 = corpus.pages.find(p => p.page === 0).indices;

const known = [
  [0,18],[1,13],[2,10],[3,13],[4,8],[5,24],[6,9],[7,26],[8,15],[9,18],[10,18],[11,5],[12,15],
  [103,2],[104,18],[105,4],[106,3],[107,24],[108,23],
  [235,2],[236,18],[237,23],[238,18],[239,1],[240,3],[241,16],[242,18],[243,23]
];
assert.equal(known.length, 28);

const segments = [
  {name:"EPIPHANY_SEECS", start:0, length:13},
  {name:"THE_ROAD", start:103, length:6},
  {name:"THE_DEVOTED", start:235, length:9}
];

function requirement(slope, sign) {
  const map = new Map();
  for (const [pos, plain] of known) {
    map.set(pos, mod(sign * mod(p0[pos] - slope * plain)));
  }
  return map;
}

function exactFragmentOccurrences(stream, fragment) {
  const haystack = Buffer.isBuffer(stream) ? stream : Buffer.from(stream);
  const needle = Buffer.from(fragment);
  const out = [];
  for (let from = 0;;) {
    const at = haystack.indexOf(needle, from);
    if (at < 0) break;
    out.push(at);
    from = at + 1;
  }
  return out;
}

function fixedAlignmentBest(stream, req) {
  const haystack = Buffer.isBuffer(stream) ? stream : Buffer.from(stream);
  const positions = [...req.keys()];
  const maxPos = positions[positions.length - 1];
  const firstValue = req.get(positions[0]);
  let bestMatches = 0;
  let bestOffset = null;
  const perfect = [];
  for (let offset = haystack.indexOf(firstValue);
       offset >= 0 && offset + maxPos < haystack.length;
       offset = haystack.indexOf(firstValue, offset + 1)) {
    let matches = 1;
    for (let j = 1; j < positions.length; j++) {
      const pos = positions[j];
      if (haystack[offset + pos] === req.get(pos)) matches++;
    }
    if (matches > bestMatches) {
      bestMatches = matches;
      bestOffset = offset;
    }
    if (matches === positions.length) perfect.push(offset);
  }
  return {matches:bestMatches, offset:bestOffset, perfect};
}

const gpTokens = corpus.translit.map((token, value) => ({token, value}))
  .sort((a,b) => b.token.length - a.token.length);
function gpEncodeText(text) {
  const normalized = text.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const t = gpTokens.find(x => normalized.startsWith(x.token, i));
    if (!t) { i++; continue; }
    out.push(t.value);
    i += t.token.length;
  }
  return out;
}

function explicitHexBytes(filePath, bytes) {
  if (!/hex|hexdump/i.test(filePath)) return null;
  const text = bytes.toString("utf8");
  const hex = text.replace(/[^0-9a-fA-F]/g, "");
  if (hex.length < 2 || hex.length % 2) return null;
  return Buffer.from(hex, "hex");
}

function streamVariants(filePath, bytes) {
  const variants = [];
  const raw = [...bytes];
  variants.push({kind:"raw_byte_mod29", values:raw.map(x => x % MOD)});
  variants.push({kind:"raw_byte_base29_be", values:raw.flatMap(x => [Math.floor(x / MOD), x % MOD])});
  variants.push({kind:"raw_byte_base29_le", values:raw.flatMap(x => [x % MOD, Math.floor(x / MOD)])});
  if (/\.(txt|md|json|asc|csv|html?)$/i.test(filePath)) {
    variants.push({kind:"gp_text", values:gpEncodeText(bytes.toString("utf8"))});
  }
  const decoded = explicitHexBytes(filePath, bytes);
  if (decoded) {
    const x = [...decoded];
    variants.push({kind:"hex_byte_mod29", values:x.map(v => v % MOD)});
    variants.push({kind:"hex_byte_base29_be", values:x.flatMap(v => [Math.floor(v / MOD), v % MOD])});
    variants.push({kind:"hex_byte_base29_le", values:x.flatMap(v => [v % MOD, Math.floor(v / MOD)])});
  }
  return variants.filter(v => v.values.length >= 9);
}

function shouldScan(rel, size) {
  if (!rel.startsWith("resources/")) return false;
  if (rel.startsWith("resources/control/")) return false;
  if (size > 15000000) return false;
  const circular = new Set([
    "resources/liber-primus/lp2-corpus.json",
    "resources/liber-primus/lp2-transcription.txt",
    "resources/lp2-transcription.txt",
    "resources/transcriptions/liber_primus_master.txt",
    "resources/transcriptions/lp2_krisyotam_2017.txt"
  ]);
  return !circular.has(rel);
}

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, {withFileTypes:true})) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full));
    else if (ent.isFile()) out.push(full);
  }
  return out;
}

function scanStream(file, variant, values) {
  const results = [];
  for (const reversed of [false, true]) {
    const stream = Buffer.from(reversed ? [...values].reverse() : values);
    for (let slope = 1; slope < MOD; slope++) {
      for (const sign of [1, -1]) {
        const req = requirement(slope, sign);
        const aligned = fixedAlignmentBest(stream, req);
        const fragmentHits = {};
        let fragmentHitCount = 0;
        for (const seg of segments) {
          const fragment = [];
          for (let j = 0; j < seg.length; j++) fragment.push(req.get(seg.start + j));
          const hits = exactFragmentOccurrences(stream, fragment);
          if (hits.length) {
            fragmentHits[seg.name] = hits.slice(0, 20);
            fragmentHitCount += hits.length;
          }
        }
        if (aligned.matches >= 9 || aligned.perfect.length || fragmentHitCount) {
          results.push({
            file, variant, reversed, slope, sign,
            aligned_matches:aligned.matches,
            aligned_offset:aligned.offset,
            perfect_offsets:aligned.perfect,
            fragment_hits:fragmentHits
          });
        }
      }
    }
  }
  return results;
}

function main() {
  assert.deepEqual(p0.slice(0,13), [15,8,18,3,6,19,27,0,15,26,18,21,5]);
  assert.deepEqual(p0.slice(103,109), [8,12,16,8,25,27]);
  assert.deepEqual(p0.slice(235,244), [8,5,15,22,16,22,21,1,4]);
  const add = requirement(1, 1);
  assert.deepEqual([...add.values()].slice(0,13), [26,24,8,19,27,24,18,3,0,8,0,16,19]);
  assert.deepEqual([...add.values()].slice(13,19), [6,23,12,5,1,4]);
  assert.deepEqual([...add.values()].slice(19), [6,16,21,4,15,19,5,12,10]);

  const planted = new Array(400).fill(7);
  for (const [pos, value] of add) planted[51 + pos] = value;
  const positive = fixedAlignmentBest(planted, add);
  assert.ok(positive.perfect.includes(51));
  assert.equal(positive.matches, 28);
  const titleFrag = [...Array(13)].map((_,j) => add.get(j));
  assert.ok(exactFragmentOccurrences(planted, titleFrag).includes(51));

  const directStreams = [
    {file:"[p50 canonical bytes]", variant:"byte_mod29", values:grid.bytes.map(x=>x%29)},
    {file:"[p50 canonical bytes]", variant:"byte_base29_be", values:grid.bytes.flatMap(x=>[Math.floor(x/MOD),x%MOD])},
    {file:"[p50 canonical bytes]", variant:"byte_base29_le", values:grid.bytes.flatMap(x=>[x%MOD,Math.floor(x/MOD)])}
  ];

  const files = walk(path.join(ROOT, "resources"));
  const selected = files.filter(full => {
    const rel = path.relative(ROOT, full).split(path.sep).join("/");
    return shouldScan(rel, fs.statSync(full).size);
  });
  const findings = [];
  for (const ds of directStreams) findings.push(...scanStream(ds.file, ds.variant, ds.values));
  let scannedVariants = directStreams.length;
  let scannedBytes = 0;
  for (const full of selected) {
    const rel = path.relative(ROOT, full).split(path.sep).join("/");
    const bytes = fs.readFileSync(full);
    scannedBytes += bytes.length;
    for (const v of streamVariants(rel, bytes)) {
      scannedVariants++;
      findings.push(...scanStream(rel, v.kind, v.values));
    }
  }

  findings.sort((a,b) =>
    b.perfect_offsets.length - a.perfect_offsets.length ||
    Object.keys(b.fragment_hits).length - Object.keys(a.fragment_hits).length ||
    b.aligned_matches - a.aligned_matches ||
    a.file.localeCompare(b.file)
  );

  const perfect = findings.filter(x=>x.perfect_offsets.length);
  const withTitle = findings.filter(x=>x.fragment_hits.EPIPHANY_SEECS);
  const withRoad = findings.filter(x=>x.fragment_hits.THE_ROAD);
  const withDevoted = findings.filter(x=>x.fragment_hits.THE_DEVOTED);
  const multiFragment = findings.filter(x=>Object.keys(x.fragment_hits).length >= 2);
  const bestAligned = findings.slice().sort((a,b)=>b.aligned_matches-a.aligned_matches).slice(0,30);

  console.log(JSON.stringify({
    known_plaintext_positions: known.length,
    source_files_scanned: selected.length,
    source_bytes_scanned: scannedBytes,
    stream_variants_scanned: scannedVariants,
    affine_slopes: 28,
    source_signs: 2,
    source_directions: 2,
    exact_28_position_alignments: perfect,
    exact_title_fragment_hits: withTitle,
    exact_road_fragment_hits: withRoad,
    exact_devoted_fragment_hits: withDevoted,
    multi_fragment_same_variant_hits: multiFragment,
    best_fixed_alignment_candidates: bestAligned,
    decision: perfect.length || withTitle.length || withDevoted.length || multiFragment.length
      ? "source-key candidate(s) require adjudication"
      : "no exact source-key fingerprint in scanned finite family"
  }, null, 2));
}

if (require.main === module) main();
module.exports = {requirement, fixedAlignmentBest, exactFragmentOccurrences, gpEncodeText};
