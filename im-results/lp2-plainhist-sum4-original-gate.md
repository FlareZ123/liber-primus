# Four-plaintext-sum GP29 history cipher: original-input invariant and affine inverse

**Agent37, 23 November 2026; issue [#2373](https://github.com/FlareZ123/liber-primus/issues/2373).** This is a bounded cryptanalytic experiment on **12,956 unchanged original LP2 unknown runes in 2,896 actual complete words, including 32 cross-page words**. It develops an exact new all-key necessary condition for a four-plaintext-history **sum-state** transducer and exhausts a historically simple affine subfamily against original pp16–21 and withheld pp40–53. **No new unknown-page plaintext, original key, selected decoder, or destination is recovered. A stronger terminal-output invariant now excludes the stated shared stationary four-history model for all tested ordinary native-GP English control manuscripts, regardless of secret row keys.** This is a finite source-language exclusion, not a theorem about every conceivable plaintext.

## Original-motivated target and its strongest rival

The proposed shared-state cipher is

```
s_i = (P[i-1] + P[i-2] + P[i-3] + P[i-4]) mod 29
C_i = A[s_i][P_i]
```

Every `A[s]` is an otherwise arbitrary *independent GP29 alphabet permutation*, with all 29 rows shared across original sections; decoding uses the known encrypted rune and previously decoded plaintext. This changes its cipher alphabet at each position while preserving printed word lengths. A page or book IV can be fixed, but the exact original-cipher necessary condition below avoids any IV assumption by using only within-word six-rune windows. The model is **exploratory**: the manuscript does not explicitly select the four-rune sum, and the p15 4×4 mathematical artwork is not authorization for the rule. A high-entropy external key, changing spaces, different plaintext register, or longer history is an independent rival.

The earlier [general plaintext-history theorem](lp2-plainprev-shortmemory-suffix-collision-gate.md) excludes stationary one-to-three-full-predecessor lookups under a **two-cipher-output suffix** test; some four-history controls comply with that weaker statistic. The new **three-/four-output suffix** test below repairs that material gap for the tested ordinary native-GP text register, independently of any sum-state assumption.

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

The **final-six** variant is unexpectedly stronger than summing all windows: aggregating arbitrary interior output-pairs increases original ciphertext collision capacity faster than it increases some native signature repeats. The 10 Emerson page-private controls passing the **two-cipher-output** sum-state bound show why that isolated bound is insufficient. The stronger **three-/four-output** terminal theorem below removes the corresponding shared-book-key native-control escape without claiming impossibility for every plaintext. Even failure in all 128 Shakespeare/Gibran samples is a **finite original-native-register comparison**, not a logical impossibility for all English or artificial plaintext. Full 29×29 native forward plants satisfy both inequalities and reproduce their ciphertext exactly.

## Decisive longer-output word-suffix bound: stationary history four through seven

**Exact original-cipher source fact:** Among all complete original printed LP2 words with at least **eight** runes, **no two words end in the same four ciphertext runes** (zero unordered equal-ending pairs). There are only **four** matching last-three-ciphertext-rune pairs among words of at least seven runes: four distinct duplicate triplets `G.H.C`, `EA.A.IA`, `IA.W.L`, and `EA.NG.W`, one pair each.

For **any** deterministic stationary plaintext-history encoder of memory `m`, `C_i=F(P_{i-m},...,P_i)`, identical final **`m+n` plaintext runes** in two complete words force identical final **`n` ciphertext runes**, independently of every secret lookup-table entry. The first `m` symbols of each word, all four-rune IVs, word beginnings, and all other positions may be entirely unknown. This is a *strict stronger use* of the previously published plain-history equality implication, which counted only two ciphertext symbols. A single common book-global table is required for comparisons across the manuscript; for separately secret page-local tables the inequality is applied within each physical page.

For the #2373 **memory four** rule, setting `n=4` means two plaintext words of at least length8 ending in the same eight GP runes would have to share the same last four cipher runes. Because the actual source has **zero** such ciphertext pairs, there must be **zero** repeated eight-GP-rune plaintext suffixes in this register. Across **128** independent original-exact-wordlength native-GP English control manuscripts per source, the *minimum* count of repeated eight-plaintext endings is **372 Shakespeare / 239 Gibran / 32 Emerson**. Thus **384/384** control manuscripts violate the zero-capacity invariant, for **every possible** set of the 29 secret GP29 row permutations. Even the more permissive plain-m4 `n=3` test gives an original four-pair capacity against **at least** 90 repeated seven-GP-native suffix pairs in the Emerson controls (and hundreds in the other two sources).

This argument **does not depend on the special four-symbol sum-state**: it applies to *every* deterministic stationary book-global plaintext-history lookup `F` with memory four, including fully nonlinear `29^5` tables. Extending the same terminal-three-output necessity to **memory five, six, and seven** gives original ciphertext triplet-pair capacity **zero** for complete words long enough to carry the required history; the same **384/384** independent original-wordlength controls violate it at each of those memories. At memory eight some Emerson controls obey the tested bound, so **do not extrapolate** this exclusion indiscriminately beyond seven predecessors. The more liberal page-private model also has original zero C-four-ending collisions, but some Emerson native controls can evade its separate localized constraints, so this is **not** an all-plaintext/all-key universal rejection.

These are key-independent, finite **native-GP prose-register** exclusions under the authentic *unchanged* original printed word boundaries. They do **not** prove that no possible English text, atypically low-repetition prose, changed/hidden word segmentation, output-side clock, changing table inside a word, or different symbol encoding could fit. An unselected arbitrary four-history table does not become a solution merely because such alternatives remain mathematically possible. The result is a **decisive negative against treating #2373's shared stationary history-four model as the direct original decoder for ordinary source-native GP English**. It supersedes the earlier incomplete inference that history four was a promising escape solely because the *two-output* word-tail test admitted 8/64 Emerson page-private samples.

## Exact key/letter gauge: 812 equivalent parametrizations unless the plaintext spelling is fixed

The sum-state model has a **predictable full affine alphabet symmetry** useful for normalizing any future blind joint optimizer. For every `u∈GF(29)^×` and `v∈GF(29)`, set `P'_i=u P_i+v`, so `s'_i=u s_i+4v`, and redefine every secret row by

```
A'[s'][p'] = A[(s' - 4*v) * u^-1 mod29][(p' - v) * u^-1 mod29].
```

This changes neither `C_i` nor any plaintext word boundary, and every transformed row remains a true bijection. It is therefore an exact **29×28 = 812-element family** of cipher/key/hidden-plain-coordinate-equivalent solutions when the initial four plaintext state symbols may transform to `v`. If the cipher requires a publicly fixed **zero** plaintext IV, only the **28 pure-scaling transforms** (`v=0`) preserve that IV without changing the protocol. Natural GP29-English spelling/known plaintext can break this symmetry by fixing a coordinate frame; ciphertext plus word boundaries alone cannot. The single-file SFT constructs 25 separate nontrivial affine gauges on a complete 12,956-rune native planted manuscript and asserts identical ciphertext and 29! row validity under the transformed IV. Recovering a blind key should measure performance **up to this affine gauge** before asking whether the recovered text has its intended GP-native spelling; this prevents treating mathematically equivalent keys as optimizer failures.

## Complete original-cipher test of a tractable reversible subfamily

The affine-row subfamily `A[s][p] = (p + a*s + b) mod 29` is an exactly invertible, low-dimensional special case, with `a,b ∈ {0,..,28}`. Both source-visible reset choices are frozen: **one global zero four-rune IV**, or **a new zero four-rune IV at each physical page start**. All 841 keys are exhausted separately under each policy, no fitted page-private coefficients. Every original rune is decrypted sequentially by induction, then scored on original training pp16–21; untouched pp40–53 remains an independent original source check.

| IV policy | Complete keys | Highest pp16–21 GP29 IoC, original | pp40–53 IoC under top training key | Any of 841 train/holdout IoC ≥0.05? |
|---|---:|---:|---:|---|
| Global four-rune IV | 841 | **0.03517404** at (a,b)=(21,25) | 0.03446701 | No |
| New IV each physical page | 841 | **0.03509482** at (8,18) | 0.03433146 | No |

The same 841-key search is run *blind* against three synthetic planted native-prose objects generated by encrypting **all 12,956 runes of original-length-matched GP-native English words**, preserving every actual printed word length and original physical-page rune count. Each blind search ranks the unknown true key highest: `(3,19)` globally, `(17,4)` page-local, and `(26,23)` globally. Exact inverse and forward re-encryption reproduce all three plants. The original scores are indistinguishable from near-uniform random GP29 and cannot meet the calibrations; **reject only this two-parameter affine-row model with those two IV policies** as direct ordinary GP-native prose.

## Decision for #2373 and next actual decipherment test

This investigation provides a **genuine key-independent exclusion for the stated globally shared four-plaintext-history model against all 384 frozen source-native GP-English word-length controls**. Crucially, the stronger proof no longer assumes a sum-state index: it covers **any** stationary four-predecessor lookup. The computationally easy affine row family is also decisively negative with authentic original-cipher inversion and calibrated native plants, while exact row-key gauge symmetries are documented for future decoding. **Issue #2373 can close as a bounded original-cipher negative; investing in a blind 29-row optimizer is not justified for this native-register mechanism without independent first-party key/clock evidence.** A blind optimizer that succeeded on synthetic English would not overturn the incompatible original terminal-word collision capacity.

The remaining open decipherment routes are genuinely different: a within-word output clock or key update, nonlocal movement or altered printed segmentation, nonnative plaintext, or a source-selected historical operation not covered by stationary preceding-plaintext lookup. The report makes **no categorical impossibility claim** for such models or for arbitrarily nonrepetitive English; no unknown plaintext was recovered.

**Reproduction:** [Single-file read-only Node22 SFT](../sims/lp2_plainhist_sum4_original_gate_sft.cjs), run under existing `manual-readonly-commonjs-sft.yml` with input `sims/lp2_plainhist_sum4_original_gate_sft.cjs`. The script asserts canonical word counts and original source identity, its exact all-key capacities, native GP spelling controls, positive full-row permutation consistency, all 1,682 affine original inverses, and three blind native-row-affine key searches. Full output lists minima/maxima and complete seed-conditioned trial statistics.
