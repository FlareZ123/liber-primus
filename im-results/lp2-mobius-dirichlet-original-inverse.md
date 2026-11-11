# Original-source Möbius / Dirichlet inverse of LP2 ciphertext

**Decision (Agent29, 11 November 2026):** Eight finite, clue-motivated **lossless arithmetic inverses** of the entire unaltered **12,956 GP29-rune** unsolved stream do not reveal a native-GP plaintext distribution. They give whole-stream indices of coincidence **0.034470–0.034528**, versus the source ciphertext's **0.034478** and the authentic solved p56 native GP register's **0.070028**. These are original-cipher tests with a known-plaintext positive plant, not newly recovered plaintext or an authentic cipher key.

## Motivated but unproven operation

The historically solved Cicada material visibly says **MOBIUS** near prime and totient language. This could refer to a topological Möbius strip, a geometric transformation, or, distinctly, the number-theoretic **Möbius function and Dirichlet inversion**. The source does **not** instruct using divisor sums as LP2 encryption. The last is nevertheless an exact, natural, low-parameter cipher hypothesis with a human-recognizable inverse, and had not been covered by the repo's separate projective-Möbius matrix and simple totient-pad tests.

On the natural 1-based rune index, encode as the divisor-sum transform

`C(n)=sum(P(d):d|n) mod29`, invert as `P(n)=sum(mu(n/d)*C(d):d|n) mod29`.

Also test the inverse original encoding `C=mu*P` using `P=zeta*C`. Both are reversible over F29. The original ciphertext's extraordinary adjacent-doublet deficit separately motivates one **fixed, simple chain interpretation**, `K(1)=C(1)`, `K(n)=C(n)-C(n-1) mod29`, then apply either divisor inverse to K. There is **no fitted key, alphabet, offset, divisor shift, phase, source permutation, or English crib**. Two natural clocks are compared: continuous book-global rune order and physical-page resets; all printed page boundaries are preserved, including runeless p50. This makes **2 input representations × 2 inverse arithmetic maps × 2 clocks = 8** precisely specified models.

## Untouched LP2 results

| Cipher input | Clock | Arithmetic inverse | Exact GP29 IoC |
| --- | --- | --- | ---: |
| Rune values | Book | Möbius | 0.034479208136 |
| Rune values | Book | Zeta | 0.034517278980 |
| Rune values | Page | Möbius | 0.034489133962 |
| Rune values | Page | Zeta | 0.034480864426 |
| Consecutive differences | Book | Möbius | 0.034501133129 |
| Consecutive differences | Book | Zeta | 0.034528384465 |
| Consecutive differences | Page | Möbius | 0.034470128329 |
| Consecutive differences | Page | Zeta | 0.034500954393 |

Even the maximum is a **near-uniform** 29-rune stream, rather than a natural-language rune register. On the 49 physical pages containing at least 140 runes, the largest page-level IoC under any model is **0.0406754** (p53 under direct book-global zeta), with other maxima also near random. This is incompatible with a direct, independently fixed GP-English plaintext layer under these eight exact models; it cannot reject other languages, encodings or a separate cryptographic layer.

**Authentic native-language positive control:** the exact 85 GP ciphertext runes of solved p56 decrypt by the independently established `phi(prime)=prime-1` cipher with the historically required literal-F interrupt at zero-based offset56. Its true GP-plaintext IoC is **0.0700280112**, even though its actual source spelling includes the runic U/V convention. For each of the four distinct divisor/chain encoder options, first re-encrypt those 85 true plain symbols under the proposed model, then decode them using the exact source implementation. **Every plant recovers 85/85 runes**, across all eight clocked checks. This demonstrates the inverse operations can recover native GP plaintext when their architecture is correct. Neither a roundtrip nor the p56 plaintext is claimed as evidence that LP2 used these architectures.

**Decision:** retire straightforward **GF29 one-based divisor-sum and Möbius-convolution direct GP cipher** and their naturally differenced versions with book/page clocks. The author's intended operation and secret source remain missing. A follow-up on this branch would require a **new original instruction** selecting divisor arithmetic and a specific non-GP intermediate or stateful key architecture; arbitrary Möbius variants or offset sweeps would have no causal path to plaintext.

## Reproduction

Run `node sims/lp2_mobius_dirichlet_inverse_sft.cjs`. It loads the original physical-page corpus, asserts the full 12,956 unknown-rune length and empty p50 slot, builds exact 1-based divisor transforms using F29 arithmetic, checks 85/85 authentic solved-p56 source plants, and asserts all eight untouched original IoC values to 13 decimal places. Its printed JSON is sufficient for independently checking the bounded result.

Original inputs: `resources/liber-primus/lp2-corpus.json`, `sims/solved_cipher_regression.cjs` for the source-specific solved p56 mechanism, and historical Cicada prime/totient/MOBIUS text. The separate geometrical/projective Möbius routes remain entirely unaffected.
