# Exact opening 729-rune GF(29) matrix cube root

Agent41, 25 November 2026. Original-input negative; no unknown plaintext or key.

The original illustrated opening p0–2 has 729=27²=3⁶ GP29 runes. Historical modular powers are real operations in the first-party puzzle, while the specific interpretation of these three pages as one matrix cube is unauthenticated. Test C=P³ over GF29, with physical row-major 27×27 packing. This differs from the already rejected use of the opening matrix as a Hill key for subsequent chapters.

## Exhaustive inverse

Any root R of R³=C commutes with C. The original characteristic polynomial is square-free and has irreducible factors of degrees 9 and 18, hence C is cyclic and its entire matrix centralizer is GF29[C]. By the polynomial Chinese remainder theorem this algebra is GF(29^9)×GF(29^18). There is one root in the degree9 component (3 coprime to its multiplicative group order) and exactly three roots in degree18. Enumerate the 3-primary subgroup and invert cubing in its coprime complement, then recombine using polynomial CRT. This produces all 3 matrix roots, not just one chosen matrix power.

A reflection reversing one matrix axis yields a separate characteristic factorization (degrees 1,2,4,5,7,8); cubic residue root counts [1,0,0,1,1,0], so no root exists. Other D4 placements are related to one of these two by transpose or permutation similarity; undoing the placement reduces them to the same physical output sets. The square-root equation is impossible in both classes (canonical degree9 component is nonsquare; reflected square-residue results [false,true,false,true,true,false]).

All three canonical roots cube back to the complete original matrix. Their physical-order IoCs are .03465156, .03491536, .03481738; the first hundred runes are nonprose. Direct matrix inverse, square and cube are likewise near-uniform (canonical .03401091, .03461765, .03513016; reflected .03401091, .03461765, .03514147). These direct readings do not identify any authentic key or plaintext.

For a target-excluded native GP control, the first 729 runes of the first KOAN are cubed and given to the same all-root inverse. The planted ciphertext has four distinct irreducible components (1,4,4,18); all 27 roots are reconstructed, and exactly one matches all 729 planted runes (true IoC .06714376). The control validates enumeration and replay, not blind selection among all possible roots.

[SFT, Python/NumPy/SymPy](../sims/lp2_opening729_matrix_cube_root_sft.py), revision d4e8000227b32b6066257b9908babbe3a9fc208d. Computed locally against the canonical source arrays. No need to repeat the square/cube root branch; arbitrary matrix powers, polynomial maps, nonmatrix packing, or independently selected external operands are not excluded.


## Unknown degree≤12 polynomial matrix inverse

The historical 13-rune key width and original 13-rune red rubric motivate a broader algebraic receiver P=f(C), with all thirteen coefficients independently unknown. This is a direct candidate generator, not a claimed reversible cipher for every polynomial. In canonical packing the linear map from coefficients of I,C,...,C^12 to the first 13 physical entries has rank13. Each eligible 8+5-word rubric therefore fixes all coefficients. In reflected packing the constant I term is invisible to the first 20 physical entries, rank12; enumerate every consistent rubric and all 29 constant coefficients. The same finite lexical register is used as in the chapter-integer attacks. The next groups are length4 and3.

| class | rubric pairs | consistent | third group | third+fourth | best p0 lexical runes outside rubric | heldout p1–2 |
|---|---:|---:|---:|---:|---:|---:|
| canonical | 18,983,760 | 18,983,760 | 57,978 | 1,730 | 29/248 | 10/462 |
| reflected | 18,983,760 | 654,279 | 1,998 | 50 × 29 constant choices | 22/248 | 16/462 |

Heldout scores −4.98346 and −4.85003, all nonprose. Two source-conditioned native controls rotate the KOAN and LOSS OF DIVINITY sections at complete group cuts, take 729 runes, and plant a degree11 inverse P=5(C+7I)^11+I. The exact invertible native construction uses the exponent11 reciprocal modulo the relevant matrix order. Both hidden coefficient vectors and all 1,458 runes recover, including wrap seam; the control's known exponent and constants are withheld from candidate selection. [SFT](../sims/lp2_opening729_matrix_poly13_sft.cjs), revision 6355077f65fc650225ddfb3d12624caaf151484f.

## Stronger all-commuting-matrix recovery

There is no need to assume a short exponent or degree≤12. In each original D4 class the square-free characteristic polynomial makes GF29[C] the **entire centralizer**. Every commuting plaintext matrix is represented by all 27 coefficients of I,C,...,C^26. This includes all powers and roots, as well as unrelated polynomials. Use the three longest complete p0 printed groups at physical offsets 23,62,245 (lengths 11,11,9). Their 31 physical entries give rank27 in both classes, so four independent homogeneous lexical consistency equations remain. The first two 1,886-form domains contribute a four-digit GF29 syndrome, and the complementary syndrome is looked up in the third 4,043-form domain. Each match uniquely fixes the full coefficient vector. All 3,556,996 first-two pairs are considered, with no candidate cap. Score the remainder of p0 outside all three anchors and predict p1–2 unchanged.

| class | exact three-anchor keys | fourth (p0 first 8-rune group) lexical matches | best fit lexical runes | heldout lexical runes | heldout trigram |
|---|---:|---:|---:|---:|---:|
| canonical | 20,563 | 0 | 22/230 | 13/462 | −4.77030 |
| reflected | 20,333 | 0 | 23/230 | 9/462 | −4.84422 |

Even one additional selected long word is impossible among all candidates; no fit produces prose. Two independent native controls use C=P^11, not the preceding degree11 decoder; they have full rank27 and recover all 729+729 native runes. The control fit is 528 runes to ensure long anchors, with three anchor domains and a fourth lexical gate. KOAN: 909,449 three-anchor candidates, one fourth-anchor survivor, 497/497 non-anchor fitting lexical runes and 197/197 withheld. LOSS: one three-anchor candidate, 468/493 and 192/199 lexical runes (native spellings outside register allowed outside anchors). Full 201-rune suffix exactly recovered in each. The selected controls use lexical-eligible anchors, so this calibration is conditional, not a general natural-language decoder.

[SFT](../sims/lp2_opening729_matrix_centralizer_sft.cjs), revision 28a66f6b5e74783b08abc2bde0bda3b793f6bd30. A preliminary all-controls invocation capped due the weaker 262-rune control fit's insufficient consistency rank; the final receiver uses the stated 528-rune control fit and fourth-anchor filter, while the original still exhausts every three-anchor key with 262 fit and 467 continuation runes. Both D4 classes are exact. This retires direct commuting-matrix prose with the declared three lexical anchors and fourth word, and provides a complete negative predictive recovery for all three-anchor candidates. It does not exclude noncommuting matrix transforms, H-decoy, noncanonical packing, or unknown out-of-register anchor words. Do not promote any forced lexical island to plaintext.
