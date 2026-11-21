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

### Exact graph-to-page prime clock: source-native p56 positive, all five terminal unknowns impossible (Agent4, 21 November)

The 50+1+5 root201 branch anatomy suggests a **complete printed-order page assignment** without fitting any rune: assign the 50 predecessor cells of82 in increasing original p50 cell index to physical pp0–49, node201 to the numerical p50, the five predecessor cells of128 in increasing index `[24,109,119,128,184]` to pp51–55, and the unique two upward cells `[74,205]` to solved pp56–57. This gives a bijection from all 58 page indices to the full reverse closure of205. A human could sort original printed cell addresses. **The manuscript does not explicitly authorize this page ordering** and it contradicts no known graph count by construction.

A concrete one-operator cipher hypothesis then takes each assigned node's unchanged **base60 successor byte modulo29**, starts at the *first prime greater than or equal to that residue*, and applies the **authentic p56 GP29 `phi(prime)` additive encoder** to the complete page, resetting this one prime clock at each page and transparently passing plaintext F without consuming a prime. This requires no search or plaintext fit and uniquely reproduces the **known p56 prime2 initializer**: p56 maps to node74, source table cell74=`3P`=205, and 205 mod29=2. The complete actual **85/85 p56 known ciphertext** reencryption passes, including F-bypass. A double-independent positive takes 76 source-clear p57 runes, encrypts under the p55 start, and recovers a complete legal inverse.

But for all five original unknown pp51–55, **every** legal transparent-F inverse history becomes algebraically impossible on the unchanged ciphertext, even before language scoring:

| Physical unknown page | Assigned table node | Original byte / mod29 | First prime | First impossible original rune (1-based) |
| ---: | ---: | ---: | ---: | ---: |
| 51 | 24 | 109 / 22 | 23 | **22** of 92 |
| 52 | 109 | 184 / 10 | 11 | **224** of 263 |
| 53 | 119 | 184 / 10 | 11 | **33** of 179 |
| 54 | 128 | 201 / 27 | 29 | **20** of 232 |
| 55 | 184 | 128 / 12 | 13 | **59** of 76 |
| **56 solved positive** | **74** | **205 / 2** | **2** | **none** of 85 |

The exact dynamic program retains both legal interpretations of ciphertext F (transparent plaintext F and a non-F plaintext whose encryption happens to produce F), merging by consumed prime index. It has no branch cap, fitted key, alphabet mutation or guessed plaintext. Original and planted positives pass [Windows Node22 CI 44960576015](https://github.com/FlareZ123/liber-primus/actions/runs/44960576015), with source assertions and full [single-file CommonJS reproducer](../sims/lp2_root201_pageprime_exact_sft.cjs).

**Decision:** the promising p56 seed match is a **conditional single-stage control**, not evidence that p50's graph supplies the unknown pages' prime clocks. Under this exact fixed row-major page mapping, prime-ceiling rule, page reset and authentic F behavior, the model cannot possibly encode original terminal ciphertext. Retire this complete model; further graph address permutations, prime-start sweeps or altered F semantics require a fresh first-party selector. The base60 58/8/56 structural relation remains unchanged and no unknown LP2 plaintext/key follows.

## Signed 2016 DIRECTION locates the three original terminal scans, and corner169 rejoins THE DEVOTED

A second independently signed *post-publication* Cicada clue reads **“words are the map ... their numbers are the direction.”** The **literal** GP29 transliteration of Latin DIRECTION (I+O as separate runes) gives **GP0=98**. The independent earlier signed-2016 hex analysis instead coalesces IO→IA and obtains **GP0=112**; the signed Latin wording does not specify a unique convention. Under conventional base60 the original p50 table has **cell98 = `1C` = 72**, the exact original archive file number of p55, `72.jpg` (the 76-rune encrypted page). Iterating the *unchanged* published 256-byte functional graph from this source-selected byte produces:

```text
DIRECTION GP0=98 -> p50[98]=72
72 ->164 ->105 ->63 ->51 ->59 ->69 ->73 ->79 ->82 ->201 ->74 ->205 ->76
 ^                            ^                         ^
72.jpg                       73.jpg                   74.jpg
 p55                          p56                       p57
```

Thus the **original final three scan filenames 72,73,74 appear in strictly increasing order**, at graph steps0,7,11; the walk then reaches the third original PARABLE prime ordinal **201**, travels to the first ordinal **205** and exits at **76**, which is also the exact original p55 rune count. The original second-release scans are numbered from `17.jpg` at p0 to `74.jpg` at p57, so these are authentic archival filenames, not renumbered page indices. The p55+p56+p57 source rune counts **76+85+95=256** exactly match the original table size; the earlier distinct [direct known-suffix 256-cell table attacks](lp2-p50-terminal180-known-lfsr-original-gate.md) and [terminal GF29 factor/codelength gate](lp2-terminal256-p50-dualfactor-original-codeword-gate.md) already tested direct consumers and found none. Do not rerun those original-table matching models.

The **three addresses selected under literal GP spelling** [signed 2016 GP0(DIRECTION)=98, p57 third-clause prime ordinal201, p57 first-clause prime ordinal205] expose a **consecutive numeric ribbon in both source-discussed radices**:

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

**Independent spelling-fork control:** Under the prior IO→IA convention, DIRECTION112→p50[112]=`1D`=73 (original p56 scan `73.jpg`), then follows **73→79→82→201→74** to p57 scan `74.jpg` in four steps. Under literal GP spelling, DIRECTION98→p50[98]=`1C`=72, then reaches p56 scan73 in seven steps and p57 scan74 in eleven. Both source-coherent conventions converge at scan73→p57 and PARABLE ordinal201; only the literal branch has the entire 72→73→74 route and the `1C/1E/1G` consecutive-radix ribbon. The choice of English→GP ligature is investigator-defined and must not be portrayed as an authenticated original instruction.

## Page-end 13/23 dots and the p55 table-graph self-closure (Agent4, 21 November 2026)

The original signed 2016 **DIRECTION**, literally transliterated as separate I+O runes, has GP0=**98**. The original p50 base60 table at index98 is `1C` = **72**, selecting physical original scan **`72.jpg`**, unsolved p55. Independent page image data show a **red 13-dot mark immediately after its 76th and final rune**. If the actual dot count instructs a human to advance one p50 successor pointer per dot, the natural start is the just-selected **scan number72**. This yields one entire source-printed candidate handoff with a self-check:

```text
Signed word DIRECTION -> GP0 98 -> p50[98]=72 -> original 72.jpg (p55)
p55 final 13-dot mark -> f^13(72):
72 ->164 ->105 ->63 ->51 ->59 ->69 ->73 ->79 ->82 ->201 ->74 ->205 ->76
                                                                    ^     ^
                                           independent PARABLE ordinal205   exact p55 length 76
```

The **13th** step from physical scan node72 reaches **76**, exactly the unchanged p55 rune count. That path also visits original p56/p57 scan numbers73/74 and p57 independently source-linked PARABLE prime ordinals201/205. The p50 grid's 32×8 outer circumference has exactly **76** cells, giving a second physical recipient already supported by the solved text's "shed our own circumferences." Those are exact original-object equalities, though the operative rule has **not** been authenticated.

**Critical solved-terminal controls:** p56 also has a page-end **red13** mark and its actual text has 85 runes, but starting at its physical scan73 gives `f^13(73)=203`, **not85**. P57 ends in a distinct **red23** mark after95 runes, but starting at its physical scan74 gives `f^23(74)=47`, **not95**. Thus the literal **scan number + terminal dots → own page length** model succeeds on p55 alone and fails on both solved terminal pages. This is an explicit rival to an authored universal punctuation clock.

Using **different start objects** produces two additional exact, appealing results, but their use would itself require a missing source-level switch:

| Proposed start convention | Original stop size | Pointer route / outcome |
| --- | ---: | --- |
| Initial signed-word table address **98**, rather than its returned scan72 | p55 red **13** | `98→72→164→105→63→51→59→69→73→79→82→201→74→205`, reaching p57 first-clause prime ordinal **205** |
| First PARABLE clause prime ordinal **205**, rather than p57's scan74 | p57 red **23** | `205→76` enters the 11-node successor cycle; `23=1+2×11`, so after two more laps the route reaches **76**, p55's rune count |
| **DIRECTION** under investigator's IO→IA ligature (GP0=**112**), selecting physical p56 scan73 | p56 red **13** | From initial signed-word node112: `112→73→79→82→201→74→205→76→114→197→115→247→192→0`, ending at table index0 |

The marks are also conventional manuscript punctuation. The 2016 signed message selects the book's words and numbers as a map and direction, but **does not explicitly instruct counting dots as table hops** or choosing scan-node versus word-address versus clause-ordinal starts. These connections were found during modern analysis, after the 58/8/56 graph had already been identified. The exact output coincidences therefore select an **interesting p55-specific human-navigation hypothesis**, not a proven author-intended decoder or new unknown plaintext.

**Next cryptanalytic decision:** find a separately printed reversible operation consuming all **76** original p55 runes under the source-selected scan72/length76 pair. The most direct 76-byte circumference additive GP29 pads have already failed on original data ([source-native SFT](../sims/p55_table_perimeter_key_sft.cjs)); do not rescue that key family with tuned starts or orientation absent a source instruction. Prioritize a mode/clock that passes a solved source holdout before selecting any unknown-ciphertext words. [Updated exact original-source SFT](../sims/lp2_signed_terminal_dotclock_graph_sft.cjs) · [first version Windows PASS 44961375731](https://github.com/FlareZ123/liber-primus/actions/runs/44961375731).

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

**Additional conditional terminal-page direction:** Literal GP DIRECTION→p50[98]=72 is the original scan identifier `72.jpg` containing p55; the third p57 PARABLE prime ordinal201→p50[201]=74 is the original clear p57 scan `74.jpg`. The first ordinal205→p50[205]=76 in base60 matches p55's full rune count76, while its base59 value75 matches the 75 intact p55 body runes. These exact source relations offer a candidate terminal-page route, with no authenticated instruction binding file numbers, different radices and per-page keys.

## Original-cipher collision-location exclusion (Agent12, 21 November)

A source-motivated fixed allowance mask built from the 50-node predecessor branch of PARABLE-root201 can reproduce the *overall* frequency of ciphertext adjacent-equal runes: 50/(256×29)=0.0067349, very near the actual 86/12901=0.0066661. However, using the original global 256-step table phase, **69 of the 86 repeats occur outside** those 50 states, an impossibility for a strict 50-state mask. The complete 56-node PARABLE reverse closure does no better: across the four natural continuous/page-reset × first/second rune-phase choices, the count inside/outside is **18/68, 22/64, 22/64, 15/71**, close to the ~19 repeats expected under phase independence. A planted 86-event positive has all its events inside and is detected. The historically stronger word-based clock is also excluded under the literal fixed-mask model. The **PGP-signed 2016** clue says that the book's words are the map and their numbers give direction; map each unchanged complete ciphertext rune-word's **GP-prime sum mod 256** to the original p50 index, testing 63 repeat pairs strictly within words. For the source50 predecessor branch, only **10/63** repeats are in the allowed branch's **1,988/10,060** eligible internal positions, leaving **53** outside. The source56 closure gives the same **10/63** inside repeats and **53** outside (2,190/10,060 eligible). This does not support any literal word-sum-selected repeat permission rule; the observed in-mask counts are even below location-independent expectations of 12.45 and 13.71, respectively. [Windows Node22 original-source SFT PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44956668886). Reproduce with [original-cipher SFT](../sims/lp2_parable_root201_doublet_allowlist_sft.cjs). This excludes only a stationary source-graph *exception mask*; changing state or secret-key mechanisms remain. The aggregate 50/(256×29) equality is insufficient to select a cipher.

## Original nine-chapter connected-route exclusion (Agent2, 21 November)

The physical original LP2 image motifs divide the 56 still-unknown pages into nine consecutive chapters of sizes **[3,5,7,8,4,6,7,14,2]**. The preexisting PARABLE-ordinal201 reverse graph has the source-specific **50 | node201 | 5** split: the numeric physical p50 is in chapter p40–53, leaving **40 complete earlier pages plus ten of the 14-page chapter** in the 50-node branch, **one central node**, and **three pages from that chapter plus two final pages** in the five-node branch. This gives a new bounded test of the plausible reading that each illustrated chapter is a connected graph region and that the chapters can be visited in their printed sequence across single graph edges.

An **all-secret exact connected-tree partition with the added physical 50|1|5 branch-side assignment** grants arbitrary node-to-page assignments, arbitrary sibling order and every legal choice of eight cut edges. The two-page last chapter must be the fringe rooted at node109 (cut edge **184→109**). The 50-node branch has exactly **32 labelled solutions** for the first seven fixed chapter sizes, amounting to **16 different edge-cut partitions** (the duplicate size-seven labels give the factor two). With the right edge cut included, **all 16 partitions have a chapter-quotient node of degree at least three**: 24 labelled solutions have maximum degree3, four degree4, four degree5. **Zero partitions** permit a single-edge chapter-to-chapter path, even before imposing printed chapter order. A true 56-node path artificially planted with the **same** 50|1|5 anatomy and exact nine chapter lengths gives **5,040 path-capable labelled partitions** and **one exactly printed-order path**, so the exclusion is an executable, calibrated original-source necessary condition.

This **rejects only an edge-continuous, connected-chapter route** through the hypothesized page graph. It cannot reject a general page-address map using DFS backtracking, a traversal with jumps, disconnected chapter assignments, or an unrelated cipher; it recovers no unknown plaintext or key. This prevents using the attractive 50|1|5 arithmetic alone to claim a continuous chapter-by-chapter decoder. [Original-source reproducible Node22 SFT](../sims/lp2_parable_p50_chapter_connected_path_sft.cjs).

## Broad 305-partition chapter-path exclusion: survives removal of the 50|1|5 page-side conjecture

**Independent strengthening (Agent2, 21 November 2026):** Agent17's separate complete original graph DP established **610 labeled connected nine-chapter allocations /305 distinct eight-edge cuts** when only **node201 belongs to the printed 14-page p40–53 chapter**. That broader model does **not** assume that the 50-node branch must contain all physical pp0–49 or that the five-node branch must contain all pp51–55. Its count and 305-candidate reachability provide an independent certification of the set size beyond our initial 16-partition side-constrained version.

Enumerating the **complete 610 labeled allocations** as *actual cut sets* reveals their nine-chapter quotient degree spectra: **368 have maximum degree3, 178 degree4, 52 degree5, and 12 degree6**. **Zero** of the 610 allocations (or 305 unique cuts) yields a chapter quotient with maximum degree at most two; **zero** yields a single-edge reading in original chapter order. Thus the rejection of an edge-continuous, connected-chapter human reading **is independent of the speculative 50|1|5 side-to-page mapping**, provided root201 belongs to the numeric p50 chapter and every chapter's nodes are connected. The much narrower 16-partition side-constrained test above is retained as a special case and a path-positive-control gate.

This stronger result still allows DFS/backtracking, physical page moves across several graph edges, disconnected chapters, and a cipher unrelated to chapter connectivity. It does not supply original plaintext or an authenticated key. [Combined exact original 305+16 CJS SFT](../sims/lp2_parable_p50_chapter_connected_path_sft.cjs) · [independent Agent17 connected-component census](lp2-p50-root201-chapter-partition-ambiguity.md).

## Cross-original p15 Fibonacci-prime depth-key inversion: all page orders excluded (Agent2, 21 November)

**Motivated hypothesis:** The original p15 four-by-four numbered spiral has **16 independently established Fibonacci-indexed primes**, and the conditional p50 PARABLE-root201 56-node reverse tree has **exactly 16 distinct depth levels** (depths 0–15). Its unique deepest branch is a 16-vertex path. A human solving the book might assign p15's numbers to successive depths from the p50 table's selected inner node and use the *already authenticated* p56 prime-totient cipher as the changing-rune operation. The source does **not** independently instruct either the depth association or the cryptographic consumer, so this is a source-constrained and testable conditional interpretation.

Instead of relying on the unsupported largest-child-first inorder page map, the attack gives the hypothesis **all 50!×5! bijections** from physical p0–49 and p51–55 to the corresponding source-selected 50-node and five-node subtrees. Source p50 is fixed to node201; the entire 56-node graph structure is preserved. Every node has a source-exact depth d, from0 to15. Two literal p15-derived one-based first-prime ordinals are considered at each depth: (i) the Fibonacci+1 index of p15's prime (the primary historical prime-index construction), or (ii) the corresponding prime value itself (a more permissive natural numeric interpretation). Every original page's full 29-symbol stream must admit at least one exact p56-style inverse using its assigned depth's **consecutive-prime φ key** and *all legal plaintext-F bypass choices*. Ciphertext F may be literal or a genuine encryption of non-F; a non-F ciphertext glyph that would decode to F necessarily kills that state.

**Exact result, no page-order assumption:**

| Initial prime ordinal at tree depth d | Pages admitting any legal depth on their physical side | Algebraically impossible pages | Maximum one-to-one page-node matching |
|---|---:|---:|---:|
| P15 Fibonacci prime **index** F(d)+1 | **10/55** | **45** | 10 |
| P15 Fibonacci prime **value** | **18/55** | **37** | 18 |

For the source-index interpretation the only individually admissible page IDs are **p0,p1,p2,p8,p14,p15,p23,p32,p43,p49**. Every other rune-bearing original page fails at **every** key depth available in its proper 50-or-5 branch. Even the more flexible prime-value interpretation cannot decode 37 pages. Therefore **no arrangement whatsoever of the 55 unknown pages can make the proposed depth-key plus p56 φ cipher work**. It is unnecessary to guess sibling order, a page permutation, a language crib or 55 hidden page starting offsets. The result is a complete exclusion of these two source-defined consumers under the conditional graph premise.

The standalone SFT verifies the complete p15 numeric spiral, solved p57 source prime clause ranks [205,173,201], original p50 branch sizes50/1/5, and authentic solved-p56 known plaintext **85/85 with literal plaintext-F bypass**. It then constructs, for **each of the two key schedules**, 55 independent p57-native GP plaintext pages encrypted under a deliberately arbitrary correct graph-node assignment, preserving every original page's length; all **55/55** planted pages admit a valid all-secret graph bijection by exact maximum matching. [Source-original all-assignment reproducer](../sims/lp2_parable_p15_depthkey_allpermutation_phi_sft.cjs).

**What remains:** A 16-level correspondence is an operational clue candidate, even though its direct historically known cipher interpretation is falsified. This does not reject an independently specified non-totient decryptor, a graph traversal that uses the table's *values* instead of depth, or an originally missing external key. Do not restart φ prime-offset tuning on different speculative page permutations.

## P15 Fibonacci prime-rank breadth prefix and 16-level p50 tree: a conditional clue (Agent2, 21 November 2026)

The established p15 square prints sixteen values `|3301−prime(F_n+1)|`, in the red-start spiral; its first five independently reconstructed **prime ordinals** are **[1,2,3,4,6]**. The p57-selected original base60 p50 reverse tree rooted at201 has **exactly sixteen breadth-first levels** (depth 0–15) with the fully source-derived size profile

`[1,2,3,4,6,3,5,6,6,3,4,5,3,2,2,1]`.

Thus its first five breadth sizes **exactly reproduce the first five distinct Fibonacci-prime ordinals**, and those first five layers contain **1+2+3+4+6=16 actual table nodes**, equal to the length of the whole printed p15 spiral. The deepest root-to-leaf branch is 16 nodes. The exact original longest path of addresses from inner root to deepest leaf is **[201,82,79,73,69,59,51,63,105,198,246,148,172,250,166,178]**. This suggests a specific possible cross-artifact address/level reading, independently of inventing additive key phases; however the creator has not authenticated a depth-to-prime-rank instruction.

**Original-multiset calibration.** A fixed-address test shuffles all **256 original base60 values** among the original 256 cells, preserving their full frequency multiset, conditional on having exactly the same **ordered 50|root201|5** component anatomy. In **50,000,000** seeded Fisher–Yates shuffles with 64-bit MT seed `0x330120142026` under GCC/libstdc++ uniform integer sampling, **84,091** reproduce total root201 size56 with two disjoint branches, **3,475** reproduce unordered branch sizes 50/5, and **1,739** reproduce the exact ordered 50/5 split. Of those 1,739 structural controls, only **16** have the exact first-five breadth profile [1,2,3,4,6], **193** have sixteen total depth levels, and **2** have both properties. The conditional joint event rate is **2/1,739 ≈ 0.00115**, with small-n uncertainty. This is a narrow *retrospective* structural rarity measure after noticing the p15 breadth relation, never an authorship probability or a proof that p15 supplies an actual key. Compiler-specific distribution details may change the deterministic seeded counts; the null definition is the preserved 256-cell multiset.

The source-based **cryptographic consequence has already been tested separately** in the all-page-assignment p15→tree-depth φ(prime) gate above: **45 of55** original rune pages are impossible under the *p15 rank* version and **37 of55** under *p15 prime value*, even allowing all page permutations and all authentic F-skip branches. Consequently the structural match cannot justify a solved decoder; future work needs a distinct first-party operation or a blind original-page key prediction. [Full original-grid C++17 conditional-null reproducer](../sims/lp2_parable_p15_fibdepth_multiset_null.cpp).

## Direct consumer status and next decryption decision

The graph independently singles out a **56-node reverse closure rooted at cell201** that could supply one address per unresolved physical page, while the outer two nodes `74,205` could describe p56/p57. This is the first bounded practical route suggested by the complete ordered triad. To produce actual plaintext, a player needs **one rule specifying which of the 56 addresses corresponds to each p0–p55 page** and **one reversible operation consuming the chosen address or its outgoing byte**. Neither follows from descendant cardinality.

Simple candidate readouts already checked locally:
- Address173's eight-member ancestor sequence **does** encode the separate candidate byte169 via its first digits; its direct unkeyed native GP29 byte-mod29 reading remains nonlinguistic.
- Under a direct `GP0(first printed word) -> cell address` guess, only 16 of 55 original rune-bearing page-openers fall in the 56-node closure, versus ~12 expected from 56/256 exposure; the 45 authenticated 2016 signed-message alphabetic words similarly give 9 hits versus ~10 expected. These descriptive probes give no reliable complete page mapping.
- Do **not** infer a page permutation merely because the selected subtree has 56 nodes, or fit a new affine/cipher layer using its 56 node IDs. A page-identity rule must be selected by an independent original first-rune, page-mark, image or historically authored navigation cue and then make a blind long plaintext/key prediction.

**Reproduction:** [read-only CommonJS original-source SFT](../sims/lp2_parable_threeprime_graph_sizes_sft.cjs) computes prime sums from original clear p57 runes, prime ordinals from scratch, both full graph readings, all exact ancestor sets, inner-route difference, and 100,000 fixed-multiset shuffled tables. Validated in [Windows Node22 final pass 44951228709](https://github.com/FlareZ123/liber-primus/actions/runs/44951228709). The original input data are [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json) and [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json).