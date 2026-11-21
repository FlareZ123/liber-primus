# PARABLE-rooted 56-page tree: a direct GP29 receiver gate

**Agent37, 21 November 2026 | Classification: source-constrained inverse negative.** The original manuscript is not newly deciphered. The source-selected page graph remains a conditional page-to-table map, with no authenticated cryptographic readout.

## Source-selected input and candidate human operation

The solved p57 PARABLE clauses supply pre-existing zero-based prime ranks **[205,173,201]**, and the printed p49–51 numerical register has 256 two-character tokens. Under base60 successor addressing, the previously reported chain **201→74→205** has descendant sizes **56→57→58**. The selected 56-node tree rooted at 201 has incoming branches of sizes **50 and 5**, enclosing its root; a 50-node branch itself splits **44 and 5** around node82. The manuscript independently has 50 rune pages p0–49, numeric-only p50, and five rune pages p51–55. These correspondences were established by Agent8 before the present tests.

A specific original-source *candidate* page assignment is the largest-descendant-first inorder of that tree: each larger child subtree, the current node, then smaller children in decreasing size, with printed address resolving ties. It yields **p0→178, p15→105, p23→222, p32→73, p44→82, p50→201, p55→128**, and assigns distinct nodes to all 55 rune-bearing pages. The hypothesis is not proven: the artifact does not independently order every sibling branch.

The clear PARABLE instructs the reader to **shed circumferences** and **tunnel to the surface**. This motivates two precisely fixed, low-complexity key consumers without fitting a plaintext crib:

1. A page's unique pointer path toward node201, using either the source cell address or its printed numeric value modulo29. Read the path in either direction, repeat it from the first rune of the corresponding original page, and apply either additive GP29 inverse sign. Include or omit the terminal root201. This gives **16** complete full-book receivers, with key periods **1–16**.
2. The **55 strict word-interior GP runes of clear p57**, one for each of the 55 unknown rune-bearing pages, as the first state of a *plaintext-feedback autokey* on each page. Both additive signs and both source/interior order directions yield **four** complete receivers. The use of these 55 literal interiors as per-page initial symbols had been examined separately with the p56 prime cipher; the plaintext-autokey receiver here is a different bounded operation.

No keys, positions, page ciphertext cuts, word segmentation, or lexical output are optimized after decoding. The original pages p0–55 supply exactly **12,956 runes**.

## Original-input outcome

| Receiver | Fixed variants | Best original all-rune IoC | Interpretation |
|---|---:|---:|---|
| Untouched LP2 ciphertext | 1 | 0.03447840 | Source baseline |
| Tree node-to-root periodic additive GP29 | 16 | **0.03452848** | All near-uniform, no recovered GP-native prose |
| PARABLE interior-seeded plaintext autokey | 4 | **0.03450246** | All near-uniform, no recovered GP-native prose |
| Clear p57 PARABLE | control | 0.06270997 | Actual GP-native cleartext |

For the best periodic path receiver (printed value, root omitted, path reversed, addition), original p0 begins in canonical GP names **P O I E B L L C R NG O A O L O R L NG Y R R TH**. Its 12,956-rune aggregate IoC remains near the untreated ciphertext. Every one of the 20 families was re-encrypted to its exact original source ciphertext and independently decoded a full-length native-GP p57-repeat ciphertext plant with the same page schedule. Positive controls establish implementation correctness; they cannot turn an unselected key law into a source-authored cipher.

**Decision:** Retire these direct periodic path-key and literal plaintext-autokey consumers under the frozen inorder page assignment. The table-tree grouping and p57 instructions may still support a different, source-specified key schedule or a nonstationary operation. No new unknown plaintext or independently specified authentic page key was recovered.

## Reproduce

[Standalone original-input Node22 SFT](../sims/lp2_p57_tree56_pagekey_original_sft.cjs) reads unmodified canonical 256 table cells, p0–55 GP runes and clear p57 printed words. It asserts the exact graph partition, unique prospective page nodes, all 16+4 inverse round trips, and synthetic native-GP controls. [Windows Node22 PASS, workflow run 44953303110](https://github.com/FlareZ123/liber-primus/actions/runs/44953303110).