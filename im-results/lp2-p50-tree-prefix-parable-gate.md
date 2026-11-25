# Conditional base59 tree as a binary prefix decoder

**Agent 8, 25 November 2026. Decision:** no unknown plaintext. The direct tree-prefix receiver fails both a source-known p56 check and complete p55 decoding. This is a bounded alternate consumer, not evidence against the tree's existence or every possible codebook.

## Source and operation

The conditional base59 map from pp49–51 deletes lowercase f from the numeric alphabet and forms a rooted tree of 256 addresses, root189, with 95 leaves. This was previously established ([tree/Prüfer report](lp2-base59-tree-prufer-reversible-code.md)); the 95 leaves match the 95 original p57 GP runes but the match follows from the occupancy count. Prior leaf-label work propagated sums or lookup functions toward the root ([prior leaf fold](lp2-p50-base59-tree95-p57-leaf-key-original-gate.md)); the present receiver uses root-to-leaf paths as a prefix code instead. The genuine tree illustration and PARABLE's instruction to shed circumferences motivate the experiment, but no first-party instruction selects this code.

- Label leaves in ascending original address order with the 95 clear p57 GP indices.
- At each node order children by ascending source address. For a degree-d node encode the child ordinal with standard truncated binary: k=floor(log2(d)), s=2^(k+1)-d. The first s ordinals receive k bits, the rest receive k+1 bits after adding s. Unary nodes consume no bits.
- Concatenate the local bits along each root-to-leaf path. Decode from the root to a leaf, emit its GP label, restart at root. Multiple leaves can share a label.
- Interpret original p55 and p56 as (i) five MSB-first bits per GP index; (ii) the binary representation of the unsigned whole-page BASE29 integer, minimal width. Do not discard any residual bits as padding or select new orders after inspecting output.
- Authentic p56 control reconstructs known plaintext with the documented prime-minus-one/F hold and verifies 85/85 original ciphertext symbols, 84 consumed primes.

## Exact original results

| Page | Input | Bits | Complete decoded GP symbols | Unconsumed suffix | Distinct labels |
|---|---|---:|---:|---|---:|
| p55 | fixed five-bit | 380 | 93 | 010 | 12 |
| p55 | whole BASE29 integer | 369 | 92 | 0 | 12 |
| p56 | fixed five-bit | 425 | 105 | 1 | 11 |
| p56 | whole BASE29 integer | 413 | 97 | 1 | 12 |

Neither p55 sequence is coherent prose. All four full input bitstreams replay exactly when actual selected leaf addresses and the unconsumed suffix are retained; this is an implementation invariant, not an identified key. The p57 native label control encodes via the shortest matching leaf (ties by address), then decodes 95/95 runes using 673 bits; this is an in-register implementation control, not an independent plaintext recovery.

The code has 95 distinct prefix words with lengths 2–25 bits, uniform-leaf mean 15.6736842 and Kraft sum exactly 1. It has no codeword for J, EO, X, OE, AE, IA or EA. **Any permutation of the authentic p57 label inventory** retains these omissions, so none can encode the known p56 X in EXISTS, even granting arbitrary branch orders and longer bit budgets. With the frozen assignment, the other 84 p56 symbols alone require at least 559 bits versus the 425/413 original bit budgets, independent of which homophonic leaf is selected. For comparison, with wholly unconstrained replacement leaf labels and fixed branch order, an optimistic minimum is 349 bits (pair decreasing p56 symbol counts with increasing shortest leaf lengths); thus the bit budget alone does not exclude such replacement codebooks. This distinguishes the exact source-labelled obstruction from an overbroad impossibility claim.

## Reproduction

From repository root: `node sims/lp2_p50_tree_prefix_parable_sft.cjs`. The complete experiment function was executed in the connected JavaScript runtime using original corpus and table JSON; standalone Node filesystem wrapper was not independently run. Source blobs: table 2550eae357442912220e05dc51147523a61dd75a and canonical corpus as fetched from main. Implementation commit [486fd5d](https://github.com/FlareZ123/liber-primus/commit/486fd5d37a816d16d4f54854d01de78a1da52961).

**Next decision:** retire direct p57-labelled prefix-code transfer to p55/p56 absent an independently selected missing-symbol escape mechanism and branch ordering. No reason to fit a replacement alphabet or arbitrary padding to the failed original. No new unknown plaintext, key, or destination.
