# Granted-true-q8-action syntax is not a reliable phase/word oracle (Issue #3262)

**Decision (28 November 2026).** With a genuinely correct, already-recovered GP29 common chart and chapter q8 key, independent word-start phases create exact competing ciphertext inverses. A language model can strongly recognize ordered source text but **does not reliably select the original GP rune-word or the original start phase**. A phase-blind language score is useful as *supporting evidence* for an independently recovered action when source order is justified; it is **not an exact original-plaintext acceptance criterion**, and it must not be used to assert any LP2 p0–55 decryption. This is the negative branch of #3262, not a claim that all syntax models fail.

## Exact executable experiment

- [Reproducer](../sims/lp2_q8_native_phase_syntax_receiver_sft.cjs); [machine-readable complete summary](lp2-q8-native-phase-syntax-true-action-calibration.json). The initial first-party work was exercised directly in a connected V8 runner; CI [run 46088761184](https://github.com/FlareZ123/liber-primus/actions/runs/46088761184) passed the first script revision. A later manual CI run was queued for the 31-permutation revision; the retained JS source and output JSON specify that test, without assuming the queued run completed.
- **Data isolation.** Two complete actions (one `pi` shared across three native short chapters with separate q8 keys per chapter) are lifted from `im-results/lp2-q8-seven-crib-conditional-chart-recovery.json`. The model receives the *true* normalized action as a generous upper bound, **never** the hidden word phases. It does not recover or search any chart. Source data are the nine historically solved runic GP29 sections in `resources/external/relikd-solved-gp29-native-v1.json`, drawn into 14 source excerpts (first/last 24 words for long sections; the full short sections), with 2 independent plant charts; hence **28 matched conditions, 668 GP rune-words, 2,790 runes**. Excerpts recur under the two charts, so 28 conditions are not 28 independent authors.
- **Exact inverse.** Every printed/encrypted word starts at an independent hidden phase uniformly sampled from 0–7; plaintext F bypasses and does not consume a phase, while ciphertext F can be F or an encrypted non-F. All eight phases and legal F branchings are enumerated; identical GP rune sequences aggregate their possible start phases, but distinct rune sequences with identical Latin renderings remain separate identities. Forward reencryption is enforced in the latest script.
- **Frozen scoring, no original-input tuning.** One lexical model uses the existing public-domain Gibran and Emerson control texts plus all solved-native records *except* the record scored. Literal word frequencies have an explicit 4% mass allocated to a length- and character-trigram OOV distribution. Ordered syntax uses a word-bigram Dirichlet backoff weight of 12. The bag comparator uses identical lexical and phase weights but removes the bigram terms. Posterior probabilities explicitly integrate over unknown phases, rather than being evaluated at known starts. No unknown LP2 ciphertext, text hypotheses or phase sidecars enter the experiment.
- **Matched rivals.** For each condition, 31 uniformly shuffled word-group orders retain the exact same encrypted words, chart/key, true word multiset and length inventory. Each experiment separately moves one rune across every fifth eligible adjacent word boundary, preserving total ciphertext runes and group count but deliberately testing a wrong segmentation. The latter is only a particular local false-boundary control, **not** a representative exhaustive model of H-decoy segmentation. The single-shuffle comparison is the first of 31 and its word posterior/false confidence are measured explicitly.

## Results

| Measurement | Rune-to-Latin `ING/IA` | Sensitivity `NG/IO` |
| --- | ---: | ---: |
| Exact GP word top-1, order-free bag | **658/668** | **657/668** |
| Exact GP word top-1, ordered bigram | **651/668** | **650/668** |
| Correct hidden phase top-1, ordered bigram | 650/668 | 650/668 |
| Ordered model false words with ≥95% posterior | **6** | **4** |
| Truth GP word admits ≥2 phase starts | **11/668** | **11/668** |
| Genuine ordered score exceeds first false shuffle | **28/28** | **28/28** |
| Genuine ordered score exceeds specified false split | **28/28** | **28/28** |
| 31-shuffle permutation `p ≤ .05` (minimum p=1/32) | **26/28** | **26/28** |

For the default mapping the true GP word is in the nominal 90% credible prefix in 98.35% of cases; its mean posterior is 0.9665, and mean true-start posterior is 0.9585. These are favorable numbers **only when the exact original action is granted**; they still fall short of an independently reproducible exact text/phase inverse. False confidence is not eliminated by the alternative Latin spelling convention. A very high cross-order score indicates real prose order under the model but does not certify each decoded word.

**Exact nonidentifiability.** Eleven true GP words admit multiple legal word starts under their correct cipher actions and original ciphertext. If the true rune word is provided, an order-only language model has identical word likelihood under each such phase: no amount of lexical or syntactic context can distinguish them absent a phase rule or external state. Moreover, the source-controlled p57/p56 short words in `lp2-q8-pooled-true-action-phase-collision.json` already contain the distinct `AND/UUE`, `AND/BEG` and `OUT/IRE` alternatives with exactly the same true action and ciphertext. A sentence model sometimes chooses an alternate word with high apparent certainty. These are concrete structural obstacles rather than a cipher implementation error.

## Decision / next receiver gate

1. **Do not certify unknown LP2 text from a language-scored best path** through a guessed q8 action, even if the score strongly discriminates a shuffled negative control. An action must first be selected independently on original ciphertext and source-supplied keys/anchors.
2. If an independently selected q8 chart/key is ever recovered, report *set-valued* GP words and start phases, the posterior on every viable alternative and calibration on genuinely independent native text. The one-model top sentence alone is insufficient.
3. The missing source input is a **phase/clock and ordering selector** (word reset vs continuity, source-derived start phases or side information, and H-shuffle vs H-decoy). The existing source does not select any of these for unknown p0–55. Seek a visible clue or historical key delivery that fixes one before investing in more language-score optimization.
4. The positive portion is narrow: under the exact synthetic sender and true chart, genuine order beats one shuffled control in 28/28 conditions and beats 31-shuffle permutation nulls at p≤.05 in 26/28. This supports syntax as an *order diagnostic*, not proof of a cipher solve path or a general false-segmentation test.

**Established LP2 status unchanged:** no unknown plaintext, authentic unknown key, source-selected q8 action, or final destination has been recovered. This belongs in supporting research, not a new line of established result in `results/README.md`.
