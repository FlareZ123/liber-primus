# A source-exact 16 × 203 black-rune register in floral LP2, and the p15 value 3299

**Status: newly identified source arithmetic and exploratory inverse; no unknown plaintext, source-authenticated key, or solved LP2 page.** Original pages 40–55 are the continuous sixteen flower-framed physical pages. Two alternative, carefully distinguished rune selections have exact factorizations but do not supply a standalone decipherment instruction.

## Physical-source derivation

- Source numeric GP29 stream: [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json), physical LP2 pages 40–55. Ink assignments: [lp2-ink-annotations.json](../resources/liber-primus/lp2-ink-annotations.json); p40/p53/p54 source-image evidence is needed to establish that their colored spans are different physical objects.
- The sixteen page-local runic counts in physical order are **231, 273, 272, 274, 273, 270, 270, 274, 271, 66, 0, 92, 263, 179, 232, 76**. They sum to **3316**; p50 is the runeless numerical plate in the middle of the illustrated group.
- Exactly three red rune spans occur in these pages: **p40 8-rune heading (offset 0), p53 51-rune ending (offset 128), p54 9-rune heading (offset 0)**, for **68 red runes**. Thus the 3,248 black runes factor exactly as **16 × 203 = 16 × 7 × 29**. A 16×203 source-order reshape is mathematically available, without inserting letters, changing GP29 identities, or crossing unseen image boundaries.
- A *different* selection removes only the two introductory headings at p40 (8) and p54 (9), **retaining all p53 red runes**. It leaves **3316 − 17 = 3299 runes**, equal to the one original red numeral at the source-selected centre of p15's [fully recovered Fibonacci-indexed prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md). That spiral starts from **3301−prime(1)=3299**, giving a built-in numeral **2**. This is an exact cross-section numerical correspondence, not yet an authenticated command to remove precisely two headings, transfer the prime spiral, or use 3299 as a cipher modulus.
- The original p49–51 numeric panel has **256 = 16×16** cells ([source byte table](../resources/liber-primus/lp2-grid-256.json)). The 16 illustrated pages, 16-cell p15 spiral, and 16×16 numeral panel supply plausible sizes, but there is no authenticated independent instruction relating their roles.

## Frozen original-cipher experiments

The [read-only CommonJS SFT](../sims/lp2_floral16_3299_source_geometry_sft.cjs) fixes the exact original inputs above before testing: (i) whether the 3,248 black symbols, placed into sixteen consecutive 203-rune rows, exhibit common-column equality compatible with one reused key; (ii) the full-length index permutation **[0, 2^0 mod 3299, …, 2^3297 mod 3299]**, which visits all 3,299 positions because 2 has multiplicative order 3,298 modulo 3299; (iii) the literal finite GP29 key **K[i]=(2^i mod 3299) mod 29** applied in original position order. These two p15-to-3299 transfer operators are hypotheses introduced in this experiment and have no independent original-page opcode.

For the 16×203 arrangement, the original same-column equality count is **857/24,360 pairs**, collision probability **0.035180624**. In **2,048** deterministic, seeded, independent circular row-rotation controls (which preserve every source row's symbols and internal order), the mean is **840.458**, with range **757–932**. **574/2,048** controls equal or exceed 857; the plus-one one-sided Monte Carlo tail is **575/2049 ≈ 0.28062**. Thus there is no meaningful positive indication of a shared, unshifted 203-position monoalphabetic key from this statistic.

The complete unmodified 3299-tape's GP29 IoC is **0.034464934**. Reordering its positions by modular doubling preserves that exactly, yields **124 adjacent-equal glyph pairs**, and does not reveal GP-native prose. The direct modular-doubling residue-subtraction candidate yields IoC **0.034515669** and nonlinguistic output. For comparison, the solved p57 control's GP29 IoC is approximately **0.062709966**. The SFT includes complete invertible synthetic p57-text plants as a regression, which establishes correctness of the proposed machinery but does not validate its historical use.

## Decision for further research

**New usable observation:** the manuscript supports a 16×203 full-black register, and a separate 3299-rune register spanning the same physical pages. These are precisely specified alternative source selections, not interchangeable ciphertexts.

**Strongest objection:** the 3299 selection was noticed after inspecting p15, and the idea to convert 3299 into a modular doubling permutation is not printed as a rule. The register count alone might reflect composition and editorial segment lengths, while 16×203 may be coincidental. The observed original equality profile provides no positive evidence for one simple 203-clock.

**Practical fork:** obtain a period-authentic or original-page visual instruction that selects 203 columns, the p53 coda inclusion, and a reversible alphabet/key operation, then apply that operator unchanged to a substantial native original page with an independent holdout. In its absence, do not enlarge into a 203-period key sweep, p50 AES/IV menu, or other adjusted cipher family. Keep this precise registration as an intermediate structural lead. **No GP29 plaintext, solved page or destination recovered.**
