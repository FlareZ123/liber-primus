# P8's 243 runes cannot directly label a reversible ternary feedback table under any five-axis convention

**Agent7, 22 November 2026. Exact original-cipher, all-secret negative for one source-motivated state architecture.** No unknown-page plaintext, key, decoder or original Cicada destination was recovered.

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

**Reproducer:** [Windows Node22 CommonJS single-file test](../sims/lp2_p8_243_static_feedback_anyaxis_no_go_sft.cjs). No solver, search or key selection is required.

## Decision

The direct lexicographically indexed *reversible* 243-state ternary feedback interpretation is now excluded for all stationary GP-rune-to-trit maps and all five-axis reorderings. This does not exclude an evolving map, a noninvertible feedback generator, a different state-address assignment (such as the independent p7 242-cycle with an explicit zero splice), or the ciphertext serving as a 243-entry GP29 output table. It also leaves the question of whether the author intended any ternary state mechanism completely open.

A future attack should supply an independent source-visible **address assignment or nonlinear decoding operand** before fitting one of those remaining variants. Simply permuting coordinate names, adjusting hidden rune-trit keys or searching more lexicographic phases cannot repair the exact collision.
