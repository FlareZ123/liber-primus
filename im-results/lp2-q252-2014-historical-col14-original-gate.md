# Historical 2014 fourteen-column permutation applied to LP2's Q252 table quotient

**Agent 5, 17 November 2026. Evidence class:** one historically authenticated transformation, one independently derived original-source 252-symbol register, and a bounded negative against original ciphertext. **No unknown LP2 plaintext or authentic unknown key recovered.**

## Source-constrained hypothesis

The original 32×8 two-character numeric grid across physical LP2 pp49–51 yields exactly 256 base60 bytes. In fixed physical order, their GP29 coefficient polynomial is divisible by the degree-four source cross-factor `H(X)G(X)`, where `H=[3,26,24]` comes from the signed 2013 `3301 -> 3QO` BASE29 example and `G=[27,5,15]` from the original p39 red triad (both written in ascending coefficients). The descending monic-up-to-unit product is `[12,17,11,21,23]`; exact GF29 long division leaves a four-zero remainder and **252 quotient digits**, beginning `[0,12,9,28,2,25,23,21,18,28]`. All this factoring was already established in [the original table report](lp2-hg-q252-rc4-original-inverse-gate.md).

The new independent 2014 ingredient is the **documented 14-column order** `[2,8,9,1,12,13,11,4,5,7,3,0,6,10]`, which unscrambles the actual 70-character historical Cicada onion message to `GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSION...`. Because **252=18×14**, the quotient can be arranged as 18 rows of 14 symbols and subjected to exactly that historical operation, in both reversible directions. There is no original authored instruction linking the 2014 message's permutation to the later LP2 table quotient, and the 14-divisibility observation is not evidence that its cipher has been identified. It is a motivated, finite candidate test.

## Original-cipher decision

The [source-only Node22 CommonJS SFT](../sims/lp2_hg252_2014_col14_transpose_sft.cjs) derives the Q252 directly from the canonical original 256 printed table bytes; proves its exact polynomial remainder; runs the historical 70-character transposition positive; applies both directions without fitted letters, clock, key offset, mask or IV; then tests the authentic solved-p56 **plaintext-F nonconsuming skip**. A ciphertext F has both legal consuming-non-F and transparent-F branches. Dynamic programming exhausts every possible skip trajectory, with source key phase0 and either arithmetic sign.

Every complete original GP29 passage is **mathematically undecodable** under each combination; the table shows the zero-based first point at which no legal branch survives.

| Original passage (runes) | Forward, C−K | Forward, C+K | Inverse, C−K | Inverse, C+K |
| --- | ---: | ---: | ---: | ---: |
| Complete before-table sentence (138) | 123 | 0 | 109 | 125 |
| Complete after-table sentence (170) | 77 | 20 | 23 | 123 |
| p54–p55 terminal (308) | 14 | 109 | 23 | 96 |
| p0–p2 first chapter (729) | 49 | 226 | 332 | 30 |
| p40–p53 floral body (3,008) | 16 | 100 | 34 | 94 |

All four synthetic F-transparent encryptions of the **95 original clear p57 runes** have legal inverse paths, confirming that each decoder is capable of accepting an appropriate native-GP plaintext; the 2014 historical 70-character control also decodes exactly. A direct GP29 addition/subtraction of either permuted quotient against the before/after/terminal passages gives only uniform-looking output (IoC in the 0.0323–0.0369 range, no complete GP prose).

**Decision:** retire this exact historical 14-column permutation of the pre-existing GF29 quotient as a *direct original GP29 phase-zero additive or authentic F-transparent key*. Other source-defined consumers of Q252 remain open. This is a finite original-input exclusion, not an argument against all transposition, word reordering, the source factor, or the historical 2014 cipher.

Sources: [actual 2014 transposition and complete key](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_3); original bytes and runes in `resources/liber-primus/base60-grid.json` and `resources/liber-primus/lp2-corpus.json`; [reproducer](../sims/lp2_hg252_2014_col14_transpose_sft.cjs).
