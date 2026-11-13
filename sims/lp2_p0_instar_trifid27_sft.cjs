"use strict";
/**
 * LP2 p0-p2 source-motivated three-coordinate Trifid gate.
 *
 * The opening three physical pages contain 729 runes = 27^2.
 * The original p2 art depicts an insect nymph; the 2013 761.MP3
 * title "THE INSTAR EMERGENCE" has GP-prime sum 761.
 * This conditionally motivates a 27-cell cube and a literal title key.
 * F and EA are declared uninterrupted, unencrypted exceptions ONLY to
 * make 27 slots from the actual 29-symbol GP alphabet. This is a
 * hypothesis, not an authenticated Cicada instruction.
 *
 * Run: node sims/lp2_p0_instar_trifid27_sft.cjs
 * Windows Node.js 22, read-only, built-ins only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const control = fs.readFileSync(
  path.join(ROOT, "resources", "control", "gibran_prophet_58585.txt"), "utf8"
);
const map = new Map(corpus.translit.map((symbol, position) => [symbol, position]));
map.set("ING", 21);
const CORE = Array.from({length: 27}, (_, i) => i + 1);

/**
 * Encode source English exactly in the repository's GP29 convention.
 * @param {string} text
 * @returns {number[]}
 */
function gpEncode(text) {
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      let matched = false;
      for (const n of [3, 2, 1]) {
        const k = map.get(word.slice(i, i + n));
        if (k !== undefined) {
          out.push(k);
          i += n;
          matched = true;
          break;
        }
      }
      assert.ok(matched, "GP-encodable English");
    }
  }
  return out;
}

/**
 * Classical Trifid digit transposition, with a period and a keyed 27 cube.
 * The declared GP-F and GP-EA symbols pass unchanged and do not advance
 * the cube clock. Each input part begins a new clock if provided separately.
 *
 * @param {number[][]} parts
 * @param {number[]} cube 27 distinct GP glyph indices
 * @param {number} period
 * @param {boolean} inverse true means ciphertext-to-plaintext
 * @returns {number[]}
 */
function trifid(parts, cube, period, inverse) {
  assert.equal(cube.length, 27);
  assert.equal(new Set(cube).size, 27);
  assert.deepEqual([...cube].sort((a, b) => a - b), CORE);
  assert.ok(Number.isInteger(period) && period >= 1);
  const place = new Int32Array(29).fill(-1);
  cube.forEach((symbol, index) => { place[symbol] = index; });
  const output = [];
  for (const part of parts) {
    const target = part.slice();
    const positions = [];
    const indices = [];
    part.forEach((symbol, i) => {
      if (place[symbol] >= 0) {
        positions.push(i);
        indices.push(place[symbol]);
      } else {
        assert.ok(symbol === 0 || symbol === 28);
      }
    });
    for (let at = 0; at < indices.length; at += period) {
      const block = indices.slice(at, at + period);
      const n = block.length;
      let positionsInCube;
      if (inverse) {
        const digits = block.flatMap(x => [
          Math.floor(x / 9), Math.floor(x / 3) % 3, x % 3
        ]);
        positionsInCube = Array.from({length: n}, (_, i) =>
          9 * digits[i] + 3 * digits[n + i] + digits[2 * n + i]);
      } else {
        const digits = [
          ...block.map(x => Math.floor(x / 9)),
          ...block.map(x => Math.floor(x / 3) % 3),
          ...block.map(x => x % 3)
        ];
        positionsInCube = Array.from({length: n}, (_, i) =>
          9 * digits[3 * i] + 3 * digits[3 * i + 1] + digits[3 * i + 2]);
      }
      positionsInCube.forEach((x, i) => {
        target[positions[at + i]] = cube[x];
      });
    }
    output.push(...target);
  }
  return output;
}

/** @param {number[]} source @returns {number} */
function ioc(source) {
  const h = new Int32Array(29);
  source.forEach(x => h[x]++);
  const pairs = Array.from(h).reduce((sum, count) =>
    sum + count * (count - 1), 0);
  return pairs / (source.length * (source.length - 1));
}

/**
 * Exact lowest IOC over all source windows, by O(n) sliding counts.
 * @param {number[]} source
 * @param {number} width
 * @returns {{minimum: number, windows: number, offset: number}}
 */
function minimumWindowIoC(source, width) {
  assert.ok(source.length >= width);
  const h = new Int32Array(29);
  source.slice(0, width).forEach(x => h[x]++);
  let pairs = Array.from(h).reduce((sum, count) =>
    sum + count * (count - 1), 0);
  let minimum = pairs, offset = 0;
  for (let i = width; i < source.length; i++) {
    const removed = source[i - width];
    pairs -= 2 * (h[removed] - 1);
    h[removed]--;
    const added = source[i];
    pairs += 2 * h[added];
    h[added]++;
    if (pairs < minimum) {
      minimum = pairs;
      offset = i - width + 1;
    }
  }
  return {
    minimum: minimum / (width * (width - 1)),
    windows: source.length - width + 1,
    offset
  };
}

/** @returns {object} */
function main() {
  const pages = corpus.pages.slice(0, 3).map(p => p.indices);
  assert.deepEqual(pages.map(p => p.length), [262, 266, 201]);
  const original = pages.flat();
  assert.equal(original.length, 729);
  assert.equal(original.filter(x => x === 0).length, 34);
  assert.equal(original.filter(x => x === 28).length, 28);
  assert.equal(original.filter(x => x !== 0 && x !== 28).length, 667);

  const title = gpEncode("THE INSTAR EMERGENCE");
  assert.equal(title.length, 17);
  assert.equal(title.reduce((sum, x) => sum + corpus.prime[x], 0), 761);
  const keyed = [...new Set(title), ...CORE.filter(x => !title.includes(x))];
  assert.equal(keyed.length, 27);

  const begin = control.indexOf("THE PROPHET", 500);
  const end = control.lastIndexOf("*** END OF");
  assert.ok(begin > 0 && end > begin);
  const native = gpEncode(control.slice(begin + 11, end));
  assert.equal(native.length, 47703);
  const benchmark = minimumWindowIoC(native, 729);
  assert.equal(benchmark.windows, 46975);
  assert.ok(Math.abs(benchmark.minimum - 0.055939944828833715) < 1e-12);

  // Blind mechanical control: source-native text encrypted with a
  // nonidentity 27-cell key survives exact round-trip including interrupts.
  const positive = native.slice(10000, 10729);
  const planted = trifid([positive], keyed, 27, false);
  const recovered = trifid([planted], keyed, 27, true);
  assert.deepEqual(recovered, positive);
  assert.ok(ioc(positive) > benchmark.minimum);

  const variants = [];
  for (const [key, cube] of [["GP order", CORE], ["2013 title", keyed]]) {
    for (const period of [3, 27]) {
      for (const [scope, parts] of [["chapter", [original]], ["page", pages]]) {
        for (const [mode, inverse] of [["inverse", true], ["forward", false]]) {
          const decoded = trifid(parts, cube, period, inverse);
          const roundtrip = trifid(
            scope === "chapter" ? [decoded] :
              [decoded.slice(0, 262), decoded.slice(262, 528), decoded.slice(528)],
            cube, period, !inverse
          );
          assert.deepEqual(roundtrip, original);
          const score = ioc(decoded);
          variants.push({key, period, scope, mode, ioc: score});
          assert.ok(score < benchmark.minimum,
            "Fixed original input lacks source-native GP IOC");
        }
      }
    }
  }
  const best = variants.reduce((a, b) => a.ioc > b.ioc ? a : b);
  assert.equal(variants.length, 16);
  assert.ok(Math.abs(best.ioc - 0.03542034097589653) < 1e-12);
  return {
    original: "LP2 physical p0-p2 original 729 GP runes",
    provisionalIllustration: "p2 insect nymph and three-barred crosses",
    sourceKey: "2013 761.MP3 title THE INSTAR EMERGENCE",
    titleGpPrimeSum: 761,
    cube: "27 of 29 GP symbols; literal F and EA pass-through",
    sourceGPControls: benchmark,
    originalIoC: ioc(original),
    variantCount: variants.length,
    maximumVariantIoC: best,
    nativePlantRecovered: recovered.length,
    conclusion: "No source-native plaintext in these sixteen fixed GP27 Trifid interpretations. Any other cube alphabet/keyword/reset/exception mechanism remains untested."
  };
}
if (require.main === module) {
  console.log(JSON.stringify(main(), null, 2));
}
module.exports = {gpEncode, trifid, ioc, minimumWindowIoC, main};
