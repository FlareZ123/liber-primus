# p36 Q238 derivative composed with the solved-page prime-totient F transducer

**13 November 2026, Agent29. Evidence: exact original-cipher model-family obstruction. No unknown LP2 plaintext or true key recovered.**

## Why this two-stage proposal was worth one test

The physical pp49–51 table has 256 base60 tokens. Its previously established GF(29) factorization contains a degree-238 residual polynomial, Q238. The separately printed physical p36 has exactly **238 GP29 runes**. Direct subtraction of the formal derivative of Q238 previously improved the p36 trigram score compared with the original, although all 50 word outputs remained unreadable ([first-layer report](lp2-p36-q238-derivative-key-original-gate.md)). This experiment adds the **verified cipher of nearby solved p56**, consecutive-prime totient, preserving its distinctive selective literal-F bypass. It makes a source-motivated, parameter-free two-stage candidate whose failure can be decisively tested.

This composition is a conditional hypothesis. The manuscript supplies no instruction to apply a polynomial derivative as a cipher key, nor to reuse p56's cipher on p36.

For source byte b[i], construct the monic GF29 polynomial with ascending coefficients given by the reversed, negated original 256 row-major bytes, omitting its zero leading coefficient. Remove the original small degree-16 factors to obtain Q238. With ascending coefficients q[j], set derivative D[i]=(i+1)q[i+1] mod29 for i=0..237. The first stage transforms original p36 rune c[i] to intermediate I[i]=(c[i]+s D[i]) mod29, where s is −1, +1 or 0 (the unchanged-page control).

For the second stage, start the prime clock at the first prime 2, exactly as on solved p56. At each non-F plaintext rune, use key phi(prime)=prime−1 mod29 and consume one prime. A **plaintext F/index0 must emit visible ciphertext F/index0 without consuming a prime**. A visible ciphertext F might instead result from a non-F plaintext under ordinary shifting. Both shift signs are tested. Exhaustive dynamic programming retains every possible prime-clock state compatible with both interpretations of an observed F; no arbitrary skip mask is chosen.

## Exact original-cipher result

All six original-source configurations become mathematically impossible while reading p36. The earliest position at which **no prime-clock state remains valid** is:

| Derivative sign | Prime decode sign | First impossible source rune, zero-based | Intermediate F count |
| ---: | ---: | ---: | ---: |
| 0 (no derivative) | −1 | 56 | 8 |
| 0 (no derivative) | +1 | 103 | 8 |
| −1 (source-best derivative) | **−1 (p56 sign)** | **1** | 11 |
| −1 | +1 | 84 | 11 |
| +1 | −1 | 65 | 5 |
| +1 | +1 | 24 | 5 |

The source-first proposed composition fails at the **second rune**. The obstruction is independent of language scoring or plaintext priors. It covers the exact p56 literal-F transducer with an initial prime clock, either additive sign, and any physically compatible choice of which intermediate ciphertext F symbols bypass the key. It does not exclude other cipher state machines or a separately supplied additional key.

Dropping p56's literal-F requirement and consuming 238 primes unconditionally gives the fixed double-subtraction result GP IoC **0.0356345069673439**, near the uniform 1/29 baseline and without apparent plaintext. That diagnostic is weaker than the exact impossibility check.

## Positive and historical controls

The implementation reproduces the known solved p56 beginning, **AN END WITHIN THE DEEP WEB THERE EXISTS A**, from the authentic 85 visible ciphertext runes, consuming 84 primes and bypassing the one authentic F at local position56. For an independent native-GP positive, it repeats the real solved p57 source until 238 runes are available, encrypts under the *exact* selective-F rule, and adds the same original Q238 derivative key. The inverse recovers **238/238** planted plaintext symbols, and the original prime-clock state remains reachable after every position.

These controls establish that the source factorization, prime sequence, actual F rule and arithmetic decoder work as specified. The failed p36 original cannot be explained by their implementation.

**Decision:** discard the particular Q238 derivative plus solved-p56 totient two-stage inverse. The earlier relative derivative language-score gain remains exploratory. Any proposed replacement layer now requires an independent original clue and a decipherable held-out rune sequence.

**Reproduce:** [single CommonJS source test](../sims/lp2_p36_q238_derivative_totient_ftransducer_sft.cjs), successful [existing p36 manual CI run 43394782188](https://github.com/FlareZ123/liber-primus/actions/runs/43394782188), unchanged table SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.
