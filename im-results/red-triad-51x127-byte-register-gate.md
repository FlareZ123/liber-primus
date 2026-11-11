# Source red triads and the 51×127 canonical-byte gate

**Original-input bounded exclusion, 10 November 2026, Agent 42. No unknown Liber Primus plaintext, historical encryption key, complete mechanism or destination has been recovered.** The complete original-input and positive-control test is [\`sims/red_triad_51x127_byte_register_sft.cjs\`](../sims/red_triad_51x127_byte_register_sft.cjs). The separate public-state language test is [\`sims/red_triad_gf841_127cycle_inverse.cjs\`](../sims/red_triad_gf841_127cycle_inverse.cjs). These are finite tests of candidate mechanisms, not claims that the puzzle's authors used these operations.

## Why this particular register is worth testing

The two source-marked three-rune red inscriptions give two distinct exact algebraic objects:

- Physical LP2 p3 at local rune offsets 119–121: GP indices \`13,23,2\` define the irreducible \`13+23u+2u²\` in F29, so \`u²=8+3u\` defines GF(29²). The class \`u\` has exact multiplicative order 840.
- Physical p39 at the same offsets: \`27,5,15 = 15(X−24)²\` in ascending polynomial coefficients. This divides the original p49–51 256-byte numerical table polynomial over F29 when its bytes are read as descending coefficients. Fixed-width division yields exactly 254 quotient coefficients, including one zero leading pad, hence 127 field pairs.
- Physical p53 contributes a separately marked run of 51 red GP glyphs. All p0–55 unknown physical pages together have 12,956 GP runes. The arithmetic identity \`12,956 = 2 + 51 × 127 × 2\` accommodates one two-rune header and 51 complete rows of 127 two-rune field elements.

The equality of dimensions was noticed **after** the structures were found and does not establish an intended 51×127 transport. It suggests a precise byte-register hypothesis worth testing because the manuscript prints a 256-byte source table and GF841 has room for 256 canonical byte values.

## Exact original-capacity question

For each row \`r ∈ [0,50]\` and column \`j ∈ [0,126]\`, treat the two original ciphertext GP indices at book offsets \`2+254r+2j\` and \`3+254r+2j\` as a field element \`C[r,j]\`. The p39 polynomial quotient supplies field element \`Q[j]\`. Let a candidate plaintext byte \`b ∈ [0,255]\` have canonical injective base29 field representation \`B(b)=[floor(b/29), b mod29]\`. The proposed one-byte-per-pair encoder is

\`C[r,j] = alpha[r] B(b[r,j]) + Q[j] + beta[r]\` over GF(29²).

The two public row-multiplier rules are:

1. \`alpha[r]=1\`, arbitrary secret per-row field offset \`beta[r]\`.
2. \`alpha[r]=u^(R[r])\` where \`R[0..50]\` is the original p53 51-red-rune GP-index sequence; again arbitrary secret \`beta[r]\`.

The test enumerates **all 841 possible beta offsets independently for every one of the 51 rows**. A row with fewer than 127 canonical bytes under **every** beta proves that no row-secret choice produces a full direct canonical-byte plaintext under that particular public key rule. Row secret selection is arbitrary and favourable to the hypothesis; no plaintext scoring or parameter fitting is involved.

| Original input | Rows admitting all 127 bytes | Worst row's best byte count | Best row's best byte count | Mean of the 51 row maxima |
| --- | ---: | ---: | ---: | ---: |
| \`alpha=1\`, table quotient, all secret \`beta\` | **0/51** | 44/127 | 56/127 | 48.3529411765/127 |
| \`alpha=u^R\`, table quotient, all secret \`beta\` | **0/51** | 43/127 | 55/127 | 48.0980392157/127 |
| Source-native encrypted **6,477-byte positive plant** with \`alpha=u^R\` and 51 arbitrary row offsets | **51/51** | 127/127 | 127/127 | 127/127 |

The plant uses the complete source quotient and 51 real red row multipliers, deterministically chooses actual bytes \`b_i=(73i+41) mod256\`, encrypts with hidden row offsets \`[(7r+2)mod29,(17r+4)mod29]\`, and checks the exact inverse for every 6,477 byte. The same 841-offset capacity search recovers 127 valid bytes in all 51 rows. The original cannot be explained by **either defined canonical byte model**, even with all 51 per-row offsets unconstrained.

## Distinct fully reversible GP original-input experiment

The adjacent [field-state program](../sims/red_triad_gf841_127cycle_inverse.cjs) tests a separate 51-cycle, source-forced field recurrence with \`S_0\` equal to the first two original ciphertext GP indices \`[15,8]\`, \`P_t=C_t-S_t\`, and \`S_(t+1)=u S_t+Q_(t mod127)\`. It exactly re-encrypts all 12,954 payload glyphs; the original decoded GP-index IoC is **0.0344807853**, while the original payload IoC is **0.0344789617**. The first decoded passage is nonlinguistic. An independent 12,954-GP-rune Shakespeare-based plant decrypts **12,954/12,954** and has IoC **0.06632997**; rotating the 127 source quotient pairs for that plant produces only **425/12,954** correct runes, with IoC **0.03447976**. Thus the particular source-fixed direct-GP evolving-field inverse yields no readable original plaintext despite a working true-source control.

## All-secret terminal GF(29²) affine-state output gate (Agent 7)

A second source-constrained interpretation of the **same exact 254-coefficient quotient** addresses the original *terminal* 127-rune target, rather than treating the table as a recurring 51×127 key: append p53's **51 red** runes to p55's **76** runes, in source order. The original p3 red triad defines \(u^2=3u+8\) over GF(29²), the p39 red triad supplies the two Ac24 roots of the table polynomial, and p54's enlarged Ac supplies 24. In the natural adjacent pairing, the **254 fixed-width quotient coefficients**, including their leading zero, form 127 field elements \(Q_i\). The alternative first-half/second-half pairing is reported separately, rather than optimized.

The candidate mechanism is a forced two-coordinate affine register with *all secret initial states and every fixed linear observation allowed*. Let \(F_0=0,\ F_{i+1}=uF_i+Q_i\), and set \(U_i=u^i\). Every candidate direct GP29 output is

\[
c_i=\operatorname{Tr}(W U_i+V F_i)+b\pmod{29},
\qquad W,V\in\mathrm{GF}(29^2),\ b\in\mathrm{GF}(29).
\]

The arbitrary \(W,V,b\) contain **five free GF29 coordinates**. This is deliberately more permissive than fixing the original state to Ac24 and using a single nonzero secret observation multiplier: any such true affine field model is included. For each \(i\), the right side is a known row of five GF29 coefficients. Exact Gaussian elimination supplies a key-independent decision, with **no plaintext-model scoring or optimized source key**.

| Quotient pairing | Rank of 127×5 source matrix | Rank after appending original 127 ciphertext runes | Earliest inconsistent prefix | Disjoint six-rune blocks inconsistent with every five-parameter secret |
| --- | ---: | ---: | ---: | ---: |
| Adjacent, printed forward | **5** | **6** | **6** runes | **21/21** |
| First half / second half, printed forward | **5** | **6** | **6** runes | **20/21** |

Each incompatible six-rune block requires at least one altered observed rune in any single direct-output reconstruction. Because the blocks do not overlap, any five-secret-parameter model would require at least **21 edits** (adjacent) or **20 edits** (halves) in the 127 original ciphertext values. Source-shaped synthetic controls constructed from hidden values of all five coordinates have augmented rank exactly five and reproduce all 127 symbols.

For a different **fully specified GP29 additive inverse**, choosing source-visible \(W=24\), \(V=23+27u\) and \(b=13\), the original ciphertext-minus-key mod29 outputs have GP-index IoC **0.0373703287** (adjacent) or **0.0334958130** (halves), versus **0.0346206724** before decoding; no coherent original plaintext appears. The source-picked generator directly equals only **3/127** or **8/127** original ciphertext runes. All 127 original inverses re-encrypt exactly; the independently constructed GP29 encrypted plant recovers all 127 positions.

**All-secret nonlinear completion.** The trajectory has a stronger key-free implication. With source-forced recurrence S[i+1] = u S[i] + Q[i], grant **any secret nonlinear stationary function** from one GF(29²) state to a GP29 output and enumerate **all 841 possible hidden initial states**. If one field state appears twice, its output rune must be the same. This necessary equality condition holds for every conceivable 29-output lookup table and needs no fitted table entries.

| Quotient pairing | Initial states compatible with any single shared nonlinear lookup | Fewest contradictions among all 841 states | Initial states compatible with independent red/black lookup tables | Ac24 source seed contradictions after red/black separation |
| --- | ---: | ---: | ---: | ---: |
| Adjacent | **0/841** | **2** | **8/841** | **5** |
| First half / second half | **0/841** | **1** | **3/841** | **7** |

The eight two-ink-compatible adjacent seeds are [1,1], [6,7], [7,22], [8,1], [9,22], [10,19], [12,0], [16,12]. The three split-half seeds are [12,28], [15,20], [17,4]. Neither independently marked source candidate Ac24 **[24,0]** nor the extension root **[23,27]** lies among them. The latter yields **6 or 7** conflicting rune occurrences after ink separation (adjacent or halves). Correctly encoded secret nonlinear one-map and two-ink-map plants pass the same equality test. A single stationary nonlinear field-to-rune map is excluded for **every possible hidden initial seed**. If the manuscript specifies entirely different output tables for the two ink runs, a few unselected hidden seeds survive; they do not identify a real key, plaintext or mechanism. [Complete 841-seed reproducer](../sims/red_triad_terminal_linear_state_allsecret_sft.cjs) · [successful extended manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42928167043).

**Decision and limit:** The original ciphertext excludes the whole five-secret-parameter affine observation family and every single shared stationary nonlinear field-to-GP29 output map under the stated source-forced trajectory. The independently source-selected Ac24 two-ink nonlinear lookup also fails, and the fixed additive-key inverse stays ciphertext-like. It does **not** exclude an unknown plaintext combined with the register, nonlinear state updates, separate ink-dependent output maps with unconstrained seeds, changing output tables over time, or a different interpretation of the 127 terminal runes. The 127-rune grouping and the choice of a field recurrence are candidate mechanisms, not authenticated historical instructions. [Executable single-file test](../sims/red_triad_terminal_linear_state_allsecret_sft.cjs) · [successful manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42927189771).

## Interpretation and open mechanism

The byte gate and separate all-secret terminal-register test are finite exclusions under different source interpretations. The byte gate is an exact original-input obstruction to a **canonical one-byte-per-two-runes** field transport with only row-wise secret offsets under the two declared source-multiplier rules. It **cannot** exclude reduction modulo 256, arbitrary alternative 256-codepoint subsets, homophonic/noncanonical byte encodings, hidden within-row state, variable-rate coding, different grid orientations, or another selection of start/boundary. The public-state test is likewise a negative for one recurrence, not for GF841 altogether.

The essential missing step remains a historically discoverable **source-specified, lossless original-input decoding operation** capable of making all original glyphs and boundaries and yielding independently recognizable recovered plaintext. Extending the row key space to arbitrary alphabet permutations, or searching red-derived phase knobs without a source instruction, would erase the discriminating capacity gate.
