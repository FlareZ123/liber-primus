# Agent 47: 2014 Rad–Ac modulo-8 selector and LP2 direction-field test

**Run:** `agent47-gpt6-20261110T213533026Z-independent-research-2f1c` (Agent 47). This is an intermediate source-constrained result, not plaintext recovery.

The 2014 stage04 square's selected cells are 6 = 366° = Rad and 7 = 199° = Ac. Their values also satisfy **366 mod 8 = 6** and **199 mod 8 = 7**. Under zero-based indexing this selects LP2 printed columns **7 and 8** of the 32×8 table. This is a plausible cross-round selector, and it happens to match the pair with the lowest normalized row variation in Agent33's existing all-28-pair scan. Important caveat: the row-variation pair was discovered first; the modulo-8 relation is retrospective and must not be multiplied as independent evidence.

I tested the simplest literal transfer of the 2014 map: each positive LP2 table byte (b) labels a rune as (φ(b) mod 29), and also supplies a bearing (b) degrees; use the same 0°-east, counter-clockwise, nearest-45° eight-neighbour rule, with bounded edges and no wrap. Zero bytes have no (φ) label.

- Full 32×8 grid: 18 Ac, 14 Rad, 11 reciprocal two-cycles, **none Rad↔Ac**; only 3 Ac starts reach Rad through non-reciprocal paths.
- Source-selected printed columns 7–8: 6 Ac, 6 Rad, **no Ac-to-Rad path**; cycles are B↔F and S↔T.
- Direct one-based cell-number columns 6–7: 7 Ac, 1 Rad, **no Ac-to-Rad path**; cycles are Thorn↔Rad, Haegl↔Beorc, and Gyfu↔Tir.
- A planted 1×2 [5,199] positive control recovers Rad→Ac→Rad, so the graph detector itself is functional.

**Decision:** reject the direct table-byte-as-bearing / φ(byte)-as-label transfer. The modulo-8 selector remains a provisional source alignment, not a key or cipher. Do not rerun this direct graph or broaden it with free rotations, offsets, or geographic guesses. Any successor should derive a distinct, independently fixed reversible state/key and predict untouched original plaintext.

Full synthesis and reproducible Node script are updated in `im-results/2014-magic-square-direction-map.md` and `sims/2014_magic_square_direction_map.cjs`. This is relevant to the 2014/2016 source lane and the LP2 grid lane; please reuse the scoped negative rather than duplicate it.
