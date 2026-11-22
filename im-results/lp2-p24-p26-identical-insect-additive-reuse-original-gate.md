# Physical LP2 p24/p26: identical-insect additive-pad reuse fails the native-GP differential inverse

**Agent27; 22 November 2026; issue #2148. Status:** source-frozen conditional exclusion; no unknown-page plaintext, authentic creator key, verified cipher, or destination recovered.

The original 2014 physical LP2 pages p24 and p26 show the same bilateral insect illustration; p25 is a near variant (archive JPEGs 41.jpg, 42.jpg and 43.jpg). Original rune counts are 270,273,265. After joining actual printed line wraps and retaining word boundaries, first complete words begin at rune offsets p24=3, p25=2, p26=1. The other image-defined synchronization starts at page-local rune zero, leaving initial incomplete fragments unconstrained.

**Frozen hypothesis:** C24[t] = (P24[t]+K[t]) mod29 and C26[t]=(P26[t]+K[t]) mod29, with one arbitrary hidden shared keystream K and one symbol per rune. Taking D[t]=(C24[t]-C26[t]) mod29 eliminates K exactly. Hence an original solution must produce TWO ordinary source-native GP English plaintext streams with P26[t]=(P24[t]-D[t]) mod29, respecting both original printed word-break tapes.

The [reproducible Node22 SFT](../sims/lp2_p24p26_insect_reusedpad_joint_lexicon_sft.cjs) uses 29,104 distinct GP dictionary words with the authenticated ING/IO spellings, 72,235 trie nodes and a two-stream Viterbi state search limited to 12,000 states. It tries 250 original aligned runes (150 calibration +100 held out). Crucially, every original failure occurs with zero beam clipping, so no candidate can satisfy the constrained finite dictionary at the reported offset.

| Input | Result |
|---|---|
| Original p24/p26, first complete words 3/1 | Exhausted at t=11 zero-based, 12th rune; no clipping |
| Original p24/p26, page origins 0/0, incomplete word fragments free | Exhausted at t=32, 33rd rune; no clipping |
| Original p24/p25, complete-word starts 3/2 | Exhausted at t=34; no clipping |
| Original p25/p26, complete-word starts 2/1 | Exhausted at t=10; no clipping |
| Two genuine solved-LP1 streams and one hidden random reused pad | Perfect 250/250 rune recovery in EACH plaintext stream |
| Same two genuine streams under independent hidden pads | Exhausted by t=16 |
| Two synthetic streams assembled only from authentic solved-LP1 GP words matching exactly the original p24/p26 complete word-length patterns, one reused pad | 244/250 exact rune recovery EACH; complete valid 250-rune two-stream candidate; zero fallback words |
| Same original-word-layout native-GP streams, two independent pads | Exhausted at t=11 |

Original p24/p26 have 10/250 equal symbols after source alignment; near-art pairs p24/p25 and p25/p26 have 8/250 and 9/250. Two independent solved LP1 native-GP streams yield an expected 15.61/250 matches when a pad is shared. These weaker statistics do not determine the conclusion.

**Reproduction:** [SFT](../sims/lp2_p24p26_insect_reusedpad_joint_lexicon_sft.cjs), [Windows/Node22 PASS 44978781654](https://github.com/FlareZ123/liber-primus/actions/runs/44978781654); final forward-replay/assertion [Windows PASS 44978876973](https://github.com/FlareZ123/liber-primus/actions/runs/44978876973) confirms two-cipher 250/250 re-encryption on recovered candidates. See [issue #2148](https://github.com/FlareZ123/liber-primus/issues/2148) for that CI confirmation.

**Scope:** an exact no-path result relative to the specified finite native-English lexicon and two source-frozen clocks. It is not a proof about every possible English word or spelling, other artwork-provided keys, non-additive encryption, F-transparent clocks or arbitrary undisclosed phase shifts. Do not tune post-hoc offsets to rescue this specific family.
