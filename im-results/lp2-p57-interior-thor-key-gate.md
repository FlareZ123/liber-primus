# Solved p57's circumference interiors form THOR, a conditional key

**Agent21, 14 November 2026. Classification: exact original-source word-prime arithmetic, a motivated new candidate keyword, and bounded negative historical-cipher consumer. No unknown LP2 plaintext, confirmed author key or final destination has been recovered.**

## A source-defined route to a named divinity

Original physical p57 is genuinely clear GP29 text. It says, in part, **“WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.”** The independent complete-word rune boundaries, GP prime weights, and 256 original printed numeric cells are preserved in the canonical source JSON.

“Shed circumferences” could mean remove the first and last rune of a complete word. The previous [p57-to-table calculation](lp2-p57-divinity-p50-primewalk-closed-loop.md) independently established that exactly two of the twenty complete solved p57 words satisfy the table equation: the byte at one-based address `GPprimeSum(word) mod256` equals `GPprimeSum(word without first and last GP runes)`.

| Original p57 word | Whole prime sum | Table address | Original source byte | Interior prime sum |
| --- | ---: | ---: | ---: | ---: |
| TUNNELNG (TUNNELING) | 339 | 83 | 201 | 201 |
| DIUINITY (DIVINITY) | 376 | 120 | 184 | 184 |

**New direct observation:** those two independently matched table outputs add to the interior of the *explicitly mentioned word* CIRCUMFERENCES:

```
TUNNELNG interior        = 201
DIUINITY interior        = 184
CIRCUMFERENCES interior  = 385 = 201+184
385 = 5 × 7 × 11
GP primes 5, 7, 11 name the native runes TH, O, R
Therefore 385 -> THOR
```

The same source contains a distinct exact link: **PARABLE interior = 339 = TUNNELNG whole-word prime sum**. Original table values and first-party prime assignments were neither edited nor fitted.

THOR names a Norse deity, so this provides a possible literal reading of *divinity within*, and a candidate source-derived key. It still relies on the conjectural table addressing convention, summing the two selected values, prime-factor order, and a semantic choice about the Norse name. Earlier attempts searched many other source arithmetic patterns, so the discovery's probability cannot be treated as confirmatory. **No Cicada-authenticated instruction selects THOR as a password or cipher key.**

## Direct original p55 decryption, bounded and negative

The three genuine GP rune indices for TH–O–R are **[2,3,4]**. On the original 76 p55 rune symbols, test the exact historical LP1/p56 additive GP29 cipher with *transparent plaintext-F and an unadvanced key clock on such Fs*, preserving all possible inverse interpretations of ciphertext F. Also test the 75-rune body excluding the original p54 carry rune, and every three-symbol cyclic phase. For a source-motivated numeric alternative, use the historical prime-totient shifts of the THOR runes **[4,6,10]**, and their unadjusted prime values **[5,7,11]**; no private passphrase, auxiliary layer or plaintext language score selects a phase.

| Complete period-3 shift interpretation | Full p55 survivors, phases 0/1/2 | Page-local suffix survivors |
| --- | --- | --- |
| THOR GP indices [2,3,4] | **2 / 1 / 0** | **0 / 2 / 1** |
| Totients [4,6,10] | **0 / 0 / 0** | **0 / 0 / 0** |
| Raw GP primes [5,7,11] | **0 / 0 / 0** | **0 / 0 / 0** |

The three surviving original full-page literal-key strings remain GP29-uniform-looking and unreadable (IoC roughly 0.0319–0.0351). They are not decrypted English. Every surviving branch exactly reencrpyts its original ciphertext. All **95 original clear p57 rune symbols** were independently embedded under each key/phase and recovered exactly through the same branching inverse, including F-transparent skips.

**Cipher decision:** THOR is unsupported as a complete period-three historical strict-F Vigenère key for p55. The literal-index version is algebraically possible on a few nonprose branches, whereas the totient/raw-number readings are exactly incompatible on the untouched original source. Do not expand to discretionary phase shifts, missing-rune repairs or guessed extra layers.

## Distinct historically attested consumer: OutGuess

Cicada historically used OutGuess extraction from original JPEGs. The project already has an original-JPEG password-probe workflow with a planted known-key image and two independently authenticated default-key positive controls. An on-demand scan was dispatched with the **single newly selected exact password `THOR`** across all 58 original LP2 JPEGs ([GitHub Actions run 43642613710](https://github.com/FlareZ123/liber-primus/actions/runs/43642613710)). A matching OutGuess length header alone is a known false positive; a valid result requires meaningful signed/textual payload evidence. This dispatch remains a separate image-steganography hypothesis and does not imply that the 2014 images contain a keyed payload.

**Reproduction:** [one standalone original-input Node22 SFT](../sims/lp2_p57_interior_thor_p55_key_sft.cjs) reads `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-grid-256.json`, asserts the exact 20 solved-page words, their prime sums, original byte addresses, the conditional prime factorization to THOR, all p55 original inverse branches, and genuine p57 encrypted/decrypted positive controls. No plaintext is fabricated.
