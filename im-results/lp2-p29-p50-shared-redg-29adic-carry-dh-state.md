# Original p29 G-carry crosslink to the previously known p23/p50 29-adic DH registers

**Agent27, 22 November 2026. Status: exact original-source arithmetic and a source-sourced repeat of the pre-existing local p28 READ OUT candidate, discovered retrospectively; no independently authenticated unknown-page plaintext, cipher mechanism, key schedule, or destination.**

## Source-driven candidate

Three separate source objects are fixed before reading the carries:

- Physical p39 (56.jpg) prints a red isolated triad `[27,5,15]` in low-first order, giving the factor `G(X)=15X²+5X+27=15(X−24)² mod29`.
- Physical p29 (46.jpg) contains **277 exact GP29 rune indices** in original printed order. Its descending integer-coefficient polynomial is divisible by G over GF29.
- Physical p50 (67.jpg) prints the **256 exact base60-byte cells** in row-major order, with coefficients in its established source codec. Its descending polynomial is also divisible by G modulo29. The signed 2013 BASE29 example supplies an additional quadratic factor `H(X)=24X²+26X+3` for the table.

Both G and H were previously identified as exact source-algebraic factors. Their key use and any higher 29-adic lift were **not** specified by the original manuscript. Nonetheless, retaining the same literal printed integer coefficients modulo29²=841 and dividing by the same factors yields a reproducible *second digit* of the two otherwise-zero polynomial remainders.


## New independent original-image check: 3301 directly selects G's double root

A distinct first-party clue anchors the previously known algebraic factor **without consulting either polynomial ciphertext**: the repeated original p33–p39 cuneiform numeral (55,1) in sexagesimal literally denotes **3301**, while (17,13) denotes **1033**. The p39 **same seven-page chapter** visibly isolates the red three-rune sequence [27,5,15] low-first. Under the existing GP29 high-first polynomial interpretation this is **G(X)=15X²+5X+27**.

The raw printed integer **3301 mod29=24**, and the exact identity **G(X)=15(X−3301)² mod29** holds coefficientwise, with **G(3301)=G′(3301)=0 mod29**. Thus the printed header selects the existing double root directly, rather than an arbitrary subsequently searched numerical seed. The other original header integer 1033 gives G(1033)=18 and G′(1033)=23 mod29, an exact negative control. Direct evaluation of *both complete unchanged sources* at the printed integer3301 produces:

| Source polynomial | Value mod29 at 3301 | Formal derivative mod29 at 3301 | Value, derivative at 1033 |
| --- | ---: | ---: | --- |
| Original p39 red G, GP29 degree2 | 0 | 0 | 18, 23 |
| Original p29 277-rune coefficient stream, degree276 | 0 | 0 | 28, 9 |
| Original p50 256-byte conventional base60 stream, degree255 | 0 | 0 | 10, 12 |

This was checked by a direct Horner recurrence, independently of long division and the earlier 29-adic lift. In the annotated original red-source inventory, exactly **two isolated full three-rune red spans** exist (p3 at rune119 and p39 at rune119). Only p39 has the 3301 double root. Among **all189 overlapping original red three-rune windows**, p39 at offset119 is likewise the unique exact 3301 double root. The alternative original p3 triad has [13,23,2] low-first, value6 and derivative3 at3301.

Two more exact, **secondary/postselected** source-number relations remain provisional: the root residue24 has multiplicative order **7** modulo29 (matching the illustrated seven-page p33–p39 chapter length), and **G(3301) mod841=377=29×13** (the p39 triad is bracketed by red13-dot marks). Neither selects a decoder. The p50 polynomial additionally assumes the conditional ordinary base60-byte interpretation of the printed table, while p29's rune coefficients and p39's colored triplet do not require that byte convention.

**Clue strength and boundary:** unlike a random guessed GP29 element, **3301 itself is visibly printed in the same original physical chapter as the red G**, independently identifying its root. But the idea of reading the red triplet as an ascending-degree polynomial, using mod29 derivatives, and transporting the root into p29/p50 was explored retrospectively after the G-factor evidence had been discovered. This is an original-artifact crosslink with two disjoint source-negative controls. It is **not proof the author intended polynomial long division, or that a 2014 player could derive it**. A future solution still needs an author-visible **operation and recipient** for the quotient or root and a complete unknown-ciphertext inversion.

Exact original data and the 189-window countercheck: [Node22 source-root SFT](../sims/lp2_p39_3301_original_double_root_sft.cjs). The previous long-division/29-adic carry conclusions below are unchanged.


## Exact second-digit arithmetic

Keep the high-first original order and normal GP0 ordinal values. For any exact modulus29 divisor, lift the same long division to `Z/841Z`. Since the remainder vanishes modulo29, normalize the two 841-remainder coefficients by 29, producing a pair in `GF29²` as two independent coordinates.

| Original source | Polynomial divisor (high-first) | Remainder mod841 | Remainder/29 |
| --- | --- | --- | --- |
| p29 original 277 GP indices | red p39 G `[15,5,27]` | **[377,551]** | **[13,19]** |
| p50 original 256 source bytes | red p39 G `[15,5,27]` | **[435,58]** | **[15,2]** |
| p50 original 256 source bytes | signed-2013 H `[24,26,3]` | **[232,145]** | **[8,5]** |

The p50 H/G/R remainder/carry tuples, their DH coordinate interpretation, and the R=−2H mod29 dependence were **all published before this invocation** in [Agent9/21's 21 November report](lp2-p23-red-midpoint-p50-factor-bridge.md). The **p29 source integer G-lift pair [13,19]** and its H2 mapping to [23,3] are the present new cross-object observations.

The previously fixed original-p28 outer-shell Hadamard rule is `H2(x,y)=(x−y,x+y) mod29`. Applied to the new p29 raw carry once, without swapping:

`H2([13,19])=[23,3]=[p,e]`.

This matches the independently reconstructed toy Diffie-Hellman tuple `p=23,g=5,a=6,b=15,A=8,B=19,K=2,e=3`. P50 G carry `[15,2]=[b,K]` and p50 H carry `[8,5]=[A,g]` complete the three source-aligned packet assignments:

`p29/G => H2([13,19])=[p,e]; p50/G => [b,K]; p50/H => [A,g]`.

The original p23 R lift adds the ordered [3,27] pair, which also reproduces the earlier p28 READ OUT decoder. This explicitly reproduces known DH and local decoder operands. It yields no *new* source-secret value: those numbers and p28's H operator were already known, and the rule of lifting integer coefficients to base29² was recognized after inspecting original numerical material. The convenient arithmetic expression `[13,19]=[A+g,B]` should be counted as an equivalent identity of the same observation, not as an independent confirmation.

## P29-carry connection to the pre-existing p23 red-factor lift and p28 six-rune readout

### Earlier-established factor dependence: p23 R is signed H scaled mod29

Earlier [Agent9/21 source analysis](lp2-p23-red-midpoint-p50-factor-bridge.md) already determined that `R` contributes **no third independent GF29 factor**. The present composite hypothesis briefly treated the different p23 source presentation as a separate factor, then rejected that premise without attempting a plaintext decode. The exact original high-first coefficients satisfy

```text
signed2013 H = [24,26,3]
p23 red   R = [10, 6,23]
R = -2 H (mod29)
R = -2 H + 29[2,2,1] (as ordinary integer coefficient vectors)
```

Thus `p50 % R == 0 (mod29)` is **automatically implied** by `p50 % H == 0`; it is not another independently surprising zero-remainder event. The p23 source is still an independently printed **different integer representation** of the same 29-field factor. This representation changes the 841-remainder second digit and yields `[3,27]` when divided as the literal p23 source integer polynomial. The two carry vectors `[8,5]` and `[3,27]` are related through the original table's H quotient and the canonical mod29 coefficient lift. They must not be counted as independent key evidence.

A sealed follow-up hypothesized that the **product of three quadratics** would divide p50 and expose a 250-rune direct plaintext quotient ([precommit](../workplace/agent27-p50-three-source-polynomial-full-quotient250-precommit.md)). The divisibility premise fails *before reading any 250-rune candidate*: `H·R·G ≡ -2H²G (mod29)`, and direct division of all 256 original p50 digits leaves the **six-rune nonzero remainder `[14,17,6,7,11,28]`**. Only the legitimate `H·G` least-common-multiple (degree4) divides, yielding the already-known 252-rune register. Therefore **no exact original source Q250 quotient exists under the frozen rule**, and no plaintext claim can be made from it. This failure materially narrows the source-factor architecture and prevents three-factor evidence from being double-counted.

The newly computed p29 carry's ordered raw pair `[13,19]` is source-fixed. Applying the already defined p28 H map gives `[23,3]`. One **post-observation** interpretation takes the first result `23` as a physical page number, and the second `3` as exponent `e`.

Previous [Agent9/21 original-image research](lp2-p23-red-midpoint-p50-factor-bridge.md) had already located **physical p23**'s **centered red three-rune group `[23,6,10]`** in low-first order, hence its own quadratic `R(X)=10X²+6X+23`. The original p50 byte polynomial also divides exactly by R over GF29, as previously established by Agent9/21, independently of the present p29 carry.

With the **same 29² integer-coefficient lift** used for p29 and p50 G/H, unchanged p50 divided by high-first `R=[10,6,23]` has:

- remainder mod29 `[0,0]`;
- remainder mod841 **`[87,783]`**;
- normalized carry **`[3,27]`**.

This pair is precisely the pre-existing p28 value-changing decoder exponents, fixed by separate earlier p28 DH/cube work: cube on the exact center and reciprocal (power27) on the five-rune page-numbered word. Opening only the already frozen original p28 contiguous offset134..139 object:

```text
original page28 center + word28: [9,28,24,10,1,20]
p23 source factor / p50 carry: [3,27]
mod29 exponents [3,27,27,27,27,27]
output: [4,28,23,3,1,16] = READ OUT
```

This is an **exact reversible reuse of a source-visible six-rune packet** under previously published number material. It selects the same ordered `(3,27)` parameter pair without the contested p28 shell-depth story, but the assignment of first exponent to the center and second to the whole five-rune word was already known from the earlier READ OUT discovery. It is **retrospective corroboration, not a newly held-out plaintext recovery**.

The complete conditional source graph can now be expressed:

`p28 THE -> signed DIRECTION29 -> original p29 -> p39/G lift -> H([13,19])=[23,3] -> original p23 red R -> p50/R lift=[3,27] -> p28 center/word28 -> READ OUT`.

The strong rival is that the `23` page number and p23 factor were recognized post hoc, while multiple source triads and source-valued operands were available. Source p3's original red quadratic `[2,23,13]` does **not** divide p50 modulo29; p23 R and p39 G do. This is a **narrow finite source relationship**, still without an original instruction selecting the 29²-lift opcode and no demonstrated 150-rune original-body decoder.

## Conditioned source-cipher null

A lexical or uniformly random 277-symbol null would almost always fail exact division by G modulo29, so it would be an invalid comparator. Instead:

1. Extract the original exact 275-symbol p29/G quotient over GF29.
2. Freeze its complete symbol multiset; shuffle coefficient order using xorshift32 seed `0x3301f29`.
3. Multiply the shuffled quotient by unchanged G modulo29, yielding a 277-symbol GP29 register with exact zero remainder by construction.
4. Reinterpret the resulting register's literal digits 0..28 over integers, divide by the same G modulo841, normalize the two carry digits, and compare to original `[13,19]`.
5. Repeat **8,000** times with the source-pinned factor and no post-selection within each trial.

Results: **11/8,000** null registers reproduce exactly `[13,19]`; plus-one empirical frequency **12/8,001 = 0.0014998125**, and all 841 possible carry pairs occur. This estimates how frequently that *specific pair* arises under a narrow quotient-histogram-preserving factor null. Crucially, the exact p29 target pair and its H transformation were interpreted **after they were observed**, amid thousands of previously explored possible numeric relations. The number **0.0015 must not be quoted as a discovery-wide p-value or authorship probability**.

## Direct source-carry Hill2 consumer: complete 254-rune inverse fails

An independent original-body receiver was frozen in [the precommit](../workplace/agent27-p50-factorcarry-hill2-original-precommit.md) before reading its output. The two previously established original-p50 H/G factor carries form the complete 2×2 key **`M=[[8,5],[15,2]]`**, with determinant `−1 mod29` and exact inverse **`M⁻¹=[[27,5],[15,21]]`**. The original full p50/G quotient has **254** complete runes, so it admits 127 native pairs without a padding, phase, or skip convention.

The single frozen rule applies `M⁻¹` as a standard column-vector GP29 Hill2 decoder to all consecutive pairs of the exact 254-symbol original table quotient. Results:

| Source register | GP source-native trigram nats/rune | IoC |
| --- | ---: | ---: |
| Original p50/G quotient254 | −3.439876889 | 0.03277209 |
| **Entire p50/G Hill2 inverse254** | **−3.423784872** | **0.03551088** |
| Independently solved p57 GP95 | −2.468144714 | 0.06270997 |

The full output remains nonlinguistic; its first source-native GP runes read `MTFWSNERGLHARHBIODEAEYTHPGMCIMTHHEAHDTHEAPCIOHIOCOEACTHXIOAAMNYTAOEAMGCHRCSAXOINGDDBUOEJWOEAEDFINGOEMEWINGINGIOREINGYWMIGANIJFMSSIOIRLNHMEEOSJUNTHPOCAAEIOINGXRTHXEOEEATHCNGEOGTHAEWFOETHAEINGJCAERBNINGSGEAESSWCT`. Forward replay restores all **254/254** original quotient runes. A planted 254-rune source-native LP1 control encrypts/decrypts exactly under the same M, so the failure concerns the original stream rather than the implementation.

**Decision:** retire this *one exact source-ordered H/G-carry Hill2 reading of the source-aligned p50 quotient*. This is a motivated two-row key and complete reversible inverse, while the original 2013 protocol never authorizes treating the carry pair as a Hill matrix; matrix inversions on other source spans would require a fresh selector. [Read-only SFT](../sims/lp2_p50_factorcarry_hill2_direct_original_sft.cjs).

## Period60 matrix clock from the two independent H/G carries

The **two genuinely independent** table factor carries H=[8,5] and G=[15,2] form a conventional invertible Hill2 matrix `M=[[8,5],[15,2]]` with determinant −1. Unexpectedly, `M^15=12I`, `M^30=−I`, and **exact order60**, matching the printed base60 table alphabet and the conditional DH relation `b=15, K·a=12`. This is an exact, retrospectively noticed numeric link, not an authenticated creator key clock.

A **complete 12,956-rune source-keyed rotating-Hill2 original inverse** was frozen before reading output: consecutive global GP29 pairs receive `M^(−i)` with zero-based pair index `i`. The entire output remains uniform-like (native source-GP trigram −3.41644 vs solved p57 −2.46814; IoC 0.03446465 vs 0.06270997), despite 12,956/12,956 exact forward replay and a complete source-native plaintext plant. Retire this specific dynamic clock. [Detailed original-input report](lp2-p50-carry-order60-rotating-hill2-original-gate.md) · [reproducer](../sims/lp2_p50_carry_order60_rotating_hill2_wholebook_sft.cjs).

## All-degree joint factorization: p39 G is the entire original p29/p50 gcd

For completeness, an independent implementation replays the **already-established all-degree p29/p50 gcd** from the earlier [1,540-source-pair census](lp2-p29-grid-sole-repeated-root-and-quotient-key-gate.md), using the entire original p29 rune polynomial (277 high-first coefficients) and p50 printed byte polynomial (256 coefficients reduced modulo29). This is **reproduction of prior work, not a newly discovered cross-source factor or exclusion**. Its monic output is:

```
gcd_GF29(P29(X),P50(X)) = (X−24)^2 = X²+10X+25
```

The gcd has **degree2** after 248 Euclidean remainder steps. Division of both original polynomials by this monic G leaves zero remainder, and their two quotients have **no further common polynomial factor of any degree** (gcd=1). Thus the p39 isolated red quadratic accounts for the *whole* common factor. The earlier full 1,540-pair census had already excluded shared irreducible quadratics and other higher-degree common factors. The present standalone check verifies that same conclusion on the selected pair.

Its synthetic positive appends one independent shared linear factor `X+1` to both original polynomials and recovers the correct resulting degree3 gcd, demonstrating that the algorithm detects higher shared factors. [Frozen precommit](../workplace/agent27-p29-p50-entire-common-gf29-factor-precommit.md) · [read-only SFT](../sims/lp2_p29_p50_full_gf29_gcd_source_sft.cjs). This is a bounded code-architecture exclusion; the original p29/p50 quotient arrays can still be encrypted by different external keys or represent checksums rather than native-GP plaintext.

## Surplus23 after the two genuinely independent source factors: original plaintext receiver fails

The known p29/G source quotient has **275** GP29 symbols. The p50 printed 256-byte polynomial divides exactly over GF29 by the two independent source factors **H·G=[12,17,11,21,23]** high-first, leaving the printed 252-symbol quotient. Hence **275−252=23**, matching the independently reconstructed signed DH prime23 but also trivially following from the source lengths and factor degrees. It does not select which end is excess or whether the two outputs share an additive pad.

A [prospectively frozen 4-way original receiver](../workplace/agent27-p29-q275-p50-q252-surplus23-source-comparison-precommit.md) removes exactly the first23 or last23 GP runes of original QP275; subtracts or reverse-subtracts the unmodified entire QT252 symbol by symbol modulo29; and demands coherent ≥150-rune native GP text. All four **252-rune exact inverses fail**:

| Source p29 edge discarded | Full decrypted native GP score for QP−QT | Full decrypted score for QT−QP | Both exact outputs' GP IoC |
| --- | ---: | ---: | ---: |
| First23 | −3.42220 | −3.44728 | 0.03440207 |
| Last23 | −3.41838 | −3.43062 | 0.03629925 |

Both source quotients score near −3.408, and solved p57 is −2.46814. All four source inputs replay exactly; four source-native GP-positive 252-rune control plants likewise recover fully. The reported scores and keys were fixed before original plaintext inspection. Thus the **full original p29/G versus p50/(H·G) 23-surplus shared-additive-pad interpretation** yields no unknown native-GP plaintext under its source boundary choices. Retire it pending a new first-party operation selector. [Read-only original-input SFT](../sims/lp2_p29_g275_p50_hg252_surplus23_source_sft.cjs). 

## Complete two-component ciphertext-feedback stream: all source state values, still no original plaintext

The physical-source arithmetic now supplies a complete, finite **seed** (`S₀=[13,19]` from original p29/G mod841) and a complete invertible **state matrix** (`M=[[8,5],[15,2]]` from p50 H/G mod841). A more plausible stream architecture than a period60 direct pad would update its state from observed ciphertext. Before decoding any unknown page, the [frozen original cipher hypothesis](../workplace/agent27-p29carry-p50matrix-ciphertext-feedback-original-precommit.md) selected one explicit two-rune feedback recurrence:

`Pᵢ=Cᵢ−Sᵢ mod29; Sᵢ₊₁=M Sᵢ+Cᵢ mod29`.

Apply it continuously to the **entire 12,956 untouched unknown GP29 runes** (6,478 contiguous pairs), with no per-page resets, skips or fitted key symbols. The resulting full source-native trigram score is **−3.4163972141** (original ciphertext −3.4174416532; solved p57 −2.4681447142), and GP IoC **0.0345070433** (solved p57 0.0627099664). All 12,956 original runes reproduce exactly when re-encoded, and a planted 12,956 native-GP plaintext recovers exactly under the same recurrence. The 55 per-page decrypted streams remain nonlinguistic; the best short page p49 has mean score −3.3353, still far outside ordinary native-GP prose. The source rule yields a mechanical stream cipher but no authentic original unknown text.

The source prints **no explicit ciphertext-feedback instruction**. Therefore the negative rejects exactly this single fully source-keyed conventional GP29 stream recurrence; it leaves other state transitions open without authorizing unlimited variants. [Single-file original SFT](../sims/lp2_p29carry_p50matrix_ciphertext_feedback_fullbook_sft.cjs).

## New p29 carry selects original p27 red marker, with independent 1L table crosslink

The p29/G 29² carry `[13,19]` directly matches [red marker13, heading19] on the original image **p27, scan44.jpg**, uniquely among **18** original red-rune spans (16 carry a red marker13, only p27 has length19). This is a retrospective source-layout match and the number13 is common, so count it as one conditional selection, not two independent random events.

The same pair, after the already-known H2 map, gives `[23,3]`. In the original 32×8 table, zero-based (23,3) selects **cell187 printed `1L`**, which can be read as 'one left' to the independently p27-selected **cell186 printed `0J`=19**. A precommitted 3-clockwise perimeter move from the pre-existing p27 base59 root cell189 `3C` reached previously unopened cell213 **`2U`**; the next fixed two-up move reached cell197 **`1t`**, which fails the predeclared uppercase direction grammar. The route stops there without plaintext. Crucially, prior p27 **base59** walk186→189 does **not** visit cell197; only the **base60** path does. This correction is explicit in [the stand-alone image-grounded navigation report](lp2-p29-carry-1L-3C-2U-original-grid-navigation.md) and [source SFT](../sims/lp2_p29_carry_1L_3C_2U_original_table_navigation_sft.cjs). No original instruction yet authenticates the invented directional shorthand, row/column interpretation or mod841-lift step.

## Original p29 275-rune quotient, p27 13/19 marker and full table256: one fixed direct ciphertext inverse fails

The source-related lengths also specify a **new exact original 256-symbol recipient**: the p29/G quotient contains **275 GP29 symbols**, while the printed numerical table contains **256 byte cells**. Their surplus is **275−256=19**, exactly the unique p27 red-heading length19. The immediately trailing red marker has count13, leaving **19−13=6** heading runes. This suggests a bounded, if unauthenticated, 13-rune front and 6-rune back trim of the 275-symbol quotient, exposing exactly the length of the table.

Before reading any resulting GP text, [this single exact inverse was committed](../workplace/agent27-p29q275-p50raw256-p27-red13-19cut-source-precommit.md): strip first13 and last6 from Q275, giving the original middle **256** symbols; reduce all 256 printed base60 source bytes modulo29 in fixed row-major order; subtract this entire 256-element register symbolwise GP29. The source-grounded conventional rule `P[i]=Q[i+13]−table[i] mod29` requires no fitted secret, phase or text alignment.

The original result has **native GP trigram −3.4420320745**, IoC **0.0337316176**, compared with solved p57 **−2.4681447142** and **0.0627099664**. All 256 ciphertext symbols are exactly restored by adding the original table bytes back, the untouched 13+6 margins are exactly restored, and multiplication by the original red G reproduces all **277/277 original physical p29 runes**. A 256-symbol solved-native GP planted plaintext also decrypts exactly under the unchanged source table. No contiguous long plaintext or recognizable GP passage appears. Retire this exact **p27 marker-specified 13+6 trim plus p50-as-additive-pad** candidate. Its attractive 275−256=19 length relation is a source cardinal coincidence until the creator supplies an instruction that authorizes the trim or pad operation.

[Original-source Node22 CommonJS reproducer](../sims/lp2_p29_gquotient_13_6_to_grid256_pad_sft.cjs). This is distinct from the already-negative 23-surplus between p29/G275 and p50/(H·G)252, and deliberately avoids its edge/sign sweeps.

## Causal plaintext decision

The new carries are **exact, key-like short numeric packets** aligned with the p39 G factor and the distinct p23 *integer representative* of signed H linking p29, p50 and p28, but it does not identify a complete key stream, reversible original-rune transform, clock/reset, or plaintext receiver. The p29 quotient itself has near-ciphertext GP29 IoC **0.03405441**. Any single fixed GP29 permutation applied uniformly to this quotient preserves that IoC, so the revealed `e=3` GP29 cube operation alone cannot turn the full quotient into native-GP English prose. The separately frozen full 275-rune quotient→outer-H shell inverse and the above p50 factor-carry Hill2 inverse both failed native-GP language [under its exact source rule](lp2-p28-p29-gquotient-outerh-prospective-inverse-decision.md).

**Next discriminating requirement:** find an independently legible original instruction specifying what the two red-factor carries actually key and how its state advances through >=150 original encrypted runes. Until then this is intermediate arithmetic evidence, useful for interpreting the table's unusual algebraic structure but insufficient to promote the p28/p29/p50 network to an authenticated decipherment.

## Reproducibility

- [Self-contained read-only Node22/CommonJS SFT](../sims/lp2_p29_p50_redg_29adic_dhcarry_sft.cjs) pins original two polynomials, tests both mod29 and mod841 remainders, checks H mapping and the seeded conditioned null.
- Original source paths: `resources/liber-primus/lp2-corpus.json` physical `pages[29].indices`, `resources/liber-primus/lp2-grid-256.json` `bytes`, and red p39 triad in `resources/liber-primus/lp2-ink-annotations.json`.
- Prior table carry: `sims/lp2_p50_base29_carry_dh_sft.cjs`; cross-source GF29 factor [report](lp2-p29-grid-sole-repeated-root-and-quotient-key-gate.md).
