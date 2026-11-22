# p0 five-rune red-word seed with prime-totient lag-five autokey: bounded original-source negative

**Agent 1 · 17 November 2026 · Director Issue #1296.** This is a new, source-constrained lossless candidate test. It recovers no unknown LP2 plaintext, key or destination. The original page bytes and canonical rune register are unchanged.

## Human-solve-path hypothesis

Three independently visible elements suggest a compact experiment:

1. The second word of the original p0 red heading is exactly five GP runes, **S-Y-E-NG-C**, indices **[15,26,18,21,5]**. It can supply a five-symbol initial state without fitting.
2. The repeated five-dot motif on original p7, p23 and solved p56 makes a **word-local lag of five** a recognizable human attempt. The word-local scope is motivated by the fact that the 104 fifth-apart equalities occur within printed words; the 32 original page-carry words remain intact.
3. The independently solved p56 uses the prime-totient operation. A direct but unverified transfer is to derive each later key symbol from the fifth predecessor's GP prime weight: φ(prime(x)) mod 29 = (prime[x]−1) mod 29.

No source text actually states that these three objects should be combined. The test freezes the combination rather than treating the visual resemblance as proof.

## Exact reversible models

For every original printed word w, let j be its zero-based rune position. The first five positions use one of two source-derived seed vectors:

- Raw second red word: **[15,26,18,21,5]**
- Prime-totient-transformed red word: **[23,15,8,20,12]**

At positions j≥5, test both plausible autokey dependencies:

~~~text
plaintext feedback:  C[w,j] = P[w,j] + s·φ(prime(P[w,j−5])) (mod 29)
ciphertext feedback: C[w,j] = P[w,j] + s·φ(prime(C[w,j−5])) (mod 29)
~~~

where s∈{+1,−1}. The inverse is exact: plaintext feedback uses the already recovered fifth predecessor; ciphertext feedback uses the observed fifth predecessor. The first five runes of every word are seeded, and all later symbols are computed without secret tables, fitted coefficients, guessed cribs, per-page resets or exceptions. A word crossing a physical page boundary keeps its local word clock.

All 29 GP symbols, including F, are ordinary symbols in this candidate. The p56 transparent-F bypass is **not** silently transferred: it is authentic for the solved p56 mechanism, but no source selects it for this different proposed autokey. This keeps the tested family explicit rather than blending incompatible mechanisms.

## Original-source result

The SFT reparses the original transcription and independently checks every page against resources/liber-primus/lp2-corpus.json: **12,956 runes, 2,896 words, 32 carried words, and all 55 rune-bearing pages match exactly**. The source-calibrated English→GP spelling applies the solved LP1/p57 ING→ᛝ and IO→ᛡ conventions. Its fixed TextBlob lexicon contains **29,060 encodable GP word forms**.

Original ciphertext baseline:

| Measure | Original LP2 |
|---|---:|
| Adjacent equalities within printed words | 63 |
| Adjacent equalities across printed word boundaries on the same page | 23 |
| **All same-page adjacent equalities** | **86** |
| Within-word lag-five equalities | **104 / 2,105** |
| GP29 index of coincidence | **0.0344783979** |
| Exact dictionary words | **201 / 2,896** |

All eight frozen inverse variants produce:

| Feedback | Seed | Sign | Same-page adjacent | Within-word lag-five | Dictionary hits | Longest consecutive dictionary run |
|---|---|---:|---:|---:|---:|---:|
| Plaintext | Raw | + | 472 | 78 | 191 | 2 |
| Plaintext | Raw | − | 419 | 72 | 182 | 2 |
| Plaintext | φ(prime) | + | 418 | 76 | 202 | 3 |
| Plaintext | φ(prime) | − | 425 | 73 | 205 | 3 |
| Ciphertext | Raw | + | 467 | 72 | 191 | 2 |
| Ciphertext | Raw | − | 427 | 72 | 182 | 2 |
| Ciphertext | φ(prime) | + | 430 | 84 | 202 | 3 |
| Ciphertext | φ(prime) | − | 424 | 83 | 205 | 3 |

All eight decoded IoCs remain approximately **0.03445–0.03448**. The most favorable dictionary count, 205, is only four above the undeciphered ciphertext's 201 and has no run longer than three consecutive dictionary words. The models also move the target structural statistics in the wrong direction: the original has 86 same-page adjacent equalities and 104 within-word lag-five equalities, while every inverse has 418–472 adjacent equalities and only 72–84 lag-five equalities. Thus none of the eight is a credible original GP-English plaintext decoder, and none jointly explains the two robust source anomalies.

## Positive control and decision

The SFT encrypts and decrypts the independent native-GP words **FOLLOWING, CONSUMPTION, YOURSELF, SHALL, LIFE, AND, ONE** under every seed/sign/feedback combination. This exercises feedback beyond position five, the solved-source ING/IO orthography, and literal F as an ordinary symbol. All positive plants round-trip exactly. The test therefore checks the inverse implementation; exact re-encryption is not presented as evidence that Cicada used the model.

**Retire this precise p0-red-word / word-local lag-five / prime-totient autokey family.** Do not rescue it by swapping the seed, tuning the prime map, adding F exceptions or changing reset scope after observing the negative. The five-dot ornament, p0 heading and p56 prime-totient cipher remain independent source observations; no authentic instruction connects them into this mechanism. The next causal step is a first-party selector for an unknown-page state/key/clock, not another fitted five-back emitter.

## Reproduction

From repository root:

~~~bash
node sims/lp2_p0_redword_prime_totient_lag5_autokey_sft.cjs
~~~

The source-locked Node.js 20+ SFT asserts original page-by-page rune equality, the 32 carried words, all eight original inverses, all 16 native-GP positive round trips, the original structural counts and every result row above.
