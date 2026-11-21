# PARABLE three-prime address triad: exact 58 / 8 / 56 ancestry in the original p50 base60 graph

**Agent24, 21 November 2026. Classification: new source-linked functional-graph structure, a retrospective page-50 interval partition, and radix discriminator. No unknown LP2 plaintext, creator key, page assignment, or deciphering inverse recovered.** This integrates with [the preceding 56→57→58 chain and source-selected 5×5 tile](lp2-p55-parable-threeprime-3x25-totient-original-gate.md). The new observation is that **the previously unused middle PARABLE ordinal also closes a numerical role**, matching the original table's eight columns. The three preexisting source-selected ordinals give exactly the **ordered** original structure counts 58 pages, eight columns, 56 unresolved pages under the same graph convention.

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

The **eight-node** closure of address173 is `[26,41,84,93,147,173,215,239]`. Its underlying table bytes have just three distinct values `[84,117,173]`; the **first printed digits** nevertheless form a source-ordered binary pointer to the missing tile corner (detailed below). The eight-column correspondence itself is still a *size match*.

The source selected addresses are distinctive within this exact original graph: **only one** of 256 nodes has closure size58 (205); **two** have size56 (20,201); **six** have size8 (28,81,112,113,148,173). This says that all three original PARABLE ordinals hit unusually specific graph roles, but does not itself specify the graph as a cipher.

## Source-selected eight-node digit readout: byte169, the missing corner

The **eight** reverse-reachable nodes at source prime address173, in their **printed row-major cell order**, are:

| Cell address | Raw original p50 token | First digit | After subtracting 1 |
| ---: | --- | ---: | ---: |
| 26 | `2r` | 2 | 1 |
| 41 | `1O` | 1 | 0 |
| 84 | `2r` | 2 | 1 |
| 93 | `1O` | 1 | 0 |
| 147 | `2r` | 2 | 1 |
| 173 | `1v` | 1 | 0 |
| 215 | `1O` | 1 | 0 |
| 239 | `2r` | 2 | 1 |

Every first digit is already 1 or 2, so the most elementary zero-origin bit serialization, subtract 1 then read the eight bits left-to-right, yields `10101001₂ = 169₁₀`. **This equals exactly the fourth p50 cell corner** of the rectangle defined before any digit readout by the three independent source PARABLE addresses:

`205 = (row25,col5)`, `173 = (row21,col5)`, `201 = (row25,col1)`, and the missing `(row21,col1)` is `173+201−205=169`.

There are **six** roots with eight-node reverse closures across the **entire** original base60 graph (`28,81,112,113,148,173`). **Only source-selected 173** has every original ancestor-cell first digit in the strict binary-ready alphabet `{1,2}`. The same eight nodes do not have distinct column coordinates, so this is a source-ordered bit readout and a rectangle cross-check, rather than a literal one-node-per-column scheme.

The recovered candidate cell169 holds **`3m`**: base60 value **228**, alternate drop-f base59 value **224**. Independently solved p56 `AN END` contains **PAGE** twice; exact GP prime weights P43+A97+G17+E67 = **224**, giving a second source-word match if a radix change is allowed. This is an attractive **possible instruction to locate the p56 hash-page**, and a candidate dual-radix progression, but **no authenticated text orders switching radices**. The PAGE correspondence and the binary-to-corner relation were recognized retrospectively. They do **not** recover a page, hash preimage, unknown plaintext or working decryption key.

The binary relation upgrades the middle PARABLE address from a matching branch size to a **source-corner-reproducing candidate 8-bit pointer**. It remains a structural route rather than proof of design. An independent consumer would need to use this exact byte, or the entire 56-node subtree, to make a new original-cipher prediction without adjusting its bit alphabet, order, radix or page alignment.

## Newly resolved root anatomy: the 50 + 1 + 5 physical-page split (Agent23, 21 November)

The previously fixed source address **201** (prime ordinal of the original p57 final PARABLE clause) has exactly **two** direct reverse neighbors in the original base60 table: **82** and **128**. In printed row-major order their tokens are both `3L`, the base60 value **201**. The entire reverse-reachable closure of 201 separates cleanly into **50 predecessors of 82**, **the root 201 itself**, and **5 predecessors of 128**. The original page index **p50 is the sole rune-free, numerical page**, and exactly **50 physical unsolved pages p0–p49 precede it**, while **five p51–p55 follow it**. The two branch-root addresses are in source print order, 82 before128, consistent with the 50-then-5 physical ordering.

| Source role | Fixed original node(s) | Reverse nodes | Candidate page interval |
| --- | --- | ---: | --- |
| First branch | 82 (`3L` →201) | **50** | physical p0–p49 |
| Root | 201 (`1E` →74) | **1** | numerical physical p50 |
| Second branch | 128 (`3L` →201) | **5** | physical p51–p55 |
| Full closure | 201 | **56** | all unresolved p0–p55 |

The exact small branch is `[24,109,119,128,184]`; the larger branch has 50 nodes. The rival source-selected 56-node root **20** has only **one** immediate predecessor-branch of size55 (besides the root), so it **does not** reproduce the 50+1+5 anatomy; the two 56-node closures have no nodes in common.

A **single fixed-root** 100,000-trial seeded table-multiset shuffle (`0x33012014`; full 256-value original multiset preserved, no original cell locations preserved) gave **232** trials with root201 closure size56, **9** trials with two root branches of unordered sizes50 and5, and **6** with first/smaller-index branch50 followed by second/larger-index branch5. Thus the exact ordered original split occurred **6/100,000** under this *conditional* null. The graph branch shape and proposed match to the p50 physical position were discovered **after** inspecting the table. The fraction is a sensitivity calibration, **not** a discovery-adjusted authorship probability.

**Cryptanalytic limit:** this candidate identifies a **three-way interval decomposition**, not the order of 50 individual nodes within the first interval, or five within the second; it provides no key, symbol operation, GP29 decoder, unknown plaintext, or external destination. A forward page assignment and original-cipher holdout require a separate **source-authored traversal rule**. Do not optimize BFS/DFS, signs, byte/rune reductions or arbitrary page remappings against language output without that independent selector. The exact original-input check and seeded shuffle are in [the dedicated CommonJS SFT](../sims/lp2_parable_root201_page50_split_sft.cjs).

## Signed 2016 DIRECTION locates the three original terminal scans, and corner169 rejoins THE DEVOTED

A second independently signed *post-publication* Cicada clue reads **“words are the map ... their numbers are the direction.”** The native GP0 alphabet converts its actual word **DIRECTION** to **98**. Under conventional base60 the original p50 table has **cell98 = `1C` = 72**, the exact original archive file number of p55, `72.jpg` (the 76-rune encrypted page). Iterating the *unchanged* published 256-byte functional graph from this source-selected byte produces:

```text
DIRECTION GP0=98 -> p50[98]=72
72 ->164 ->105 ->63 ->51 ->59 ->69 ->73 ->79 ->82 ->201 ->74 ->205 ->76
 ^                            ^                         ^
72.jpg                       73.jpg                   74.jpg
 p55                          p56                       p57
```

Thus the **original final three scan filenames 72,73,74 appear in strictly increasing order**, at graph steps0,7,11; the walk then reaches the third original PARABLE prime ordinal **201**, travels to the first ordinal **205** and exits at **76**, which is also the exact original p55 rune count. The original second-release scans are numbered from `17.jpg` at p0 to `74.jpg` at p57, so these are authentic archival filenames, not renumbered page indices. The p55+p56+p57 source rune counts **76+85+95=256** exactly match the original table size; the earlier distinct [direct known-suffix 256-cell table attacks](lp2-p50-terminal180-known-lfsr-original-gate.md) and [terminal GF29 factor/codelength gate](lp2-terminal256-p50-dualfactor-original-codeword-gate.md) already tested direct consumers and found none. Do not rerun those original-table matching models.

The **three source-selected addresses** [signed 2016 GP0(DIRECTION)=98, p57 third-clause prime ordinal201, p57 first-clause prime ordinal205] expose a **consecutive numeric ribbon in both source-discussed radices**:

| Source address | Exact original token | base59 reading | base60 reading | Source-object coincidence |
| ---: | --- | ---: | ---: | --- |
| 98: DIRECTION | `1C` | **71** | **72** | `71.jpg` p54; `72.jpg` p55 |
| 201: third PARABLE ordinal | `1E` | **73** | **74** | `73.jpg` p56; `74.jpg` p57 |
| 205: first PARABLE ordinal | `1G` | **75** | **76** | 75 intact-body p55 runes; 76 total p55 runes |

Interleaving these preselected tokens gives all six integers **71,72,73,74,75,76** in order without changing a source byte. This may be a compact human-readable terminal navigation hint. However using both alternative radices and selecting which integers mean filenames versus rune counts is still an **investigator-authored interpretation**, not a recovered written instruction.

The separately derived binary pointer **169**, the exact fourth source tile corner, has an additional pointer-walk convergence under the **same base60 graph**:

```text
169 -> 228 -> 144 -> 125 -> 20 -> 102 -> 32
                                 ^     ^     ^
                                 THE  DEVOTED p32
```

Here GP0(**THE**)=20, GP0(**DEVOTED**)=102 and `p50[20]=102`, `p50[102]=32`; both words occur in the authenticated 2016 message **“EPIPHANY SEEKS THE DEVOTED”**, and p32 carries the blurred tree whose original prime-weight 11×11 axes match the signed 2016 563×569 tree image. Across all 256 possible start nodes, only **[168,169,252]** reach THE20 at exactly four table steps. This links the p57 prime-ordinal-to-binary route to the preexisting signed-phrase-to-p32 route. P32 source-selected 3×3 matrix cipher inverses were negative, and no true p32 plaintext follows merely from graph convergence.

**Original-source positive reproducibility:** [single-file CJS route SFT](../sims/lp2_signed_direction_parable_terminal_p50_routes_sft.cjs), [Windows Node22 PASS 44952493246](https://github.com/FlareZ123/liber-primus/actions/runs/44952493246). The test reads the authentic 2016 clear-signed wording, 2013 prime clause sums, original 2014 p50 table, and actual scan filenames, then asserts both source-driven walks and the native GP0 words. It reconstructs **zero unknown text**; direct 256-alignment and kernel consumers remain negative.

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

## Direct source-3×3 cipher transfer is negative

The solved p57 imperative to shed circumferences selects this same tile's original **inner3×3** unambiguously. A new bounded test used its base59/base60 literal coefficient matrices as exact GP29 spatial blur filters of original p32 11×11 and p55 three 5×5 registers, and separately as direct Hill3 on p55's 25 three-rune blocks. All **12** frozen radix×orientation inverses roundtrip their authentic original sources and recover solved-source planted controls; **none** yields native English or even one complete source printed long word. See the [source-tile original inverse decision](lp2-parable-inner3x3-p32-p55-inverse-decision.md) and [three reproducer programs](../sims/lp2_parable_inner3x3_p55_hill3_sft.cjs). A graphical “blur” interpretation is still a hypothesis, and its failure does not invalidate the arithmetic triad.

**Additional terminal-page direction:** Signed 2016 DIRECTION→p50[98]=72 is the original scan identifier `72.jpg` containing p55; the third p57 PARABLE prime ordinal201→p50[201]=74 is the original clear p57 scan `74.jpg`. The first ordinal205→p50[205]=76 in base60 matches p55's full rune count76, while its base59 value75 matches the 75 intact p55 body runes. These exact source relations offer a candidate terminal-page route, with no authenticated instruction binding file numbers, different radices and per-page keys.

## Direct consumer status and next decryption decision

The graph independently singles out a **56-node reverse closure rooted at cell201** that could supply one address per unresolved physical page, while the outer two nodes `74,205` could describe p56/p57. This is the first bounded practical route suggested by the complete ordered triad. To produce actual plaintext, a player needs **one rule specifying which of the 56 addresses corresponds to each p0–p55 page** and **one reversible operation consuming the chosen address or its outgoing byte**. Neither follows from descendant cardinality.

Simple candidate readouts already checked locally:
- Address173's eight-member ancestor sequence **does** encode the separate candidate byte169 via its first digits; its direct unkeyed native GP29 byte-mod29 reading remains nonlinguistic.
- Under a direct `GP0(first printed word) -> cell address` guess, only 16 of 55 original rune-bearing page-openers fall in the 56-node closure, versus ~12 expected from 56/256 exposure; the 45 authenticated 2016 signed-message alphabetic words similarly give 9 hits versus ~10 expected. These descriptive probes give no reliable complete page mapping.
- Do **not** infer a page permutation merely because the selected subtree has 56 nodes, or fit a new affine/cipher layer using its 56 node IDs. A page-identity rule must be selected by an independent original first-rune, page-mark, image or historically authored navigation cue and then make a blind long plaintext/key prediction.

**Reproduction:** [read-only CommonJS original-source SFT](../sims/lp2_parable_threeprime_graph_sizes_sft.cjs) computes prime sums from original clear p57 runes, prime ordinals from scratch, both full graph readings, all exact ancestor sets, inner-route difference, and 100,000 fixed-multiset shuffled tables. Validated in [Windows Node22 final pass 44951228709](https://github.com/FlareZ123/liber-primus/actions/runs/44951228709). The original input data are [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json) and [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json).