# Cumulative plaintext-sum autokey in the F29/EA register: original negative

**Classification:** finite, source-motivated test of a cumulative Gematria state. No original LP2 plaintext, authentic key, or destination was recovered.

## Human solve-path hypothesis

The conditional EA zero-step model turns nonzero ciphertext differences into a 28-symbol exponent register using the source-derived primitive root 15 modulo 29. The next simple way to make that state depend on the whole preceding plaintext, without introducing an arbitrary key, is a cumulative Gematria sum:
\[
K_{i+1}=K_i+P_i\pmod{28}.
\]
This has a particularly simple interaction with the EA hypothesis: GP EA is index 28, hence contributes zero modulo 28 and naturally leaves the accumulator unchanged. It is a recognizable plaintext-autokey/integrator construction, not an unconstrained nonlinear search.

## Exact candidate

At each page initial:
\[
P_0=C_0+\text{sign}\cdot K_0\pmod{29}.
\]
At later positions, let \(d_i=C_i-C_{i-1}\pmod{29}\). If \(d_i=0\), set \(P_i=EA\). Otherwise:
\[
P_i=\log_{15}(d_i)+\text{sign}\cdot K_i\pmod{28}.
\]
After every recovered rune, update \(K_{i+1}=K_i+P_i\pmod{28}\). The initial phase is one of 28 values; both signs and global, physical-page, source-section, and printed-word resets are tested: **224 configurations**. EA does not need a separate advance/skip switch because its numeric value is zero in the accumulator.

## Original-input and language test

The reproducer asserts 55 rune-bearing unsolved pages, 12,956 runes, 2,896 words (including cross-page words), eight source sections, and 86 within-page adjacent-repeat positions. It uses the exact committed 29-rune alphabet and prime-root-15 logarithm table.

A smoothed GP trigram model is trained on the first 240,000 characters of the repository Shakespeare control; the remaining text is held out. Scores are mean log-likelihood per modeled event (rune and word-end events).

| Input/model | Best mean log-likelihood |
| --- | ---: |
| Original LP2 ciphertext | −7.411724 |
| Best of all 224 cumulative-sum candidates | **−7.337707** |
| Held-out Shakespeare GP | −1.923133 |

The best original candidate has phase 19, sign +1, and a printed-word reset. Its decoded prefix is not coherent plaintext. The small improvement over raw ciphertext is not language recovery and remains far below the held-out English control.

## Positive controls and scope

A layout-matched held-out Shakespeare GP plant reserves EA for exactly the 86 source-selected marker positions. All **8/8** combinations of sign and reset mode (with planted phase 7) encrypt, decrypt, and re-encrypt exactly; the ciphertext contains exactly the 86 intended zero steps.

This rejects only the cumulative plaintext-sum state rule with the stated phase, signs, and reset conventions under the conditional EA-marker interpretation. It does not reject arbitrary evolving state, nonlinear/nonperiodic feedback, independently derived interval keys, a different marker meaning, or other accumulator functions. The EA interpretation itself remains hypothetical. Do not repeat this same cumulative-sum family.

**Reproduction:** from repository root, run node sims/ea_cumulative_plaintext_sum.cjs (Node.js 22; no external packages). Starting evidence and broader constraints: [red-span-triangle.md](red-span-triangle.md), [ea_zero_step_reversible.cjs](../sims/ea_zero_step_reversible.cjs).
