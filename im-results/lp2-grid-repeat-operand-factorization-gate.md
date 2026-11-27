# LP2 grid: repeated-cell operand factorization gate (#3188)

## Question and scope

Could the printed 32×8 panel encode combinations of unknown row and column checksum operands, rather than a byte stream or a substitution table? Actual solved material motivates arithmetic on GP sums (LP1 Wisdom and the Stage10 square; the 2013 761.mp3 Parable number is the product 1259×1031×1229 of the three solved p57 clause sums). Neither precedent establishes this layout or operand rule. This is an exploratory necessary-condition test, with no invented assignment of rows to passages and no plaintext scoring.

Pinned input: resources/liber-primus/lp2-grid-256.json, blob 2550eae357442912220e05dc51147523a61dd75a. Physical row-major ordering of the 256 corrected tokens on p49–51. Indices below are zero-based. Distinct from the ordering/equivalence experiment #2865, row distinctness observation #2626, and magic-square constraints #3180.

## 1. Equality-only obstructions

All 32 rows are different. Twelve equal-cell pairs in the same column occur across columns 0,2,3,4,5,6,7. If V[i,j]=F(R[i],S[j]) with F right-cancellative (for fixed S[j], the row operand is uniquely determined), equal cells in a column imply the same row operand, hence identical complete rows. Contradiction. An arbitrary injective encoding of the output does not change this conclusion. Covers addition, XOR, multiplication in a group, and quasigroup combination of one shared operand from each axis.

For V[i,j]=R[i]S[j]+d in a field, a repeated cell in distinct rows forces S[j]=0, hence a constant column, contradicted. In Z/256, including any unknown injective token-to-byte relabeling, the seven repeated columns must each have even S[j]: an odd multiplier would be cancellative. Consequently every cell in those seven columns must have parity d. Their union includes 143 distinct tokens, exceeding the 128 available byte values of one parity. This rejects that model without knowing any token's byte interpretation.

There is a stronger equality-only rank obstruction. The four actual rows are:

```
4   1t 1s 3H 0d 0s 1K 2D 05
14  1D 2N 3H 47 0s 2p 0Z 34
15  0g 3v 1Q 0s 0D 0K 2h 3D
16  3L 2x 1Q 20 2n 2L 1C 2p
```

Rows 4 and 14 agree at columns 2 and 4; rows 15 and 16 agree at column 2 but disagree at column 4. In any rank-at-most-two field factorization, the nonzero first row-operand difference annihilates both column vectors 2 and 4. They belong to a one-dimensional kernel, and neither is zero because neither column is constant. Therefore they are proportional; a second row difference cannot annihilate one without annihilating the other. Contradiction. This forces rank ≥3 under **any injective relabeling into any field**.

Also excludes scalar product with arbitrary independent row/column additive biases, V[i,j]=R[i]S[j]+A[i]+B[j]. The first row difference has zeros in two columns but is not identically zero, so delta R is nonzero and S[2]=S[4]. The second row difference must then be equal at these columns, contradiction.

## 2. Composite-modulus shifted-product contradiction

For either literal scalar reading (base60 or base59 dropping lowercase f), suppose V[i,j]=R[i]S[j]+d modulo M. For a repeated cell value v in rows i,k at column j, (R[i]-R[k])S[j]=0. For every column l the difference Δ[l]=V[i,l]-V[k,l]=(R[i]-R[k])S[l], so (v-d)Δ[l]=0 modulo M. Whenever the integer differences have gcd 1, Bezout gives v=d modulo M even in the presence of zero divisors.

All 12 same-column repeat pairs have primitive row-difference vectors (gcd 1) in **both** radices. The gcd of the differences between their forced offset values is also 1 in both radices. Thus M would divide 1. No modulus M≥2 survives, even if literal values were reduced modulo a small M.

## 3. Full determinantal rank certificate

Exact fraction-free Bareiss determinants show the gcd of selected maximal minors is 1 for both readings. This proves literal rank 8 in every field (including characteristic zero), and the impossibility of a factorization of inner dimension <8 modulo **any integer M≥2**. A factorization through fewer dimensions forces all 8×8 minors to vanish by Cauchy–Binet.

For arbitrary row/column additive biases, double-center: D[i,j]=V[i,j]-V[i,0]-V[0,j]+V[0,0] for i=1..31,j=1..7. Then an r-channel bilinear model would give D as a product of difference factors with inner dimension r. Selected 7×7 minors also have gcd 1 in both radices, forcing r≥7 over every nontrivial integer modulus and every field.

| Literal reading | Raw maximal minors | Double-centered maximal minors |
|---|---|---|
| base60 | 343378169139881656, -195288848434752220, 781376266310405110, -559901241387297355 | 1726717555586848, -1400237394313360, 4736017724519080, 1503193208228229 |
| base59 | 299469765373426924, -165249451751288047 | 1529780728410577, -1207740747544621 |

All four lists have gcd 1. Row sets and exact repeat witnesses are emitted by the reproducer; no floating-point thresholds, inferred keys, or search budgets are involved.

## Disposition

The repeated values do not yield a consistent one-row/one-column checksum combination under these families. The literal matrix cannot even be represented by a lower-dimensional linear factorization after arbitrary additive row/column offsets. No need to test candidate rune-span partitions or fit a plaintext model: necessary conditions already fail, regardless of operand selection.

This does **not** exclude noninjective token mappings, nonlinear multi-operand functions, an unrelated table lookup, arbitrary permutations of individual cells, or models in which row/column operands are not shared as specified. The full literal rank result is not a claim about arbitrary relabeling; the equality-only rank ≥3 and byte parity obstruction are the relabeling-invariant parts.

Reproducer: `node sims/lp2_grid_repeat_operand_factorization_gate.cjs`. Exact core executed against the pinned JSON in the connected JS runtime; wrapper saved for independent Node execution. Synthetic affine rank-one double-centering control passed. No unknown plaintext or key recovered. No change to established results.
