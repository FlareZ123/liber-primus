# Original 255-word / 255-rune / 256-byte triad: full binary-tree Merkle test

## Distinct proposed solve path

Three physically preserved LP2 quantities admit a precise combinatorial architecture:

- Physical p3–p7: **255 complete printed scroll words** (1,145 GP29 runes).
- Tree-illustrated p8: **255 original runes**.
- Original p49–p51 numerical object: **256 printed base60 byte values** in its 32×8 layout.

A full binary tree with **256 leaves has exactly 255 internal nodes**, in eight levels. Thus p50 could theoretically provide one leaf byte per position, while the scroll's 255 words and p8's 255 runes could label internal nodes. This is a **new conditional interpretation** of the established counts, different from treating p8 itself as a complete 255-node tree. The tree drawing, however, is botanical rather than a numbered binary diagram. No authentic message labels the 256 p50 numbers as Merkle leaves or connects them to the scroll's words. **The count relation is a hypothesis, not discovered cryptography or deciphered text.**

## Frozen, complete, falsifiable implementation

I tested standard, 2014-feasible SHA-256 Merkle operation on the exact source, with all **255 internal node labels** compared to their original p8 GP29 index values. Use original p50 base60 bytes *as printed*, row-major, at binary-heap leaves 256–511 (heap root at1). Internal nodes are computed bottom-up from their left/right children; p8 runes are read **root-first breadth-first** at heap nodes1–255. Each hashed internal node is mapped to GP29 either as the SHA256 big-endian integer mod29 (the natural least-significant BASE29 digit), or as the first digest byte mod29.

The small, explicit finite family has twelve architectures: raw-byte versus individually SHA256-hashed leaves; no internal salt versus original corresponding whole scroll word's GP0 ordinal-byte sequence inserted between child digests; SHA256 versus SHA256d parent hashing (double-hash branch only for hashed leaves); and two rune projections. These are implementation variants, **not source-authenticated instructions**, and only a conventional Merkle sampling gate, not an open-ended crypto search.

## Original-source result

All 12 exact source models fail to reproduce p8. The strongest (each leaf = SHA256(single source byte), each parent = SHA256d of its two 32-byte children, big-integer digest mod29) matches **15/255 original rune positions**; the second strongest matches12, and the remaining models match at most11. Random independent GP29 symbols would coincide around 255/29≈8.79 times. A **20,000-trial discovery-aware exact source-histogram permutation test** shuffles the original p8 255 runes and rescans the **maximum of all 12 fixed models**: 6,369/20,000 = **0.31845** have at least 15 coincidences. Consequently the original best is unexceptional once this finite selection is accounted for. No coherent plaintext, authenticated original label law, complete rune match, source key or destination emerged.

The same source-exact program asserts 255 parsed scroll words /1,145 original runes; all 255 p8 runes; 256 p50 byte leaves; and reproduces the FIPS SHA256("abc") known-answer vector. It verifies a 255/255 planted same-tree output and all source-array derivations. Original concatenated leaf/rune/word array SHA256 fingerprint `e2586fb2c403dfd0f5ece8e72b5d29bbe5809308254cccdb8f99fe80f44684b3`. The committed script was executed under V8 on the exact GitHub source bytes using an independently implemented FIPS SHA256 adapter, with all assertions passing; **not a claim of CI execution**.

## Decision

The arithmetic **255 internal nodes +256 leaves** gives a source-visible way to organize the three quantities if a *future independent authored instruction* actually selects a binary hash tree. But **SHA256/SHA256d binary Merkle trees cannot explain the original p8 labels under the twelve frozen natural readings**, and 15/255 coincidences do not select a key. Do not fit per-node hash variants or hidden label alphabets to the 255 outputs. The original source offers no reason to prefer this distant cross-chapter graph over a simpler word/rune count coincidence.

Standalone reproducible Node22 program: [`sims/lp2_scroll255_p50_256leaf_merkle_original_sft.cjs`](../sims/lp2_scroll255_p50_256leaf_merkle_original_sft.cjs). Existing different 255-node traversal experiments: [`im-results/lp2-scroll255-binarytree-traversal-original-gate.md`](lp2-scroll255-binarytree-traversal-original-gate.md).
