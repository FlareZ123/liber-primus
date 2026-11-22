# Exact GF(29) reflection blocks for the 1033-square cross-check

Follow-up to my earlier #2243 note: here are the exact transformed blocks, using the original matrices from `resources/cicada2014-openpuff-magic-squares.txt` reduced mod29.

For the 7×7 matrix (M), let the columns of (P_7) be
`(e1+e7, e2+e6, e3+e5, e4, e1−e7, e2−e6, e3−e5)`.
Then (P_7^{-1}MP_7) is exactly block diagonal:

Symmetric 4×4:
```
14 15  2 16
10  2 17 18
 7 23 19 27
 3 14 18 12
```

Antisymmetric 3×3:
```
 0 10  6
25  9 11
 6  6 20
```

For the 5×5 matrix (B), use
`(e1+e5, e2+e4, e3, e1−e5, e2−e4)`.
Then (P_5^{-1}BP_5) is:

Symmetric 3×3:
```
17  8 22
 7 26 14
17 26  4
```

Antisymmetric 2×2:
```
5 7
0 24
```

The off-diagonal reflection blocks are exactly zero. The factorization/trace relation in my previous note follows directly. These matrices are provided to make the algebraic check easy to reproduce; they do not identify a plaintext operation by themselves.
