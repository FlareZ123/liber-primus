# The p55 terminal moth crib does not support a stationary quadratic GP29 keystream

**Agent 7, 15 November 2026. Original-ciphertext exact linear-algebra test; no decrypted unknown-page plaintext or key.**

## Source-selected operand, conditional interpretation

LP1 p05 visibly prints the moth and the text **THE TOTIENT FUNCTION IS SACRED / ALL THINGS SHOULD BE ENCRYPTED**. The original repeated moth appears in LP2 p53/p55. The final seven complete printed words of original LP2 p55 have the GP-rune lengths **2, 7, 7, 2, 6, 3, 3**. Those lengths match the **30-rune** source prefix **THE TOTIENT FUNCTION IS SACRED ALL THINGS** using the known solved-page GP orthography, with single runes for *ING* and *IO*. This is a plausible human crib; its plaintext status is **unverified**. It may be a chance source-phrase match.

The source p05 also supplies a 5×5 magic square. Instead of selecting particular numeric cells as key coefficients, the experiment grants every possible coefficient of **every stationary, total-degree-at-most-two polynomial recurrence over GF(29)** with memory 1, 2, 3, 4 or 5. This deliberately generous class includes both reversible and nonreversible recurrences. The first d key symbols are completely unrestricted. A proposed p55 decryption remains a hypothesis even if its required key happens to fit such a generator.

For original p55 ciphertext C at local rune positions **46–75**, generate the source phrase P in authentic GP29 spelling. Check both additive key definitions K=C−P and K=C+P (mod29). For order d, construct the exact linear system for the secret polynomial coefficients:

`K[t] = a_0 + sum(a_i K[t−i]) + sum(b_ij K[t−i] K[t−j]) (mod29)` for `t>=d`, `1<=i<=j<=d`.

The full secret coefficient counts are **3, 6, 10, 15 and 21**. There are **29, 28, 27, 26 and 25** original constraints, respectively. Exact Gaussian elimination over GF(29) determines whether *any* coefficients can fit. This is a certificate across the entire coefficient family rather than a guessed-key sweep.

## Results on original ciphertext

| Required key | Order | Secret coefficients | Coefficient rank | Augmented rank | Feasible |
| --- | ---: | ---: | ---: | ---: | --- |
| C−P | 1 | 3 | 3 | 4 | No |
| C−P | 2 | 6 | 6 | 7 | No |
| C−P | 3 | 10 | 10 | 11 | No |
| C−P | 4 | 15 | 15 | 16 | No |
| C−P | 5 | 21 | 21 | 22 | No |
| C+P | 1 | 3 | 3 | 4 | No |
| C+P | 2 | 6 | 6 | 7 | No |
| C+P | 3 | 10 | 10 | 11 | No |
| C+P | 4 | 15 | 15 | 16 | No |
| C+P | 5 | 21 | 21 | 22 | No |

Every augmented system has rank exactly one higher than its coefficient matrix. Consequently, all ten exact candidate inverse-key models are impossible on the **unchanged original 30 rune ciphertext**, regardless of their secret polynomial coefficients and initial key states. The SFT independently plants a reversible nonlinear five-state polynomial generator `K_t=1+K_(t−5)+2K_(t−1)^2 (mod29)`, verifies consistency and reconstructs the planted tape backward.

[Original-source, read-only Node22 CommonJS reproduction](../sims/lp2_moth_terminal30_quadratic_state_sft.cjs).

## Decision and next causal step

This rejects the **bounded stationary quadratic-generator interpretation** of a source-linked but *unconfirmed* 30-rune crib. It does **not** disprove that plaintext phrase, general high-degree or stateful ciphers, an external key, or any other unknown-page explanation. The repeated moth and 5×5 square remain original source motifs; neither selects this polynomial family as the author's intended operation. Further coefficient fitting would have no causal justification without a new independent cipher instruction or authentic key material.

The more decisive research goal is still a source-specified reversible decoder yielding readable original p55 plaintext, with a testable model for all 76 runes. The [authoritative current-state synthesis](../results/README.md) and [previous p55 terminal crib gate](lp2-p55-moth-p5-terminal-sevenword-crib.md) remain unchanged.
