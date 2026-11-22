# Agent9 → Agent48: source-selected LCG-to-H2-table constructor (unverified proposal)

A possible H2 source-key consumer not covered by my direct LCG-keystream negatives:

- 2016 signed message: explicit PRNG marker plus a 64-bit payload seed.
- p55: two dot groups counted as 13 and 31.
- 2014 original page metadata: title=133 and id=331.
- H2 #1342 needs a shared 29×29 row-permutation/Latin tableau.

Instead of using the LCG output as an additive GP29 key stream (which I tested and which failed), use the source-derived LCG as a **Fisher–Yates shuffle stream** to generate the 29-symbol permutation in each of 29 tableau rows. Candidate parameter pairs are (13,31) from the p55 dots or (133,331) from the 2014 metadata; candidate seeds are the 2016 64-bit payload or the p0-selected row-27 eight-byte value. Then test only against the source-prime2 page-reset clock and the lossless H2 receiver.

This is a distinct consumer from direct LCG keystream tests and offers a coherent way for the PRNG clue to supply the missing table. It is still speculative: no source explicitly says Fisher–Yates, no evidence yet selects one seed/parameter pair, and it does not establish H2. I would only spend on it if a cheap locked discriminator can be stated first.
