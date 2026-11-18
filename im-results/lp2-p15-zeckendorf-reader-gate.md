# p15 Zeckendorf reader: exact 56-symbol output, but no chapter receiver

**Classification:** source-constrained intermediate result and bounded negative receiver test. No unknown LP2 plaintext, authentic creator key, complete cipher mechanism, or destination recovered.

## Original source and fixed input

The original physical p15 scan is resources/liber-primus/32.jpg (SHA-256 5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5, matching resources/liber-primus/SHA256SUMS.txt). The sixteen printed values, in the centre-out spiral order already established by the source reconstruction, are:

\[
3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516.
\]

They are the absolute differences from 3301 for the corresponding Fibonacci-indexed primes:

\[
2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817.
\]

This test uses the printed differences, not a guessed sign restoration or a reordered matrix read. The established source reconstruction and prior Fibonacci-recurrence exclusions are in im-results/lp2-p15-fibonacci-key-recurrence-rekey-capacity.md.

## One fixed self-delimiting conversion

For each positive printed integer:

1. Greedily compute its unique Zeckendorf representation using \(1,2,3,5,8,\ldots\).
2. Reverse the coefficient word to least-significant-Fibonacci-term first.
3. Append a 1 terminator. Because the Zeckendorf payload has no adjacent ones, each complete codeword ends in 11 and is self-delimiting.
4. Concatenate the sixteen codewords in the printed centre-out spiral order.
5. Read complete five-bit groups from the first bit, left to right. Five bits are the minimum fixed-width representation of a 29-symbol alphabet; no leading or trailing pad is inserted.

The exact result is:

| Quantity | Result |
|---|---:|
| Fibonacci codewords | 16 |
| Codeword lengths | 18,18,18,18,18,18,18,18,18,18,18,17,17,15,16,19 |
| Concatenated bit length | 282 |
| Complete five-bit groups | 56 |
| Remaining terminal bits | 11 |
| Groups in GP29 range 0–28 | 56/56 |
| Distinct GP29 symbols in output | 22/29 |

The 56-symbol stream, in canonical GP transliteration, is:

~~~text
R B TH P TH R N T H B G I TH R A T H M U I TH X R H N NG R U G U N H EA TH B O F H H EO NG U J R I T EA H H Y L L EO TH C F
~~~

A physical row-major read, used only as an ordering control, also gives 282 bits, 56 groups, a final 11, and 56/56 GP29-range values (maximum 25). Reversing the spiral also passes the same range check (maximum 28). Therefore, the fact that all groups fall in 0–28 does **not** authenticate the spiral order or establish a unique key. This is distinct from #276's whole-corpus GP29-to-five-bit packing, but the five-bit width itself is not new; only the 16-number Zeckendorf input is source-specific.

The output is a reproducible typed stream. It is **not** 56 runes of recovered chapter plaintext: it has only 56 symbols, contains 22 distinct symbols, and omits seven alphabet values. The two terminal bits are the final Fibonacci-code terminator, not an independently discovered ciphertext instruction.

## Candidate receivers tested

### Infinite additive key

The original page places an infinity symbol below the numeric square. The most economical use of the 56 GP29 values as a repeating key is therefore an additive GP29 stream, with no extra padding or key mutation:

\[
P_i=C_i-K_{i\bmod56}\pmod{29}
\]

and its opposite sign. Both signs were applied to the complete 1,903-rune p15–22 source sequence. The alternative of restarting the same key at the first body rune after p15's nine-rune red rubric was also measured.

| Input / interpretation | IoC |
|---|---:|
| Original complete p15–22 ciphertext | 0.03450195 |
| Repeating key, \(P=C-K\), full chapter clock | 0.03436767 |
| Repeating key, \(P=C+K\), full chapter clock | 0.03445664 |
| \(P=C-K\), fresh body-only clock after nine red runes | 0.03447314 |
| \(P=C+K\), fresh body-only clock after nine red runes | 0.03441680 |
| Clear p57 reference text | 0.06270997 |

Neither output yields coherent text over the chapter, and neither improves the original ciphertext's near-uniform rune distribution. The complete inverse re-encrypts the original 1,903 runes exactly, as every bijective additive key must. A separate 190-rune positive plant made by repeating the clear original p57 paragraph twice recovers exactly under both signs. This validates the implementation, not the historical hypothesis.

### One key value per unknown physical page

There are 56 unknown physical pages, matching the 56 output symbols. A natural competing interpretation is one additive Caesar shift per physical page, with output value \(K_p\) applied to page \(p\). This was checked on pages 0–55, including the p15–22 chapter.

A page-specific Caesar shift preserves every within-page equality, trigram-equality pattern, and index of coincidence exactly. The original p15–22 page IoCs are:

| Page | Runes | Original within-page IoC |
|---:|---:|---:|
| 15 | 159 | 0.03598440 |
| 16 | 267 | 0.03353890 |
| 17 | 273 | 0.03382892 |
| 18 | 260 | 0.03400653 |
| 19 | 271 | 0.03438568 |
| 20 | 269 | 0.03409532 |
| 21 | 273 | 0.03434066 |
| 22 | 131 | 0.03581914 |

Thus the direct one-symbol-per-page Caesar interpretation cannot repair the original within-page statistics. The 56-page count match alone does not select a more elaborate page cipher.

## Decision

The source-selected Zeckendorf encoding produces a complete, reproducible 56-symbol GP29 stream, but it does not specify how those symbols invert the 1,903-rune chapter. The infinity symbol motivates the simplest repeated-key interpretation, which fails on the untouched original chapter. The one-symbol-per-page Caesar reading also fails its exact within-page invariant.

No additional offsets, pads, alphabet permutations, or cipher layers were searched: those would be unselected parameters. The required missing input is a first-party instruction identifying the role of the 56-symbol stream and a reversible GP29 receiver. No candidate met the 150-rune plaintext and independent-holdout gate.

**Disposition:** close Director Issue #1469 as a source/receiver-gate negative. Preserve the 16-value spiral and the 56-symbol conversion as an intermediate observation, not a decryption or authenticated key. No update to results/README.md is warranted because the established manuscript-wide conclusion remains unchanged.

## Reproduction

Run from the repository root:

~~~bash
node sims/lp2_p15_zeckendorf_reader_sft.cjs
~~~

The script asserts the original p15 JPEG SHA-256, the fixed prime/difference sequence, all sixteen Zeckendorf decodings, the self-delimiting concatenation, the 56 valid GP29 groups, exact original-cipher forward reconstruction for both additive signs, the 56-page schedule invariant, and a 190-rune native-GP positive plant from p57.
