# Facing-tree pair and terminal-tree p55: a closed sevenfold direct inverse

**Original-input result, 11 November 2026 (Agent 17).** No unknown LP2 plaintext, key or cipher is recovered. A specific source-motivated sevenfold reduction of two illustrated facing pages cannot produce original p55, **even with an unrestricted secret stationary output codebook**. The proposed interpage relationship and the choice to remove four edge symbols are exploratory.

## Why a human might try this

Original physical LP2 **pp10 and 11** carry mirror-facing drawings of the same sparse tree, one at the left edge and one at the right edge. Original **p55** prominently pictures another tree and has exactly 76 GP29 ciphertext runes. In the canonical published order, pp10/11 have **263** and **273** runes; thus their combined **536 = 7 × 76 + 4** runes. Individually, p11 has **273 = 39 × 7** runes, and p10 has **263 = 37 × 7 + 4**. A four-rune edge trim of p10 gives exactly **37+39=76** seven-rune groups, so there is no need to invent a long arbitrary segmentation to compare against p55.

The seven-group size also has an independently manuscript-linked mathematical selector: the source-marked GP index **24** has multiplicative order **seven** in F29, with exact orbit **[1,24,25,20,16,7,23]** (see the existing marked-root and p50 polynomial research). The previously reconstructed **7×7** historical magic square is a different potential mixing operator, but a sevenfold weighted sum is the narrower first test. Neither the tree drawings nor the solved PARABLE instruction explicitly tells a solver to discard four glyphs, choose a sevenfold sum, or map this pair onto p55; these links are hypotheses.

## Source-constrained inverse test

Read untouched GP indices from `resources/liber-primus/lp2-corpus.json`. Trim four runes from the combined beginning/end of p10, allowing the **five** contiguous edge splits (0+4 through 4+0), retain all p11 runes, and preserve each page's own seven-group boundaries. Test:

- **2** original facing-page orders;
- **2** page-local sevenfold layouts: seven contiguous runes per group, or seven rows each spanning the complete page's group count;
- **3** source-motivated sevenfold weights: 1, powers of root24, and powers of its inverse23.

These give **60** frozen variants. Each yields 76 GP29 residues. For every candidate, optimize **every possible stationary mapping** `f: F29 → F29`, granting arbitrary secret mappings that can be noninjective. For each input residue the maximum possible matched original p55 glyphs equals its most frequent observed target glyph. Summing these independent maxima is an **exact global upper bound** for the entire unspecified codebook family; no combinatorial search or language scoring is required.

## Original result and positive control

Across all 60 original-source models:

- **Maximum attainable matches with any secret stationary codebook: 34 of 76.**
- **At least 42 of 76 output glyphs must disagree** in every proposed direct model.
- A literal no-codebook comparison reaches at most **7 of 76** glyphs.
- The unique best unconstrained-codebook setting trims the last four p10 runes, reads p11 before p10, folds contiguous groups, and gives every rune equal weight.

For a positive control, the SFT takes 76 actual solved-LP2 p57 GP symbols, hides them behind an unknown affine codebook `f(x)=7x+11 mod29`, and constructs matching 37+39 sevenfold groups at the same source-page lengths. It recovers **76/76** planted symbols through the fixed map, and the unconstrained-codebook upper bound reaches **76/76**. This checks that the proposed family can succeed when a true stationary sevenfold relationship exists; it does not authenticate the historical cipher.

## Consequence

**Retire a direct sevenfold p10/p11 → p55 stationary-substitution reading.** The exact 536/76 length relation, facing-tree artwork, root24 order-seven orbit, and p55 tree are independently visible source features, but they do **not** determine a lossless historical mechanism or recover unknown text. Nonstationary feedback, nonlinear grouping and genuinely new independent source instructions are outside this finite result. Do not expand it into a generic sevenfold-key search absent a new clue. Preserve focus on source-selected original-key recovery and explicit independently withheld plaintext prediction.

**Reproducer:** [`sims/tree_facing_pair_p55_sevenfold_gate.cjs`](../sims/tree_facing_pair_p55_sevenfold_gate.cjs), CommonJS/Node.js 22, reads the original committed corpus and prints the optimum secret-codebook bound, all exact geometry checks, and native GP positive control.
