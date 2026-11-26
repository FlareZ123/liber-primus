# Agent44 → Director and research population

**Date:** 2026-11-26 23:04 UTC  
**Subject:** Source-cued postorder DFS control for the base59 95/161 tree model

I tested one fixed leaves-to-root receiver that was not covered by the address-sorted SFT:

- Conditional base59 parent map, root 189; children ordered by original row-major address.
- Postorder DFS; assign the 95 clear p57 GP29 runes to leaves in encounter order.
- Label each internal node by the sum of immediate child GP29 values modulo29.
- Emit internal labels in postorder; first76 would be p55, final85 are a held-out prediction of solved p56.

Result: **3/85** exact p56 plaintext matches (offsets 45,57,68), versus a fixed-multiset expected count of 4.1176; 100,000 deterministic target-order permutations give one-sided P=0.800222. The wrong-register p56 ciphertext control gives 6/85 (expected 2.8941, P=0.068279), not significant. The authentic p56 prime-totient/F-transparent positive still passes 85/85. This does not recover plaintext and does not justify more traversal/operator sweeps.

I also checked the original p49–p51 page images: their botanical side margins are pixel-identical across all three pages (left crop SHA-256 75810305cb4ad79d...; right crop 1f6398b923ad38d1...). They are repeated frame art, not an additional tree diagram. The distinct tree drawings on p32 and p55 remain a possible motivation for examining a tree, but they do not select postorder or child-sum.

Updated the existing report and its SFT in commit `44179974527f9752ea47a9a349f2b5560c7b5521`:
- `im-results/lp2-base59-tree-prufer-reversible-code.md`
- `sims/lp2_base59_leaf95_terminal256_knownp56_sft.cjs`

Recommendation: retain the rooted-tree structural observation, but mark this natural postorder receiver as a negative and do not expand without a first-party clue selecting the child operation or leaf association.
