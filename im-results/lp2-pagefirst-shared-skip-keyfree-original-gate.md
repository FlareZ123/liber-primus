# Every page's first rune rules against a common page-reset key with later collision skips

**Original-input, bounded all-secret test (Agent 9, 14 November 2026).** No LP2 plaintext, authentic key, or source-selected cipher has been recovered. The result eliminates one possible rescue of the previously weakly supported page-reset shared-pad family under an explicitly specified source-native English register, without fitting any secret key or choosing a plaintext.

## Causal mechanism and invariant

The original LP2 ciphertext has just **86 equal adjacent-rune pairs among 12,901 within-page transitions**. It is plausible that an additive/table-driven cipher rejects a tentative key element when it would repeat the previously emitted ciphertext rune, then consumes another element and tries again. Such **variable key consumption** defeats the usual fixed-offset inter-page pad-cancellation test, so negative evidence for page-reused fixed keys does not automatically cover it. The manuscript's original 256-entry numerical table provides a candidate key material source, although no first-party instruction specifies that consumer.

Here is a distinct necessary condition for **all** page-reset keystreams whose first actual emitted symbol uses the **same** secret, page-independent permutation `π` on the page's first plaintext rune:

```text
C[p,0] = π(P[p,0])
C[p,i] = arbitrary fully reversible key-skip encoder, i >= 1
```

Since `π` is bijective, `C[a,0] == C[b,0]` if and only if `P[a,0] == P[b,0]` for every pair of physical pages, regardless of the secret permutation, entire later keystream, variable skip counts, or any later collision-rejection policy. This holds for a common page-initial additive key `π(x)=x+K₀ mod29`, any page-initial affine permutation, and even an unrestricted secret 29-way first-position substitution. **The claim does not cover** an independently chosen page IV/starting offset, state carried across pages, per-page secret initial permutation, an alteration/deletion of the first rune, or arbitrary non-GP text.

Source scope is physical LP2 **pp0–55**, excluding number-only p50: exactly **55 original rune-bearing pages**, **12,956 original GP29 runes**, and `55×54/2 = 1,485` page-first pair comparisons. There are exactly **52 same-rune page-first pairs**, a rate of **0.0350168350**. A fixed secret substitution cannot change this.

## Exhaustive fixed-reference original-size comparison

To calibrate the possible native plaintext front page words, use the already independently verified solved-LP1/source-native English GP29 encoder, which reproduces all **181** original LP1 p10–13 plain words and p57's 95/95 authentic clear runes. Take the three existing, frozen preselected source files. At **every single contiguous** window of length 12,956 in each encoded file, partition the window into the **exact** 55 original physical page lengths, take the first rune in each partition, and count pairwise equal starts. Grant the native source an arbitrary fixed secret first-position permutation, which leaves this statistic unchanged.

| Source-native reference | GP29 runes | Complete exact-length windows | Minimum equal-start pairs | Mean pairs | Windows ≤ 52 original |
|---|---:|---:|---:|---:|---:|
| Shakespeare (first 300k bytes) | 217,106 | 204,151 | 50 | 88.627354 | 18 |
| Gibran, *The Prophet* | 62,492 | 49,537 | 50 | 89.174859 | 8 |
| Emerson essays | 321,327 | 308,372 | 49 | 91.535383 | 16 |
| **Total finite comparison** | | **562,060** | | | **42** |

The source-observed 52 is rare: **42/562,060 ≈ 0.0000747** of all selected source windows match or fall below the source. These windows heavily overlap and the register includes source and genre assumptions, so this is an **exact finite reference-class fraction**, not a frequentist independently replicated significance or universal mathematical impossibility. Non-English text with unusually broad initial rune coverage could evade it. Most native-source same-page-position comparisons have considerably more matches.

## Positive code and skip-architecture control

The [self-contained SFT](../sims/lp2_pagezero_shared_skip_first_rune_sft.cjs) uses the original GP29 corpus, existing independently calibrated native-English GP encoder and the literal original 32×8 table bytes. It asserts all source control sizes, enumerates **every** matching control window, and verifies that a completely secret first-position GP29 affine permutation preserves initial-pair count.

It also creates a **genuinely nonzero-skip, exactly invertible** native-English plant: 55 original-length pages from Shakespeare, one **common** page-reset start 7 in the canonical 256-value table; output `(P+table[j]) mod29`; at subsequent runes only, a repeat-collision attempt is skipped with a deterministic 81% threshold. The decoder uses the exact accepted key-state trace to recover all **12,956/12,956** source GP symbols; the trace serves as explicit side information for this synthetic control, not as a proposed original-LP2 decoder.

The Windows Node22 [manual run 43653342096](https://github.com/FlareZ123/liber-primus/actions/runs/43653342096) **passed**: 374 skipped key elements, 104 accepted adjacent repeats (confirming a nontrivial rejection mechanism rather than a zero-skip demonstration), maximum three rejected attempts at one rune. Plaintext, affine-secret-permuted starts and actual skip-generated ciphertext all have **91** page-initial matching pairs, exactly as the invariant requires.

## Cryptanalytic decision

The source strongly disfavors a **single shared page-start key or secret first-symbol bijection**, even when later stream positions are rekeyed by any number of attempted-collision skips. This closes one specific loophole in earlier page-offset shared-alphabet and original base60-grid keyskip work; it does not diagnose the true low-doublet mechanism, recover plaintext, or exclude a table whose page-start address depends on the printed page number. The next substantive experiment would require an **independent source selector for per-page initial state**, an authenticated continuation byte source, or a distinctly structured reversible encoder that explains why page starts are as flat as the interior without independent arbitrary keys.

### Related research

- [Original page-offset all-secret equality gate](lp2-pageoffset-allsecret-reuse-gate.md), which assumes the same page-local clock at *all* sites.
- [Original grid keyskip Viterbi](grid-keyskip-viterbi-20261110.md) and [pair-consuming skip variant](grid-keyskip2-pair-transition.md), whose multi-start candidate inverses do not recover original English.
- [Full original original-input synthetic-calibrated source orthography](../sims/lp2_native_gp_source_orthography_sft.cjs).
