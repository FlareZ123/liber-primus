# Original p49–51 numeral field: source-missing-f base59 self-map

**Agent20, 16 November 2026, Director Issue #1256. Classification: provisional original-source structural finding with no plaintext/key.**

## Complete 256-cell original input and executable interpretation

The source [32×8 printed table](../resources/liber-primus/base60-grid.json) spans physical p49 (10 rows), p50 (13 rows), p51 (9 rows), exactly scans 66.jpg through 68.jpg. All **256** cells have two characters, with the conventional 60-symbol alphabet formed from digits 0–9, uppercase A–Z and lowercase a–x. **Precisely lowercase f is missing from every original cell. Every other base60 character occurs.** This is an already documented original-artifact fact in the repository's [prior base60 directional-graph report](lp2-p50-directional-functional-graph-prime-ordinal-starts.md); the new observation here is the globally convergent **literal address→value graph** under that 59-symbol parse, distinct from the previous mod29/quotient keypad model. Removing that one source-absent character produces a unique 59-digit ordered alphabet covering every printed token. It is a plausible competing numeral basis, although the original authors do not explicitly identify a base.

For either base B=60 or B=59 (remove f, preserve the order of all other symbols), decode each token as high-digit times B plus low-digit, giving values 0–255 in both cases. Let the value at row-major address i be V[i]. The frozen directed map has **next(i)=V[i]**, with all 256 possible addresses. The six source-identified starting positions are first 0, last 255, and the physical table page-seam endpoints **79,80,183,184**. Traverse each until first repeated address. This is a fully executable directed map without a guessed key.

A canonical complete reverse-tree readout was also frozen: sort directed cycles by minimum address; begin each cycle at that minimum and follow its actual outgoing edges; visit each cycle member and its noncyclic incoming descendants depth-first in increasing numeric address order. This produces exactly 256 different address positions without choosing a convenient path.

## Actual original graph

| Feature | Base60 conventional | Base59 missing only original-absent f |
|---|---|---|
| Unique decoded values | 161 / 256 | 161 / 256 |
| Directed cycles | Length 11 (minimum 0); length 2 (minimum 158) | **Single length-1 fixed point 189** |
| Largest cycle's attraction basin | 252/256 addresses | **256/256 addresses** |
| Six starting-path lengths | 11, 16, 22, 32, 16, 23 | 26, 17, 30, 31, 30, 18 |
| All six source seeds enter same basin | Yes | Yes |

**Base59 exact fixed-point identity:** global address **189** is the one-based **24th row, sixth column** (p51's first numeric row). Its original printed cell is **3C**, which numerically equals **3×59+12 = 189**, so it points to itself. Every other original address eventually reaches 189, with maximum depth **38** (addresses98 and134). The entire 256-vertex graph is a single directed in-tree feeding that self-loop. It has exactly 95 leaves (indegree0), with indegree frequencies 0:95, 1:92, 2:49, 3:14, 4:6. The unusual missing-f base59 choice was selected from the original symbol inventory, not tuned by trying arbitrary deleted digits.

The original p51 image (scan68.jpg) was inspected. Its first numeral line is **28 2a 0J 1L 0c 3C 2o 0X**, with the fixed-point cell in ordinary black type. There is no printed highlight, direction instruction or plaintext receiver tied visibly to this cell.

### Exact random-map combinatorial baseline (18 November 2026, Agent24)

The observed one-root self-map has a simple **exact null probability** that is useful for evaluating the proposed source-to-plaintext route. If each of the 256 printed cells independently chooses a destination uniformly from the 256 addresses, the number of maps with exactly one fixed point and all other vertices eventually reaching it is `n × n^(n−2) = n^(n−1)`: choose the root (`n` ways), select a labelled spanning tree (Cayley's `n^(n−2)` formula), orient every edge toward the root, and add the root's self-loop. There are `n^n` possible unrestricted maps. At `n = 256`, the event probability is therefore **1/256 = 0.00390625**. The **stronger exact multiset-conditioned probability** is also available analytically, so the previous 30,000-trial estimate need not be extrapolated. Let `c[v]` be the number of original table values equal to address `v`. Among every equally likely rearrangement of these *same* 256 target values, the exact probability of a single-root tree is

`Pr(rooted tree | fixed target counts) = sum_v(c[v] × (c[v] − 1)) / (256 × 255)`.

For a candidate root `r`, use Cayley's degree-sequence form to count rooted labelled trees whose oriented indegrees are `c[v]` (including the root's self-loop), then divide by all `256! / product_v(c[v]!)` distinct multiset arrangements. The numerator simplifies to `sum_v c[v](c[v]−1)`. The original **both-radix histogram** is `c=0:95, 1:92, 2:49, 3:14, 4:6`; hence the numerator is **49×2 + 14×6 + 6×12 = 254**. The **exact fixed-multiset probability is 254/65,280 = 0.003890931372549**, predicting about **116.73** of the previous 30,000 simulated permutations. The reported **108/30,000 = 0.0036** lies close to that reference. This conditional chance is not an independent clue, and a source-authored receiver remains missing. [Original-table exact-null SFT, including exhaustive small-map controls](../sims/lp2_p50_rooted_mapping_exact_null_sft.cjs), [passing Windows Node22 original-source run 44225210693](https://github.com/FlareZ123/liber-primus/actions/runs/44225210693).

More importantly, a map's indegree-zero **leaf count is exactly `256 − distinct target values`**, *for every permutation of its 256 cell positions*, because an indegree-zero vertex is a value that never occurs as a target. Both source-parseable radix readings have **161 distinct values**, so **95 leaves and 161 nonleaves are invariant under every original multiset-preserving control**, whether the resulting graph has one root or two cycles. Under independent uniform random targets, the expected number of leaves is `256 × (255/256)^256 = 93.99289725`. Thus 95 leaves is a typical count under this reference. The equality between 95 leaves and the 95 source-clear p57 runes cannot serve as a separate likelihood boost for the rooted-graph interpretation, and the matching 161 = 76 + 85 remainder is its algebraic complement.

This correction does not falsify the original base59 self-loop at 189, nor the optional human reading of the p57 *circumferences* clue. It limits what the **tree shape and leaf count alone** can justify. An independently authored address/traversal or value-changing operation is still required to turn this graph into a decipherment; the already completed genuine-p56 tree-fold tests below are negative. No new unknown plaintext or key is claimed.

## Matched graph null and actual typed readout

The [complete original SFT](../sims/lp2_p50_base59_base60_selfmap_sft.cjs) shuffles the **exact original multiset of 256 decoded values** 30,000 times separately for each base, preserving collisions and limiting the comparison to its specified hypothesis.

- In the **base59** fixed-multiset null, **108/30,000 (0.0036)** maps have **one cycle consisting of one fixed point attracting all 256 addresses**, as the original does. This is an uncommon structural feature in the prespecified base59 branch, but the numeral base and multiple graph features constitute a wider exploratory decision; the number is not a familywise historical authorship probability. **Independent competing evidence favors base60:** an earlier [conditional p15/p39/H-source polynomial syndrome analysis](lp2-p50-hg-single-residue-correction.md) showed that the original base60 table satisfies its four GF29 error-locator syndromes while the missing-f base59 values fail. Those syndromes are a retrospective hypothesis, not an authenticated table-reader instruction, but their exact original-source arithmetic must remain part of the assessment of the base59 alternative.
- In the **base60** null, **4,685/30,000 (0.15617)** maps have a basin of at least the original 252 addresses; **11,571/30,000 (0.38570)** put all six seam seeds in the same basin. These are ordinary enough to undermine a standalone base60 directed-map claim.

The canonical reverse-tree permutation read as original numeric *byte values* is no authenticated message. For base60 its byte tape has **103/256 printable ASCII bytes**, a longest printable span of six, and begins in hexadecimal **CB 00 E5 44 C7 44 2F C7 2E 2E 8D 8D 85 1F 6A 6A**. Neither base's canonical byte stream begins with a tested PNG, PDF, ZIP, gzip, ELF, GIF, or RIFF file header, and neither is a complete readable typed text. A 256-position permutation cannot repair this byte histogram. No cipher key, plaintext or authenticated file emerges from the canonical readout.

## Direct outer-perimeter depth-key decision on original terminal p55

A previously proposed finite original-cipher use of the source graph is now executed without fitting ciphertext. The table has **32 rows × 8 columns**, so its **outermost clockwise perimeter has 76 cells**, exactly the length of physical p55's 76 original ciphertext runes. The p57 PARABLE's language of “circumferences” motivates inspecting this one boundary, but it does not independently prescribe the following value-changing operation.

Decode the source numbers in each of the original *two* justified radices (59 from omission of lowercase f, or conventional 60), construct the exact row-major address graph above, and assign each of the 76 clockwise outer-ring cells its graph distance to any cycle, reduced mod29. For radix59 this is distance to the unique root189; radix60 is the distinct two-cycle-graph control. Add or subtract that fixed 76-symbol sequence against original p55 GP29 indices, without starting-point shifts, word resets, row/column reordering, graph-walk searches, fitted substitutions or guessed plaintext. The natural clockwise start is the printed top-left cell.

| Original ciphertext p55 inverse | 76-rune output IoC | Literal GP29 transliteration opening |
| --- | ---: | --- |
| Base59, add depth | 0.03333333 | `BTAEOTHTSWXWEHGMEAHXMNGH` |
| Base59, subtract depth | 0.03789474 | `AECXHEOXMNGADGRJXOENGJFP` |
| Base60, add depth | 0.03719298 | `NGINXEOEAWFUTIDXGAONDBTH` |
| Base60, subtract depth | 0.03333333 | `NGJFGTHEOINGNFHTHDMSCOEI` |

All four full original outputs lack a coherent GP-native 76-rune passage. Every 76-rune output forward-reencrypts the exact original ciphertext. A 76-rune planted clear p57 prefix, encrypted under each identical source key, recovers **76/76** in every case, separating a functioning reversible implementation from a successful original decipherment. [Source-locked read-only SFT](../sims/lp2_p50_base59_outer76_depth_p55_sft.cjs).

**Decision:** the specific **graph-distance-on-clockwise-outer76** key is a negative original-input plaintext test in either source-supported numeric radix. The source alone still supplies no instruction to use graph depth as a rune keystream. This finite check does not rule out a different, *independently prescribed* consumer of the source graph and does not justify searching alternative graph traversals to tune a decipherment. The exact graph structural observation remains as classified above.

## Known-plaintext affine tree aggregation: complete coefficient family

The source graph also permits a finite interpretation that can be rejected using already-authenticated plaintext rather than tuning an unknown page. It contains **95 leaves**, equal to the clear p57 rune count, and **161 internal nodes**, equal to p55 (76 ciphertext runes) plus p56 (85 independently solved runes). This count agreement motivates the specific conditional assignment of p57 runes to leaf labels and p55/p56 runes to internal labels. No original inscription instructs the assignment, so it remains a tested hypothesis.

Take the native GP ordinal value or its corresponding GP prime reduced modulo29 as the node label. Assign p57's 95 runes to leaves in ascending address or canonical depth-first order, forward or reversed. Assign the 161 internal labels in ascending address, preorder or postorder, and place the solved p56 block before or after the unobserved p55 block. In total there are **48 exact source geometries**. For each geometry use the original p56's independently verified prime-totient decryption, requiring **84 prime-consuming positions and one transparent F at index56**. Every fully observable internal node then supplies a plain-language constraint on the candidate operation

`parent = (a * sum(child labels) + b * numberOfChildren + c) mod 29`,

with **all 29³ coefficient triples** evaluated. Nodes requiring unobserved p55 labels are excluded from the constraint set. Depending on the source geometry, 55 to 85 of p56's genuine plaintext labels produce complete constraints.

| Complete original-input result | Outcome |
| --- | --- |
| Source geometries | 48 |
| Exact affine solutions on their entire observable p56 sets | **0** |
| Best entire p56 fit under GP ordinal labels | 16 of 85 |
| Best entire p56 fit under GP prime-residue labels | **17 of 85** |
| Best 85-constraint geometry, first 42 frozen as training | 10 matches |
| Its remaining 43 held-out constraints | 6 matches |
| Fully generated synthetic trees with source-shaped p57 leaves and `a=7, b=5, c=3` | **48 of 48 recover all known constraints** |

The highest full original score uses `a=0, b=7, c=24`, eliminating the child values entirely. It is a weak match created by fitting many coefficient triples, with no evidence for a propagating key or plaintext. The known p56 plaintext supplies independent positive-ground truth: an exact local cipher in this tested class would match all complete p56 constraints under at least one eligible geometry, as the planted trees do.

**Decision:** the entire stated *uniform local affine parent-from-children family*, including arbitrary constant, child-sum scale and node-degree offset over GP29, fails on original solved material. This extends the previous child-sum-only and node-salt tests, and blocks that route to recovering p55. More general graph-dependent algorithms, nonlocal operations and the source's numerical-base ambiguity remain unresolved. The [read-only Windows/Node22 SFT](../sims/lp2_p50_base59_tree95_affine_knownholdout_sft.cjs) reads the original resources and exhausts the finite family without any original unknown-plaintext fit. The [original-source Windows/Node22 execution completed successfully](https://github.com/FlareZ123/liber-primus/actions/runs/44069571300).

## Exact all-secret local lookup obstruction (17 November 2026, Agent38)

**Decision:** Even granting a completely arbitrary, unknown 29-entry substitution table in place of the previously tested affine law, the source's graph and independently solved p56 exclude seven simple local propagation families. This is an exact original-input contradiction. It recovers no p55 plaintext and does not authenticate the provisional base59 graph.

The **upstream human-path hypothesis** is unchanged: remove the only unused base60 digit `f`, read each printed two-character table token in base59, follow its address to the next cell, put the 95 original clear p57 rune indices at the graph's 95 leaves, and treat the other 161 cells as p55's 76 unknown and p56's 85 independently decrypted labels. The original p57 instruction to shed circumferences motivates an outside-to-inside traversal, but the book does not specify this tree operation or a lookup table. This test asks whether p56's **genuine known plaintext** could teach a reusable secret one-input law that recovers the withheld p55 labels. It does not fit the unknown p55 ciphertext.

For a node with child values `x1,...,xd`, define a **fixed but entirely secret** function `f:{0,...,28}->{0,...,28}`. The proposed law is `parent=f(A(children))`, where the aggregation `A` is one of:

| Original-source-derived aggregation `A` | Minimum known p56 labels that must change |
| --- | ---: |
| Sum of GP29 rune indices, mod29 | **24** |
| Product of GP29 rune indices, mod29 | **25** |
| Sum of GP29 prime values, mod29 | **25** |
| Product of GP29 prime values, mod29 | **27** |
| Sum of totients of GP29 prime values, mod29 | **24** |
| Product of totients of GP29 prime values, mod29 | **27** |
| Bitwise XOR of rune indices, reduced mod29 (2014 historical XOR control) | **25** |

The natural first-party motivation for prime and totient aggregates is LP1's solved assertion that both are sacred; the historically used 2014 three-share operation motivates the separate XOR comparator. None of these operations is explicitly commanded at the original p49–51 table.

Exactly **60 distinct fixed layouts** were tested: three canonical leaf orders (ascending address, depth-first, breadth-first); each in both directions; five canonical internal orders (address, depth-first preorder, postorder, breadth-first outward, and reversed breadth-first inward); and either p55-before-p56 or p56-before-p55 on the internal tape. For every combination the known constraints are every p56-labelled parent whose full child set is independently labelled by clear p57 or solved p56; the 76 p55 values are unobserved and never supplied. Each case has **55–85** complete authentic constraints.

For each aggregate input `a`, count its known parent outputs. Any single-valued function `f(a)` must choose one of those outputs; its **mathematical minimum number of contradictions** is `sum_a(total[a]-max_output_count[a])`. This eliminates **all 29^29 possible global secret tables at once**, without a key search, English scoring or any assumption that `f` is affine or invertible. Across **420 original cases** there are **zero exact fits** and at least **24 incompatible known symbols** in the most favorable case. The observation is stronger than a poor best-fit language score: the same aggregate input demands different authentic p56 labels.

**Synthetic power:** For each of the same 420 geometry-aggregate cases, the exact original p57 leaf text is kept, a distinct planted nonlinear table `f(a)=a²+3a+11 mod29` is propagated from leaves to root, and p55's 76 unknown internal labels are withheld. The invariant accepts all **420/420** plants exactly, with zero contradictions in every case. The script also asserts the authentic p56 prime-clock decryption, including its sole literal-F bypass at index56, before constructing any observation.

**Scope:** This retires a *single global 29-output function of one commutative child aggregate* under the stated base59 graph and canonical layouts. It cannot exclude node-dependent or depth-dependent functions, degree-conditioned tables, multiple inputs, nonlocal cryptographic hashes, alternate numerical bases, other leaf orderings, or a lost external key. The previously documented exact root189, 95-leaf and 161-internal counts remain an unresolved clue, not a confirmed decipherment. An independent authored receiver or external key is required before enlarging this family.

**Reproducer:** [All-secret original known-plaintext SFT](../sims/lp2_p50_base59_tree95_allsecret_lookup_sft.cjs). It operates directly on the pinned original table and GP29 corpus and prints each family minimum and strict source-shaped positive-control count.

## Causal interpretation and explicit limitation

The missing-f 59-digit alphabet creates one exact **global destination cell at address189**, potentially useful if a player was intended to use the 256 values as directions. Its attraction-basin feature is independent of the earlier *keypad* graph; it remains opposed by the existing base60 quadratic-syndrome result. The root and its full convergence are new concrete original-data properties. Their original authorial meaning is unresolved: no Cicada source yet tells a reader **which reverse branch to follow, what visited addresses mean as GP29/bytes, or which LP2 ciphertext page should consume them**. The signed 2016 message about words, meanings, numbers and direction does not independently choose the 59-digit radix, depth-first child order or plaintext receiver. The six source seeds provide no independent confirmation because a single basin forces their convergence.

**Research decision:** preserve this bounded base59 self-addressing anomaly as a candidate source-selected address mechanism requiring an independent recipient and readout clue. Retire the naive complete reverse-tree byte-stream decoder and base60 giant-basin argument. Do not multiply traversal variants to force a word. No unknown LP2 plaintext, full cipher or destination is established.

[Reproducible Windows/Node22 source-native run 43883633662](https://github.com/FlareZ123/liber-primus/actions/runs/43883633662), including exact original 256-cell assertions, both bases, six paths, full graph coverage and deterministic matched-null frequencies.
