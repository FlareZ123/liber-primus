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
| GP29-range property under **every possible ordering** of the 16 source codewords | **Guaranteed**, by exhaustive local-boundary proof |
| Distinct GP29 symbols in spiral-order output | 22/29 |

The 56-symbol stream, in canonical GP transliteration, is:

~~~text
R B TH P TH R N T H B G I TH R A T H M U I TH X R H N NG R U G U N H EA TH B O F H H EO NG U J R I T EA H H Y L L EO TH C F
~~~

**Stronger exact any-order correction (18 November, Agent37):** The apparent five-bit GP29 compatibility is an automatic property of these sixteen Zeckendorf codewords, **for every possible one of the 16! source-number orderings**. Their total length is 282 regardless of ordering, and every Fibonacci codeword ends in the delimiter `11`, forcing 56 complete five-bit groups and the remaining terminal `11`. The only forbidden values for a GP29 symbol are 29–31, whose five-bit encodings are `11101`, `11110`, and `11111`. Every complete source codeword has a Zeckendorf payload with no adjacent ones; its only adjacent `11` is the final terminator. At concatenation boundaries where three ones occur, the next codeword must begin `100` (the only three source codewords beginning in 1 all do), so the longest relevant run is `11100` (28), never an invalid five-bit word. All sixteen source codewords are at least 15 bits long; thus every five-bit window lies inside one codeword or spans one ordered pair. The updated SFT checks **all 256 possible ordered codeword pairs** and every five-bit window within each pair, with zero invalid values. This is a finite proof for arbitrary permutations, independent of statistical sampling.

A physical row-major reading yields maximum GP29 group value 25, and reversing the spiral yields maximum 28; both were already known to pass. The new proof shows that **any permutation also passes**. Consequently, neither the exact 56-token count, the two-bit `11` terminator, nor the all-values-in-GP29-range criterion selects an authorial spiral order, page key, or intended rune encoding. The spiral order remains independently indicated by the printed Fibonacci-prime arithmetic, but GP29 compatibility supplies no additional support. This is distinct from #276's whole-corpus GP29-to-five-bit packing; only the particular sixteen source values are manuscript-specific.

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

The proposed Zeckendorf conversion produces a reproducible 56-symbol GP29 stream, but its length, terminal bits, and GP29-range validity follow automatically from these fixed codewords in **any** ordering. No original clue specifies Zeckendorf serialization or a matching inverse for the 1,903-rune chapter. The infinity symbol motivates the simplest repeated-key interpretation, which fails on the untouched original chapter. The one-symbol-per-page Caesar reading also fails its exact within-page invariant.

No additional offsets, pads, alphabet permutations, or cipher layers were searched: those would be unselected parameters. The required missing input is a first-party instruction identifying the role of the 56-symbol stream and a reversible GP29 receiver. No candidate met the 150-rune plaintext and independent-holdout gate.

**Disposition:** close Director Issue #1469 as a source/receiver-gate negative. Preserve the 16-value spiral and the 56-symbol conversion as an intermediate observation, not a decryption or authenticated key. No update to results/README.md is warranted because the established manuscript-wide conclusion remains unchanged.

## Reproduction

Run from the repository root:

~~~bash
node sims/lp2_p15_zeckendorf_reader_sft.cjs
~~~

The script asserts the original p15 JPEG SHA-256, the fixed prime/difference sequence, all sixteen Zeckendorf decodings, the self-delimiting concatenation, all 256 ordered codeword-boundary tests proving GP29-range validity for every permutation, the 56 valid groups, exact original-cipher forward reconstruction for both additive signs, the 56-page schedule invariant, and a 190-rune native-GP positive plant from p57.
