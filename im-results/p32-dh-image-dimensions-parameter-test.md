# p32 image-dimension DH parameter hypothesis: exact tuple, no decoded text

**Classification:** exploratory cross-round hypothesis with a reproducible numerical derivation and two bounded negative consumers. It is **not** an established cipher, key, plaintext, or intended solution.

## Why this route is worth one bounded test

The 2016 signed tree image is 563×569. The p32 page is a 121-rune, 11×11 block; under the repository's source-selected row-major orientation, the first row and first column sums of GP prime values are exactly 563 and 569. The signed 2013 TCP source documents both a Diffie–Hellman exchange and BASE29 conversion. The 2016 message's map/road/direction wording makes a coordinate or route interpretation conceivable.

The human-solve-path hypothesis is: recognize the p32 tree/map and its 11×11 layout; notice that its first row/column prime sums match the signed 2016 image dimensions; recognize the DH operation from the signed 2013 challenge; use the remaining in-range prime sums as the two public values; convert the shared secret with the source's BASE29 operation. This is a plausible route a solver could attempt, but the role assignment is inferred rather than explicitly instructed.

## Frozen derivation

The canonical p32 prime-weight sums are:

- Rows: `[563, 617, 287, 540, 743, 513, 577, 579, 603, 537, 486]`
- Columns: `[569, 429, 641, 669, 518, 611, 463, 690, 378, 578, 499]`

Prime row sums are `[563, 617, 743, 577]`; prime column sums are `[569, 641, 463, 499]`. Taking the 2016 image width/height as (g=563), (p=569), and requiring the remaining public values to be prime sums below (p), leaves exactly (A=463), (B=499).

The resulting standard DH tuple is:

| Quantity | Value |
|---|---:|
| Prime modulus (p) | 569 |
| Base/generator (g) | 563 |
| Public values (A,B) | 463, 499 |
| Multiplicative order of (g) mod (p) | 568 |
| Private exponents (log_g A,log_g B) | 149, 256 |
| Shared secret (A^{256}=B^{149}pmod{569}) | **291** |
| BASE29 representation of 291 | **A1** |

The signed 2013 worked example is a positive control: (p=23,g=5,A=8,B=19), private exponents 6 and 15, shared secret 2. The source's BASE29 example (3301\mapsto3QO) also checks the digit alphabet used here. The candidate secret 291 converts to base29 digits ([10,1]), displayed as `A1`.

Two additional alignments are notable but not proof: the second private exponent is exactly 256, the p50 table's cell count; and `A1` resembles a coordinate in the p32 11×11 map. Neither alignment supplies a next operation by itself.

## Bounded original-cipher tests

The cheapest direct key interpretation is to use BASE29 digits ([10,1]) as a repeating GP29 additive key on p32. No zero-key literal-F exception is involved. All three standard directions are nonlinguistic:

| Direct mode | Gibran-trained GP trigram score |
|---|---:|
| Subtractive | -6.197463570060 |
| Additive | -6.335669389321 |
| Beaufort | -6.314105908029 |

A second cheap interpretation treats `A1` as the start cell (linear index 0) and the shared secret modulo the 121-cell grid as the route step: (291\bmod121=49), with (gcd(49,121)=1). Both natural read/write orientations fail:

| Route orientation | Step | Score |
|---|---:|---:|
| Read cells in path order | 49 | -6.517839670740 |
| Scatter/inverse path | 49 | -6.288564971552 |

For comparison, the raw p32 score is -6.344566925664. The 150 native 121-rune controls have minimum -3.379349697120, median -2.401001152434, and maximum -2.073305968085. Every tested output is below even the weakest native control. These are direct-consumer negatives, not a rejection of all coordinate or route uses.

Exact derivation and scores are reproduced by [`sims/p32_dh_image_dimensions_parameter_sft.cjs`](../sims/p32_dh_image_dimensions_parameter_sft.cjs); the push-triggered CI gate uploads the complete JSON output.

## Evidence classification and weakest assumption

**Established inputs:** p32's 121 canonical rune indices; its row-major 11×11 arrangement; the 563×569 dimensions of the signed 2016 tree image; and the signed 2013 DH/BASE29 worked operations.

**Mathematical derivation:** the four-number tuple above is a valid DH exchange; the discrete logs, shared secret, and BASE29 representation are exact and independently checkable.

**Hypothesis:** that the image dimensions should be assigned to (g,p), and the two remaining prime sums below (p) should be assigned to (A,B). The signed 2013 protocol's live server chooses a random base and secret; it does not tell a solver to map p32 sums into a static four-value DH tuple. Thus this is not yet a source-authenticated parameter selection.

**Strongest objection:** the match between two p32 sums and image dimensions may be an attractive numerical alignment, while the assignment of the remaining two primes to public shares is an inference. The shared secret's `A1` form and exponent 256/p50-size match may be coincidences. No authentic plaintext or independently selected next cipher follows.

## Decision

Preserve this as a provisional cross-round candidate, not as progress in recovered plaintext. Direct use of `A1` as a repeating key and the simplest step-49 transposition are rejected. Do **not** expand into arbitrary affine permutations, KDFs, offsets, or generic tree walks.

The only worthwhile successor is a bounded source audit asking whether an original artifact gives a unique meaning to `A1`, the 149/256 exponent pair, or the 256-cell p50 table in the p32 tree/map context. If no source-selected traversal or reversible consumer can be identified, retire the branch. The existing [p32 tree source audit](lp2-tree121-signed2016-source-gate.md) remains correct that no unique traversal has been established.

## Sources

- [Signed 2013 TCP DH/BASE29 source](../resources/external/2013-tcp-server-signed-source.md)
- [p32 2016 signed tree/image-dimension source audit](lp2-tree121-signed2016-source-gate.md)
- [Canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json)
