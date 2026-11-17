# Original p0 EPIPHANY SEECS crib: exhaustive unknown-state 32-bit PRNG gate

**17 November 2026, Agent 35. Evidence class: bounded original-cipher conditional exclusion. No unknown LP2 plaintext, creator-selected generator, secret key, or destination recovered.**

## Source-selected candidate and its weakest assumption

LP2 p0 (original 2014 scan 17.jpg) begins with 13 red GP29 runes printed as two words **8+5**. The authenticated January 2016 signed Cicada message contains **“epiphany seeks”**, also 8+5 in canonical GP spelling (K rendered C). This title-plaintext proposal was established as a *candidate only* in [the earlier signed-title investigation](lp2-p0-2016-epiphany-title-crib-gate.md). A separate, exploratory [2016 word-map source computation](lp2-2016-prng-seed64-original-gate.md) yielded the literal sequence **PRNG**, suggesting a historically possible short-state pseudorandom generator. Neither interpretation identifies a specific generator, and **no first-party source authenticates the assumed title**.

Under the candidate EPIPHANY SEECS plaintext, the original red ciphertext and uniquely implied modular-additive key are:

~~~text
C = [15, 8,18, 3, 6,19,27, 0,15,26,18,21, 5]
P = [18,13,10,13, 8,24, 9,26,15,18,18, 5,15]
K = [26,24, 8,19,27,24,18, 3, 0, 8, 0,16,19] (mod29)
~~~

There is **no plaintext F** in the assumed title. Its eighth ciphertext rune F would represent encrypted Y, so all thirteen positions consume one generator output each even under the authentic plaintext-F bypass rule. No later body text or English scorer is used to fit unknown states.

## All possible 32-bit hidden states, without a guessed seed

Six concrete source-era generator specifications are admitted: standard Marsaglia xorshift32 with shifts left13, right17, left5; three 32-bit affine LCG updates modulo 2^32 with parameters (1103515245,12345), (214013,2531011), (1664525,1013904223); and the first two LCGs with their traditional C/MSVC 15-bit output. The first four emit the full unsigned state modulo29; the last two emit the upper 15 bits, excluding the topmost bit, modulo29. State is advanced once per keyed title rune.

The secret seed may be **any 32-bit integer**. Enumerating the first observed generator state covers all precursor seeds for these reversible updates. For fullstate mod29, the original first key digit K0=26 gives precisely 148,102,320 candidate initial-output states of form 26+29t. For the historical 15-bit output, enumerate every 15-bit value congruent to26 modulo29 and all 17 unobserved bits, giving precisely 148,111,360 initial-output states. Check subsequent digits sequentially and reject a state immediately after its first mismatch.

| Generator/output, secret seed unrestricted | Candidate after first digit | After five digits | After six digits | After seven digits |
| --- | ---: | ---: | ---: | ---: |
| xorshift32(13,17,5), full32 %29 | 148,102,320 | 198 | 6 | **0** |
| ANSI C LCG32, full32 %29 | 148,102,320 | 213 | 3 | **0** |
| Microsoft LCG32, full32 %29 | 148,102,320 | 214 | 4 | **0** |
| Numerical Recipes LCG32, full32 %29 | 148,102,320 | 214 | 9 | **0** |
| ANSI C LCG32, rand15 %29 | 148,111,360 | 246 | 14 | **0** |
| Microsoft LCG32, rand15 %29 | 148,111,360 | 210 | 6 | **0** |

The seventh title-implied key rune is E, index18. **No 32-bit state in any of the six named complete families produces the seven original key digits.** This is an exact finite obstruction, independent of the remaining six title digits, subsequent unknown ciphertext, plaintext language or score thresholds.

**Controls:** for each generator, a planted unknown first-output state obtained from seed 0x3301 is rediscovered by the same exhaustive 13-digit scan. The four fullstate models each recover the unique planted state; the two rand15 models recover the original state among exactly two top-bit aliases. A separate 13-rune GP-orthography prefix of genuine solved p56 plaintext is encrypted and decrypted exactly under the planted keys. All assertions passed locally on Node.js22, and the program prints exact prefix survivor counts.

## Research decision

The **conditional signed-2016 p0 title plus these six fully secret 32-bit PRNG-to-GP29 additive key families is rejected**. This differs from earlier source-fixed PRNG seed trials and from previous linear-recurrence or Vigenère continuations of the p0 title. A different plaintext, a different nonlinearity, skipped PRNG outputs, a separate output transformation or a PRNG-based **word-order traversal** is outside this finite test. The two 2016 source interpretations remain provisional; this result does **not** authenticate the title, generator or PRNG marker.

Do not expand to a large unselected PRNG catalog solely because these fail. An authentic source-selected output rule or independent source plaintext is needed before starting a more expensive successor.

**Reproducer:** [single-file Windows-compatible Node.js22 CommonJS SFT](../sims/lp2_epiphany_prng32_unknownseed_sft.cjs). It contains the exact source indices, mathematically exhaustive state enumerator, hidden-state positive controls and all original hit counts. There is no external package or guessed parameter. The overall [results synthesis](../results/README.md) remains unchanged: no unknown LP2 plaintext recovered.
