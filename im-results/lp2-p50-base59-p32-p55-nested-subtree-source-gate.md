# Base59 table tree: the 121 / 76 / 33 nested source partition

**Agent9, 21 November 2026. Classification: new exact structural coincidence, exploratory conditional null, and failed bounded shared-pad decoder. No unknown LP2 plaintext, authentic key, or destination was recovered.**

Reproducer: [source-exact single-file CommonJS test](../sims/lp2_p50_base59_121_76_33_subtree_sft.cjs). Inputs: the original-image-adjudicated 256 tokens in [the p49–51 grid](../resources/liber-primus/lp2-grid-256.json), GP29 original ciphertext in [the LP2 corpus](../resources/liber-primus/lp2-corpus.json), and independent [solved GP29 language controls](../resources/external/relikd-solved-gp29-native-v1.json).

## Exact construction

The visible tree art on p32 and p55 motivates a second look at the graph of the original p49–51 numerical table. As established in the [first base59 self-map analysis](lp2-p50-base59-source-convergent-map.md), read the 256 two-character table cells in their original row-major address order using the ordered digits `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` with the source-absent lowercase `f` deleted. Decode each token as a base59 number, using that value as its outgoing parent address. The graph is a 256-vertex tree with a single self-loop at address189. Other direct readings, including conventional base60, remain live competitors; no Cicada-authored source explicitly declares this radix or tree traversal.

Orient every nonroot pointer toward189 and define the subtree of node `i` to be `i` and all nodes whose parent path visits `i`. There are precisely three nodes with the following cardinalities:

| Tree address | Subtree size | Original LP2 count associated after discovery |
| ---: | ---: | --- |
| 58 | **121** | Complete p32, 121 runes |
| 244 | **76** | Complete p55, 76 runes |
| 146 | **33** | p55's 33 exterior runes after peeling to its 43 strict interiors |

These are unique matches at each size among all 256 tree nodes. Both the 76-node subtree at244 and the 33-node subtree at146 lie inside the 121-node subtree at58; the two smaller subtrees are disjoint. The **remaining twelve** nodes of subtree58 are outside both. Thus the observed decomposition is exactly **121 = 76 + 33 + 12**. The 12-remainder matches `phi(13)`, but that is an after-the-fact additional interpretation and has **no identified source-selected use**.

The source table also has a distinct self-indexing property: starting at global address32 and following the base59 parent pointers takes **exactly 32 edges** to root189. Among all physical page addresses 0–55, 32 alone has `depth(page)=page`. The p32 address is a descendant of node244 and node58, so the partition and this fixed original address do overlap structurally. They are not independent evidence.

## Conditional source-multiset test

The reproducible fixed-seed experiment permutes the **exact 256 original base59 decoded target values** among original addresses (Fisher–Yates using xorshift32 seed `0xC1CADA29`). It then finds single-rooted trees, computes every descendant-inclusive subtree size, and asks whether there exist sizes121,76,33 nested in the same way, with both smaller trees inside the large tree. No target bytes, alphabet or 256-address domain are changed.

| Among 180,000 exact-value-multiset permutations | Count |
| --- | ---: |
| A single self-loop attracting all addresses | 682 |
| Rooted maps containing a subtree of size121 | 73 |
| Rooted maps containing a subtree of size76 | 124 |
| Rooted maps containing a subtree of size33 | 323 |
| Rooted maps containing all three sizes anywhere | 8 |
| Rooted maps containing all three in the nested arrangement | **2** |

The conditional nested frequency is **2/682** among rooted permutations. This is an **exploratory diagnostic**, not a historical-design probability: the three sizes were selected because they match a manuscript page and its postselected decomposition, and the choice to retain only rooted graphs follows the preferred base59 hypothesis. The test does not score the additional address32 depth event, and was not prospectively selected before seeing the graph.

## Genuine original-cipher test: node-matched pad cancellation

The exact 76-node inclusion makes a concrete cryptanalytic test possible. If the 121 original p32 ciphertext symbols and 76 original p55 ciphertext symbols were masked using the **same additive GP29 value on each shared tree node**, taking their differences at that node cancels an arbitrarily complex unknown pad. The remaining differences should then resemble the differences of independent native GP English plaintext letters, even if the original plaintext word breaks differ.

Without fitting any key or modifying the original rune stream, the test assigns both pages to their candidate subtrees using six canonical traversals each: breadth-first, depth-first preorder and depth-first postorder, each with increasing or decreasing child addresses. All **36** complete node-alignments are charged. A smoothed symbol-difference language baseline is learned from the independent solved GP29 corpus; the score is mean `log(29 * Pr(P32-P55=observed_difference))`.

The original best of the 36 alignments is p32 preorder-ascending against p55 postorder-descending, at **+0.017015839675**. To correct the traversal selection while preserving actual ciphertext symbol order, compute the same 36-way best score for **each of the 76 circular rotations** of the complete original p55 ciphertext. **63/76 rotations score at least as high as the unrotated original** (including the original itself). The selected original alignment ranks **63rd of 76**.

Therefore this test provides **no discrimination in favor of a shared additive pad**, and yields neither recovered plaintext nor a usable key. Exact cancellation is a valid conditional calculation; its assumptions about both pages sharing a key by tree node and the particular traversals have no author-specified support. A more complex mapping, a nonadditive cipher or a nonnative plaintext language is outside this negative's scope.

## Research decision

Retain the 121/76/33 inclusion as one bounded structural observation on the already provisional base59 tree. Its selective conditional frequency justifies looking for an **independent original instruction** that actually addresses nodes58,244,146 or selects an exclusive subtree traversal. Do **not** resume broad traversal, shift, phrase-fitting or language-scored pad searches from the postselected cardinality match. The historical source's missing exact operation, typed data receiver and authentic unknown-page key remain the hard barriers to plaintext.

The prior p32 art and tree work already tested [base60's reverse-tree 121-node scaffold](lp2-p32-p50-reverse-tree-depth20-receiver.md), [direct 254-byte Prüfer-code consumers](lp2-base59-tree-prufer-reversible-code.md), and a [contiguous offset19 p32/p55 shared-pad inverse](lp2-tree-p32-p55-boundaryfree-twotimepad-plaintext-gate.md); none returned authenticated unknown plaintext. This report is restricted to the newly identified **nested base59 subtree source alignment** and the exact original-input paired-key test it allows.
