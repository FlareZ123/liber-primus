"use strict";
/**
 * Agent47: source-pinned late-2014 shaggydog/OEIS follow-up witness screen.
 * Searches original line-oriented IRC archives for a contemporaneous selected
 * sequence/output rather than running the speculative 245,722-ID key search.
 * Node.js 22 CommonJS, no external code execution and no file writes.
 */
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");

const SOURCES = [
  ["#cicadasolvers.freenode.log", 18487233, "bdd277c14f94c34b5ae714cd00c238065beeed4e"],
  ["#cicadasolvers.freenode.2.log", 27234234, "72634a9d071d32af767edbffc0493d810e88cd0d"],
  ["#33012014.freenode.log", 8629610, "a2880b1db31ce523599ef30ca2e55291bf295900"]
];
const AUTHOR = /<[^>]*shaggy(?:dog)?[^>]*>/i;
const FOCUS = /\b(?:oeis|A0{0,3}[0-9]{3,6}|rcrypto|shaggydog|solve_page54|mess_page00)\b/i;
const SELECT = /\b(?:found|solve[ds]?|solved|worked|result|plaintext|cleartext|output|sequence|the key|key is|number|selected|winner|readable|pastebin|sprunge|gist)\b/i;
const REGEXP_DATE = /^2014 (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d\d) (\d\d:\d\d) /;
const START = "2014 Jul 29";
const END = "2014 Dec 31";
const URLS = /https?:\/\/[^\s<>"']+/ig;

/** @param {Buffer} bytes */
function gitBlob(bytes) {
  return createHash("sha1").update("blob " + bytes.length + "\0").update(bytes).digest("hex");
}
/** @param {string} line */
function late2014(line) {
  const match = REGEXP_DATE.exec(line);
  if (!match) return false;
  const month = {Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12}[match[1]];
  if (!month) return false;
  return month > 7 || Number(match[2]) >= 29;
}
/** @param {string} line */
function urls(line) {
  return [...line.matchAll(URLS)].map(x => x[0].replace(/[.,;!?)}\]]+$/g, ""));
}
/** @param {string[]} lines @param {string} source */
function inspect(lines, source) {
  const author = [];
  const focus = [];
  const urlsSeen = [];
  const relevant = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!late2014(raw)) continue;
    if (AUTHOR.test(raw)) {
      author.push(i);
      for (const url of urls(raw)) urlsSeen.push({line: i + 1, url});
    }
    if (FOCUS.test(raw)) focus.push(i);
    if (/oeis|shaggy/i.test(raw) && SELECT.test(raw)) relevant.push(i);
  }
  const index = new Set();
  // All author lines: no omission of continued discussion, including changes of
  // topic which might mention output links without spelling "OEIS".
  for (const i of author) index.add(i);
  // Every 2014 OEIS/code search reference with an original line number.
  for (const i of focus) index.add(i);
  // Nearby responses to the author, limited to the same calendar date.
  for (const i of author) {
    const date = lines[i].slice(0, 11);
    for (let d = -3; d <= 3; d++) {
      const j = i + d;
      if (j < 0 || j >= lines.length) continue;
      if (lines[j].slice(0, 11) === date && SELECT.test(lines[j])) index.add(j);
    }
  }
  const hits = [...index].sort((a, b) => a - b)
    .map(i => ({line: i + 1, message: lines[i].slice(0, 800)}));
  // Context around the original 30 July links (not filtered by a search term).
  const periodWindow = source === SOURCES[0][0]
    ? lines.slice(229833, 229890).map((message, offset) => ({line: 229834 + offset, message: message.slice(0, 800)}))
    : [];
  return {source, authorCount: author.length, focusCount: focus.length,
    indexedCount: hits.length, authorUrls: urlsSeen, periodWindow, hits};
}
function selftest() {
  assert.equal(gitBlob(Buffer.from("test")), "30d74d258442c7c65512eafab474568dd706c430");
  assert.equal(late2014("2014 Jul 28 23:59 <x> oeis"), false);
  assert.equal(late2014("2014 Jul 30 23:59 <x> oeis"), true);
  assert.equal(late2014("2014 Aug 01 00:01 <x> oeis"), true);
  assert.equal(late2014("2015 Jan 01 00:01 <x> oeis"), false);
  const sample = [
    "2014 Jul 30 10:00 <shaggydog> oeis now",
    "2014 Jul 30 10:01 <reader> Any output?",
    "2014 Jul 30 10:02 <shaggydog> http://pastebin.com/abcd",
    "2014 Aug 03 10:00 <shaggydog> testing"
  ];
  const res = inspect(sample, "#test");
  assert.equal(res.authorCount, 3);
  assert.equal(res.authorUrls.length, 1);
  assert(res.hits.some(x => x.line === 2));
  console.log("SELFTEST PASS: source ranges, nick records, nearby replies, URLs");
}
/** @param {string} name @param {number} size @param {string} sha */
async function acquire(name, size, sha) {
  const uri = "https://raw.githubusercontent.com/cicada-solvers/neuroretransmit-cicada/main/irc-logs/" + encodeURIComponent(name);
  const response = await fetch(uri, {signal: AbortSignal.timeout(120000)});
  assert.equal(response.status, 200, uri);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length, size, name + " source length");
  assert.equal(gitBlob(bytes), sha, name + " original Git blob");
  return bytes.toString("utf8").split(/\r?\n/);
}
async function main() {
  selftest();
  if (!process.argv.includes("--network")) return;
  for (const [name, size, sha] of SOURCES) {
    const lines = await acquire(name, size, sha);
    const r = inspect(lines, name);
    console.log("SOURCE", JSON.stringify({source: name, sha, authorCount:r.authorCount,
      focusCount:r.focusCount, indexedCount:r.indexedCount, authorUrls:r.authorUrls}));
    for (const line of r.periodWindow) console.log("ORIGINAL", JSON.stringify({source:name,...line}));
    // All hits are distinct, but a cutoff is explicit if an archive is unexpectedly huge.
    for (const line of r.hits.slice(0, 900)) console.log("HIT", JSON.stringify({source:name,...line}));
    if (r.hits.length > 900) console.log("TRUNCATED", name, r.hits.length);
  }
}
main().catch(error => {console.error(error.stack || error);process.exitCode=1;});
