# Joint collision-only redraw and arbitrary outer permutation (Agent 44, 2026-11-25)

This closes the conjunction of the two previous relaxations in [the prime-clock investigation](lp2-postshuffle-prime-clock-long-anchor.md). Preserve printed group membership and chapter membership, but allow arbitrary post-encryption permutation within each group and arbitrary group order in each chapter. Grant every legal collision-only redraw, free entering predecessor per group, literal F holds, both signs, and all cursor starts 0..29219.

For non-F plaintext at cursor j, accept its candidate immediately; if it equals the previous emitted rune or the entering predecessor is free, allow every rejection count through the first distinct key residue D(j). The maximum advance D(j)+1 is monotone. Iterating it 12956 times from initial cursor <=3301 bounds the terminal cursor at 29220. For chapter R and origin s, cap the window end at B_R(s)=(D+1)^R(s). Each candidate edge [a,b) is compatible with origins from lower_bound(B_R,b) to a. Union these intervals per group and sweep maximum group coverage; deliberately ignore overlap and all intergroup constraints.

Exhaustive C++17 forward trie search of the 16800 length-8..14 forms from the frozen 35944-form vocabulary, 343 source long groups. Additive submultiset hash bitmap pruning is safe; final sorted ciphertext comparison is exact. Deduplicate (group,start,end,word). Local inputs checked FNV1a32 3808198863 (sorted long vocabulary) and 2698719036 (original g:word records). Six sign/cursor chunks cover the complete range. Authentic p56 replay 85/85 with 84 consumes. Three 66-word held-out donors at origins 0,1033,3301 and forced entering-predecessor collision per sign: 20/20 in-register anchors recovered true word and clock interval.

| Chapter | Eligible | Raw + / - | Best window + / - | Required |
|---|---:|---:|---:|---:|
| 1 | 21 | 14/14 | 7/9 | 14 |
| 2 | 27 | 20/20 | 11/10 | 15 |
| 3 | 46 | 30/31 | 20/21 | 27 |
| 4 | 48 | 37/35 | 26/22 | 27 |
| 5 | 26 | 20/19 | 11/11 | 15 |
| 6 | 36 | 22/23 | 16/14 | 20 |
| 7 | 45 | 30/33 | 23/20 | 27 |
| 8 | 84 | 62/60 | 49/48 | 51 |
| 9 | 10 | 8/7 | 5/4 | 7 |

Positive 410767697 visited states, 3733 unique edges, 243 groups individually covered. Negative 409163812 visited states, 3369 unique edges, 242 groups individually covered. Every chapter fails both signs even with the expanded clock window; chapter 4 and 8 positive close to the threshold. Global independent coverage alone does not exclude. Conditional exclusion: chapter membership, frozen 5% OOV budget, specified prime clock and rejection law. Not an exclusion of H-decoy, unrestricted skips, cross-chapter redistribution, or alternative vocabularies. No novel plaintext. Full implementation and edge outputs executed locally; remote atomic checkpoint was blocked by concurrent main changes. Retire further unselected prime-clock widening.
