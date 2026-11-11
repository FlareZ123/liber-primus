# 32×405 original ink-and-grid tableau: full-source inverse challenge

**Result:** a source-led, reversible cryptanalytic test of a previously uncombined manuscript structure. All proposed original-register inverses remain ciphertext-like. **No unknown Liber Primus plaintext, key, continuation, or authenticated decipherment was recovered.** The numerical compatibility motivates a hypothesis; it is not proof the original designer intended it.

## The source-visible 32×405 construction

The seven annotated, separately delimited original quotation spans in the unsolved manuscript have rune lengths **[18, 19, 12, 58, 68, 160, 70]**, totaling **405**. The source manuscript also contains a **32-row × 8-column numerical table**, currently decoded as 256 bytes under the canonical base-60 transcription. Across all original rune-bearing unsolved pages there are **12,956** runes, so 32 × 405 = **12,960**, a difference of precisely **four**, equal to the number of visibly printed apostrophes.

Treat the four original apostrophes as unencrypted, rune-free *key-clock slots* immediately before global rune indices **1,110, 5,138, 8,515 and 10,089**. The expanded stream now has 32 source-length blocks of 405 slots, without inventing or deleting any ciphertext rune. Its four empty locations are:

| Apostrophe | Expanded zero-based slot | Block / local slot (0-based) |
| ---: | ---: | ---: |
| 1 | 1,110 | 2 / 300 |
| 2 | 5,139 | 12 / 279 |
| 3 | 8,517 | 21 / 12 |
| 4 | 10,092 | 24 / 372 |

These are fixed by original punctuation. There is no guessed phase or ciphertext-selected slot. The original quote glyphs themselves, read in their printed book order, form a repeatable 405-rune source key. Each of the 32 original printed numerical rows provides eight bytes of additional row-specific material.

This architecture is a finite **candidate** for a simple human-solvable Vigenère-like tableau, possibly with a row-seeded stream generator. It must produce authentic plaintext on the actual cipher before one can infer anything about historical intent.

## Fully reversible original-input experiments

The [standalone CommonJS original-source SFT](../sims/quote405_grid32_strip_inverse_sft.cjs) reads the exact source corpus, original apostrophe/quote annotations, canonical base-60 numerical grid, and independent whole-word GP-Latin reference. For all **12,956 original runes** it tests these 24 previously unverified settings:

- **Four quote-plus-grid keys:** at source clock slot t=405r+c, take ±Q[c] ± B[r,c mod8]. The same 405 printed quotation runes repeat in all 32 blocks; row r selects its actual eight table values. These four keys run through direct additive GP29 and an invertible GP28 predecessor-exclusion register, totaling **8** models.
- **Eight RC4 grid-row keys:** initialize a fresh RC4 stream from each original eight-byte row, with byte drop 0 or 256, direct remainder modulo29 or scaled byte-to-GP29 mapping, and either arithmetic sign. Repeat across the same **two** candidate GP registers, totaling **16** models. RC4 is a cryptographic candidate, not an independently authenticated method in Liber Primus.

The GP29 inverse is ordinary modular subtraction. The GP28 inverse uses the independently known generator 15 of the 28 nonzero residues in F29: a zero ciphertext difference encodes literal GP symbol EA/index28; a nonzero difference is the discrete-log rank, offset by the source key modulo28. Apostrophe slots consume key-clock positions but emit no rune. These are exact forward/inverse rules, not guesses about plaintext snippets.

Original ciphertext IoC is **0.0344783979**. The best quote-plus-row nonzero-step inverse has **0.0353094623**; the best RC4-row nonzero-step inverse has **0.0353404552**; the direct GP29 quote-plus-row candidates remain **0.0344629–0.0344986**. Every output has nonlinguistic original text. The slight increase in GP28-output IoC is expected from turning the original 86 consecutive equal-rune events into explicit EA symbols; it is not language evidence.

**Positive source-native control:** A separate 12,956-rune GP-encoded Latin Vulgate source is encrypted from its true symbols under each candidate model using the exact original printed keys, four punctuation-clock slots and independent row restarts. The same inverses recover **12,956/12,956 genuine source-native runes in every case**. Every original decoded candidate is also reencrypted back to its original ciphertext byte-for-byte. The latter property alone cannot authenticate a key because the transforms are bijective.

## Decision and practical next step

The exact **32 rows × 405 quoted runes − 4 apostrophe marks = 12,956** relationship makes the layout an economical, original-source-selected question. Its literal Vigenère-style quote/table composition and one historically simple 64-bit-row stream-cipher variant, however, **do not reveal any authentic unknown LP2 prose**. Further permutations of the same four symbols or unmotivated RC4 drop amounts are unlikely to help.

An advancing experiment must explain from original clues how quoted spans, punctuation-clock holes and table rows specify an actual operation capable of recovering original plaintext, preferably with a withheld full block. Unknown binary intermediates, changed manuscript breaks, unseen historical key material and non-additive layers remain possible. The test does not eliminate those hypotheses.

**Reproducer:** `sims/quote405_grid32_strip_inverse_sft.cjs`, Node.js 22, using `resources/liber-primus/lp2-corpus.json`, `base60-grid.json`, `lp2-quote-punctuation-spans.json` and `resources/control/latin-vulgate-gp-wholewords.txt`. This is intermediate evidence and does not change established findings in `results/README.md`.