# Source-frame perimeter as independent wordwise prime clocks on LP2 p55

**Result:** bounded original-cipher rejection for a natural consumer of the previously identified 5×5 p50 numerical frame. No new plaintext, key or authenticated author operation was obtained. Reproduce with [the complete Node 22 SFT](../sims/lp2_p50_perimeter_wordseed_phi_p55_sft.cjs).

## Why this operation was tested

The provisional p57-clause-prime lookup identifies a 5×5 rectangle in the original p49–51 32×8 numeral table, rows 21–25 and columns 1–5. Under the conjectural radix-59 reading, its corners are 224, 115, 73 and 75. This source arithmetic and its uncertainty are documented in [the p57 FIND/MUST square report](lp2-p57-find-must-base59-dh151-35-primitive-root.md). The original physical p55 has 76 runes, including the final rune of a word carried from p54. Its remaining 75 runes form exactly 16 complete hyphen/dot-delimited words, the number of cells on a 5×5 perimeter. These exact correspondences motivated testing a word-specific key rather than another free phrase or global password.

The proposed receiver assigns one printed **perimeter cell** to each successive complete p55 word. Starting at the square's bottom-left 73 cell, traverse the perimeter clockwise; the independent opposite direction retains that start cell. Treat each printed cell value as a **zero-based prime ordinal**, resetting the prime stream at each next word. Decode with the **actual solved-p56 totient rule**, giving every emitted non-F GP rune a shift of ±(phi(prime)) = ±(prime-1) modulo29. A plaintext F is transparent and does not consume a prime. Enumerate every admissible F-bypass branch at each cipher F; require all recovered branches to exactly forward-reencrypt their original word.

The full bounded family comprises the provisional 59-symbol alphabet and conventional 60-symbol printed alphabet, each perimeter direction and each sign: **eight** fixed source-key models. No key, crib, clock phase or word shift was fitted to p55. Each model has a positive planted control obtained by encrypting the first 75 original clear p57 runes using the 16 original p55 word lengths, and recovering all 75 runes. The first incoming carried rune is excluded from the wordwise starts, as the physical text requires.

## Original-input outcome

| Numeric reading | Perimeter direction | Forward sign | Words with no valid F inverse | Words matching a 29,157-entry English lexicon | Matches of length >=3 GP runes |
|---|---|---:|---:|---:|---:|
| Radix 59 | Clockwise | −1 | 0 | 1 | 0 |
| Radix 59 | Clockwise | +1 | 2 | 1 | 0 |
| Radix 59 | Counterclockwise | −1 | 1 | 1 | 0 |
| Radix 59 | Counterclockwise | +1 | 2 | 1 | 0 |
| Radix 60 | Clockwise | −1 | 4 | 1 | 0 |
| Radix 60 | Clockwise | +1 | 0 | 3 | 0 |
| Radix 60 | Counterclockwise | −1 | 4 | 0 | 0 |
| Radix 60 | Counterclockwise | +1 | 3 | 3 | 0 |

The entire 75-rune recipient has a legal F-bypass inverse in **only two of eight** models. Neither surviving model produces a single lexicon word of length three or more GP runes; its isolated very short matches are ordinary chance events (e.g. AM, MI, LO). No coherent phrase appears. For six models at least one source word has **no** allowable inverse under the authenticated F rule, an exact key/clock contradiction that does not depend on dictionary assumptions.

This evidence **does not** invalidate the square, the perimeter/word cardinality coincidence or the underlying prime/totient operation. The original sources do not say that a printed numeral is a prime-stream starting ordinal, that a word resets the clock, or that p55 is a receiver. The two legal models are disfavored against the stated finite English lexicon, not logically impossible for all languages or nonprose content. A different key-to-word operation would require a new independently motivated rule or actual plaintext evidence; expanding unfixed phase/key variations would restore the same underdetermination that this experiment was designed to avoid.

## Inputs and verification

The complete script passed independently on Windows-latest with Node.js 22: [successful CI execution 44357070029](https://github.com/FlareZ123/liber-primus/actions/runs/44357070029). The execution printed all eight original-branch results, and all original and planted reencryption assertions passed.

- Exactly 256 printed original p49–51 tokens in `resources/liber-primus/lp2-grid-256.json`, with the declared base60 and explicitly conditional radix59.
- Exact original physical p55 76-rune sequence, and 16 complete 75-rune word sequence, from `resources/liber-primus/lp2-transcription.txt` and independently cross-checked against `lp2-corpus.json`.
- Independently clear p57's original 95-rune GP text for all eight planted encrypt/decrypt controls.
- Pinned TextBlob-derived 29,157-English-word source in `resources/control/english_wordfreq_textblob.txt`, source-native digraph handling and declared orthographic replacements; lexical exclusion has exactly this finite scope.
- Every candidate original inverse forwards exactly back to the original ciphertext. All F branches are retained, with no truncation or beam search.

**Next decision:** the prime-ordinal-per-word receiver is not supported; do not repeat it with more arbitrary word permutations. Seek a source-authenticated transformation selecting an independently meaningful 76-rune output or a source-derived key with the correct cryptographic interface.
