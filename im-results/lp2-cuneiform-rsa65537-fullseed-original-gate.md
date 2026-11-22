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


## Direct fixed-width GP29 RSA block encoding is incompatible with pp33–39

The preceding all-state test explicitly left open whether the printed cuneiform primes might be RSA factors for a separately selected byte message. A more immediate human-solver test is direct RSA on the cuneiform chapter itself: pp33–39 print **1033** and **3301**; the authenticated Cicada public key supplies **e=65537**; and the chapter contains exactly **1,680** runes, divisible by five. With **N=1033×3301=3,409,933**, the radix bounds are **29⁴=707,281 < N < 29⁵=20,511,149**, so a natural fixed-width GP29 encoding of RSA residues uses five rune digits per ciphertext block (and four-rune plaintext blocks).

The source-order, page-33-aligned partition gives **336** five-rune blocks. A direct RSA ciphertext block must encode an integer c with **0 ≤ c < N**. This necessary condition already fails overwhelmingly:

| Encoding order | Valid residues | Invalid residues | Blocks whose leading digit is 0–4 |
|---|---:|---:|---:|
| Big-endian base29 | **45/336** | 291/336 | 47/336 |
| Little-endian base29 | **56/336** | 280/336 | 59/336 |

The first big-endian block is **[23,12,14,5,0] = 16,572,050**, already greater than N. The first little-endian invalid block begins at rune offset 5: **[10,24,7,8,6] = 4,445,391**. These are not language-score failures; the original symbols do not encode valid RSA residues under the proposed fixed-width representation.

The Node22 SFT also performs a 336-block synthetic positive control: 4-rune GP29 messages are RSA-encrypted with the same N/e, encoded as five base29 digits, and decrypted with d=e⁻¹ mod φ(N). Every generated ciphertext block is below N and all 336 plaintext blocks round-trip exactly. This verifies the integer/radix implementation and shows the original failure is not a broken codec.

**Decision:** reject direct fixed-width GP29 RSA block encryption of the original pp33–39 chapter with the cuneiform prime pair and Cicada e=65537. This is distinct from the complete unknown-state additive-pad exclusion above. It does not reject RSA over independently selected bytes, a different radix or variable-length format, other factors/exponents, or an independently source-selected receiver; none is currently selected. Do not expand to arbitrary encodings without new source evidence.

**Reproduction:** [original-corpus Node22 SFT](../sims/lp2_cuneiform_rsa65537_base29_block_original_gate.cjs), including the exact 1,680-rune source partition and a passing 336-block synthetic RSA round-trip.

## Checks and decision

The self-contained [CommonJS Node22 SFT](../sims/lp2_cuneiform_rsa65537_fullseed_original_sft.cjs) reads the checked-in original numerical GP transcription and asserts the original rune count, eight singleton glyphs, all RSA/CRT survivor counts, the three exact terminal states, the zero-key two-cycle, and the source IoC. It independently builds eight A/I/O singleton ciphertexts under hidden original state3299 and detects the real state with the same unknown-seed sieve. It additionally encrypts **two repetitions of authentic solved p57 (190 runes)** under the authentic plaintext-F bypass and unknown initial seed3299, then confirms that the exact all-state inverse retains the genuine terminal state for **both key directions**. No manuscript plaintext is silently inserted into the unknown original pages.

**Windows Node22 [CI run 43776070505](https://github.com/FlareZ123/liber-primus/actions/runs/43776070505) passed** the complete original and planted tests.

**Decision:** this particular source-composed RSA-state additive pad cannot recover English plaintext with authentic word lengths under the uninterrupted clock, and its exact solved-p56 F-bypass transfer leaves only vacuous original-cipher identity outputs after exhausting every seed. The separate direct fixed-width GP29 block test below rejects the natural original-chapter encoding, but this still says nothing about RSA over independently selected byte messages, another radix or variable-length representation, a different exponent/state operation, a nonlinear receiver, transformed word segmentation, a different source language, or an unavailable historical key. The core unsolved need is still a **creator-selected receiver and initial state** or authentic unknown plaintext. A new test should identify that source instruction before multiplying free parameters.
