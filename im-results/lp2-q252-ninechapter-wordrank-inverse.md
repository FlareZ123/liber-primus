# P50 H/G quotient as nine chapter-specific whole-word rank permutations

**Agent33, 16 November 2026. Evidence class:** one new, original-ciphertext word-order inverse and its fixed-source null/positive controls. **No original unknown LP2 plaintext, Cicada-selected key, complete decipherment or deep-web destination was recovered.**

## Source-led question

The manuscript's physical pp49–51 have exactly 256 two-digit base60 table tokens. The signed 2013 `BASE29 3301 → 3QO` example and LP2 p39's original red triple independently define two GF29 quadratics H and G. Their degree-four product **exactly divides the 256 table residues**, leaving a formal 252-slot quotient Q (see [established source factorization](2013-base29-gf29-grid-factor.md)). The nine visually separated unknown LP2 chapters and the multiplicative group of 28 nonzero residues give a natural **9×28 split** of the quotient. The nine-by-28 schedule has already been used in unsuccessful rune-level additive, discrete-log and preceding-ciphertext-rank inverses ([earlier complete-family gate](lp2-grid-q252-ninechapters-rank28-key-gate.md)).

The different, still testable possibility here is that Q's 28 numerical values per chapter specify **the order of 28 entire printed words**. This is motivated by the independently observed near-random ordering of printed-word lengths, despite their strongly language-shaped marginal inventory ([word-order baseline](lp2-wordlength-order-architecture.md)). Stable sorting of a numerical key is an ordinary, reversible way to make a columnar transposition order even when its key values repeat. The first original 28-key row has only 16 distinct entries, so treating it directly as a 28-element permutation would be invalid.

**Weak premise:** neither source text nor signed historical clue commands polynomial division followed by sorting 28 word positions. The quotient itself is a conditional interpretation of the p50 numeral table. This experiment is one bounded possibility within a distinct whole-word route; it is not evidence of author intent.

## Fully specified reversible inverse

1. Read all 256 source tokens in printed row-major order with the canonical radix-60 alphabet and reduce their bytes modulo29, preserving the original table SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.
2. Perform descending-degree polynomial division in GF29 by the source-derived H×G factor with descending coefficients **[12,17,11,21,23]**. The remainder is **[0,0,0,0]** and Q begins **[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]**.
3. Partition Q into nine consecutive groups of 28; sort each group's 28 original zero-based positions by increasing Q coefficient, breaking numerical ties by earlier **source position**. The first group gives this exact column-rank order:
   `[0,27,4,20,25,16,19,13,2,22,1,24,14,21,11,12,8,18,23,26,7,10,15,17,6,5,3,9]`.
4. Parse the original ciphertext's **2,896 complete printed rune words**, correctly joining line wraps and 32 cross-page carried words. Use the nine original chapter word counts **[158,255,383,437,224,326,378,669,66]**, whose rune counts are **[729,1145,1729,1903,1021,1433,1680,3008,308]**. For each chapter, permute successive nonoverlapping 28-word groups by that chapter's fixed rank, leaving a final incomplete block in source order. Check **both** conventional direct-read and inverse-fill interpretations. Do not change a rune, punctuation, original word length or chapter membership.
5. Measure the nine-bin Pearson chi-square of consecutive displayed word lengths, with bins lengths 1…8 and 9+. Compare the *best of unchanged, read and inverse* to 3,000 seeded controls that **shuffle words only within the same nine original chapters**, preserving all chapter-specific word-length inventories, then themselves choose their best among the same three candidate operations.

This specifies a complete, perfectly reversible **whole-word** transposition. No dictionary words, guessed GP keys, selected phase, stanza reorder, per-page reset, or target plaintext affect its construction. The model supposes the printed word breaks are preserved by the unknown rune cipher so that an original English word-order dependency can be restored. A cipher altering word boundaries would be outside its scope.

## Original ciphertext result

| Complete 2,896-word source register | Adjacent 9×9 length chi-square |
| --- | ---: |
| Unmodified printed LP2 | **68.2731863819** |
| Nine fixed Q-rank row-read permutations | **54.3408455539** |
| Nine fixed Q-rank inverse-fill permutations | **82.2990366683** |

The inverse is numerically larger than unchanged LP2; **this alone is not a decryption signal**. The complete three-way, chapter-inventory-preserving null, with xorshift32 seed `0x3301728`, gives **536 of 3,000** equal-or-better null winners. Its finite add-one tail is **537/3001 = 0.17894035**. Null best-of-three mean is **73.71288627**, median **72.77715265**, and 95th percentile **90.43240401**. The observed best **82.2990** is unexceptional under a source-matched scrambled-order hypothesis.

### Independent actual English control

An independent **2,896-word** passage from the pinned Shakespeare corpus (token offsets 250–3145 inclusive), normalized to GP rune lengths with conventional TH/NG/EO/OE/AE/IA/EA and ING contraction, is an intentionally authentic word-order positive. Apply precisely the same nine source-derived Q-rank 28-word permutations, then the complete inverse, without refitting any key.

| English native-word control | Chi-square |
| --- | ---: |
| Intact native passage | **147.67414924** |
| After the frozen Q-rank transposition | **66.18509591** |
| After exact inverse | **147.67414924** |

All **2,896/2,896** genuine source-language word lengths are recovered exactly. Both directions are checked for full inverse equality on original ciphertext word-length arrays. This confirms that the tested architecture can strongly suppress and restore a real native English word-order signal; it does not mean an arbitrary 28-word permutation can be detected reliably on every author/sample.

## Decision and route implications

**Retire this exact H/G-quotient-derived nine-chapter stable-rank whole-word permutation as an evidence-bearing English order reconstruction.** Its best original-cipher improvement is ordinary among chapter-conditioned nulls, and the positive control makes its expected linguistic consequence explicit. The Q/H/G mathematical identity remains source-exact; its interpretation as an **ordering key** remains unselected and yields no native-word-order restoration.

This is independent of the prior nine-by-28 **rune** pad/rank tests, and of earlier 2014 5×5/7×7 and p50 RC4-KSA whole-word permutations. It does not exclude a source-prescribed **different permutation mapping**, per-word stateful cipher, foreign-language/machine-code intermediate, or a source-specified method changing the original printed word breaks. Without a further original clue identifying one of those, tuning rank ties, block offsets or grammar metrics against the same ciphertext would be weak.

**Reproduction:** [single-file CommonJS SFT](../sims/lp2_q252_rank28_wholeword_transpose_sft.cjs), Node.js 22; reads the original committed corpus, table and independent English control, asserts every quoted source cardinality and numerical result, and writes no files.
