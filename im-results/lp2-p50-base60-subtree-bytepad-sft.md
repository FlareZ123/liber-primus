# Base60 subtree bytes as a GP29 additive pad: bounded negative

**Classification: tested, rejected for this exact decoder family. No plaintext or key recovered.**

## Hypothesis

The original p49–51 table has two distinct source-grounded readings: its base59 values form the rooted map (root 189), while its base60 values form a 256-byte vector. The 2016 signed instruction about words as a map and numbers as direction, together with the unique subtree/count matches, motivates one simple cross-radix test:

- the unique 121-node base59 subtree rooted at 58 corresponds in size to p32's 121 runes;
- the unique 76-node subtree rooted at 244 corresponds in size to p55's 76 runes;
- take the base60 byte at each selected node, reduce it modulo 29, and use that sequence as a direct additive GP29 pad for the corresponding page.

The earlier [subtree study](lp2-p50-base59-p32-p55-nested-subtree-source-gate.md) tested node IDs, parent addresses, edge differences and depth as numeric readers, but not the base60 cell value itself. The [six-cell source adjudication](lp2-pp49-51-ow-source-adjudication.md) establishes the disputed base60 readings; the complete local vector matches the independent external canon_256.hex byte-for-byte.

## Frozen test

For each page/subtree pair, the key sequence is the base60 value of the token at each node, modulo 29. The test uses seven natural orders: original address order (ascending node address); breadth-first, preorder and postorder, each with children ascending and descending.

For each order, both additive signs are tested, and F either consumes a key symbol or holds the key position. This gives **56 complete decoders** across p32 and p55. No key offset, affine transform, arbitrary permutation, or language-selected phase is fitted.

A 3-gram and 4-gram model is trained on the first two-thirds of each known solved GP29 section. Controls are windows from the untouched final third of those sections: 324 windows of length 121 and 491 windows of length 76.

## Results

| Target | Best 3-gram decoder | Best 3-gram score | Weakest held-out control | Best 4-gram score | Weakest held-out control |
|---|---|---:|---:|---:|---:|
| p32 / 121 nodes | BFS ascending, cipher−key, F consumes | −10.438973 | −8.915956 | −13.455807 | −12.719531 |
| p55 / 76 nodes | Preorder descending, cipher+key, F consumes | −10.315529 | −9.572612 | −13.463601 | −13.217115 |

Every candidate is below even the weakest held-out native-text control. The best 3-gram decodes are respectively 1.52 and 0.74 score units below those minima; the best 4-gram decodes are 0.75 and 0.25 below. The decoded rune strings remain nonlinguistic. The result is not a marginal ranking preference: the tested byte-as-pad interpretation does not produce the known plaintext language.

## Conclusion and boundary

Retire the **direct base60-byte modulo-29 additive pad** on the exact 121-node p32 and 76-node p55 subtrees, under the seven natural orders, two signs and two F policies above. Do not expand this into unconstrained key transforms merely to rescue it.

This does **not** rule out other uses of the 256-byte vector, other source-selected readers, or a different key material source. It establishes only that the most direct cross-radix pad interpretation of the exact-size subtrees fails.

## Reproduction

Run from repository root with Node 22 or newer:

~~~bash
node sims/lp2_p50_base60_subtree_bytepad_sft.cjs
~~~

The script reads the original grid, corpus and solved-GP29 control files, prints all best-candidate rune indices and control ranges, and asserts the frozen scores and below-control result.
