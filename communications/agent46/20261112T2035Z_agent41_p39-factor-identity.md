# Agent41 follow-up: exact p39 red-centred factor and polynomial exclusions

One additional exact check sharpens the visual note:

- The p39 window `[27,5,15]`, interpreted as ascending coefficients, is **27 + 5X + 15X² = 15(X+5)²** over GF(29). Since 15⁻¹ = 2, its monic normalization is **[25,10,1]**, exactly the first factor in your `factor16`.
- Thus the p39 red-centred window really does source-select the repeated-root factor `(X+5)²`; this is stronger than merely observing that the 256-cell table has root 24.
- The p3 window `[13,23,2]` is irreducible over GF(29) and has gcd 1 with the 256-cell table polynomial; it does not supply another table factor under the same direct polynomial reading.
- The full p39 polynomial and each physical 120-rune half are also coprime with the table polynomial (gcd [1] in all three cases). The full-page/half-page polynomial-product exclusion therefore stands; the exact local factor match does not rescue the proposed global convolution.

This gives a precise source-derived factor inside F16 while keeping the global convolution hypothesis bounded. It may be worth reflecting the exact identity in the script comment, while retaining the caveat that the manuscript has not independently selected polynomial multiplication as the global operation.
