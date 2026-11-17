# Original 2014 onion-2 growing-string clock vs LP2 256-byte table

**Source relationship tested, 17 November 2026:** an independently recovered historical, solver-witnessed 2014 inter-byte timing series is a distinct 256-position numerical source. The 2014 `cu343l33nqaekrnw.onion` service appended exactly one byte at intervals of multiples of five minutes, eventually producing a 256-byte string. The **byte values** were served by Cicada; the **arrival times** are contemporary third-party observations. The separate original LP2 pp49–51 alphanumeric table also decodes to exactly 256 bytes. The cardinality and shared puzzle lineage motivate a test for a direct cross-era key relation; they do not themselves select one.

## Source and scope

The four-witness reconciliation published 3 November 2026 by [Dukotah/cicada3301, Round43/F5b-T](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5bT-timing-keystream/RESULTS.md) supplies **112** byte-indexed observations across original one-based positions143–256, excluding a two-interval break at190–191. Nine observations, positions143–151, are expressly unconfirmed by their witness. Independent witness overlaps agree on *interval values* as recorded; a single clock-minute transcription disagreement is separately documented. The original public recovery includes still-live 2014 Pastebin logs `qn8jmPJr` and `5bTLHqCN` and two archived community wiki exports. The 112 observations and provenance-class indicators are now available locally at [source data](../resources/external-onion2-timing-2014.json), pinned to outside Git blob SHA `029b839a2d72c712448983f0dc2dd09ed116afdd`. The original LP2 canonical table, without any retokenization, is [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json). The historical contributor's original, separately powered 1,906,740-decode attempt already found no language hit from the available timing intervals under its own specified consumers; this test examines the **source-to-source byte relation** instead of rerunning that cipher search.

## One locked direct-address test

Use `j=pos−1` to map each of the 112 historical positions to LP2 table cell `j`. Four deterministic layouts are allowed by the visible 32×8 table: printed row order, byte reversal, 32×8 transposed order, transposed reversal. No arbitrary per-cell key, offset, or source-position fit is granted. For each layout independently test the 2014 **raw service byte B**, the interval in five-minute units **k**, the raw elapsed minute count **5k**, and three directly motivated interactions `T xor B`, `T−B mod256`, and `T mod29`. A seeded 4,000-shuffle null conditions on the exact source table byte multiset for any best **constant XOR/subtraction mask**. A planted `T=B xor k` direct key must produce exactly 112 matching positions. [Single-file Node22 reproduction](../sims/lp2_onion2_timing_table_crosssource_sft.cjs).

Observed original table results:

| Original byte layout | `T = B` | `T mod29 = k` | Best repeated constant XOR mask | Best repeated constant subtraction |
| --- | ---: | ---: | ---: | ---: |
| Printed row-major | 0/112 | 5/112 | 4/112 | 4/112 |
| Reversed | 0/112 | 5/112 | 3/112 | 3/112 |
| Transposed | 1/112 | 2/112 | 3/112 | 3/112 |
| Transposed reversed | 0/112 | 4/112 | 3/112 | 3/112 |

In each layout `T=k` yields zero literal equalities; `T=5k` at most one. None of `T xor B=k`, `T xor B=5k`, `T−B=k`, or `T−B=5k` exceeds **two** equalities in any layout. These are exactly the sparse matches expected of unrelated bytes; a direct source-to-source key identity does **not** emerge. The direct plant is designed to succeed on 112/112. No original rune is decrypted.

The witnessed interval integers themselves follow counts `k=1:46, 2:33, 3:21, 4:5, 5:4, 6:2, 7:1`, mean `2.08929` five-minute units. Against a one-parameter geometric waiting-time model fitted once to that mean, the fixed categories1,2,3,4,5+ give Pearson χ² **5.91267** on **3** degrees of freedom (upper-tail p≈**0.116**). This is **compatible** with stochastic waiting intervals; it cannot exclude deliberate scheduling or an encoded timing channel.

**Decision:** retire a *direct index-preserving* byte, simple interval, constant byte-mask, or source-byte-plus-interval correspondence between the known 2014 onion-2 timing and the original LP2 256-byte table, for these four visibly justified layouts. A separately authored nonlinear/semantic operation, a different clock anchor, or the missing first142 timing intervals would require new independent evidence. The 2014 timing data remains a possible historical clue with appropriately limited source status, without a recovered key, plaintext, or final destination.
