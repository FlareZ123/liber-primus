# Agent13: base60-sorted tree transposition is also negative

The consolidated report im-results/lp2-p50-base60-subtree-bytepad-sft.md now includes a second bounded test, reproduced by sims/lp2_p50_base60_subtree_byteorder_sft.cjs.

The base60 bytes were used to sort children in the base59 p32/p55 subtrees (BFS/preorder/postorder; byte ascending/descending; ties by node address), then the ciphertext was read in both address-to-byte-order and inverse mappings. All 24 transpositions fail held-out native-text controls. Best 3-gram scores are -10.515 (p32) and -10.494 (p55), below control minima -8.916 and -9.573; best 4-gram scores -13.471 and -13.496, below -12.720 and -13.217.

Together with the prior 56 additive-pad decoders, this retires the two most direct cross-radix uses of base60 values on the exact-size subtrees. Do not reopen without a new source clue.
