'use strict';

/**
 * All-29 transparent-rune inverse of the literal LP2 p56 Euler-totient cipher.
 *
 * The original p56 exception rune F passes unchanged and does not consume the
 * next prime. This test grants any possible fixed GP29 rune the same privilege.
 * Every ambiguous ciphertext-equals-marker branch is retained, without
 * language scoring, manual key fitting, or dropping an invalid history.
 *
 * Input: source-checked original LP2 canonical rune-index corpus.
 * Output: page-local first-impossible offsets and planted-inverse controls.
 * No repository writes or network use.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
    path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const gp = corpus.translit;
const modulus = 29;

/** @returns {number[]} At least 1,000 prime-derived nontransparent shifts. */
function primeTotientShifts() {
    const primes = [2];
    for (let n = 3; primes.length < 1000; n += 2) {
        let prime = true;
        for (let d = 3; d * d <= n; d += 2) {
            if (n % d === 0) { prime = false; break; }
        }
        if (prime) primes.push(n);
    }
    return primes.map(p => (p - 1) % modulus);
}
const shifts = primeTotientShifts();

/**
 * @param {number[]} ciphertext
 * @param {number} marker A GP29 rune index that passes transparently.
 * @returns {{failure: number|null, possibleClocks: number[]}}
 */
function inverseAllHistories(ciphertext, marker) {
    let clocks = new Set([0]);
    for (let i = 0; i < ciphertext.length; i += 1) {
        const current = ciphertext[i];
        const next = new Set();
        for (const k of clocks) {
            if (current === marker) next.add(k);
            const inferred = (current - shifts[k] + modulus) % modulus;
            if (inferred !== marker) next.add(k + 1);
        }
        if (!next.size) return {failure: i, possibleClocks: []};
        clocks = next;
    }
    return {failure: null, possibleClocks: [...clocks].sort((a, b) => a - b)};
}

/**
 * Complete invertible forward witness under the proposed marker semantics.
 * @param {number[]} plaintext
 * @param {number} marker
 * @returns {{ciphertext: number[], consumed: number}}
 */
function encrypt(plaintext, marker) {
    const ciphertext = [];
    let consumed = 0;
    for (const p of plaintext) {
        if (p === marker) ciphertext.push(marker);
        else {
            ciphertext.push((p + shifts[consumed]) % modulus);
            consumed += 1;
        }
    }
    return {ciphertext, consumed};
}

assert.equal(gp.length, 29);
const pages = new Map(corpus.pages.map(p => [p.page, p.indices]));
for (const [p, n] of [[0, 262], [19, 271], [55, 76], [56, 85], [57, 95]]) {
    assert.equal(pages.get(p).length, n, `canonical physical p${p} changed`);
}
assert.deepEqual(pages.get(0).slice(0, 6), [15, 8, 18, 3, 6, 19]);
assert.equal(inverseAllHistories(pages.get(56), 0).failure, null,
    'authentic F-transparent p56 must remain feasible');

// Positive: an actual native-GP runic plaintext source, repeated to full p0
// physical length, is successfully inverted for every one of 29 markers.
const nativePlaintext = Array.from({length: 262}, (_, i) =>
    pages.get(57)[i % pages.get(57).length]);
for (let marker = 0; marker < 29; marker += 1) {
    const {ciphertext, consumed} = encrypt(nativePlaintext, marker);
    const recovered = inverseAllHistories(ciphertext, marker);
    assert.equal(recovered.failure, null, `synthetic ${gp[marker]} failed`);
    assert.ok(recovered.possibleClocks.includes(consumed),
        `lost true synthetic key clock for ${gp[marker]}`);
}

const rows = gp.map((rune, marker) => {
    const findings = Object.fromEntries([0, 19, 55, 56].map(page => [
        `p${page}`, inverseAllHistories(pages.get(page), marker).failure]));
    return {
        marker, rune, ...findings,
        p0_black_after_red13: inverseAllHistories(pages.get(0).slice(13), marker).failure,
    };
});
assert.equal(rows.every(row => row.p0 !== null), true,
    'unexpected surviving original p0 marker: investigate plaintext');
assert.equal(rows.find(r => r.rune === 'F').p0, 235);
assert.equal(rows.find(r => r.rune === 'W').p0, 5);
assert.equal(rows.find(r => r.rune === 'TH').p0, 243);
assert.equal(rows.every(row => row.p0_black_after_red13 !== null), true,
    'a 29-way transparent-rune branch survives the complete black p0 body');
assert.equal(Math.max(...rows.map(r => r.p0_black_after_red13)), 205);
assert.equal(rows.find(r => r.rune === 'P').p0_black_after_red13, 205);
assert.equal(rows.filter(r => r.p55 === null).length, 6);
assert.equal(rows.filter(r => r.p56 === null).length, 7);

// The source has mirrored double-cross page art; the sole backwards-p0
// algebraic survivor must be checked against a disjoint physical page.
const reverseP0 = [...pages.get(0)].reverse();
const reverseBody = pages.get(0).slice(13).reverse();
const reverseSurvivors = gp.filter((rune, marker) =>
    inverseAllHistories(reverseP0, marker).failure === null);
assert.deepEqual(reverseSurvivors, ['NG']);
assert.deepEqual(gp.filter((rune, marker) =>
    inverseAllHistories(reverseBody, marker).failure === null), ['NG']);
assert.deepEqual(inverseAllHistories(reverseP0, 21).possibleClocks, [253, 254]);
const reverseP1NgFailure =
    inverseAllHistories([...pages.get(1)].reverse(), 21).failure;
assert.equal(reverseP1NgFailure, 37);
console.log(JSON.stringify({
    title: 'Original p56 prime-totient: all 29 transparent GP29 symbols',
    source: 'resources/liber-primus/lp2-corpus.json',
    initial_prime: 2,
    page_clock_reset: true,
    max_original_p0_failure_offset: Math.max(...rows.map(r => r.p0)),
    max_p0_body_after_red13_failure_offset:
        Math.max(...rows.map(r => r.p0_black_after_red13)),
    all29_full_p0_original: false,
    all29_p0_body_after_red13_original: false,
    reverse_p0_surviving_markers: reverseSurvivors,
    reverse_p0_NG_final_key_clocks: [253, 254],
    reverse_p1_NG_first_failure: reverseP1NgFailure,
    synthetic_full_p0_positive_count: gp.length,
    full_p55_survivors: rows.filter(r => r.p55 === null).map(r => r.rune),
    full_p56_survivors: rows.filter(r => r.p56 === null).map(r => r.rune),
    first_impossible_zero_based_offsets: rows,
}, null, 2));
