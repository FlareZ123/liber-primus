# Global GP29 prime-exponent clock: fixed-symbol exclusion

**26 November 2026. Intermediate negative for Director Issue #2942. No unknown plaintext or authentic key recovered.**

## Hypothesis and source boundary

The local p28 DH reconstruction independently selects cube exponent 3, and solved p56 uses a successive-prime clock with transparent plaintext F. A plausible but unverified transfer is a public exponent clock over the nonzero GP29 field:

- take successive prime numbers and reduce them modulo28;
- skip nonunits, so every exponent is invertible modulo28;
- encrypt each nonzero plaintext symbol as C = P^e mod29;
- let F/index0 pass unchanged and hold the exponent clock;
- start at the first unit prime, 3, with identity offset and no fitted phase or translation.

This is an exploratory global transfer, not a source-authenticated instruction. The p28-local READ OUT transform is a separate result and is not being re-tested or rejected here.

## Decisive invariant

The multiplicative group of nonzero residues modulo29 has order28. An exponent e gives a permutation of that group exactly when gcd(e,28)=1. Every such e is odd. Consequently, for every permitted exponent, regardless of its position in the clock:

\[
0^e=0,\qquad 1^e=1,\qquad 28^e=(-1)^e=-1=28\pmod{29}.
\]

Thus the identity-offset exponent-only receiver must preserve the exact counts of three GP29 symbols:

- index0: F;
- index1: U;
- index28: EA.

This invariant is independent of prime origin, clock phase, page resets, F holds, and the order of the exponents. A page reset cannot repair it.

## Original and native counts

| Register | Length | F | U | EA |
|---|---:|---:|---:|---:|
| Original unknown p0–p55 | 12,956 | **458** | 450 | **460** |
| External solved-native GP29 control register | 2,979 | 48 | 153 | 20 |

The original ciphertext therefore forces 460 plaintext EA runes, 3.55% of the entire text. The solved-native reference has 20/2,979 EA (0.67%). The solved-native dataset is an external transcription of nine solved GP29 records, not source-original Cicada bytes.

A second matched comparison used 12,956-rune windows at a fixed 1,000-rune stride:

| English control | Windows | F range | U range | EA range |
|---|---:|---:|---:|---:|
| Shakespeare | 205 | 206–319 | 368–680 | 48–134 |
| Emerson | 311 | 295–428 | 324–460 | 36–125 |
| Gibran | 50 | 258–388 | 435–649 | 39–168 |
| **All controls** | **566** | max 428 | — | **max 168** |

The original EA count 460 exceeds every one of the 566 matched windows by at least 292 symbols (2.74× the maximum control count). The original F count 458 also exceeds every matched window (maximum 428); U remains within the control ranges. The EA invariant alone is decisive for the ordinary GP-English plaintext hypothesis.

## Positive control and reproducibility

The reproducer generates the exact public unit-prime exponent sequence, confirms every exponent is odd and coprime to28, and verifies the fixed points. It then plants the same F-hold exponent clock into a 12,956-rune GP-transliterated Gibran segment and exactly inverts it. The synthetic plaintext and ciphertext have identical F/U/EA counts, as required.

Run from the repository root:

\`node sims/lp2_prime_clock_exponent_permutation_fixed_symbol_sft.cjs\`

The script asserts the original and solved-native counts, the 566 control windows and their maxima, the algebraic fixed points, and exact synthetic recovery.

## Decision

Close the frozen identity-offset prime-exponent clock without running a full original inverse or language scoring. Every allowed exponent fixes EA, while the original contains far too many EA symbols for the matched ordinary-English controls. This rejects the specified exponent-only global transfer and, more generally, any identity-offset power-only map using units modulo28 as exponents.

It does **not** exclude a non-English intermediate register, a source-authenticated additional translation/affine layer, or the separate p28-local READ OUT candidate. No such extra layer is selected by this task's source evidence. Do not rescue this receiver with arbitrary translations, remappings, or exponent schedules.
