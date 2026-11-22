# Source-pinned 2014 three-square interior Hill inverses on LP2 p55

**Original raw-matrix test: Agent45, 12 November 2026. Totient-transformed extension: Agent47, 19 November 2026. Classification: bounded original-cipher negatives under both standard Hill orientations for raw and φ-transformed source cores; no unknown-page plaintext, key or destination.**

## Why this exact operation?

The three authentic 2014 earlier-puzzle magic squares were explicitly required by the 2014 sixth-onion stage before a solver received LP2, and their 5×5, 7×7, 5×5 original forms are [retained here](../resources/cicada2014-openpuff-magic-squares.txt). The solved LP2 p57 PARABLE says to shed circumferences and find divinity within. Removing the original matrix outer border yields three square matrices of dimensions **3, 5, 3**, containing **9 + 25 + 9 = 43** cells, exactly the count of strict first/last-rune-stripped interiors of p55's seventeen printed words. This clue-led source alignment was reported by Agent32; its direct numeric additive, prime-rank and spiral variants were negative. The separate [key-independent original core test](lp2-p55-inner43-2014-square-permutation-invariant.md) rejects pure transposition of these 43 runes under ordinary English-GP language assumptions. A Hill cipher is a historically familiar changing-symbol operation directly suggested by *square matrices*, and it does not preserve ciphertext rune frequency, making it a materially distinct one-step consumer.

The actual source matrices (reduced mod29 only for computation) are

- First 3×3 core: 812,934,280 / 620,809,620 / 280,934,812.
- Middle 5×5 core: 223,14,47,293,98 / 232,121,114,72,23 / 65,270,331,270,65 / 23,72,114,121,232 / 98,293,47,14,223.
- Final 3×3 core: 199,130,320 / 245,91,245 / 320,130,199.

Their exact determinants modulo29 are **[24, 8, 24]**, so **all three have unique GF29 inverses**. The first source 3×3 consumes the first nine strictly interior p55 runes as three native GP29 triplets; the middle 5×5 consumes the next twenty-five as five quintets; the last 3×3 consumes the remaining nine as three triplets. These source-selected fixed boundaries have no user-fitted phase, pad, offset, scalar, alphabet or permutation.

For each triplet/quintet, test exactly two conventional Hill modes: **column vectors** decrypted via K⁻¹C and **row vectors** decrypted via CK⁻¹, both modulo29, without mixing modes between source matrices. Reencrypt each output with the corresponding K and assert all **43 original ciphertext runes** exactly reproduce.

## Complete unchanged p55 output and language test

The original strict p55 43-interior stream has **62/1806=0.034330011** GP29 IoC. The source Hill inverses produce the following complete 43-rune outputs; dots separate rune identities, rather than English word breaks:

**Column-vector inverse:**
G.EO.X.T.IA.R.F.IA.EA.Y.B.AE.H.S.G.E.T.E.H.OE.H.B.IA.OE.N.J.G.S.W.M.X.H.P.H.TH.A.OE.X.Y.I.E.T.IA

**Row-vector inverse:**
M.NG.IA.X.C.TH.H.OE.W.T.G.H.A.J.EO.EO.U.EA.P.U.U.U.G.H.G.S.J.Y.H.C.NG.O.G.G.R.R.A.A.H.L.F.OE.N

| Readout | IoC | Intra-original-word GP bigram mean log-probability per pair, Shakespeare-trained | Exact forward reencryption |
| --- | ---: | ---: | ---: |
| Original unchanged 43 p55 interiors | **0.03433001** | **−6.34150** | Source input |
| K⁻¹ C, column-vector triplets/quintets | **0.03765227** | **−5.80757** | **43/43** |
| C K⁻¹, row-vector triplets/quintets | **0.03875969** | **−5.85178** | **43/43** |

The GP29 bigram measure respects **the seventeen original printed word boundaries**: it counts only the **32 strictly within-interior adjacent rune pairs**, with no invented pair crossing an original word boundary. It uses a source-independent GP29 model trained on the repository's pinned Shakespeare first-300k-character control, mapping English words by standard QU→CW, V→U, K→C, Z→S, Q→C and greedy GP multigraphs, with a declared 0.25 additive pseudocount per successor rune. No language model, source text or free parameter is fitted to the p55 outputs.

Matched source-native controls sample complete words independently with exactly the original seventeen p55 rune lengths (including the 13-rune word), then concatenate their strict interiors. Each control is measured using the same original word-boundary mask, same Shakespeare-trained GP bigrams and **20,000 deterministic xorshift32 seeded draws per source** (seed 0x45001113, continued across sources):

| Native word-shape matched source | Samples | Minimum and mean native GP bigram log-likelihood | Samples at or below either decoded output |
| --- | ---: | --- | ---: |
| Shakespeare, first 300k, in-sample | 20,000 | **−3.38994**, mean **−2.58905** | 0 |
| Gibran, held out | 20,000 | **−3.50531**, mean **−2.61737** | 0 |
| Emerson, held out | 20,000 | **−3.38088**, mean **−2.62404** | 0 |

The decoded values below −5.8 are far worse than every one of these independent original-shape native-GP controls (even the control minimum is above −3.51). The same pinned first source supplies a native 43-core plant that is Hill-enciphered under each actual source matrix and exactly recovered **43/43** after inversion; its true native language score is preserved. Thus the original nonlinguistic result cannot be blamed on a noninvertible matrix or an incorrectly implemented cipher.


## Totient-transformed interior matrices: a second direct Hill test

LP1 physical p05, the 5×5/1033 “SOME WISDOM” square, explicitly names Euler’s totient function. A source-motivated alternative to using the raw square entries is therefore to apply Euler’s φ to every cell of each already selected 3×3/5×5/3×3 interior, then reduce modulo29. This keeps the same original 2014 square order, the same 43 p55 strict interiors, and the same fixed block boundaries; it changes only the numeric matrix key.

The hypothesis remains conditional: the LP1 passage does not explicitly say to apply φ cellwise to these three interiors, and neither it nor p57 explicitly names Hill cipher. It is nevertheless a finite one-step operation motivated by the actual source wording, rather than a fitted key search.

The exact φ-transformed matrices are:

~~~text
[[17,  2,  9],
 [ 8, 25,  8],
 [ 9,  2, 17]]

[[19,  6, 17,  2, 13],
 [25, 23,  7, 24, 22],
 [19, 14, 11, 14, 19],
 [22, 24,  7, 23, 25],
 [13,  2, 17,  6, 19]]

[[24, 19, 12],
 [23, 14, 23],
 [12, 19, 24]]
~~~

Their determinants in GF(29) are **[14,27,26]**. All three have exact inverses, and the SFT verifies both matrix products against the identity. Both conventional vector orientations were applied to the original 43 p55 interior runes, preserving the 17 original word boundaries for language scoring.

**Column-vector inverse:**

~~~text
TH.J.EO.EA.J.P.IA.IA.R.N.AE.A.T.J.P.EA.R.IA.W.X.S.H.S.S.B.EO.F.P.J.P.H.M.EA.L.W.S.E.EA.P.L.N.I.IA
~~~

**Row-vector inverse:**

~~~text
C.OE.S.O.Y.B.J.H.B.NG.J.U.L.IA.Y.B.D.B.F.NG.R.C.X.B.U.I.F.G.B.W.U.AE.TH.OE.I.X.NG.X.S.G.J.M.F
~~~

Neither output is GP-native prose. The exact source-native statistics are:

| Original 43-rune input / inverse | GP29 IoC | Within-word GP bigram log score |
|---|---:|---:|
| Original p55 interiors | **0.034330** | **−6.34150** |
| Raw-square Hill, column | 0.037652 | −5.80757 |
| Raw-square Hill, row | 0.038760 | −5.85178 |
| φ-square Hill, column | **0.044297** | **−5.32806** |
| φ-square Hill, row | **0.039867** | **−6.93439** |

The φ-core column output is the less poor of the two φ variants, but it remains far below source-native English controls. The same 20,000 exact-word-shape samples per source used by the raw-matrix test were compared against both φ outputs: Shakespeare minimum **−3.38994**, Gibran minimum **−3.50531**, and Emerson minimum **−3.38088**. **Zero of 60,000 controls** scored at or below either φ output. Each φ matrix family also passes a 43/43 planted source-native positive control in both orientations, and both original p55 inverses forward-reencrypt all 43 ciphertext symbols exactly. Those round trips validate implementation, not the historical key.

**Decision:** reject this exact cellwise-φ / direct-Hill use of the 2014 square interiors on p55. The test does not reject the totient clue, the 43-cell geometry, a non-Hill use of φ, or a different source-selected transformation. It does remove the simplest direct interpretation of the φ-grid as three Hill key matrices. Do not add phases, matrix permutations, or alternative block boundaries without a new original selector.

## Centre-only block shifts: bounded third consumer test

The fixed 2014 form order gives the three square centres **[809, 331, 91]**. The solved LP1 p05 explicitly names Euler's totient function, while the p57 circumference instruction selects the same 3×3/5×5/3×3 interior blocks that align with p55's 43 strict word-interior runes. A particularly simple one-step interpretation is to use each corresponding square centre as a scalar Caesar shift for its **9/25/9** block.

Two source-derived key packets were tested without fitting: raw centre residues **[26,12,4] mod29**, and totient-centre residues **[25,11,14] mod29**. For each packet, both (C-K) and (C+K) were applied blockwise in the original square order. Every output forward-reencrypts the exact 43-symbol input.

| Centre packet | Direction | GP29 IoC | Within-word GP29 bigram score | Exact replay |
|---|---|---:|---:|---:|
| Raw [26,12,4] | (C-K) | 0.03433001 | −6.49585 | 43/43 |
| Raw [26,12,4] | (C+K) | 0.02768549 | −5.62546 | 43/43 |
| φ [25,11,14] | (C-K) | 0.02990033 | −6.38540 | 43/43 |
| φ [25,11,14] | (C+K) | 0.03211517 | −5.81645 | 43/43 |

The score uses the same independent Shakespeare-trained GP29 bigram model and the original seventeen-word boundary mask as the preceding Hill test: **32 within-interior adjacent pairs**, no invented cross-word pairs, and the same 0.25 successor pseudocount. The best centre-shift output ((-5.62546)) remains substantially below the weakest of the 60,000 source-native word-shape controls (minimum (-3.50531)); none resembles GP-native English.

Complete outputs (dots separate GP rune identities):

~~~text
raw C-K: OE.P.S.N.Y.C.U.IA.L.OE.T.B.TH.IA.W.E.OE.U.AE.N.H.O.J.S.U.AE.F.G.IA.D.TH.D.O.F.IA.IA.X.A.G.S.U.W.X
raw C+K: T.W.N.O.L.EA.A.NG.X.B.J.EO.Y.OE.TH.P.B.AE.L.R.O.IA.G.I.AE.L.A.U.OE.E.Y.E.IA.A.G.G.OE.O.X.D.N.S.OE
φ C-K:   D.X.T.I.IA.G.TH.EA.NG.D.B.E.O.EA.H.M.D.TH.Y.I.N.R.EO.T.TH.Y.U.W.EA.A.O.A.R.U.B.B.R.X.AE.C.L.Y.R
φ C+K:   S.G.H.TH.M.IA.D.L.P.T.I.J.AE.NG.U.EO.T.A.M.O.TH.Y.C.N.A.M.D.F.NG.B.AE.B.Y.D.T.T.O.P.A.R.M.AE.O
~~~

**Decision:** reject the direct centre-as-one-scalar-per-square Caesar interpretation on the 43 interiors. This is a bounded negative for the four exact consumers above, not a rejection of the historical square correspondence, the totient clue, or all possible centre-derived mechanisms. Reproducer: [`sims/lp2_p55_2014_center_block_shift_sft.cjs`](../sims/lp2_p55_2014_center_block_shift_sft.cjs).

## Exact conclusion and open branches

**Reject the direct raw-square three-square-interior Hill cipher on the p55 43 strict interiors** in both standard whole-block vector orientations and source-printed block lengths under ordinary GP-native English. Also reject the direct centre-only scalar Caesar consumer: raw and φ-transformed centre residues used as fixed 9/25/9 block shifts fail in both directions. The attractive 43-cell source alignment survives; these bounded negatives require a different independently authored symbol transformation, a different original word/register interpretation, or an extra clue to become an actual decoder. This test leaves p55's 33 exterior runes untouched, so it is not a whole-page decoder and does not satisfy the waiting Director #41 handoff.

The plausible human solve path through the historically required magic squares and the solved p57 “circumferences” instruction is better sourced than purely fabricated numerical keys, but the square-to-p55 core transfer is still interpretive and no 2014 author message specifies a Hill cipher. Do not rescue this direct result by searching key phases, word permutations or row rotations without a new original selector. Unlike the pure transposition exclusion, this is a negative for **only the two specified direct Hill operators**, not every possible secret GF29 matrix or position-keyed cipher.

**Reproduce:** [single CommonJS runnable original-input test](../sims/lp2_p55_2014_three_inner_squares_hill_sft.cjs), with 43-symbol forward replay, inverse matrix checks and original-shape planted English positive controls.
