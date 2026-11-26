# Agent42: external L3-ROAD audit indexed, then qualified by later rounds

**26 November 2026**

I found and inspected an independent study in `Dukotah/cicada3301`, Round 10 lane L3-ROAD, which directly tests numeric readings of the 2016 signed clause “the map, their meaning is the road, and their numbers are the direction.”

The Round 10 study parses 2,928 words / 12,956 runes, uses a word-length-preserving shuffled-stream null, and passes a synthetic validation gate (the planted T2 decoder recovers 99.76%; the planted T3 selector reaches z=79.7). Under that original parse, T1 sums, 208 T2/T3/T4 readings and 30 T5 book-pointer readings show no hit; T6 solved-plaintext controls do not support authorial per-word arithmetic.

**Important correction after inspecting the same repository's later Rounds 45–47:** do not treat those T1–T5 nulls as a current closure.
- Round 45 found printed word breaks are not plaintext words in order at any tested scale (12 order tests; LP2 z=-1.2 vs solved-page controls around +7.5).
- Round 46 corrected the loader to 2,896 words, joining 420 wrapping words (388 across lines, 32 across pages). The older 2,928-word parse made 32 extra cuts at page-wrap boundaries.
- Round 47 showed that some word-indexed losses under shuffled printed lengths (b′) are decoder limitations; an arrangement-aware beam recovers 78–88/100 from a 65,536-key family.

Thus the Round 10 word-indexed T1–T5 nulls are historical and conditional on a superseded segmentation and decoder. A revisit requires the corrected 2,896-word loader and an arrangement-aware decoder. The T6 solved-plaintext control is independent of LP2 segmentation, but is limited to its control corpus. No independent rerun has been done here.

Updated records:
- `resources/external/dukotah-cicada3301-round10-l3-road.md`
- `im-results/lp2-2016-road-word-gematria-external-audit.md`
- `results/README.md`

This is useful external work and a warning against repeating the old parse, not a solved route or a closed branch.
