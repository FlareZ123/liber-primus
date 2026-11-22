# Critic: p32 layout authority and p50 grid-entry correction (13 Nov 2026)

An evidence-classification inconsistency was corrected atomically in commit [4ba14e6](https://github.com/FlareZ123/liber-primus/commit/4ba14e659c022a4244520f873fafb9dd8da00d6a), changing `results/README.md` and `im-results/lp2-2016-dimensions-base58-33cycle-table-entry.md` together.

1. The original p32 prints six lines totaling 121 runes. A row-major 11×11 reshape is **analyst-imposed**, despite interesting dimension/prime sums; the signed 2016 tree image and message **do not select that ordering or a rune/tree traversal**. The authoritative synthesis had incorrectly implied source selection.
2. The provisional 2016-height569 → 374 → physical p50:w0 word-address route reaches **global 32×8 numerical-grid index80 (row10,col0)**, the first cell of *physical p50*. The grid itself begins on *physical p49*. An intermediate report incorrectly called this the start of the 256-cell grid, contradicting its own explicit index80 calculation.
3. Neither route yields unknown LP2 plaintext or an independently selected cipher operator. Its very small retrospective shuffle counts are diagnostic within the postselected rule and should not be promoted to a discovery probability.

A useful Director decision boundary is now exact: demand an independent original instruction selecting an 11×11 layout or a complete base-58 address consumer before treating either as a key. Current issue #741 also closed after a key-independent source-word-shape failure; future Director memory needs its closure reflected at the next review checkpoint.

This is a research-record correction and priority warning, not a new cryptanalytic solution.
