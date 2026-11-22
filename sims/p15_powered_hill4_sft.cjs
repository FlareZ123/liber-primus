/**
 * LP2 p15 Fibonacci-prime square as an evolving 4x4 Hill matrix.
 * SFT: node sims/p15_powered_hill4_sft.cjs
 * No external dependencies or file writes. Each mathematical operation is over GF(29).
 * This tests a bounded conjecture; it does not identify a creator-specified cipher.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const sourceText = fs.readFileSync(path.join(__dirname, '..', 'resources', 'control', 'shakespeare_first300k.txt'), 'utf8');
const Q = 29;
const mod = (x) => ((x % Q) + Q) % Q;
const identity = () => Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => Number(i === j)));
const printed = [[3258, 3222, 3152, 3038], [3278, 3299, 3298, 2838],
    [3288, 3294, 3296, 2472], [4516, 1206, 708, 1820]];
const originalKey = printed.map((row) => row.map(mod));

/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function multiply(a, b) {
    return a.map((row) => Array.from({ length: 4 }, (_, j) =>
        mod(row.reduce((sum, n, k) => sum + n * b[k][j], 0))));
}
/** @param {number[][]} a @returns {number[][]} */
function inverse(a) {
    const aug = a.map((row, i) => [...row, ...identity()[i]]);
    for (let col = 0; col < 4; col++) {
        const pivot = aug.findIndex((row, index) => index >= col && row[col] !== 0);
        assert(pivot >= 0, 'Matrix must be invertible over GF29');
        [aug[pivot], aug[col]] = [aug[col], aug[pivot]];
        const factor = Array.from({ length: Q - 1 }, (_, i) => i + 1)
            .find((x) => mod(x * aug[col][col]) === 1);
        assert(factor !== undefined);
        aug[col] = aug[col].map((x) => mod(x * factor));
        for (let i = 0; i < 4; i++) {
            if (i === col) continue;
            const count = aug[i][col];
            aug[i] = aug[i].map((x, j) => mod(x - count * aug[col][j]));
        }
    }
    return aug.map((row) => row.slice(4));
}
/** @param {number[][]} a @param {number} flags @returns {number[][]} */
function orient(a, flags) {
    let b = a.map((row) => row.slice());
    if (flags & 4) b = b.map((row) => row.reverse());
    if (flags & 2) b = b.reverse();
    if (flags & 1) b = b[0].map((_, j) => b.map((row) => row[j]));
    return b;
}
/** @param {number[]} xs @param {number[][]} key @param {number} firstPower @returns {number[]} */
function transform(xs, key, firstPower) {
    let state = firstPower === 0 ? identity() : key;
    const result = [];
    for (let i = 0; i < xs.length; i += 4) {
        if (i + 4 > xs.length) {
            result.push(...xs.slice(i)); // transparent 1–3-rune page tail
            continue;
        }
        const block = xs.slice(i, i + 4);
        result.push(...state.map((row) => mod(row.reduce(
            (sum, value, j) => sum + value * block[j], 0))));
        state = multiply(state, key);
    }
    return result;
}
/** @param {number[][]} segments @param {number[][]} key @param {'page'|'continuous'} clock @param {number} firstPower @returns {number[]} */
function decode(segments, key, clock, firstPower) {
    const blocks = clock === 'continuous' ? [segments.flat()] : segments;
    return blocks.flatMap((xs) => transform(xs, key, firstPower));
}
/** @param {number[]} symbols @returns {number} */
function coincidence(symbols) {
    const hist = Array(Q).fill(0);
    for (const x of symbols) hist[x]++;
    return hist.reduce((sum, count) => sum + count * (count - 1), 0) /
        (symbols.length * (symbols.length - 1));
}
/** @param {string} text @returns {number[]} */
function encodeGP(text) {
    const alphabet = new Map(corpus.translit.map((x, i) => [x, i]));
    const digraphs = ['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
    const normalized = text.toUpperCase().replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
    const result = [];
    for (let i = 0; i < normalized.length;) {
        const pair = digraphs.find((d) => normalized.startsWith(d, i));
        if (pair) {
            result.push(alphabet.get(pair));
            i += 2;
        } else {
            const letter = alphabet.get(normalized[i++]);
            if (letter !== undefined) result.push(letter);
        }
    }
    return result;
}
const pages = (first, last) => corpus.pages.filter(
    (p) => p.page >= first && p.page <= last && p.indices.length > 0).map((p) => p.indices);
const near = pages(16, 22);
const far = pages(40, 55);
assert.equal(near.flat().length, 1744);
assert.equal(far.flat().length, 3316);
assert.equal(corpus.pages.filter((p) => p.page >= 0 && p.page <= 55)
    .reduce((sum, p) => sum + p.indices.length, 0), 12956);
assert.deepEqual(originalKey, [[10, 3, 20, 22], [1, 22, 21, 25],
    [11, 17, 19, 7], [21, 17, 12, 22]]);
assert.deepEqual(multiply(originalKey, inverse(originalKey)), identity());

const solved = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(solved.length, 95);
const controls = encodeGP(sourceText);
assert.equal(controls.length, 218800);
const nearControl = controls.slice(1024, 1024 + 1744);
const farControl = controls.slice(10000, 10000 + 3316);
const rows = [];
for (let orientation = 0; orientation < 8; orientation++) {
    const oriented = orient(originalKey, orientation);
    for (const sign of [-1, 1]) {
        const decoder = sign === -1 ? inverse(oriented) : oriented;
        const encoder = inverse(decoder);
        for (const clock of ['page', 'continuous']) {
            for (const firstPower of [0, 1]) {
                // The native solved p57 is encrypted under a private powered key
                // and decoded without selecting an English score or fitting params.
                const encoded = decode([solved], encoder, clock, firstPower);
                assert.deepEqual(decode([encoded], decoder, clock, firstPower), solved);
                const nearResult = decode(near, decoder, clock, firstPower);
                const farResult = decode(far, decoder, clock, firstPower);
                // A positive plant with realistic original interval lengths.
                const sourceNativePlant = decode([nearControl], encoder, clock, firstPower);
                assert.deepEqual(decode([sourceNativePlant], decoder, clock, firstPower), nearControl);
                rows.push({
                    orientation, sign, clock, firstPower,
                    nearIoC: coincidence(nearResult),
                    farIoC: coincidence(farResult),
                    preview: nearResult.slice(0, 24).map((x) => corpus.translit[x]).join(' ')
                });
            }
        }
    }
}
assert.equal(rows.length, 64);
rows.sort((a, b) => b.nearIoC - a.nearIoC);
const maximum = rows[0];
assert.equal(maximum.orientation, 1);
assert.equal(maximum.sign, -1);
assert.equal(maximum.clock, 'page');
assert.equal(maximum.firstPower, 1);
assert(Math.abs(maximum.nearIoC - 0.03476224689057673) < 1e-12);
assert(Math.abs(Math.max(...rows.map((x) => x.farIoC)) - 0.034642220997148976) < 1e-12);
assert(Math.abs(coincidence(nearControl) - 0.06329051461415781) < 1e-12);
assert(Math.abs(coincidence(farControl) - 0.059570763445027264) < 1e-12);
console.log(JSON.stringify({
    input: { nearRunes: near.flat().length, farRunes: far.flat().length, variants: rows.length },
    controls: { nearEnglishIoC: coincidence(nearControl), farEnglishIoC: coincidence(farControl),
        nativeSolvedP57IoC: coincidence(solved), plantsRecovered: rows.length },
    cipher: { nearIoC: coincidence(near.flat()), farIoC: coincidence(far.flat()) },
    bestNear: maximum, maxFarIoC: Math.max(...rows.map((x) => x.farIoC)),
    minNearIoC: Math.min(...rows.map((x) => x.nearIoC))
}, null, 2));
