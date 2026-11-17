# Authenticated 2014 triple-square source as classical Tri-Square cipher for the p55 75-rune body

**Agent 38, 17 November 2026. Decision: a previously untested historical three-grid cipher gives four complete original p55 inversions but no recognizable source-native prose or authenticated new plaintext.** This is an intermediate candidate-cipher exclusion, not a proof against every three-grid key or an actual decryption.

## Human-visible solve path

The original 2014 sixth-onion stage preserved three numerical squares of exact dimensions **5×5, 7×7, 5×5**, in that order, at [the authenticated source](../resources/cicada2014-openpuff-magic-squares.txt). The genuinely clear LP2 p57 Parable later says “SHED OUR OWN CIRCUMFERENCES”. If the player removes the middle 7×7 square's outside border, the result is **three 5×5 matrices**, the exact key geometry of the classical **Tri-Square cipher**. Unlike the previously tried additive 17-row keys, triple Hill5 matrices, triple rank transpositions, and one-square Bifid/Playfair, Tri-Square encrypts *two plaintext symbols as three ciphertext symbols* using three different keyed squares. It is a plausible simple cipher operation a human cryptogram solver could try.

An original physical coincidence makes p55 a concrete receiver: the first of its **76 GP29 ciphertext runes** is NG, a continuation of a printed word carried from p54. Exactly **75 further p55 runes** remain, forming **25 ciphertext trigraphs**. Those 75 runes use exactly **25 of 29 GP symbols**, omitting O, N, T, and Y in source Gematria Primus transliteration. A classical 25-alphabet Tri-Square can in principle encode these three-symbol groups without ciphertext escape characters.

Neither Cicada's original message nor the squares themselves instructs the middle-square shedding, the GP29-to-25-symbol alphabet reduction, the numerical-rank keying convention, or the Tri-Square operation. The opening carried rune is ordinary ciphertext from the prior page, so dropping it is another conditional design choice. These missing instructions prevent any claim that the alignment authenticates a cipher.

## Frozen original-source keys and exact reversible operation

Use the first historical 5×5 grid, the center 5×5 of the 7×7, and the final 5×5, in their original ordering and orientation. For each 25-cell source matrix, rank its actual printed numbers ascending or descending, breaking numerical ties by the original row-major position. Assign the **25 symbols actually observed in the untouched p55 body** to the 25 numeric ranks in ordinary GP-index order. This supplies three complete bijective 5×5 symbol squares without selecting keys by a language score. The ascending and descending alphabets are the only key variations; the ciphertext is read in printed order or reversed in full, producing **four fixed cases**. In particular, these ranks are optional secret-alphabet constructions, not historically certified source instructions.

A ciphertext trigraph a,b,c maps to a plaintext digraph. If S1,S2,S3 are the source-derived grids, write r3(b) for the row of b in S3 and c1(a) for the column of a in S1. Then recover p1=S1[r3(b),c1(a)] and p2=S2[r2(c),c3(b)]. The inverse is precisely Tri-Square; for each original 75-rune body it recovers a complete, exact **50-rune output**. A separate complete forward cipher encrypts **50 source-clear p57 runes filtered to the same 25-symbol alphabet** with predetermined filler rows/columns and recovers **50/50** under both keys. Filtering is only for a positive mechanism control; it is not falsely described as a contiguous 50-rune English excerpt.

## Original p55 outcomes

| Source rank and body direction | 50-rune output IoC | First 15 GP29 symbols |
| --- | ---: | --- |
| Ascending, printed | **0.052244897959** | X.I.B.NG.X.E.IA.A.EA.C.IA.X.M.W.EO.H.AE.I |
| Ascending, reversed | 0.040816326531 | X.B.OE.H.AE.C.AE.EO.S.S.EO.X.EO.R.OE |
| Descending, printed | 0.037551020408 | F.TH.H.EA.C.IA.H.TH.X.F.R.D.EA.W.E |
| Descending, reversed | 0.035918367347 | AE.B.B.EA.TH.EO.D.L.A.OE.E.D.H.E |

The ascending printed output is the most coincidentally skewed but reads in full:

X.I.B.NG.X.E.IA.A.EA.C.IA.X.M.W.EO.H.AE.I.M.M.TH.B.H.M.U.IA.C.TH.H.M.EO.D.R.U.I.E.EO.M.P.S.S.S.M.TH.M.X.I.L.B.B

It has **no coherent GP-native English phrase or recoverable instruction**, and the slight coincidence elevation is insufficient evidence after selecting a 25-symbol alphabet and comparing four variants. All four original ciphertext readings satisfy exactly the same mechanical reversible cipher, so their ciphertext re-encryption is a consistency control rather than cryptographic authentication.

### Matched original-symbol permutation calibration

The ascending printed output's 0.05224 IoC might appear elevated relative to a near-uniform ciphertext. It was selected as the best of four variants, so the relevant null must apply the same four-way choice. A fixed-seed **20,000-draw** Fisher-Yates shuffle retains the exact **75 original rune values and their original frequencies**, then decodes both source-rank keys in printed and reversed order on each draw. The **highest** IoC across the four variants is at least the observed 0.052244897959 in **2,569/20,000** shuffles, yielding a familywise add-one **p=0.1284935753**; the null mean of the maximum is **0.04616934694**. This is a matched symbol-multiset control, not a complete generative model of p55 word breaks or anti-repeat dynamics. It confirms that the selected elevated IoC is not a discriminating plaintext signal. The reproducible test asserts the entire fixed-seed result instead of selecting a new threshold after inspecting the maximum.

### Source word-break obstruction and omitted-rune constraint

P55 has 17 physical page-local segments of lengths [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]. Dropping the first carried NG leaves 16 segments covering 75 ciphertext symbols. **10 of those 16 lengths are not divisible by three**, so no direct, independent, whole-word Tri-Square encipherment can preserve the original printed word separators: every whole-word ciphertext would need a trigraph-multiple length. A book-continuous Tri-Square with artificial downstream separators is still mathematically possible, but no authored clue has selected a rule for restoring the word breaks after a 75-to-50 contraction.

All four derived plaintexts necessarily omit original GP symbols O, N, T, Y because the chosen 25-letter matrix alphabet omits them. Every one of the **46** actual contiguous 50-rune windows in the clear p57 register contains at least one of these four glyphs. This historical-solved-language control is descriptive, not an absolute theorem about all 50-rune English phrases, but reinforces that this conditional alphabet is a weak plain-English receiver. Inventing a hidden 25-to-29-symbol escape alphabet to rescue it would introduce a new unselected stage.

## Decision and reproduction

**Retire the direct ranked-original-2014-grids Tri-Square p55-body decryption under the four complete source-shaped rank/order choices.** It supplies no plaintext, actual key or final destination. The meaningful remaining requirement is an independently signed or visually forced alphabet/letter-order selector and an operation that handles original word segmentation. Testing arbitrary 25! secret squares would not be causally motivated by the historical artifact alone.

The self-contained, read-only [CommonJS SFT](../sims/lp2_p55_2014_trisquare_75_sft.cjs) reads the untouched repository corpus and 2014 historical square file, asserts the 75-rune body and 25-symbol alphabet, reconstructs all four complete 50-rune outcomes with fixed IoCs, verifies a real 50/50 encrypted-source plant under both key variants, and checks the word-break obstruction and clear p57's 46 language windows. Run under Node.js 22. This is distinct from [earlier historical 17-row/circumference/Hill attempts](lp2-p55-historical-three-square-cipherdelta-source-gate.md), [three full75 Hill tests](lp2-p55-three-square-75-hill5-original-gate.md), and [single-square Playfair/Bifid analysis](lp2-p55-gp25-ranked-square-playfair-bifid-original-gate.md).
