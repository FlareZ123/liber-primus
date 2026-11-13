# Predecessor-exclusion rank cannot hide GP-English in fixed printed-word states

**Agent 38, 13 November 2026. Original-cipher test: conditional architectural rejection, with a fully reversible positive plant.** The original LP2 ciphertext contains no newly recovered plaintext, historical key or destination under this test. The numerical finding applies to a changing **ciphertext-predecessor** decoder with its own secret rank alphabet at each original page/word state. It is distinct from the direct-ciphertext position substitutions already tested in [the previous position-alphabet result](lp2-wordlength-position-allsecret-invariant.md) and from a single global or page-keyed predecessor ordering in [the original rank-capacity result](lp2-no-repeat-allorder-page-capacity.md).

## Human-visible premise and exact decoder family

The signed 2016 instruction singles out the manuscript's *words* and *numbers*. The original ciphertext has only 86 adjacent equal symbols across 12,901 same-page predecessor pairs, inviting the narrowly motivated **previous-rune exclusion** operation. GP rune order is public and canonical. At every original within-page nonrepeat position, rank the current GP rune from 0 to 27 among the **28 symbols other than the preceding ciphertext rune**:

`R_i=C_i−1[C_i>C_(i−1)]`.

There is no key in this reduction. For a complete reversible hypothetical cipher, grant the decoder a **completely arbitrary secret bijection** from these 28 rank values to 28 plaintext GP runes. Make the secret table independent at any of three source-visible state resolutions: (a) complete printed word length `L`; (b) `(L,position)`; (c) **`(physical page,L,position)`**, including a separate table for each of 55 rune-bearing pages. Page-initial 55 positions and all 86 same-page repeats are treated as **141 unrestricted exceptions** that can carry arbitrary plaintext through an additional unknown mechanism. This is unusually generous to the candidate: the test does not insist that those sites encode one fixed reserved letter.

A hypothesized rank-to-plaintext bijection can rename the 28 values within each bucket, but **must preserve the bucket's count of equal-symbol pairs**, regardless of the number or contents of secret tables. For each bucket `b`, let `n[b,r]` count rank value `r` among the source-eligible positions. The exact all-secret invariant is

`Q = sum_b sum_r n[b,r]*(n[b,r]-1) / sum_b n[b]*(n[b]-1)`.

The condition is necessary for native GP-English plaintext sharing the original visible word lengths and word positions. A key changing *between words in the same bucket*, secret homophonic output decoding, a second nonlinear layer, a different plaintext register, or changed word boundaries lies outside this model.

## Exact untouched LP2 and matched-language results

The original 12,956-runic unknown ciphertext is read from `resources/liber-primus/lp2-corpus.json` and independently matched against all **2,896 complete source words** in the original rune transcription; line and physical-page wraps never create artificial word breaks. The zero-rune p50 is retained as a physical-page identity with no events. The original 12,815 eligible ranks and 141 unrestricted locations are never fitted to a proposed English plaintext.

| Secret predecessor-rank table identity | Distinct populated tables | Equal ordered pairs | Eligible ordered pairs | Original `Q` |
| --- | ---: | ---: | ---: | ---: |
| Word length | 14 | 675,130 | 18,903,834 | **0.03571392** |
| Word length and position | 105 | 157,450 | 4,415,902 | **0.03565523** |
| Page, word length and position | **3,017** | 2,900 | 83,190 | **0.03485996** |

The three source-register English controls are Shakespeare, Gibran and Emerson, using the repository's pinned text files. Every word is GP29 encoded with the attested `ING` and `IO` contractions and the stated historical spelling folds, including `J→I` in the 28-letter positive-control register. For each author, the test samples **100** complete 2,896-word plaintexts with exactly the original printed word-length sequence, page placement, word positions and the same 141 excluded original site identities. Each source word comes from a pool of real words of precisely the required rune length. Fixed xorshift32 seeds `0x330100`, `0x330101` and `0x330102` drive the word sampling.

| Source | Minimum `Q` for length | Minimum `Q` for length + position | Minimum `Q` for page + length + position |
| --- | ---: | ---: | ---: |
| Original unknown LP2 | **0.035714** | **0.035655** | **0.034860** |
| Shakespeare, 100 controls | 0.064728 | 0.109204 | 0.107753 |
| Gibran, 100 controls | 0.067350 | 0.116670 | 0.115759 |
| Emerson, 100 controls | 0.066103 | 0.107376 | 0.105854 |

The gap persists despite giving the page-dependent model **3,017 independent arbitrary rank alphabets** and conditioning every source sample on the full original word length/position design. None of these 300 English controls is compatible with the original equality-pair invariant, even before recovering any key. The sample minima are conditional finite-corpus comparisons, not p-values for all English prose or a theorem about all potential LP2 plaintext languages.

### Reversible planted positive, with the original exception geometry

An independent GP-English planted passage follows all 2,896 original word-length slots. Every original page-first site becomes a public initial rune; all 86 original repeat positions become a same-predecessor marker. On each of the remaining **12,815** positions, independent seeded secret 28-rank alphabets are keyed by `(page,L,position)`. Encryption uses `C_i = rank + 1[rank >= C_(i-1)]`. The decoder recovers **12,815 / 12,815** planted content GP runes, and all 12,956 planted plaintext entries including the explicit marker/IV convention round-trip. The exact pair-invariant numerator agrees between plaintext and encoded rank stream (**9,370** pairs). Thus the original failure is a consequence of the manuscript's symbol statistics under this complete family, not a broken inverse.

## New exact hidden-state lower bound: two alphabets per word coordinate still fail

The stationary table case above grants one arbitrary secret 28-way alphabet per source-visible state. A stronger model lets **each occurrence** choose one of **two entirely independently secret rank alphabets** at that state, including a potentially adversarial hidden one-bit mode. The choice can vary arbitrarily across words, and the proposed plaintext may distribute each letter's occurrences optimally between modes. This is a meaningful relaxation of fixed-key word-coordinate tables, though there is still no original-source hint selecting the hidden bit.

A necessary pair-count floor can be derived **without choosing either key or any mode assignment**. If plaintext rune `p` occurs `n` times in the same visible bucket and the decoder has at most `K` secret 28-way permutations, those `n` instances can encode at most `K` different ciphertext-rank identities. The minimal ordered equal-rank-pair count contributed by this letter is attained by dividing `n=aK+b` occurrences as evenly as possible across the K ranks:

`E_min(n,K) = K*a*(a-1) + 2*a*b`, with `a=floor(n/K)`, `b=n mod K`.

Summing over every plaintext letter and visible bucket produces a **safe lower bound**. It deliberately ignores additional collisions when two distinct plaintext runes use the same ciphertext rank, so it strongly favors the proposed cipher. Apply this bound to exactly the same **300 source-locked length-matched GP-English plants**, the same original 12,815 nonrepeat positions and the same 141 free exception sites used above:

| Word-state setting | Original equal ordered rank pairs | Shakespeare minimum with 2 hidden modes | Gibran minimum | Emerson minimum |
| --- | ---: | ---: | ---: | ---: |
| **Whole-book (L, position)** | **157,450** | **235,056** | **251,524** | **231,040** |
| Independently keyed (page, L, position) | **2,900** | 2,078 | 2,378 | 2,072 |

**New decision:** the actual ciphertext cannot encode any of the 300 matched source-native controls with a whole-book `(L,position)` predecessor-exclusion decoder, **even if each visible state secretly switches between two completely arbitrary independently keyed 28-symbol alphabets at will**. This is stronger than the earlier single-state permutation test and is an exact necessary capacity inequality for each sampled control. An alphabet family with three or more hidden modes, a per-page hidden two-mode alphabet, and a continuously evolving state remain logically possible. The per-page row demonstrates that **the same two-mode inequality is insufficient to exclude** the more flexible page-local model: its lower bound lies below the original collision count. No original key or ciphertext inversion follows from this capacity calculation.

The existing single runnable SFT computes each floor directly from the genuine GP source words, checks the exact inequality, and preserves the full rank cipher planted inverse. See [expanded manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/43421902000).

## Research decision

This closes **one source-constrained dynamic-rank family** that survives ordinary static-letter substitution tests: even independently secret rank alphabets for every physical page and printed `(word length,within-word position)` cannot reproduce the tested GP-English register if these alphabets are reused at their visible states. The original word-length-only and position variants are stronger exclusions within that same family. The result does not imply that true LP2 prose must be English, that all predecessor-exclusion systems fail, or that the manuscript was encoded by any such mechanism.

A positive next route must supply an authentic operator or source-derived key that changes a rank mapping **between different words sharing the same page/length/position state**, recover an independent unknown-cipher interval, or obtain a genuine external key. Simply increasing the number of stationary secret alphabets at the already tested source positions cannot overcome this evidence. The original manuscript's near-uniform conditional ranks are consistent with stronger changing-key encryption or an intermediate high-entropy register, but do not uniquely identify either.

**Reproduction:** [Node.js 22 CommonJS SFT](../sims/lp2_predecessor_rank_wordstate_allsecret_sft.cjs) using only the committed original GP corpus, rune transcription and three pinned literary controls. [Successful original-source and planted-positive GitHub Actions run 43419047880](https://github.com/FlareZ123/liber-primus/actions/runs/43419047880), through the existing manual-only Agent 38 workflow. No transcript or original image was modified.
