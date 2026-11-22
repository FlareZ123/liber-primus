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
| Tree node-address → p56 φ prime-start, page reset | 55 page starts | **0.03743** (best survivor) | 52 pages algebraically impossible; p33/p43/p49 retain 69 near-uniform paths |
| Clear p57 PARABLE | control | 0.06270997 | Actual GP-native cleartext |

For the best periodic path receiver (printed value, root omitted, path reversed, addition), original p0 begins in canonical GP names **P O I E B L L C R NG O A O L O R L NG Y R R TH**. Its 12,956-rune aggregate IoC remains near the untreated ciphertext. Every one of the 20 families was re-encrypted to its exact original source ciphertext and independently decoded a full-length native-GP p57-repeat ciphertext plant with the same page schedule. Positive controls establish implementation correctness; they cannot turn an unselected key law into a source-authored cipher.

## New node-address to p56 prime-clock page consumer (Agent11, 21 November 2026)

**Fixed hypothesis.** Keep the previously published base60 root-201 56-node reverse tree and its explicitly provisional largest-subtree-first recursive inorder assignment. For every rune-bearing physical page p0–55 except numeric-only p50, use that page's assigned zero-based table-node address as the initial index into the authentic p56 consecutive-prime-totient stream. Reset the prime clock at each physical page. Preserve the exact historical p56 rule: plaintext F is copied unchanged without consuming a prime; every other plaintext rune consumes the next prime and encrypts by adding prime−1 modulo29. This is one fixed consumer, not a sweep of offsets, signs, page orders or F conventions.

The upstream source association is the existing 2013 PARABLE prime-rank [205,173,201] to original p50 base60 graph, whose root201 reverse closure has56 nodes and whose candidate inorder mapping places p50 at node201. The map itself is not authenticated: the manuscript does not explicitly say that a node address is a prime-stream offset or that the key clock resets on every page. This test asks whether that simplest direct readout works.

**Exact original-input result.** Across all55 rune-bearing pages (12,956 runes), **52 pages have no legal inverse at all** under the authentic p56 F-transparent rule. Their first impossible zero-based rune offsets are:

```text
p0:90  p1:1  p2:33  p3:55  p4:6  p5:27  p6:26  p7:6  p8:4  p9:184
p10:10 p11:40 p12:28 p13:28 p14:31 p15:77 p16:2 p17:10 p18:109 p19:91
p20:31 p21:168 p22:26 p23:26 p24:17 p25:106 p26:13 p27:15 p28:6 p29:158
p30:157 p31:66 p32:12 p34:16 p35:9 p36:60 p37:74 p38:6 p39:96 p40:77
p41:2 p42:4 p44:27 p45:4 p46:87 p47:33 p48:133 p51:54 p52:16 p53:4 p54:11 p55:7
```

Only **p33, p43 and p49** admit complete legal inverses, with respectively **12, 56 and 1** skip paths (69 total). Their candidate full-page GP29 IoCs range from **0.03295 to 0.03743**; the original clear p57 control is **0.06270997**. Thus none of the surviving candidates resembles the manuscript's cleartext control, and no unknown-page plaintext is recovered. The algebraic failures are independent of English or dictionary coverage.

**Positive control.** The same implementation encrypts the first75 clear p57 runes at nonzero start167, including all three literal plaintext-F events, and confirms exact forward replay plus inverse reachability of the planted original. This checks the page-start indexing and F-skip branch logic without using the failed original outputs as a control.

**Decision.** Retire this exact candidate consumer: tree node address → zero-based prime-stream start → page-reset p56 φ cipher. This does not reject the 56-node graph grouping, prove or disprove the candidate page-node assignment, or exclude another source-authenticated cipher. Do not extend this branch to parent pointers, fitted offsets or alternate traversal orders without a new original clue.

**Reproduction:** [standalone original-input Node22 SFT](../sims/lp2_p57_tree56_p56_phi_page_start_gate_sft.cjs). Run with `node sims/lp2_p57_tree56_p56_phi_page_start_gate_sft.cjs` from the repository root.
**Decision:** Retire the direct periodic path-key, literal plaintext-autokey and node-address-to-p56-prime-clock consumers under the frozen inorder page assignment. The table-tree grouping and p57 instructions may still support a different, source-specified key schedule or a nonstationary operation. No new unknown plaintext or independently specified authentic page key was recovered.

## Reproduce

[Standalone original-input Node22 SFT](../sims/lp2_p57_tree56_pagekey_original_sft.cjs) reads unmodified canonical 256 table cells, p0–55 GP runes and clear p57 printed words. It asserts the exact graph partition, unique prospective page nodes, all 16+4 inverse round trips, and synthetic native-GP controls. [Windows Node22 PASS, workflow run 44953303110](https://github.com/FlareZ123/liber-primus/actions/runs/44953303110).