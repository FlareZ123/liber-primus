# Clear PARABLE as 95 source-table leaves: full-page F bypass and tree-fold gates

**Agent 42, 16 November 2026, with Agent 9's source-correct p56 transparent-F/root-exclusion refinement of 17 November. Evidence class: full original-cipher inverses and secret-function necessary-condition tests; no unknown plaintext, authenticated key or destination.** Original eight-key test: [standalone SFT](../sims/lp2_p50_base59_tree95_p57_leaflabel_original_sft.cjs) · [successful CI 43925188470](https://github.com/FlareZ123/liber-primus/actions/runs/43925188470). Source-true 84-symbol receiver: [new SFT](../sims/lp2_p50_95leaf_160nonroot_Fskip_sft.cjs) · [successful Windows CI 44014157371](https://github.com/FlareZ123/liber-primus/actions/runs/44014157371).

## Why this is a different, human-readable source clue

The [original 32×8 numerical table](../resources/liber-primus/base60-grid.json) on LP2 physical pp49–51 contains 256 printed two-character tokens; lowercase **f** alone is absent from the otherwise complete 60-character repertoire. Under the documented *conditional* radix59 codec deleting f, each decoded byte is also a valid original row-major 0-based address. The exact functional map `next(i) = value[i]` has **one self-loop at address189**; every other address reaches that root, yielding a 256-node directed in-tree ([original graph enumeration](lp2-p50-base59-source-convergent-map.md)). In a tree, source-visible tips are an unusually direct match for the p55 tree illustration and the solved p57 text's exhortation to look *within*.

**New proposed plaintext consumer:** that tree has **95 indegree-zero leaves**, the same number as the **95 GP29 runes in clear p57, PARABLE**, available from the original unencrypted final image ([source corpus](../resources/liber-primus/lp2-corpus.json)). A player could give its 95 visible leaves the 95 known characters and work inward to obtain a key. This tests an actual reversible cryptographic result rather than counting 95 as a solution.

There is a crucial qualification. Both the radix59 and conventional radix60 numeric tables have exactly **161 distinct output values**, hence **95 absent target values / leaves**. The equality of 95 with p57's 95 runes **does not discriminate base59 from base60**: leaf count equals 256 minus the number of distinct decoded targets. Only radix59 forms the single rooted tree. Its global convergence was previously measured as **108/30,000** exact-value-multiset shuffles, but the hypothesis itself is exploratory; no signed original message selects a tree reader or assigning p57 letters to leaves.

## Frozen full original key test

1. Use the exact original 256 table cells, decode under the source-defined 59-digit order, build all incoming child lists, and enumerate the 95 *indegree-zero* addresses in increasing original row-major address order.
2. Assign **the entire unmodified p57 95-rune GP29 plaintext** across the leaves. Two finite choices of assignment direction: original text order and reverse.
3. Two independently attested GP values of each known rune supply the source labels: **GP ordinal (0–28)** or its **GP prime weight mod29**.
4. At each internal node, take the **sum of its immediate children's labels modulo29**, recursively working towards the root. This is a deterministic, branch-order-independent way to propagate values and yields all **256** key symbols.
5. Apply each 256-entry key sequentially, repeating after 256 source runes, to the original **physical p55 (76 runes)** and to the final complete **pp54–55 chapter (308 runes)** under both additive GP29 signs. Score the eight fixed models by whole-output IoC. Neither original input is shortened, reordered, or fitted to an English word.

The key-consumption, label-domain and sign choices are concrete unverified consumer interpretations, **not commands given by Cicada**. There is no ciphertext-conditioned key fitting, phase optimization, key-clock skip, or guessed plaintext.

| Original target | Strongest of 8 source-labelled inverse IoCs | Matched optimized order-null mean | Source-label shuffles equal or better (5,000) | Plus-one upper-tail |
| --- | ---: | ---: | ---: | ---: |
| Final unsolved page p55, 76 runes | **0.04245614035** | **0.03965958** | **779** | **780/5001 = 0.15596881** |
| Whole p54–55 final unknown chapter, 308 runes | **0.03659207242** | **0.03572206** | **506** | **507/5001 = 0.10137972** |

Matched null permutes the exact original p57 95-rune multiset among the 95 same leaf slots (fixed xorshift32 seed `0x33010095`) and optimizes the **identical eight choices on every permuted candidate**. This tests whether actual **p57 text order**, over and above its inventory and length, supplies an exceptional key. It does not attempt a discovery-wide probability for the retrospectively chosen 95-leaf clue. Neither original output resembles full GP-native plaintext. A clear p57 passage of 76 runes was independently encrypted under the same nonconstant derived key, decoded, and **recovered exactly 76/76**, establishing correct operation.

## Earlier literal 85-rune holdout (Agent 17, before p56 F-skip correction)

The printed terminal pages supply a stronger check than the preceding IoC screen: **p55 has 76 unknown runes, p56 has 85 genuinely solved runes, and p57 has 95 clear runes**. Their total is the original grid's **256** numeric cells. Under radix59 there are **95 leaves** and **161 internal nodes = 76 + 85**, so a proposed source-tree *plaintext reconstruction* can be tested on the already-authenticated p56 words without guessing the p55 message. This is a **different consumer** from the preceding additive key-stream test: the internally propagated node labels themselves would be plaintext, and p56 would independently check the prediction.

Freeze the existing **parent = sum(children) mod29** rule. Assign the 95 unchanged p57 GP symbols to tree leaves in the source-natural **ascending-address** or **rooted DFS** order, either forward or backward. Use each GP rune's literal index or source GP prime residue as the leaf label. Order the 161 internal nodes by ascending printed-grid address, depth-first preorder, or depth-first postorder, always visiting sibling addresses in ascending order. The proposed p55 receiver is the **first 76** internal nodes, and the p56 *withheld original* is the **last 85**. These are 2 × 2 × 2 × 3 = **24 complete, predetermined graph readers**, with no fitted alphabet, hidden leaf assignment, offset, or plaintext substitutions.

**Independent authentic positive:** the 85 p56 plaintext GP values are taken from the established “AN END WITHIN THE DEEP WEB ...” reading; the exact original plaintext-F bypass with prime totients re-enciphers all **85/85** source p56 ciphertext runes, consuming exactly 84 prime terms. This check prevents transcription, spelling or p56-key errors from producing a false graph rejection.

| Held-out original p56 known-plaintext test | Exact matching GP positions out of 85 |
| --- | ---: |
| Ascending leaves, ascending internal nodes, GP values, forward p57 | **2/85** |
| Best of all 24 source-natural traversal/label/direction readers | **7/85** |
| All 24 readers | **One model gets 1; six get 2; seven get 3; five get 4; one gets 5; three get 6; one gets 7** |
| Required for a literal, no-error graph plaintext reconstruction | **85/85** |

The original known p56 therefore **falsifies the direct leaf-to-parent plaintext reconstruction under all 24 specified source-natural readers**, regardless of what the first 76 hypothetical p55 labels look like. A model matching 2–7 scattered runes is compatible with accidental 29-symbol agreements; there is no text recovery or source-selected tree grammar. The parent-sum *keystream* hypothesis tested above is distinct and remains negative on its own terms. The [read-only Windows Node22 SFT](../sims/lp2_p50_base59_tree95_p56_knownholdout_sft.cjs) builds the complete source graph and performs these exact original-input checks.

## Earlier 85-rune unary-fold exclusions, retained for comparison

The preceding parent-sum failure tests one chosen formula. The **same already-solved p56 original plaintext provides a much stronger algebraic obstruction** to an entire unlimited-key family. In the base59 tree, **92** of the 161 internal nodes have precisely one incoming child. For any *single stationary tree-fold rule*, every unary node must obey

```text
label(parent) = F1(label(only_child))
```

where `F1` is an **entirely unknown, unrestricted function from 29 GP rune values to 29 GP rune values**. We do not assume F1 is additive, invertible, uniform, a substitution alphabet, or one of a searched set of functions. Regardless of secret key choice, whenever the same known GP rune appears as the sole child of two known parent nodes, those parent nodes **must carry the same GP rune**.

Assign the **95 original clear p57 runes** to graph leaves by ascending address or source-defined depth-first search, forward or backward. In the same original source graph, assign **the complete 85 independently solved p56 plaintext runes** to the last 85 of the 161 internal nodes. Read those nodes in address, source-defined DFS preorder, or DFS postorder, either forward or reversed. The first 76 internal node labels (possible p55 plaintext) remain **completely unrestricted**. This gives **24 fixed source-natural complete assignments**, with no plaintext fit.

| Exact original-source necessary condition | Result |
| --- | --- |
| Known unary parent-child pairs, across the 24 readers | **36–52** |
| Conflicting child-symbol inputs to a single unknown F1, across the 24 readers | **6–14** |
| Best reader, even allowing an arbitrary noninjective F1 | **6 impossible parent output assignments** |
| Required by any one stationary deterministic unary F1 | **Zero conflicts** |

Example: ascending-address internals read in reverse and DFS-assigned forward p57 leaves produce **36** fully observed unary parent/child pairs. The input GP rune **I** (index 10) must map both to **G** (index 6), **E** (index 18), and **N** (index 9); the same single-valued F1 cannot satisfy these original plaintext equations. Every one of the 24 natural reader assignments has similar explicit contradictions. This **rules out all unary lookup tables** in that tree-fold family, even with 29 unconstrained secret outputs, independently of a proposed p55 message.

A related but different **unlimited-function** family assigns each internal label by *only the unordered multiset of its descendant p57 leaf symbols*. Along unary graph chains, two internal nodes have the same descendant-leaf set and hence must have the same predicted output under any fixed symmetric function of that set. The source permits **six** natural full internal readout conventions (address/DFS-preorder/DFS-postorder × orientation); among p56's 85 known labels each has **19–33 unavoidable inconsistencies** under the multiset equality invariant, irrespective of leaf assignment, prime numbering, or hidden function.

**Original printed-glyph receiver, without inferred plaintext.** The same graph can be tested under a different, arguably more literal interpretation: all **256 directly visible terminal runes** (p55's **76 encrypted** glyphs, p56's **85 encrypted** glyphs, and p57's **95 clear** glyphs) occupy tree internals and leaves in those source-natural orders. In this case all **92 unary parent-child pairs** are fully observed, so there is no unknown p55 plaintext register to infer. Across all **24** reader/leaf-orientation choices, **20–25 distinct child-symbol inputs** demand mutually inconsistent parent outputs under a single unknown F1. The exact visible-glyph tree-fold is therefore impossible for *any* stationary unary GP29 lookup function, regardless of all its secret table entries. This alternate receiver demonstrates that the exclusion does not rely on using p56's decrypted words where source-visible p56 ciphertext was intended.

**Even a completely secret lookup at every tree level fails.** A natural response to the unary contradiction would rekey at each original *depth*: the parent symbol obeys an unrestricted `F_d(child)`, where the 29→29 table `F_d` is arbitrary and independently secret for each of the tree's levels. The original graph fixes two plausible, completely predetermined level clocks: **distance from root 189** and **height above its farthest descendant leaf** (repeated peeling from the leaves, consistent with the PARABLE's “shed circumferences” metaphor). Both run from 0 to 38 and require no fitted key or arbitrary level boundary.

For each of the same **24** fixed direct **printed p55+p56 ciphertext and p57 clear-rune assignments**, group all 92 source unary parent/child pairs by **(level, child rune)**, and require a single output GP rune for each group. Despite granting all *39* separate secret lookup tables, **every** source-natural assignment is impossible:

| Secret unary lookup schedule | Best reader's contradictory (level, input) groups | Range across 24 readers |
| --- | ---: | ---: |
| One wholly secret fixed table | 20 | 20–25 |
| Independent wholly secret table at every **root-depth** level | **4** | 4–12 |
| Independent wholly secret table at every **leaf-peeling height** level | **8** | 8–16 |

This is a necessary-condition obstruction based purely on **256 original visible rune identities**. It is exact for any deterministic unary rule at the stipulated clock, regardless of secret function complexity or how unknown output symbols might be named. It does not reject separate state keyed by each node address, a nonlinear history-dependent rule, an intermediate symbol register, or an independent author-selected assignment of glyphs to graph vertices. Those remaining explanations require a separate source instruction, rather than adding more arbitrary secret tables to fit a contradicted source geometry.

These are **exact constraints** on two specified graph-reader families; no random sampling, English-language scoring, guessed plaintext, or limited-key sweep enters the exclusions. A separately keyed function per node, a depth/address-dependent update, changed p55/p56 receiver order, non-symmetric structural folding, or an intermediate ciphertext rather than literal GP29 plaintext could evade them. The manuscript does **not** presently supply an author-visible clue selecting such richer exceptions. The complete original-table and known-plaintext calculations are added to the same [single-file CJS reproducer](../sims/lp2_p50_base59_tree95_p56_knownholdout_sft.cjs), rather than launching an unrelated new family search.

## Corrected p56 transparent-F receiver and unused root (Agent 9, 17 November)

The earlier p55(76) + p56(85) + p57(95) = 256 literal symbol count supplies an interesting all-cell partition, but it ignores one independently authenticated distinction in the solved p56 cipher. Its full 85-symbol plaintext includes **one transparent F at zero-based index56**, which does **not consume a key position** in the authentic p56 prime/totient mode. The p50 base59 directed graph contains **exactly one self-loop root at address189**. An independently specified variant can therefore leave that root unassigned and use the remaining internal nodes as potential key-consuming runes:

| Source-fixed object | Number of cells / runes |
| --- | ---: |
| Base59 graph leaves, assigned clear PARABLE | **95** |
| Nonroot internal nodes, proposed unknown p55 receiver | **76** |
| Nonroot internal nodes, proposed known-p56 *key-consuming* receiver | **84** |
| Unique self-loop root, deliberately unassigned | **1** |
| **Total** | **256** |

Unlike an arbitrary extra omission, the one missing p56 F is actually proven by the prior solved-page cipher. It nonetheless does **not** tell the solver to map a 29-rune alphabet to graph labels, omit the root, or apply a tree fold. Under the full source-fixed 24-model family (two leaf orders, three nonroot-internal orders, two rune-value interpretations, two p57 directions), retain the previously frozen sum-of-children mod29 graph rule, assign all original p57 values to leaves, and compare the **last 84 of the 160 nonroot internal nodes** directly with all 84 authentic non-F plaintext p56 rune values. The best exact source-glyph match is **7/84**; after also allowing the unique root's value to normalize all readout symbols to zero, the best is **5/84**. No coherent p56 text or unknown p55 plaintext is reconstructed. Independently plant all 95 graph leaf values, propagate all 256 labels and build a synthetic 84-symbol terminal p56 with the single authentic-style F at index56; forward original prime/F encryption and the planted inverse recover all **85/85** synthetic p56 runes.

The stronger result grants an **entirely unrestricted, unknown GP29 unary transformation**, eliminating the particular choice of additive fold. At each of the graph's nodes that has exactly one child, a deterministic source-visible rule must map that child's known input rune to the parent's known output rune. In the 24 source-fixed assignments above, 38–52 of those unary parent-child pairs are simultaneously visible, because all 95 leaves and 84 p56 key-consuming internal labels are independently known, while the other 76 internal nodes and root remain unassigned. Among the known pairs, the same child value demands incompatible outputs under every possible stationary function:

| All-key function family for known unary graph steps | Conflicting input groups, minimum–maximum over all 24 source readers | Valid complete reader |
| --- | ---: | ---: |
| One arbitrary hidden GP29 29→29 rule | **8–14** | **0/24** |
| Independent arbitrary rule at every graph distance from root | **1–6** | **0/24** |
| Independent arbitrary rule at every leaf-peeling height | **4–10** | **0/24** |

These conflict counts are **exact key-independent necessary-condition failures** for each specified family, with all 29-output function entries entirely free. They remove the earlier 85-vs-84 ambiguity for these three classes. They do not exclude a freely rekeyed operation at every individual graph node, a source-chosen multidimensional intermediate register, or an independently supported different reading order.

**Reproduce:** [source-correct F-skip/root-exclusion Node22 test](../sims/lp2_p50_95leaf_160nonroot_Fskip_sft.cjs) asserts the original root, 95/160/1 partition, authenticated p56 exact forward crypto, all 24 full-plaintext candidates and all-secret unary contradictions. The source arithmetic also gives the clear p57 GP prime-weight sum **3,968 ≡24 (mod29) =3301 mod29**: assigning prime weights to leaves makes the derived root equal24 automatically, independent of tree shape, so this is **not a separate structural proof**.

## Decision

The base59 one-root tree and 95-leaf/p57 length alignment remain conditional candidate geometry. Correctly excluding the one authentic non-consuming p56 plaintext F and the one graph self-root yields the stronger **95 leaf + 76 opaque + 84 known + one unused root** partition, but the source supplies no author-issued graph decoder. The direct eight-model leaf-derived additive pad fails on p55/p54–55 compared with shuffled p57 leaf orders, and the separately fixed 24-model *older* all-internal plaintext reconstruction fails the 85-symbol p56 holdout. The source-corrected 24-model nonroot-internal reconstruction additionally fails the 84-symbol p56 holdout with at most 7/84 exact matches (or 5/84 after derived-root normalization). The stronger *unrestricted unary function*, source-visible 256-glyph, **per-depth secret-function**, and *arbitrary symmetric leaf-multiset* tests reject their stated source-shaped tree-fold families by original-rune contradictions. **The corrected 84-key-consuming-p56 test independently retains contradictions for stationary, root-depth and leaf-height secret unary functions in every one of the 24 source-natural readers.** None recovers unknown LP2 plaintext, key material or a destination. A new tree proposal requires an author-visible instruction specifying a node-specific/depth-dependent update or distinct receiver; expanding arbitrary graph traversals or key-fitting the 76 unknown positions would retread unsuccessful routes.
