# F29/EA progressive exponent counter: original negative

**Classification:** conditional, source-motivated test of the simplest correlated 28-state clock. No original LP2 plaintext, authentic key, or destination was recovered.

## Human solve-path hypothesis

The red-triangle work establishes that 15 is a primitive root modulo 29, with multiplicative order 28. Under the still-hypothetical EA zero-step interpretation, each nonzero ciphertext difference is converted to an exponent by the discrete logarithm base 15, leaving a 28-symbol register. A natural next move for a human solver is to try the simplest nonrepeating correlated pad in that register: a progressive counter
\[
K_i=(\text{phase}+i)\bmod 28.
\]
This uses the source-derived 28-step cycle rather than an arbitrary high-entropy key. The 86 within-page adjacent ciphertext repeats are treated as plaintext EA (index 28), producing zero differences. The 55 page-initial runes are decoded with the same clock using a simple mod-29 shift.

## Exact candidate

For each page initial:
\[
P_0=C_0+\text{sign}\cdot K_0\pmod{29}.
\]
For later positions, let \(d_i=C_i-C_{i-1}\pmod{29}\). If \(d_i=0\), set \(P_i=EA\). Otherwise:
\[
P_i=\log_{15}(d_i)+\text{sign}\cdot K_i\pmod{28}.
\]
The pointer advances at every position or skips EA markers, and may reset globally, at physical-page boundaries, at source-section boundaries, or at printed-word boundaries. Exhaustive parameters are 28 phases, two signs, four reset conventions, and two marker-clock conventions: **448 configurations**. This is deliberately a narrow test of a single source-derived clock, not a search over arbitrary pads.

## Original-input and language test

The reproducer asserts the original source counts: 55 rune-bearing unsolved pages, 12,956 runes, 2,896 words (including cross-page words), eight source sections, 55 page initials, and 86 within-page adjacent-repeat markers. It asserts that 15 has order 28 modulo 29.

A smoothed GP trigram model is trained on the first 240,000 characters of the repository Shakespeare control; the remainder is held out. Scores are mean log-likelihood per modeled event (rune and word-end events).

| Input/model | Best mean log-likelihood |
| --- | ---: |
| Original LP2 ciphertext | −7.411724 |
| Best of all 448 progressive-clock candidates | **−7.334815** |
| Held-out Shakespeare GP | −1.923133 |

The best original candidate has phase 25, sign +1, word reset, and advances the clock on EA markers. Its decoded prefix is not coherent plaintext. The small gain over raw ciphertext is not language recovery and remains far below the held-out English control.

## Positive controls and scope

A layout-matched held-out Shakespeare GP plant reserves EA for exactly the 86 source-selected marker positions. All **16/16** combinations of sign, reset mode, and marker-clock convention (with planted phase 7) encrypt, decrypt, and re-encrypt exactly; the ciphertext contains exactly the 86 intended zero steps.

This excludes only the simple progressive exponent counter under the conditional EA-marker interpretation, including the stated phase/sign/reset/marker-clock choices. It does not exclude a nonlinear or nonperiodic correlated state, independently derived interval keys, a different marker meaning, or a different treatment of page initials. The EA interpretation itself remains hypothetical. Do not repeat this same progressive-clock family.

**Reproduction:** from repository root, run node sims/red_triangle_progressive_ea_clock.cjs (Node.js 22; no external packages). Starting evidence and broader constraints: [red-span-triangle.md](red-span-triangle.md), [ea_zero_step_reversible.cjs](../sims/ea_zero_step_reversible.cjs).
