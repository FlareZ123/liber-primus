# Source-derived 242-state GP29 clock: full-secret alphabet invariant on the original tree chapter

**Agent 6, 22 November 2026.** A new exact original-cipher necessary-condition test for a plausible p7-to-p8 cipher, including *every* secret 29-rune substitution independently chosen for each of 242 states. The tests reject native-English GP29 plaintext under this particular stationary-state architecture across the full p8–p14 tree chapter. There is **no recovered unknown plaintext, actual historical cipher, original key, or destination**.

## What could have motivated the decoder

Five marked red words at the end of original LP2 physical p7 yield GP29 index products [11,26,8,15,2]. In physical ink order, reduction modulo3 gives the already established primitive five-tap GF(3) recurrence [2,2,2,0,2] on five trits, with period **242**, visiting each nonzero state exactly once. Immediately next, physical p8 carries a red12 title and 243 black runes; the last black rune continues a word into p9, leaving exactly 242 whole-page black rune positions. Independently, five preceding physical scroll pages p3–p7 contain 242 wholly black complete words alongside 13 red words. These are real, source-visible lengths. Their treatment as *a running cipher clock* is a conjecture; neither the source nor solved historical text prescribes this cipher.

The broadest uncomplicated such clock would use a different arbitrary *secret 29-to-29 bijection* at each complete five-trit state, while advancing the same 242-cycle once per emitted rune. Let the source state at rune position i be s(i), and let Q_s be an entirely unknown permutation of all 29 GP runes. The cipher is

    C(i) = Q_{s(i)}(P(i)).

For any positions i and j with the *same* state, the permutation is the same, irrespective of its unknown content:

    C(i) = C(j) if and only if P(i) = P(j).

Consequently the total number of equal unordered rune pairs within each state class is an **exact, key-independent invariant**, across all (29!)^242 choices of secret bijections. It is also independent of the initial nonzero LFSR seed and any unknown global phase rotation, since equality of states occurs exactly for positions congruent modulo242. Both visible source-derived primitive GF3 recurrence candidates have period242, so this necessary condition applies to either if their full states choose fixed bijections.

This tests a different mechanism from the earlier three-mode predecessor cipher, which chose 29-rune permutations from the register's output trit *and preceding ciphertext rune*. That model can depend on the changing predecessor at equal GF3 states, and is outside this theorem. Conversely, the present gate permits 242 entirely separate secret substitution alphabets and does not assume additivity, affine keys, English key words, or any particular alphabet permutation.

## Frozen original chapter and independent native plaintext

Retain the original, unedited physical p8–p14 source runes as one contiguous **1,729-rune** tree chapter. The seven source page lengths are **[255,268,263,273,261,272,137]**. Count pairs in all 242 congruence classes either (A) continuously across page breaks, or (B) resetting the *state phase* at each actual physical page with the **same** secret 242 alphabets reused. Page-specific newly secret alphabets are outside (B). No original text is optimized as a key, no letters are removed to improve scores, and no ciphertext word breaks influence these equalities.

The first independent plaintext register consists of nine genuinely solved GP29 runic text sections preserved at 'resources/external/relikd-solved-gp29-native-v1.json', concatenated to 2,979 runes. Every one of its **1,251** sliding 1,729-rune windows receives exactly the original seven physical page cuts. These are authentic published cleartext runes, though the source sections are concatenated, so the join is not a single authored continuous chapter.

The second independent control is Khalil Gibran's published *The Prophet* as the repository's 62,492-rune source-calibrated GP29 text. Use the existing original solved-LP1 orthography, with the special ING/IO spellings, without fitting the original ciphertext. Examine **1,643** consecutive 1,729-rune windows stepped by 37 positions, with exactly the same seven page cuts. This is an ordinary contiguous public English source, not a Cicada-authenticated LP2 plaintext.

| Original architecture | Same-state pairs | Original LP2 equals | Solved GP: minimum of 1,251 windows | Gibran: minimum of 1,643 windows |
| --- | ---: | ---: | ---: | ---: |
| Continuous state across p8–p14 | 5,327 | **195** (3.6606%) | **314** | **260** |
| Reset state at each page, reuse all same 242 alphabets | 5,718 | **210** (3.6726%) | **317** | **286** |

**None** of the 2,894 sampled native-GP windows has as few matching same-state pairs as original p8–p14 under *either* clock. For direct continuous-clock sensitivity, excluding the entire 12-rune p8 red title still gives **194/5,243**, while starting only at untouched p9 gives **136/3,762**. Neither restart choice can be rescued by secret phase selection, changing the 242 bijections, or choosing a different primitive-cycle seed under the stated architecture.

This is a finite natural-English-register exclusion, **not** an impossibility theorem for all conceivable specially balanced text, deliberately constrained plaintext, a second cipher stage or unknown external material. The 1,251 solved windows overlap substantially, so their zero-hit count is not a binomial p-value, and the Gibran controls are likewise overlapping. The exact invariant itself is mathematical, independent of any language assumptions.

## Constructive positive and decoder boundary

The standalone test builds the actual p7-derived GF3 recurrence, proves its cycle visits each of the 242 nonzero states exactly once, and constructs **242 distinct, full GP29 affine bijections** using the complete state IDs. Three separate initial phases (0,67,241), both clock-restart conventions and 1,729 genuine solved-GP rune symbols are encrypted and exactly decrypted. All six planted full-length tapes preserve their exact same-state collision counts, and the experiment asserts all original and native-reference counts.

The result specifically removes **globally reusable, state-only periodic secret alphabets** from a leading interpretation of the p7 242-cycle, even where each internal state receives a wholly unknown codebook. It does **not** remove nonlinear ciphertext/plaintext-feedback states, per-page independently renewed alphabets, keyed state-dependent word aggregation, a value-changing transform after the state decoder, or a fresh original-source instruction. A promising next route requires the missing authored *word-to-rune update/receiver* linking the 242 black scroll words to the 242 page-contained p8 black runes and then an independently predicted whole original p9 phrase. Repeatedly optimizing periodic 242-valued additive pads cannot defeat the equality invariant.

**Run the self-contained source-input CJS test:** 'sims/lp2_p7_gf3_242_fullstate_invariant_sft.cjs' (Node.js 22, Windows-compatible); it reads immutable repository sources, writes no files, asserts exact counts and six genuine 29-rune cipher roundtrips. Related source observation: 'im-results/lp2-p3-p8-242-black-word-rune-original-inverse.md'; competing three-mode cipher: 'im-results/lp2-p7-gf3-three-mode-allsecret-original-gate.md'.
