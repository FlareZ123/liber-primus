# P32 11×11 GP29 matrix as a whole-book Hill key: original-source decision

**Result:** Every direct blockwise original-cipher Hill inverse using an inferred row-major 11×11 reshape of the p32 tree's 121 runes retains uniform GP29 statistics across the complete unsolved book, while an independently encoded GP-English positive control round-trips **exactly**. This does **not** recover unknown plaintext or identify the intended use of the 121-symbol tree.

## Why this key and receiver are source-motivated

- The original LP2 physical p32 rune body has exactly **121 symbols printed in six ordinary text lines**. An 11×11 square is a **proposed row-major reshape**, not visible page layout. It is unverified that a human solver was meant to reshape the prose. Its intact first 11 indices are \`[20,2,25,7,25,1,13,27,5,7,21]\`, and its first column is \`[20,8,2,8,21,16,15,21,16,28,3]\`.
- Under the original 29 Gematria-prime values, those two 11-item sums are **563** and **569**, matching the dimensions of the authenticated 2016 Cicada tree JPEG. This is a concrete, cross-era clue candidate, though there is no author-issued statement calling the 11×11 rune matrix a Hill cipher key.
- The matrix obtained from that optional row-major reshape is invertible over GF(29) and has **determinant 8**. Its complete inverse is therefore unambiguous; neither a guessed secret nor a fitted ciphertext parameter is needed.
- A natural finite trial is whole-book length-11 GP29 blocks and an alternative reset at each original physical page, applying each of \`M\`, \`M^T\`, \`M^{-1}\` and \`(M^{-1})^T\` to column vectors.

## Executed original-source test

| Direct GP29 block map | Original full-book IoC | Original page-reset IoC |
|:--|--:|--:|
| M | 0.03446106 | 0.03450100 |
| Mᵀ | 0.03447480 | 0.03448051 |
| M⁻¹ | 0.03446918 | 0.03447332 |
| (M⁻¹)ᵀ | 0.03447813 | 0.03448623 |

The continuous clock evaluates **12,947 original ciphertext runes** (the last nine lack a full 11-block). The page-reset clock evaluates **12,606 original runes** (the final incomplete 11-block on each of 55 rune-bearing pages is omitted). All eight outputs look like uniform ciphertext; a native GP29-English stream has substantially greater single-symbol collision probability.

For each map, the SFT generates a genuinely independent native GP-English test span from checked-in Gibran, encrypts it with the mathematical inverse, and requires exact decryption of every complete 11-symbol block. A separate **88-rune** clear p57 positive control is also round-tripped. The source matrix and its inverse multiply to the 11×11 identity in both orders modulo29. These are direct, fully reversible original-input tests.

The retrospectively noticed row-major numeric match to the later signed image does **not** establish that the author selected an 11×11 layout or Hill arithmetic, target chapter, block reset, an encryption direction, or a complete nonlinear cipher architecture. This test retires only the **four unfitted direct Hill block maps with two natural clocks**; it provides no evidence for additional speculative layers.

## Reproduction and next route

- [Read-only, standalone Windows Node.js 22 SFT](../sims/lp2_p32_tree11_source_hill_fullbook_sft.cjs).
- [Successfully executed Windows Actions job](https://github.com/FlareZ123/liber-primus/actions/runs/44202872704).
- The independent [source-selected 21-coefficient Toeplitz receiver test](../sims/lp2_2016_dimension_wordpair_toeplitz11_sft.cjs) uses *different* original rune words; it already bounded a linear operation on the p32 page itself. The present experiment tests the original p32 matrix as a key **on all other unsolved text**.

**Next research decision:** Seek an external first-party instruction specifying *how* the 2016 dimensions connect the tree matrix to a concrete receiver (including state and key clock), or recover missing source bytes. Avoid further free-rank matrices or rekeyed Hill variants without an authored selector. Preserve the row/column numeric equality only as a **conditional reshape lead**, rather than a printed matrix or authenticated key.
