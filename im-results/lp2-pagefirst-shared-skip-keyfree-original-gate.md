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

## The original table's first 56 cells as page-specific initial nonces

The shared-first-symbol invariant does **not** automatically exclude a page-dependent first-key offset. A specific visible source candidate for such an offset is the **256-byte p49–51 numeric table**. Freeze the simple page-address rule before ciphertext measurement: for physical rune-bearing page `p` in 0–55, use the original row-major table byte `B[p]`; the runeless physical p50 retains its address, and the nonce is `B[p] mod29`. A cipher whose initial output is `C[p,0] = P[p,0] + B[p] + K₀ (mod29)`, with one unknown **common** `K₀`, becomes a shared-secret additive first-key model when `B[p]` is subtracted from each original initial ciphertext symbol.

This is source-grounded as an *operand* and page-index hypothesis, but the manuscript does not say to address its table by physical page, use byte modulo29, or begin there. It is a bounded test rather than an authenticated author instruction. The original corrected 55 page initials have **51/1,485 equal pairs**, compared with **52/1,485** uncorrected. The same fixed source-native English reference windows are eligible, because every ciphertext correction would leave all equality structure of the unknown native plaintext unchanged once the nonce was removed:

| Source-native reference | Exact-length windows | Windows ≤ 51 |
|---|---:|---:|
| Shakespeare | 204,151 | **10** |
| Gibran | 49,537 | **3** |
| Emerson | 308,372 | **14** |
| **Total finite reference** | **562,060** | **27** |

Thus the exact page-indexed, row-major `B[p] mod29` initial nonce **fails to rescue** a shared first-position additive key under these English source controls. The native-reference finite fraction is **27/562,060 ≈ 0.0000480**. It is source-conditional and based on overlapping windows, not a universal probability that this source clue is accidental. This result covers neither arbitrary independent nonces nor other cipher architectures; the table's intended role remains unknown.

The extended [original-input SFT](../sims/lp2_pagezero_shared_skip_first_rune_sft.cjs) also applies these genuine table-derived nonces to every **synthetic** first ciphertext symbol after the seeded shared-key/variable-skip encoder. It then subtracts the exact corresponding physical-page nonce, recovering all **91** plant first-position equality pairs with a perfect symbol-by-symbol source-state check. This table-nonce extension passed the independent [Windows Node22 workflow run 43655607618](https://github.com/FlareZ123/liber-primus/actions/runs/43655607618).

## Positive code and skip-architecture control

The [self-contained SFT](../sims/lp2_pagezero_shared_skip_first_rune_sft.cjs) uses the original GP29 corpus, existing independently calibrated native-English GP encoder and the literal original 32×8 table bytes. It asserts all source control sizes, enumerates **every** matching control window, and verifies that a completely secret first-position GP29 affine permutation preserves initial-pair count.

It also creates a **genuinely nonzero-skip, exactly invertible** native-English plant: 55 original-length pages from Shakespeare, one **common** page-reset start 7 in the canonical 256-value table; output `(P+table[j]) mod29`; at subsequent runes only, a repeat-collision attempt is skipped with a deterministic 81% threshold. The decoder uses the exact accepted key-state trace to recover all **12,956/12,956** source GP symbols; the trace serves as explicit side information for this synthetic control, not as a proposed original-LP2 decoder.

The Windows Node22 [manual run 43653342096](https://github.com/FlareZ123/liber-primus/actions/runs/43653342096) **passed**: 374 skipped key elements, 104 accepted adjacent repeats (confirming a nontrivial rejection mechanism rather than a zero-skip demonstration), maximum three rejected attempts at one rune. Plaintext, affine-secret-permuted starts and actual skip-generated ciphertext all have **91** page-initial matching pairs, exactly as the invariant requires.

## Cryptanalytic decision

The source strongly disfavors a **single shared page-start key or secret first-symbol bijection**, even when later stream positions are rekeyed by any number of attempted-collision skips. This closes one specific loophole in earlier page-offset shared-alphabet and original base60-grid keyskip work and additionally rejects **the fixed row-major first-56 table-byte physical-page nonce** as a rescue of a shared initial additive key. It does not diagnose the true low-doublet mechanism, recover plaintext, or exclude other independently source-selected page-state schedules. The next substantive experiment would require an **independent source selector for per-page initial state**, an authenticated continuation byte source, or a distinctly structured reversible encoder that explains why page starts are as flat as the interior without independent arbitrary keys.

### Related research

- [Original page-offset all-secret equality gate](lp2-pageoffset-allsecret-reuse-gate.md), which assumes the same page-local clock at *all* sites.
- [Original grid keyskip Viterbi](grid-keyskip-viterbi-20261110.md) and [pair-consuming skip variant](grid-keyskip2-pair-transition.md), whose multi-start candidate inverses do not recover original English.
- [Full original original-input synthetic-calibrated source orthography](../sims/lp2_native_gp_source_orthography_sft.cjs).
