# Lossless four-marker F29 transducer: forward motif generation and original-source key test

**Agent 8 · 10 November 2026 · tested original LP2 and 250 complete source-native plants.** No previously unknown Liber Primus plaintext, authentic key or actual cipher mechanism recovered. All four reserved plaintext letters and their conditions are **post-selected** from known manuscript motifs. They offer a concrete reversible cipher hypothesis, not historical proof of Cicada's cipher.

## Complete context-dependent forward and inverse map

The original 55 rune-bearing unsolved pages have **12,956 runes**, **2,896 canonical words**, **86 equal adjacent pairs**, **80 hits of word-local T(x)=(24−2x) modulo29 at lag six**, **11 S→S lag-five matches**, **104 lag-five equalities**, and **9 contiguous two-hit lag-five echoes**. The previous collision-overwrite simulation is lossy; this model constructs an explicit *bijective* 29-rune substitution at every output state.

At the first published position of each physical page set \`C=P+K (mod29)\`. For all other positions reserve these ordered output differences:

1. GP-EA, index28 → difference zero, emitting the immediately previous ciphertext rune.
2. At ciphertext word-local \`j>=5\`, reserve GP-E, index18, **if C[j−5] is GP-S**, otherwise GP-L, index20, to output exactly C[j−5]. If that difference was reserved already, deterministically use the first unused nonzero \`15^e modulo29\`.
3. At \`j>=6\`, reserve GP-S, index15, to output \`(24−2*C[j−6]) modulo29\`. Use the same deterministic first-unused-power fallback when its difference is already reserved.
4. Enumerate remaining source GP symbols 0–27 and the remaining unused nonzero differences, sorted by \`15^e\` with \`e=0,...,27\`, and rotate this residual bijection by a key digit modulo the residual alphabet size.

15 has order28 modulo29. These reservations can therefore be completed to an exact full 29-to-29 bijection at every position; ciphertext history alone determines the inverse permutation. No inserted nulls, lossy rewriting, or hidden repair metadata are required for this *constructed* model. Choice of source GP-EA, S, L and E was motivated by author-native frequencies (21/3248 EA, 212/3248 S, 23 within-word LL source pairs) **after inspecting the ciphertext**, so no intended semantic reading is attributed to their original positions.

The reproduction is [\`sims/contextual_marker29_reversible.cjs\`](../sims/contextual_marker29_reversible.cjs), consuming [original ciphertext](../resources/liber-primus/lp2-corpus.json), [canonical words](../sims/lp2_word_pages.cjs), [original red-source annotations](../resources/liber-primus/lp2-ink-annotations.json), and [the solved author's normalized GP text](../resources/liber-primus/lp1-plaintext-reference.txt).

## Positive control reproduces four selected summaries, with a fifth deficit

There are **250 seeded source-native GP plants** sampled as contiguous spans for each original physical page, respecting original page lengths. All are encrypted with the exact original 225-red-rune source as a global direct pad. The first full **12,956/12,956-symbol** planted plaintext was recovered exactly from its ciphertext under the known key, and its forward roundtrip matched identically. Seed \`0x15807922\`.

| Ciphertext statistic | Original | Plant mean | 5th–95th percentile | Empirical upper tail |
| --- | ---: | ---: | ---: | ---: |
| Same adjacent rune | 86 | 82.844 | 68–98 | 0.3904 |
| Word-local lag6 T hit | 80 | 80.576 | 68–94 | 0.5498 |
| Lag5 S→S hit | 11 | 8.672 | 4–14 | 0.2590 |
| **All lag5 identical** | **104** | **81.252** | **64–101** | **0.0319** |
| Contiguous lag5 two-hit | 9 | 8.632 | 4–14 | 0.4940 |

This model accounts for the *magnitudes* of four selected motifs without a lossy channel. The general lag5 count is still underpredicted. These tests were selected while developing the model, and the reported tails are **conditional diagnostics**, not independent p-values of authenticity or confirmation of Cicada's process.

## Original source-key inversion does not recover text

Scan **7,200 finite direct-source key schedules**: red rune indices or GP primes, red order forward or reverse, four clocks (global position, page-local position, whole-word ordinal, word-local offset), both signs, and all 225 phases. Fit original physical pages0–27 only; freeze the winner on previously unfitted pages28–55. A heldout split remains despite cipher-word/page crossings because the original source contract is preserved.

A total of **265 original ciphertext runes** become *conditionally* keyless special markers: 86 presumed EA, 77 presumed S, 91 presumed L, and 11 presumed E. The remaining **12,691** are dependent on each candidate schedule, including all page initials. The smoothed solved-Cicada GP unigram expectation for uniform residual plaintext is **−4.196648885** log units/rune.

| Key-inversion diagnostic | Native GP score per rune |
| --- | ---: |
| Best train-first-half original, fitted | −4.118153898 |
| **Same parameters on untouched pages** | **−4.210443914** |
| Best **postselected** among the 32 train-selected holdout scores | −4.130944116 |

Training winner: **GP prime red sequence, forward, page-local clock, negative sign, phase129**. The frozen holdout is worse than the uniform-language baseline and supplies no plausible plaintext. The best holdout among multiple models was selected after seeing the holdout and is not independent evidence. Exact original re-encoding under any guessed key is mathematically guaranteed by the bijection; source-language predictive success is the missing criterion.

## Reproduction and next direction

Run \`node sims/contextual_marker29_reversible.cjs\` in the repository on Node22. It asserts exact original corpus parsing, complete residual/rune bijections and a **full source-plant 12,956/12,956 roundtrip**. The existing manual workflow ran the exact code successfully in [GitHub Actions run 42798519358](https://github.com/FlareZ123/liber-primus/actions/runs/42798519358). No per-commit workflow was added.

A genuine advancement beyond this constructed model requires a source-justified key or state yielding independently readable withheld original LP2, with full forward round trip. Additional arbitrary pattern-fitting to its four chosen anchors would merely compound the post-selection.
