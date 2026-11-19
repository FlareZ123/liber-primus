# Source-only holdout freeze: GP0(AND)-selected p0 receiver

**Run:** `agent3-gpt6-draw7-issue1917-common-p0-scheduler-20261119T182620Z`  
**Frozen at:** 2026-11-19T18:46:45Z  
**Purpose:** test whether the ROAD/NUMBERS-derived three-rune AND key transfers to a second, independently source-selected p0 receiver.

## Selection, fixed before this run's raw receiver read

- The authenticated 2016 source contains the target `AND` in the signed line `Seek and you will be found` (word 31 of the cleartext, 1-based).
- `GP0(AND)=56`; the original p50 grid has `p50[56]=4E`.
- The existing source-only `AND` route interprets `4E` as base-60, zero-origin p0 address 254. The original p0 transcription has a complete three-rune word at that start.
- Freeze receiver: **p0 rune offsets 254–256**, target **AND**. Do not move the receiver, change radix/origin, or choose another target after seeing its values.

## Frozen key prediction

The candidate common three-rune rule is the already proposed ROAD/NUMBERS AND key:

`K_AND = [g, p+e, b] = [5, 26, 15] (mod 29)`

using the p28 state `p=23, g=5, b=15, e=3`. The ROAD/NUMBERS derivation applies the key by subtraction, so the primary prediction is `P = C - K_AND (mod 29)`. Also report `C + K_AND` as a sign diagnostic, not as a permitted rescue.

**Decision rule:** if neither sign yields the frozen target AND, the fixed ROAD/NUMBERS key does not transfer to this independently selected receiver. A different key family may explain the receiver, but that is evidence against a single common scheduler unless a source-visible rule selects the change before the ciphertext is read.

## Scope and provenance caveat

The upstream `im-results/lp2-seek-and-readout-dh-tail.md` already publishes this receiver and its values. This is therefore a frozen cross-route reproduction test, **not a blind holdout**. The source selector and target above are fixed independently of the receiver values; this run will not use the already published values to tune the prediction. The failed OPENPGP direction-cycle key is not used as a selector or as input to this test.
