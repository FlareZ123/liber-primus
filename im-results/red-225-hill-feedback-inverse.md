# Source-red 15×15 Hill and feedback inversions on original LP2

**Agent 3 · 10 November 2026. Bounded original-cipher negative, with exact positive controls.** No unknown LP2 plaintext, key, confirmed cipher architecture, or destination was recovered.

## Source-constrained hypothesis and reversible inverse

The [ink annotations](../resources/liber-primus/lp2-ink-annotations.json) identify **225** red runes across the complete 58-page LP2. Read them in physical-page, span, and local-rune order. Because 225 = 15², a direct hypothesis is a **15×15 Hill matrix over F29**, the native 29-symbol GP field. The first 225 red runes are the complete matrix; no ciphertext-derived key fitting occurs.

Two symbol coordinates were tested: GP rune index 0–28, and GP prime associated with that rune reduced modulo 29. Each matrix was read row-major or column-major. The four resulting 15×15 matrices are **all invertible modulo 29**, verified by exact Gaussian elimination.

For column vectors of 15 symbols, define M from the chosen source reading, block ciphertext C, previous block ciphertext Cprev, block plaintext P and previous plaintext Pprev. All arithmetic is in F29. We tested four exactly invertible, familiar variants:

| Mode | Assumed forward cipher | Exact inverse |
| --- | --- | --- |
| ECB | C = M P | P = M⁻¹ C |
| CBC | C = M (P + Cprev) | P = M⁻¹ C − Cprev |
| CFB | C = P + M Cprev | P = C − M Cprev |
| PCBC | C = M (P + Cprev + Pprev) | P = M⁻¹ C − Cprev − Pprev |

Initial block states are zero. Both a single continuous 12,956-rune unsolved-book stream and 55 physically page-reset streams were tested. For each, all 15 block phases 0–14 were admitted. Incomplete trailing blocks are ignored, not silently padded. This yields **2 encodings × 2 orientations × 4 modes × 2 clocks × 15 phases = 480** direct original-cipher inversions.

## Actual ciphertext outcomes

Original unsolved LP2 is **12,956 runes**, raw index of coincidence **0.0344783978645**, near the uniform 1/29 baseline. For each candidate we computed the decoded rune IoC over the full decodable length and the first and second half of that same decoded stream. No key is trained. The candidate can be selected using the first-half score; the second half is then an unchanged test.

| Frozen selection | Encoding, orientation, mode, clock, phase | Training IoC | Untouched heldout IoC |
| --- | --- | ---: | ---: |
| Best among all 480 by first-half IoC | index, columns, PCBC, continuous book, 13 | **0.03463781558** | **0.03446471097** |

The **maximum heldout IoC over all 480**, selected on that very same heldout data and therefore not an independent validation, is only **0.03463352919** (index, rows, CBC, per-page, phase 7). The externally supplied Shakespeare GP-English reference has IoC **0.05996568934**. A meaningful direct recovery of ordinary English-like GP symbols would have a large coincidence concentration even if their rune labels had been globally permuted.

All **32 mode × matrix × clock** cases at phase zero were also encrypted from 12,645–12,945 GP-English source runes, with the exact inverse applied to their genuine simulated ciphertexts. Every **symbol** was recovered (100% exact roundtrip, no error repair), and source-control IoC ranged **0.06065112–0.06070387**. These tests establish that the implementation can recover English when the declared reversible mechanism is actually used. They cannot establish the true LP2 key or architecture.

**Bounded conclusion:** none of these 480 source-determined red-Hill ECB/CBC/CFB/PCBC implementations produces English-like GP plaintext from the original unsolved text. We did not test nonlinear permutations, arbitrary nonzero IVs, state changes inside blocks, unknown symbol embeddings, other matrix sizes or a different plaintext register. The 225-red equality is a clue-selection hypothesis, not a proven instruction to form a matrix. No plaintext interpretation is claimed from a rank or numeric coincidence.

## Reproduction

- Inputs: [normalized 58-page corpus](../resources/liber-primus/lp2-corpus.json), [original-ink transcription annotations](../resources/liber-primus/lp2-ink-annotations.json), [GP-English source control](../resources/control/shakespeare_first300k.txt).
- Source: [reversible exact 480-case benchmark](../sims/red_225_hill_feedback_inverse.cjs).
- Successful GitHub Actions [manual CI run **42793461393**](https://github.com/FlareZ123/liber-primus/actions/runs/42793461393), with the complete diagnostic JSON and asserted 32 planted exact roundtrips.
- Manual-only workflow: [red-225-hill-feedback-manual.yml](../.github/workflows/red-225-hill-feedback-manual.yml). No per-commit trigger.

Further red-clue work should seek an independently constrained, **nonlinear** key-generation or state mechanism that directly predicts untouched original LP2 plaintext. Repeating direct red-symbol pad or matrix screens with unconstrained configurations is unlikely to be productive.
