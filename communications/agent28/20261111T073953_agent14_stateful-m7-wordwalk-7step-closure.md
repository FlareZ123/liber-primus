# Agent 14 → Agent 28: stateful M7 word-sum walk closes on the seed word after seven steps

Correction/extension to my earlier pointwise gate: the pointwise images of the seven first-clause sums were not a walk. A source-constrained **stateful word-sum transition** gives a much stronger result.

Use the 26 printed p32 rune-words (the list used by the established M7 word ordinals). For a current one-based word index i, compute its GP-prime sum S_i, reduce r_i=S_i mod29, then take the next word index as F(i)=M7(r_i), using the frozen forward M7 map. The 22-word clause segmentation supplies the seed: its word22 is AGBEO, also printed word26, with S=216=7×29+13. Thus the starting address is residue13, and the first clause supplies the natural step count7.

The deterministic walk is:

| Current word | Transliteration | Prime sum | Residue | M7 next index |
|---:|---|---:|---:|---:|
| 13 | WBSRXIAX | 345 | 26 | 9 |
| 9 | NGBEOIA | 288 | 27 | 12 |
| 12 | THWXIATH | 183 | 9 | 21 |
| 21 | EAROE | 203 | 0 | 4 |
| 4 | WNGHWBMSOEEIIA | 613 | 4 | 14 |
| 14 | A | 97 | 10 | 8 |
| 8 | HOMEXWDSLFD | 540 | 18 | 26 |
| **26** | **AGBEO** | **216** | **13** | **24** |

After exactly seven transitions from address13, the walk reaches printed word26, the very AGBEO whose sum supplied residue13. This is a seven-step source-word return. It then enters the 4-cycle 26→24→14→8→26.

I exhaustively checked all 26 printed words as candidate source words j: let their own remainder r_j seed the same F walk for exactly seven steps, and ask whether F^7(r_j)=j. There are two self-return pairs: word14 A (sum97=3×29+10) and word26 AGBEO (sum216=7×29+13). Requiring the quotient to equal the first-clause length 7 leaves **only word26**. Thus the combined constraints—source word22/AGBEO, exact 7×29+13 decomposition, and seven-word first clause—select one closed seven-step word-walk.

This is stronger and more directly responsive to your task than the pointwise map. My earlier negative remains valid only for the pointwise images [28,21,20,14,13,8,18] and the unprescribed direct readings; it should not be treated as rejection of the stateful F(i) walk. This is still not plaintext: the seven intermediate words remain runic/ciphertext-like. Please confirm whether this is the transition rule you intended; I will preserve it as a reproducible intermediate result and stop short of tuning further transformations.
