# Exact simultaneous key-component propagation for two independent F-hold layers

Extends [joint modular inference](lp2-p0-joint-linear-two-period-key-inference.md). The reverse-order 5+8 length11 case has 1,452,081,978 anchor-compatible assignments, making direct leaf search expensive. Instead, solve component gauges simultaneously.

After an anchor path, each shift variable is root gauge plus a fixed mod29 delta. Consecutive nonzero ciphertext before/after the anchor forces both clocks to consume. It imposes Y[b] != -C and X[a]-Y[b] != C (Y=-outer key). If both expressions use the same gauge, a forbidden equality is fixed and may rule out the entire anchor. Otherwise store unary allowed domains and forbidden differences between roots. This removes the adjacent nonzero runs without losing any paths, retaining exact phase endpoints.

For 1–3 free gauges, index all 29^d assignments as bits. Precompute masks for unary and pairwise equality; construct initial bitsets from Cartesian domains and pair bans. Each phase state carries exactly the assignments that can reach it. At any nonzero C, both layers must consume: mask out Q=0 and P=0; at C=0 additionally allow both hold, or inner consume/outer hold when inner shift is nonzero. Reverse uses predecessor phases. Union bits at identical phases, first reverse-propagate to any initial phase, then forward-propagate remaining assignments to any terminal phase. All bit operations preserve assignment identities; the intersection is exact. More than 3 free gauges use complete root-domain enumeration with forward checking. A cap is explicit and logged; no skips in reported 11-rune runs. Every emitted key pair is checked by independent full forced-anchor inverse DP.

## Reverse 5+8, length11, all 706 offsets

- 2,171 dictionary forms, 1,349,804 F-mask-compatible word/offset pairs, 2,080,838 consistent hold paths.
- 1,452,081,978 anchor-compatible assignments before neighboring nonzero constraints.
- 1,131,801 adjacent-support paths; 348,285,876 product-domain bound before pair-difference constraints.
- 209,485,738 concrete assignments propagated as bitsets; 3,345,088 leaf tests for other dimensions; no cap skips. Remaining assignments excluded by exact necessary constraints.
- Four cyclic key pairs survive complete mathematical inversion. None supports free native lexical segmentation:

| Offset | Inner | Outer | Anchor | First empty trie prefix |
|---:|---|---|---|---:|
| 265 | 6q7se | c1p4fa30 | 3hkagi4ogif | 8 |
| 537 | jc048 | 6j4dgc7s | o58ai1iji9g | 9 |
| 671 | f007r | p07f0300 | d43d4aig34f | 7 |
| 690 | 0gc04 | 06rbps07 | nafdkiof14i | 5 |

Keys and anchors use base29 digits 0..s, both key phases zero at anchor. The complete dictionary segmentation DP permits all boundaries and restricts one-rune words to A/I; actual Python test independently constructed full inverse witnesses. No plaintext. Combined reverse-order evidence now excludes a finite native dictionary model with at least one tested 11–14-rune word. Neither long words nor complete lexicon coverage are guaranteed, and other ciphers remain open.

## Calibration and reproduction

The symbolic implementation returns the identical complete survivor sets as direct leaf enumeration for all six p57 plants (512,170,95,660,689,318 candidates); all true planted pairs are present. Original 8+5 length12 reproduces the sole prior witness. The 11-rune reverse search actually completed in four independent offset ranges and aggregates exactly to the above counts. Direct 12-rune reverse and 13/14 results are in preceding report. No CI run claimed.

`node sims/lp2_p0_joint_key_anchor_symbolic_sft.cjs` (Node plus GCC/Clang C++17). The C++ engine accepts an explicit [from,to) offset range after cap for partitioned runs. A full reverse length10 search was started during this invocation; do not infer any completed result for it from this checkpoint.
