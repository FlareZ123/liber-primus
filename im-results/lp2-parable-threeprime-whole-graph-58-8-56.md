# PARABLE three-prime address triad: exact 58 / 8 / 56 ancestry in the original p50 base60 graph

**Agent24, 21 November 2026. Classification: new source-linked functional-graph structure and radix discriminator. No unknown LP2 plaintext, creator key, page assignment, or deciphering inverse recovered.** This integrates with [the preceding 56→57→58 chain and source-selected 5×5 tile](lp2-p55-parable-threeprime-3x25-totient-original-gate.md). The new observation is that **the previously unused middle PARABLE ordinal also closes a numerical role**, matching the original table's eight columns. The three preexisting source-selected ordinals give exactly the **ordered** original structure counts 58 pages, eight columns, 56 unresolved pages under the same graph convention.

## Source operands fixed before the graph observation

- The pre-2014 first-party 2013 `761.MP3` ID3 PARABLE metadata gives the product `1,595,277,641`; the authentic clear LP2 p57 text independently has three GP-prime-weighted clause sums `[1259,1031,1229]`, in printed order, with exactly that product.
- Their standard one-based prime ordinals (the 1259th, 1031st, 1229th prime positions) are `[205,173,201]`. A simple direct key-discovery hypothesis treats these three numbers as addresses into the **256** printed p50 table cells, row-major.
- The published second-release book has **58** physical pages, of which **56** (p0–p55) remain unsolved; its p50 number table has **8** visible columns and 32 rows.
- The original two-character numeric tokens can be read as base60 using the complete digit alphabet, or as base59 under the historically proposed deletion of lowercase `f`. No first-party explicit radix instruction is known.

Define the directed graph `f(i)=numeric_value(table[i])` on node IDs `0..255`. Count the **reverse-reachable closure** `A(r)={i: f^k(i)=r for some k>=0}`, including the root itself. This is not a tree-only shortcut: every node's predecessor reachability is counted once, and the code handles cycles.

| Clause, source address | Printed cell token | Base60 f(address) | Base60 size of A(address) | Physical source count | Base59 size of A(address) |
| --- | --- | ---: | ---: | --- | ---: |
| first, 205 | `1G` | 76 | **58** | 58 second-release pages | **1** |
| second, 173 | `1v` | 117 | **8** | 8 table columns | **10** |
| third, 201 | `1E` | 74 | **56** | 56 unresolved pages | **1** |

An independently discovered *nested* relation is now part of one complete triple rather than a two-number exception:

`201 -> 74 -> 205` with reverse-closure sizes `56 -> 57 -> 58`. The **entire 58-node** closure of 205 is the 56-node closure of 201 plus exactly `[74,205]`. Those two additional nodes are candidates to represent solved p56 and p57, given the known 56+2 manuscript partition, but the book supplies no authored mapping of those two node IDs to the two actual page numbers.

The **eight-node** closure of address173 is `[26,41,84,93,147,173,215,239]`. Its underlying table bytes have just three distinct values `[84,117,173]`; it does **not** enumerate columns0–7 or spell a plaintext message. The eight-column correspondence is a *size match*.

The source selected addresses are distinctive within this exact original graph: **only one** of 256 nodes has closure size58 (205); **two** have size56 (20,201); **six** have size8 (28,81,112,113,148,173). This says that all three original PARABLE ordinals hit unusually specific graph roles, but does not itself specify the graph as a cipher.

## Controlled structural rarity, with its discovery limitation

To calibrate the complete ordered triple, freeze source addresses `[205,173,201]`, original source targets `[58,8,56]`, the base60 parent convention and the entire 256-value multiset. In each of **100,000** seeded Fisher–Yates shuffles, redistribute the 256 source values to 256 cell positions and count reverse-reachable closures at the same three addresses. The 2014-style deterministic seed is `0x33012014`.

| Frozen event in 100,000 shuffled tables | Controls meeting event |
| --- | ---: |
| size205=58 | 109 |
| size173=8 | 3,164 |
| size201=56 | 199 |
| size205=58 and size201=56 | **0** |
| ordered full triple [58,8,56] | **0** |
| any order of the three sizes 58,8,56 | **0** |

The add-one ordered-tail bound is `1/100001 ≈ 9.9999e-6`. A separate graph-label-randomization descriptive baseline holds the *entire existing topology* fixed: there are only 1, 6 and 2 nodes of the respective sizes, so randomly assigning the three distinct source addresses to existing nodes would give the exact ordered size triad with probability `(1*6*2)/(256*255*254) ≈ 7.2371e-7`. This **is a different conditional null**, not independent multiplicative evidence.

**Important discovery caveat.** The graph-predecessor receiver and the significance of the **56/57/58** nested chain were recognized while researching p50; the **eight-column** target was recognized when checking the third independent address173. The source objects and physical counts are authentic, but their pairing and the choice of ancestry-counting were **not historically preregistered**. Therefore no quoted control tail is a fully discovery-adjusted probability of Cicada authorship. It is appropriate evidence for **prioritizing base60 functional-graph research over purely retrospective base59 word-tile numerology**, not for declaring an authentic decoder. The older base59 5×5 prime-square arithmetic remains exactly true and is a separate possible source clue.

## Direct consumer status and next decryption decision

The graph independently singles out a **56-node reverse closure rooted at cell201** that could supply one address per unresolved physical page, while the outer two nodes `74,205` could describe p56/p57. This is the first bounded practical route suggested by the complete ordered triad. To produce actual plaintext, a player needs **one rule specifying which of the 56 addresses corresponds to each p0–p55 page** and **one reversible operation consuming the chosen address or its outgoing byte**. Neither follows from descendant cardinality.

Simple candidate readouts already checked locally:
- Eight-column-sized address173 closure has only three distinct byte values and supplies no eight-character GP29 plaintext by the unkeyed native mod29 readout.
- Under a direct `GP0(first printed word) -> cell address` guess, only 16 of 55 original rune-bearing page-openers fall in the 56-node closure, versus ~12 expected from 56/256 exposure; the 45 authenticated 2016 signed-message alphabetic words similarly give 9 hits versus ~10 expected. These descriptive probes give no reliable complete page mapping.
- Do **not** infer a page permutation merely because the selected subtree has 56 nodes, or fit a new affine/cipher layer using its 56 node IDs. A page-identity rule must be selected by an independent original first-rune, page-mark, image or historically authored navigation cue and then make a blind long plaintext/key prediction.

**Reproduction:** [read-only CommonJS original-source SFT](../sims/lp2_parable_threeprime_graph_sizes_sft.cjs) computes prime sums from original clear p57 runes, prime ordinals from scratch, both full graph readings, all exact ancestor sets, inner-route difference, and 100,000 fixed-multiset shuffled tables. Validated in [Windows Node22 run 44950551147](https://github.com/FlareZ123/liber-primus/actions/runs/44950551147). The original input data are [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json) and [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json).