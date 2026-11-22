# Clear PARABLE word interiors as p50 table-tree edge labels: original decoder decision

**Agent 37, 22 November 2026. Classification: original-source-shaped reversible receiver, with genuine full-book original-cipher negative. No authenticated new plaintext, cipher key, author's instruction, or Cicada destination.**

## Source-visible candidate and crucial missing premise

The completely cleartext LP2 p57 reads **PARABLE** in seven red GP runes, followed by 19 black words comprising 88 runes. Taking the *strict interior of each complete printed word* yields **50 black GP runes**, and retaining all **seven** red title runes yields **57** fixed source symbols. The original p49–p51 numerical table, *conditionally interpreted as base60 successor pointers*, has a precisely 58-node reverse-ancestor component rooted at address205: node74's component contains57 nodes, node201's contains56, and node201 has branches of sizes50 and5. Thus this 57-rune tape could label the **57 child→parent edges** of the component, with no label on its clear root.

The graph, sizes, and count relation are independent original-source facts already reported in [p57 color50+5+2 edge correspondence](lp2-p57-title-body-50-5-tree-edge-gate.md). **The mapping from 57 labels to edges is an exploratory hypothesis, rather than a first-party authenticated decoder.** Neither the solved PARABLE text nor the numerical table commands leftmost inorder, a repeated additive key, this label assignment, or a reset at page boundaries.

This test freezes one concrete, natural, fully reversible interpretation. Construct the 58-node component by successively following the table bytes from each address. Traverse child branches in descending subtree size, with numeric address breaking ties, and serialize in *leftmost-child-first inorder*. The resulting 58 nodes map to physical p0–p57 in order; p50 is table-only, p56 solved-prime text, p57 clear PARABLE root. Assign the 57 source-rune labels **in order** as the 50 black word interiors, red P, red ARABL, and red E. Each corresponds to its node's directed edge to its parent; root205 is unlabelled. This creates unambiguous source-derived path-keys after the hypothesis is fixed, with no cipher-fitting freedom.

Read the labels along each original physical page's path to root205. The tree yields:

| Original physical page | Original table address | Complete GP29 source path key |
| --- | ---: | --- |
| p0 | 178 | `ICNSTNECUWUNCTHIPE` |
| p15 | 105 | `CUWUNCTHIPE` |
| p32 | 73 | `CTHIPE` |
| p50 (numeric-only) | 201 | `PE` |
| p55 | 128 | `LPE` |
| p56 (solved control, not tested as unknown) | 74 | `E` |
| p57 (clear) | 205 | empty path |

The source path index counts here refer to GP29 **runes**, so the GP `TH` digraph in the keys represents a **single** rune. The original p0 path is 17 GP runes.

## Full source-original consumer, genuine positives, and output

For each of the **55 unknown rune-bearing pages p0–p55** (p50 has zero runes), try exactly two complete direct operators, using zero-indexed page-local rune position `j` and that page's 1–17 rune source path `K`:

`P[j] = (C[j] + sign*K[j mod |K|]) mod29`, for `sign=−1` and `sign=+1`.

All **12,956** untouched original encrypted runes are consumed under both operators; each one re-encrypts exactly. Eight independent length95 source-native cleartext p57 encrypt/decrypt controls also reconstruct all95 runes, using both signs and four unrelated original page paths.

| Complete unknown ciphertext receiver | Pooled GP29 index of coincidence |
| --- | ---: |
| Original unchanged p0–p55 | **0.03447839786450569** |
| Minus path-key | **0.034505458548715603** |
| Plus path-key | **0.03448856200525032** |
| Genuine unencrypted p57, contextual native-GP control | **0.06270997** |

Neither decipherment produces natural native-GP language. For example, p55 is length76 with source key `LPE`, but the resulting page IoC is **0.031578947368421054** (minus) and **0.03333333333333333** (plus). P0's minus first18 transliterates `CONBMINAXMBEOFFUOEWM`; plus `AEPIAEOEEATCTRMUIRNGMXI`, where `TH`, `AE`, etc. can represent single GP runes. Both streams are nonprose. A source-native English passage is far from these complete-cipher profiles.

**Exact original-input Windows Node22 [PASS 45028905438](https://github.com/FlareZ123/liber-primus/actions/runs/45028905438).** The [read-only CommonJS single-file SFT](../sims/lp2_p57_clearinteriors_treepath_original_sft.cjs) asserts the original 20-word/95-rune clear p57 source, all original page images' derived rune order, the complete parent component size56/57/58, exact page-node addresses, all55 path lengths, both signs, re-encryption for every original rune, and eight independent positive plants.

## Decision

The **literal page-path repeating-additive interpretation is rejected as a route to plaintext**, even granting the chosen 58-node navigation and all 57 source labels. Do not tune inorder orientations, page offsets, signed byte transforms or secret extra steps to rescue it: none is selected by the original text. This result *does not* disprove the underlying 58-node tree or 50+5+2 original source correspondence, nor the possibility of another source-authored edge-state update. It establishes a reproducible negative for one complete, transparent operation and identifies exactly what a future intended-human decoder would still have to explain: why the 256-cell table encodes successor pointers, how a solver associates the 57 p57 symbols to edge addresses, and what reversible instruction carries the key from an edge into genuine unknown ciphertext. No verified previously unknown Liber Primus plaintext follows from the current construction.
