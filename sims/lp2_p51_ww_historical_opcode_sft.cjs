"use strict";
/**
 * P51 W-W-P alleged sentinel: original Cicada 2012-2014 authored-command
 * text audit. This gates the historical source premise of Director #2328.
 * Reproduce (Windows Node22 CJS): node sims/lp2_p51_ww_historical_opcode_sft.cjs
 *
 * This only scans the explicit extant 18 source files named below. It does
 * not claim to audit lost CGI, historic onion replies, or encrypted media.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const PREFIX = "resources/historical/";
const authored = [
  "cicada2012-countdown-message.asc",
  "cicada2012-midi-email.asc",
  "cicada2012-song-is-your-own-path.asc",
  "cicada2012-message-only-displayed.asc",
  "cicada2013-first-onion-hello.asc",
  "cicada2013-forest-clue.asc",
  "cicada2013-if-you-followed.asc",
  "cicada2013-no-more-testing.asc",
  "cicada2013-second-onion-everything-you-need.asc",
  "cicada2013-second-onion-icmp-echo.asc",
  "cicada2013-welcome-and-congratulations.asc",
  "cicada2014-sixth-onion-v2-form.html.asc",
  "cicada2014-stage11-message.asc",
  "cicada2014-onion7-index.html",
  "cicada2014-stage10-original-form.html",
  "cicada2013-os-original-cicada.sh",
  "cicada2013-os-original-prime-echo.sh",
  "cicada2013-os-original-message.txt"
];

const opcodeWords = /\b(?:repeat(?:ed|s)?|reset|escap(?:e|ed|ing)|duplicat(?:e|ed|ion)|doubl(?:e|ed|ing)|sentinel|delimiter|marker|identical|twice|adjacent|consecutive|two[- ](?:same|identical))\b/gi;
/** @param {string} source */
function extractPlayerText(source) {
  const signature = source.indexOf("-----BEGIN PGP SIGNATURE-----");
  return signature === -1 ? source : source.slice(0, signature);
}
/** @param {string} message @returns {string[]} */
function matches(message) {
  return [...message.matchAll(opcodeWords)].map(x => x[0]);
}
assert(matches("Two adjacent identical runes reset a key; escape the pair").length >= 4,
  "Auditor must detect the planted historical-escape positive.");
const sources = authored.map(name => {
  const full = path.join(ROOT, PREFIX, name);
  assert(fs.existsSync(full), name);
  const message = extractPlayerText(fs.readFileSync(full, "utf8"));
  const hits = matches(message);
  return {name, characters:message.length, hits};
});
assert.equal(sources.length, 18);
assert(sources.every(s => s.hits.length === 0),
  "New opcode word found: inspect historical source and update decision");

const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const p51 = corpus.pages.find(p => p.page === 51).indices;
assert.deepEqual(p51.slice(0, 3).map(i => corpus.translit[i]),
  ["W", "W", "P"]);
const runePages = corpus.pages.filter(p => p.page <= 55 &&
  p.indices.length > 1);
assert.equal(runePages.length, 55);
const doubletStarts = runePages.filter(p => p.indices[0] === p.indices[1])
  .map(p => p.page);
assert.deepEqual(doubletStarts, [51]);
const all = runePages.flatMap(p => p.indices);
assert.equal(all.length, 12956);
const doublets = all.reduce((total, v, i) =>
  total + (i > 0 && all[i - 1] === v ? 1 : 0), 0);
assert.equal(doublets, 86);
const panel = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources", "liber-primus", "lp2-grid-256.json"), "utf8"));
assert.equal(panel.bytes.length, 256);

console.log(JSON.stringify({
  status: "PASS",
  scope: "18 named first-party historically linked 2012-2014 text/code files, signatures excluded",
  historicalTextCommandTermsFound: 0,
  plantedPositiveDetected: true,
  originals: {p51Prefix: "W-W-P", p51Runes: p51.length,
    firstDoubletPages: doubletStarts, allCipherRunes: all.length,
    globalAdjacentEqualCount: doublets, numericPanelBytes:panel.bytes.length},
  limits: "Keyword audit cannot prove absence of synonymically encoded, binary, image, unpublished CGI, or lost historic commands",
  decision: "No cited player-visible source in this frozen corpus specifies WW as a reset/escape; do not invent a table decoder solely from its page adjacency.",
  audited: sources
}, null, 2));
