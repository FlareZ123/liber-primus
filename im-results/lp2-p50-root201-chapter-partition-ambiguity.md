# LP2 p50 root201: original chapter sizes leave 305 connected-tree partitions

**Agent17, 21 November 2026. Evidence: exact original-table, conditional graph census. No recovered LP2 unknown plaintext, authenticated key or destination.** Reproduce using [the read-only CJS](../sims/lp2_p50_root201_chapter_partition_sft.cjs).

## Source-selected premises and testable conjecture

Prior research established that the clear p57 PARABLE clause prime sums [1259, 1031, 1229] have ordinal addresses [205, 173, 201] in the original 256-cell p49–51 table, **conditionally** interpreted as ordinary base60 bytes. Reverse edges of the byte-index functional graph from cell201 yield exactly **56 vertices**, including201, with children82 and128 and subtrees of **50 and5** nodes. Earlier work proposes this source geometry could correspond to the 56 physical unknown LP2 pages pp0–55, with rune-free p50 at node201, but neither assignment nor page traversal is authenticated.

A distinct original-visible constraint comes from the nine physically printed chapters, with page counts **[3,5,7,8,4,6,7,14,2]**. Numeric page50 lies in the **14-page** pp40–53 chapter. The hypothesis tested here is that each chapter occupies **one connected component** when exactly eight reverse-tree edges are cut. This **broad** model only anchors node201 to the pp40–53 chapter; it does **not** constrain the 50-node child82 subtree to pp0–49 and the five-node child128 subtree to pp51–55. A unique partition would have made the graph-to-chapter route substantially more concrete.

## Exact dynamic-programming result

The complete original grid is pinned by SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. A bottom-up tree DP tracks the mask of assigned complete chapter components and the size of the single still-open connected component. For each child, either join its open component or cut the edge and assign its exact size to an unused original chapter slot. Root201 must close the 14-node chapter. All 56 vertices appear once.

| Quantity | Exact outcome |
|---|---:|
| Original reverse-tree size | 56 |
| Labeled chapter assignments meeting all sizes | **610** |
| Distinct eight-edge cut sets | **305** |
| Edges joined in all 305 cuts | **21 of 55** |
| Edges cut in all 305 cuts | **0 of 55** |
| Nodes always in p50's 14-node component | **43, 73, 79, 82, 201, 226** |

Because two original chapters each have length seven, swapping their labels gives two counted assignments for the same cut set: 610/2=305. Each of the 610 assignments has eight cuts; the SFT checks the total edge-cut tally **4,880**. It additionally verifies a complete explicit source-node witness, a positive four-node path and a negative four-node star.

The forced connected core **201–82–79–73–43**, with branch **73–226**, implies that **node73 must share p50's pp40–53 chapter** under this connected-chapter hypothesis. The separately published largest-child-first inorder hypothesis places node201 at physical p50 but node73 at physical **p32**. These assumptions conflict. This proves neither is historical: connected chapters are a newly tested *conjecture*, while the inorder itself has no authenticated author selector.

## Decision and scope

The chapter sizes and root position do **not** uniquely determine a page mapping; 305 incompatible partition cut sets survive this broad exact source-constrained rule. A **separate contemporaneous tighter test by Agent2** additionally enforces the physical 50|1|5 split by requiring all pp0–39 chapter nodes to come from subtree82 and both pp54–55 nodes from subtree128. It finds **32 labeled assignments /16 distinct cut sets**, and excludes every single-edge continuous path across the nine chapters. These counts are compatible: Agent2's 16 partitions form a strict subset of the 305 counted here. See [Agent2's stronger path test](../sims/lp2_parable_p50_chapter_connected_path_sft.cjs) and [their source report](lp2-parable-threeprime-whole-graph-58-8-56.md). The forced root core offers a conditional prediction for any future graph-as-chapter model and exposes a concrete conflict with the attractive node73→p32 reading. It provides no encryption inverse or genuine unknown-page plaintext.

A productive next route needs **first-party evidence of traversal or edge-state decoding**, or a held-out plaintext prediction, before assigning ciphertext pages or fitting keys to this tree. The earlier [p57 50+5 edge-label decryptor](lp2-p57-title-body-50-5-tree-edge-gate.md) tested simple additive/prime-clock consumers without recovery. This bounded result belongs in intermediate evidence; no authoritative synthesis conclusion has changed.
