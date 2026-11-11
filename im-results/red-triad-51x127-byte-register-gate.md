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

## All-secret affine 51×127 source-quotient byte obstruction (Agent 11, 11 November 2026)

The previously tested two per-row scalar multipliers leave a larger, precisely testable family: **any invertible secret 2×2 matrix and any secret two-coordinate offset independently for each of all 51 source-sized rows**. Retain the first two original runes as a header, then use the original p3 irreducible red-triad field \(u^2=8+3u\), the p39 factor \(15(X-24)^2\), the 254 exact quotient coefficients of the original 256-cell base60 table, and their 127 adjacent pairs \(Q_j\in\mathrm{GF}(29^2)^\times\). For each of the 51 rows of 127 original ciphertext field pairs, the bounded candidate encoder is

\[
C_{rj}=Q_j^{\varepsilon}\bigl(L_r B(b_{rj})+\beta_r\bigr),\qquad \varepsilon\in\{+1,-1\},\quad L_r\in\mathrm{GL}_2(\mathbb F_{29}),\quad \beta_r\in\mathbb F_{29}^2.
\]

Here \(B(b)=(\lfloor b/29\rfloor,b\bmod29)\) is the canonical injective byte representation for \(0\le b\le255\). The source-derived field schedule and all original rune coordinates are frozen, while **every hidden affine key in each row is unconstrained**. This gate therefore strictly extends the earlier source-red-multiplier/static-row-offset test and is distinct from the separately evaluated evolving-feedback byte and arbitrary stationary-codebook models.

An unavoidable necessary condition for a decoded byte is that its first field coordinate belongs to \(\{0,\dots,8\}\). We deliberately accept all \(9\times29=261\) field pairs in this strip, including five invalid byte values, favouring the proposed cipher. The first coordinate of the inverse of any affine \(L_r\) is a nonzero linear functional plus a constant. Over the field basis fixed by p3, all 840 nonzero linear functionals can be enumerated exactly as the first coordinate of multiplication by each nonzero GF841 scalar. All possible additive offsets correspond to the 29 modular translates of the nine-adjacent-residue strip. Therefore the maximum valid-pair count after maximizing over **all 840×29 possibilities for each row separately** is an exact upper bound for *every secret* \(L_r,\beta_r\), not a fitted language score or sampled key search.

| Original field transform | Lowest row-specific maximum (out of 127) | Highest row-specific maximum | Mean of 51 row maxima | Fully byte-valid rows |
| --- | ---: | ---: | ---: | ---: |
| Divide original ciphertext by \(Q_j\) | **57** | **66** | **59.86274510** | **0/51** |
| Multiply original ciphertext by \(Q_j\) | **56** | **64** | **59.76470588** | **0/51** |

Even the *best* original row falls at least **61/127** symbols short of the generous necessary condition. For positive controls, both orientations encrypt a deterministic complete **6,477-byte** sequence using all 51 original red-rune row selectors, source-fixed \(Q_j\), a hidden invertible field multiplier, and a hidden row offset. Each planted byte is exactly decoded and re-encodes, while the same all-secret strip test admits **127/127 for all 51 planted rows** in both orientations. The exact source-input Node 22 manual run [42934090147](https://github.com/FlareZ123/liber-primus/actions/runs/42934090147) passes with the above counts and all planted controls.

**Decision:** No source-original ciphertext under either declared \(Q_j^\pm\) orientation can be an ordinary fixed-width 8-bit byte sequence through an arbitrary *row-stationary affine GL2(F29) block transform*, regardless of its 51 hidden keys. This says nothing about other pairings, a source-dependent per-column state, nonlinear byte codebooks, variable-length encoding, or a different use of the red inscriptions. It provides an all-secret negative for a larger original-source cipher family and no new plaintext.

**Reproducer:** [all-secret affine quotient-byte SFT](../sims/grid_quotient_allsecret_affine_byte_gate.cjs) on the original 12,956-rune corpus, 256-byte grid and ink annotation.

## All-841-row-state variable-multiplier byte obstruction (Agent 48)

A distinct use of the same source-fixed 127 quotient field elements lets the **state evolve within each row**, with no restriction on its unknown row seed. As before, the 12,954 original rune positions following the two-rune header form exactly 51 rows of 127 ciphertext pairs \(C_{r,j}\in\mathrm{GF}(29^2)\). The only source multipliers are the 127 original quotient pairs \(Q_j\). The proposed emission is \(C_{r,j}=P_{r,j}+S_{r,j}\), with either of two feedback laws:

\[
S_{r,j+1}=Q_jS_{r,j}+C_{r,j},
\quad\text{or}\quad
S_{r,j+1}=Q_jS_{r,j}+P_{r,j}.
\]

Grant **each row its own arbitrary hidden initial field element**, exhausting **all 841 possibilities in every row**, with no English scoring or fitting. The first two original runes [15,8] are retained as a public two-rune header but **not used to constrain any row seed**. The binary plaintext register may take either canonical radix29 field representation \(P=[b\bmod29,\lfloor b/29\rfloor]\) or its coordinate reverse \(P=[\lfloor b/29\rfloor,b\bmod29]\) for any byte \(0\le b<256\).

| Original 51-row exact gate | Ciphertext feedback | Plaintext feedback |
| --- | ---: | ---: |
| Rows admitting **127/127** canonical bytes, *either coordinate order* | **0/51** | **0/51** |
| Best count over **all 51×841** row states, \(a+29b<256\) | **60/127** | **60/127** |
| Best count over **all 51×841** row states, \(b+29a<256\) | **60/127** | **62/127** |

Even the individually best hidden seed for the best row cannot place half the plaintext field pairs inside the canonical 256-byte alphabet. This is an **all-secret key-independent exclusion** of these two fully specified within-row feedback laws as direct canonical-byte transports. The 51 independent row seeds are far more permissive than a single initial state or the original public header.

The primitive element \(u\) from p3 provides a further **source-selected noncanonical-byte encoding**: interpret any byte \(b\) as \(u^{h+b}\), with a **completely unknown row-local cyclic phase** \(h=0,\dots,839\). This grants every possible rotation of the 256 consecutive exponent codepoints in the field's 840-element multiplicative cycle, without assuming the actual byte contents or matching the 256 printed grid values. A candidate row's 127 plaintext field elements admit such an interpretation iff they are all nonzero and their 127 discrete-log residues fit a cyclic arc of span at most 255. For every source row and all 841 hidden initial states:

- **Ciphertext feedback:** 0/51 rows can be encoded; the **shortest attainable** log arc among all original row/state candidates spans **727** exponents, against maximum allowed 255.
- **Plaintext feedback:** 0/51 rows can be encoded; the shortest attainable arc spans **743** exponents.

Each of the two feedback laws passes a complete planted 51-row byte-register test for both the canonical base29 and the cyclic-log transport when the original quotient multipliers and correct secret row states are supplied. In the frozen first-row byte and logarithmic plants, rotating the source multiplier schedule by one pair yields no compatible secret initial seed. These controls show the capacity obstruction would not reject a true key under the declared model. They do **not** provide a private key for the authentic manuscript.

**Reproduce:** [all-841-seed variable-multiplier 51×127 byte gate](../sims/red_triad_qmult_allstate_byte_sft.cjs). This adds a dynamic, fully hidden row-state architecture and an unknown-phase primitive-logarithm codebook, neither of which was included in the earlier constant row-offset capacity gate. It remains conditional on the source's particular quotient order, pair boundaries, field addition, two feedback laws and the byte alphabet. The general **stationary arbitrary-256-codebook case** is fully tested and excluded below for these same two feedback laws; row-changing or state-dependent codebooks, additional nonlinear transformations, and different state updates remain untested.

## All-secret arbitrary 256-element codebook obstruction from three rows (Agent 48)

The preceding capacity tests assumed a specific field-to-byte mapping. A **strictly stronger key-independent result** eliminates even an *unknown, completely arbitrary*, but **stationary**, 256-element field alphabet under either of the two evolving quotient-multiplier feedback laws above.

Use the first **three** complete rows of the proposed 51×127 field array, i.e. **762 original ciphertext runes** at unsolved-book offsets **2–763**, interpreted as 381 field elements. For each of the 3 rows, independently enumerate **all 841 hidden GF(29²) initial states**. Invert \(C_j=P_j+S_j\) with \(S_{j+1}=Q_jS_j+C_j\) (ciphertext feedback) or \(S_{j+1}=Q_jS_j+P_j\) (plaintext feedback), using exactly the 127 source polynomial-quotient multipliers. Let \(A_r(h)\) be the **set of distinct output field elements** of row \(r\), given arbitrary secret seed \(h\). If the first three rows were one byte per field pair in **any fixed 256-codepoint alphabet** \(K\subset \mathrm{GF}(29^2)\), there would have to exist seeds \(h_0,h_1,h_2\) with \(A_0(h_0)\cup A_1(h_1)\cup A_2(h_2)\subseteq K\), hence union size \(\le256\).

The exact, elementary three-set inequality supplies a certificate without choosing any codebook:

\[
|A\cup B\cup C| =
|A|+|B|+|C|-|A\cap B|-|A\cap C|-|B\cap C|+|A\cap B\cap C|
\ge L(A,B,C),
\]

where \(L=|A|+|B|+|C|-|A\cap B|-|A\cap C|-|B\cap C|\). The reproducible SFT precomputes **all 841² pairwise intersection counts** for each row pair and then enumerates **every 841³ = 594,823,321 seed triple per feedback law**. Its exact minima, attained in the original input, are:

| Original, any of all 594,823,321 independent row-seed triples | Ciphertext feedback | Plaintext feedback |
| --- | ---: | ---: |
| Minimum lower bound \(L\) for alphabet size | **260** | **261** |
| Seed triple attaining that minimum (field seeds as integers \(a+29b\)) | **[476,384,589]** | **[163,39,107]** |
| Actual distinct plaintext field elements at that witness | 273 | 270 |
| Seed triples not excluded by \(L>256\) | **0** | **0** |

For the ciphertext-feedback witness, the three set sizes are [115,112,111], pair intersections [34,24,20] and triple intersection 13, so \(L=260\) and actual union 273. The plaintext-feedback witness has sizes [114,113,112], pair intersections [27,25,26], triple intersection 9, giving \(L=261\), union 270. The minima are **global**, not maxima selected among sampled seeds: all 594,823,321 combinations were checked per model. Therefore the actual union is **at least 260** under ciphertext feedback and **at least 261** under plaintext feedback for *every* possible set of secret row seeds. **No stationary 256-symbol field codebook exists for either stated model, regardless of codepoint assignment, byte spelling, source text language, or arbitrary secret row states.**

**Positive control:** separately invent a noncanonical 256-element field codebook \(x_b=(37b+17)\bmod841\), choose 381 codepoints from it, and encode all three 127-element rows under the *same original quotient multipliers* with three hidden initial states, separately under each feedback law. The detector enumerates all 841 states per row, without being given the encoder seeds, and finds a compatible secret state for every row. The actual planted plaintext uses at most 256 distinct field elements and each of the 381 encrypted field elements re-decrypts exactly with the correct state. This tests a genuine arbitrary field codebook beyond the canonical-base29 and primitive-log plants.

**Reproduce:** [standalone three-row arbitrary-codebook original-source SFT](../sims/red_triad_qmult_three_row_codebook_sft.cjs). The proof is stronger than the earlier 51-row canonical-byte tests in its unknown-codebook scope, yet deliberately conditional on **the precise source polynomial quotient ordering, two-rune header, fixed pair clock, field addition, two feedback recurrences and one global stationary alphabet**. It does **not** exclude a row-changing 256-element alphabet, different field/output arithmetic, state-dependent codebooks, hidden alternate alphabet segmentation, more complex state updates or missing external key instructions. No original LP2 plaintext or authentic cipher is recovered.

### Independent p53-red-scaled output law (Agent 48)

The first three of p53's **51 red source runes**, with original GP values **[16,13,7]**, give a more complete source-dependent family: set \(\alpha_r=u^{R_r}\) in the same GF841 field and emit

\[
C_{r,j}=\alpha_rP_{r,j}+S_{r,j},\qquad
S_{r,j+1}=Q_jS_{r,j}+
\begin{cases}
 C_{r,j}, & \text{ciphertext feedback};\\
 P_{r,j}, & \text{plaintext feedback}.
\end{cases}
\]

Every row's \(\alpha_r\) is public and nonzero, and the candidate plaintext is \(P_{r,j}=\alpha_r^{-1}(C_{r,j}-S_{r,j})\). **Each row still has its own arbitrary secret initial field state**, with all 841 possibilities tested. The same exhaustive **841³** triple-set certificate is now independently computed for this red-scaled output model, without assuming any particular byte spelling or codepoint assignment:

| Original first-three-row field codebook constraint | Source-unscaled \(\alpha=1\) | **Red-scaled** \(\alpha_r=u^{[16,13,7]_r}\) |
| --- | ---: | ---: |
| Minimum possible alphabet, ciphertext feedback (Bonferroni lower bound) | **260** | **260** |
| Minimum possible alphabet, plaintext feedback | **261** | **261** |
| Hidden seed triples escaping the 256-alphabet obstruction, *per feedback law* | **0/594,823,321** | **0/594,823,321** |

For the red-scaled ciphertext-feedback certificate the tight lower-bound witness is the source-seed triple **[19,480,235]** (sets [114,116,113], pair intersections [22,27,34], triple intersection 10, actual union **270**). Under plaintext feedback the witness is **[79,646,534]** (sets [111,116,111], pair intersections [27,25,25], triple intersection 9, actual union **270**). Their inclusion-exclusion lower bounds are exactly 260 and 261, respectively. A source-compatible plant uses a deliberately **noncanonical arbitrary 256-element codebook** \(x_b=(37b+17)\bmod841\) and three independently secret row states, exactly roundtrips every **381** field plaintext/ciphertext pair and is recognized by exhaustive state enumeration under both feedback laws.

**Reproducer:** [p53-red-scaled all-secret GF841 codebook SFT](../sims/red_triad_qmult_red_scaled_codebook_sft.cjs). This directly incorporates the 51 visible red runes absent from the earlier unscaled model. The result establishes a conditional obstruction for these **four** public-feedback-and-row-scale combinations, with independent arbitrary row secrets and unknown fixed codebook. It does not prove that the author's cipher used the proposed field multiplication, or exclude other state laws, source pairings, per-row changing codebooks, nonbyte alphabets or independent hidden material.

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

**Ciphertext-feedback escape and identifiability.** A genuinely evolving state could absorb the current ciphertext rune, so a separate, more permissive necessary-condition test uses S[i+1] = u S[i] + Q[i] + f·e(c[i]), where the secret scalar f ranges over all 29 F29 values, and e embeds c[i] into either field basis coordinate. As before, the direct GP29 output function is allowed to be *any arbitrary stationary secret nonlinear lookup*. We exhaust all 29×841 = **24,389 scalar/initial-state keys per pairing and input coordinate**, using the same exact repeated-state test, with source-generated nonlinear-lookup positive controls.

| Quotient pairing | Feedback coordinate | Exact-compatible unknown keys | Among them, keys with zero repeated states | Largest repeats for one compatible key |
| --- | --- | ---: | ---: | ---: |
| Adjacent | constant component | **1/24,389** | 1 | 0 |
| Adjacent | u component | **3/24,389** | 2 | 2 |
| First half / second half | constant component | **1/24,389** | 0 | 1 |
| First half / second half | u component | **1/24,389** | 1 | 0 |

These six keys are **not recovered cipher keys**. Four of their state paths have no repeat at all, and the remaining two have only one or two repeat visits. An unconstrained state-to-rune lookup can exactly *memorize* an arbitrary 127-rune sequence along such a collision-free route. For perspective, an idealized iid uniform-state birthday model with 127 samples and 841 states predicts roughly **1.07 collision-free trajectories per 24,389 tries**; that occupancy approximation is diagnostic, not a fitted empirical null for this feedback recurrence. The original survivors offer at most two same-state equality predictions and no identified plaintext or source-selected scalar. Distinct keys and ink-dependent tables increase underidentification. This is why the direct-output no-feedback exclusion cannot be promoted to excluding feedback-driven cryptography. [Complete original-input/exact positive-control test](../sims/red_triad_terminal_linear_state_allsecret_sft.cjs) · [passed manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42929603270).

**Decision and limit:** The original ciphertext excludes the whole five-secret-parameter affine observation family and every single shared stationary nonlinear field-to-GP29 output map under the stated source-forced trajectory. The independently source-selected Ac24 two-ink nonlinear lookup also fails, and the fixed additive-key inverse stays ciphertext-like. It does **not** exclude an unknown plaintext combined with the register, nonlinear state updates, separate ink-dependent output maps with unconstrained seeds, changing output tables over time, or a different interpretation of the 127 terminal runes. The 127-rune grouping and the choice of a field recurrence are candidate mechanisms, not authenticated historical instructions. [Executable single-file test](../sims/red_triad_terminal_linear_state_allsecret_sft.cjs) · [successful manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42927189771).

## Reversible 127-rune GF841 trace projection with all possible field offsets (Agent 10)

**Distinct original-input cipher hypothesis, 11 November 2026.** The 254 coefficients left by exact polynomial division of the 256 source bytes by the marked `(X−24)²` form **127** field elements `Q_i` in GF29², using adjacent pairs or the two 127-coefficient halves. The source-visible p3 primitive element `u` (order840) and independently derived source root `z=23+27u` provide two frozen possible multiplying clocks `G_i = u^i` or `z^i`. The red-terminal original passage is **p53's last 51 red runes plus p55's 76 runes**. The grouping is a candidate mechanism, not an authenticated reading instruction.

One natural field→GP29 cipher is a trace projection of a plaintext rune embedded in the base field. Test the **fully reversible** output rule

```text
C[i] = Tr(G[i] · (Q[i] + W + (P[i], 0))) mod 29,
G[i] := G[i] · u when Tr(G[i]) = 0
```

where `W` is **any of all 841 possible secret GF29² offsets**, and `Tr(a+bu)=2a+3b mod29`. The fallback rotates only at the source-forced zero-trace phases **[15,45,75,105]**, avoiding loss of a plaintext GP symbol. It is independently defined from the field basis, with no output-dependent rephasing or fitted plaintext. For each original ciphertext rune the inverse is unique because `Tr(G[i]) ≠ 0` after fallback. These clocks/pairings yield four bounded source configurations.

An Emerson-native GP29 trigram model was frozen independently of LP2 (324,630 training runes); **496** nonoverlapping Gibran-native GP control windows of exactly 127 runes score between **−8.57408** and approximately **−7.37236** nats/rune. Each configuration tested all **841** secret offsets against the **same unchanged original 127-runic ciphertext**:

| Field clock | Quotient pairing | Best original trigram nats/rune | Original best `W` | Models matching even the lowest native reference |
| --- | --- | ---: | --- | ---: |
| `u^i` | Adjacent | **−12.66663** | [18,19] | **0/841** |
| `u^i` | Halves | **−12.56459** | [0,20] | **0/841** |
| `z^i` | Adjacent | **−12.55668** | [24,28] | **0/841** |
| `z^i` | Halves | **−12.72389** | [11,16] | **0/841** |

The historical Rad/Ac seed **[4,24]** also fails in every configuration, with scores from **−14.31906** to **−13.34015**. Under each of the four rules, a real 127-rune Gibran-native GP test message was encrypted with the same source quotient and [4,24] and decrypted **127/127 exactly**, while a wrong seed gives different plaintext. Thus the original's failure is a source-language result and a fully reversible original cipher check, not a codepath that cannot invert.

**Stronger necessary-condition obstruction for the non-fallback trace law.** If the exceptional four positions retain `G_i` without the fallback, their base-field coefficient `Tr(G_i)` is zero, so any secret initial offset `W=(w_0,w_1)` would have to satisfy four equations that individually fix the *same* `w_1`. The original forces incompatible values:

| Generator | Adjacent 4 forced `w_1` | Halves 4 forced `w_1` |
| --- | --- | --- |
| `u` | 9,22,25,12 | 12,22,12,8 |
| `z` | 17,4,0,12 | 20,4,16,8 |

So **none of the 841 unknown seeds** can directly generate this original 127-symbol target with `P_i` embedded in the base field and the unmodified trace clock, even allowing arbitrary plaintext there. The repaired reversible-clock variant removes that obstruction but remains utterly unlike native-GP language under all 3,364 scored models.

**Decision:** this exact trace-projection family is negative for original recognizable GP prose. It cannot exclude a terminal channel that encodes binary key material, another GP embedding/projection, a changing field offset, or a source-specified non-language register. It does not establish that the 127 positions are plaintext or that the creator intended a trace cipher.

[Standalone reversible CommonJS source-original test](../sims/lp2_red_terminal_127_trace_projection_sft.cjs) · [successful manual Node22 CI 42931271124](https://github.com/FlareZ123/liber-primus/actions/runs/42931271124).

## Source-seeded 51×127 block-reset additive pair stream (Agent 42, 11 November 2026)

The exact size identity \(12{,}956=2+51\times127\times2\) suggests a source-visible framing distinct from the earlier continuous 127-period recurrence: preserve the first two original runes as a header, then treat p53's **51 red runes** as one seed per row, p54's oversized **Ac=24** as the other field coordinate, and the p39-derived 127 quotient pairs as the row clock. This is a source-motivated candidate, not an authenticated author instruction.

The frozen state is \(S_{r,0}=(24,R_r)\), with the coordinate-reversed \((R_r,24)\) as the only representation comparator. In the p3 field \(u^2=8+3u\), each row updates \(S_{r,j+1}=uS_{r,j}\pm Q_j\), and the original ciphertext pair is decoded as \(P_{r,j}=C_{r,j}\pm S_{r,j}\). The state resets at each of the 51 rows. Both field-coordinate orders, both forcing signs and both output signs give **eight** deterministic variants; there are no fitted keys or ciphertext-selected phases.

All eight variants re-encrypt all **12,954/12,954** original payload runes and recover **12,954/12,954** symbols from an independently generated source-native GP plant. Wrong-source controls using a one-step-shifted red seed sequence, Ac root 23, or reversed quotient order fail exact plant recovery.

| Measure | Original |
|---|---:|
| Raw payload IoC | 0.0344789617 |
| Raw payload Shakespeare-GP trigram | −13.28405598 |
| Eight decoded IoCs | 0.03444959–0.03450609 |
| Eight decoded trigram scores | −13.32658575 to −13.24471456 |
| Best decoded score | −13.24471456 |
| Lowest of 300 same-length native windows (Shakespeare / Gibran / Emerson) | −7.94651145 / −8.39553970 / −8.40039103 |

Even the best original decode is **4.8443 nats/rune below the worst minimum** among the three same-length native-GP control-window families. The first 24 decoded symbols remain nonlinguistic. This is a bounded negative for the source-seeded, row-reset additive GF841 pair stream, not for all possible per-row state machines or non-GP registers.

Reproducer: [\`sims/red_triad_51x127_blockseed_inverse.cjs\`](../sims/red_triad_51x127_blockseed_inverse.cjs).

## Independent 128+128 trace-pad test (Agent 42 reproduction of Agent 48's source SFT, 11 November 2026)

A separate original-ink partition is exact: p53's **128 black** runes form lane A, while p53's **51 red** runes + p54 Ac + p55's **76** runes form lane B (128 symbols each). I independently reproduced the existing [\`sims/gf841_128_pair_trace_pad.cjs\`](../sims/gf841_128_pair_trace_pad.cjs) against the canonical corpus, ink annotations, original grid and native-GP controls.

Three source-fixed 128-symbol pads were compared: (1) adjacent quotient pairs with Ac field element \((24,0)\) inserted at the p54 boundary, then trace \(\mathrm{Tr}(a+bu)=2a+3b\); (2) adjacent pairs from the original row-major grid; and (3) adjacent pairs from the original column-major grid. For each pad, both lanes and both additive signs were decoded (12 candidates total). The B−A relation matches the signed quotient trace at **8/128** positions and the reverse at **9/128**; row-major gives **7/128** and **1/128**, and column-major **6/128** and **5/128**. These counts are descriptive; no familywise null was run, and they do not identify a cipher.

All 12 candidate trigram scores range from **−13.74765053 to −12.95267344** nats/rune. The best is still **3.8602 nats/rune below** the worst minimum among 300 same-length native-GP control windows (Shakespeare −8.29104391; Gibran −9.09246652; Emerson −8.85094570). Candidate IoCs range **0.03198819–0.03801673**. The quotient-trace positive plant recovers **128/128** symbols; the wrong row-major pad matches only **6/128** planted symbols. The exact 128+128 source geometry therefore does not yield plaintext under these direct additive trace-pad readings.

This 128+128 result is separate from the 51×127 row-reset model above and from the 127-rune terminal trace projection tested elsewhere. It is a bounded negative, not an exclusion of other stateful or non-GP uses of the two lanes.

## Source-quotient [127,51] Reed–Solomon codeword test (Agent 42, 11 November 2026)

The exact \(51\times127\) shape also motivates a source-locked error-correcting-code hypothesis: interpret each row as a degree-\(<51\) polynomial over the p3 field \(\mathrm{GF}(29^2)\), evaluated at the 127 adjacent quotient pairs \(Q_j\) from the p39-divided original grid. The first 51 evaluations are the systematic data; the remaining 76 are held-out parity symbols. The p53 red-span count supplies \(k=51\), while the quotient supplies the ordered \(n=127\) points. This is a candidate interpretation of the dimensions, not evidence that Cicada used Reed–Solomon coding.

The 127 source quotient pairs contain only **121 distinct field points**. The six duplicate pairs occur at zero-based positions **[2,108], [3,99], [11,86], [30,85], [34,118], [40,54]**. A polynomial evaluation at the same field point must return the same field symbol. Across all 51 original rows, **0/306** duplicate-point comparisons agree. This alone contradicts direct evaluation at the source-ordered \(Q_j\).

As a second independent check, Newton interpolation through the first 51 (all distinct) source points predicts only **2/3,876** held-out original field symbols; a uniform random match expectation is \(3{,}876/841=4.6088\). The two accidental matches are one each in rows 30 and 32; every other row has zero. The same interpolation implementation recovers a planted set of 51 independent degree-\(<51\) native field polynomials at **3,876/3,876** held-out symbols.

This rejects the direct systematic \([127,51]\) GF(29²) evaluation-code interpretation with the original quotient-point order. It does not exclude a generalized code with independently source-specified column multipliers, a different evaluation set, or a clue-directed pre/post transform; none is supplied by the tested direct reading. No plaintext or key is recovered.

Reproducer: [\`sims/gf841_51x127_rs_codeword_gate.cjs\`](../sims/gf841_51x127_rs_codeword_gate.cjs).

## Primitive-power [127,51] codeword test with the source-defined field generator (Agent 32, 11 November 2026)

The original p3 red polynomial defines a **primitive element** `u` of GF(29²), with multiplicative order **840**. An alternative to the duplicate-valued grid-quotient evaluation points tested immediately above is the standard, **127 distinct primitive-power points** `u^j`, `j=0..126`. This uses the same source-constrained **51×127** field-symbol geometry after the two-rune header, with k=51 from the p53 red span and n−k=76 from the p55 terminal page. It is a natural error-correcting-code hypothesis to test directly, without language-model key search.

For each of **51 original rows**, a degree-<51 GF(29²) polynomial was uniquely fitted to columns 0..50 and predicted at the remaining **76** points. Both field-coordinate orientations (adjacent rune digits `(a,b)` / `(b,a)`) and `u` versus `u⁻¹` and their Frobenius-conjugate generators (`u²⁹`, `u⁻²⁹`) were covered: **eight source-fixed configurations**. Exact matches among the **3,876 held-out original field symbols** were **[5, 2, 1, 3, 5, 3, 3, 11]** in that declared order, with **at most one match in any row**; chance expectation for uniformly distributed field symbols is **4.61 per setting**. Every one of the eight matched native-field codeword controls recovered **3,876/3,876** symbols.

A genuine systematic [127,51] Reed–Solomon codeword under any of these fixed primitive-power evaluation sets would predict **all 3,876** original held-out symbols. The observed **maximum 11/3,876** is therefore a decisive original-input rejection of these direct fixed code families, complementing the earlier grid-quotient-point rejection. It cannot rule out a source-selected nonlinear symbol transform, generalized RS column weights, hidden per-row state, or a different framing. **No unknown plaintext or authentic key results.**

**Reproducer:** [source-primitive GF841 RS gate](../sims/gf841_51x127_primitive_rs_original_sft.cjs). **Executed:** [manual GitHub Actions run 42949345295 passed](https://github.com/FlareZ123/liber-primus/actions/runs/42949345295).
## Source-seeded rank-one row×column GF841 mask (Agent 42, 11 November 2026)

A second direct use of the exact 51×127 layout is the source-separable outer-product mask. For row \(r\), form \(R_r=(24,\rho_r)\) from p54 Ac=24 and p53 red rune \(\rho_r\) (also test the coordinate-reversed pair); for column \(j\), use the p39 quotient pair \(Q_j\). The candidate mask is \(K_{r,j}=R_rQ_j\) in the p3 field, and the original pair is decoded as \(P_{r,j}=C_{r,j}\pm K_{r,j}\). This is a one-step, reversible, no-free-key operation; both seed coordinate orders and both signs give four variants.

All four variants exactly re-encrypt the original payload and recover a 12,954-rune native-GP plant. Wrong red-seed, Ac=23 and reversed-Q positive controls fail exact recovery. The original decoded IoCs are **0.03446622–0.03453488** and trigram scores **−13.31971976 to −13.25731714**. The best remains **4.8569 nats/rune below** the weakest minimum among 300 same-length native-GP windows (same control minima as the row-reset test above). The raw ciphertext score is −13.28405598; none of these variants produces linguistic structure.

This rejects only the direct source-fixed rank-one mask \(R_rQ_j\), not arbitrary bivariate maps or a different key schedule. No plaintext or authentic key is recovered.

Reproducer: [\`sims/gf841_51x127_outer_product_mask.cjs\`](../sims/gf841_51x127_outer_product_mask.cjs).

## p57 cicada stipple 241/331 selector gate

A source-constrained two-dimensional mask was tested from the p57 cicada illustration and p32's 11×11 prime grid. The original image analysis gives **241** small stipple components on the left and **331** on the right. These are the 53rd and 67th primes; the proposed selector maps those ordinal positions to p32 rune offsets **53** and **67**, whose GP-prime weights are **101** and **11**. Since 53 and 67 are also GP prime weights for **S** and **E**, the same counts admit a secondary literal **SE** reading. That compass interpretation is not used by the mask below and has not been tied to a unique route. The p32 offset selection is a candidate cross-page relation, not an established author instruction (see [Agent 46's source proposal](../communications/agent42/20261111T0247Z_agent46_p57-stipple-gf841-period-pair.md)).

In GF(29²), with u² = 8 + 3u, the two selected coefficient pairs are:
- zL = (101 mod 29, 11 mod 29) = (14, 11) = u^50; multiplicative order 84.
- zR = (11 mod 29, 101 mod 29) = (11, 14) = u^588; multiplicative order 10.

Their orders multiply to **840**, the full nonzero multiplicative-group order. With the original 51×127 field-pair register C[r,j] after the two-rune header, and the 127 original p39 quotient pairs Q[j], the frozen mask is:

`K[r,j] = zL^r * zR^j * Q[j]`

No phases, rotations, row keys, or fitted parameters are used. The four natural field-group operations were tested: P = C - K, P = C + K, P = C / K, and P = C * K.

| Original decode | Canonical bytes (29*a+b < 256) | Reversed-coordinate bytes (a+29*b < 256) | Rows with 127/127 canonical bytes |
|---|---:|---:|---:|
| Unmasked register | 1,917 / 6,477 | 1,920 / 6,477 | 0/51 |
| C - K | 1,965 / 6,477 | 1,997 / 6,477 | 0/51 |
| C + K | 1,988 / 6,477 | 1,990 / 6,477 | 0/51 |
| C / K | 2,014 / 6,477 | 1,940 / 6,477 | 0/51 |
| C * K | 1,880 / 6,477 | 1,919 / 6,477 | 0/51 |

The random expectation for either canonical 256-of-841 strip is **1,971.60/6,477**. All four results are near this baseline, and no row yields a complete 127-byte sequence. The original payload's Shakespeare-GP trigram score is **−13.28405598** nats/rune; the four decoded scores are **−13.27240204**, **−13.23542527**, **−13.29513756**, and **−13.26385430**. The best remains **4.8350 nats/rune below** the weakest minimum among 300 same-length native-GP windows (Shakespeare **−7.94651145**, Gibran **−8.39553970**, Emerson **−8.40039103**). No GP-English structure appears.

**Additional source reading and row-clock tests (Agent 42).** The same 241/331 split has a second compact reading through the visible thirteen-dot mark: 241 = 13·18 + 7 and 331 = 13·25 + 6. This gives M=[[18,7],[25,6]] over F29, an invertible matrix of exact order 105=3·5·7. The remainders match p57 body sentence word counts 7/6/6; quotient 18 is GP rune E, the final rune of red PARABLE, and 25 is AE. The total stipple count 574 is also 7×(51+31), where 51 is the p53 red-run length and 31 the count of thirteen-dot marks. This is a second candidate interpretation, not an authenticated operation.

Agent42's original-input SFT additionally tested M as a row-reset state transition, S[r,0]=(24,R[r]) or (R[r],24), P=C−S and S[r,j+1]=M·S[r,j]+Q[j]. It also tested the two-cycle mask with the p53 red-rune value as the row exponent, K[r,j]=zL^R[r]·zR^j·Q[j], under all four additive/multiplicative operations. Results:

| Additional candidate | Source-fixed rule | Original GP IoC | Shakespeare-GP trigram, nats/rune |
|---|---|---:|---:|
| M state | seed (24,R); S'=MS+Q | 0.03448360 | −13.25225692 |
| M state | seed (R,24); S'=MS+Q | 0.03448 | −13.29682052 |
| Red-rune two-cycle additive | P=C−K | 0.03447604 | −13.29314225 |
| Red-rune two-cycle additive | P=C+K | 0.03447332 | −13.26999841 |
| Red-rune two-cycle multiplicative | P=C/K | 0.03445316 | −13.30056585 |
| Red-rune two-cycle multiplicative | P=C·K | 0.03450538 | −13.22758560 |

All six additional variants also re-encrypt the original exactly and recover their matching 12,954-rune native-GP positive plants exactly. The best score remains at least 4.8272 nats/rune below the lowest same-length native-control minimum. This rejects these direct M-state and red-rune-clock uses, not the 241/331 selector itself.

A further source cross-link is provisional: the selected p32 offset 67 is coordinate (6,1), the endpoint of Agent 20's seven-step word-centre route; the selected GP-prime weight 101 is its second word-centre value, while 11 occurs in the red PARABLE heading. The prime-exponent interpretation u^241/u^331 (whose ratio is scalar 10, GP index 10 / prime weight 31) and the proposed southeast-diagonal extraction remain untested.

All four original-input transformations re-encrypt exactly. A deterministic **6,477-byte** canonical plant, b[i] = (73*i+41) mod 256, is also recovered exactly under all four inverse operations. The 127 quotient pairs are nonzero, so the multiplicative cases are well-defined.

**Decision:** this rejects the exact zL^r*zR^j*Q[j] mask as a direct canonical-byte transport or recognizable GP-English decode. It does not reject other uses of the p57 counts, the p32 antipodal pair, or nonlinear/non-byte state.

Reproducers: [Agent 24's canonical-byte two-cycle gate](../sims/gf841_51x127_two_cycle_mask_sft.cjs) and [Agent 42's full source-fixed field-clock gate](../sims/lp2_stipple_241_331_field_clock_gate.cjs).

## p57-derived SE diagonal as a row seed — bounded negative

The secondary reading of the p57 left/right prime ordinals as GP runes S/E gives a candidate southeast direction. Applied to the row-major 51×127 field register, the simplest direct use is the main SE diagonal D[r] = C[r,r], one field element per row. Treat each D[r] as the row's fixed initial state and use the existing p3/p39 recurrence:
- S[0] = D[r]
- P[r,j] = C[r,j] - S[j] or C[r,j] + S[j]
- S[j+1] = u*S[j] - Q[j] or u*S[j] + Q[j]

Only the four sign combinations were tested; no phase, diagonal shift, alternate orientation, or seed fitting was used. All four transformations re-encrypt exactly when the extracted diagonal is held fixed, and a deterministic 6,477-byte plant is recovered exactly under all four inverse operations.

| Output sign | State sign | Canonical bytes (29*a+b < 256) | Reversed bytes (a+29*b < 256) | Shakespeare-GP trigram |
|---:|---:|---:|---:|---:|
| − | − | 2,000 / 6,477 | 2,014 / 6,477 | −13.25185388 |
| − | + | 1,955 / 6,477 | 1,971 / 6,477 | −13.24852301 |
| + | − | 1,951 / 6,477 | 2,025 / 6,477 | −13.27281310 |
| + | + | 1,959 / 6,477 | 1,969 / 6,477 | −13.29562028 |

No variant yields a complete 127-byte row. Counts remain near the random expectation **1,971.60/6,477** and near the unmasked baseline (1,917 canonical; 1,920 reversed). The best trigram score, **−13.24852301**, remains **4.8481 nats/rune below** the weakest minimum among the native-GP controls (−8.40039103). No plaintext structure appears.

**Decision:** reject the direct SE-diagonal-as-row-seed recurrence as a canonical-byte or GP-English decoder. This does not rule out a different use of the diagonal or a non-byte state machine.

Reproducer:
```sh
node sims/gf841_51x127_se_diagonal_seed_sft.cjs
```

## Interpretation and open mechanism

The byte gate, separate all-secret terminal-register test, and p57-stipple-selected two-cycle mask are finite exclusions under different source interpretations. The static-offset byte gate excludes canonical one-byte-per-two-runes encoding under the two tested row multiplier rules. The independent evolving-state gate excludes the same canonical transport and every row-rotated consecutive 256-exponent codebook under each of two quotient-multiplier feedback laws, **even allowing all 841 unknown states per row**. It **cannot** exclude reduction modulo 256, arbitrary alternative 256-codepoint subsets, homophonic/noncanonical byte encodings, hidden within-row state, variable-rate coding, different grid orientations, or another selection of start/boundary. The public-state test is likewise a negative for one recurrence, not for GF841 altogether.

The essential missing step remains a historically discoverable **source-specified, lossless original-input decoding operation** capable of making all original glyphs and boundaries and yielding independently recognizable recovered plaintext. Extending the row key space to arbitrary alphabet permutations, or searching red-derived phase knobs without a source instruction, would erase the discriminating capacity gate.
