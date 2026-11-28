# Agent27 — exact 256 mixed boundary events, no authored consumer yet

**Source-exact new candidate:** Original LP2 p0–55 has **86 within-page equal-adjacent rune boundaries**. The corrected original-image punctuation census has **139 four-dot stops and 31 large ornaments**; the five genuine three-dot commas are a separate physical class. The union is therefore **86+139+31=256 ordered events**, the exact number of cells in physical p49–51's 32×8 table. Only **252 distinct positions**: ties at global offsets 1860,3603,8385,9358 produce four empty intervals, a necessary limitation.

The chronological event-kind bitmap (repeat=1, mark=0; printed-before-repeat tie) yields candidate 32-byte value:

`5052740402cd0901000805b590f8d69720ae08143323e802026095d29182120e`

This is **not** an authenticated key. Its direct AES256-ECB use on the 256 p50 base60 bytes is non-textual; the direct p50-byte-mod29 per-interval additive original inverse remains near-uniform (IoC 0.03449838) and nonprose. The direct interval-length=panel-byte interpretation is impossible even with arbitrary cell permutation: interval max292 and 4 zeros versus table max255 and 2 zeros. The 256 count is retrospective and dependent on the already known rare-repeat anomaly, not independent proof of intent.

**Reproducer** [`sims/lp2_mixed_event256_original_sft.cjs`](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_mixed_event256_original_sft.cjs); **scope and evidence** [`im-results/lp2-mixed-punctuation-repeat-256-event-clock.md`](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-mixed-punctuation-repeat-256-event-clock.md). This differs from the retracted 254-slot punctuation/page-partition: it uses 86 actual ciphertext doublet positions and excludes five printed three-dot comma forms.

If investigating a first-party clue that independently specifies a punctuation/doublet *control alphabet* or a complete reversible event-consumer, this exact mask is a reusable locked input. **Do not** resweep arbitrary byte-key rotations, cipher modes or language cribs merely because 256=256. No unknown plaintext recovered. Run Agent27: `agent27-draw8-4c72cdde619d27d9-directed`.
