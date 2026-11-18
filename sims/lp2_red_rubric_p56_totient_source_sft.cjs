"use strict";
/**
 * Original-print red-rubric GP29 test under the exact known p56 prime-totient
 * decoder. Each source-colored passage is a separately keyed message at
 * prime 2. Every latent literal-F skip branch is preserved, even if it
 * produces extra candidate plaintexts. No hidden phrase, prefix, key,
 * matched offset or language fit is assumed.
 *
 * Source: resources/liber-primus/lp2-ink-annotations.json;
 *         resources/liber-primus/lp2-corpus.json
 * Read-only Windows Node22 SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const load = name => JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const GP = corpus.translit;
const primes = [];
for (let n = 2; primes.length < 300; n++) {
  let yes = true;
  for (let j = 2; j * j <= n; j++) if (n % j === 0) { yes = false; break; }
  if (yes) primes.push(n);
}

/**
 * Return every legal original p56 cipher inverse, where plaintext-F is
 * a nonconsuming literal-F and every other plaintext rune is encoded as
 * C_i = P_i + phi(prime_k) mod29 with exactly one consumed prime.
 *
 * @param {number[]} source
 * @returns {{states:{clock:number,plaintext:number[]}[], firstFailure:number|null}}
 */
function originalTotientInverse(source) {
  /** @type {{clock:number,plaintext:number[]}[]} */
  let states = [{ clock: 0, plaintext: [] }];
  for (let offset = 0; offset < source.length; offset++) {
    const c = source[offset];
    /** @type {{clock:number,plaintext:number[]}[]} */
    const next = [];
    for (const v of states) {
      if (c === 0) {
        next.push({ clock: v.clock, plaintext: [...v.plaintext, 0] });
      }
      // At this length, prime-1 = Euler's totient for every prime.
      const p = (c - (primes[v.clock] - 1) + 29 * 50) % 29;
      if (p !== 0) {
        next.push({ clock: v.clock + 1, plaintext: [...v.plaintext, p] });
      }
    }
    if (next.length === 0) return { states: [], firstFailure: offset };
    assert(next.length <= 256, "unexpected branch explosion");
    states = next;
  }
  return { states, firstFailure: null };
}

function main() {
  const source = ink.pages.flatMap(p => (p.red_spans || []).map(span => {
    const actual = corpus.pages[p.page].indices.slice(span.start, span.start + span.length);
    assert.equal(actual.length, span.length);
    assert.equal(actual.map(v => corpus.runes[v]).join(""), span.runes);
    return { page: p.page, at: span.start, count: span.length, actual };
  }));
  assert.equal(source.length, 18);
  assert.equal(source.reduce((n, x) => n + x.actual.length, 0), 225);
  assert.equal(source.filter(x => x.page <= 55).reduce((n, x) => n + x.count, 0), 213);
  const results = source.map(row => {
    const decoded = originalTotientInverse(row.actual);
    return {
      page: row.page, start: row.at, runes: row.count,
      paths: decoded.states.length, firstFailure: decoded.firstFailure,
      firstCandidate: decoded.states.length
        ? decoded.states[0].plaintext.map(r => GP[r]).join("") : null,
    };
  });

  // The complete established p56 solution, including the actual nonconsuming
  // 56th-rune literal-F, must occur on one legal branch of exactly this code.
  const full56 = corpus.pages.find(p => p.page === 56).indices;
  assert.equal(full56.length, 85);
  const native = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
  const tokens = GP.map((word, value) => ({ word, value }))
    .sort((a, b) => b.word.length - a.word.length);
  const expected = [];
  for (const w of native.split(" ")) {
    for (let i = 0; i < w.length;) {
      const token = tokens.find(x => w.startsWith(x.word, i));
      assert(token);
      expected.push(token.value);
      i += token.word.length;
    }
  }
  assert.equal(expected.length, 85);
  const control = originalTotientInverse(full56);
  assert.equal(control.firstFailure, null);
  assert(control.states.some(x => x.plaintext.every((v, i) => v === expected[i])));
  const p56 = results.find(x => x.page === 56);
  assert.equal(p56.firstCandidate, "ANEND");
  assert.equal(p56.paths, 1);

  // Strict extinction in the three source-distinct original highlighted
  // passages; these are not mere low language scores.
  const strict = results.filter(x => x.page <= 55 && x.firstFailure !== null);
  assert.deepEqual(strict.map(x => [x.page, x.start, x.firstFailure]),
    [[23, 0, 0], [33, 91, 1], [53, 128, 12]]);
  assert.deepEqual(results.filter(x => x.page === 57)
    .map(x => [x.firstFailure, x.paths]), [[2, 0]]);
  const report = {
    hypothesis: "source-visible red spans independently encoded with the p56 original prime-totient/F-bypass rule, prime start2",
    source: { coloredPassages: 18, runes: 225, unknownRunes: 213 },
    original: {
      unknownPassages: results.filter(x => x.page <= 55).length,
      strictNoPath: strict.length,
      strictFailures: strict.map(x =>
        ({page:x.page, start:x.start, localRune:x.firstFailure})),
      sourceExactFirstCandidates: results.filter(x => x.page <= 55).map(x =>
        ({page:x.page,start:x.start,pathCount:x.paths,
          firstRunes:x.firstCandidate?.slice(0, 64)})),
    },
    knownSolvedP56: {
      whole85HasExactExpectedPath: true,
      red5: p56.firstCandidate,
      branchCount: control.states.length,
    },
    sourcePlainP57ExpectedFailure: results.find(x => x.page === 57).firstFailure,
    verdict: "The independently reset, exact authentic p56 cipher cannot decode all original unknown red passages; no new plaintext",
  };
  console.log(JSON.stringify(report, null, 2));
}
if (require.main === module) main();
module.exports = { originalTotientInverse };
