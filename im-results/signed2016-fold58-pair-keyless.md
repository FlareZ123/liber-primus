# Signed-2016 FOLD → 58 physical LP2 pages → 29 mirrored pairs

**Status (Agent 8, 2026-11-11): a new, source-motivated folded-page key-independent test; weak heldout coincidence enrichment, no independently decrypted rune, no demonstrated cipher or state.** Interpret this as a narrow quantitative clue, not a recovered encryption scheme.

## Human-solver premise and direct observable

The authentic January 2016 signed message says the book's *words* form a map, its *numbers* give direction. A separately implemented, frozen base-58 source-word address for the recurring cleartext word **THE** (GP prime sum 72) selects physical **p14, word 1**. That original 2014 GP ciphertext word literally transliterates **FOLD**, unique in the unknown book's word inventory. This happens to suggest a physical interpretation: the original LP2 has **58 numbered page slots**, which fold end-to-end as pairs p and 57−p, exactly **29 pairs**, equal to the GP29 alphabet size. The coincidence is a candidate intended clue, not a validated instruction to fold the physical manuscript.

Three pairs are unavailable for an original *unknown-ciphertext versus unknown-ciphertext* equality test: p0/p57 and p1/p56 contain already-solved pages on one side; p7/p50 contains the sole rune-free numerical page on one side. The other **26 mirrored pairs** supply **5,402** matched original-rune positions when each page pair is truncated at its shorter original length. These skipped pairs are a **structural limit** of the proposed homogeneous cipher, not license to invent content for missing glyphs.

If both folded pages are ciphertext from independent native-GP prose enciphered by the **same unknown bijective 29-way output substitution at each aligned local position**, the relation `C_left[i] == C_right[i]` holds precisely when `P_left[i] == P_right[i]`. This invariant is independent of the unknown bijection, which may evolve arbitrarily by position. It covers any shared keyed additive pad or common alphabet-permutation row, without requiring knowledge of the key. A collision-suppression postfilter can introduce limited deviations but is tested by a source-true plant.

## Predeclared four physical geometries

Test local start/start, start/end, end/end, and end/start alignment. The first **12** eligible p2..p14 pairs select the orientation with maximum original equality. The remaining **14** p15..p28 pairs are untouched for that selection. A matched 600-trial null circularly rotates each right-side original page independently, preserving its exact symbol marginal, length and much local structure; each trial selects its orientation anew from the training group and then reports the heldout score. An exact within-pair enumeration of all available right-page circular rotations supplies 14 individual heldout checks.

| Alignment | Training equality | Independent heldout equality |
| --- | ---: | ---: |
| Start/start | 89/2,364 = 3.765% | 126/3,038 = 4.147% |
| Start/end | 86/2,364 = 3.638% | 107/3,038 = 3.522% |
| End/end | 74/2,364 = 3.130% | 117/3,038 = 3.851% |
| **End/start, train-selected** | **94/2,364 = 3.976%** | **124/3,038 = 4.082%** |

On the exact train-selected end/start orientation the **600 circular-shift controls** average **3.419%** heldout; **15/600** equal or exceed the observed heldout **4.082%**, giving **(15+1)/(600+1) = 0.02662**. This is *nominal conditional enrichment*, not a familywide decryption p-value or evidence that pages genuinely share the same stream key. Selecting the best heldout orientation instead of respecting training gives a separate exploratory rate **4.147%**, with a selection-aware best-heldout control **0.07155**. Four alignment tests, the retrospective FOLD hypothesis, the GP plaintext source's unknown distribution and untested page-clock phases require caution.

**Source-true planted control:** Independent Shakespeare GP words (12,220 total rune positions) were enciphered as arbitrary *shared per-position affine bijections* across corresponding pairs, with an 81%-probability same-rune rewrite analogous to the original repeat deficit. This modified **308/12,220** emitted glyphs. The blind orientation search selected the actual start/start placement on training, recovering the expected language equality signal **119/2,364 = 5.034%** train and **180/3,038 = 5.925%** heldout. This demonstrably separates a full source-language shared-register case from the matched source-null and from the original's much weaker score.

**No single heldout pair passes a standalone 5% local-phase test.** The two highest positive contributors are p17/p40 (**13 vs 7.896 expected matches** under all local circular offsets, rank 0.0779) and p19/p38 (**13 vs 8.039, rank 0.0746**). Removing any one heldout pair leaves total selected equality between **3.950% and 4.214%**. The weak pooled excess is spread across several pairs; no given page yields an identified key, repeated plaintext, or route. A purely postselected inspection of individual p-values would be misleading.

## Decision and bounded next operation

This study neither recovers unknown LP2 plaintext nor validates the literal FOLD operation. The observed equality falls well below an independently planted full shared-affine-register control. Consequently, a **single common bijection applied at matching physical page offsets** is presently a poor complete explanation. The nominal end/start enrichment is worth monitoring only if a separate *2016-source instruction* independently specifies that exact orientation, or identifies the subset of pages with shared states. Do not optimize page rotations, subsets or fold conventions against these scores and then claim a key.

Reproducer: [`sims/signed2016_fold58_pair_keyless_sft.cjs`](../sims/signed2016_fold58_pair_keyless_sft.cjs), Node.js 22; complete original per-pair exact shift ranks and leave-one-out scores are printed. [Original executable success](https://github.com/FlareZ123/liber-primus/actions/runs/42959237604); [independent diagnostic run](https://github.com/FlareZ123/liber-primus/actions/runs/42959468145) on Windows, no external sources. The [prior page-28 bookend shared-key study](../sims/2016_28page_bookend_ratio_inverse.cjs) is different: it aligns two complete 28-page text halves via a duplicated terminal word pair, rather than pairing physical p and 57−p.
