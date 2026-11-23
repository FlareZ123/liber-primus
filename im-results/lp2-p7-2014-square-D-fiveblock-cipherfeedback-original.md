# Original p7 quartic × 2014 3301-square: source-derived five-block ciphertext feedback

**Agent24, 23 November 2026. One independently motivated reversible operation; complete negative original-input decision, not recovered Liber Primus plaintext.** The original p7 red five-word products and the genuine 2014 5×5 square yield the exact invertible matrix (D=F(A/2)) already [established from the actual sources](lp2-p7-red-fixedpoint-2014-a-square-scaled-quadratic-original-p8-gate.md). That earlier report tested static matrix operations and A-powered running keys. A distinct standard cryptographic possibility is **ciphertext-feedback chaining of the entire five-rune blocks**, which does not preserve the static operator's statistics and is therefore worth one bounded original-input test.

## Exact source operation and controls

Read the five complete red source words ending physical LP2 p7. Their unchanged zero-based GP29 products, in printed order, are (v=[11,26,8,15,2]). Take them as ascending coefficients of (F(x)=11+26x+8x^2+15x^3+2x^4pmod {29}). Let (A) be the complete first original 2014 3301-sum five-square, reduced modulo29, and compute (D=F(A/2)). The source arithmetic gives the exact matrix

[
D=\begin{pmatrix}
15&6&7&12&10\\
17&12&28&4&18\\
19&16&9&16&19\\
18&4&28&12&17\\
10&12&7&6&15
\end{pmatrix}\pmod {29}.
]

It has determinant1 and therefore defines an invertible five-coordinate cipher key. The historical-square projector also gives the entirely source-derived alternate initial state (\Pi v=[26,11,13,11,26]), with source-printed center 13-dot mark, as established in the linked prior report.

**Freeze one operation without looking at decrypted language:** for ciphertext and plaintext five-rune blocks (C_j,P_j\in GF(29)^5),

[
P_j=C_j-D C_{j-1},\qquad C_j=P_j+D C_{j-1}\pmod {29}.
]

For the first block, (C_{-1}) is either printed (v) or its historic-projector image (\Pi v). Each subsequent state is the **preceding entire ciphertext block**, unlike the earlier direct D or matrix-running-key tests. This is the ordinary ciphertext-feedback chaining architecture, adapted literally to five-rune blocks. Source p7, the 2014 source square and the p8 page length255 motivate the chosen source operands; **no Cicada signed message explicitly instructs this operation or selects this IV**, so the test is a conditional hypothesis.

Use three intact, independently marked, exactly five-divisible original registers, without padding, omissions, fitted phase or reordered runes: **p8 complete 255 runes**, the **p3–p7 five-scroll 1,145 runes**, and **p33–p39 numeric chapter 1,680 runes**. Each register restarts with the same printed source initial state. The same algorithm encrypts independently planted native-GP29 clear text taken cyclically from genuinely solved physical LP2 p57, preserving every rune.

## Actual complete-cipher result

| Original untouched register | Original ciphertext GP29 IoC | Decode with printed (v) | Decode with (\Pi v) | Independent native-GP plant IoC |
| --- | ---: | ---: | ---: | ---: |
| p8, 255 runes | 0.03427513 | **0.03452216** | 0.03455303 | above 0.05 |
| p3–p7, 1,145 runes | 0.03463371 | **0.03429322** | 0.03431154 | 0.07148594 |
| p33–p39, 1,680 runes | 0.03436002 | **0.03447914** | 0.03446567 | 0.07181712 |

The best of all six original outputs is only **0.03455303**, near (1/29=0.03448276); none yields sustained GP-native words or an address. Changing the IV alters only the first five recovered runes of each register, since the recurrence then uses observed ciphertext as its state. Every original output re-encrypts **exactly** to the unchanged original ciphertext, and every independently encrypted actual-p57 native plant decrypts exactly. In total **6,160 original rune instances** are tested in six full-register recoveries, and the corresponding six native-source plants pass.

**Decision:** the fully specified p7 × historical-square (D)-ciphertext-feedback chaining architecture is a bounded negative as a direct GP-native decryptor on three complete original receivers. It demonstrates that introducing a standard *dynamic ciphertext-block dependence* does not rescue the earlier direct-matrix failure for this source-exact D. It does **not** exclude plaintext feedback, arbitrary private IVs combined with an additional nonlinear stage, transformed alphabets, non-GP-native compressed outputs, or a missing first-party instruction selecting another operator. Do not treat CBC on this square as authenticated merely because it is reversible.

**Reproducer:** [single-file read-only Windows Node.js22/CommonJS source test](../sims/lp2_p7_2014_D_ciphertextfeedback5_original_sft.cjs), using only the canonical original LP2 GP corpus and the actual 2014 three-square source text. Independent [Windows GitHub Actions PASS 45093589777](https://github.com/FlareZ123/liber-primus/actions/runs/45093589777). No new unknown-page plaintext, author key or destination has been established.
