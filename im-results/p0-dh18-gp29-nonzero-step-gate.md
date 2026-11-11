# p0 DH18 and GP29 nonzero-step transport: bounded negative

**Evidence class:** exact arithmetic on original LP2 inputs, plus source-conditioned cryptanalytic tests. This does **not** recover unknown plaintext, authenticate an LP2 key, or establish the intended cipher.

## Decision

The p0 opening supplies a striking, reproducible candidate DH exchange when the signed 2013 worked-example group is reused: a unique 13-rune red-span selector gives private exponent 7, and the first seven-rune black line gives public share 16; with \(p=23,g=5\), the shared value is 18. The value 18 is a primitive root modulo 29, so it naturally orders the 28 nonzero GP29 steps.

That is a useful source-constrained lead, but the signed 2013 source documents a worked DH example, not a rule to transplant its group into LP2 or a cipher that converts GP29 differences into plaintext. The most economical reversible consumers of the resulting 28-cycle, including a dynamic carry interpretation of zero, do not recover language. **Retain the p0 arithmetic as provisional; retire these specific root18 transport consumers.** Do not expand into arbitrary roots, phases, reserved symbols, or clocks without a new source selector.

## Original-source arithmetic

The signed 2013 BASE29/DH/NEXT witness documents \(p=23,g=5\), server exponent 6/public value 8, client exponent 15/public value 19, and shared key 2. The example is independently reproducible:
- \(5^6\bmod23=8\)
- \(5^{15}\bmod23=19\)
- \(19^6\bmod23=8^{15}\bmod23=2\)

The original p0 red span has 13 GP indices:

\[
[15,8,18,3,6,19,27,0,15,26,18,21,5]
\]

Its big-endian BASE29 integer is **5412445423142629857**, with:
- \(N\bmod23=0\)
- \(N\bmod22=7\)
- final digit \(5\)

The first black line after that red span has seven GP indices:

\[
[2,11,6,25,0,11,22]
\]

Its BASE29 integer is **1420123033**, and \(M\bmod23=16\).

There are 18 original red spans in the annotated 58-page corpus. The conjunction \(N\bmod23=0,\ N\bmod22=7,\ \text{last digit}=5\) selects **p0 alone**. Reusing the signed example's \(p=23,g=5\) therefore gives a valid candidate exchange:

\[
A=5^7\bmod23=17,\qquad K=16^7\bmod23=18.
\]

The shared value 18 has multiplicative order 28 modulo 29. These are exact calculations. The LP2 interpretation remains conditional because the historical source does not say to reuse its worked-example parameters on p0.

## Frozen reversible transports

The 12,956-rune original stream has 86 adjacent equalities and 12,869 nonzero differences. For \(D_i=(C_i-C_{i-1})\bmod29\), the natural root18 discrete-log inverse is:

\[
P_i =
\begin{cases}
F & D_i=0\\
1+\log_{18}(D_i)\pmod{28} & D_i\ne0.
\end{cases}
\]

The first rune is carried directly. This maps the 28 nonzero residues bijectively to the 28 non-F GP runes; zero maps to F, motivated only by the historical literal-F skip convention. Two other frozen interpretations were tested:
- the DH private exponent 7 as a constant offset in the 28-cycle;
- a word-reset clock \(K_j=18^{j+7}-1\bmod29\), with the previous ciphertext symbol carried across word boundaries.

A distinct dynamic-zero model interprets \(D_i=0\) as a literal carry of the previous ciphertext rune, and maps nonzero steps by the root18 logarithm relative to that previous symbol. Both zero-offset and exponent-7-offset variants were tested. This avoids assigning all 86 zero events to one fixed plaintext rune.

The source-authenticated DH example's shared key 2 is also a primitive root modulo 29. Its simplest fixed-F, fixed-EA, and dynamic-carry inverses were checked as a historical-key control; the repository already contains broader source-seeded root-2/EA-zero-step and PGL2 tests.

All tested encoders are bijective under their stated rules. The reproducer round-trips the known cleartext p57 and a full-alphabet synthetic GP plant exactly; these positive controls establish implementation correctness, not that the original ciphertext uses the model.

## Original-cipher result

A trigram model is trained on the first 240,000 characters of the pinned Shakespeare control, GP-tokenized word by word; the remaining 60,000 characters are held out. Higher scores are better.

| Frozen inverse | Full-book GP trigram score |
|---|---:|
| Raw original ciphertext | −4.478611 |
| Signed-DH root 2, zero→F | −4.480821 |
| Signed-DH root 2, zero→EA | −4.476500 |
| Signed-DH root 2, dynamic carry | −4.518020 |
| p0-DH root 18, zero→F | −4.477350 |
| p0-DH root 18, exponent-7 offset | −4.461501 |
| p0-DH root 18, word-clock phase 7 | −4.488600 |
| p0-DH root 18, dynamic carry | −4.509008 |
| p0-DH root 18, dynamic carry, offset 7 | −4.505610 |
| Held-out Shakespeare GP control | **−2.362353** |

The root18 outputs also remain ciphertext-like on both original halves (pages 0–27 and 28–55); the exact per-half scores and frequency counts are emitted by the reproducer. The small score fluctuations around raw ciphertext are not language recovery. No candidate produces coherent plaintext or a source-predicted continuation.

## What the 86 doublets do and do not determine

The zero bin identifies a repeated adjacent ciphertext symbol, not its plaintext semantics. A fixed map of the 28 nonzero residues still has \(28! = 304888344611713860501504000000\) possible assignments (about **97.94 bits**) before selecting the zero/escape rule, initial predecessor, key schedule, or reset policy. A primitive root fixes one particular ordering, but the root18 ordering tested here is not selected by the signed source as an LP2 cipher, and its inverse fails the original-language test.

The fixed-special-symbol predecessor-exclusion family already has source-matched equality-capacity negatives across all 29 reserved-symbol choices; the existing word-clock root-15, prime/totient rank-28, variable-register, and polygraphic investigations likewise do not supply a plaintext transport. A dynamic carry is a different zero rule, but the frozen root18 form also fails.

**Minimal missing input:** an original-source instruction that ties a particular nonzero-step ordering to the LP2 stream and specifies what a zero step means (literal symbol, carry, escape, or key pause), together with the initial predecessor and reset/continuity rule. The 86-count statistic and a historical DH worked example do not supply those instructions. No further root/phase sweep is justified.

## Reproduction

From the repository root, run:

\`node sims/lp2_dh18_nonzero_step_transport_gate.cjs\`

Inputs are the unchanged original corpus, transcription and ink annotations, plus the pinned Shakespeare control. The script asserts the p0 selector, both DH calculations, primitive-root orders, all 86 zero transitions, p57 and synthetic round trips, and emits whole-book and disjoint-half language scores.
