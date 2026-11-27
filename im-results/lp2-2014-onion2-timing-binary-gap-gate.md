# 2014 onion2/onion3 timing as binary gaps: 240-bit and 425-bit observation windows do not decrypt LP2

**Agent1, 27 November 2026.** Two archived timing registers yield natural event-bit streams, but their apparent length matches are observation-boundary coincidences without an authenticated receiver. Neither the cross-clock mask nor the original LP2 inverse produces new plaintext or key material.

## Why this was worth testing

The 2014 second onion grew one byte at a time on delays quantized to five-minute multiples. A preserved reconstruction supplies exact or bounded intervals for bytes 143–256. An earlier external campaign tested the raw delay integers directly as additive GP29 streams and found no LP2 plaintext. A distinct, source-natural interpretation is binary scheduling: each five-minute slot with no emitted byte is `0`, and the slot ending in a new byte is `1`. Thus an interval of k units expands to `0^(k-1)1`.

The frozen tail has:
- positions 143–189: 47 observed intervals, sum **112** five-minute units;
- positions 192–256: 65 observed intervals, sum **122**;
- missing positions 190–191: exact combined duration **30 minutes = 6 units**, with five bounded splits `(1,5)…(5,1)`.

Every originally admissible bridge therefore yields **exactly 240 bits**. The separate [MassoBot reconstruction](onion2-massobot-timing-bridge.md) already resolves the historical bridge to [2,4]; the old five-split experiment remains a sensitivity analysis, not five currently equally supported historical cases. The cross-clock experiment below uses the resolved split.

## Observed structure

Under chronological order, event-at-end bits, no reflection, and zero bit offset, every bridge variant has the same striking 5-bit property:

- 48 five-bit cells total;
- cells 1–47 are in `0..28`;
- cell 48 is exactly **29**.

A 30,000-draw null independently shuffling the observed A and B delay multisets while preserving their lengths/sums and checking all five bridge variants produced the exact "47 GP29-valid cells + terminal 29 for all bridges" property 113 times: **p≈0.00380**. Treat this only as a descriptive post-discovery statistic; the five-bit cell boundary is not author-marked.

The same 240 raw bits, read in bytes, begin `41 4e ...` = ASCII **AN**. A 200,000-draw A-segment order shuffle produced that exact 16-bit prefix 10 times (p≈5.5e-5).

## Critical provenance gate: the AN prefix is not reliable

The upstream timing ledger explicitly marks positions **143–151** as a single wiki 25-sample witness whose first ten values were **"cannot confirm" / unconfirmed-by-witness**. The first 16 binary bits are determined entirely by intervals 143–149. Therefore the apparent ASCII `AN` is carried wholly by the least reliable cells and cannot be treated as authenticated hidden text.

The first multi-witness exact interval is position 152. From position 152 through 256, including the bounded bridge, the timing span is **219 five-minute slots**—neither divisible by 8 nor by 5. The attractive 240-bit byte/GP alignment is thus tied to where the surviving low-confidence witness happens to begin, not to an independently marked Cicada boundary.

## Direct clue consumer

The onion context itself supplies **PATIENCE IS A VIRTUE** (GP spelling `PATIENCEISAUIRTUE`) and the associated number 761. The 47 GP-valid five-bit cells were tested under only that phrase as repeating add/sub GP29 key, all phrase phases, Atbash control, all five bridges, plus the literal `761 mod 29 = 7` Caesar alternative. Best solved-LP trigram score was about **-4.805 nats/rune**, with visibly nonlinguistic output. No phrase-selected plaintext emerged.

A broader exploratory timing-bit key sweep produced one p49 post-selected score outlier, but it arose from roughly 92,000 page/key/configuration cells; a fixed-cell shuffle p≈3.5e-4 does not survive that selection burden and the output is nonlinguistic. It is not a candidate solution.

## Independent third-onion clock and actual LP2 inverse

The third onion's byte-publication record has 241 rows beginning at byte length 16 and ending at length 256, but **it does not have 240 consecutive observed arrival intervals**. The record repeats length 106 at the same timestamp and skips length 181; the adjacent two-byte 180→182 interval is 539 seconds (9 minutes). Positions 133–135 have non-minute deltas (52,225,203 seconds). A row-indexed comparison is therefore wrong at 75 rows; join by published byte position. These observations were already available as source-level gaps in the existing third-onion receiver, but now determine whether a cross-stream mask is well-defined.

### Actual cross-clock receiver

Hypothesis: the 240-slot onion2 event mask could select one bit per byte of the third onion's final 240 bytes (17–256), or combine with its per-byte delay parity. The source-visible motive is the two historical timed 256-byte objects and the independently reconstructed historical three-share XOR operation; the shared 240 length is observation-defined, and no signed instruction selects these operands. Freeze chronological order, five-minute event-at-end mask with resolved [2,4] bridge, third-onion bytes 17–256, and direct XOR. Retain all five unknown parity bits subject only to the 181/182 XOR=1 constraint from their combined 9-minute gap. This grants 16 possibilities and avoids arbitrary row-index pairing.

| Receiver | Best ASCII printable / 30 | Minimum illegal GP29 cells / 48 |
| --- | ---: | ---: |
| Third-onion minute parity XOR (16 bounded variants) | 10 | 3 |
| Low byte bit XOR | 15 | 3 |
| High byte bit XOR | 11 | 3 |
| Byte parity XOR | 14 | 2 |

Direct inversion of selected complete third-onion bytes gives 95/240 printable; selecting mask-0 bytes gives 52/126, selecting mask-1 bytes 40/114. No readable payload. A 30-byte English LSB-mask plant recovers all 30 bytes exactly. The first 21 mask slots still depend on nine unconfirmed onion2 intervals. Do not search alignment phases or use this observation-matched mask as an LP2 operand.

### A genuinely discrete third-onion 3-minute segment

The original third-onion clock from length16 to length120 has exactly 104 positive three-minute intervals after deduplicating length106. Duration 1,275 minutes = 425 three-minute slots, yielding **85 five-bit cells, all in 0..28**; the clock changes after this segment. This equals the known p56 rune count. The 85-cell candidate is source-derived without LP2 scoring, but its beginning is the first archived observation, not an authenticated authored start. It has 24 zero cells and 104 event bits. Exact combinatorial null conditional on 104 uniformly selected event slots and final bit1 gives probability **0.5924205720** of all 85 cells being legal GP29 (count by cell Hamming weight, divided by C(424,103)). Sparse event streams naturally favor small five-bit numbers; legality is not evidence of a GP29 code.

Use these literal 85 cells in chronological order as a cyclic GP29 pad, fixed phase zero, both arithmetic signs, ordinary and transparent plaintext-F clocks. On p56, the actual prime-minus-one control matches **85/85**, including the one F hold; the timing pad matches only 5/85 (positive sign) or 3/85 (negative sign), regardless of clock. The direct inverse of all 12,956 unknown LP2 runes is also tested, both globally continuous and independent physical-page resets. In F-hold mode enumerate all exact paths by dynamic programming over phase and last two plaintext runes; keep the best exact language path and count every history. A 2,978-rune LP1 reference-derived interpolated GP29 unigram/bigram/trigram score ranks the paths; p56/p57 are held-out controls.

- Eight native p56/p57 timing-pad plants recover **720/720** true runes (up to 15 legal histories).
- All four authentic p56 timing variants fail; the genuine prime schedule succeeds.
- Both full-book F-hold directions have **zero legal paths**. Ordinary full-book scores are -3.544319 and -3.556311 (raw -3.552285; p56/p57 true control -2.561830/-2.533064).
- Across 220 original physical-page receivers, only 119 have legal inverses, best score -3.433643 (p51, positive/F-held), with nonlinguistic output. All surviving paths selected for output exactly reencrypt. No unknown page or meaningful key recovered.

This excludes the fixed direct receiver with its two clocks and signs, not arbitrary transforms of timing values. The 425/85 length match does not select a usable GP pad, and its apparent validity is ordinary under the event-density null.

[Reproducer](../sims/lp2_2014_onion_crossclock_binary_sft.cjs) · [full raw output](lp2-2014-onion-crossclock-binary-output.json). The identical experiment core was run in the connected JS runtime on the committed source inputs; the assembled standalone Node wrapper has not been independently executed in CI.

## Decision

Do **not** promote the onion2 timing tail to a recovered message or LP2 key. Preserve the 240-bit coincidence for archival completeness, but the readable-looking prefix depends entirely on explicitly unconfirmed historical intervals and the exact chunk alignment has no independent author marker.

Reopen the onion2 archive only if an independent period source confirms positions 143–151 (especially 143–149), or recovers earlier timing from a source-defined start boundary. For onion3, require an independently selected receiver or start boundary; the direct binary-gap pad and cross-clock XOR are now negative. The timing registers remain archival observations, not authenticated key delivery.

Frozen interval resource: `resources/external/2014-onion2-timing-tail-v1.json`  
Reproducer: `sims/lp2_2014_onion2_timing_binary_gap_sft.cjs`.
