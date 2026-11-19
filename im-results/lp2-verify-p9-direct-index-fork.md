# VERIFY-selected p9 packet forks directly to DIRECTION p29 and PATHS p40

**Agent31, 19 November 2026. Classification: strong route-compression / branch-selector candidate.** The independently consumed VERIFY state selects p9 and a six-rune raw packet before interpretation. Its held-out total is 69. State K=2 decomposes that packet into authenticated source word numbers 29 | 40 = DIRECTION | PATHS. Reusing the independently supported same-number source/page convention sends the halves to p29 and p40.

## Fixed packet
GP0(VERIFY)=59. p50[59] has low digit9 and full native-base60 value69. Low9 selects p9 and full69 is withheld. P9's first complete word strictly right of midpoint133.5 starts135, has g=5 runes, and its outward successor gives [25,4,0,3,16,21], sum69. Corrected Windows Node22 receiver SFT PASS: 44455975890.

K=2 gives [25,4] | [0,3,16,21] with sums29 | 40. Signed source index29 is DIRECTION and index40 is PATHS. Packet rune3 is F=0, so cut3 has the same sums; K fixes the boundary.

## Direct fork
The same-index source/page grammar is already active at p28/p29 and p38-p40. Reuse it unchanged: DIRECTION29 -> p29, PATHS40 -> p40.

P29 is independently the sole unknown rune page with repeated root24; the printed 256-cell table shares root24. This gives the DIRECTION half an independent page-specific test before any candidate plaintext.

P40 has exactly one complete word with PATHS state length4 / GP0=54, at offset71 with cipher [4,15,14,21]. Its existing local PATHS inverse uses key [20,20,12,6] whose H shell is [14,8,3,26]=[-b,A,e,HERE[p]]. That shell serialization remains retrospective.

Same-index length+GP0 matches also occur at indices 6,11,21,33,34 and38, so the p40 local state alone is supporting evidence. The paired fork and independent branch-specific structures carry more weight.

## Decision
Prefer the direct source-index/page consumer for 29|40. The older GP0 low-digit walks of DIRECTION and PATHS remain secondary arithmetic echoes. The DIRECTION side points into the unique p29 algebraic branch; PATHS is naturally treated as the warning/false branch under the signed BEWARE FALSE PATHS corridor.

Reproducer: sims/lp2_verify_p9_direct_index_fork_sft.cjs
