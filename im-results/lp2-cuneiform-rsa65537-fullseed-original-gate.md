# The cuneiform primes and Cicada's RSA-65537 exponent: complete unknown-state inversion

**Agent 31, 15 November 2026. Status:** an original-cipher, all-seed finite-family exclusion with a successful original solved-plaintext plant. This identifies **no authentic LP2 decryption**, plaintext, secret key, or destination. It differs mathematically from prior modular-squaring tests; it should not be expanded into arbitrary exponent/generator sweeps without an independent source instruction.

## The route and its missing premise

The original LP2 pp33–39 visibly encode the primes **1033 and 3301** in cuneiform-like sexagesimal notation ([source reading](issue344-cuneiform-historical-template-gate.md)). Both are factors of the small, exactly known composite **N=3,409,933**. Cicada's authenticated public OpenPGP RSA key uses the ordinary public exponent **e=65537**, independently documented by [the public-key analysis](grid-rsa-factor-test.md). The historical use of RSA makes exponentiation a motivated candidate to turn the pair of printed primes into key material.

**Critical unproved step:** neither the manuscript nor a signed instruction says to multiply these two primes, use a repeatedly exponentiated state as the LP2 key, reduce each state modulo 29, or add that key to the runes. The following is a *fully defined candidate inverse*, never an attribution of that cipher to Cicada. A hit would identify a seed without tuning the plaintext.

For **every** state \`0≤x<N\`, define \`next(x)=x^65537 mod N\`, \`K(x)=x mod29\`. The source-original cipher register is direct Gematria Primus indices \`C_i\`, with both algebraic key directions \`C_i=P_i±K(x_i) (mod29)\`. The prime pair is squarefree, and 65537 is coprime to \`lcm(1032,3300)=283800\`, so \`next\` is a **permutation** of the state ring. The source has 12,956 unchanged GP29 runes from p0–55, with 83 genuine printed one-rune words.

## Two independent exhaustive original-cipher consumers

**Uninterrupted glyph clock.** Every rune advances the RSA state exactly once. The first eight source-verified singletons lie at 0-based global glyph offsets **[176,244,350,530,644,792,967,1025]**, with observed indices **[28,15,9,1,0,21,8,7]**. Unchanged English printed word boundaries restrict each to exactly **A, I or O**, GP29 **[24,10,3]**. There is no choice of those words fitted into a source passage: a seed survives if it satisfies *any* of the three at each site. The state at a distant position is calculated **exactly** by \`x^(65537^i)\` modulo each prime and recombined by CRT, including nonunit and zero initial states; **all 3,409,933 seeds** are tested.

| Original singleton count | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Surviving seeds, plus | 352,752 | 36,244 | 3,773 | 363 | 51 | 4 | **0** | 0 |
| Surviving seeds, minus | 352,752 | 36,201 | 3,792 | 383 | 53 | 7 | 1 | **0** |

Under this uninterrupted clock there is **no matching initial seed for either sign**, without a vocabulary score, guessed seed, ciphertext fit, or library-bound key trial.

**The authentic solved-p56 F-bypass rule.** Independently grant the more permissive rule seen in actual solved LP2 p56: a plaintext F(index0) appears as unencrypted ciphertext F and does **not advance the key**. At each ciphertext F, retain **both** legal inverses: literal F and non-F ordinary encrypted output when compatible. Every initial RSA state and every such history is propagated exactly. This is a distinct cipher assumption from the uninterrupted case, and does *not* presuppose the original A/I/O word register.

| Source-original checkpoint (0-based rune offset) | 1,000 | 2,000 | 5,000 | 10,000 | 12,955 |
|---|---:|---:|---:|---:|---:|
| Active RSA states, plus | 4 | 3 | 3 | 3 | **3** |
| Active RSA states, minus | 11 | 3 | 3 | 3 | **3** |

For **both signs**, the exact terminal states are **{0,637362,1506115}**. These are **degenerate zero-keystream states**: \`next(0)=0\`, \`next(637362)=1506115\`, \`next(1506115)=637362\`, and all three residues are zero modulo 29. Since the RSA state transition is a permutation, *no different initial state can enter these fixed/2-cycle states*. All surviving paths therefore encode \`P_i=C_i\` for every original rune, which remains the original uniform-looking unreadable ciphertext (GP IoC **0.03447839786450569**). This is a complete all-state result within the specified model, rather than a language-selected weak-key candidate.

## Checks and decision

The self-contained [CommonJS Node22 SFT](../sims/lp2_cuneiform_rsa65537_fullseed_original_sft.cjs) reads the checked-in original numerical GP transcription and asserts the original rune count, eight singleton glyphs, all RSA/CRT survivor counts, the three exact terminal states, the zero-key two-cycle, and the source IoC. It independently builds eight A/I/O singleton ciphertexts under hidden original state3299 and detects the real state with the same unknown-seed sieve. It additionally encrypts **two repetitions of authentic solved p57 (190 runes)** under the authentic plaintext-F bypass and unknown initial seed3299, then confirms that the exact all-state inverse retains the genuine terminal state for **both key directions**. No manuscript plaintext is silently inserted into the unknown original pages.

**Windows Node22 [CI run 43776070505](https://github.com/FlareZ123/liber-primus/actions/runs/43776070505) passed** the complete original and planted tests.

**Decision:** this particular source-composed RSA-state additive pad cannot recover English plaintext with authentic word lengths under the uninterrupted clock, and its exact solved-p56 F-bypass transfer leaves only vacuous original-cipher identity outputs after exhausting every seed. This says nothing about cryptographic use of the printed primes as RSA *factors* for an independently selected byte message, a different exponent and state operation, a nonlinear receiver, transformed word segmentation, a different source language, or an unavailable historical key. The core unsolved need is still a **creator-selected receiver and initial state** or authentic unknown plaintext. A new test should identify that source instruction before multiplying free parameters.
