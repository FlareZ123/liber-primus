# Testing the 3301-residue lag-six relation as a recoverable keystream

**Agent 6, 2026-11-10. Classification: bounded, positive-control-backed negative; no LP2 plaintext recovered.**

## Cryptanalytic question

The previously reported within-word echo is

\[
C_i = 24 - 2C_{i-6}\pmod{29},
\]

where 24 is also **3301 modulo 29**. The numerical coincidence motivates one *specific* alternative to a ciphertext-feedback rule: perhaps the underlying additive keystream follows

\[
K_{i+6}=24-2K_i\pmod{29},\qquad
C_i=P_i+K_i\pmod{29}
\]

(or the opposite sign). The map has fixed point 8 and multiplier -2 of order 28 modulo 29, so the general six-seed key can be written explicitly:

\[
K_{6q+r}=8+(-2)^q(K_r-8)\pmod{29},\quad
r=0,\ldots,5,\ q\ge0.
\]

It is a stream of period at most **168**, with only six unknown runes per reset interval. It should therefore be easy to recover its keys from a reasonably long English-like GP plaintext without brute-forcing 29^6 seed combinations.

This is a candidate *interpretation* of the observed affine echo, not evidence that 3301 was intentionally used as the intercept. The external echo and its corrected familywise significance are documented in [lag-six affine echo](lag6-conditioned-echo.md).

## Attack and independent prediction

Reproducer: [sims/affine_3301_keystream_heldout.cjs](../sims/affine_3301_keystream_heldout.cjs). Successful unmodified Node.js run: [GitHub Actions 42761768935](https://github.com/FlareZ123/liber-primus/actions/runs/42761768935).

Inputs are the canonical LP2 page-index corpus and intact textual transcription, totaling **12,956 runes** on **55 rune-bearing unsolved pages** in **2,896 displayed words**. GP-English unigram likelihood is estimated from 3,286 rune-encoded characters of the normalized previously solved LP1 plaintext reference. A half-rune pseudocount smooths each of 29 rune frequencies. The seven conventional Latin digraph rules and the fallback A–Z mapping are printed in the source implementation.

For each key phase 0–5, independently enumerate all 29 starting rune values and choose the highest GP-English log-likelihood on a training partition. Then evaluate recovered plaintext **only on previously unfitted ciphertext positions**. Both additive signs and both held-out fold orientations are evaluated under three separate models:

1. **Global stream:** six unknown key seeds for the full 12,956-rune stream, with even manuscript pages training and odd pages held out (then reversed).
2. **Word restart, shared seed:** six unknown seeds shared by all words; the 168-period schedule restarts at each word. Alternate whole words are held out.
3. **Page restart, independent seeds:** each page has its own six unknown seeds, making 330 fitted variables. Even recurrence blocks of six local positions are trained and odd blocks held out (then reversed).

All positions, plaintext rune values and key phase are defined precisely in the executable. No language-model plaintext generation or adaptive crib tuning is involved.

## Observed LP2 versus planted recoverability

The raw LP2 ciphertext has rune IoC **0.034478398**, approximately the uniform GP baseline 1/29. Ranges below cover both additive signs and both training-fold orientations:

| Key reset policy | In-sample decoded IoC | Independent held-out decoded IoC | Planted-control held-out IoC |
| --- | ---: | ---: | ---: |
| Global stream | 0.034587–0.034659 | **0.034418–0.034491** | **0.061094** |
| Word restart, shared seed | 0.034564–0.034601 | **0.034467–0.034533** | **0.062405** |
| Page restart, independent seeds | 0.040575–0.040859 | **0.034462–0.034507** | **0.058477** |

**No held-out recovery** appears in the LP2 data. The page-reset model's apparent in-sample shift to ~0.041 is selection overfit from estimating 330 seed values; its held-out shift disappears.

For sensitivity testing, the exact candidate recurrence encrypts an independently supplied GP-encoded known-language stream using deterministic nontrivial seeds. To imitate the manuscript's immediate-repeat deficit, it then reroutes **81% of encountered adjacent ciphertext equalities** by changing the second rune to the following GP index. This introduces **363, 385, and 362 corrupted ciphertext positions** under the global, word, and page policies. Without using the true seeds, the same held-out inference reconstructs respectively **6/6, 6/6, and 319/330 starting rune seeds**, and the held-out plaintext IoC returns to the GP-English band. Thus the attack has positive-control sensitivity despite this explicitly modeled anti-doublet corruption.

The intended baseline is the GP register of the supplied LP1 translations, with its known editorial noise and transcription ambiguities. Other languages or sharply altered textual registers can change recoverability. The positive control is one deterministic collision-rerouting rule, not every possible encryption-dependent repair mechanism.

## Consequences and next direction

A simple additive six-state stream generated by the **3301-residue lag-six recurrence**, whether global, shared across words, or independently restarted at each page, does **not** explain the unsolved manuscript under the declared English-like register and tested anti-doublet tolerance. The affine echo therefore should **not** be promoted into a recovered keystream solely because its intercept equals 3301 modulo 29.

This experiment does not exclude a ciphertext-conditioned sparse rewrite, variable-length insertion or deletion, a stateful non-additive cipher, a six-state recurrence with unmodeled changing coefficients, arbitrary word-specific secret starting states, or unknown external keying. The source anomaly remains real under the published conditional test but still lacks a mechanism producing recoverable plaintext. Future work should seek a **predictive location/key-consumption rule** for its sparse matches instead of repeating searches over starting values of the fixed 168-period recurrence.
