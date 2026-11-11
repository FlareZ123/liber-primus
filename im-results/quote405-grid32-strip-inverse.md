# 32×405 candidate ink-and-grid tableau: source arithmetic and bounded inverse

**Result:** a source-led, reversible cryptanalytic test of a previously uncombined manuscript structure. The four internal marks are ordinary separator-sized square dots, not a distinct apostrophe glyph; their role as clock holes is unverified. All proposed original-register inverses remain ciphertext-like. **No unknown Liber Primus plaintext, key, continuation, or authenticated decipherment was recovered.** The numerical compatibility motivates a hypothesis; it is not proof the original designer intended it.

## The source-visible 32×405 arithmetic; clock hypothesis unverified

The seven annotated, separately delimited original quotation spans in the unsolved manuscript have rune lengths **[18, 19, 12, 58, 68, 160, 70]**, totaling **405**. The source manuscript also contains a **32-row × 8-column** numerical table, currently decoded as 256 bytes under the canonical base-60 transcription. Across all original rune-bearing unsolved pages there are **12,956** runes, so 32 × 405 = **12,960**, a difference of precisely **four**.

The four marks previously called apostrophes are source-visible internal dots at physical pages **4, 21, 35 and 41**, immediately before rune offsets **1,110, 5,138, 8,515 and 10,089** in the 12,956-rune stream. Original-JPEG inspection shows each is a small square dot with the same baseline and 9–10 px connected-component morphology as ordinary word-separator dots on its printed line. The four following ciphertext runes are **W, Y, T, C**. The rich transcription's ASCII apostrophe is a representation of the internal placement; it does not establish English possessive punctuation or a distinct special glyph. The source-image evidence and exact measurements are consolidated in [the apostrophe/subword-boundary accounting](apostrophe_quote_29_accounting.md).

### Conditional four-hole clock embedding

If—and only if—each internal dot is assigned one non-rune slot immediately before the following rune, the source stream can be reversibly embedded in 32×405=12,960 slots. The resulting zero-based expanded positions are:

| Internal dot | Expanded zero-based slot | Block / local slot (0-based) |
| ---: | ---: | ---: |
| p4 | 1,110 | 2 / 300 |
| p21 | 5,139 | 12 / 279 |
| p35 | 8,517 | 21 / 12 |
| p41 | 10,092 | 24 / 372 |

Deleting those four conditional nulls recovers the original 12,956-rune stream exactly. This is an exact bookkeeping embedding, not evidence that the dots are intended clock holes. Their source positions and order are fixed; the interpretation as four clock slots, and the 405-slot ordering, have no independent authenticated selector. In particular, the marks are not at the seven quotation-span boundaries.

The original quotation runes themselves, read in printed book order, form a 405-rune sequence. Each of the 32 original printed numerical rows provides eight bytes of additional row-specific material. Treating the 405-rune sequence as a repeatable source key and the conditional four-hole embedding as a key clock is therefore a finite **candidate** for a simple human-solvable Vigenère-like tableau, possibly with a row-seeded stream generator. It must produce authentic plaintext on the actual cipher before one can infer anything about historical intent.

## Fully reversible original-input experiments

The [standalone CommonJS original-source SFT](../sims/quote405_grid32_strip_inverse_sft.cjs) reads the exact source corpus, original internal-dot/quote annotations, canonical base-60 numerical grid, and independent whole-word GP-Latin reference. Under the conditional four-hole clock mapping, it tests these 24 settings over all **12,956 original runes**:

- **Four quote-plus-grid keys:** at source clock slot t=405r+c, take ±Q[c] ± B[r,c mod8]. The same 405 printed quotation runes repeat in all 32 blocks; row r selects its actual eight table values. These four keys run through direct additive GP29 and an invertible GP28 predecessor-exclusion register, totaling **8** models.
- **Eight RC4 grid-row keys:** initialize a fresh RC4 stream from each original eight-byte row, with byte drop 0 or 256, direct remainder modulo29 or scaled byte-to-GP29 mapping, and either arithmetic sign. Repeat across the same **two** candidate GP registers, totaling **16** models. RC4 is a cryptographic candidate, not an independently authenticated method in Liber Primus.

The GP29 inverse is ordinary modular subtraction. The GP28 inverse uses the independently known generator 15 of the 28 nonzero residues in F29: a zero ciphertext difference encodes literal GP symbol EA/index28; a nonzero difference is the discrete-log rank, offset by the source key modulo28. Under the conditional clock model, each of the four internal dots consumes one key-clock position but emits no rune. These are exact forward/inverse rules for the tested model, not guesses about plaintext snippets.

Original ciphertext IoC is **0.0344783979**. The best quote-plus-row nonzero-step inverse has **0.0353094623**; the best RC4-row nonzero-step inverse has **0.0353404552**; the direct GP29 quote-plus-row candidates remain **0.0344629–0.0344986**. Every output has nonlinguistic original text. The slight increase in GP28-output IoC is expected from turning the original 86 consecutive equal-rune events into explicit EA symbols; it is not language evidence.

**Positive source-native control:** A separate 12,956-rune GP-encoded Latin Vulgate source is encrypted from its true symbols under each candidate model using the exact original printed keys, conditional four-hole clock mapping and independent row restarts. The same inverses recover **12,956/12,956 genuine source-native runes in every case**. Every original decoded candidate is also reencrypted back to its original ciphertext byte-for-byte. The latter property alone cannot authenticate a key because the transforms are bijective.

## Decision and practical next step

The exact **32 rows × 405 quoted runes = 12,960**, compared with **12,956 runes plus four internal separator dots**, makes the layout an economical candidate question. It does not establish that the dots are special clock holes or that the author intended a 32×405 tableau. The literal Vigenère-style quote/table composition and one historically simple 64-bit-row stream-cipher variant, tested under that conditional embedding, **do not reveal any authentic unknown LP2 prose**. Further permutations of the same four symbols or unmotivated RC4 drop amounts are unlikely to help.

An advancing experiment must explain from an authenticated original clue how quoted spans, the four internal dots, and table rows specify an actual operation capable of recovering original plaintext, preferably with a withheld full block. The 32×405 clock should remain an unverified hypothesis unless an independent source selects the four-hole semantics and 405-slot ordering. Unknown binary intermediates, changed manuscript breaks, unseen historical key material and non-additive layers remain possible. The test does not eliminate those hypotheses.

**Reproducer:** `sims/quote405_grid32_strip_inverse_sft.cjs`, Node.js 22, using `resources/liber-primus/lp2-corpus.json`, `base60-grid.json`, `lp2-quote-punctuation-spans.json` and `resources/control/latin-vulgate-gp-wholewords.txt`. This is intermediate evidence and does not change established findings in `results/README.md`.
