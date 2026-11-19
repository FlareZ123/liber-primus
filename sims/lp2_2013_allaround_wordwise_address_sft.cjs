"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8").replace(/\r/g, "");
const bytes = p => fs.readFileSync(path.join(root, p));
const gitBlobSha = b => crypto.createHash("sha1").update(Buffer.concat([
  Buffer.from("blob " + b.length + "\0"), b
])).digest("hex");

function clearSignedBody(text, sourcePath) {
  const marker = "-----BEGIN PGP SIGNED MESSAGE-----";
  const start = text.indexOf(marker);
  assert.notEqual(start, -1, sourcePath + " must be clear-signed");
  let body = text.slice(start + marker.length);
  const blank = body.indexOf("\n\n");
  assert.notEqual(blank, -1);
  body = body.slice(blank + 2);
  const signature = body.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.notEqual(signature, -1, sourcePath + " lacks signature block");
  return body.slice(0, signature);
}
function cleanText(text) {
  return text.replace(/\b\S+@\S+\b/g, " ")
    .replace(/\b\S+\.onion\b/gi, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/www\.\S+/gi, " ")
    .replace(/\be\.g\./gi, "eg")
    .replace(/\bi\.e\./gi, "ie");
}
function sentenceWords(text) {
  return cleanText(text).split(/[.!?]+/u).map(s => s.trim())
    .filter(s => /[A-Za-z]{2,}/u.test(s))
    .map(s => (s.match(/[A-Za-z]+(?:'[A-Za-z]+)?/gu) || []).map(w => w.toUpperCase()));
}
const signatureOf = text => JSON.stringify(sentenceWords(text));
const countWindows = ss => ss.reduce((n, s) => n + Math.max(0, s.length - 5), 0);

const snapshot = JSON.parse(read("im-results/data/cicada2013-clear-signed-text-corpus.json"));
assert.equal(snapshot.source_repository, "neuroretransmit/cicada");
assert.equal(snapshot.source_commit, "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3");
assert.equal(snapshot.files.length, 10);
const snapshotByPath = new Map(snapshot.files.map(f => [f.source_path, f]));

const extraPaths = [
  "resources/historical/cicada2013-no-more-testing.asc",
  "resources/historical/cicada2013-welcome-and-congratulations.asc"
];
const extras = extraPaths.map(sourcePath => {
  const rawBytes = bytes(sourcePath), raw = rawBytes.toString("utf8").replace(/\r/g, "");
  return {source_path: sourcePath, source_blob_sha: gitBlobSha(rawBytes),
    body: clearSignedBody(raw, sourcePath)};
});
const pinnedSignatures = new Set(snapshot.files.map(f => signatureOf(f.body)));
for (const extra of extras) assert.ok(!pinnedSignatures.has(signatureOf(extra.body)));
assert.notEqual(signatureOf(extras[0].body), signatureOf(extras[1].body));

const sources = [...snapshot.files, ...extras].map(f => ({
  source_path: f.source_path, source_blob_sha: f.source_blob_sha,
  sentences: sentenceWords(f.body)
}));
assert.equal(sources.length, 12);

// Duplicate controls cover the old nine-source SFT's repeated copies. The
// displayed OS message is unsigned, but its body matches the clear-signed
// message.txt.asc counterpart in the pinned original-ISO archive.
const duplicateControls = [
  ["resources/historical/cicada2013-first-onion-hello.asc", "2013/004-first-onion/hello.txt.asc", true],
  ["resources/historical/cicada2013-forest-clue.asc", "2013/004-first-onion/clue.txt.asc", true],
  ["resources/historical/cicada2013-if-you-followed.asc", "2013/007-fourth-onion/no-email.txt.asc", true],
  ["resources/historical/cicada2013-second-onion-everything-you-need.asc", "2013/005-second-onion/everything-you-need.txt.asc", true],
  ["resources/historical/cicada2013-second-onion-icmp-echo.asc", "2013/005-second-onion/icmp-echo.asc", true],
  ["resources/external/2013-do-not-share-this-information-2.asc", "2013/008-invitation/invitation.asc", true],
  ["resources/historical/cicada2013-os-original-message.txt", "2013/002-3301/rootfs-contents/usr/local/bin/message.txt.asc", false]
].map(([localPath, pinnedPath, isSigned]) => {
  const rawBytes = bytes(localPath), raw = rawBytes.toString("utf8").replace(/\r/g, "");
  if (!isSigned) assert.ok(!raw.includes("-----BEGIN PGP SIGNED MESSAGE-----"));
  const body = isSigned ? clearSignedBody(raw, localPath) : raw;
  const pinned = snapshotByPath.get(pinnedPath);
  assert.ok(pinned);
  assert.deepEqual(sentenceWords(body), sentenceWords(pinned.body), localPath + " duplicate control");
  return {local_path: localPath, local_blob_sha: gitBlobSha(rawBytes),
    pinned_path: pinnedPath, pinned_blob_sha: pinned.source_blob_sha,
    sentence_tokens_equal: true, local_is_clear_signed: isSigned};
});

// Keep the two coordinate-only messages as distinct source records; neither
// is discarded just because it contributes no alphabetic word window.
for (const p of [
  "2013/006-third-onion/annapolis-md.txt.asc",
  "2013/006-third-onion/okinawa-japan.txt.asc",
  "2013/006-third-onion/standby.txt.asc"
]) assert.ok(snapshotByPath.has(p));

const sentenceWindows = [], messageWindows = [], sourceManifest = [];
let sentenceFragmentCount = 0;
for (const source of sources) {
  sentenceFragmentCount += source.sentences.length;
  const flat = source.sentences.flat();
  let localSentenceWindows = 0;
  for (let si = 0; si < source.sentences.length; si += 1) {
    const words = source.sentences[si];
    for (let start = 0; start + 6 <= words.length; start += 1) {
      sentenceWindows.push({source: source.source_path, sentence_index: si,
        start, words: words.slice(start, start + 6)});
      localSentenceWindows += 1;
    }
  }
  for (let start = 0; start + 6 <= flat.length; start += 1) {
    messageWindows.push({source: source.source_path, start, words: flat.slice(start, start + 6)});
  }
  sourceManifest.push({source_path: source.source_path, source_blob_sha: source.source_blob_sha,
    sentence_fragments: source.sentences.length, alphabetic_words: flat.length,
    sentence_bounded_windows: localSentenceWindows});
}
assert.equal(sentenceFragmentCount, 67);
assert.equal(sentenceWindows.length, 466);
assert.equal(messageWindows.length, 711);

// GP0: zero-based indices in the canonical 29-symbol LP2 alphabet.
const lp2 = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const gpIndex = new Map(lp2.translit.map((s, i) => [s, i]));
const gpSymbols = [...lp2.translit].sort((a, b) => b.length - a.length);
function gp0Tokens(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S").replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (s.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const token = gpSymbols.find(t => s.startsWith(t, i));
    assert.ok(token, "unmapped GP0 spelling " + s.slice(i));
    out.push(gpIndex.get(token));
    i += token.length;
  }
  return out;
}
const gp0 = word => gp0Tokens(word).reduce((a, b) => a + b, 0);
const gp1 = word => gp0Tokens(word).reduce((a, b) => a + b + 1, 0);

// Historically motivated alternative: pinned 2013 first-onion Gematria.py.
// Its prime lookup, QU->CW / Q->K preprocessing and longest-match tokenizer
// are distinct from LP2 GP0. Isolated words have an implicit trailing separator.
const primeLookup = {
  F:2,U:3,V:3,TH:5,O:7,R:11,C:13,K:13,G:17,W:19,H:23,N:29,I:31,J:37,
  EO:41,P:43,X:47,S:53,Z:53,T:59,B:61,E:67,M:71,L:73,NG:79,ING:79,
  OE:83,D:89,A:97,AE:101,Y:103,IA:107,IO:107,EA:109
};
const primeSymbols = Object.keys(primeLookup).sort((a, b) => b.length - a.length);
function prime2013(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW").replace(/Q/g, "K").replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = primeSymbols.find(t => s.startsWith(t, i));
    assert.ok(token, "unmapped 2013 Gematria spelling " + s.slice(i));
    out.push(primeLookup[token]);
    i += token.length;
  }
  return out.reduce((a, b) => a + b, 0);
}
const schemes = {GP0: gp0, GP1: gp1, PRIME2013: prime2013};

const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
assert.deepEqual(grid.original_scans, ["66.jpg", "67.jpg", "68.jpg"]);
const tokens = grid.rows.flat(), alphabet60 = grid.alphabet, alphabet59 = grid.alphabet.replace("f", "");
assert.equal(tokens.length, 256);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
function radixAt(cell, radix) {
  const alphabet = radix === "base59" ? alphabet59 : alphabet60;
  const token = tokens[cell];
  const hi = alphabet.indexOf(token[0]), lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return alphabet.length * hi + lo;
}
function outer(cell) {
  if (!Number.isInteger(cell) || cell < 0 || cell >= 256) return false;
  const r = Math.floor(cell / 8), c = cell % 8;
  return r === 0 || r === 31 || c === 0 || c === 7;
}
function addressCell(value, origin, order) {
  const n = value - origin;
  if (!Number.isInteger(n) || n < 0 || n >= 256) return null;
  return order === "row-major" ? n : (n % 32) * 8 + Math.floor(n / 32);
}
function perimeter() {
  const ring = [];
  for (let c = 0; c < 8; c += 1) ring.push(c);
  for (let r = 1; r < 32; r += 1) ring.push(r * 8 + 7);
  for (let c = 6; c >= 0; c -= 1) ring.push(31 * 8 + c);
  for (let r = 30; r >= 1; r -= 1) ring.push(r * 8);
  return ring;
}
const ring = perimeter(), ringPosition = new Map(ring.map((cell, i) => [cell, i]));
assert.equal(ring.length, 76);
function partitions3v3(values) {
  const out = [];
  for (let mask = 0; mask < 64; mask += 1) {
    let bits = 0;
    for (let i = 0; i < 6; i += 1) if ((mask >> i) & 1) bits += 1;
    if (bits !== 3 || mask >= (63 ^ mask)) continue;
    const left = [], right = [];
    let leftSum = 0;
    for (let i = 0; i < 6; i += 1) {
      if ((mask >> i) & 1) { left.push(i); leftSum += values[i]; }
      else right.push(i);
    }
    out.push({left, right, leftSum, rightSum: values.reduce((a,b) => a+b, 0) - leftSum});
  }
  assert.equal(out.length, 10);
  return out;
}

const phrase = ["THE","KEY","IS","ALL","AROUND","YOU"];
const phraseValues = Object.fromEntries(Object.entries(schemes).map(([name, fn]) =>
  [name, phrase.map(fn)]));
assert.deepEqual(phraseValues.GP0, [20,49,25,64,64,30]);
assert.deepEqual(phraseValues.GP1, [22,52,27,67,70,33]);
assert.deepEqual(phraseValues.PRIME2013, [72,183,84,243,236,113]);
assert.equal(phraseValues.GP0.reduce((a,b)=>a+b,0), 252);
assert.equal(phraseValues.PRIME2013.reduce((a,b)=>a+b,0), 931);
const targetPartitions = partitions3v3(phraseValues.GP0).map(p => ({
  left_words: p.left.map(i => phrase[i]), left_sum: p.leftSum,
  right_words: p.right.map(i => phrase[i]), right_sum: p.rightSum
}));
const target75177 = targetPartitions.filter(p =>
  (p.left_sum === 75 && p.right_sum === 177) || (p.left_sum === 177 && p.right_sum === 75));
assert.equal(targetPartitions.length, 10);
assert.equal(target75177.length, 1);
assert.deepEqual(target75177[0], {
  left_words:["KEY","ALL","AROUND"], left_sum:177,
  right_words:["THE","IS","YOU"], right_sum:75
});

function audit(windows, valueOfWord) {
  const stats = {
    windows: windows.length, sum252: 0, equalOuterPairWindows: 0,
    equalOuterPairOccurrences: 0, routeWindows: 0, routeCandidates: 0,
    clockwiseRoutes: 0, counterclockwiseRoutes: 0,
    routePairPositions: [0,0,0,0,0], routeWordPositions: [0,0,0,0,0,0],
    partition75177Windows: 0, partition59Windows: 0, partition60Windows: 0,
    full59Windows: 0, full60Windows: 0, full59Candidates: 0, full60Candidates: 0
  };
  const pairWindows = new Set(), routeWindows = new Set(), p75177 = new Set();
  const p59 = new Set(), p60 = new Set(), full59 = new Set(), full60 = new Set();
  const details59 = [], details60 = [];
  for (let wi = 0; wi < windows.length; wi += 1) {
    const w = windows[wi], values = w.words.map(valueOfWord);
    const total = values.reduce((a,b)=>a+b,0);
    if (total === 252) stats.sum252 += 1;
    const parts = partitions3v3(values);
    if (parts.some(p => (p.leftSum===75 && p.rightSum===177) ||
                        (p.leftSum===177 && p.rightSum===75))) p75177.add(wi);
    const end = addressCell(total, currentOrigin, currentOrder);
    let v59 = null, v60 = null;
    if (end !== null) {
      v59 = radixAt(end, "base59"); v60 = radixAt(end, "base60");
      if (parts.some(p => (p.leftSum===75 && p.rightSum===v59) ||
                          (p.leftSum===v59 && p.rightSum===75))) p59.add(wi);
      if (parts.some(p => (p.leftSum===75 && p.rightSum===v60) ||
                          (p.leftSum===v60 && p.rightSum===75))) p60.add(wi);
    }
    for (let pair = 0; pair < 5; pair += 1) {
      if (values[pair] !== values[pair+1]) continue;
      const start = addressCell(values[pair], currentOrigin, currentOrder);
      if (start === null || !outer(start)) continue;
      pairWindows.add(wi); stats.equalOuterPairOccurrences += 1;
      if (end === null || !outer(end)) continue;
      const cw = (ringPosition.get(end) - ringPosition.get(start) + 76) % 76;
      const ccw = (ringPosition.get(start) - ringPosition.get(end) + 76) % 76;
      for (const [direction, distance] of [["cw",cw],["ccw",ccw]]) {
        for (let wordPosition = 0; wordPosition < 6; wordPosition += 1) {
          if (values[wordPosition] !== distance) continue;
          routeWindows.add(wi); stats.routeCandidates += 1;
          stats.routePairPositions[pair] += 1; stats.routeWordPositions[wordPosition] += 1;
          if (direction === "cw") stats.clockwiseRoutes += 1;
          else stats.counterclockwiseRoutes += 1;
          const m59 = parts.filter(p => (p.leftSum===75 && p.rightSum===v59) ||
                                        (p.leftSum===v59 && p.rightSum===75));
          const m60 = parts.filter(p => (p.leftSum===75 && p.rightSum===v60) ||
                                        (p.leftSum===v60 && p.rightSum===75));
          if (m59.length) {
            full59.add(wi); stats.full59Candidates += m59.length;
            for (const p of m59) details59.push({
              source:w.source, sentence_index:w.sentence_index ?? null, window_start:w.start,
              words:w.words, values, total, pair_position:pair, start_cell:start, end_cell:end,
              direction, clockwise_distance:cw, counterclockwise_distance:ccw,
              distance_word_position:wordPosition,
              partition:{left_words:p.left.map(i=>w.words[i]),left_sum:p.leftSum,
                         right_words:p.right.map(i=>w.words[i]),right_sum:p.rightSum}
            });
          }
          if (m60.length) {
            full60.add(wi); stats.full60Candidates += m60.length;
            for (const p of m60) details60.push({
              source:w.source, window_start:w.start, words:w.words, values, total,
              pair_position:pair, start_cell:start, end_cell:end, direction,
              distance_word_position:wordPosition,
              partition:{left_words:p.left.map(i=>w.words[i]),left_sum:p.leftSum,
                         right_words:p.right.map(i=>w.words[i]),right_sum:p.rightSum}
            });
          }
        }
      }
    }
  }
  stats.equalOuterPairWindows = pairWindows.size;
  stats.routeWindows = routeWindows.size;
  stats.partition75177Windows = p75177.size;
  stats.partition59Windows = p59.size;
  stats.partition60Windows = p60.size;
  stats.full59Windows = full59.size;
  stats.full60Windows = full60.size;
  stats.full59Details = details59;
  stats.full60Details = details60;
  return stats;
}
function runFamily(windows) {
  const result = {};
  for (const [scheme, fn] of Object.entries(schemes)) {
    for (const origin of [0,1]) for (const order of ["row-major","column-major"]) {
      currentOrigin = origin; currentOrder = order;
      result[scheme + "/origin" + origin + "/" + order] = audit(windows, fn);
    }
  }
  return result;
}
let currentOrigin = 0, currentOrder = "row-major";
const sentenceAudit = runFamily(sentenceWindows);
const messageAudit = runFamily(messageWindows);
for (const [mode, family] of [["sentence",sentenceAudit],["message",messageAudit]]) {
  const primary = family["GP0/origin0/row-major"];
  assert.equal(primary.full59Windows, 1, mode + " base59 motif");
  assert.equal(primary.full60Windows, 0, mode + " base60 motif");
  assert.equal(primary.routeCandidates, 1, mode + " route candidate");
  assert.equal(primary.clockwiseRoutes, 1, mode + " clockwise route");
  assert.equal(primary.counterclockwiseRoutes, 0, mode + " reverse route");
  assert.equal(primary.partition75177Windows, 1, mode + " 75/177 partition");
  for (const [key, value] of Object.entries(family)) if (key !== "GP0/origin0/row-major") {
    assert.equal(value.full59Windows, 0, mode + " unexpected base59 hit " + key);
    assert.equal(value.full60Windows, 0, mode + " unexpected base60 hit " + key);
  }
}

const targetWindows = sentenceWindows.filter(w => w.words.join(" ") === phrase.join(" "));
assert.equal(targetWindows.length, 1);
const target = targetWindows[0], targetValues = target.words.map(gp0);
const cell64 = {cell:64,row:8,column:0,token:tokens[64],base59:radixAt(64,"base59"),base60:radixAt(64,"base60")};
const cell252 = {cell:252,row:31,column:4,token:tokens[252],base59:radixAt(252,"base59"),base60:radixAt(252,"base60")};
assert.deepEqual([cell64.token,cell64.base59,cell64.base60],["22",120,122]);
assert.deepEqual([cell252.token,cell252.base59,cell252.base60],["30",177,180]);
const token22Cells = tokens.map((t,i)=>t==="22"?i:-1).filter(i=>i>=0);
const token30Cells = tokens.map((t,i)=>t==="30"?i:-1).filter(i=>i>=0);
assert.deepEqual(token22Cells,[64,104]);
assert.deepEqual(token30Cells,[252]);
const p55 = lp2.pages.find(p=>p.page===55);
assert.equal(p55.runic_count,76);
const p55Local = p55.runic_count-1;
assert.equal(p55Local,75);
assert.equal(gp0("SHED"),64);
assert.equal(gp0("PARABLE"),120);
const equalPairs = [];
for (const source of sources) for (const s of source.sentences) for (let i=0;i+1<s.length;i++) {
  const a=gp0(s[i]), b=gp0(s[i+1]);
  if (a===b) equalPairs.push({source:source.source_path,left:s[i],right:s[i+1],value:a});
}
assert.deepEqual(equalPairs.map(x=>[x.left,x.right,x.value]),[
  ["ALL","AROUND",64],["YOU'RE","LOOKING",52],["WON'T","BE",35],["DRAWN","TOGETHER",67]
]);
const p56=lp2.pages.find(p=>p.page===56),p57=lp2.pages.find(p=>p.page===57);
assert.equal(p56.runic_count,85);
assert.equal(p57.runic_count,95);
assert.equal(256-ring.length,180);
assert.equal(p56.runic_count+p57.runic_count,180);

console.log(JSON.stringify({
  corpus:{
    source_repository:snapshot.source_repository,source_commit:snapshot.source_commit,
    selection:snapshot.selection,source_count:sources.length,pinned_source_count:10,
    extra_unique_signed_sources:extras.map(x=>({path:x.source_path,git_blob_sha:x.source_blob_sha})),
    sentence_fragments:sentenceFragmentCount,sentence_bounded_windows:sentenceWindows.length,
    message_contiguous_windows:messageWindows.length,source_manifest:sourceManifest,
    duplicate_controls:duplicateControls
  },
  frozen_grammar:{
    gp0:"LP2 29-symbol alphabet, zero-based, longest match; QU->CW, V->U, K/Q->C, Z->S, ING->NG, IO->IA",
    gp1:"same GP29 tokens, add one to each rune value before summing each word",
    prime2013:"pinned 2013 Gematria.py prime lookup; QU->CW, Q->K, longest match including ING",
    address:"raw sums 0..255 only; no modulo/wrap; both address origins and row/column orders",
    perimeter:"76-cell physical ring; both directions; all five adjacent pairs and all six distance-word positions",
    partition:"all ten unordered 3-versus-3 partitions for every eligible window"
  },
  target:{
    source:target.source,sentence_index:target.sentence_index,window_start:target.start,
    words:phrase,word_values:phraseValues,total_gp0:252,
    ten_partitions:targetPartitions,matching_75_177_partition:target75177,
    ring_length:76,cell64_ring_position:ringPosition.get(64),cell252_ring_position:ringPosition.get(252),
    clockwise_distance:49,counterclockwise_distance:27,distance_word:"KEY"
  },
  familywise_counts:{sentence_bounded:sentenceAudit,message_contiguous:messageAudit},
  fixed_cells:{cell64,cell252,token22_cells:token22Cells,token30_cells:token30Cells},
  controls:{adjacent_equal_gp0_pairs:equalPairs,p55_runic_count:76,p55_locally_owned:75,
    gp0_SHED:gp0("SHED"),gp0_PARABLE:gp0("PARABLE"),interior_cells:180,p56_plus_p57:180},
  known_code_correction:"The prior SFT iterated both orientations of each 3+3 split but asserted one result; the revised test canonicalizes complement pairs into exactly ten unordered partitions.",
  disposition:"Unique within the declared source-natural family in both window scopes, but no source selects the drop-f base59 alphabet. This is an intermediate structural correspondence, not a global codec, p55 cipher, or unknown-page plaintext. No p53/p28 output or p55 key schedule is used."
},null,2));
