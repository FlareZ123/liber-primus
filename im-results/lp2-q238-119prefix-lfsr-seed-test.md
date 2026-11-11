# p3/p39 119-prefix LFSR seed tests against original LP2

**11 November 2026 · Agent33 · bounded negative.** No unknown plaintext, key, or destination recovered.

## Source-motivated hypothesis

The original red triads on physical p3 and p39 each begin after exactly 119 runes. The original prefixes therefore give two 119-symbol lanes. Separately, the 256-byte numeric table leaves the monic irreducible factor Q238 over GF29, and over the p3-marked field GF(29²), Q238 splits into two conjugate irreducible degree-119 factors.

The split itself is mathematically forced for any degree-238 irreducible GF29 polynomial; it is not independent evidence of intent. The potentially meaningful source alignment is the pair of 119-rune prefixes at the two marked page offsets. A simple LFSR use is a bounded, human-plausible way to test whether those prefixes actually select the factor pair as a key generator.

The exact field factorization and its direct-coordinate limitations are established in [Agent35's companion report](lp2-grid-q238-gf841-conjugate-split.md). This test does not modify or challenge that result.

## Tests

### GF(29²) degree-119 recurrence

Use the p3 field presentation K=GF(29)[u]/(u²-3u-8), encoding a+bu as a+29b. Pair the two original prefixes by local offset:
\[
s_i=p3_i+29\,p39_i,\quad i=0,\ldots,118.
\]
This is exactly 119 field elements, the state size of either degree-119 factor.

For each of the two conjugate factors F119 and F119^(29), generate the recurrence
\[
k_{n+119}=-\sum_{j=0}^{118}F_j k_{n+j}
\]
from the source prefix state. Test only the natural finite variants: p3/p39 coordinate order or swapped, forward/reversed state order, raw adjacent-pair LP2 stream or F-skipped stream, and addition/subtraction. This gives **32 models**. The F-skipped stream is well-formed: 458 F runes are bypassed, leaving 12,498 runes = 6,249 field elements.

Best IoC is **0.034514**, against raw LP2 **0.034478** and the uniform-GP29 reference \(1/29\approx0.034483\). The best model is the F119 factor, p3/p39 forward state, raw stream, additive sign. Its output remains random-looking; no language appears.

### GF29 degree-238 recurrence

The same two 119-rune prefixes can instead be concatenated into a 238-symbol GP29 state:
- p3 prefix followed by p39 prefix;
- p39 followed by p3;
- either concatenation reversed.

Use Q238 or its reciprocal as the degree-238 feedback polynomial, then test both signs against the original 12,956-rune stream. This gives **16 models**. Best IoC is **0.034536**, again essentially the uniform baseline, with no plaintext.

### Positive controls and reproduction

The reproducer verifies the exact Q238 factor reconstruction and conjugate product, then checks planted GF841 and GF29 LFSR streams recover exactly under the same recurrence/decryption functions. It prints all model scores and best configurations:

- [CommonJS reproducer](../sims/lp2_q238_p3_p39_prefix_seed_lfsr_sft.cjs)
- [Exact GF841 factor split](lp2-grid-q238-gf841-conjugate-split.md)

## Decision

The two 119-prefixes do **not** act as a successful direct LFSR seed under either:
1. the two source-derived degree-119 GF841 conjugate factors, or
2. the degree-238 GF29 factor Q238.

This closes these simple additive LFSR seed/readout interpretations only. It does not rule out using the prefixes as a one-time pad, external index, permutation instruction, non-linear state, or some other source-selected role. Without a separate instruction that selects a different state clock or output register, do not expand this into arbitrary phase, offset, or feedback-polynomial searches.
