# LP2 p15 Fibonacci-prime spiral as a GF29 multiplicative-feedback key

**Original-source decision, Agent 1, 13 November 2026.** A reversible, source-derived attempt to decipher the **entire 1,744-rune original pp16–22 continuation** of the numerical p15 page fails to produce recognizable GP29 plaintext. It tests a genuinely different nonlinear step rule from earlier additive-pad / Hill / LFSR attacks. No unknown Liber Primus plaintext, author-specified key, cipher identification or destination is recovered.

## Human-visible source and motivation

Physical LP2 p15, archive `32.jpg`, prints a red **3299** in its 4×4 numbered spiral. The already-established exact generator, including all 16 original printed values, is `N_j = abs(3301 - prime(F_j + 1))`, where `F_j=[0,1,2,3,5,...,987]` is the distinct Fibonacci sequence, `prime(1)=2`, and `j=0..15` advances clockwise from the red cell. The 16 consecutive extracted prime values are

`[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]`.

The solved terminal p57 *PARABLE* describes emergence through shedding a circumference. Independently, the original unknown ciphertext has an unusual **scarcity of equal adjacent runes**. That motivates an invertible **multiplicative ciphertext-feedback** alternative to the previous source-prime additive tests, whose plaintext symbol **EA (GP index 28)** becomes a zero ciphertext step. The red 4×4 spiral supplies 16 explicit numerical keys with no arbitrary secret words.

The principal objection is that the source never actually instructs this feedback equation, a period-16 reset or the EA special case. The operation is a fixed, plausible human experiment rather than an authenticated 2014 decipherment rule.

## Frozen exact cipher and original interval

Represent each original source rune by its canonical zero-based GP29 index. Let `c_0` be the unchanged first rune of p16, and for every following rune use this exact reversible law:

`c_(i+1) = c_i + k_(i mod 16) * (p_i + 1) (mod 29)`

`p_i = (c_(i+1) - c_i) * k_(i mod 16)^(-1) - 1 (mod 29)`

The multiplication is ordinary GF29 multiplication and requires each `k` to be nonzero modulo29. All 16 extracted key residues are indeed nonzero for each chosen register. The 16-position clock starts at the first **transition** on original p16, continues uninterrupted across the seven printed pages through p22 and is never reselected by decoded language. Exactly **1,743** plaintext positions are generated after the original p16 initial rune. All original word, punctuation and image bytes are left unchanged. The original p15 title and text are not silently joined to this separately declared continuation.

Only three independently page-motivated 16-value registers are tested: the generated primes, those primes' Euler totients `prime-1`, and the sixteen printed absolute differences from 3301. Forward spiral order is primary; full reversal is the sole spatial sensitivity check, giving **six** frozen models. There is no fitted phase, key seed, per-page reset, skip mask, secret outer permutation, English scorer, or chosen word boundary.

## Original result and exact positive checks

| Source key, 16-step clock | Reading direction | Recovered 1,743-rune GP29 IoC |
| --- | --- | ---: |
| Fibonacci-indexed prime values | Spiral forward | **0.0354338463** |
| Fibonacci-indexed prime values | Reverse | **0.0356018135** |
| Successive prime totients | Spiral forward | **0.0355010332** |
| Successive prime totients | Reverse | **0.0356275026** |
| Sixteen printed absolute values | Spiral forward | **0.0355313331** |
| Sixteen printed absolute values | Reverse | **0.0354839071** |

The full original p16–22 source (1,744 ciphertext runes) has GP29 IoC **0.0345095980**. The independent **95-rune actual solved p57 clear-GP control** has IoC **0.0627099664**. All six candidate inversions remain near the uniform GF29 baseline **1/29 ≈ 0.03448276**, with no sustained readable original-language passage. For the primary generated-prime order, the first 60 decrypted GP graphemes are `TNCGIAMMCINCFWLEOARBIEGYLAEXNGYPWIALOFOEWWXJIAPIOIPMEAEEXWREONLWPDWY`, an ungrammatical opening. All six candidates force precisely **10 EA** output markers at the ten original adjacent-equal transitions, an algebraic property of the *hypothesis* rather than recovered authentic EA symbols.

For each of the six independently fixed keys, the reproducer uses actual solved p57 GP rune indices, repeated to fill a **1,743-rune authentic-native plant**. The same complete encryption/decryption pair recovers **1,743/1,743** planted runes per model, **10,458/10,458** combined. All six original-cipher inverses reencrypt the exact **1,744/1,744** original input including its unchanged initial register, **10,464/10,464** combined. These round trips validate invertibility only; the poor original language match is the negative evidence.

## Decision and scope

Reject these **six exact source-16-key multiplicative-feedback decoders** on the p16–22 original continuation as direct GP-native plaintext inverses. The wider feedback family, arbitrary hidden keystreams, a different state transition, other starting pages, non-GP plaintext, and unknown historical source material remain untested. In particular, no evidence has established that the 2014 author intended the EA step-zero mechanism.

This result does not reopen earlier periodic additive/F-transparent and source-16 Hill failures: the multiplicative predecessor-step operation has a separate deterministic inverse and gives a fresh bounded original-cipher result. Further modification of this particular 16-key formula would require a new independently visible selector, especially before searching more phases or key transformations.

**Exact reproducer:** [`sims/lp2_p15_fibonacci_feedback_prime16_sft.cjs`](../sims/lp2_p15_fibonacci_feedback_prime16_sft.cjs); source inputs [p15 spiral mechanism](../results/lp2-p15-fibonacci-prime-spiral.md), [original GP29 corpus](../resources/liber-primus/lp2-corpus.json), original scan `resources/liber-primus/32.jpg`.
