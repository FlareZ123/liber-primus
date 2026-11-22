# One-step prime-indexed feedback from solved p56: original negative

**Classification:** finite, source-motivated cryptanalytic exclusion. No unknown LP2 plaintext, key, or destination was recovered.

## Human solve-path hypothesis

A solver who has decoded LP2 physical page 56 can observe the authentic prime-totient operation: a GP rune is shifted by \(\varphi(p_j)=p_j-1\pmod{29}\), with one known literal F interrupter. The alphabet itself also supplies a fixed map from each of its 29 rune indices to one of 29 primes.

A simple next hypothesis is that the previous rune selects the next totient shift:
\[
P_i=C_i\mp(\operatorname{prime}[s_{i-1}]-1)\pmod{29},
\]
where the feedback state is either the previous plaintext rune or the previous ciphertext rune. This is a recognizable one-symbol feedback extension of an already solved LP2 mechanism; it requires no arbitrary key string. The observable clue is the existing 29-rune/29-prime correspondence and the solved p56 prime-totient cipher. A creator might use feedback to make a short prime-derived operation evolve without introducing a separate high-entropy key.

## Exact original-input test

The established solved-page mechanism is documented in [lp2-punctuation-solved-clock.md](lp2-punctuation-solved-clock.md) and independently implemented in [solved_cipher_regression.cjs](../sims/solved_cipher_regression.cjs). The reproducer, [lp2_prime_feedback_gate.cjs](../sims/lp2_prime_feedback_gate.cjs), reconstructs the original LP2 input and asserts its source coordinates before testing:

- 55 rune-bearing unsolved physical pages, 12,956 runes;
- 2,896 canonical words, preserving words that cross page boundaries;
- eight source sections;
- the committed 29-prime Gematria Primus mapping.

It exhausts the finite family of **464** candidates: previous-plaintext versus previous-ciphertext feedback; both additive signs; all 29 initial rune states; and continuous, physical-page, source-section, or printed-word resets. The key schedule is fixed to the authentic p56 mapping prime[state]-1; no ciphertext-tuned key or language-selected segmentation is introduced.

A smoothed GP trigram model is trained on the first 240,000 characters of the repository's Shakespeare control. The remaining source text is held out. The score is mean log-likelihood per modeled event (each rune and each word-end event).

## Result

| Input/model | Best mean log-likelihood |
| --- | ---: |
| Original LP2 ciphertext, unmodified | −7.411724 |
| Best of all 464 feedback candidates | **−7.319078** |
| Held-out Shakespeare GP control | −1.923133 |

The best original candidate uses previous-plaintext feedback, the additive sign (sign = −1 in the reproducer's convention), a reset at every printed word, and seed 4. Its decoded prefix is not coherent plaintext. Its small score improvement over raw ciphertext is negligible beside the gap to the genuine English control; it is not evidence of a key or language recovery.

All **16/16** layout-matched synthetic GP-English positive controls (two feedback types × two signs × four reset rules) encrypt and decrypt exactly under their planted parameters. Thus the negative is not caused by a broken inverse implementation.

## Scope and decision

This rejects only the specified one-step prime-indexed feedback family with the stated 29 seeds, signs, and four source-visible reset choices. It does not rule out longer-memory feedback, nonlinear or evolving state, an independently supplied key, a different intermediate register, or a distinct use of the prime table. The p56 literal-F exception is not generalized to arbitrary LP2 positions in this test.

The affordable decisive experiment was a complete 464-setting source-frozen search with exact planted controls; it produced no readable original plaintext. Do not repeat this same family. The next useful attack needs a new source-fixed state rule or independently sourced key material, not another seed sweep.

**Reproduction:** from repository root, run node sims/lp2_prime_feedback_gate.cjs (Node.js 22; no external packages).
