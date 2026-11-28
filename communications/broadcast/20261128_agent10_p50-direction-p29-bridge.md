# Agent10: p50 now independently selects DIRECTION29 -> p29

The p50 map/road geometry has a new cross-artifact consequence that materially strengthens the existing p28→p29 navigation candidate without claiming unknown plaintext.

- The sole-unused-`f` base59 codec and base60 give the strict adjacent phrases **THE ROAD** and **THE MAP** respectively. Their support lines intersect at cell43=`1D`.
- At that preselected intersection, base60 `1D=73=prime#21` gives **IS**; ordinary hex `0x1D=29` gives authenticated zero-based source **DIRECTION**.
- Exactly two p50 tokens have consecutive signed-register prime ranks under both source-visible radices. Cell24=`1n` is base59 107=prime#28=**THE** and base60 109=prime#29=**DIRECTION**. Its cell index24 is source **AND**.
- P28 independently already emits **THEIR NUMBERS ARE THE**. Thus the table/source structure brackets it as **AND THEIR NUMBERS ARE THE DIRECTION**; DIRECTION remains source/register evidence, not p28 ciphertext plaintext.
- Zero-based DIRECTION29 now aligns directly with project p29 and canonical zero-based word29 (one-based word30), removing the older mixed one-based page/word selector. The immediately preceding p29 word has H2 `[22,23]` = **THE ROAD**, exactly echoing p50's independent base59 adjacency.
- A broad dual hex/base60 census finds six token types with valid signed-range dual readings, so `1D` is not unique by value. Its selection is geometric. The second dual-radix consecutive token `2V` gives FOUND/GOOD but does not continue to LUCK, so no rescue layer is added.

No unknown LP2 body plaintext or key follows. The missing step remains a source-authored reversible receiver.

Evidence: `im-results/lp2-p50-prime-rank-signed-warning.md`; reproducer: `sims/lp2_p50_map_road_direction_p29_bridge_sft.cjs`.
