/**
 * Exact original p0 full-page ambiguity witnesses for arbitrary page-private
 * previous-cipher-rune GP29 alphabets. Node.js 22 CommonJS, read-only SFT.
 *
 * These two independently chosen unrelated English-word mosaics were fitted
 * adversarially to the original original page-0 ciphertext under secret
 * 29-row substitution tables. They are COUNTEREXAMPLES TO IDENTIFIABILITY,
 * neither a true plaintext claim nor an author-selected cipher proposal.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const sourcePage = corpus.pages.find((p) => p.page === 0);
const C = sourcePage.indices;
const runeGlyphs = corpus.runes;
assert.equal(C.length, 262);

const lines = transcription.split('%').filter((s) => /[\u16a0-\u16ff]/u.test(s));
const originalWords = lines[0].replace(/[\/\r\n]/g, '').split(/[-.,&$]+/)
  .map((s) => [...s].filter((r) => runeGlyphs.includes(r)))
  .filter((a) => a.length > 0);
const lengths = originalWords.map((a) => a.length);
assert.equal(lengths.length, 59);
assert.equal(lengths.reduce((sum, n) => sum + n, 0), 262);

/**
 * Fixed, source-independent literal-word mosaics, constructed by constrained
 * English-word sampling. They intentionally contain no coherent paragraph.
 */
const mosaics = [
  'OKLAHOMA VOTES CAME FOX FEAR IMPERIALISM WOUND OTIS LUI GAP UPON MAY AMAZED UNDERGROUND DO TO BIT WEAK DRESSINGS MIDST PUNISHED OF SHOW OF TEAR SUN GRAND KING OUT ARMY HUNG EFFORT FROM SOUNDS LET PAPA PROXIMAL BESIDES XXV I EXPOSING CHRIST FIG HELP CAUSE VI FRONTIER BEEN OWN HEAR COINAGE TROPHIC HE SARCOMA I DESPOTISM IDEA LAND T',
  'COSSACKS ULCER OSTEO FOR SET CONNECTICUT PASSING MOBS RUB MAP ALSO THIS MOSCOW UNEXPRESSED IT OF MOP WHO BETWEEN MARRY PAULUCCI TM NEARING LA QUE REAL MISSING THE EASY FLOW DURING NUMBER INTO CLERGY YOU PERI LOCALITY SMILINGLY RAN S ACCENT STERNO FEAR FROM GIVES AK APPETITE WEARY ONE TWO DEVISED OBLIGED EAU STREETS T PAINFULLY HER LIVE F'
];

/**
 * Explicit approximation to GP29 English spelling used only to build the
 * independent constructed witnesses. It is not asserted to reproduce Cicada's
 * editorial glyph conventions for each historic word. The actual original
 * ciphertext uses the unchanged canonical 29 glyphs.
 */
const tokens = ['ING', 'ION', 'TH', 'EA', 'AE', 'OE', 'EO'];
const mapped = new Map([
  ['ING','NG'], ['ION','IA'], ['TH','TH'], ['EA','EA'],
  ['AE','AE'], ['OE','OE'], ['EO','EO']
]);
const alphabet = corpus.translit;
assert.equal(alphabet.length, 29);

/** @param {string} sourceWord @returns {number[]} */
function encodeWord(sourceWord) {
  const word = sourceWord.toUpperCase()
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'X');
  const out = [];
  for (let i = 0; i < word.length;) {
    const chosen = tokens.find((t) => word.startsWith(t, i));
    if (chosen) {
      const k = alphabet.indexOf(mapped.get(chosen));
      assert.ok(k >= 0);
      out.push(k);
      i += chosen.length;
    } else {
      const k = alphabet.indexOf(word[i]);
      assert.ok(k >= 0, 'Non-GP letter in ' + sourceWord);
      out.push(k);
      i++;
    }
  }
  return out;
}

/**
 * Complete arbitrary secret alphabets. The entire observed 262-rune page is
 * mapped bijectively with a separate reversible initialization row for its
 * first rune. All never-observed row entries are filled canonically, which
 * proves existence but in no way derives the key from a Cicada source.
 * @param {number[]} plain
 */
function buildPrivateKey(plain) {
  const decryptRows = Array.from({length:29}, () => Array(29).fill(-1));
  const encryptRows = Array.from({length:29}, () => Array(29).fill(-1));
  let constrainedEdges = 0;
  for (let i = 1; i < C.length; i++) {
    const row = C[i - 1], cipher = C[i], p = plain[i];
    if (decryptRows[row][cipher] !== -1) {
      assert.equal(decryptRows[row][cipher], p,
        'A repeated original ciphertext edge must recover the same plaintext rune');
    } else {
      decryptRows[row][cipher] = p;
      constrainedEdges++;
    }
    if (encryptRows[row][p] !== -1) {
      assert.equal(encryptRows[row][p], cipher,
        'Distinct ciphertext followers must decrypt to distinct plaintext runes in a row');
    } else {
      encryptRows[row][p] = cipher;
    }
  }
  for (let row = 0; row < 29; row++) {
    const remainingP = Array.from({length:29}, (_, p) => p)
      .filter((p) => encryptRows[row][p] === -1);
    const remainingC = Array.from({length:29}, (_, c) => c)
      .filter((c) => decryptRows[row][c] === -1);
    assert.equal(remainingP.length, remainingC.length);
    for (let j = 0; j < remainingP.length; j++) {
      encryptRows[row][remainingP[j]] = remainingC[j];
      decryptRows[row][remainingC[j]] = remainingP[j];
    }
    assert.equal(new Set(encryptRows[row]).size, 29);
    assert.equal(new Set(decryptRows[row]).size, 29);
  }
  const initialEncode = Array.from({length:29}, (_, i) => i);
  [initialEncode[plain[0]],initialEncode[C[0]]] =
    [initialEncode[C[0]],initialEncode[plain[0]]];
  const initialDecode = Array.from({length:29}, () => -1);
  for (let p = 0; p < 29; p++) initialDecode[initialEncode[p]] = p;
  const decoded = [initialDecode[C[0]]];
  const reconstructed = [initialEncode[plain[0]]];
  for (let i = 1; i < C.length; i++) {
    decoded.push(decryptRows[C[i - 1]][C[i]]);
    reconstructed.push(encryptRows[reconstructed[i - 1]][plain[i]]);
  }
  assert.deepEqual(decoded, plain, 'All 262 original ciphertext runes must decode');
  assert.deepEqual(reconstructed, C, 'Every original ciphertext rune must reencrypt exactly');
  return {constrainedEdges, encryptRows, decryptRows, initialEncode};
}

const plaintexts = [];
const summaries = [];
for (const [witnessNo, prose] of mosaics.entries()) {
  const words = prose.split(' ');
  assert.equal(words.length, 59, 'Witness must preserve all original printed word boundaries');
  const runicWords = words.map(encodeWord);
  assert.deepEqual(runicWords.map((a) => a.length), lengths,
    'Witness must preserve original actual rune-length tape exactly');
  const P = runicWords.flat();
  assert.equal(P.length, C.length);
  const key = buildPrivateKey(P);
  assert.equal(key.constrainedEdges, 215);
  plaintexts.push(P);
  summaries.push({
    witness: witnessNo + 1, preservedWholePageRunes: P.length,
    preservedOriginalPrintedWords: words.length,
    constrainedCiphertextEdges: key.constrainedEdges,
    occupiedSecretRows: key.decryptRows.filter((r) => r.length === 29).length,
    distinctPlainSymbols: new Set(P).size,
    firstFourWords: words.slice(0,4).join(' ')
  });
}
const differing = plaintexts[0].filter((x,i) => x !== plaintexts[1][i]).length;
assert.ok(differing >= 150);
console.log(JSON.stringify({originalPage:0, originalRunes:C.length, witnessSummaries:summaries,
  incompatiblePlaintextPositions:differing, fullEncryptDecryptChecks:'PASS'}, null, 2));
console.log('PASS: two incompatible complete source-original page0 decryptions have valid private bijective 29-row dictionaries; neither key is source-authenticated and neither English-word mosaic is recovered Cicada plaintext.');
