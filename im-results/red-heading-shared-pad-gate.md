# Same-phase additive-pad reuse across original red headings

## Decision

**No evidence supports one GP29 additive keystream reused at zero phase across the complete red headings.** The source-defined pairwise differences behave like independent-key/random controls, not like differences of English-GP headings encrypted under a shared pad. No shared key, unknown-title plaintext, held-out prediction, or new cipher mechanism was recovered. Close this exact hypothesis; do not rescue it with phase or offset scans.

## Source-fixed input

The input is every complete red span whose final rune offset is immediately followed by a source-annotated red 13-dot mark. The reproducer asserts the complete 16-span inventory and checks each selected span against the canonical corpus indices:

- **12 non-control heading spans** (minimum overlap five): p0@0+13, p3@0+16, p6@71+11, p7@194+14, p15@0+9, p15@9+11, p23@0+16, p27@0+19, p33@0+10, p33@91+8, p54@0+9, p56@0+5.
- **Solved control:** p57@0+7 is the exact red rune string **ᛈᚪᚱᚪᛒᛚᛖ**, plaintext **PARABLE**.
- **Separate sensitivity:** p53@128+51 is a multi-line red rubric passage, not a heading; including it does not change the conclusion.
- **Excluded as too short:** p3@119+3 and p39@119+3 (three runes each). The red spans on p8 and p40 do not terminate at red 13-dot marks and are outside this source-defined set.

The independent original-JPEG adjudication in [lp2-red-rune-image-adjudication.md](lp2-red-rune-image-adjudication.md) accounts for all 79 red classifier flags as registration/decorative-initial effects and makes no transcription changes. The test uses canonical source readings and does not silently substitute black-font classifier guesses.

## Test

If two headings are encrypted as C_i=P_i+K mod 29 with the same key beginning at their first rune, the key cancels at zero phase:

    D_ij(k) = (C_i(k) - C_j(k)) mod 29 = P_i(k) - P_j(k) mod 29.

The reproducer compares only same-position differences from the first rune. It does not search offsets, phases, alphabets, title translations, or key schedules. The primary statistic is the pooled fraction of aligned differences equal to zero. A second 29-bin symmetric-histogram statistic is computed for each pair; its maximum over all 78 pairs is compared with the maximum from each null replicate, providing family-wise correction.

Two length-preserving source-matched nulls independently rotate or permute each observed title. Positive/negative power controls use 1,000 synthetic sets each: 12 English-GP heading/short-title windows sampled at the exact observed title lengths from the solved LP1/p57 reference, plus the exact seven-rune PARABLE control. One control encrypts all 13 strings with one zero-phase additive pad; the other gives each string an independent pad. The 3,473-symbol solved English-GP reference supplies an independent unigram collision baseline.

## Results

| Input set | Pairs | Aligned positions | Equal differences | Equality rate |
|---|---:|---:|---:|---:|
| 12 non-control red headings | 66 | 621 | 20 | 0.032206 |
| Same set plus solved p57 PARABLE | 78 | 703 | 21 | 0.029872 |
| p53 long red rubric sensitivity plus p57 | 91 | 851 | 27 | 0.031727 |

The solved English-GP reference has symbol-collision probability **0.060430**; the uniform 29-symbol baseline is **1/29 = 0.034483**. The observed 0.029872 is near the independent/random range and substantially below the English-GP shared-pad control.

- **2,000 independent rotations:** pooled-rate upper-tail p≈0.681; maximum-pair statistic family-wise p≈0.129.
- **2,000 independent within-title permutations:** pooled-rate upper-tail p≈0.678; maximum-pair statistic family-wise p≈0.160.
- **1,000 shared-pad English-GP controls:** median equality rate **0.06259**, fifth percentile **0.04552**, minimum **0.03414**. None scored at or below the observed **0.02987** (empirical p<0.001).
- **1,000 independent-pad controls:** median equality rate **0.03414**; **781/1,000** scored at least as high as the observed rate.

The p57 title is itself solved plaintext, PARABLE. If it is assumed to belong to the same reused-key channel, it additionally forces the first seven key symbols to zero; the other raw red headings do not become intelligible under that forced zero key. The pairwise test above does not depend on this conditional argument.

## Interpretation and boundary

The specific hypothesis—one additive GP29 pad, reset at the first rune of every red heading—is rejected by its cancellation invariant and by source-length-matched controls. This does **not** test distinct keys per heading, non-additive transformations, a different source-selected channel, or another explicitly sourced operation. It does not justify trying offsets or phases, which were excluded by the assignment. No unknown LP2 plaintext, authentic key, or destination follows.

This is distinct from the earlier [red-heading-as-key-for-following-body test](lp2-red-heading-self-key-vigenere-gate.md) and the [red-title-to-body reuse test](red-title-body-key-reuse.md): those tested heading→body transformations or body streams, not same-pad cancellation *between the headings themselves*.

## Reproduction

From the repository root, run **node sims/red_heading_shared_pad_gate.cjs**. The script reads the canonical ink annotations, GP29 corpus and solved LP1/p57 reference, asserts the complete 13-dot-terminated span inventory and source-index equality, fixes all seeds, and emits the exact title set, nulls, controls and statistics as JSON.
