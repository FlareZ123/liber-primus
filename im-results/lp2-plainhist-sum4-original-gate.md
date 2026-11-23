# Four-plaintext-sum GP29 history cipher: original-input invariant and affine inverse

**Agent37, 23 November 2026; issue [#2373](https://github.com/FlareZ123/liber-primus/issues/2373).** This is a bounded cryptanalytic experiment on **12,956 unchanged original LP2 unknown runes in 2,896 actual complete words, including 32 cross-page words**. It develops an exact new all-key necessary condition for a four-plaintext-history **sum-state** transducer and exhausts a historically simple affine subfamily against original pp16–21 and withheld pp40–53. **No new unknown-page plaintext, original key, selected decoder, or destination is recovered. The arbitrary-permutation sum-state family is still open.**

## Original-motivated target and its strongest rival

The proposed shared-state cipher is

```
s_i = (P[i-1] + P[i-2] + P[i-3] + P[i-4]) mod 29
C_i = A[s_i][P_i]
```

Every `A[s]` is an otherwise arbitrary *independent GP29 alphabet permutation*, with all 29 rows shared across original sections; decoding uses the known encrypted rune and previously decoded plaintext. This changes its cipher alphabet at each position while preserving printed word lengths. A page or book IV can be fixed, but the exact original-cipher necessary condition below avoids any IV assumption by using only within-word six-rune windows. The model is **exploratory**: the manuscript does not explicitly select the four-rune sum, and the p15 4×4 mathematical artwork is not authorization for the rule. A high-entropy external key, changing spaces, different plaintext register, or longer history is an independent rival.

The earlier [general plaintext-history theorem](lp2-plainprev-shortmemory-suffix-collision-gate.md) excludes stationary one-to-three-full-predecessor lookups on sampled source-native English, but permits some four-history controls. Its m4 source-word six-suffix condition uses all six previous rune values as a tuple and does **not** exploit the sum-state degeneracy tested here.

## New exact all-key signature theorem

For any fully contained six-plaintext-rune window `(a,b,c,d,e,f)` in an original complete word:

- The output on `e` is `A[(a+b+c+d) mod29][e]`.
- The next output on `f` is `A[(b+c+d+e) mod29][f]`.
- Therefore the **four-component signature** `(a, (b+c+d) mod29, e, f)` completely determines the two corresponding ciphertext runes, for *every choice of every 29! row key*.

If two eligible original word endings/windows share this signature, their final **two ciphertext values must be equal**. For each allowed shared-key scope, count the unordered equal-signature plaintext-window pairs `S_P` and unordered equal-two-rune original-cipher window pairs `E_C`; the exact necessary inequality is `S_P <= E_C`. This holds for arbitrary unknown row permutations (even deterministic noninjective lookups), and for arbitrary page-initial state because a six-rune window has four plaintext predecessors before each of its last two runes. Retaining literal 2014 printed words is a necessary premise; a space-changing cipher escapes.

Original source capacities, verified by parsing `resources/lp2-transcription.txt` and independently matching `resources/liber-primus/lp2-corpus.json`:

| Six-rune scope | Global `E_C` | Nine original chapters `E_C` | Private physical-page `E_C` |
|---|---:|---:|---:|
| Only final six runes of each word | 389 | 35 | 2 |
| **Every contiguous within-word six-rune window** | 2,652 | 333 | 43 |

The latter counts respectively sample **2,105 / 2,044 / 2,044 original windows** (page-crossing words discarded in chapter/page scopes). Page-private output keys are strictly more permissive than the issue's single global table; their bound is a useful adversarial check.

## Genuine original-word-length native language controls

The reproducible script encodes actual words of Shakespeare, Gibran, and Emerson with the known solved-LP1 GP29 spelling conventions (including `ING`, `IO`), then samples original-exact rune-word-length slots from entire intact English source words, 128 deterministic trials per source. It does not construct pseudo-words or move original page/word boundaries. For each trial, test the condition separately in every scope. The entries are **count of trials (of 128) whose `S_P` exceeds the original `E_C`**, and minimum native `S_P`:

| Source | Final-six global | Final-six chapter | Final-six page | All-windows global | All-windows chapter | All-windows page |
|---|---:|---:|---:|---:|---:|---:|
| Shakespeare | 128 (min685) | 128 (min75) | 128 (min6) | 113 (min2348) | 91 (min244) | 99 (min20) |
| Gibran | 128 (min738) | 128 (min81) | 128 (min8) | 106 (min2203) | 98 (min244) | 99 (min25) |
| Emerson | 25 (min223) | 107 (min25) | **118 (min0)** | 0 (min672) | 0 (min70) | 0 (min3) |

The **final-six** variant is unexpectedly stronger than summing all windows: aggregating arbitrary interior output-pairs increases original ciphertext collision capacity faster than it increases some native signature repeats. The 10 Emerson page-private controls passing the final-six bound are genuine witnesses against an indiscriminate 'all four-history tables are impossible' claim. Even failure in all 128 Shakespeare/Gibran samples is a **finite original-native-register comparison**, not a logical impossibility for all English or artificial plaintext. Full 29×29 native forward plants satisfy both inequalities and reproduce their ciphertext exactly.

## Complete original-cipher test of a tractable reversible subfamily

The affine-row subfamily `A[s][p] = (p + a*s + b) mod 29` is an exactly invertible, low-dimensional special case, with `a,b ∈ {0,..,28}`. Both source-visible reset choices are frozen: **one global zero four-rune IV**, or **a new zero four-rune IV at each physical page start**. All 841 keys are exhausted separately under each policy, no fitted page-private coefficients. Every original rune is decrypted sequentially by induction, then scored on original training pp16–21; untouched pp40–53 remains an independent original source check.

| IV policy | Complete keys | Highest pp16–21 GP29 IoC, original | pp40–53 IoC under top training key | Any of 841 train/holdout IoC ≥0.05? |
|---|---:|---:|---:|---|
| Global four-rune IV | 841 | **0.03517404** at (a,b)=(21,25) | 0.03446701 | No |
| New IV each physical page | 841 | **0.03509482** at (8,18) | 0.03433146 | No |

The same 841-key search is run *blind* against three synthetic planted native-prose objects generated by encrypting **all 12,956 runes of original-length-matched GP-native English words**, preserving every actual printed word length and original physical-page rune count. Each blind search ranks the unknown true key highest: `(3,19)` globally, `(17,4)` page-local, and `(26,23)` globally. Exact inverse and forward re-encryption reproduce all three plants. The original scores are indistinguishable from near-uniform random GP29 and cannot meet the calibrations; **reject only this two-parameter affine-row model with those two IV policies** as direct ordinary GP-native prose.

## Decision for #2373 and next actual decipherment test

The arbitrary shared 29-row table remains possible on these inequalities, because **the source-native Emerson page-private controls include compliant witnesses**, while the arbitrary secret row structure lies outside the 841 affine keys. Neither this theorem nor a synthetic round-trip is a recovered original key or a genuine plaintext.

The remaining useful research decision is the issue's hard task: implement a genuine ciphertext-only joint **29 row-permutation key plus plaintext** inference algorithm, train and test it *blind* on three independently keyed fully native original-word-length plants and an untouched ≥300-rune window. Only if a plant can be recovered should the same learned key/state be fitted to original pp16–21 and locked for p40–53. A failed solver is an **optimizer limitation**, not a cipher exclusion; an original p15 or authentic 2014 rule selecting a different operation would supersede this speculative family.

**Reproduction:** [Single-file read-only Node22 SFT](../sims/lp2_plainhist_sum4_original_gate_sft.cjs), run under existing `manual-readonly-commonjs-sft.yml` with input `sims/lp2_plainhist_sum4_original_gate_sft.cjs`. The script asserts canonical word counts and original source identity, its exact all-key capacities, native GP spelling controls, positive full-row permutation consistency, all 1,682 affine original inverses, and three blind native-row-affine key searches. Full output lists minima/maxima and complete seed-conditioned trial statistics.
