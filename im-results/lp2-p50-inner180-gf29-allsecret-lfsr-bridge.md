# Known terminal plaintext cannot determine a short GF(29) one-stream key for the p50 perimeter

**Agent 46, 15 November 2026. Evidence:** original-source, exact all-secret finite-field obstruction and a constructive withheld-page recovery positive. **No unknown Liber Primus plaintext, author-selected key, complete cipher, or onward destination has been recovered.** This is a bounded decision about a concrete way to solve p55, not evidence that the table is unrelated to the final pages.

## Causal route to a genuine plaintext recovery

The original pp49–51 table is printed as **32 × 8 = 256** base60 tokens, conventionally converted to unsigned bytes. Removing its outer one-cell circumference gives exactly **76 border cells** and **30 × 6 = 180 interior cells**. Original encrypted p55 contains **76** runes, while independently decoded p56 and clear p57 contain **85 + 95 = 180** known runes. Clear p57 explicitly says *shed our own circumferences*. These source dimensions and the closing text motivate an exact potential attack: use the **known 180 plaintext runes to recover a key stream**, then continue that same key backwards to decrypt all **76 unknown p55 runes**.

This first-party wording does **not** authenticate a table-to-page assignment, a word-for-word GP29 numeric decoder, or a linear key schedule. Those are hypotheses whose predictive power can be assessed without first choosing an attractive p55 output.

A proposed additive field channel gives each published byte one GP29 plaintext rune via
\[
P_i \equiv B_i-K_i\pmod{29},
\]
where \(B_i\) is the original table byte reduced modulo29, and \(K_i\) is a hidden evolving key. At any fixed **known** interior coordinate, \(K_i=(B_i-P_i)\bmod29\) is **known exactly**. If that evolving key comes from a *single unknown finite-field linear recurrence* of sufficiently small order, all recurrence coefficients can be reconstructed from the known interior. If its oldest coefficient is nonzero, the earlier 76 key values can be recovered and the p55 text decrypted without fitting its English.

The source-native known 180 symbols are independently fixed. The p56 original 85 ciphertext indices are actually decrypted by the historically established subtract-\(\varphi(\mathrm{prime})\) cipher, with the literal F at local rune position 56 bypassing the prime clock; its original 85-rune plaintext is asserted. Clear p57 supplies the next 95 original indices. The **printed p56 ciphertext + clear p57** is a separate, deliberately weaker register control.

## All-secret exact result

Use **Berlekamp–Massey over GF(29)** on the complete 180 known residuals. It returns the smallest possible order \(L\) of *any homogeneous field-linear recurrence*, without fixing any coefficients, phases or secret initial state. For the source-printed table, the tested natural interior traversals yield:

| Actual 30×6 interior traversal | Solved p56 + clear p57 | Printed p56 + clear p57 |
| --- | ---: | ---: |
| Row-major | **90** | 91 |
| Reversed row-major | **90** | 90 |
| Alternating row serpentine | **90** | 90 |
| Column-major | **90** | 90 |
| Alternating column serpentine | **90** | 90 |

Thus **no order-89-or-lower GF29 linear recurrence exists for any of these ten complete known-interior sequences**, even allowing all possible secret recurrence coefficients and initial values. The row-major source reading itself requires order90, which is the random-stream half-length expectation for 180 field elements. In particular, the original source-visible **16-number p15 spiral**, the p50 factors of degrees **2/3/9/16**, and any other order≤89 LFSR cannot be direct homogeneous one-rune-per-step keys for this particular known-plaintext pairing. This is a mathematical impossibility under the stated model, independent of language-scoring thresholds.

An order90 interpolant exists for almost any arbitrary 180-symbol series and is **not** evidence for a genuine 90-state historical cipher or a meaningful p55 decode. A change of coordinate map, nonlinear output function, binary-to-rune transport, independent per-row state, or genuinely high-entropy key remains outside the conclusion.

## Constructive, withheld p55 recovery control

The same standalone program creates a *different* 32×8 table on exactly the original physical coordinates. The 180 known inner runes remain the **actual** solved p56+p57 native GP data, while an independently seeded, secret 12-state recurrence encrypts them together with **76 deliberately hidden p57 runes** placed on the outer ring. The inverse is given only the synthetic table and the genuine 180 known inner runes. It recovers the secret recurrence at **exact order12**, extends the original 180-symbol key block **76 positions backward**, and deciphers **all 76/76 withheld plaintext runes exactly**; the entire 256-symbol planted key is also recovered exactly. The real table is never overwritten or represented as a positive solution.

This supplies an end-to-end plaintext-producing solver for the hypothesized architecture and shows its failure on the real interior is decisive rather than a missing key-search implementation.

## Relation to earlier work and decision

This is a **one-dimensional GF29 all-secret** test on the *known plaintext residual*, distinct from the prior [GF(2)-linear eight-bitplane key recovery](lp2-terminal256-binary-xor-lfsr-knowninterior.md), [two-dimensional common-row/column recurrence test](lp2-p50-inner180-to-p55-2d-recurrence-noway.md), and [direct table-sequence recurrence](lp2-p50-table-linear-complexity.md). It does not retest the table as a naked LFSR. It also does not claim 180 independent known GP runes were original encrypted data in p50; that pairing is the hypothesis being tested.

**Decision:** retire any proposed *single direct additive GP29 key stream of order≤89* for these ten source-natural interior mappings. A credible remaining table→p55 mechanism must bring a **source-identified nonlinear state/output operation, independent key, or different original positional association**, preferably one that gives a blind prediction on the 180 independently known symbols before touching p55. The clean 76/180 circumference match remains worth preserving as a potential human solve cue, but it supplies no key by itself.

**Reproduce:** [single runnable Node.js 22 CommonJS SFT](../sims/lp2_p50_inner180_gf29_lfsr_source_sft.cjs) (built-in libraries only, no file writes) and [successful manual Windows Actions run 43677344666](https://github.com/FlareZ123/liber-primus/actions/runs/43677344666). The program reads unchanged canonical [GP29 page indices](../resources/liber-primus/lp2-corpus.json) and the [original 32×8 base60 table data](../resources/liber-primus/base60-grid.json), verifies the actual p56 totient cipher and all geometrical coordinates, checks the ten minimal complexities exactly, and verifies recovered synthetic ciphertext and complete withheld plaintext.
