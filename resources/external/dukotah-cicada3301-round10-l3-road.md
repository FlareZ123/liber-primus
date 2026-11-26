# External research reference: Dukotah/cicada3301 Round 10 L3-ROAD

**Repository:** https://github.com/Dukotah/cicada3301

**Pinned repository revision inspected:** [fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb](https://github.com/Dukotah/cicada3301/commit/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb) (2026-11-25).

Relevant source artifacts at that revision:

- [Pre-registration and amendments](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round10/L3-road/PREREG.md)
- [Main test implementation](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round10/L3-road/road.py)
- [Shared arithmetic/scoring implementation](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round10/L3-road/road_lib.py)
- [Synthetic validation gate](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round10/L3-road/gate.py)
- [Gate output](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round10/L3-road/gate.json)
- [LP2 road-lane results](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round10/L3-road/road_results.json)
- [Solved-plaintext source control](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round10/L3-road/t6_source_control.py)
- [Source-control output](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round10/L3-road/t6_results.json)

The study tests numeric/gematria readings of the 2016 clause “the map, their meaning is the road, and their numbers are the direction.” It parses 2,928 words / 12,956 runes and uses a word-length-preserving shuffled-stream null. The validation gate is documented, including an amendment made after calibration and before the real LP2 tests. The main result is an external negative for the tested word-sum families; see `im-results/lp2-2016-road-word-gematria-external-audit.md` for the scoped summary.

No external source code or data has been copied into this repository; this file is a pinned reference index. Respect the external repository's own license and attribution terms if reusing its implementation.

## Important supersession discovered in the same external repository

The L3-ROAD files above are **not the latest word-instrument state**. The same pinned revision contains later Round 45–47 work that changes how the Round 10 results must be interpreted:

- [Round 45 synthesis](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round45/SYNTHESIS.md) reports that printed LP2 word breaks are not plaintext words in order at any tested scale (12 order tests; intact English controls had full power; LP2 z = -1.2 versus solved-page controls around +7.5).
- [Round 46 loader results](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round46/L1-word-loader/RESULTS.md) establish the corrected parse as **2,896 words**, not 2,928. It joins 420 wrapping words (388 across lines, 32 across pages). The older 2,928-word loaders made 32 extra cuts at page-wrap boundaries.
- [Round 47 synthesis](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round47/SYNTHESIS.md) finds that the (b′) loss for bounded word-indexed key families can be a decoder limitation: an arrangement-aware beam recovers 78–88/100 from a 65,536-key family. It explicitly qualifies older word-indexed negatives pending re-adjudication.

**Interpretation correction:** the Round 10 L3-ROAD word-indexed T1–T5 nulls use the superseded 2,928-word segmentation. They are valuable historical, pre-registered experiments with a passing synthetic gate, but they are **conditional**, not a current closure of word-gematria/selector/order/pointer readings. A revisit must use the 2,896-word loader and address the arrangement/decoder caveat. The T6 solved-plaintext control is independent of LP2's segmentation, but its conclusion is limited to that control corpus and its English controls.


The later Round 45 word-order lane is particularly relevant to any proposed word-block permutation:

- [W1 results](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round45/W1-spaces/RESULTS.md)
- [W1 scope implementation](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round45/W1-spaces/q1_scope.py)

W1 Q4 reports that rune order is continuous across printed word and line breaks and excludes post-encryption word-level transposition, in-place word reversal, and word-boundary reading-order tricks down to about q = 0.2. This is a scoped external constraint, not proof against pre-encryption rearrangement or every possible transformation. The current repository's separate corrected-source replication is `im-results/lp2-r45-word-order-independent.md`.
