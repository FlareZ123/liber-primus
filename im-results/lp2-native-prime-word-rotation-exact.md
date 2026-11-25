# Native prime clock with word-local cyclic transport: exact original inverse

**Agent42, 25 November 2026.** A frozen prime-sum rotation and a stronger arbitrary independent rotation receiver both fail. This is a conditional native-prose exclusion, not an authentic key or plaintext. All nine source chapters fail even when their initial prime index can be any of 0 through 3301 and every printed group can choose its own rotation.

## Motivation and distinction from previous work

The actual p56 cipher supplies successive prime-minus-one shifts and plaintext-F holds. The original p57 PARABLE uses circumference imagery; the signed 2016 instruction concerns words and numbers/direction. These suggest testing a reversible word-level cyclic transport outside the additive cipher. They do not authenticate the chosen operator. Earlier [global fixed rotation](lp2-original-outer-wordrotation-repeats-gate.md) only tests a zero-doublet prerequisite; earlier q13 rotation searches concern periodic keys. [Director #2842](https://github.com/FlareZ123/liber-primus/issues/2842) is a distinct whole-chapter stable ordering, not this word-local operation. No shared research assignment was claimed.

Let a complete native plaintext word be P, entering with prime cursor k. Encode each non-F rune p as (p + prime[k] - 1) mod29, consuming one prime; plaintext F emits 0 and holds the clock. Let E be the result, L its word length, and g(x) the canonical GP prime value. Encode the printed group as leftRotate(E, sum(g(E[i])) mod L). The sum is invariant under rotation, so the outer layer has an exact, key-free inverse. The physical printed group boundaries are assumed authentic as transport boundaries. As a stronger relaxation, grant arbitrary independent left rotations of each ciphertext group, with no common parameter or rule at all. The clock remains continuous within a chapter, and the first prime has zero-based index 0.

For each word, enumerate all admitted rotations, undo each rotation, and branch over all legal native F holds and consuming nonzero preimages. A state consists only of the prime cursor, since future encryption is independent of previous plaintext and rotations. Store the minimum cumulative count of out-of-vocabulary complete groups at every cursor; a higher-cost state with the same cursor cannot improve a later trajectory. This gives exact minimum OOV for fixed origin 0. The all-origin decision initializes all 3,302 cursor values at zero cost and drops states exceeding the full chapter's 5% budget. No beam, sampling, guessed F mask, or language-ranked state pruning beyond the explicit monotone budget. Unrestricted rotation is a necessary-condition relaxation rather than an authored uniquely decodable outer layer.

The source parser checks all 12,956 physical p0–55 indices against the corrected transcription, preserving all 2,896 complete groups and actual nine chapter cuts, including the first nine p15 runes in the preceding chapter. The register contains 35,946 distinct GP sequences from the pinned TextBlob list with both native tokenizations, every singleton symbol, all nine solved GP sections, and the first 80% of the three pinned literary donors. This is a finite vocabulary, two forms larger than the 35,944-form register in the previous postshuffle study because this implementation also includes the two solved sections omitted there; the code defines the exact union. Every representative original inverse prefix or complete trajectory is forward-replayed.

## Original results

| Chapter | Groups | Fixed origin-zero rotation: last complete prefix (runes) | Arbitrary rotation origin-zero exact min OOV | 5% budget | Arbitrary rotation all 0–3301 origins: longest budget-feasible prefix |
|---|---:|---:|---:|---:|---:|
| p0–2 | 158 | 131 | 125 | 7 | 11/158 (53 runes) |
| p3–7 | 255 | 2 | 214 | 12 | 18/255 (99 runes) |
| p8–p15 first 9 | 385 | 29 | 313 | 19 | 27/385 (112 runes) |
| p15 remainder–22 | 435 | 40 | 347 | 21 | 31/435 (131 runes) |
| p23–26 | 224 | 0 | 184 | 11 | 15/224 (72 runes) |
| p27–32 | 326 | 95 | 267 | 16 | 28/326 (115 runes) |
| p33–39 | 378 | 178 | 307 | 18 | 29/378 (119 runes) |
| p40–53 | 669 | 78 | 541 | 33 | 45/669 (192 runes) |
| p54–55 | 66 | 1 | 57 | 3 | 6/66 (28 runes) |

No fixed rotation at origin zero has a complete path at all. In contrast, unrestricted rotations at origin zero permit complete but nonprose paths in all chapters. This distinction matters: feasibility alone does not identify an inverse. All nine chapters exceed their lexical budget even when arbitrary independent rotations and all 3,302 initial origins are jointly admitted. The last feasible prefixes in the table count completed groups; every trajectory is eliminated upon processing the next group. No true plaintext recovered. The selected representatives are not candidate recovered plaintext and are included in raw output solely for reproducibility.

## Controls

The genuine p56 plaintext/ciphertext pair is reproduced 85/85 with 84 consuming prime shifts. Three distinct native sections (p57 PARABLE, A WARNING, A KOAN) were encoded using the fixed and arbitrary rotation receivers, then decoded without their rotation schedules. The actual 95, 184 and 780 rune paths remain legal and all controls have min OOV zero. The deterministic chosen representative is exact for all three fixed-rotation plants; arbitrary rotations can introduce alternate lexical paths (the control truth is retained, not asserted uniquely recovered). Controls are in the vocabulary by design, so this calibrates reachability and the inverse, not independent language-model generalization. The all-origin receiver also retains full budget-feasible plant paths at actual initial origins 3301, 1033 and 147. The all-origin routine proves existence within its budget, not recovery of a unique origin.

## Decision

Retire this exact continuous native-prime plus complete-word cyclic transport route for ordinary prose in the specified register, including private chapter starts up through 3301 and arbitrary per-word rotations. The source-fixed rotation is not authenticated. Nonprose, altered group inventory, other clocks, out-of-range origins, noncyclic transforms and other alphabets remain outside scope. A new direction requires independent source information rather than retuning this failed rule. No result changes the established manuscript-wide no-plaintext state; no authoritative synthesis change is needed.

Reproduce on Windows Node22: `node sims/lp2_native_prime_word_rotation_exact_sft.cjs`. The same experiment function was executed directly in the connected JS runtime against repository inputs; no Windows CI is claimed. [SFT](../sims/lp2_native_prime_word_rotation_exact_sft.cjs) · [Raw evidence](lp2-native-prime-word-rotation-exact-output.json). Earlier 33,394-form results are superseded by the expanded register, with the smaller-run history preserved in commits 4d75515410b3b5129dc52ca21bd94871f1305bac and c978eefb4cc0327fbc2b35d1089edd598eaf8925.
