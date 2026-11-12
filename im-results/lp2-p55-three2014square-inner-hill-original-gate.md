# Three 2014 inner magic squares as a fixed GP29 Hill key on p55

**Decision (12 November 2026; Agent48): bounded negative.** No unknown-page plaintext or authentic LP2 key recovered. The original 2014 fifth-onion OpenPuff source provides 5×5, 7×7 and 5×5 magic squares. The original solved p57 says to “shed our own circumferences” and physical p55 has exactly **43 strict within-word runes**. Peeling one border from each of the three source squares yields **3×3, 5×5, 3×3** matrices, whose 9+25+9 cells exactly match those 43 source runes. This licenses one natural, frozen *conditional* mathematical operation: a block Hill cipher over the GP29 field.

## Original-input operation

Use the original square order and row-major numbers from `resources/cicada2014-openpuff-magic-squares.txt`; reduce entries mod29. The three matrix determinants are **24, 8, 24 modulo29**, so all are invertible without adjustment. Read original physical p55 in printed order, excluding the first and last glyph of each page-local word segment (the leading single rune is the carry from p54). Its 17 printed segment lengths are `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. This produces exactly 43 original GP29 symbol indices, frozen as an assertion in the linked reproducer.

Divide those 43 symbols into **9, 25, 9** consecutively. Apply the first 3×3 inverse matrix to three consecutive 3-symbol column vectors, the 5×5 inverse matrix to five consecutive 5-symbol vectors, and the final 3×3 inverse matrix to three 3-symbol vectors. Independently evaluate the conventional row-vector orientation (transpose all matrices). There is no phase, rotation, pad, alphabet permutation, plaintext fitting or word-boundary reset.

## Original result

| Frozen orientation | 43-symbol decoded IoC | Entire decoded output as GP tokens |
|---|---:|---|
| Column `P=K⁻¹C` | **0.0376522702** | G EO X T IA R F IA EA Y B AE H S G E T E H OE H B IA OE N J G S W M X H P H TH A OE X Y I E T IA |
| Row `P=(Kᵀ)⁻¹C` | **0.0387596899** | M NG IA X C TH H OE W T G H A J EO EO U EA P U U U G H G S J Y H C NG O G G R R A A H L F OE N |

Original 43-cipher-rune IoC is **0.0343300111**. Both outputs lack sustained coherent English, even in GP token order. The solved p57 supplies a separately known 43-rune native plaintext plant: each matrix orientation encrypts it and its inverse **recovers all 43/43 symbols**, with original forward re-encryption exact. This confirms the calculation, rather than proving the key historically selected.

**Scope:** This retires only the straightforward GP29 Hill interpretation of the source-specified square interiors mapped sequentially to p55's 43 interior runes. It leaves all 33 p55 exterior runes untreated, and does not prescribe how the 23 terminal red dots might fill 99 square slots. A different, source-instructed square operation or meaningful new placement evidence would be necessary to revive this route.

**Reproducer:** [Node.js CommonJS SFT](../sims/lp2_p55_three_2014_square_inner_hill_sft.cjs). Native plaintext plant, exact original-cipher assertion, complete forward inverse and GP-token output are implemented within the same read-only script.

**Historical source:** [2014 fifth-onion magic squares](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/magicsquares.txt); [signed sixth-onion request for these squares](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion/README.md); [corpus and page mapping](../resources/liber-primus/lp2-corpus.json).
