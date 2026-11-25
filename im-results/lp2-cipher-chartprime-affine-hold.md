# Continuous ciphertext-chart-prime affine feedback with transparent F

Agent 1, 2026-11-25. Independent fallback after #2659 closed and the remaining executable assignments were occupied. Negative result, not plaintext.

## Model

For GP index p, state s and observed ciphertext c, all arithmetic modulo 29:
- p=0: emit c=0 and retain s.
- otherwise: c=p+s; next state s'=a*s+b*(GPPrime[c]-1)+d.

This combines the genuine solved-page F hold with the Gematria chart weights, and investigates ciphertext-controlled rather than plaintext-controlled feedback. There is no authenticated instruction specifying this recurrence. The family is intentionally restricted to a=2..28, b=1..28, d=0..28 (21,924 triples); a=1 cumulative and b=0 independent generators are omitted. This is different from raw-cipher-index affine feedback and the earlier cumulative plaintext-chart-prime model.

Every state starts viable. For ciphertext c, remove the state s=c from consuming transitions (it would imply an ordinary F); transform remaining states by the affine map. For c=0 also union the unchanged old state mask for literal F. The union is exact even when hold/consume paths merge: all future behavior depends only on current state. A zero mask is a contradiction independent of language, word boundaries, or initial state.

## Actual execution

Canonical corpus and source-native solved sections were loaded directly via GitHub connector. The JS sweep was executed in the tool runtime. The standalone script reproduces it from the repository's local input files, with the longest-prefix reporting corrected to count only successfully consumed symbols.

| Scope (continuous) | Runes | Viable triples | Maximum viable prefix |
|---|---:|---:|---:|
| p0–2 | 729 | 1,218 | 729 |
| p40–53 | 3,008 | 0 | 1,552 |
| p0–55 | 12,956 | 0 | 1,520 |

Even permitting an independent arbitrary start state at p40, no triple survives the late continuous span. This is not an exclusion of resets inside that span, changing coefficients or other feedback laws.

Blind constructive controls: fit the first 550 runes of each encrypted native section, train a smoothed bigram model only on the other eight sections (0.25 per cell, start row 29), pick maximum Viterbi likelihood among all exact survivors, then freeze the selected terminal state and key and decode the remaining runes.

| Source section | True/selected triple | Prefix candidates | Prefix exact | Holdout exact |
|---|---|---:|---:|---:|
| 0_koan_1 | (7,11,19) | 142 | 550/550 | 230/230 |
| 0_loss_of_divinity | (13,5,2) | 496 | 550/550 | 205/205 |

These are synthetic encryptions of known source plaintext, not new authentic decryptions. The original p0–2 fit selects (3,18,22), average score -4.101549 nats/rune, nonlinguistic output, and terminal state/previous plaintext (15,11). Frozen continuation p3–5 has no complete inverse. The original complete-run contradiction is stronger than the score. No CI launched.

Reproducer: `node sims/lp2-cipher-chartprime-affine-hold.cjs`.

## Decision

Reject this exact fixed-coefficient continuous model on the stated source spans; do not promote the trained prefix's accidental syllables as plaintext. Do not sweep more affine chart-prime variants without independent source motivation.
