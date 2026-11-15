# p3/p39 119-prefix key and LFSR tests against original LP2

**15 November 2026 · Agent33 · bounded original-source family tests, now including a GP28 predecessor-exclusion inverse.** No unknown plaintext, key, or destination recovered.

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

### Direct 119-symbol GF841 field key

Before extending the prefix state with a recurrence, the paired 119 field elements can simply be used as a repeated additive key:
\[
P_i=C_i\pm s_{i\bmod119}
\]
in the p3 field basis. Test p3/p39 or p39/p3 coordinate order, forward/reversed key order, raw or F-skipped ciphertext, and both signs (16 models). Best IoC is **0.034514**, essentially the uniform baseline; no language appears. The F-skipped stream again contains 6,249 field elements.

### GF29 degree-238 recurrence

The same two 119-rune prefixes can instead be concatenated into a 238-symbol GP29 state:
- p3 prefix followed by p39 prefix;
- p39 followed by p3;
- either concatenation reversed.

Use Q238 or its reciprocal as the degree-238 feedback polynomial, then test both signs against the original 12,956-rune stream. This gives **16 models**. Best IoC is **0.034536**, again essentially the uniform baseline, with no plaintext.

### Nonrepeating GP28 chained cipher with Q238 running key (15 November 2026)

An independently established feature of the original unsolved LP2 stream is its **86** within-page same-rune adjacencies among 12,901 comparisons. That gives a distinct cipher hypothesis beyond the GP29 additive inverses above: treat each *nonrepeating* successor as one of 28 available ciphertext choices, with a repeated predecessor reserved for plaintext GP rune F and skipped on the key clock. This construction is completely reversible on the 29-symbol alphabet, though no Cicada instruction authenticates it. Use the same Q238/reverse-Q238 recurrence and the four original p3/p39 prefix-seed layouts as above, with a **single book-continuous LFSR clock** and a fictitious preceding F at the start of each physical page. At every nonrepeating original rune, take the cyclic or ascending-sorted 28-choice successor rank, subtract or add the next Q238 register state **modulo 28**, and map content rank 0–27 to GP rune indices 1–28. Original repeated successors and page-initial F suppressions emit F and do not advance the clock. Two signs × two ranks × two source factor orientations × four seed layouts give **32** fixed candidates, without fitting a plaintext crib or a secret initial state.

The [new original-source SFT](../sims/lp2_q238_red119_gp28_chained_original_sft.cjs), executed successfully on Windows Node 22 by [manual readonly CI run 43685664639](https://github.com/FlareZ123/liber-primus/actions/runs/43685664639), asserts the original 256 byte hash, complete Q238 factor derivation, the 119+119 marked-prefix input, all **12,956** source runes and **76** final unknown p55 runes. The 32 actual decoders each round-trip every unchanged ciphertext page; their original-source replay consumes **12,868** key states with **88** reserved-F events (the original 86 physical doublets plus two page-initial F equalities). All 32 independent *positive planted* native-GP controls using the authentic solved p57 are encrypted and recovered exactly.

| Original/candidate source | GP29 index of coincidence |
| --- | ---: |
| Untouched 12,956-rune unsolved LP2 | **0.0344783978645** |
| Best of all 32 Q238-seeded GP28 full-book inverses | **0.0353199243731** |
| Worst of all 32 | **0.0352563299778** |
| Independently printed solved p57 GP plaintext (95 runes) | **0.0627099664054** |

The maximum has forward Q238, reversed p3/p39 seed, cyclic successor rank and subtractive key sign. It emits **456** E runes, forced **88** F runes, and its entire p55 decoded segment has IoC **0.03122807** and begins NG IA S T B E W P O A EO X A OE G..., without source-native prose. All remaining variants have the same bookwide nonlinguistic output quality. The best p55-only IoC among the 32 was not a meaningful bookwide improvement and no p55 output yields a complete readable passage.

**Decision:** this particular source-derived Q238 LFSR + reversible GP28 nonrepeat transport does not recover unknown LP2 English plaintext, even though both halves are separately motivated by original-source numerical structure. A completely arbitrary 28-way relabeling at each evolving private state, an unknown external keystream, and a different author-selected output register remain outside this finite test. Do not make small adjustments to seed phases or clocks without a new independently sourced key/operation instruction.

### Positive controls and reproduction

The reproducer verifies the exact Q238 factor reconstruction and conjugate product, then checks planted GF841 and GF29 LFSR streams recover exactly under the same recurrence/decryption functions. It prints all model scores and best configurations:

- [LFSR seed reproducer](../sims/lp2_q238_p3_p39_prefix_seed_lfsr_sft.cjs)
- [Repeated field-key reproducer](../sims/lp2_p3_p39_prefix_field_key_sft.cjs)
- [Exact GF841 factor split](lp2-grid-q238-gf841-conjugate-split.md)
- [Q238 GP28 chained inverse with all original-input controls](../sims/lp2_q238_red119_gp28_chained_original_sft.cjs)

## Decision

The two 119-prefixes have produced **no source-native plaintext** under the tested direct additive, field, LFSR and GP28 chained registers. The tested source-linked factors include:
1. the two source-derived degree-119 GF841 conjugate factors, or
2. the degree-238 GF29 factor Q238;
3. the degree-238 Q238/reciprocal register driving a reversible nonrepeating GP28 successor cipher.

This closes these simple repeated-field-key and additive LFSR seed/readout interpretations only. It does not rule out using the prefixes as a one-time pad, external index, permutation instruction, non-linear state, or some other source-selected role. Without a separate instruction that selects a different state clock or output register, do not expand this into arbitrary phase, offset, or feedback-polynomial searches.
