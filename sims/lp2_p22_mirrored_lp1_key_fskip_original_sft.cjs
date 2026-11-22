'use strict';

/**
 * Source-exact LP1 p14/p15 -> LP2 p22 mirrored-key transfer.
 * A p22 source figure is the horizontal mirror of original solved-LP1
 * pp14-16 footer. The first two such LP1 pages use the authenticated
 * 13-rune key FIRFUMFERENFE with the original transparent-plaintext-F
 * non-consuming rule. Freeze mirror -> reverse the key rune ORDER.
 *
 * This is a single source-motivated, algebraic necessary-condition test:
 * every possible F/non-F predecessor state is retained without language
 * fitting, and every one of 13 initial key phases is checked in two signs.
 *
 * Run: node sims/lp2_p22_mirrored_lp1_key_fskip_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const page = (n) => {
  const p = corpus.pages.find((v) => v.page === n);
  assert.ok(p && Array.isArray(p.indices), 'missing canonical LP2 source page ' + n);
  return p.indices;
};
const p22 = page(22);
const p23 = page(23);
const other = [0, 1, 2].flatMap(page);
assert.equal(p22.length, 131);
assert.equal(p23.length, 213);
assert.equal(other.length, 729);

const originalHistoricalKey = [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18];
const mirrorKey = originalHistoricalKey.slice().reverse();
assert.equal(mirrorKey.length, 13);
assert.deepEqual(mirrorKey, [18, 0, 9, 18, 4, 18, 0, 19, 1, 0, 4, 10, 0]);

/**
 * Enumerate ALL legal unconsumed-key counts for the actual ciphertext.
 * The authentic solved-LP1/p56 F rule permits:
 *   P=F => C=F, no key advance.
 *   P!=F => C=(P+sign*K[(phase+advanced)%13]) mod29, advance 1.
 * Ciphertext C=F may be either branch; plaintext P=F may only bypass.
 *
 * @param {number[]} cipher
 * @param {number} phase
 * @param {1|-1} sign
 */
const invertState = (cipher, phase, sign) => {
  let current = new Set([0]);
  let lastReachable = 0;
  for (let i = 0; i < cipher.length; i += 1) {
    const incoming = cipher[i];
    const next = new Set();
    for (const consumed of current) {
      const key = mirrorKey[(phase + consumed) % mirrorKey.length];
      const candidate = (incoming - sign * key + 29) % 29;
      if (incoming === 0) next.add(consumed); // genuine F bypass
      if (candidate !== 0) next.add(consumed + 1);
    }
    if (next.size === 0) {
      return { firstImpossible: i, survivingStates: 0, lastReachable };
    }
    current = next;
    lastReachable = i + 1;
  }
  return { firstImpossible: null, survivingStates: current.size, lastReachable };
};

const allPhases = (cipher) => {
  const rows = [];
  for (const sign of /** @type {const} */ ([1, -1])) {
    for (let phase = 0; phase < 13; phase += 1) {
      rows.push({ sign, phase, ...invertState(cipher, phase, sign) });
    }
  }
  return rows;
};

/** @param {number[]} plain @param {number} phase @param {1|-1} sign */
const encrypt = (plain, phase, sign) => {
  const ciphertext = [];
  let advances = 0;
  for (const symbol of plain) {
    assert.ok(Number.isInteger(symbol) && symbol >= 0 && symbol < 29);
    if (symbol === 0) {
      ciphertext.push(0);
    } else {
      ciphertext.push((symbol + sign * mirrorKey[(phase + advances) % 13] + 29) % 29);
      advances += 1;
    }
  }
  return { ciphertext, advances };
};

// Independent authentic solved controls: p56 full known plaintext is tested
// against its ORIGINAL source ciphertext under the actual prime-totient key,
// then the first 85 clear p56 GP runes are combined with 46 clear p57 runes
// to create a withheld 131-rune native plant for the proposed mirror cipher.
const text = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO ' +
  'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
const parts = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
const spell = (v) => v.toUpperCase()
  .replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C')
  .replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
const plain56 = [];
for (const word of text.split(' ')) {
  const w = spell(word);
  for (let i = 0; i < w.length;) {
    const part = parts.find((t) => w.startsWith(t.s, i));
    assert.ok(part, 'missing known GP spelling ' + w.slice(i));
    plain56.push(part.i);
    i += part.s.length;
  }
}
assert.equal(plain56.length, 85);
const primeTotients = [];
for (let n = 2; primeTotients.length < plain56.length; n += 1) {
  let prime = true;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) { prime = false; break; }
  }
  if (prime) primeTotients.push((n - 1) % 29);
}
let clock = 0;
const actualP56Replayed = plain56.map((p) => (p === 0)
  ? 0 : (p + primeTotients[clock++]) % 29);
assert.deepEqual(actualP56Replayed, page(56),
  'authenticated full solved p56 must reencrypt to its original ciphertext');

const native131 = plain56.concat(page(57).slice(0, 46));
assert.equal(native131.length, 131);
const plants = [];
for (const sign of /** @type {const} */ ([1, -1])) {
  for (let phase = 0; phase < 13; phase += 1) {
    const plant = encrypt(native131, phase, sign);
    const decoded = invertState(plant.ciphertext, phase, sign);
    assert.equal(decoded.firstImpossible, null,
      'proposed key inverse lost the real 131-rune planted plaintext');
    assert.ok(decoded.survivingStates >= 1);
    plants.push({ sign, phase, consumed: plant.advances });
  }
}

const original22 = allPhases(p22);
const original23 = allPhases(p23);
const originalOther = allPhases(other);
const joined = allPhases(p22.concat(p23));
const legal = (r) => r.filter((x) => x.firstImpossible === null)
  .map((x) => ({ sign: x.sign, phase: x.phase }));
const maxPrefix = (r) => Math.max(...r.map((x) => x.lastReachable));

assert.deepEqual(legal(original22), [], 'original p22 unexpectedly gained a mirrored-key inverse');
assert.deepEqual(legal(joined), [], 'joined source should die within p22');
assert.ok(plants.length === 26, 'missing a positive sign/phase condition');

console.log(JSON.stringify({
  source: 'LP1 p14/p15 authentic 13-rune cipher key; mirrored original footer -> reverse key on LP2 p22',
  originalHistoricalKey,
  mirrorKey,
  originalP22: {
    sourceRunes: p22.length,
    all26ReversedKeySignPhases: original22,
    legal: legal(original22),
    longestAdmissiblePrefix: maxPrefix(original22)
  },
  independentP23: {
    sourceRunes: p23.length,
    legal: legal(original23),
    longestAdmissiblePrefix: maxPrefix(original23)
  },
  independentOtherChapterP0P2: {
    sourceRunes: other.length,
    legal: legal(originalOther),
    longestAdmissiblePrefix: maxPrefix(originalOther)
  },
  joinedP22P23: {
    sourceRunes: p22.length + p23.length,
    legal: legal(joined)
  },
  originalSolvedPositive: {
    sourceP56Entire85Reencrypted: true,
    native131Plant: 'actual clear p56 first85 and clear p57 first46',
    native131Runes: native131.length,
    originalAuthenticFBypassEvents: native131.filter((x) => x === 0).length,
    all26PhasesAndSignsReachableOnNativePlants: plants.length
  }
}, null, 2));
