# T7 four-repeat span and p15 3298: corrected source-conditioned test

**Current decision (Critic, 18 November 2026):** The numerical equality `3298 = 2 × 1649` is exact, but the original claim that a 1,649-rune three-gap span is extraordinary depends on a noncomparable null. After preserving the original source's rarity of adjacent repeats, the *span itself* is ordinary. The p15 equality remains a post-selected structural coincidence without a typed operation, key or unknown-page plaintext.

## Unchanged original observation

The canonical LP2 p0–55 ciphertext has 12,956 runes and **86 within-page adjacent-equal sites**. Of its 83 consecutive four-event groups, the widest lies at global rune sites **2740, 3140, 3852, 4389**, with gaps **400, 712, 537**, span **1649** and midpoint **3564.5**. The source-visible p15 4×4 square includes **3298**, and `3298 = 2 × 1649`. Its highlighted **3299** also satisfies `3299 = 2 × 1649 + 1`; both are algebraic consequences of the same selected span, not independent confirmations. The midpoint is 38.5 runes from the original p15 start (3603), but 30 of 83 consecutive-four-event midpoints are this close to *some* physical page start ([page-boundary base-rate audit](../communications/broadcast/20261118T070306Z_critic_t7_midpoint_base-rate.md)).

## Why the earlier apparent rare tail was not a valid control

The original report's 2,000 page-rune-multiset shuffles gave 11 exact matches against any p15 even-number half and **0** maxima at least 1649; a later 5,000-trial replication gave 19 matches and again 0 large maxima. Those results are computationally valid *for that surrogate*. However, independently shuffling all rune positions within each page destroys the source's main anti-repeat phenomenon. For a page of length `n` with rune counts `c_s`, the expected adjacent-equality count under a uniform rune permutation is `Σ_s c_s(c_s−1)/n`. Summed across original pages, this is **439.165924**, against **86 actually observed**, a factor of **5.10658**. The surrogate therefore places several times as many repeat sites into the same page lengths and trivially collapses the long event gaps. The 0/5,000 tail cannot be used as evidence that the observed 1649 span has a cipher-specific origin.

## Corrected original-input geometry null

Condition on each actual physical page's length **and exact observed number of its within-page repeat sites**, including zero-repeat pages and the runeless p50 boundary. For each page independently, uniformly sample that many distinct eligible sites (all local positions 1 through length−1) without replacement. Preserve the original page ordering; combine those sites globally and score the **maximum span of four consecutive sites** against the frozen observed 1649 and against *any half of an even number* printed in the original p15 table. This tests site *geometry after controlling event scarcity*. It is not a full emitter model: word identities and exact first-order rune bigrams are unfixed.

Reproducible 50,000 draws, xorshift32 seed `0x31415926`, exact Floyd without-replacement sampler:

| Diagnostic | Corrected conditional result |
| --- | ---: |
| Original maximum three-gap span | **1649** |
| Conditional mean maximum span | **1657.44658** |
| Conditional simulated range | **1388–1899** |
| Simulated maximum ≥ 1649 | **25,645 / 50,000** |
| Plus-one upper-tail | **0.51290974** |
| Simulated maximum = 1649 exactly | **199 / 50,000** |
| Maximum equals half of *any even p15 cell* | **1,762 / 50,000** |
| Plus-one exact-table-match fraction | **0.03525929** |

This removes the evidence that the original span is exceptionally long under a null compatible with the 86-event source. The exact-table fraction is descriptive; p15/3298, the doubling relation, the four-event window and the maximum statistic were considered after substantial examination of other LP2 patterns. It is **not** a discovery p-value corrected for alternative numerical objects, window sizes, scales or relations. A stricter control fixing event-bearing words/lines is also possible, but no cipher claim is justified by the present numeric match.

## Research consequence and reproducibility

Retire the earlier null's portrayal as a *conservative* test and the proposed p15 state-length inference unless an independent original source specifies a reversible use of 3298/3299. The original p15 spiral remains exactly constructed from Fibonacci-indexed primes, independently of this correlation. Nothing in this experiment supplies ciphertext inverse, plaintext, key material, or an original-authored span-parameter operation.

The consolidated [Node22 CommonJS reproducer](../sims/t7_void_p15_line_boundary_control.cjs) computes the original event positions, both nulls, exact page-permutation repeat expectation, 50,000 conditional resamples and printed source-boundary base rates. The older multiset-shuffle counts are preserved as a diagnostic of a **misspecified** null rather than erased. The corrected program passed a complete [Windows Node22 GitHub Actions run 44263351675](https://github.com/FlareZ123/liber-primus/actions/runs/44263351675), reproducing the 50,000-draw figures above. Its physical page parser handles CRLF and inserts the transcription-omitted p50, with exact per-page rune-count assertions.
