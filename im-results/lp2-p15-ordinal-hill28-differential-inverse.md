# P15 Fibonacci-prime ordinals as a reversible 28-way Hill cipher: original-input decision

**Agent 13, 13 November 2026. Classification: independently source-motivated reversible candidate, bounded negative on unchanged original LP2 pp16–22. No unknown plaintext, historic encryption key, source-authenticated cipher, or destination has been recovered. The 26 November extensions below reject the affine-offset rescue and show that even arbitrary nonlinear lane bijections, private per-page framing and private escape glyphs cannot reproduce any matched native reference histogram in the named rank-four source-matrix family.** The original-scan/CommonJS test is [`lp2_p15_ordinal_hill28_rank_inverse_sft.cjs`](../sims/lp2_p15_ordinal_hill28_rank_inverse_sft.cjs), [successful GitHub Actions 43484491050](https://github.com/FlareZ123/liber-primus/actions/runs/43484491050).

## The clue and a new algebraic fit

The original physical p15 (scan 32.jpg) prints a 4×4 numeric spiral with center 3299. The existing [published numerical reconstruction](../results/lp2-p15-fibonacci-prime-spiral.md) shows that clockwise entries are `abs(3301−prime(F_n+1))`, for the sixteen distinct Fibonacci terms
`0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987`.
The original GP29 text has only **86 identical adjacent runes among 12,901 within-page successors**. Every *unequal* pair therefore encodes one of exactly 28 nonzero differences in GF29. A returning puzzle solver could combine the p15 4×4 matrix with a four-at-a-time, **28-ary differential** register. This is a specific new family beyond the earlier printed-number Hill4 **mod29** tests: 28 is the count of available nonzero predecessor steps, not the rune-alphabet size.

Write each of the sixteen **one-based prime ordinal indices** `F_n+1` back into the same original p15 square cells, then reduce modulo28. The exact matrix and a two-sided inverse over the nonfield ring Z/28Z are:

\[
A=\begin{pmatrix}
14&22&7&0\\
9&1&2&6\\
6&4&3&5\\
8&23&14&10
\end{pmatrix},\qquad
A^{-1}=\begin{pmatrix}
12&1&4&17\\
8&0&14&7\\
19&18&0&20\\
7&16&1&18
\end{pmatrix}.
\]

The ordinal matrix's integer determinant is **915**, or **19 modulo28**, coprime to28. A meaningful **same-layout selector** compares the four independently source-constrained numeric choices without any language scoring:

| Original p15 cell interpretation, unchanged 4×4 layout | Determinant modulo28 | Invertible? |
| --- | ---: | --- |
| **Fibonacci-selected prime ordinals** `F_n+1` | **19** | **Yes** |
| Fibonacci terms `F_n` | 21 | No; shares factor7 with28 |
| Actual selected primes | 24 | No; shares factor4 with28 |
| Original printed prime distances `abs(3301−prime)` | 24 | No; shares factor4 with28 |

The SFT **generates the first 988 primes**, verifies every printed numeric cell, checks all sixteen exact matrix coordinates, computes all four modular determinants directly and asserts both `AA⁻¹ = A⁻¹A = I mod28`. This uniquely selects ordinal values *within these four natural candidate matrices* as a reversible 28-way linear mixing register. These comparisons were selected after observing the no-doublet property; the structural fit is conditional and does not prove the author intended an ordinal matrix or a 28-way Hill cipher.

## Complete nonzero-step cipher and finite original inverse

For original rune ordinals `C_i` in GF29, at every nonrepeated within-source-run pair compute `D=(C_i−C_(i−1)) mod29`. It is in `1..28`. Two ordinary and fully invertible readouts give a digit `r∈0..27`:

- **Cyclic:** `r=D−1`.
- **Finite-field discrete log:** `r=log_15(D)`, using the independently known primitive generator 15 modulo29.

Group four successive nonzero ranks, map each block through the inverse matrix `A⁻¹`, interpret its four coordinates as GP plaintext indices 0..27. For this model an original equal-adjacent rune is a **transparent GP-EA/28 marker**, which bypasses the four-rank register. The first ciphertext rune of a unit acts as its IV and each final 1–3 unfilled ranks remains unassigned rather than silently padded.

The candidate's weakest unverified assumptions are that the **prime ordinals**, rather than the displayed prime differences or actual primes, are meant to be the matrix; that LP2 actually operates on nonzero predecessor differences; that repeated runes represent GP-EA; and that native GP prose is the direct output without an outer layer. Neither p15 art nor the original 2016 signed directions specifies this chain. The original 4×4 square being source-derived makes it affordable to test without new secret parameters, not historically verified.

Use the untouched **1,744 GP29 runes of physical pp16–22**, immediately following p15, in 16 source-fixed cases: cyclic or field-log rank; printed or transposed matrix; forward or inverse matrix; physical-page IVs (7) or one chapter IV (1). There are **10 repeated predecessor pairs** within the seven physical pages. The page-IV reading yields **1,716 complete four-block output symbols**, ten bypass markers, 11 unused tail symbols and seven IVs. The chapter-IV reading yields **1,732 complete four-block output symbols**, ten bypass markers, one trailing digit and one IV. No hidden phase, plaintext crib, key, alternate alphabet, language-optimized rotation, word-boundary reset or checksum is fitted.

The strongest of all sixteen **original** GP28 monogram coincidence indices is only **0.03592258082** (field-log ranks, transpose of the forward ordinal matrix, page-IV), almost the 28-way uniform value **1/28 = 0.03571428571**. Its first thirty output GP names are:
`R.F.X.EO.I.O.J.NG.X.D.AE.OE.G.F.B.W.H.J.T.M.U.N.OE.H.AE.C.L.AE.J.NG`.
No continuous GP-English results. Even this top value is *selected after sixteen tests*, and the source-print-order inverse itself scores lower. The independently solved literal p57 **95-rune GP28** control has IoC **0.06270996641**; that length mismatch is acknowledged, and the observed original output is judged as no convincing language, not a universal impossibility theorem.

An independent GP-native **92-symbol plaintext plant** from the genuine solved p57 is enciphered under the exact forward 4×4 source matrix and both 28-rank-to-GF29 step transports. The encoder deliberately inserts repeated-cipher-rune GP-EA bypasses. The complete inverse identifies all bypass positions, recovers **92/92 exact source plaintext runes** in each transport, and re-enciphers every emitted cipher rune. Thus the negative original result cannot be dismissed as a noninvertible modulo28 matrix or a broken step decoder.

## Exact unknown-escape and all-affine-offset extension (Agent3, 26 November)

The direct source matrix can be given a modest secret affine translation without inventing a new mixing matrix. This extension tests the printed ordinal matrix A in the forward sender (B=A^-1 in the inverse), a continuous chapter IV, and both prior nonzero-step transports. It **allows every one of 29 escape glyphs** rather than only EA, and every one of 28^4 independently secret four-lane additive offsets. The escape denotes an equal ciphertext predecessor pair and bypasses the mixed-rank clock. For each nonescape plaintext symbol P, delete escape E from the canonical GP order to obtain rank r, form r+k[lane] mod28, and mix groups of four with A. The final incomplete group uses identity mixing, with the same lane offset; this tail rule is an explicit analyst choice. Cyclic transport sends mixed digit+1; log transport sends 15^digit mod29. Accumulate each nonzero step modulo29 from the public first ciphertext rune. The inverse unmixed ranks and their four lane labels are fixed by the original ciphertext independently of E and the key.

The fit uses smoothed native conditional bigram log-likelihood, with add-0.25 smoothing, learned from Gibran lines 150–450 (4,647 greedily GP-transliterated runes). Fit stops just after the first 1,000 nonzero ranks, at a four-rank block boundary. The remaining sequence is not used to select E, transport or offsets. A pair with a fixed escape endpoint contributes a unary lane potential; two nonescape endpoints contribute a factor between adjacent cyclic lanes. Conditional on offsets x0,x2, the optimal x1 and x3 are independent. Enumerating x0,x2 and maximizing each of x1,x3 separately proves the exact maximum of the training objective over 28^4 offsets per E/transport; direct rescoring verifies the factorized objective to 1e-9. Thus 35,650,048 parameter combinations are covered, with no beam truncation. The same factorization computes an independently optimized heldout upper bound across the entire family.

| Data | Fitted E / transport / offsets | Fit nats/transition | Frozen heldout nats/transition | Heldout truth |
| --- | --- | ---: | ---: | ---: |
| Emerson plant | 28 / cyclic / 3,9,17,22 | -2.770585 | -2.741434 | 738/738 |
| Shakespeare plant | 11 / log / 25,2,14,8 | -2.613439 | -2.703384 | 743/743 |
| Original physical p16–22 | 22 / cyclic / 27,10,11,5 | -4.089677 | -4.377906 | unknown |

Both independent plants use the same-length 1,743-symbol source-prose slice starting at native-rune offset300 of the respective lines150–450 from the checked-in literary files; they are synthetic cipher controls, not genuine Cicada ciphertext. Both recover all 1,743 plaintext symbols and exact hidden parameters. Emerson has eight escape events, Shakespeare zero. Original is 1,744 cipher symbols including the public IV, 10 equal edges, 1,733 nonzero ranks, cut at plaintext offset1006, 737 heldout plaintext symbols. The best heldout score achievable with **any** tested key, even selected with hindsight, is -4.059343 nats/transition, below both controls. The best training candidate replays every ciphertext rune but is nonprose. Its first twenty rune names are H S Y U I C E L T E NG W IA EO L IA U L T EA. No original plaintext or authenticated key is recovered.

This is an exact language-score bound for the specified fixed matrix, continuous IV, canonical rank-minus-escape register, affine offsets and two transports; it is not a proof about arbitrary language, different matrices, state updates or alternate framings. The source does not select the extra offset or escape. The earlier fixed-matrix cases remain negative; this affordable extension removes the simplest private affine-offset rescue for the source-print orientation. Do not expand arbitrary parameters without an independent clue.

[Standalone CommonJS reproducer](../sims/lp2_p15_ordinal_hill28_affine_alloffset_sft.cjs) · [Exact core execution output](lp2-p15-ordinal-hill28-affine-alloffset-output.json). Executed in connected V8; standalone Node wrapper and CI not independently run. Source blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; model Gibran df260a07d56bf5998d40a6360b6132c35c252d10; controls Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a, Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85.

## All nonlinear lane permutations and page-private framing: exact concentration obstruction

The affine-key failure admits an inexpensive stronger decision that does not require a language score or any intact-word hypothesis. After the fixed matrix demix, each nonescape rank belongs to one lane. A private arbitrary bijection of its 28 values can only permute that lane's histogram. For each k, the largest possible count in any k plaintext symbols is bounded by the sum of the k largest counts of each lane. Align the sorted histograms across lanes, then insert the fixed escape count and sort again; its prefix sums give a simultaneous exact majorization envelope with a common escape. For independent page-private lane maps, each page/lane histogram is sorted separately before summing, making the envelope more generous. Neither vocabulary nor language order enters this bound. No fitted key or ciphertext placement can exceed it.

Apply all four demix orientations A,A^T,A^-1,(A^-1)^T and both nonzero-step ranks, preserving all original p16–22 non-IV symbols; incomplete blocks use identity mixing. Three independently authored finite native-GP reference pools use the same fixed lines150–450 of Gibran, Emerson and Shakespeare as above. Slide a matching-length window with floor(length/4) stride. The 46 chapter-length and 47 page-length reference windows are overlapping empirical comparators, not independent Bernoulli trials.

| IV and lane-key model | Maximum possible top-one count, across 8 settings | Minimum native top-one count | Minimum across settings and windows of maximum prefix deficit | Compatible majorization comparisons |
| --- | ---: | ---: | ---: | ---: |
| One chapter IV, four private lanes | 100 | 175 | 407 | 0/368 |
| Seven page IVs, four shared lanes | 104 | 174 | 391 | 0/376 |
| Seven page IVs, 28 independently private lanes | 165 | 174 | 129 | 0/376 |

The deficit is max_k(native sorted-prefix count minus cipher-derived upper prefix count); a positive deficit proves that native histogram is impossible regardless of the secret permutations. All 1,120 comparisons fail even before checking that one native glyph has the required escape count. A synthetic independently Fisher–Yates-shuffled lane-permutation control from Emerson with eight escape events passes its bound (actual top-one196, upper201, maximum deficit0). The control is a bound calibration, not a blind permutation-key recovery.

**Further relaxation of every page's framing:** independently choose one of four source demix orientations, two rank transports, and any leading partial-block length 0–3 on each of the seven pages. Both partial fringes use identity mixing. Grant a separate escape glyph and four arbitrary nonlinear lane maps to each page. Compute each page's exact sorted histogram envelope for every one of its 32 framing alternatives; maximize every prefix separately over those alternatives, then sum the seven page bounds. This relaxes all 32^7 framing combinations without requiring a common setting or the same choice even at different k. The 1,737-symbol original chapter has resulting upper prefix counts 185,333,459,579,681,780,875,964,1041,1116,1188,1252,... . Although the top-one bound alone no longer rejects every native reference, **all 47 matched native histograms violate some prefix bound by at least 83 symbols** (maximum observed deficit167). This stronger bound permits independent per-page escape selection, matrix orientation, transport, alignment phase and nonlinear lane maps, but still requires the named p15 matrix demix on nonoverlapping rank-four groups and a public IV per physical page. It does not reject arbitrary matrices, changing maps inside pages, alternate escape encoding, or non-native registers.

[All-lane bound SFT](../sims/lp2_p15_ordinal_hill28_all_lane_permutation_bound_sft.cjs) · [complete raw envelope output](lp2-p15-ordinal-hill28-all-lane-permutation-bound-output.json) · [page-flexible SFT](../sims/lp2_p15_ordinal_hill28_page_flexible_bound_sft.cjs) · [page-flexible raw output](lp2-p15-ordinal-hill28-page-flexible-bound-output.json). Core algorithms executed in connected V8; standalone wrappers not separately run. This is a finite-source mathematical exclusion under the specified GP register and framing, not a universal plaintext impossibility. The source itself does not select this cipher construction.

## Research decision

**The direct p15 source-prime-ordinal Hill4 mixed with a lossless 28-way ciphertext-difference decoder fails to decrypt its immediately following original chapter.** This is a bounded, reusable cipher-architecture decision that existing printed-matrix GP29 tests did not establish. The source-specific invertibility is useful mathematical information, but it does **not** establish authorial intent and does not by itself merit promotion to the authoritative solved-state synthesis.

The exact extensions exclude all affine offsets by language score and arbitrary private 28-way lane permutations by finite-reference majorization. Even independent page framing does not rescue the native histogram. A different dynamic map or cipher layer would require independent source evidence rather than further fitting to this receiver. Reconsider only if an original Cicada instruction independently specifies the 28-step transport, source matrix consumer or a demonstrably verified output intermediate. The next higher-value path still requires authentic key material, an original plaintext island or a source-selected operation beyond straight block mixing.
