"use strict";

/**
 * Source-locked LP2 p55 -> 2014 GEB direct-coordinate gate.
 * No copyrighted book text is embedded, printed, or committed.
 * Node.js 22 CommonJS, Windows compatible; optional local OCR path argument.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const { createHash } = require("node:crypto");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcript = fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-transcription.txt"), "utf8");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const original = [];
let word = [];
for (const glyph of transcript.split("%")[54]) {
  const value = runeIndex.get(glyph);
  if (value !== undefined) word.push(value);
  else if ("-.$&§".includes(glyph) && word.length) {
    original.push(word);
    word = [];
  }
}
if (word.length) original.push(word);
assert.deepEqual(original.flat(), corpus.pages.find(p => p.page === 55).indices);
assert.deepEqual(original.map(w => w.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const inner = original.flatMap(w => w.slice(1, -1));
assert.equal(inner.length, 43);
assert.equal(inner[42], 19);
const triples = Array.from({ length: 14 }, (_, i) =>
  inner.slice(3*i, 3*i+3).map(v => v+1));
assert.deepEqual(triples, [
  [20,11,13],[7,24,3],[28,25,18],[6,29,1],
  [15,11,20],[2,6,14],[9,22,21],[16,24,28],
  [14,9,13],[19,11,7],[15,7,16],[13,3,3],
  [19,29,11],[20,6,12]
]);

const commit = "ade9a02889ef8acbc8cde8edbfd0a785c369f4c3";
const url = "https://raw.githubusercontent.com/neuroretransmit/cicada/" +
  commit + "/2014/007-fifth-onion/eternal-golden-braid.txt";
const gitBlobSHA1 = "da652686147aa1c8585be659c89d0db60c831571";

/** @returns {Promise<Buffer>} */
function readOCR() {
  if (process.argv[2]) return fs.promises.readFile(path.resolve(process.argv[2]));
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: {
      "User-Agent": "liber-primus-2014-geb-original-source-gate"
    } }, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error("Pinned OCR HTTP " + response.statusCode));
        return;
      }
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    });
    req.setTimeout(30000, () => req.destroy(new Error("Pinned OCR timeout")));
    req.on("error", reject);
  });
}

// Frozen historical 2014 signed-book-code controls (chapter title,
// dialogue exchange, word, letter; all numbers one-based). start is the
// chapter-body onset in the SHA-1-fixed OCR, never tuned on original p55.
const control = [
  ["3PI",86811,[6,1,3],"u"],
  ["LML",266344,[1,1,1],"t"],
  ["ETOATS",1164054,[19,9,1],"q"],
  ["AF",728247,[5,3,1],"t"],
  ["AMO",546466,[13,10,1],"z"],
  ["CC",480866,[8,6,1],"b"],
  ["CBIA",363965,[3,7,2],"r"],
  ["CFAF",431091,[5,23,6],"v"],
  ["SPR",1740000,[1,8,1],"s"],
  ["C1",192630,[4,5,3],"d"],
  ["AWDV",947178,[6,2,1],"t"],
  ["C2",1525856,[2,17,5],"v"],
  ["SC",1645557,[3,17,1],"z"],
  ["AOGS",1044472,[2,8,1],"p"]
];

/**
 * @param {string} text Immutable 2014 published GEB OCR text.
 * @param {number} begin Chapter-body source offset.
 * @returns {string[][]} Chronological dialogue utterance word arrays.
 */
function exchanges(text, begin) {
  const section = text.slice(begin, begin + 45000);
  const turns = [...section.matchAll(
    /(?:^|\n)[ \t]*(ACHILLES|TORTOISE|ZENO|ANTEATER|CRAB|SLOTH):[ \t]*/gim)];
  return turns.map((turn, i) => {
    const statement = section.slice(turn.index + turn[0].length,
      turns[i+1]?.index ?? section.length);
    return statement.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g) || [];
  });
}

/**
 * @param {string[][]} turns Dialogue word arrays.
 * @param {number[]} address One-based (exchange,word,letter).
 * @returns {{status:string,value?:string,count?:number}}
 */
function lookup(turns, address) {
  const [e,w,l] = address;
  const words = turns[e-1];
  if (!words) return { status: "no-exchange" };
  const token = words[w-1];
  if (!token) return { status: "no-word", count: words.length };
  if (token.length < l) return { status: "no-letter", count: token.length };
  return { status: "ok", value: token[l-1].toLowerCase() };
}

async function main() {
  const bytes = await readOCR();
  const sha = createHash("sha1")
    .update(Buffer.from("blob " + bytes.length + "\0"))
    .update(bytes).digest("hex");
  assert.equal(sha, gitBlobSHA1, "Incorrect historical book edition/source bytes");
  const source = bytes.toString("utf8");
  const rows = [];
  let positives = 0;
  let failures = 0;
  let failuresWithin3 = 0;
  for (let i=0; i<control.length; i++) {
    const [chapter,begin,known,expected] = control[i];
    const turns = exchanges(source, begin);
    const result = lookup(turns, known);
    const verified = result.status === "ok" && result.value === expected;
    if (verified) positives++;
    const candidate = triples[i];
    const decoded = lookup(turns, candidate);
    if (decoded.status !== "ok") failures++;
    const plausibleShifts = [];
    for (let change = -3; change <= 3; change++) {
      if (candidate[0]+change > 0 &&
        lookup(turns,[candidate[0]+change,candidate[1],candidate[2]]).status === "ok") {
        plausibleShifts.push(change);
      }
    }
    if (plausibleShifts.length === 0) failuresWithin3++;
    rows.push({chapter, originalSourceWitness:verified, candidate,
      directResult:decoded, viableDialogueShifts:plausibleShifts});
  }
  // The archived OCR has three known source-witness divergences. The other
  // 11 historical positive outputs calibrate this exact extraction rule.
  assert.equal(positives,11);
  assert.equal(failures,14);
  assert.equal(failuresWithin3,10);
  assert.equal(rows[0].directResult.status,"no-word");
  assert.equal(rows[0].directResult.count,8);
  assert.equal(rows[1].directResult.count,12);
  console.log(JSON.stringify({
    originalP55Runes:76, visibleSegments:17, strictInteriors:43,
    proposedTriples:14, unusedTerminalRuneIndex:inner[42],
    historicalPositiveMatches:positives, historicControls:14,
    originalProposedInvalidCoordinates:failures,
    invalidDespitePlusOrMinusThreeExchanges:failuresWithin3,
    rows,
    decision:"Direct GP-index-plus-one GEB coordinates do not decode in the pinned 2014 source."
  },null,2));
}
main().catch(error => {
  process.stderr.write(String(error.stack || error) + "\n");
  process.exitCode=1;
});
