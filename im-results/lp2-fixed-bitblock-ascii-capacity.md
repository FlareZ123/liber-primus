# Fixed bit-block ASCII inverse — exact all-secret capacity exclusion

**Agent25, 28 November 2026.** This is independent cryptanalytic exploration after the executable Director queue became claimed or externally blocked. It extends the earlier stationary direct 5-bit UTF-8 packing gate to an explicitly different and substantially more permissive bit-transposition family. No source currently selects this family; the result excludes it, not all binary or non-GP registers. No unknown plaintext or key.

## Frozen model

Take the 12,956 original physical p0–55 rune indices in canonical continuous order, ignoring all printed spaces. For 7-bit ASCII, split the tape into seven-rune blocks at any of seven starting offsets. Each of the seven rune lanes has its own arbitrary secret injection of 29 GP symbols into the 32 five-bit words. Concatenate the seven five-bit values, apply one arbitrary secret fixed permutation of the 35 bit positions, and read five 7-bit characters. For 8-bit ASCII the corresponding block is eight runes, 40 bits, five 8-bit characters, any of eight starting offsets. This grants unrelated lane maps and any fixed bit order, including reflection or interleaving; fixed bit complements can be absorbed into the lane maps. It does not grant changes of bit order or maps from one block to the next, arbitrary inter-block transpositions, additional compression/encryption layers, or variable-width codes.

The necessary ASCII condition in the 7-bit variant is that no character has top-three-bit pattern 001 (ASCII 16–31). In particular, the ordinary printable range and TAB/LF/CR all satisfy this, as do other usual low-valued whitespace controls. This is weaker than requiring printable text or a particular dictionary. In the 8-bit variant every top bit is zero for ASCII, even allowing arbitrary ASCII controls.

## All-secret obstruction

An injective 29-of-32 five-bit map omits precisely three codes. For any selected k distinct bits and prescribed pattern, at least 2^(5-k)-3 rune labels realize it. For k=1,2,3 this is at least 13,5,1 respectively. The actual output high bits must be routed from some distinct source bit positions, irrespective of the secret maps or bit permutation.

All witnesses below use an interior margin (seven or eight runes at each end), so a lane residue and positive intra-block gap uniquely specify a subset of observations shared by every block-origin placement with those relative positions. In the seven-rune case the three high bits have exactly three possibilities:

1. **All from one rune lane:** every label occurs at least 42 times in each interior phase, so any chosen three-bit pattern occurs.
2. **Two from one lane, one from another:** the required sets have sizes at least 5 and 13. Across all 42 residue/distance matrices, every 5×13 rectangle has count ≥32, and every 13×5 rectangle has count ≥31. For a matrix M, a valid lower bound on any x×y rectangle is the sum of the x smallest row-wise sums of the y smallest entries; taking the maximum with the transposed calculation strengthens the relaxation. Both bounds are positive.
3. **Three distinct rune lanes:** their required sets each have size at least 13. For each of the 7 residues and 15 positive gap pairs with total gap ≤6 (105 cases), build the observed triple hypergraph. Partition the first alphabet into fixed disjoint groups of sizes 7,7,7,8. Every set of 13 labels contains four labels from at least one of these groups, by the pigeonhole principle. For each of the 175 within-group four-subsets, take the union of its observed second/third-label edges. If an empty 13×13×13 box existed, the complement of at least one such projected graph would contain a complete 13×13 biclique. The exact rectangle search finds no such biclique in any of the 18,375 projected graphs (570,125 DFS nodes). Core pruning is sound because a vertex in a k×k biclique has at least k neighbors within that biclique. Subsequent DFS exhausts increasing row selections, intersecting the still-possible columns; pruning a row whose intersection has fewer than k columns cannot discard a witness.

Thus **every three-bit pattern occurs in every possible output character column**, including 001. No secret lane alphabet or fixed 35-bit permutation under any of the seven block phases can produce only ordinary 7-bit ASCII text, even with normal whitespace controls. This conclusion uses no language model, dictionary, guessed message, alphabet order, or word boundaries.

A separate lower bound counts all characters with top-two-bit pattern 00, including any legitimate controls. Same-lane minimum 245; distinct-lane minimum 112. Consequently at least 5×112=560 characters out of 9,250 from any complete seven-rune grouping are below ASCII 32 (at least 6.05%). The three-bit proof, rather than this frequency bound, excludes ordinary ASCII with whitespace.

For 8-bit ASCII, a source bit has ≥13 labels with value one. The smallest possible count across all eight interior residue histograms is 627. Each of five output character columns therefore has at least 627 bytes with high bit one, or ≥3,135 in total. This excludes all 8-bit ASCII under the full frozen family; it does not exclude general eight-bit data or variable-length Unicode.

## Reproducible controls and results

- Corpus Git blob: `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; canonical p0–55, 12,956 indices.
- [Executable SFT](../sims/lp2_fixed_bitblock_ascii_capacity_sft.cjs), script blob `06c4c1cd52d5fdbe412798d28b7f66d58dc914ac`. Deterministic rectangle engine agrees with independent brute force on 256 small cases (155 positive/101 negative).
- Two planted controls use the literal known p57 transliteration repeated with newline separators. Random fixed bit permutations are sampled until all lane supports fit 29 labels, then hidden per-lane injections are generated. Both are genuine members of the model; not a blind key-recovery result. Each decodes 10,100/10,100 characters exactly. In the 7-bit plant the first character high bits occupy lanes [2,4,5], no 001 occurs, and the certificate correctly fails (175/175 projected graphs admit a biclique). In the 8-bit plant the actual high bit occupies lane0 and the capacity lower bound is zero. No false exclusion of these valid plants.
- Exact committed CommonJS source executed in connected V8 with require/assert adapters. Wall time about 6.7 s. Standalone Node and Actions execution not separately performed. Seed initial 0x25a5c117; final 1644783194.

## Decision

Retire fixed continuous 7-rune→5 ordinary 7-bit ASCII and 8-rune→5 ASCII models even with arbitrary independent injective lane maps and arbitrary fixed intra-block bit transpositions. Other block widths, changing per-block maps, noninjective maps with side information, non-ASCII byte registers, and non-bit-aligned BASE29 serialization are outside the result. This is a genuine structural exclusion, not an original decryption or proof of an intended encoding. Do not expand into speculative binary transformations absent a source-selected receiver.
