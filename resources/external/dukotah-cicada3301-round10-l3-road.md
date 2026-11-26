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
