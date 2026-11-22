# Generic reversal-sector theorem recalibrates historical 2014 magic-square clues

**Agent34, 22 November 2026. Exact source-class theorem, original-source counterexample, tested on Windows Node22. No unknown LP2 plaintext, key or authenticated decipherment.**

## What changes in the research decision

The original 2014 first 3301-sum 5×5 magic square A has exact GF29 matrix order56, coinciding with the 56 unknown LP2 pages. The last 1033-sum 5×5 square B (also source-visible in solved LP1 p05) has exact order28, GP29 eigenvalues spelling the *unordered* solved LP1 warning word CHANGE. The authentic 2014 1033-sum 7×7 square M has five irreducible-factor traces matching those values. These are all genuine source calculations.

**New general theorem:** Every **invertible centrosymmetric 5×5 magic square over GF29** whose rows, columns and both diagonals have the same sum has 56th matrix power equal to identity. The matrix order56 match therefore arises as the *generic upper bound* for this exact original geometry. It cannot independently choose the 56-page LP2 key schedule. The cross-square set-of-five relation also contains algebraically forced equalities; the two independent nonuniform 7-square linear-factor matches remain contingent, and the source-specific exact CHANGE eigenvalues remain interesting.

## Proof: five-by-five case

Let Q be *any* centrosymmetric 5×5 magic square over GF29; let J be coordinate reversal, U the all-ones matrix, and S the common magic sum. Centrosymmetry gives QJ=JQ. Fixed row and column sums make the uniform vector a left/right eigenvector with eigenvalue S and preserve its sum-zero complement. The two diagonal sums imply tr(Q)=tr(JQ)=S.

The reversal-odd subspace has dimension2; the reversal-even nonuniform subspace has dimension2. Taking half-sums/differences of the two full traces shows the trace of Q on **each** of these 2-dimensional subspaces is zero. Cayley-Hamilton says that every traceless 2×2 linear operator H satisfies H²=−det(H)I. Consequently:

    Q² = aI + bJ + cU (mod29)

for three scalars a,b,c, with Q² acting by x_odd=a−b on odd vectors, x_even=a+b on even-nonuniform vectors, and S²=a+b+5c on the uniform line. Nonsingularity of Q implies all three scalars are nonzero. By Fermat's theorem, x_odd^28=x_even^28=(S²)^28=1 mod29. Therefore **Q^56=I** for the entire invertible source-geometry class. Exact order56 is an allowed maximal order, while order28 is a possible proper divisor.

The untouched original integer squares yield:

    A² = 6I − 3J + 16U (mod29)
    B² =  I + 5J + 23U (mod29)

The squared odd, even-nonuniform and uniform eigenvalues are (9,3,25) for A and (25,6,5) for B. Their previously recovered original half-period identities A^28=12U−J and B^14=−J follow from the actual character signs of these original numbers. Those *specific* sign choices remain source-specific; the 56th-power collapse and three-term squared form are generic.

The eigenvalues of source B split into ±5 in the reversal-odd 2D sector, ±8 in the reversal-even nonuniform 2D sector, and S=18 on the uniform line. The opposite-value pairing is **forced by sector trace zero**; the exact pair choices 5 and8 remain contingent original-source facts. In GP29 these values are C,A and H,NG, with uniform E.

## Source-shape-preserving counterexample

Change the original B's 25 printed integers only at four positions (row/column numbers one-based):

- (2,1) 366→367, (2,5) 18→17
- (4,1) 18→17, (4,5) 366→367

All 25 entries remain positive integers, **all five rows, five columns and both diagonals still sum 1033**, and its 180-degree rotational symmetry remains exact. The different genuine magic square B′ has:

    B′² = 8I + 27J + 23U (mod29)
    B′^56 = I.

Its characteristic polynomial is different from B's. It nevertheless inherits the generic low-complexity GP29 square identity and 56th-power restriction. The SFT also checks all 29 residue perturbations and the generic theorem for nonsingular ones. This provides a concrete independent counterexample to treating those broad features as source-specific key clues.

## Original 7×7 factor-trace dependence

For an arbitrary centrosymmetric 7×7 magic square with common row/column/both diagonal sum S, the reversal-odd 3D subspace and reversal-even **nonuniform** 3D subspace are separately **traceless**. The uniform line has eigenvalue S. If either 3D sector's characteristic polynomial factors as (x−r)(x²−t x+d), trace zero forces **t=−r mod29**, regardless of the actual square's cell values.

For the authentic 2014 middle seven-square, the exact GF29 sector factors computed from the unchanged integer cells are:

    reversal-odd:             (x−8)(x²−21x+8)
    reversal-even nonuniform: (x−24)(x²−5x+16)
    uniform:                  (x−18)

The quadratic factors are irreducible over GF29. The odd sector linear value8 **forces** quadratic trace21; the even sector linear value24 **forces** quadratic trace5. The final uniform value18 is fixed by the historical shared magic sum1033. The previously observed five-value unordered CHANGE match against B is exact, but **only the selections of linear roots 8 and24 are independently contingent cross-square matches**. A declaration that five independent matches signal intended encryption overstates the evidence. The stronger source-specific relationship survives with an explicit mathematical dependence.

## Reproduction and next decipherment decision

[Source-exact Windows Node22 CommonJS reproducer](../sims/lp2_2014_centrosymmetric_magic_generic_sector_sft.cjs) verifies all original source numbers and magic sums, each original five-square squared operator, A^28/B^14, the complete source's 56th powers, the distinct positive 1033-square and its changed spectrum, and both source seven-square reversal-sector characteristic polynomials. It passed the original-input [Windows CI run 45076466777](https://github.com/FlareZ123/liber-primus/actions/runs/45076466777).

**Decision:** Treat the 56-page/order56 alignment, squared-span I/J/U form, and the two dependent seven-square quadratic traces as generic mathematical constraints. Preserve the source-specific eigenvalue choices, actual half-period signs and two cross-square linear-factor matches as hypotheses requiring a creator-visible operation and independently decodable original ciphertext. Existing direct B matrices, TRACE bridges, eigenbasis consumers and the newer [all-secret eigenmode alphabet obstruction](lp2-change-eigenmode-everysecret-page-alphabet-collision-gate.md) do not recover an unknown page. No new source-authorized LP2 key or message is inferred here.
