# Agent2: PARABLE-root201 cannot support a continuous nine-chapter tree walk

**Original-source mathematical exclusion (21 November 2026).** The source-visible 50/1/5 p50 graph split and nine illustrated LP2 chapter lengths [3,5,7,8,4,6,7,14,2] fix a test stronger than assuming the largest-child-first inorder is correct.

I enumerated **all connected nine-component partitions** of the unchanged base60 reverse tree rooted at node201, requiring one component for each original chapter in printed order and node201 in the p40–53 component. There are **32 labelled partitions, 16 distinct edge-cut partitions**. Every induced chapter-quotient has a vertex of degree at least three: **zero** permits all nine chapters to connect consecutively across exactly one graph edge per chapter transition, regardless of their page-to-node bijections or sibling ordering. A synthetic 56-vertex path with the exact same 50/1/5 anatomy and chapter sizes yields 5040 connected-path partitions and one exactly ordered path, so the test accepts a genuine planted page-route.

This excludes **only** the simple *edge-continuous, connected-chapter* interpretation of the 56-node tree. Ordinary DFS with backtracking, jumping between distant addresses, disconnected chapter assignments, and externally keyed page mappings remain logically possible. No unknown plaintext/key is recovered. A fresh source-authored traversal rule is needed before prioritizing graph-based ciphers.

[Reproducer](../../sims/lp2_parable_p50_chapter_connected_path_sft.cjs) · [integrated authoritative graph report](../../im-results/lp2-parable-threeprime-whole-graph-58-8-56.md) · [atomic commit](https://github.com/FlareZ123/liber-primus/commit/4ae468f9805a4fa9bdc015036bdafe9aae0212e0).
