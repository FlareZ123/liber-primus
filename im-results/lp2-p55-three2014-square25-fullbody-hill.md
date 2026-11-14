# LP2 p55: source-locked three historical 5×5 Hill matrices on the complete 75-rune body

**Agent 35, 14 November 2026. Complete source-locked original-input inverse gate, without plaintext recovery.** The three historical 2014 squares give valid 75-rune GF29 Hill inverses. The best raw language-score lift does **not** survive selection over the eight natural whole-5×5 matrix products (conditional familywise null p≈0.0794). There is no authenticated cipher mechanism, recovered LP2 sentence or key.

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

An additional key-order control preserves each square's exact multiset of entries, its centre value and its **twelve opposite-equal 180° positional pairs**, while randomly redistributing those twelve partner pairs within the 5×5 area. This holds the source's centrosymmetry rather than replacing its 25 numbers with random numbers. Across 5,000 deterministic triple-key layouts, **4,058** are fully invertible; **38** yield an equal or better *preselected row-vector* bigram score than the source order, conditional add-one fraction **39/4059 ≈ 0.00961**.

Crucially, one-dimensional row-Hill vectors are not the only natural matrix reading. Each 25-rune block also has a **full 5×5 2D-grid interpretation**, allowing left versus right multiplication, their transposed versions, and all four one- or two-sided standard products. The eight source-pinned modes and scores are:

| Whole-square 5×5 inverse | Word-local GP bigram log score |
| --- | ---: |
| Right `C K⁻¹` (original row-vector best) | **−5.071015** |
| Both transposed `K⁻ᵀ C K⁻ᵀ` | −5.470768 |
| Mixed `K⁻¹ C K⁻ᵀ` | −5.552375 |
| Left `K⁻¹ C` | −5.570818 |
| Both `K⁻¹ C K⁻¹` | −5.699377 |
| Right transposed `C K⁻ᵀ` | −5.848157 |
| Left transposed `K⁻ᵀ C` | −6.038037 |
| Reverse mixed `K⁻ᵀ C K⁻¹` | −6.161811 |

All eight **exactly re-encrypt 75/75** original source runes and recover the 75-rune solved-p57 plant. The original orientation remains the best of this family. In a separate **2,000-trial symmetry-preserving key-order null**, the 1,623 invertible triple-matrix layouts are each allowed their **best of all eight** inverse operations. **128** reach or exceed the original source's best score, conditional add-one fraction **129/1624 ≈ 0.07943**. The apparent 0.00961 row-only improvement is therefore insufficient as an operation-selection signal even within this small prespecified source matrix family. These are conditional diagnostics, without any project-wide significance calibration.

This is a **different, complete 75-body test** from the previously recorded 43-inner-rune [3×3/5×5/3×3 Hill test](lp2-p55-2014-magic-squares-three-core-hill-original-inverse.md), and from the 17 historical **row-wise repeating Vigenère** test covering the original 76-rune layout. Here the central square alone is peeled, all three entire 5×5 matrices are used, and 75 runes are mixed in three adjacent 25-position groups.

**Decision:** all eight canonical full-grid 3×5×5 Hill constructions remain unreadable, and the best-score improvement is unexceptional under the within-family matrix-order null. Neither the fixed 75-rune inverse nor plausible left/right matrix-product extensions recover p55 plaintext. This is a source-qualified negative and provides no evidence to add a further tuned cipher layer, key rotation, or outer-key shift. A successor would need an independently visible instruction selecting matrix orientation and an additional reversible operation, followed by coherent untouched original plaintext.

**Reproduction:** `node sims/lp2_p55_three_squares_full75_hill_sft.cjs`, Node.js 22, original canonical LP2 JSON, preserved original 2014 magic squares, and three frozen independent English controls. Read-only, deterministic, source-native positive controls, full eight-mode 2D inverse/forward replay and both key-order nulls. [Passing manual Windows CI](https://github.com/FlareZ123/liber-primus/actions/runs/43578186148) predates the 2D-family extension, which should be rerun.
