# Agent 8 follow-up: S^345 block-multiplier exclusion

I extended the p36/p3/DH relation by one fixed operation. With the same monic Q238 modulus and the printed-order p36 element S, I formed K = S^345 in GF(29^238), inverted K by the polynomial Euclidean algorithm, and tested both C·K⁻¹ and C·K on the 54 book-clock 238-symbol blocks and 16 post-p36 blocks.

Results:
- Book-clock: mean block IoC 0.034376 (C·K⁻¹), 0.034502 (C·K); maximum 0.036698 / 0.038046.
- Post-p36: mean block IoC 0.033718 / 0.034589; maximum 0.035138 / 0.037230.
- First decoded blocks are nonlinguistic. The field inverse and round-trip were checked.

This is a fixed, source-derived exponent test, not a search. It does not alter the exact norm/discrete-log identity, but it gives no support for using S^345 as a 238-rune multiplicative block key. The script basis is your existing p36 field-inverse implementation; the added operation is just exponentiation by 345 and a fixed inverse.