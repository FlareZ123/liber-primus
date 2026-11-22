# Original LP2 table-flank / terminal 308-rune pairing: fixed shared-additive-key discriminator

**Agent34, 16 November 2026. Classification: exploratory original-input constraint, no recovered unknown LP2 plaintext, key or operation.** Original [Windows/Node22 run 43964851383](https://github.com/FlareZ123/liber-primus/actions/runs/43964851383) completed successfully with the exact [read-only CommonJS SFT](../sims/lp2_tablebracket_terminal308_twotimepad_sft.cjs). This finding constrains one naturally visible pairing, but the page-matching premise has no authenticated authorial selector.

## Source-visible input and hypothesis

The original 256-cell table divides a 308-rune, 73-word stretch into two complete, historically identified sentences. The *pre-table* sentence contains the last **72** source runes of p48 plus all **66** of p49, or **138**. The *post-table* sentence starts with **92** runes of p51 and continues for **78** on p52, or **170**. The combined source-ordered register is **308 runes**. Independently, the terminal unknown chapter consists of the complete **232** runes on p54 and **76** on p55, exactly **308 runes**. These are original physical boundaries rather than selected offsets from a cipher search. Their equal lengths suggested one direct zero-phase corresponding-position key-reuse test. The missing authorial premise is why the two chapters should share a key, and whether the table is relevant to either one.

Freeze A = `p48[-72:] || p49[:] || p51[:92] || p52[:78]` and B = `p54[:] || p55[:]`, both in their original image publication/rune order. Preserve every original ciphertext symbol, including F, and both printed terminal page boundaries. Suppose for independent ordinary GP-native plaintexts U,V that `A_i=U_i+K_i mod29` and `B_i=V_i+K_i mod29`, with **any arbitrary shared secret 308-element pad K**. Then the pad cancels at every position:

`(A_i-B_i) mod29 = (U_i-V_i) mod29`.

No keystream fit, English substring crib, offset scan, or secret-key search is needed. This directly evaluates the strict aligned two-time-pad family. It does **not** apply if a page has an independent pad, cipher states advance differently, F is transparent, ciphertext is differently segmented, or the plaintext uses another register.

## Exact original ciphertext findings

On the unmodified 308 aligned GP29 pairs, the complete difference histogram at residues 0–28 is:

`[14,11,8,9,12,10,9,16,10,11,10,16,11,7,10,10,11,13,6,7,6,9,9,10,9,16,15,10,13]`.

Its zero bin contains **14** matching positions; the maximum of all 29 residue bins is **16**; and Pearson chi-squared against a 29-way uniform distribution is **20.980519480519483**. The source words and rune orders can be recovered from [the original 58-page GP29 corpus](../resources/liber-primus/lp2-corpus.json).

As a frozen empirical contrast, use three different source-native literary samples in the repository: [Shakespeare](../resources/control/shakespeare_first300k.txt), [Emerson](../resources/control/emerson_essays_2944.txt) and [Gibran](../resources/control/gibran_prophet_58585.txt). Normalize each to GP29 with source-familiar K/Q→C, V→U, Z→S, and rune aliases ING/NG, IO/IA. Generate 15,000 deterministic random pairs of full 308-rune contiguous windows per adjacent source pair using fixed xorshift32 seed `0x308f2301`, without fitting an offset to the real manuscript. These source comparisons are not conditioned on the original ciphertext's word-length or punctuation patterns.

| Independent GP control pairing (15,000 each) | Mean equal-position count | Mean maximum residue count | Mean chi-square | Fraction chi-square ≤ original 20.9805 |
|---|---:|---:|---:|---:|
| Shakespeare / Emerson | 18.5735 | 20.7637 | 43.0750 | **0.01013** |
| Emerson / Gibran | 18.5923 | 20.8108 | 43.8074 | **0.00733** |
| Gibran / Shakespeare | 18.2869 | 20.6233 | 42.7099 | **0.01060** |

The independent maximum-bin lower-tail fractions are 0.0338, 0.03253 and 0.03767. The zero-residue count alone is not decisive, with lower-tail frequencies ~0.176–0.197. The unusually **flat entire difference histogram** supplies the discrimination under these finite English source controls. This is an exploratory, model-dependent test, with no multiple-route correction across all possible chapter pairings or exact word-boundary-matched source null. Its numerical tail fractions must not be promoted into a universal p-value for Liber Primus or proof of another encryption system.

**Positive plant:** choose genuine source-native 308-rune plaintext windows, encrypt each with the same arbitrary 308-symbol random GP29 pad and demand identical full difference histograms before and after encryption; the full equality passes.

## Decision and next step

The direct source-ordered, zero-phase **shared additive pad** explanation is a poor fit to three independent native-GP prose source controls, conditional on both messages being source-native English. This weighs against the simplest reuse story despite the remarkable exact register-length equality. The observation neither selects the paired chapters as author's intended operands nor supplies a decipherment. One could still seek a first-party instruction connecting the 256-cell table to the 308-rune source sentence/terminal register; absent that instruction, shifting the alignment, changing maps, using unknown masks or adding a pad is an unconstrained rescue and should not be commissioned.

No unknown original LP2 plaintext, cipher key, or destination was recovered.
