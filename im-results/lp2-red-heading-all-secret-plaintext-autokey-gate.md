# Red chapter openings do not seed an ordinary plaintext autokey on unknown LP2

**16 November 2026, Agent41. Classification:** exact all-secret necessary-condition failure for two specific position-preserving GP29 plaintext-autokey families. This is a bounded, source-selected hypothesis test on all nine original illustrated chapters. **No previously unknown LP2 plaintext or authentic key was recovered.**

## The original human-readable hypothesis

LP2's nine large red rubric openings have original GP29 lengths **13, 16, 12, 9, 16, 19, 10, 8, 9** at physical pages **0, 3, 8, 15, 23, 27, 33, 40, 54**. The red openings are source-visible potential initial keys or IVs, a mechanism familiar from solved Vigenère-era Cicada stages. The source itself does not prescribe a plaintext autokey, however, and the separate p15 red headings straddle the printed numerical square. A fresh key per illustrated chapter is more permissive than a shared global key.

For chapter `j`, discard its initial red rubric (length `L_j`) from the ciphertext that will be decoded. Preserve every subsequent genuine original GP29 rune through the end of that original illustrated chapter. Test either sign `s ∈ {+1, −1}` in the simplest periodic-offset *plaintext-autokey* recurrence:

```text
C[i] = (P[i] + S[i]) mod 29                    for 0 <= i < L
C[i] = (P[i] + s * P[i-L]) mod 29               for i >= L
```

Here `S[0..L−1]` is a **completely arbitrary unknown secret key**, not necessarily the printed red opening. Thus the test gives the proposed mechanism more freedom than a specific red-heading-derived key, with no guessed secret, crib or statistical key search. No punctuation consumes an autokey slot, and the model has no plaintext-F bypass.

## An exact all-key invariant

Let `Q` be the original ciphertext decoded with the zero initial key, and `P` be the inverse under any other initial secret. Their difference is constant within each class of rune positions:

- For `s = −1`, `P[i]-Q[i]` repeats every `L` runes.
- For `s = +1`, the difference flips sign at each `L`-rune block, repeating every `2L` runes.

Therefore, for either sign, **two decoded plaintext letters in the same phase class are equal if and only if the corresponding zero-key decoded runes are equal**. The count of within-class equal-rune pairs, separately at each phase, is invariant under *every one of the 29^L unknown secret keys*. Even a red heading with a different order or unknown alteration cannot improve the invariant. This argument avoids the familiar false confidence of exact forward re-encryption: every alternative key would round-trip perfectly.

Compute the invariant for each original chapter's unchanged encrypted body, then compare it with source-native Gematria Primus English controls at the **exact same rune length and phase period**. Native source spelling includes the documented `ING → NG` and `IO → IA` contractions, independently calibrated on solved LP1. Shakespeare, Gibran and Emerson are separate reference registers, rather than the unknown true author text.

## Full original execution and direct positive controls

| Original red-start page | Red key length | Subsequent original runes | Key-invariant equal-pair rate, s=−1 | Key-invariant equal-pair rate, s=+1 |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 13 | 716 | 0.034349 | 0.035459 |
| 3 | 16 | 1,129 | 0.033206 | 0.034668 |
| 8 | 12 | 1,717 | 0.034301 | 0.033634 |
| 15 | 9 | 1,894 | 0.034869 | 0.032969 |
| 23 | 16 | 1,005 | 0.035123 | 0.034090 |
| 27 | 19 | 1,414 | 0.033962 | 0.034760 |
| 33 | 10 | 1,670 | 0.035719 | 0.033662 |
| 40 | 8 | 3,000 | 0.034510 | 0.034631 |
| 54 | 9 | 299 | 0.030926 | 0.028682 |

All **18/18** original cases lie in the narrow interval **0.02868151–0.03571892**, whereas the **lowest rate among all 27,000 same-length GP-English reference windows** is **0.04323630**. For every case, exactly **500 deterministic same-rune-length windows from each of the three English registers** were tested. None matched or fell below its corresponding original phase-equality rate: **0/27,000**. Because these source windows can overlap, the tally is an empirical reference-register comparison, not a claim of 27,000 statistically independent trials.

The original-input reproducer independently verifies all nine original red opening offsets and lengths; it decodes every body with the original red opening, a zero initial key and a distinct arbitrary secret; it exactly forward re-encrypts the unchanged ciphertext with both nonzero secrets and verifies identical phase counts. It then constructs synthetic native-GP plaintexts, encrypts them under the same recurrence with a separate secret, and recovers every source-native planted rune. The planted positives also satisfy the exact key-invariance proof. **GitHub Actions Node22 manual CI passed**, including all inherited source-native calibration and preceding repository controls: [run 43981274391](https://github.com/FlareZ123/liber-primus/actions/runs/43981274391).

[Read-only CommonJS reproducible test](../sims/lp2_red_heading_autokey_allseed_original_sft.cjs) · [existing shared manual runner](../.github/workflows/agent41-eightphase-original-invariants-manual.yml)

## Decision and boundaries

The nine native red-heading lengths **cannot serve as the lag of either tested plaintext-autokey recurrence** and simultaneously yield GP29 ordinary-English text with the source-native within-phase collision profile, regardless of the unknown initial key. This rules out a nontrivial complete seed-recovery attack before searching 29^L keys and rejects only the model's declared letterwise recurrence and GP-native receiver.

The test does **not** rule out ciphertext-autokey, a changing lag, another plaintext alphabet, F-transparent skips, word-local clock resets, an external side register, a preceding transposition, or independent per-position feedback parameters. In the actual source, no cipher operation has yet been independently selected to choose one of those variants. The direct printed-red-seed decryptions themselves remained nonlinguistic. The next decision should seek an authored state or operand that genuinely fixes a different inverse, rather than widening the autokey family with fitted exceptions.
