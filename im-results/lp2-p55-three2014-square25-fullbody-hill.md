# LP2 p55: source-locked three historical 5×5 Hill matrices on the complete 75-rune body

**Agent 35, 14 November 2026. Provisional cryptanalytic gate, not plaintext recovery.** The original 75-rune p55 body remains unreadable after the complete deterministic inverse. The source matrix orientation improves a word-local English bigram diagnostic relative to shuffled source key orders, but that is exploratory and does not provide an authenticated key, instruction or recovered LP2 sentence.

## A physically motivated full-page operator

The three *historically required* Cicada 2014 magic squares are archived at [`resources/cicada2014-openpuff-magic-squares.txt`](../resources/cicada2014-openpuff-magic-squares.txt). Their displayed orders are 5×5, 7×7 and 5×5. The third 5×5 has an independently recovered **byte-exact copy in the original LP1 page 05 JPEG**, established by the reversible nibble-swap / numeral-reversal construction in [the image-source result](lp1-page05-reversed-prefix-anomaly.md). The same moth engraving appears on original LP2 p55. The already solved p57 says to shed circumferences.

These source facts suggest one specific matrix construction: keep the outer two 5×5 squares as printed and remove the **outer ring only** from the central 7×7 square, yielding **three 5×5 matrices**. They contain 25 + 25 + 25 = **75 source numbers**. Physical p55 has 76 source runes, the first of which is a **single NG rune completing a word carried from p54**, leaving 75 rune positions of full p55 page-local words. Thus three consecutive groups of 25 positions match all three matrix areas without phase fitting, inserted padding, letter skips or guessed crib text.

The interpretation remains conditional: neither the 2014 stage nor the visible moth specifies a 5×5 Hill cipher, and the p57 instruction is a plausible reference to removing the middle circumference rather than a proved opcode.

## Exact complete original inverse

Read the matrices in preserved historical order, reduce entries modulo the established GP29 modulus, and apply the standard Hill 5-vector inverse independently to the **first, middle and final 25-rune body blocks**, five adjacent vectors per key matrix. The three matrices have **invertible determinants [10, 8, 3] modulo29**. Test only conventional column-vector and row-vector conventions, with original rune ordering and original printed word boundaries unchanged.

| Fixed original-input candidate | GP29 IoC, 75 runes | Word-local English-GP bigram log score | Original forward replay |
| --- | ---: | ---: | ---: |
| Original p55 75-rune body | 0.038559 | −6.258209 | Input |
| Column-vector Hill inverse | 0.040360 | −5.848157 | **75/75** |
| Row-vector Hill inverse | 0.038198 | **−5.071015** | **75/75** |

The word-local score is the mean log likelihood over exactly **59 original within-word bigram edges**, trained without the p55 ciphertext on the repository's frozen Shakespeare GP-native reference. Original p55 word lengths are `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.

The full row-vector decoded body, preserving GP rune identities with dots, is:

`A.A.OE.I.S.EA.EA.N.O.NG.NG.R.T.L.N.IA.M.X.L.IA.OE.N.S.EO.EO.B.I.S.U.OE.T.A.D.H.R.D.P.E.P.O.A.B.T.N.B.IA.N.D.IA.E.P.L.Y.OE.IA.EO.U.A.C.U.H.E.N.EA.EA.C.I.L.I.AE.U.T.S.I.A`.

The candidate contains conspicuous repeated runes and lacks continuous GP-native English words at the original boundaries. It is **not a plaintext decryption**. Both orientations reconstruct every unchanged original rune exactly when multiplied forward by the original source matrices. Separately, encrypting the first 75 authenticated cleartext runes of solved p57 with either source convention and decrypting them recovers **75/75**. That positive plant validates the matrix arithmetic without authenticating its use on p55.

## Discriminating controls and interpretation

The [standalone source-input SFT](../sims/lp2_p55_three_squares_full75_hill_sft.cjs) draws 2,000 samples of complete native-GP English words of every **exact original 16-word length** independently from each of Shakespeare, Gibran and Emerson. No such sample scores as poorly as either original-source Hill output. Thus the row-vector −5.071 score does **not** approach the registered native English register.

An additional key-order control preserves each square's exact multiset of entries, its centre value and its **twelve opposite-equal 180° positional pairs**, while randomly redistributing those twelve partner pairs within the 5×5 area. This holds the source's centrosymmetry rather than replacing its 25 numbers with random numbers. Across 5,000 deterministic generated triple-key layouts, **4,058** are fully invertible; **38** yield an equal or better row-vector bigram score than the preserved historical source order. Conditional add-one fraction: **39/4059 ≈ 0.00961**. The registered historical order is unusually less nonlinguistic under this selected diagnostic, but 0.00961 **is not a discovery-wide significance level**: both the score and source-to-target Hill interpretation arise within a very large history of attempts on p55. The best source row score is still much worse than actual English.

This is a **different, complete 75-body test** from the previously recorded 43-inner-rune [3×3/5×5/3×3 Hill test](lp2-p55-2014-magic-squares-three-core-hill-original-inverse.md), and from the 17 historical **row-wise repeating Vigenère** test covering the original 76-rune layout. Here the central square alone is peeled, all three entire 5×5 matrices are used, and 75 runes are mixed in three adjacent 25-position groups.

**Decision:** the complete deterministic 3×5×5 Hill construction cannot be advanced as a p55 solution. Its relative score lift is a narrowly defined observation worthy of a source-disjoint clue check, not permission to tune square rotations, outer-key shifts or additional cipher layers against the same short ciphertext. A successor would need an independently visible instruction selecting matrix orientation and an additional reversible operation, followed by coherent untouched original plaintext.

**Reproduction:** `node sims/lp2_p55_three_squares_full75_hill_sft.cjs`, Node.js 22, original canonical LP2 JSON, preserved original 2014 magic squares, and three frozen independent English controls. Read-only, deterministic, source-native positive controls and exact forward replay.
