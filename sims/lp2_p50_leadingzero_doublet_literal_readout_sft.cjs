"use strict";

/**
 * Fixed literal readout from the printed leading-zero numerical-table mask.
 * The preceding discovery concerns a retrospective correlation only; this
 * file asks what the selected repeated GP29 runes literally say, with no
 * fitted offset, cipher, transcription or excluded positions.
 *
 * Same-page adjacent-equal pair coordinates are assigned to their first
 * rune's absolute zero-based index, with the 256-cell table repeating from
 * the first unknown p0 rune without chapter/page resets.
 *
 * Usage: node sims/lp2_p50_leadingzero_doublet_literal_readout_sft.cjs
 * No writes, network calls, or nonstandard dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));

const pages = corpus.pages.filter((page) => page.page <= 55);
const tokens = grid.pages.flatMap((page) => page.tokens);
const events = [];
const selected = [];
let offset = 0;

assert.equal(tokens.length, 256);
for (const page of pages) {
  for (let j = 0; j + 1 < page.indices.length; j++) {
    if (page.indices[j] !== page.indices[j + 1]) continue;
    const global = offset + j;
    const phase = global % 256;
    const symbol = corpus.translit[page.indices[j]];
    const event = {
      global,
      page: page.page,
      offset: j,
      phase,
      token: tokens[phase],
      symbol,
    };
    events.push(event);
    if (event.token[0] === "0") selected.push(event);
  }
  offset += page.indices.length;
}

assert.equal(offset, 12956);
assert.equal(events.length, 86);
assert.equal(selected.length, 33);

const runeSequence = selected.map((event) => event.symbol).join(" ");
const tablePhases = selected.map((event) => event.phase).join(" ");
assert.equal(runeSequence,
  "EA L NG G N Y X IA H D X EA O N U E L O C M F T R A X W I W I E P Y NG");
assert.equal(tablePhases,
  "199 13 210 13 188 192 19 36 63 165 210 99 192 81 192 220 141 210 99 63 188 175 116 192 229 123 188 181 253 94 78 85 123");

console.log(JSON.stringify({
  originalUnknownRunes: offset,
  originalSamePageDoublets: events.length,
  literalLeadingZeroEvents: selected.length,
  runeSequence,
  tablePhases,
  events: selected,
}, null, 2));
