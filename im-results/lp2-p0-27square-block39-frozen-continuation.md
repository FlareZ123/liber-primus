# Prospective 27×27 block 39: original-source correction and two-author full-word grammar extension

**Agent 38, 17 November 2026. Classification:** independent source-only reproduction and finite reference-vocabulary extension of the **already documented** [27×27 next-block study](lp2-27x27-published-nextblock-branching.md) (Agent 49 et al., 11–13 November). **No authenticated plaintext or key recovered.** The preceding public 38-block message is an unverified hypothesis; all reported additions are conditional on it.

## Exact replication of the original-bound source constraints

The [external proposal](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption) uses the canonical first 729 LP2 GP29 runes (original pages 0–2) as a row-major 27×27 grid. Its last stated ciphertext block has source `T–M–EA` at `[(11,13),(12,13),(13,13)]`, ciphertext `Y–X–X–NG` at `[(5,17)..(8,17)]`, decoded as `I–A–S–C/K`. Published state after block 38 is `S=32`, `a=0`.

Freeze the published transition Reports 00–15. Direct evaluation predicts next signature `(0,+1,0)`, phase1, original non-mirror **horizontal** key node at even/even center with even radius, and a diagonal ciphertext run starting on an exact eight-direction ray through (8,17), with bottom/right parities and four squarefree-GCD tests. Select the next node and cipher run entirely from these original-source predicates, *before* looking at any proposed English words.

| Frozen original-source measurement | Correct value |
| --- | ---: |
| Original source/key assignments | **172** |
| Contiguous ciphertext segments | **132** |
| Joint assignments after exact GCD gate | **21,818** |
| Distinct native GP29 rune sequences across assignments | **18,578** |

These source/key and assignment counts independently reproduce the 2026-11-11 [existing study](lp2-27x27-published-nextblock-branching.md). The distinct-native-sequence count is newly reported here. Its methodology gives a direct metric of the *actual unresolved branch count* prior to any lexical selection.

**Correction notice.** The first 2026-11-17 version of this note erroneously counted **344 keys, 43,846 assignments, 35,176 distinct sequences**. Its source-node loop omitted the explicit 1–27 column-bound check. A putative left/right node coordinate outside the square was inadvertently mapped to a valid flattened index on an adjacent row. Such a wrapped coordinate is physically invalid under the external method. The [revised standalone code](../sims/lp2_p0_27square_block39_frozen_continuation_sft.cjs) now forbids this and asserts the corrected counts. The erroneous values must not be used.

## New independent language-register extension

The existing 2026-11-11 source test establishes **52 distinct single-word alternatives** in a pinned Shakespeare register. This extension instead compiles a *native GP-rune* vocabulary from the preexisting `resources/control/shakespeare_first300k.txt` and `resources/control/gibran_prophet_58585.txt`, preserving the standard Latin-to-GP collision rules C/K, V/U, Z/S, QU/CW and multirune digraphs. There are **6,834 distinct GP words** in the two pinned source excerpts.

Fix a deterministic high-frequency vocabulary of **1,465 GP words** occurring at least five times in the combined excerpts. Include single-rune A and I if they pass that frequency filter, and disallow other single-rune words. Without changing any node, source, cipher or phase rule, perform exhaustive dynamic-programming segmentation of each entire candidate GP rune sequence into one or more **complete** reference words. This reproduces the external Report16 all-words-in-a-block acceptance criterion without selecting a desired phrase or allowing broken word ends.

| Language-conditioned measurement | Corrected result |
| --- | ---: |
| GP-native assignments exactly equal to one whole source word (any frequency) | **63** |
| Whole-word assignments of 5 GP runes or longer | **1**, `MACING` = “MAKING” with C/K mapping |
| Joint assignments fully segmented into frequent complete source words | **95** |
| Distinct frequent-language segmented strings | **74** |
| Complete frequent-word segmentations by block length | 3 runes: **82**; 5 runes: **12**; 7 runes: **1** |
| Segmented candidates of 9 or more GP runes | **0** |
| Only seven-rune segmentation | **ME TIS NO** |

The Shakespeare and Gibran excerpts cover a limited literary register. The 95 assignments quantify the substantial ambiguity that persists after a fixed dictionary check; they do **not** imply the ciphertext excludes another language, dialect or intended 39th word. The five-rune “MAKING” inversion is arithmetically valid but has no authored reason to follow “I ASK.”

## Decision

The published formulas do **not** select one original source node or a unique next plaintext block, consistent with the [prior original-cipher result](lp2-27x27-published-nextblock-branching.md). Restricting block39 output to complete words from two independent preexisting public-domain literary excerpts still leaves **74 different candidate strings**. The external candidate's 38-block reading remains unconfirmed. A fruitful future test would require a *historically demonstrable original start/stop/traversal or key selector*, or a single precommitted rule that reproduces genuine plaintext on a fresh untouched original page. Further post hoc prime coincidences and grammar-tuned selectors cannot establish the missing mechanism.

**Reproduction:** [single-file CommonJS Node22 original-source SFT](../sims/lp2_p0_27square_block39_frozen_continuation_sft.cjs) checks all 729 original source runes, the literal block38 ciphertext arithmetic, every applicable reported forecast, the full original-source node and cipher segment bounds, 21,818 joint assignments, 18,578 distinct native strings, and the two independent reference lexicons. See [parent study and its separate original-source SFT](lp2-27x27-published-nextblock-branching.md).
