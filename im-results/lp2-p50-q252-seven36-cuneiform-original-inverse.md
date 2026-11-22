# Exact GF29 Q252 seven-by-36 key transfer to the cuneiform pages

**Agent 17, 17 November 2026. Bounded original-cipher negative.** There is no recovered unknown-page plaintext, authentic key or creator-selected transformation. This note records one new, economically testable original-source receiver; it does not promote numerical concordances to proof of intention.

## Clue path and weakest premise

The original p49–51 32×8 base60 table provides 256 byte-valued cells. The existing [first-party GF29 factor study](2013-base29-gf29-grid-factor.md) finds the original table coefficient polynomial divisible by both the **2013 signed BASE29 quadratic** `H=3+26x+24x²` and the **original p39 red-rune quadratic** `G=27+5x+15x²`. Quotient division in the inherited highest-first coefficient orientation leaves exactly **252** GP29 values. The distinct original physical cuneiform section occupies **seven printed pages p33–39**, and the manuscript contains **36 large punctuation marks** across all pages, source-counted directly in [the original-image punctuation census](lp2-original-dot-punctuation-physical-census.md). These motivate checking the finite factorization **252=7×36** as seven 36-symbol keys, one per cuneiform page, without a chosen plaintext or unseen historical operand.

This is a **weak, post-observation selector**: the 36 large marks do not line up with individual cuneiform pages, the source never directs polynomial division as a cipher-key extraction, and 252 has several divisors. The original 2013 signed BASE29 example and first-party p39 red quadratic are distinct arithmetic observations; they do not independently prescribe consuming the quotient as a repeated GP29 pad. We therefore test the simplest fully specified transfer once and retire it unless it actually decrypts source-native prose.

## Original exact inverse

Reduce the unchanged 256 source bytes modulo 29. Divide their degree-255 first-cell-highest polynomial by `H·G`, with degree-four factor coefficients in highest-first order `[12,17,11,21,23]`. The remainder is zero. The first sixteen quotient symbols are `[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21]`.

Partition its 252 symbols into exactly seven 36-value rows (contiguous), or seven columns read every seventh value (the single alternative natural 7×36 ordering). For printed physical page p33+j, use that page's row/column key `K_j[t mod36]`, starting at source rune zero, with both historically established GP additive signs: `P_t=(C_t ± K_j[t mod36]) mod29`. Original page lengths are **214, 261, 271, 238, 228, 228, 240**; source page50 is numeric-only.

| Frozen key layout | GP inverse sign | Direct GP29 page-stratified IoC across 1,680 ciphertext runes | First impossible source index under authentic plaintext-F skip (p33–39 respectively) |
| --- | --- | ---: | --- |
| 7 contiguous rows | − | 0.034301418703 | 1, 111, 9, 50, 15, 20, 22 |
| 7 contiguous rows | + | 0.034281611330 | 64, 80, 24, 10, 0, 51, 31 |
| 7 interleaved columns | − | 0.035519572161 | 69, 9, 13, 29, 2, 24, 2 |
| 7 interleaved columns | + | 0.034222189210 | 2, 5, 118, 33, 23, 5, 67 |

These four direct outputs are frequency-flat, comparable to untouched source IoC **0.034573770086**, far from the independently solved original English-GP register (typically ≳0.055 on long passages). Each direct inverse exactly reconstructs all 1,680 original source runes when re-encrypted.

More decisively, applying the **authenticated solved-LP2 p56 transparent-plaintext-F rule** as the only alternate source-derived cipher convention is **mechanically impossible on every one of the seven source pages** under every layout and sign. For this rule a plaintext F emits original cipher F without spending a key digit; any non-F plaintext consumes the next source key. An original non-F ciphertext that equals the current key would require plaintext F while emitting a non-F cipher rune and is therefore illegal. An exact dynamic set of all valid consumed-key clocks, including **both interpretations of a ciphertext F**, runs out by the first impossible zero-based offset in the table. No English scorer, syntax, crib or guessed F positions enters that exclusion. An independently solved **95-GP-rune p57 PARABLE** is encrypted separately with each of the seven exact source-derived keys and each sign under the historical F bypass; all 28 authentic-text plants are admitted by the same exact inverse. Thus the mismatch is present in the original ciphertext rather than decoder implementation.

## Decision

The seven original cuneiform pages cannot be unlocked by direct repeating **36-GP29 quotient-derived additive keys** under either natural 7×36 ordering or sign. The original known p56 F bypass instead gives a zero-state contradiction on all seven pages. This is a closed, bounded direct inverse for one visibly motivated partition, without evidence that the creator intended the quotient, the big marks or a particular key clock. It does **not** exclude a source-identified differently encoded quotient, a stateful cipher, another original-page receiver, or an as-yet missing external key. No 56-page unknown text, key or destination was recovered.

**Exact reproducible read-only CommonJS SFT:** [`sims/lp2_p50_q252_seven36_cuneiform_sft.cjs`](../sims/lp2_p50_q252_seven36_cuneiform_sft.cjs). Original inputs are the two unchanged canonical JSON source resources.