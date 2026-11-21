# 2016 “OpenPGP” prime-sum address lands on p50's base60 2-cycle

**Status: strong source-aligned radix/graph selector hypothesis; not a decryption.** The key observation is exact and uses no K/V transliteration: GP-prime sum(OPENPGP) = 249, and base60 p50 has the 2-cycle 249↔158.

## Why this test is motivated

Two source facts are already established:

1. The 2013 Cicada OS arithmetic uses the GP prime-weight sum for words: THE INSTAR EMERGENCE sums to 761, matching the source MP3 filename. The repository's historical synthesis records this and the 2013/2014 prime-sum/product evidence.
2. The signed 2016 message ends with the explicit instruction **“Verify OpenPGP.”** Earlier in that message it says that words are the map and numbers are the direction. Its 13-word coda is visibly segmented 11+2:
   - 11 words: “Seek and you will be found. Good luck. Beware false paths.”
   - 2 words: “Verify OpenPGP.”

The p50 original 32×8 table has two competing numeral readings. Under base60, its row-major values define a 256-state functional graph with an 11-cycle and a 2-cycle. Under base59, the graph instead has one fixed-point cycle. This test asks whether the signed message's final word supplies a source-derived address for the small cycle.

## Exact arithmetic

The GP prime weights are the first 29 primes in canonical rune order (from resources/liber-primus/lp2-corpus.json). OPENPGP contains only unambiguous GP letters:

- O = 7
- P = 43
- E = 67
- N = 29
- P = 43
- G = 17
- P = 43

The independent 2013 CICADA OS title THE INSTAR EMERGENCE has the historically documented GP-prime sum 761 (matching 761.mp3). Because p50 has 256 cells, its natural address reduction is 761 mod 256 = 249. Thus the 2013 title and the 2016 final word OPENPGP independently select the same p50 address 249. The modulo-256 step is a natural inference from the table size, not an explicit printed modulo instruction.

Therefore:
\[
7+43+67+29+43+17+43 = \mathbf{249}.
\]

The original p50 cell at address 249 is token 2c. Under base60, 2c decodes to 158. The original p50 cell at address 158 is token 49, which decodes to 249. Thus:

\[
249 \xrightarrow{p50} 158 \xrightarrow{p50} 249.
\]

This is exactly one of base60's two cycles. Under base59, the same token 2c at address249 decodes to156; the base59 graph has no 2-cycle and instead has a single fixed point at189. The exact OPENPGP address therefore discriminates the base60 reading from the base59 reading.

As a secondary, less robust check, VERIFY has GP-prime sum216 if V is transliterated as F. Under base60, address216 enters the 11-cycle after 11 steps. This V→F mapping is not needed for the OPENPGP result and is not treated as independent proof.

## Whole-message check and limits

Using the 43 alphabetic words of the signed 2016 message, with K→C and V→F only where needed, OPENPGP is the **only** word whose prime-sum address falls in base60's 4-node small basin; it is also the only word whose address is on the 2-cycle. The other 42 word addresses fall in the large 252-node basin. Because that basin covers 252/256 states, the latter fact is weak and should not be presented as a significant statistical result. The discriminating observation is the source-selected final word OPENPGP landing exactly on cycle node249.

The 11+2 coda split and the “Beware false paths” wording may describe the 11-cycle/2-cycle structure, with OPENPGP marking the small verification loop. That interpretation remains a hypothesis: the cycle graph does not yet supply a cipher inverse or unknown-page plaintext. Do not claim the 2-cycle is certainly a false path, or that this proves base60 beyond reasonable doubt. It is, however, a concrete first-party selector worth testing against the original p50 illustration and the 2016 signed-message layout.

## Reproduction

Run from the repository root with Node.js; no dependencies:

```js
const fs = require("node:fs");
const grid = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-grid-256.json","utf8"));
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const tokens = grid.pages.flatMap(p => p.tokens);
const A60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
const A59 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx";
const decode = (token, alphabet) =>
  alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
const T60 = tokens.map(t => decode(t, A60));
const T59 = tokens.map(t => decode(t, A59));
const primeByTranslit = new Map(corpus.translit.map((s,i) => [s, corpus.prime[i]]));
const gpLetter = ch => ch === "K" ? "C" : ch === "V" ? "F" : ch;
const sum = word => [...word].reduce((n,ch) => n + primeByTranslit.get(gpLetter(ch)), 0);

const words = [
  "HELLO","THE","PATH","LIES","EMPTY","EPIPHANY","SEEKS","THE","DEVOTED",
  "LIBER","PRIMUS","IS","THE","WAY","ITS","WORDS","ARE","THE","MAP","THEIR",
  "MEANING","IS","THE","ROAD","AND","THEIR","NUMBERS","ARE","THE","DIRECTION",
  "SEEK","AND","YOU","WILL","BE","FOUND","GOOD","LUCK","BEWARE","FALSE",
  "PATHS","VERIFY","OPENPGP"
];
const cycle11 = new Set([0,203,68,199,47,76,114,197,115,247,192]);
const cycle2 = new Set([158,249]);
function basin(T, start) {
  let x = start, depth = 0, seen = new Set();
  while (!seen.has(x)) {
    if (cycle11.has(x)) return {cycle:11, entry:x, depth};
    if (cycle2.has(x)) return {cycle:2, entry:x, depth};
    seen.add(x); x = T[x]; depth++;
  }
  return {cycle:"other", entry:x, depth};
}
const records = words.map((word,i) => {
  const primeSum = sum(word), address = primeSum % 256;
  return {position:i+1, word, primeSum, address, ...basin(T60,address)};
});
console.log(JSON.stringify({
  openpgpPrimeSum: sum("OPENPGP"),
  base60At249: {token:tokens[249], value:T60[249], next:T60[T60[249]]},
  base59At249: {token:tokens[249], value:T59[249]},
  records
}, null, 2));
```

**Decision:** treat this as a source-constrained base60/functional-graph selector candidate. The next useful test is not another unconstrained radix search; it is an independent, blind check that the original p50 tree/dot illustration or the 2016 coda layout selects the same 2-cycle/11-cycle interpretation. Even if confirmed, a separate reversible operation is still required to recover LP2 plaintext.
