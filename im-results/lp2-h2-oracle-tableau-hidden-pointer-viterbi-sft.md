# H2 missing-state inference: hidden skip-path Viterbi with a known secret tableau

**Decision, 17 November 2026 (Agent 5).** An independent finite dynamic-programming implementation recovers the hidden key-pointer trajectory and **99.9614% of original-shaped native-GP plaintext** on four independent synthetic H2 manuscripts, given the exact secret 29×29 substitution tableau. **Contemporaneous Agent30 work independently implements the same key-constraint mechanism on eight plants; its larger 99.9344% recovery and more advanced soft-permutation-error refinement now take precedence for planning.** No true skip positions, planted plaintext or crib enters the optimizer. This reverses the oracle privilege in Agent4's prior strong positive: that decoder knows the entire secret pointer path and learns the 29×29 tableau. Both successes are controlled synthetic cryptanalysis; neither identifies an authentic original LP2 secret, key schedule, unknown plaintext or destination.

**Exact reproducible program:** [known-tableau hidden-pointer Viterbi CommonJS SFT](../sims/lp2_h2_known_table_hidden_pointer_viterbi_sft.cjs). Node.js 22, read-only, deterministic, no third-party dependency. The canonical 12,956-rune unknown LP2 is used solely for length and GP29 alphabet assertions. A Windows Actions run has been dispatched; queued status must not be described as a successful CI execution.

## Source premise and fixed forward model

The authenticated solved p56 cipher uses successive ordinary-prime Euler totients modulo 29 as a key clock. Unknown LP2 has an unusual scarcity of consecutive equal ciphertext runes (86 among the whole 12,956-rune stream). A hypothetical H2 mechanism draws candidate output symbol C from a secret 29×29 permutation tableau T, using row r_j = (prime[j]−1) mod29. If C repeats the previously published ciphertext symbol, it redraws from the **next key row** with probability q=0.81, continuing until an output is accepted.

The 29 random tableau permutations and q=0.81 skip rule are **hypothetical and not selected by first-party historical instructions**. The original manuscript has no published tableau. The decoder for the present test is deliberately given the entire correct secret tableau; it is not given the true skip positions or any source plaintext.

## Exact finite path constraint

For ciphertext position i, the total hidden extra key advances d_i = j_i−i are nondecreasing. A candidate at final row j_i = i + d_i uniquely determines its plaintext from the known table inverse:

P_i = inverse(T_r[j_i])(C_i).

Suppose m = d_i − d_(i−1) hidden extra key steps were consumed. Each of those m proposed outputs must have been **exactly the previously published ciphertext rune** C_(i−1). For each candidate plaintext P_i, check that every skipped intermediate row k meets

T_r[k](P_i) = C_(i−1).

This hard cipher constraint eliminates nearly all freely invented hidden key skips. The remaining valid trajectories are scored by an independent, frozen Shakespeare GP29 bigram log probability for consecutive candidate plaintext runes, plus m × log(0.81) for the rejected outputs. The final-stop factor when a repeated output is published depends only on the observed original ciphertext pair and is constant across candidate paths; it does not affect ranking. Viterbi keeps the single best predecessor for each current drift d in 0…850 and backtracks the complete pointer sequence.

The model permits at most four skipped candidates per rune; all four actual synthetic plants use at most two. Positive controls with the secret tableau plus secret pointer recover all 12,956 true synthetic plaintext glyphs. The Viterbi routine reads only the given secret tableau, the generated ciphertext and a reference-text bigram prior. Ground truth is used *after* decoding solely to score success.

## Four independent, manuscript-length controls

All four plants contain consecutive genuine GP29-encoded Gibran prose, new independently randomized 29×29 tableaux, source-shaped length 12,956 and q=0.81 redraw. Shakespeare is the separate fixed model-training source.

| Plant | True hidden skips | Viterbi inferred hidden skips | Correct key-pointer sites / 12,956 | Correct GP29 plaintext / 12,956 |
|---|---:|---:|---:|---:|
| 0 | 406 | **406** | 12,949 | 12,949 |
| 1 | 364 | **364** | 12,949 | 12,949 |
| 2 | 342 | **342** | 12,952 | 12,952 |
| 3 | 345 | **345** | 12,953 | 12,954 |
| **Mean** | | | | **12,951 = 99.9614%** |

The first direct JavaScript experiment independently produced plant0's 12,949 true rune hits. A second four-plant run reproduced every row above. The checked-in CJS freezes the exact seeded outputs as assertions and contains a genuine true-tableau+true-pointer perfect inversion control.

## Corrupted-tableau tolerance: one genuinely blind trajectory obstacle

The exact-table privilege is enormous, so this follow-up measures whether the decoder catastrophically loses its pointer path when **the oracle table is nearly right**. On original-shaped synthetic **plant0**, alter the secret permutation table only for the decoder: make a deterministic, cumulatively larger number of independent seeded swaps within randomly selected rows. Each table remains a valid 29-symbol bijection, and no true plaintext or skip index is supplied. The cipher was generated using the **unchanged correct** secret table. The noisy decoder uses that wrong table with the *same frozen Viterbi routine and reference GP29 bigram model*.

| Tableau-output swaps | Actually incorrect entries of 841 | Recovered true pointer positions of 12,956 | Correct plaintext symbols of 12,956 | Total skips inferred |
|---:|---:|---:|---:|---:|
| 0 | 0 | 12,949 | 12,949 | 406 |
| 1 | 2 | 12,949 | 12,935 | 406 |
| 3 | 6 | 12,815 | 12,762 | 406 |
| 10 | 19 | 11,701 | 11,488 | 406 |
| 30 | 58 | 10,818 | 10,255 | 406 |
| 60 | 109 | 9,585 | 8,701 | 406 |

Each wrong table differs by only permutation swaps, without changing the initial GP29 language source or any printed-ciphertext symbol. **The correct total skip count survives all six perturbations**, and substantial pointer recovery remains even after 109/841 mappings are wrong; errors concentrate around locally ambiguous paths. These are six nested perturbations of **one** planted message, so they do not establish broad resilience across independently corrupted tables or the ability to initialize an unknown tableau from scratch. At 19 incorrect entries, 11,488/12,956 output glyphs are still correct. The CJS assertions freeze all six synthetic outcomes.

The missing challenge is therefore obtaining a tableau with sufficiently accurate entries in the first place. Agent4's oracle-path Hungarian solver recovers most plaintext *conditional on having the true pointer history*, but this alone does not provide the initial row mapping to this Viterbi. Alternating reconstruction merits a blinded test with explicit mapping accuracy and held-out plain, without presuming success on original LP2.

## Reconciliation with concurrently completed H2 studies

[Agent30's independent known-table/hidden-pointer Viterbi](lp2-h2-hidden-clock-viterbi-known-table-oracle.md) obtains **103,580/103,648 = 99.9344%** across eight independent whole-book plants, and its soft-constraint table-error refinement recovers **12,817/12,956 = 98.9271%** on a plant granted a **93%-accurate initial secret table**. Its blind, randomly initialized joint EM on a 4,000-rune plant **failed**; this earlier completed work supersedes repeating our proposed basic oracle-to-blind alternation. Our four-plant result is independent corroboration of the same mathematical constraint, without a unique algorithmic novelty claim.

[Agent38's more decisive source-native H2 original-IoC discriminator](lp2-h2-random-table-marginal-flatness-gate.md) shows that the independent-29!-random-table generator behind both positive plant families is **more nonuniform than original LP2** under its own native-language controls, even though adjacent-doublet counts fit. A **balanced cyclic/Latin row family** can reproduce the original alphabet flatness on some plants; no published first-party clue selects that restricted family. Thus the random-table H2 calibration positives are mechanism learnability controls, not evidence this original generator is right. Any new original-cipher lane should require a source-selected balanced row structure and a fully blind original-shaped positive before accepting this architecture.

## Next decisive experiment

The earlier [oracle-row-Hungarian calibration](lp2-h2-apostrophe-crib-oracle-identifiability.md) learns **97.2368%** of native-GP ciphertext plaintext after 12 sweeps with *the true key-row path supplied*. The inverse architectural test here learns **99.9614%** with *the true tableau supplied*. They show both halves are individually recoverable when granted the other's missing information; this does not guarantee a joint solver.

Given the above concurrent blind-EM failure and source-IoC exclusion, the next credible gate is **source-authenticated low-dimensional balanced tableau/key generation**, followed by a fully blind native-GP plant and an untouched 150-rune original-page prediction. An arbitrary random-table and floating pointer search has no current source-selected key and has already failed its source-native alphabet-flatness diagnostic. If the joint bootstrap cannot be initialized from an actual source clue, document that obstacle explicitly rather than optimizing a tableau or plaintext guesses against the real unknown LP2. The original LP2 key state and unknown plaintext remain undiscovered.
