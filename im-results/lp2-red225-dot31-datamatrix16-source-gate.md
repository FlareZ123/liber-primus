# The 225 red runes and 31 thirteen-dot marks: 16×16 ECC200 original-source decision

**Agent30, 16 November 2026. Evidence classification: source-visible numerical resemblance with two exact, independent cipher-structure exclusions. No recovered plaintext, authentic key or solved destination.** The first experiment checks the printed ECC200 timing border; the second checks complete Reed–Solomon error correction even when every timing cell is ignored. Neither original Liber Primus nor its signed surrounding messages instructs the player to concatenate red ink into a barcode. These negative results rule out the stated direct encodings.

## Original clue and exact geometry

The repository's original LP2 image-derived [red-ink atlas](../resources/liber-primus/lp2-ink-annotations.json), checked against the [canonical GP29 corpus](../resources/liber-primus/lp2-corpus.json), contains **225 red runes in 18 spans** throughout physical pages p0–57. The same atlas records **31 individual 13-dot glyphs** (30 red, 1 black). These are not 31 chapter boundaries: the distinct punctuation inventory recognizes 28 thirteen-dot chapter stencils, three ten-dot chapter stencils and additional solved-page glyphs. The 225+31 inventory is derived from annotations, not a fresh comprehensive source-JPEG pixel census.

The coincidence is geometric: **225=15×15**, while **31=16+16−1**. Standard **16×16 Data Matrix ECC200** has a solid bottom and left L-shaped finder occupying exactly 31 modules; its other **225** modules contain a top/right timing boundary of 29 alternating modules and a **14×14 interior**. Under the literal hypothesis, all 31 marks fill the solid L, and the 225 runes fill the remaining 15×15 region. No original source specifies a rune-to-bit map, scanning direction or ECC decoding, so we grant those choices generously in necessary-condition tests rather than fitting message content.

## Independent gate 1: obligatory 29-module timing boundary

The earlier [single-file timing-control SFT](../sims/lp2_red225_13dot31_datamatrix16_sft.cjs) retains the physical ECC200 orientation and lays the 225 source runes into the 15×15 region in five source-motivated arrangements: row-major, alternating-row direction, column-major, alternating-column direction and the center-out clockwise spiral visibly used on LP2 p15. Each is checked forward and backward. For every source rune class, a completely unknown static bit is permitted; among timing-cell occurrences, assign the bit minimizing errors.

The **minimum errors over the 29 mandatory timing cells are 3–7** across the ten layouts. The best three-error case is the *reversed spiral*, where three repeated rune classes each require both dark and light. A fixed GP29 palette cannot satisfy both. Thus **zero of ten layouts** represents an undamaged literal ECC200 timing border.

## Independent gate 2: complete ECC200 12-byte parity, ignoring the timing boundary

A new [original-source ECC200 exact-elimination SFT](../sims/lp2_red225_ecc200_exact_sft.cjs) asks a stronger question. Remove the 31-dot finder entirely. Give **all 29 top/right timing cells arbitrary unconstrained bits**, and require only the **14×14 interior's complete standard ECC200 structure**:

- 24 ordered codewords, each eight bits, occupy 192 interior cells; ECC200's remaining four cells have two mandatory black diagonals and two mandatory white off-diagonals at lower right.
- First 12 codewords are arbitrary data, and final 12 must be actual **GF(256) Reed–Solomon ECC200** parity with primitive polynomial **0x12d** and roots α¹…α¹².
- For each ten original printed-order layouts, test two secret alphabets: (A) 29 free rune-to-bit values; (B) those 29 values **plus 15 free row-XOR and 15 free column-XOR masks**, 59 unknown bits. The latter permits a position-dependent line-key layer with no presumed simple palette.
- The 12 GF(256) zero syndromes yield **96 exact linear GF(2) equations**. Each arbitrary secret bit is propagated separately through true Utah/corner placement and all Reed–Solomon roots, incorporating *every possible secret value*. Enforce four fixed interior modules separately. Each elimination contradiction carries a verifiable XOR certificate: selected original equation masks XOR to zero while their required RHS XOR to one.

**Results on the original 225 red runes:**

| Original layout | Secret-bit model | RS-only GF(2) rank | Hidden variables | Final result |
| --- | --- | ---: | ---: | --- |
| All 5 layouts, forward and reverse (10 cases) | Arbitrary GP29-to-bit palette | **29** | 29 | **10 contradictions** |
| Same 10 layouts | Palette + 15 secret row masks + 15 secret column masks | **55** | 59 | **10 contradictions** |
| **Total** | **20 exact source cases** | | | **0 legal undamaged ECC200 interiors** |

Every contradiction uses a mandatory fixed interior module alongside selected parity equations. The SFT emits the entire GF(2) certificate for the original row-major forward models, its sizes and fixed module identities for all 20 cases and asserts each certificate's exact zero-coefficient/nonzero-RHS XOR. Thus even allowing all 29 timing bits to be **entirely wrong** cannot repair these 20 originals.

Positive controls: the program generates a 12-data+12-parity ECC200 block satisfying **all 12 GF(256)** roots, and a one-bit corrupted block fails. A synthetic 225-module two-rune barcode body mapped from genuine encoded codewords is accepted under both secret-bit models. The polynomial coefficient vector **[1,242,100,178,97,213,142,42,61,91,158,153,41]** matches the reverse order of the [ZXing ECC200 12-error-codeword factor set](https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/datamatrix/encoder/ErrorCorrection.java). Standard [Utah/corner placement](https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/datamatrix/encoder/DefaultPlacement.java) is reproduced for the 14×14 region.

**Reproduce:** Node.js 22 at repository root: node sims/lp2_red225_ecc200_exact_sft.cjs. It asserts all 225 rune identities against canonical corpus and ink atlas before computing. The [Windows manual CI workflow](../.github/workflows/lp2-red225-ecc200-exact-manual.yml) runs the same test. No English model, fitted key or synthetic-only negative control is involved.

## Research decision

This numeric resemblance could point toward another format, but an ordinary undamaged 16×16 ECC200 readout **cannot directly arise** from the original 225 red runes under these ten source-visible routes, even with completely secret rune bits and row/column XOR masks. There is no independent evidence of an author-intended extra permutation or error-correcting restoration. Arbitrary reshuffling, error flips or keyed generators merely to rescue a barcode would reintroduce unconstrained fitting.

The source could still carry a different encoding or hidden ciphertext. A useful next step requires independent original instructions selecting an actual decoder or key. **This test recovers no unknown LP2 plaintext and no p56 target digest preimage.**
