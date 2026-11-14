# Terminal 256-cell grid: source-inner separability and local-stencil gate

**Original-input result, 12 November 2026.** The proposed correspondence between the 256 numerical grid cells and the 76 unknown p55 plus 180 solved p56–57 runes yields **no** stationary low-rank GF(29) row/column consumer, radius-one/radius-two stationary linear stencil, or direct unrestricted four-rune affine Hill consumer under nine natural original-source readouts. This is a bounded negative for an explicitly optional **terminal ring hypothesis**. It recovers no p55 plaintext, source-selected key, actual cipher, or continuation URL.

## Why this decoding route was worth testing

The original physical LP2 pp49–51 print a 32×8 table comprising **256 two-character numeral cells**. The original pp55, 56 and 57 contain **76, 85 and 95 GP29 runes**, respectively, also totalling 256. A conventional concentric peel of 32×8 gives ring lengths **76, 68, 60, 52**, so its outer ring can be placed in bijection with unknown p55 while the three remaining rings contain **180 known symbols** from the solved p56 "AN END" and the clear p57 PARABLE. The final p57 words "SHED OUR OWN CIRCUMFERENCES ... EMERGE" supply a real textual motivation to examine the perimeter. The 2014 Cicada Wisdom square supplies an independent, historical **5×5 motif** for an optional local stencil.

The strongest objection is that no original instruction actually places pp55–57 into the pp49–51 table or directs 2D linear algebra. The first physical p55 rune is also an inherited `NG` completing a word from p54, leaving **75** whole p55-body runes; the matched 256 total is **255 self-contained last-three-page runes plus one cross-page carry**. This source-visible feature weakens a literal last-three-pages-as-one-block claim. These tests therefore **challenge candidate consumers**, rather than authenticate this layout. Related existing work had already failed eight ordinary terminal-ring directions, a direct unknown codebook and one source-table cyclic convolution. The tests below are a distinct **all-secret 2D consumer-family exclusion**, with all scalar/kernel weights eliminated algebraically rather than guessed or language-scored.

## Frozen inputs and original-known-plaintext register

- Original table: [canonical 256-byte grid](../resources/liber-primus/lp2-grid-256.json), byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Use the conventional conditional base60 byte interpretation; the 2013 BASE29/p39 quadratic factor relation is an existing *conditional* clue in support of this parse. Every byte is reduced modulo 29.
- GP29: [canonical original LP2 corpus](../resources/liber-primus/lp2-corpus.json), in canonical rune-index order.
- Accepted p56 plaintext: subtract `prime[clock]-1` modulo29 with the documented **only literal F at local rune index 56** not advancing its prime clock; this produces the exact established GP text "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE".
- p57 plaintext: original clear rune indices, unchanged.
- Geometry: after the 76-cell outer ring is removed, assign 180 p56+p57 plaintext indices consecutively to rings 68, 60, 52. Each ring may **independently** start at any of the four geometric corners and wind in either direction. Thus there are 8³ = **512** complete known-interior assignments, encompassing the earlier eight uniform corner/winding choices. No page- or word-dependent skipping is inserted.

The original 76 unknown p55 runes are deliberately **withheld** from every fit. Any successful model would first have to reconstruct the 180 solved symbols exactly.

## Gate A: full GF(29) rank of row/column masking

Let `B[r,c]` be the grid byte reduced modulo29 at original row `r`, column `c`, and let `P[r,c]` be the known GP29 plaintext assigned to the 30×6 interior. Test the complete family

\[
P_{r,c}=aB_{r,c}+\sum_{t=1}^d u^{(t)}_r v^{(t)}_c\pmod{29},
\qquad a\in\mathbb F_{29},\quad d\leq5 .
\]

The unrestricted secret row and column factors make the residual matrix `D(a)=P-aB` have rank no greater than `d`. This includes multiplicative row×column masking and permits arbitrary sums of up to five such masks. The familiar additive row-plus-column mask is a special rank-at-most-two case and additionally requires **every** 2×2 alternating minor to vanish.

For all **512×29 = 14,848** combinations of known-ring order and freely selected global multiplier, the actual original **30×6 residual has rank exactly 6**. Hence no `d≤5` solution exists anywhere in this broad family. The best row-plus-column additive trial satisfies only **282/6,525** distinct 2×2 alternating-minor checks, versus **6,525/6,525** required by *every* valid additive row+column mask. Its order is inner-ring choices `[5,0,2]` (per-ring enumeration: corner0 anticlockwise, corner0 clockwise, corner1 anticlockwise, corner1 clockwise, ...) with multiplier `7`. The maximum 282 is an exhaustive result for the tested orientation/scalar family; it is a diagnostic, not a p-value.

Positive controls: a planted secret row+column additive mask satisfies all 6,525 minors and rank2; planted multiplicative and two-product masks have exact rank1 and rank2 respectively. Replacing original p56/57 with synthetic outputs `aB+r+c` recovers the identical residual.

[Source-exact CJS SFT](../sims/lp2_terminal256_inner_rowcol_rank_sft.cjs).

## Gate B: every stationary 3×3 and 5×5 linear stencil

A second, independent fixed filter family models local table decoding:

\[
P_{r,c}=k_0+
\sum_{-h\leq i,j\leq h}
k_{ij}B_{r+i,c+j}\pmod{29},
\qquad h\in\{1,2\}.
\]

All coefficients, including the intercept, are secret and completely unrestricted over GF29. This necessarily includes any *particular* original 2014 Wisdom-square-shaped linear stencil, its rotations and reflections, if applied on the same GP29/grid register. Only cells having a **complete printed neighbourhood** are tested, so no guessed wrap, zero padding, or edge rule can influence the answer.

| Kernel | Known equations | Unknown coefficients | Exact original fits across 512 routes | Full feature rank | Fewest pivot-derived mismatches |
| --- | ---: | ---: | ---: | ---: | ---: |
| 3×3 + intercept | 180 | 10 | **0** | 10 | 157 (route [3,6,5]) |
| 5×5 + intercept | 112 | 26 | **0** | 26 | 79 (route [0,5,3]) |

The design matrices have full coefficient rank in both cases. For every one of 512 assignments, the independent original plaintext target is outside the design matrix column space (equivalently the augmented system has higher rank), so **no secret set of 10/26 coefficients** can fit even the interior. The reported mismatch counts evaluate the particular filter fixed by leading pivot equations, and **must not** be read as globally minimized Hamming distances across inconsistent filters.

Positive controls: arbitrary GF29 3×3 and 5×5 coefficients planted into original table neighbourhoods are recovered **exactly**, with zero original-coordinate mismatches and exact key agreement, for both complete equation sets.

[Source-exact CJS SFT](../sims/lp2_terminal256_local_stencil_sft.cjs).

## Gate C: all-secret additive GF(29) recurrence-order obstruction

A third model uses the independently fixed source quadratic factors: the PGP-verified 2013 `BASE29 3301 → 3QO` example supplies \(H=3+26X+24X^2\); original p39 prints \(G=27+5X+15X^2\). Their monic product is \(F(X)=14+9X+13X^2+28X^3+X^4\). Its exact divisibility into the table is an existing conditional algebraic observation. The candidate consumer adds a shared GF29 linear-recursive mask \(K\) to the source-grid byte residues: \(P_i=B_{\mathrm{ring}(i)}+K_i\pmod{29}\). Thus the solved p56–57 interior supplies an **exact** 180-symbol candidate mask under each original ring readout.

[The complete original-input Berlekamp–Massey SFT](../sims/lp2_terminal256_inner_lfsr_sft.cjs) computes the **minimum order of any GF29 linear recurrence**, eliminating all secret feedback coefficients and initial states for every 512 inner-ring routes. The order histogram is **one route of order 89, 497 of order 90, and 14 of order 91**. Thus no recurrence of order 88 or lower can generate the known source-derived mask, regardless of seed or polynomial. For the *specific* source factor \(F\), at least **160/176** recurrence windows fail; reversing polynomial-coefficient orientation fails at least **164/176**. A planted original-grid-derived 180-symbol mask using the source \(F\) has Berlekamp–Massey order exactly **4**, zero violated source-factor equations and exact round-trip reconstruction.

This excludes the historically motivated degree-four factor recurrence, and indeed any lower-than-89-state linear additive GP29 pad on this frozen 180-symbol ring register. It does not constrain nonlinear generators, different table serializations, nonadditive or time-varying decoding, or the unconfirmed original terminal-ring alignment. No authentic key or unknown p55 plaintext results.

## Gate D: unrestricted secret Hill4 inferred from 180 authentic runes

**Original-source decision (Agent15, 14 November).** The manuscript contains a printed 4×4 numerical matrix at p15, and the terminal **76 + 180 = 256** rune split is also exactly **19 + 45 four-rune blocks**. This motivates an independent four-component GF29 Hill transform with an arbitrary secret matrix, without assuming the actual p15 coefficients. There is no 2014 instruction selecting that transfer. Unlike a direct fixed-source Hill trial, the **180 authentic solved GP29 positions** can uniquely determine any candidate secret matrix from the unchanged numeric table, and the withheld 76 positions would then be decrypted if the 45 known blocks satisfy it.

Take the original 256 numerical-cell values modulo29. Nine explicit, source-visible readouts are frozen before solving: (a) printed row-major order and (b) **all eight** outer-to-inner concentric-ring walks from each of four original rectangle corners in each direction, consistently applied across four shells of lengths **76/68/60/52**. For each, assume the first 76 readout positions correspond to unknown p55 and the final 180 to known p56+p57, with p56 first decrypted by its independently authenticated prime-totient and literal-F-skip rule. Partition that known suffix into **45 consecutive four-component vectors**, then ask whether an **arbitrary** 4×4 matrix \`M\` over GF29 satisfies \`P_block=C_block·M\`. Grant an additional freely selected four-component bias vector for affine Hill4. Independently test both directions, table-to-plaintext and plaintext-to-table. A single row of the resulting linear system provides four output equations simultaneously; full coefficient rank means any inconsistency excludes *every* matrix, including singular maps and unknown secret keys.

| Fixed original source readout | Secret family | Direction | Input coefficient rank | Earliest inconsistent RREF row |
| --- | --- | --- | ---: | ---: |
| Row-major | Any linear Hill4 | Table → known plaintext | **4/4** | **4** |
| Row-major | Any affine Hill4 | Table → known plaintext | **5/5** | **5** |
| Each of 8 corner/direction four-shell reads | Any linear Hill4 | Table → known plaintext | **4/4** | **4**, every route |
| Each of 8 corner/direction four-shell reads | Any affine Hill4 | Table → known plaintext | **5/5** | **5**, every route |

All **18 reverse-direction tests** likewise reach full rank and contradict the known output by the next RREF row. **No stationary secret four-rune linear/affine map exists for any of these nine original readouts**, regardless of whether its secret matrix is invertible. This is an exact original-data field-algebra obstruction, independent of English-likeness or unknown-p55 assumptions.

The [standalone CommonJS original-input SFT](../sims/lp2_terminal256_known180_hill4_allsecret_sft.cjs) tests all **36** direction/family/readout configurations, checks the authenticated 180-rune known suffix, and constructs a separate full-length **256-rune positive** containing 76 withheld native-GP p57 symbols plus the exact genuine p56+p57 plaintext. An arbitrary invertible upper-triangular Hill4 with unknown additive bias is recovered from the 180 planted known symbols and independently recovers all **76/76** hidden symbols. The completed nine-readout script passed on [Windows Node22 run 43581966013](https://github.com/FlareZ123/liber-primus/actions/runs/43581966013).

This new gate excludes the **complete unspecified-key stationary 4×4 family** in the printed order and all eight natural ring-walk readings. It does not exclude a changing four-rune key, cross-block mixing, different geometric permutations, distinct p56/p57 encodings, or an independently source-selected nonlinear operator. The 76/180 and 4×4 numerical coincidences remain conditional; a decoder that cannot explain the 180 authentic solved runes does not justify reporting p55 guesses as plaintext.

## Reproduction and decision

The original three stencil/recurrence CJS scripts and the fourth, independent Hill4 all-secret source SFT consume original repository source JSON and use only Node 22 built-ins. The three historical tests are exercised together by the **manual-only** [terminal inner-ring CI workflow](../.github/workflows/lp2-terminal256-inner-rank.yml), [passing original-source run 43260125837](https://github.com/FlareZ123/liber-primus/actions/runs/43260125837); the new four-rune all-secret test passed in the separate [manual-only combined source gates run 43581966013](https://github.com/FlareZ123/liber-primus/actions/runs/43581966013). There are no automatic push or PR triggers.

The tests eliminate a meaningful, source-visible path that would have promoted **180 independently known plaintext symbols** into a full original p55 decoder under a source-plausible 2D tabular transform. They leave open all unselected layout correspondences, different alphabets/byte serializations, hidden nonlinear maps, stateful transforms, source-independent keys, and other forms of intermediate text. In particular, they do **not** show that the table is unrelated to the final pages.

**Next decision:** Do not optimize additional scalar phases or rectangle variants around these excluded stationary families. The next productive route needs an independently sourced, complete operator capable of predicting the 180 known symbols before its unknown p55 output is accepted. If a historical source chooses a nonlinear/stateful tabular rule, test that specific inverse against exactly these withheld controls.
