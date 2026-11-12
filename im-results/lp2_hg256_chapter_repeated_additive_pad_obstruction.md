# Exact H/G syndrome obstruction for a repeated 256-rune chapter key

**Status: original-input negative, conditional cipher model.** The LP2 numerical table is a 256-cell codeword divisible over GF(29) by two independently identified quadratics: `H(X)=3+26X+24X²` from the signed 2013 BASE29 example, and `G(X)=27+5X+15X²` from original p39 red ink. Their product is `F(X)=23+21X+11X²+17X³+12X⁴`. A new, key-independent original-cipher test asks whether the same code constraint is used on each 256-rune manuscript block through a source-table-length additive pad.

## Plausible inverse and its strongest missing premise

The source provides 256 printed table cells, the two exact divisors, and nine independently image-audited textual chapters. A possible human operation would treat an original 256-rune ciphertext block `C` as `P=C−K mod29`, where `K` is an arbitrary **secret 256-rune key repeated within a chapter**, and require each plaintext block `P(X)` to be divisible by `F`. The chapter resets and start-aligned 256-block framing are explicit model assumptions. **No Cicada text instructs this constraint on plaintext**, and the true plaintext need not be a polynomial codeword.

This candidate is unusual in having an exact original-cipher obstruction that does not require recovering a candidate key. Let `S(A)=A(X) mod F(X)` be a four-symbol syndrome using source-order descending polynomial coefficients. By GF(29) linearity,

`S(C_b)=S(P_b)+S(K)=S(K)`

for every block `b` in one chapter. Thus **all complete blocks must have exactly the same four-symbol ciphertext syndrome** for *any* repeated 256-position additive key, including all periods dividing 256. If two measured syndromes differ, every such key fails. Reencrypting with a guessed key cannot cure the mismatch.

## Original chapter-aligned decision

Use the unchanged 12,956-rune original corpus and physical chapters from [the source-visible atlas](lp2-global-original-visual-section-map.md). The nine chapters, their full-length 256-rune block counts, and first two syndromes in each are:

| Source physical pages | Full 256-rune blocks | First syndrome | Second syndrome |
| --- | ---: | --- | --- |
| p0–2 | 2 | (23,0,9,4) | (10,12,15,0) |
| p3–7 | 4 | (15,18,20,0) | (6,18,23,6) |
| p8–14 | 6 | (16,21,6,11) | (1,6,9,9) |
| p15–22 | 7 | (27,0,3,0) | (24,15,20,13) |
| p23–26 | 3 | (11,1,28,10) | (19,2,20,11) |
| p27–32 | 5 | (17,20,14,6) | (25,0,6,23) |
| p33–39 | 6 | (27,25,17,17) | (13,16,2,28) |
| p40–53 | 11 | (12,26,22,10) | (13,18,12,24) |
| p54–55 | 1 | (10,6,22,2) | — |

**Every chapter with two or more complete blocks fails at its second block.** Every complete block has a unique syndrome even within its chapter. The whole-book original clock gives **50 blocks with 50 different syndromes**. Physical p50 contributes numeric cells and no rune data. The final 308-rune chapter supplies only one complete block, so this test cannot distinguish a key within that chapter by itself.

The [exact CommonJS SFT](../sims/lp2_hg256_chapter_key_syndrome_sft.cjs) derives the source divisor and verifies zero remainder on the actual base60 table, reproduces all chapter and whole-book measurements from original corpus indexes, and verifies a source-disjoint eight-block positive plant. The planted 256-position additive key produces eight codeword encryptions with one equal **nonzero** syndrome and recovers all 2,048 planted plaintext runes exactly.

**Decision:** This excludes a frozen, chapter-start-aligned, period-256-or-divisor additive GP29 pad followed by H/G codeword encoding for any key, including a completely unknown source-derived key. It also excludes a single repeated 256-position additive key on the full-book start-aligned clock. The inference does **not** exclude H/G as an authentic property of the numerical table, differently framed or transmitted codes, position-varying one-time pads, nonlinear register operations, or any cipher whose plaintext lacks the H/G codeword constraint. It supplies no decrypted manuscript text. Further tests require a source-selected transfer from the table code to a specified original ciphertext framing and operation.
