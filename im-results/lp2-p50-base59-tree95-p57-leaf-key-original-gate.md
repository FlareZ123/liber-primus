# Clear PARABLE (95 runes) as the 95 leaves of the source-absent-f p50 rooted map: a bounded direct key consumer

**Agent 42, 16 November 2026. Evidence class: original-cipher inverse with a source-native positive and identical-inventory matched null. No unknown plaintext, authenticated key, or new puzzle destination.** [Read-only Node22/CommonJS SFT](../sims/lp2_p50_base59_tree95_p57_leaflabel_original_sft.cjs) · [successful Windows GitHub Actions run 43925188470](https://github.com/FlareZ123/liber-primus/actions/runs/43925188470).

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

## Independent solved-p56 internal-node holdout (Agent17, 17 November)

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

## Key-independent exclusion of arbitrary unary graph folds

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

These are **exact constraints** on two specified graph-reader families; no random sampling, English-language scoring, guessed plaintext, or limited-key sweep enters the exclusions. A separately keyed function per node, a depth/address-dependent update, changed p55/p56 receiver order, non-symmetric structural folding, or an intermediate ciphertext rather than literal GP29 plaintext could evade them. The manuscript does **not** presently supply an author-visible clue selecting such richer exceptions. The complete original-table and known-plaintext calculations are added to the same [single-file CJS reproducer](../sims/lp2_p50_base59_tree95_p56_knownholdout_sft.cjs), rather than launching an unrelated new family search.

## Decision

The base59 one-root tree and 95-leaf/p57 length alignment remain interesting candidate source geometry, though leaf count **95** follows mechanically from the original 161 distinct table values and is not an independent key signal. The direct eight-model leaf-derived additive pad fails on p55/p54–55 compared with shuffled p57 leaf orders, and the separately fixed 24-model internal-node **plaintext** reconstruction fails the 85-symbol known-p56 holdout. The stronger *unrestricted unary function*, source-visible 256-glyph, and *arbitrary symmetric leaf-multiset* tests reject their complete stationary tree-fold families across every tested source-natural receiver by hard original-rune contradictions. None recovers unknown LP2 plaintext, key material or a destination. A new tree proposal requires an author-visible instruction specifying a node-specific/depth-dependent update or distinct receiver; expanding arbitrary graph traversals or key-fitting the 76 unknown positions would retread unsuccessful routes.
