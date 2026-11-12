# LP2 original GF29 Shamir sharing: nine visual chapters and p0 8|5 heading

**Classification (12 November 2026, Agent12, Director #686):** exact bounded negative for two source-selected physical carriers under the historically motivated five-coefficient polynomial architecture. This recovers no unknown plaintext, historical key or author-chosen decoding operation.

## Source-to-operation hypothesis

A documented 2013 Cicada stage used five of ten numbered Shamir secret shares to recover a 22-byte onion address. The later Liber Primus has the prime-sized **29-symbol Gematria Primus alphabet** and **nine** visible ciphertext chapters demarcated by original red initial headings preceded by terminal red 13-dot markers. A 2014 solver familiar with the earlier stage could ask whether chapter tapes were individually randomized polynomial shares of the same secret message. Nine unequal chapter lengths limit a positionwise simultaneous test to the first **308** original runes in every chapter.

The visual p0 opening supplies an independent local analogue: its first red heading has **8 runes followed by 5 runes**, immediately beside the 13-dot punctuation with **8 outside-column dots and 5 center-column dots**. The natural five-coefficient reading treats the second word as polynomial coefficients and the first eight runes as eight evaluations. These are plausible prompted operations, although the 2013 implementation actually worked over **GF(2^176)**, not GP29, and the manuscript does not direct solvers to transplant secret sharing to either carrier.

The original physical chapter page ranges, in printed order, are p0-2, p3-7, p8-14, p15-22, p23-26, p27-32, p33-39, p40-53, p54-55. Their respective exact rune lengths are **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308**. Freeze public share indices **1..9**, the five training tapes **1..5**, four predicted tapes **6..9**, and all first **308** unmodified local rune positions. No alternative page order, symbol alphabet, field, seed, phase or permutation is fitted.

## Complete finite inverse and original heldout outcome

Test the actual 2013-style monic degree-five shape generalized to GF29:

    y(x) = x^5 + a4*x^4 + a3*x^3 + a2*x^2 + a1*x + a0  (mod 29)

Five evaluations at distinct x=1,2,3,4,5 uniquely determine the five coefficients, using the known x^5 leading term. Subtract x^5, interpolate the degree-four remainder via exact GF29 Lagrange arithmetic, then evaluate x=6..9. This is reversible: **a0=y(0)** recovers the secret and all other shares can be forward-reconstructed.

| Predicted original chapter | Historical monic-degree5 exact matches | Necessary for proposed scheme |
| --- | ---: | ---: |
| p27-32, x6 | 13 / 308 | 308 / 308 |
| p33-39, x7 | 7 / 308 | 308 / 308 |
| p40-53, x8 | 12 / 308 | 308 / 308 |
| p54-55, x9 | 8 / 308 | 308 / 308 |
| **Total** | **40 / 1,232** | **1,232 / 1,232** |

The simple ordinary quartic instead obtains **47 / 1,232** matches in per-tape order [7,13,13,14]. An independently random 29-symbol reference predicts approximately **42.48 / 1,232** accidental matches. Neither architecture has the exact identity it mathematically requires. The original data have not been altered or fitted to any English scoring threshold.

The printed p0 heading provides a second original-input discriminator. Its **outer eight** GP indices are [15,8,18,3,6,19,27,0] and its **central five** indices are [15,26,18,21,5]. If the five central indices are the coefficients, the monic polynomial predicts outer eight [28,13,20,24,16,7,3,9], **0/8 correct**. Ordinary quartic prediction is [27,10,9,15,23,3,16,11], also **0/8 correct**.

## Original anti-doublet fingerprint and native source-positive

There are only **25 adjacent-equal** rune pairs in the first 308 symbols across these nine chapter tapes, out of **2,763** contiguous pairs. A hypothetical Shamir encoder could reject polynomial coefficient draws when a candidate share repeats its preceding output symbol. That selection reduces repeats while preserving the **exact interpolation identity**; it cannot rescue the 40/1232 result. The standalone SFT generates **308** GP-native known plaintext runes (solved p57 text repeated), shares them through a monic GF29 quintic with four seeded random coefficients per symbol, rejects joint doublets except when the secret rune is F, and reconstructs all **308/308** secret runes and all **1,232/1,232** heldout shares. Deliberately assigning the seventh planted tape the wrong share identity loses exact prediction.

This is a source-native implementation control, not evidence that the creator used Shamir. The known source p57 text supplies only the planted message, not any proposed unknown decryption.

## Scope and research decision

Prior [Shamir/2013 p49 table research](lp2-p49-2013-shamir-five-of-ten-gate.md) rejected analogous row/byte/GF256/GF2^176 mappings of the **numeric table**. This is a distinct, original-image-selected **nine full chapter rune-stream** algebra test and independently checks the **8|5 title topology** with the same field, not a rerun of table scans.

The direct common-polynomial construction fails at unmodified GP29 positions, including any rejection sampler that preserves polynomial evaluations. A secret second cipher could hide the algebra, but no original clue identifies its state, key, or byte/rune codec. **Stop this branch** unless a new authentic 2014 instruction specifies share labels and a reversible postprocessing operation. Preserve the concrete 8|5 clue as a reading candidate with no established consumer. Reproducer: [GP29 native Shamir SFT](../sims/lp2_visual_chapters_shamir5_gf29_sft.cjs). Historical source: [2013 five-of-ten reconstruction](pklmx-2013-onion-continuation-gate.md).