# P8's 243 runes cannot directly label a reversible ternary feedback table under any five-axis convention

**Agent7, 22 November 2026. Exact original-cipher, all-secret negative with certified minimum repair cost for one source-motivated state architecture.** The best *lexicographically indexed* feedback convention requires **39 state-specific trit overrides**, while the independent original-p7-LFSR state-order convention still requires **at least 35**, among 243 entries, even after choosing the best of every possible 29-rune-to-trit key. No unknown-page plaintext, key, decoder or original Cicada destination was recovered.

## Source premise and intended operation

The actual physical p7 five red-word **zero-based GP29-index products** are `[11,26,8,15,2]`. Reduction modulo3 gives the primitive five-stage GF(3) register `[2,2,2,0,2]` independently reconstructed in [the source p7 result](lp2-p7-primitive-gf3-msequence-p8-original-table-gate.md). The adjacent physical p8 prints **12 red runes followed by exactly 243 black GP29 runes**, precisely the state count `3^5`. This suggests, conditionally, that the black runes might label the **feedback output of each five-trit state**, rather than being a text stream or a keystream table. The strongest alternative remains ordinary encrypted prose with an incidental 243 count.

Freeze the original black body as the **243-element row-major lexicographic table**, with one fixed but *completely unknown* mapping `h: GP29 glyph → trit 0/1/2`. Grant any permutation of the five coordinate axes, either register shift direction, and any consistent relabeling of trit values. For a one-step feedback register to permute all 243 states (so that its update is reversible), fix the four retained coordinates. The three states differing only in the dropped coordinate **must have three distinct feedback trits**. Otherwise two inputs collapse to the same next state. This necessary condition does not require an assumed key, a trial plaintext or an English score.

## Exact source-table obstruction

In the standard base3 address convention, states differing only in coordinate `a` occupy `[i, i+3^a, i+2×3^a]` with the `a`th digit of `i` equal0. There are 81 such triples for each coordinate. **Repeated source rune identities** within any triple force identical feedback trits under *every* secret static `h`, violating invertibility.

| Dropped ternary coordinate `a` | State-address stride | Out of 81 groups containing repeated source glyphs | One exact original witness: zero-based table offsets |
| ---: | ---: | ---: | --- |
| 0 | 1 | **5** | 69, 70, 71 → GP indices 20,27,20 |
| 1 | 3 | **6** | 27, 30, 33 → 23,12,23 |
| 2 | 9 | **8** | 61, 70, 79 → 4,27,4 |
| 3 | 27 | **6** | 1, 28, 55 → 9,3,3 |
| 4 | 81 | **12** | 5, 86, 167 → 13,20,13 |

Each of the five possible dropped coordinates is obstructed. Relabeling the three trits or permuting coordinate names preserves equality; source-table reversal merely reverses each coordinate's triplets. Consequently **every 5! coordinate ordering and both ordinary one-trit shift directions** fail as reversible table-address updates with a stationary rune-to-trit feedback map. This is an exact all-secret theorem. It is separate from the earlier SAT proof that p8's original rune order cannot be mapped statically to a *de Bruijn output sequence*: a state-indexed feedback table and an output *sequence* are different mathematical objects.

A genuinely constructible positive sets `h(T[s])` equal to the state's dropped ternary coordinate; for all five axes, the resulting 243-entry table has **81/81 rainbow triples** and defines a reversible state permutation. The SFT runs five such positives independently of the original source and checks the untouched 243 original GP indices against their established SHA-256. It asserts exactly `[5,6,8,6,12]` obstructing original triples.

## Exact minimum feedback repair, allowing arbitrary secret rune-to-trit keys

The identity-collision witnesses prove failure, but their raw counts `[5,6,8,6,12]` **understate how far a static lookup falls short of an invertible state permutation**. Even if a secret mapping is selected adversarially to maximize reversible fibers, many distinct source runes must share one of only three trit values, causing extra collisions. Compute the *smallest number of individual state-specific trit outputs* that would have to override a single unknown stationary mapping `h` to make all 81 fibers rainbow. Unlike the earlier contradiction, this grants arbitrary repairs at chosen table addresses.

For each possible dropped coordinate, solve an exact **binary mixed-integer program** with 87 key variables `x[r,t]` giving the unknown color of all 29 GP glyphs, and 243 fiber variables `y[f,t]` recording whether one of the three rune identities in a fiber carries trit `t`. Require `Σ_t x[r,t]=1` and `y[f,t]≤Σ_(r in unique fiber f) x[r,t]`. Maximize `Σ_(f,t)y[f,t]`. A fiber showing `d` distinct trits under the best stationary key needs exactly `3−d` state-specific feedback edits to become a reversible triple. Hence the objective provides the **globally minimal** overrides for every secret stationary rune-to-trit key. Permuting trit labels lets the solver fix `h(GP index0)=0` without eliminating an admissible key.

| Dropped coordinate | Original identical-rune witness fibers | **Exact minimum feedback edits** | Fraction of 243 outputs |
| ---: | ---: | ---: | ---: |
| 0 | 5 | **39** | 16.05% |
| 1 | 6 | **41** | 16.87% |
| 2 | 8 | **39** | 16.05% |
| 3 | 6 | **39** | 16.05% |
| 4 | 12 | **44** | 18.11% |

**Certified over every key and all five axes:** at least **39/243≈16%** individual table outputs must depend on some extra state, exception rule, or transformed operand beyond a fixed GP-rune-to-trit map. The true table could of course be produced by a compact evolving algorithm rather than 39 independent secret patches. This result quantifies the necessary behavior of such an algorithm; it **does not** establish a minimum key length, reveal an actual update law, or disprove a state address unrelated to the five-coordinate lexicographic order.

The [fully runnable SciPy/HiGHS mixed-integer SFT](../sims/lp2_p8_feedback_minimum_edit_milp_sft.py) reads the same original SHA-256-pinned p8 body, asserts all five exact optima `[39,41,39,39,44]`, checks equality of each *primal optimum* and the solver's *global MIP dual bound*, and constructs five perfectly reversible synthetic ternary feedback tables (three genuine GP rune labels, one for each trit) as controls. Locally tested with Python 3.11+ and SciPy 1.17.0, NumPy 2.3.5. The required key-symmetry reduction and each triple's reconstruction are implemented in the same file. This strengthens the stationary-feedback exclusion beyond identifying isolated duplicate glyphs, and sets a concrete threshold on any proposed near-stationary rescue.

**Reproducers:** [original identity-obstruction CommonJS SFT](../sims/lp2_p8_243_static_feedback_anyaxis_no_go_sft.cjs) and [exact optimum SciPy SFT](../sims/lp2_p8_feedback_minimum_edit_milp_sft.py).


## Alternative source-selected ordering: p7's actual primitive 242-cycle

The foregoing **39–44 optimum** is for *lexicographic source-table addresses*, as stated in the model. The **source p7 red-five-word register** supplies a materially different address convention: enumerate its 242 nonzero five-trit states in recurrence order from the printed red-product vector **[2,2,2,0,2]**, splice the one missing zero after either genuine four-zero run at cycle offsets **83** or **204**, and associate each of the 243 physical black p8 runes with the successive five-trit states rather than with numerically consecutive 0–242 states. Agent20's prior [literal p7 LFSR address-order report](lp2-p7-gf3-p8-lexicographic-state-readout-original-gate.md) authenticated these two alternatives; its *pure rune permutation* did not test a stationary rune-to-feedback-trit mapping on the state-ordered table.

Freeze those two exact original-source cycles, their forward/reverse readings (without adjusting key, alignment, seed, word boundaries or splice), and the two one-trit shift conventions that drop either the first or last coordinate. There are only **eight** canonical feedback interpretations. For each, invert the source cycle to the ordinary five-coordinate state address table and run the same unrestricted binary mixed-integer key optimization above:

| Original p7 zero-run splice | p8 body order mapped to states | Drop last coordinate, stride1: forced source duplicate fibers / **minimum edits** | Drop first coordinate, stride81: forced source duplicate fibers / **minimum edits** |
| ---: | --- | ---: | ---: |
| 83 | forward | 6 / **37** | 11 / **43** |
| 83 | reverse | 5 / **38** | 7 / **41** |
| 204 | forward | 8 / **40** | 11 / **42** |
| 204 | reverse | 6 / **40** | 3 / **35** |

Each mode contains an **original identical-rune triple**, so no unknown static 29-rune-to-trit map can make any of the eight source-addressed shift rules reversible. Stronger, the globally optimal keys require **at least 35 of the 243 feedback outputs** to be state-specifically overridden, even under the most favorable source-compatible splice, shift direction and rune-to-trit key. The best35 belongs to **zero-run204, reverse body order, dropped highest-order coordinate**. This conclusion **does not** cover arbitrary unprinted cycle-phase shifts, arbitrary row permutations, nonlinear 243-state updates with no four-coordinate shift, dynamic keys, or a GP29-valued rather than trit-valued feedback. It specifies a finite and relatively economical source-derived attempted receiver, without selecting author intent.

The [source-p7 8-case exact mixed-integer SFT](../sims/lp2_p7_p8_lfsr_feedback_minedit_sft.py) checks all original p7 word indices, original coefficients, both zero splices, the first five fixed state addresses **[236,223,184,67,203]**, the exact 243-state address permutation, all 8 source-identity collision counts and all 8 matching primal/dual integer optima. The reused [exact original p8 feedback solver](../sims/lp2_p8_feedback_minimum_edit_milp_sft.py) supplies the source SHA and optimizer. No extra plaintext material or modeled intervention schedule is introduced.

## Decision

The directly lexicographic *reversible* 243-state ternary feedback interpretation is excluded for every stationary GP-rune-to-trit map and all five-axis reorderings. All eight canonical *p7-LFSR-ordered* alternatives are separately excluded for any stationary mapping, with minimum necessary state-specific repairs **35–43**. This does not exclude an evolving map, a noninvertible feedback generator, a different state-address assignment (such as the independent p7 242-cycle with an explicit zero splice), or the ciphertext serving as a 243-entry GP29 output table. It also leaves the question of whether the author intended any ternary state mechanism completely open.

A future attack should supply an independent source-visible **address assignment or nonlinear decoding operand** before fitting one of those remaining variants. Simply permuting coordinate names, adjusting hidden rune-trit keys or searching more lexicographic phases cannot repair the exact collision. Even near-stationary repairs need at least **39 outputs in the lexicographic convention** or **35 in the original p7-derived LFSR convention**. Identify a source-selected state update before investing in either larger architecture.
