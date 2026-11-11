# 10-dot stencil binary-key test on the 553-rune p36/p38 interval

**Classification: bounded source-motivated negative; no plaintext or key recovered.**

## Why this test was selected

The two 10-dot red stencils on LP2 p36 and p38 occur at local rune offsets 99 and 186. The rune interval between them is exactly:

- p36 suffix after offset 99: 139 runes
- p37: 228 runes
- p38 prefix before offset 186: 186 runes
- total: **553 = 7 × 79**

The original 10-dot stencil has seven rows of three cells with alternating patterns `.#.` and `#.#`. Reading each row left-to-right as a 3-bit binary number, with dot=1 and blank=0, gives **[2,5,2,5,2,5,2]**. The values 2 and 5 occur in the p15 Fibonacci-prime table. The seven stencil rows align with the factor 7, and the 79-column/row dimension is also the 22nd prime identified in Agent30's separate p15/p53 red-span arithmetic. This suggests a compact, human-readable hypothesis: the stencil encodes a seven-symbol GP29 additive key for the 553-rune interval.

This is a hypothesis, not an established creator intention. The weakest assumption is interpreting the three stencil cells as a binary integer and using those values as additive GP29 shifts.

## Frozen test

The 553-rune interval was tested under both natural matrix orientations:

1. **79 rows × 7 columns:** the key repeats every seven runes.
2. **7 rows × 79 columns:** each 79-rune row receives one key symbol.

For each orientation, both additive directions were tested, as was the complementary binary reading [5,2,5,2,5,2,5]. This covers the two phase readings of the alternating pattern; no unconstrained key or phase search was run.

A length-matched Shakespeare GP29 control was encoded with the repository's existing transliterator. The key implementation was checked by encrypting and recovering that control exactly.

## Result

The original 553-rune interval has GP29 IoC **0.034233561**. The length-matched Shakespeare GP29 control has IoC **0.063068375**.

| Matrix layout | Binary reading | Additive direction | Output IoC |
|---|---|---:|---:|
| 79 × 7, period 7 | dots=1 | subtract | 0.034613570 |
| 79 × 7, period 7 | dots=1 | add | 0.034554603 |
| 79 × 7, period 7 | dots=0 | subtract | 0.034554603 |
| 79 × 7, period 7 | dots=0 | add | 0.034613570 |
| 7 × 79, row blocks | dots=1 | subtract | 0.034908405 |
| 7 × 79, row blocks | dots=1 | add | 0.033499751 |
| 7 × 79, row blocks | dots=0 | subtract | 0.033499751 |
| 7 × 79, row blocks | dots=0 | add | 0.034908405 |

All eight candidate decodings remain near-uniform, with IoCs between **0.033499751 and 0.034908405**. None approaches the control. The outputs are not coherent plaintext.

**Decision:** reject the direct additive GP29 interpretation of the 10-dot binary rows as a seven-symbol key on this 553-rune interval, under both natural 7×79 orientations and both signs/complements. A pure transposition/readout of the interval is also insufficient because its original IoC is already near the uniform baseline.

This does not reject a different source-selected use of the stencil, a nonlinear/stateful key consumer involving the p15/p53 79/78 arithmetic, or a different plaintext register.

## Reproduction

```sh
node sims/ten_dot_553_additive_key_gate.cjs
```

The script reads the canonical LP2 rune indices, extracts the three source-defined interval components, derives the binary row values from the original stencil pattern, runs the eight frozen variants, and verifies the additive inverse on a native Shakespeare GP29 control.
