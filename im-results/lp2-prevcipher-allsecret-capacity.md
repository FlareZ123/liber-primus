# Previous-cipher-rune feedback: exact all-secret GP29 capacity obstruction

**Agent20, 13 November 2026. Provisional original-cipher finite-English exclusion.** This test does not recover a plaintext, key, destination or selected historical operation. The premise is a simple human-comprehensible explanation of the 86 adjacent repeats among 12,901 within-page transitions: a self-synchronizing cipher whose publicly observable state consists only of the **immediately preceding emitted rune**.

## Lossless architecture and its strongest competing explanation

Consider an arbitrary hidden bijection sigma for each prior emitted ciphertext rune, with original GP29 code points and the actual printed text boundaries. At each position, the decoder knows the previous emitted ciphertext rune and applies the inverse of that state's 29-symbol permutation. For the first rune of **every physical page**, additionally grant a distinct page-start sentinel state, making the model more flexible than a continuous cipher. The source-visible nine visual chapters may independently select a fresh collection of all 30 secret tables. Their lengths are 729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, and 308, summing to the exact 12,956 unknown runes.

This is a meaningful computational fork because an explicitly previous-output-driven substitution could suppress adjacent equal symbols while preserving a perfectly invertible finite-state codec; the lag-two equality rate returns to ordinary levels (435/12,846). The competing mechanism is hidden or plaintext-dependent state, a long keyed pad, a nonlinear transducer, or some other cipher. No original Cicada instruction authenticates the proposed last-rune state.

## Original-input all-secret bound

For each known (chapter,previous-cipher-rune) state, count occurrences of its 29 observed ciphertext values. Under any *bijective* hidden alphabet, at most the **largest one** of these bins can decode as plaintext E, and at most the **largest two distinct** bins as plaintext E or O. The sum of each state's locally optimized maxima is an exact upper bound for the whole book under every possible secret table. This method allows the hidden 29! permutations to be completely unrelated across states and chapters, while also granting the extra page-start state.

| Authored-state candidate | Maximum plaintext E | Maximum plaintext E+O | Distinct observed states |
| --- | ---: | ---: | ---: |
| Last ciphertext rune, one global set of state tables | **719** | **1,368** | 30 |
| Last ciphertext rune, independent nine-chapter sets | **1,269** | **2,314** | 270 |
| Last TWO ciphertext runes, one global set | 2,041 | 3,650 | 865 |
| Last TWO ciphertext runes, nine-chapter sets | 6,150 | 9,678 | 5,699 |
| Last ciphertext rune, independent table sets on every physical page | 2,790 | 4,787 | 1,645 |

The last three rows are deliberate escape controls, outside the excluded one-symbol-state model. A two-symbol or page-specific state is flexible enough that the simple one-letter bound ceases to exclude source-native English. Source-authentic plaintext-F bypass does not increase an E/O capacity bound if ordinary non-F encryption is still injective in each state.

## Independent original-length prose comparators

The existing tested GP29 native-English encoder preserves authentic single-rune ING and IO spellings. Its exact minimum letter counts over ALL contiguous 12,956-rune windows in the three pinned controls are:

| Source corpus | Minimum E | Minimum E+O |
| --- | ---: | ---: |
| Gibran, The Prophet | 1,416 | 2,548 |
| Shakespeare | **1,408** | 2,441 |
| Emerson | 1,491 | **2,408** |

Even granting nine chapter-specific collections of arbitrary 29-state bijections, the original ciphertext lacks capacity for at least **139 E** and **94 E/O** compared with every one of these source-native English windows. The result does not prove that LP2 must resemble any of the three English controls.

## Reversible positive and scientific status

The new single-file CommonJS SFT encrypts 12,956 untouched native-GP Gibran runes with a **chapter- and previous-cipher-dependent affine bijection**, using coefficient 11 and shift 7 times the previous ciphertext plus 3 times the chapter number, all modulo29. Every page resets the previous cipher to a public initial value. The inverse uses the modular inverse 8 of 11, asserts exact source-native recovery over every rune, and confirms that the blinded state-occupancy bound accepts the planted English E and E/O counts. It checks every source-native control minimum, all page and chapter lengths, and both one-state and two-state source-original bounds.

Reproducer: [source-exact CJS SFT](../sims/lp2_prevcipher_allsecret_capacity_sft.cjs). The exact native-control and original counts were independently calculated from the current canonical LP2 JSON. The full GitHub CI verification of the new script is not yet recorded here; the summary therefore remains **provisional until the exact SFT runs remotely**.

## Decision

Reject a direct, position-preserving, ciphertext-previous-symbol-only GP29 *bijective* substitution as a native-English explanation of the 56 unknown pages, even when it has completely arbitrary hidden tables separately in nine source-visible visual chapters. This is a strict original-cipher *conditional* exclusion, useful for directing effort away from a simple observable 29-state decoder. It does not reject alternate registers, variable-length coding, longer or secret state, per-word or per-page keys, plaintext feedback, transposition, or an authentic external key source. Re-encrypting under a wrong bijective key is automatic and is never proof of the correct cipher.
