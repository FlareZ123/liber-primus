# Five-phase affine alphabets with a different Caesar shift for every word: exact original-source invariant

**Agent43, 15 November 2026. Classification:** source-original cryptanalytic constraint with native-GP comparison and exact positive. **No recovered LP2 plaintext, authenticated cipher, key, or destination.** This is a bounded exclusion for a particular architecture that can flatten ciphertext marginals and preserve word-local five-back echoes.

## What human clue motivates this and what it would mean

The original manuscript has **104 repeated GP29 glyphs at word-internal distance five**, across 2,105 eligible slots, and yet only **86 equal adjacent glyphs** across 12,901 within-page steps. A five-phase alphabet motivated by the repeated five-dot figures can preserve five-back repetitions. A fresh Caesar mask for every printed word is an economical way to make the overall ciphertext frequencies nearly uniform and evade the exact A/I/O singleton obstruction to a statically reset word cipher. A choice of phase offsets that avoids common within-word plaintext bigrams could also reduce within-word adjacent equals. There is **no Cicada-signed instruction to use this encoding**. Changing word segmentation or the native plaintext register remains a rival.

Test the strongest simple additive-key-drift variant, granting the hypothetical author an **arbitrary, unseen 29-valued Caesar shift per word** and five independently unknown invertible affine substitutions **per original visible chapter**:

\[
C_{w,j}= a_{s(w),\,j\bmod5}\,P_{w,j}
 +b_{s(w),\,j\bmod5}+h_w\pmod {29}.
\]

Here each \(a\) is any nonzero GF29 element, \(b\) is any GP29 offset and each of the 2,896 \(h_w\) values may vary freely, with no restriction on its source, phase or relationship to neighboring words. The original nine visual chapters have **[158,255,383,437,224,326,378,669,66]** words. The decoder is exactly invertible when the keys are known. Unlike the earlier fixed five-phase permutation test, this family allows every individual word to have its own additional secret offset, and thus does not fall under the static whole-word singleton theorem.

## Key-independent obstruction

At a word-internal edge \(j-1\to j\), subtract consecutive ciphertext runes:

\[
\Delta C_{w,j}
=a_{s,j}\,P_{w,j}-a_{s,j-1}\,P_{w,j-1}
 +(b_{s,j}-b_{s,j-1})\pmod{29}.
\]

The entire secret word offset **cancels**. Fix a chapter \(s\) and predecessor phase \(r=(j-1)\bmod5\). Multiplying a difference by a fixed nonzero GF29 scalar and adding a fixed offset merely permutes its 29 histogram bins. Therefore the number of equal **differences** among all edges in this class is invariant and equals the collisions in \(qP_{w,j}-P_{w,j-1}\) for exactly one unknown \(q\in\{1,\ldots,28\}\).

There are **45** original chapter/phase classes. For a fixed possible plaintext, separately choose the lowest collisions among *all 28 ratios in each class*. This gives the hypothesized cipher a more generous fit than a consistent set of five slopes can achieve, since the ratios selected for the five edges need not multiply to one. If even this lower bound exceeds the source observed count, no choice of book/chapter-affine keys, offsets or word-specific Caesar masks can map that candidate native text to the exact original difference-collision profile.

On the original **12,956** runes in **2,896** printed words, there are **10,060** internal edges and **1,720,847** eligible edge-pairs within the 45 classes. The untouched source gives **60,891** same-difference pairs, rate **0.03538431946593741**. This tally is from source-ordered original GP29 ciphertext, not a fitted decryption.

## Twelve finite native-GP controls and positive encryption

For each independent source (Gibran, Shakespeare and Emerson), populate **the same 2,896 original word-length slots** using source-native GP29 spellings including the attested one-rune ING/IO. Four deterministic, differently indexed samples per source yield twelve controls. Compute the exact minimum over 28 possible slopes for *each* of 45 classes, allowing secret keys to be chosen after seeing each native control. The **lowest** optimized sum from the four samples per source is:

| Native source | Minimum collisions after all 45 secret ratio optimizations | Equivalent rate |
| --- | ---: | ---: |
| **Gibran** | **69,496** | 0.040385 |
| **Shakespeare** | **64,585** | 0.037531 |
| **Emerson** | **65,235** | 0.037909 |
| **Original LP2 ciphertext** | **60,891** | **0.035384** |

Every individual sample exceeds the original despite aggressive key freedom. Across the 45 separate original classes, 28–37 per control sample have fewer original collisions than that control's own best allowed affine ratio, rather than a single outlier causing the bookwide gap. The ratio minimization is exhaustive finite GF29 arithmetic and does not use a language optimizer.

**Reversible independent positive:** Encrypt 12,956 genuine length-matched Gibran GP29 runes with nine different five-phase slope/offset schedules and an independently chosen offset at every word. The correct keys recover **12,956/12,956** planted runes, and every one of the 45 source-language collision identities holds exactly between the encrypted and unencrypted tapes. This demonstrates that the test would retain the invariant under a genuine instance of the proposed architecture.

[Single-file Node22/CJS original-source test and positive](../sims/lp2_worddrift_fivephase_affine_invariant_sft.cjs). The implementation asserts the original lengths, observed 60,891 pairs, denominator 1,720,847, all twelve native bounds, Gibran/Shakespeare/Emerson seed-0 witnesses 69,839/65,175/65,507 and every positive-plant class identity.

## Decision

The word-drifting five-phase **affine** family is an implausible direct decoder of ordinary source-native GP29 prose under the 12 matched controls, even if all 2,896 word keys and all 45 chapter/phase affine mappings are otherwise secret. This strengthens the causal restriction on simple five-position keyreuse: adding a fresh *common word Caesar mask* does not restore the necessary GP-native adjacent-difference concentration.

This is an **empirical native-language comparison**, not a mathematical theorem excluding every possible English sentence. It says nothing about separate affine slopes for *each word*, different nonlinear operations, cipher/word-boundary feedback, a higher-entropy external stream, or plaintext in another encoding. The source lacks an instruction selecting this family, and no new unknown rune has been deciphered. Do not spawn a phase/seed sweep from this result; subsequent attacks need an independent source-supported key/state rule and previously unselected original predictions.
