# All-secret line-direction invariant for original LP2 printed word lengths

**Original-input decision (12 November 2026, Agent48):** The LP2 unsolved chapters do **not** exhibit the within-printed-line, *unordered* adjacent word-length dependence characteristic of ordinary sequential English, Latin or Old English source prose. **Reversing any independently selected subset of whole printed lines, including a full boustrophedon pattern, leaves this statistic exactly unchanged** as long as the original complete words remain intact and attached to their source lines. So an alternative page/line reading direction **alone** cannot rescue a direct, word-boundary-preserving letterwise substitution hypothesis. This narrows architecture; it **does not decode a rune**.

This is a newly tested **all-secret/per-line-reversal necessary invariant**, complementary to the in-order length grammar findings of [Director #608](lp2-original-wordlength-grammar-mi.md). It avoids brute-forcing an exponential family of line-orientation choices or fitting a cipher alphabet.

## Puzzle-motivated fork

The original LP2 manuscript is printed in a runic alphabet with multiple discrete physical lines on every text page. Historical runic writing permits direction-dependent readings; a human solver could reasonably consider alternating right-to-left lines or a rearranged physical-line order. Such transformations can scramble across-line text transitions and make naive sequential reading unhelpful, but **cannot change the multiset of adjacent complete-word length pairs *inside* each original printed line**, except by changing the words themselves or reinterpreting their printed boundaries. Unordered pairs additionally remove every possible left/right orientation choice.

This is a strict conditional theorem: with original complete words as indivisible units, reverse any number of entire lines, rearrange the complete lines, or change which lines are read first. Each preserved line contributes the exact same unordered pairs, hence exactly the same symmetric joint length distribution and its mutual information. Words split across original physical lines are expressly excluded from the measured edge set because their reassembly would be another cipher hypothesis, not a pure line-direction operation. The test also does not attempt rune-wise reversal *inside* each word.

## Frozen original input and metric

The [source-native one-file SFT](../sims/lp2_boustrophedon_wordlength_allsecret_sft.cjs) consumes the **canonical original LP2 runic transcription** and full 29-symbol GP index table. It reconstructs 2,896 complete original words over 12,956 runes; wraps (`/`) and physical page breaks (`%`) do not create words. It accounts for the **rune-free physical p50** rather than shifting the remaining chapter/page labels. Exactly **452** original complete words cross an original physical line, which are omitted from these interior-only pairs. The remaining **1,852** eligible adjacent pairs connect two intact words within the same printed physical page and line.

Lengths are grouped into 1–8 and 9+ GP runes, and for each eligible original neighboring pair `(a,b)` both `(a,b)` and `(b,a)` enter the 9×9 symmetric count table. The resulting plug-in mutual information `I(L1;L2)` is measured in nats. Its value is mathematically invariant under reversing either endpoint order. The published CommonJS code also physically reverses **265 alternate-line complete-word components** of the original data and asserts the exact equality of the statistic before/after the transformation; the same planted reversal on independently ordered control prose also leaves the statistic unchanged.

For its null, lengths are shuffled in **nine source-defined manuscript chapters**, preserving each original chapter's complete word-length inventory, chapter membership, original line mask and possible pair slots. Fixed-seed 1,500 trials avoid overestimating significance by silently using a corpus with a different marginal length distribution.

| Measurement | Symmetric intra-line MI |
| --- | ---: |
| **Original LP2 pp0–55** | **0.00955848 nats** |
| Original chapter-shuffled null mean | 0.00985260 |
| Null standard deviation | 0.00226479 |
| Original z-score | **−0.130** |
| Original empirical upper-tail p (1,500) | **0.518** |
| Original after planted alternating-line reversals | **0.00955848**, exactly invariant |

The original within-line unordered pair signal is thus typical of the source-length-matched shuffled null.

## Independent ordered literary positive controls

Three complete English source references, plus original GP-normalized Latin and corrected Old English, are projected onto the **identical original LP2 physical-line position mask**, not custom reflowed to make their results easier. Each disjoint **2,896-word** window is measured in the same 1–8/9+ GP-length bins and against **its own chapterwise word-length shuffle null** (100 independent draws for each English window, 150 for each Latin and Old English window). English is tested both with and without the conventional ING contraction. Those source references and their frozen files are all already part of `resources/control/`.

| Source register | Disjoint windows | Lowest symmetric MI | Lowest within-window z against native shuffle |
| --- | ---: | ---: | ---: |
| Emerson, GP with ING / without | 26 + 26 | 0.02523 / 0.02438 | +6.76 / +6.35 |
| Shakespeare, GP with ING / without | 19 + 19 | 0.01367 / 0.01565 | +1.72 / +2.27 |
| Gibran, GP with ING / without | 5 + 5 | 0.03217 / 0.03321 | +10.34 / +8.69 |
| Latin Vulgate GP word-register | 13 | 0.01594 | +3.10 |
| Beowulf Old English corrected GP | 3 | 0.01405 | +2.29 |

**All 116** disjoint native-ordered control windows retain a higher symmetric within-line MI than the original manuscript. **115/116** have an individual positive z greater than or equal to +2 against their own native source-length shuffle null; the sole lower-powered Shakespeare window has z +1.72 and remains above the original MI. This is strong counterfactual evidence that random choices of whole-line reading direction do **not** explain away the source grammar deficit. These 116 windows are not independent hypotheses about the manuscript and their positive rates are not a posterior probability of some specific cipher.

The earliest source result [#608's adjacent word-length MI](lp2-original-wordlength-grammar-mi.md) was measured on the ordered word stream. This result addresses a **materially different cipher family**: even after discarding all inter-line transitions and all original left/right neighbor orientation, the simple native-prose dependence is still absent. One must alter what constitutes a source word, change adjacent membership within each line, or introduce another plaintext transport/reordering stage to explain the signal. Neither image ornaments nor an authentic historical direction instruction has selected such a stage here.

## Cryptanalytic consequence

**Reject:** A model in which the original complete word tokens contain a sequential natural-language plaintext in each printed line, and the only wrong assumption is whether to read those lines in alternating or arbitrarily chosen directions or which complete line comes first. This also holds if each rune is later independently replaced by some unknown fixed monoalphabetic substitution, because that cannot change original printed word lengths. No alphabet-key search can reverse the grammar loss.

**Retain as unresolved:** Per-word or internal-line transpositions, moving words between different lines, changing boundaries, variable-length encoding, artificial poetry with atypical length relationships, historical languages or genres outside the calibrated controls, and arbitrary long-key cipher transport. This test provides no source-verified key, actual plaintext, or destination.

**Next decision:** Focus original-image or signed instructions on **operations changing word adjacency or word partition**, or an external key/source whose original format predicts the printed segmentation. Repeatedly trying arbitrary left/right line orientations while retaining complete original words has no causal route to recovering natural prose under this evidence.

**Reproducer:** `node sims/lp2_boustrophedon_wordlength_allsecret_sft.cjs` from repository root. It uses only Node.js 22 built-ins and pinned original/control sources, reports the native-shuffle null, exercises the planted line-reversal invariants, tests all 116 independent control windows and emits the per-source detections in JSON. No manual page labels or unbounded parameter fit.
