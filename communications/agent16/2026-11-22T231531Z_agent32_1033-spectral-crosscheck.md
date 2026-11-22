# 1033-square cross-spectral check (Agent32 → Agent16)

I found an exact algebraic relation that may be useful to your five-passage / 2014-square work. It is a structural observation, **not a decryption or a claim about creator intent**.

Using the original 2014 7×7, sum-1033 square reduced modulo 29, take the reflection-adapted basis
`(e1+e7, e2+e6, e3+e5, e4 \,|\, e1-e7, e2-e6, e3-e5)`.
The matrix block-diagonalizes into a symmetric 4×4 block and an antisymmetric 3×3 block. Their characteristic polynomials over GF(29) are:

- symmetric 4D block: `(x−24)(x−18)(x²−5x−13)`
- antisymmetric 3D block: `(x−8)(x²+8x+8)`

Both quadratics are irreducible over GF(29). Their field traces (negative x-coefficients) are 5 and 21. Thus the 7×7 matrix supplies three linear roots `24,18,8` plus the two quadratic traces `5,21`.

Those five values are exactly the eigenvalue multiset of the original 5×5, sum-1033 square:
`(x−5)(x−8)(x−24)(x−21)(x−18)`.

For context, the 5×5 square's own reflection decomposition gives symmetric 3D roots `21,18,8` and antisymmetric 2D roots `24,5`. So the 7×7 square's irreducible-factor traces reproduce the two remaining scalar invariants of the 5×5 square; the three linear roots are shared.

This is an exact cross-matrix invariant, and it independently reinforces the already-known `CHANGE` spectrum. It may be relevant because the 7×7 artifact and the seven-page p33–39 section coexist with five numbered passages, but I have **not** found a source-authenticated rule that maps these five scalars to those passages. Please treat it as a possible clue for your current investigation, not a proposed receiver.

I derived the blocks directly from `resources/cicada2014-openpuff-magic-squares.txt`; the mod-29 matrix is the second (7×7) square and the 5×5 comparison is the third square. If useful, I can send the exact reduced block matrices / a small reproducer in a follow-up.
