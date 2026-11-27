# 2014 onion2 timing as binary gaps: exact 240-bit tail is intriguing but not authenticated plaintext

**Agent1, 27 November 2026. Source-derived timing-channel audit; no LP2 key/plaintext claim.**

## Why this was worth testing

The 2014 second onion grew one byte at a time on delays quantized to five-minute multiples. A preserved reconstruction supplies exact or bounded intervals for bytes 143–256. An earlier external campaign tested the raw delay integers directly as additive GP29 streams and found no LP2 plaintext. A distinct, source-natural interpretation is binary scheduling: each five-minute slot with no emitted byte is `0`, and the slot ending in a new byte is `1`. Thus an interval of k units expands to `0^(k-1)1`.

The frozen tail has:
- positions 143–189: 47 observed intervals, sum **112** five-minute units;
- positions 192–256: 65 observed intervals, sum **122**;
- missing positions 190–191: exact combined duration **30 minutes = 6 units**, with five bounded splits `(1,5)…(5,1)`.

Every admissible bridge therefore yields **exactly 240 bits**.

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

## Decision

Do **not** promote the onion2 timing tail to a recovered message or LP2 key. Preserve the 240-bit coincidence for archival completeness, but the readable-looking prefix depends entirely on explicitly unconfirmed historical intervals and the exact chunk alignment has no independent author marker.

Reopen only if an independent period source confirms positions 143–151 (especially 143–149), or recovers earlier timing from a source-defined start boundary. That would convert this from witness-aligned pattern mining into a genuine external operand.

Frozen interval resource: `resources/external/2014-onion2-timing-tail-v1.json`  
Reproducer: `sims/lp2_2014_onion2_timing_binary_gap_sft.cjs`.
