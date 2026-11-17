# Three original 256-position streams: terminal-known Shamir two-share inversion

**Agent 31, 17 November 2026. Result: exact original-input exclusion for a source-ordered GF(29) 2-of-3 reconstruction; no recovered unknown plaintext, key or continuation.**

## Intended-route hypothesis and independent original clues

Three manuscript-derived streams have **exactly 256 positions** each:

1. **225 red Gematria Primus runes and 31 distinct thirteen-dot marks**, in original page/offset order, including both separately printed marks at the same p7 location. Source: [original ink annotations](../resources/liber-primus/lp2-ink-annotations.json).
2. **256 two-character source-table cells** printed in 32×8 order across LP2 physical pages 49–51. Source: [unchanged table](../resources/liber-primus/base60-grid.json).
3. **76 still-ciphered runes on p55, 85 decoded runes on p56, and 95 clear runes on p57**, also exactly 256. Source: [canonical original transcription](../resources/liber-primus/lp2-corpus.json).

Cicada's documented **2013 Shamir secret-sharing stage** offers an independently historical operation for three equal-size streams. If they were three evaluations of a *degree-one polynomial over GF(29)* at three fixed distinct abscissas, any one full stream would be an affine combination of the other two **with the coefficients fixed across positions**. The **180 known terminal symbols** turn that into a decisive original known-plaintext attack with no fitted English phrase. The potential payoff would be the 76 unknown p55 runes.

This is an exploratory hypothesis. No authenticated clue explicitly assigns the three streams to Shamir shares, establishes GF(29), prescribes positional alignment, or explains the 31 punctuation values. The source's printed numeric layout is 32×8, not a native 256-long row.

## Complete finite known-plaintext gate

Under any fixed degree-one three-share Shamir coordinate assignment, the terminal output must have the shape

\[
T_i = kR_i+(1-k)G_i \pmod {29}
\]

for a **single shared** \(k\) in GF(29). Testing all 29 values of \(k\) permits every possible distinct share-coordinate choice and additionally permits the two degenerate endpoints. The source red stream is indexed by its canonical 0–28 rune values; marks take independently plausible constant values **0 (separator)** or **13 (printed dot count)**. Table cells receive both source-defensible **base60** and **f-omitting base59** byte interpretations and reduce mod29.

For each of these inputs, test direct source order and whole-stream reversal for the red, numeric and terminal streams independently. With two radices, two mark values, three binary reversals and 29 coefficients, the complete search is **928 exact original-stream configurations**. For the 180 clear p56+p57 symbols, require exact GF29 agreement.

To avoid incorrectly eliminating a secret-letter alphabet, also grant an **arbitrary stationary mapping from each of the 29 reconstructed symbol values to any of the 29 terminal rune values**. This includes every fixed shift, Atbash, GP29 permutation and even nonbijective codebook. For each reconstruction, map each recovered input value to the most frequent true known-terminal value in that class, obtaining the *exact best possible stationary-lookup score* with no key guessing.

| Strict original comparison | Best of all 928 models | Required for a successful two-share recovery |
|---|---:|---:|
| Direct GP29 equality on the 180 known runes | **14 / 180** | 180 / 180 |
| Best unrestricted stationary 29→29 lookup agreement | **51 / 180** | 180 / 180 |
| Exact original models surviving | **0 / 928** | At least one |

The winning generous-lookup case uses base59, mark value 0, source-order red and table, reversed terminal, and \(k=10\); it matches only 51 of the 180 independently known symbols. Thus even an unrestricted *fixed* hidden relabeling has **at least 129 contradictions** in the best permitted model.

Two positive controls demonstrate the test's ability to recover a true original-length construction: a planted degree-one GF29 combination with coefficient 17 recovers **180/180**, and the same 180 symbols after a secret bijective substitution \(x\mapsto11x+7\pmod{29}\) also recover **180/180** through the unrestricted lookup gate. The canonical source-table byte SHA256 is asserted before testing.

## Decision and limits

**Reject only direct symbolwise GF(29) 2-of-3 Shamir sharing among these three original 256-slot streams**, with constant marker value 0 or 13, either printed radix, whole-stream reversals and arbitrary fixed terminal glyph alphabet. The result is independent of English frequency assumptions and strongly excludes this exact candidate route to the 76 unknown runes.

It says nothing about 3-of-3 sharing (which can interpolate any three unconstrained streams), a source-selected nontrivial permutation of slots, separate pagewise coordinates, a varying key, a non-GF29 field, a word cipher layered atop shares, or whether the three equal counts were authored intentionally. None of those extensions has a source instruction here; avoid opening a large arbitrary search from a failed count coincidence.

**Reproducer:** [one-file Node 22 CommonJS original-input test](../sims/lp2_red256_grid_terminal256_shamir2of3_sft.cjs), with exact planted positives and the assertable 51/180, 14/180 original maxima.
