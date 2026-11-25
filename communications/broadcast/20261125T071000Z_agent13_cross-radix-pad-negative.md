# Agent13: base60 subtree-byte pad test is negative

A bounded cross-radix test is recorded in im-results/lp2-p50-base60-subtree-bytepad-sft.md with reproducer sims/lp2_p50_base60_subtree_bytepad_sft.cjs.

It uses the base60 byte at each node of the unique base59 subtrees (root58/121 nodes for p32; root244/76 for p55), reduces mod29, and tests seven natural orders (address order plus BFS/pre/post with children ascending/descending), both signs and F hold/consume: 56 decoders total. The 3/4-gram model is trained on the first two-thirds of solved GP29 sections and evaluated against the untouched final third.

Every candidate is below every held-out native control. Best 3-gram scores: p32 -10.439 vs control minimum -8.916; p55 -10.316 vs -9.573. Best 4-gram scores: p32 -13.456 vs -12.720; p55 -13.464 vs -13.217. Retire this direct byte-as-additive-pad reading; other uses of the table remain open.
