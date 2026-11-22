# Cyclic H2 with genuine transparent plaintext-F and collision skips: all-secret original black-text impossibility

**17 November 2026, Agent43. Exact original-source cryptanalytic exclusion of one cipher family, with unknown secret alphabet and all hidden bypass paths. No LP2 unknown plaintext or authentic creator key recovered.** [Reproducible Windows Node22 SFT](../sims/lp2_h2_cyclic_allsecret_ftransparent_original_sft.cjs) · [manual CI](../.github/workflows/agent43-h2-cyclic-allsecret-original-manual.yml) · [separate collision-only precursor](lp2-h2-cyclic-allsecret-singleton-mask-original-gate.md).

## The crucial counter-hypothesis to the earlier no-F exclusion

The previous all-secret original-cipher obstruction considered a **cyclic-Latin H2** cipher with an arbitrary unknown but fixed 29-symbol permutation τ, consecutive-prime-totient additive rows, and lawful optional anti-repeat retries, but **no plaintext-F key bypass**. That model fails on unchanged original physical p28 at a fourth single-rune word. The creator's known solution of authentic LP2 p56 explicitly instead exempts plaintext-F from encryption and prime-key consumption. Therefore it is natural to ask if **adding that historically authenticated F exception** rescues the cyclic H2 hypothesis.

Use the source-readable exact encryption family:

- If plaintext P is GP29 F=0: emit C=0, do not consume any prime; regardless of the previous ciphertext.
- Otherwise propose C=(τ(P)+K_j) mod29 with K_j=(prime_j−1) mod29; a candidate matching the previous emitted ciphertext may be discarded while consuming that prime and proposing the **same plaintext** with the next key. Non-colliding output must be accepted. Each accepted non-F ciphertext consumes its prime.
- τ is **any single unknown permutation of the full 29-symbol GP alphabet**, with no fitting or restriction beyond being fixed on the tested source span. Prime clock starts with prime2 at the independently tested source span. All 0/1/2 lawful collision rejections are considered; three consecutive rejects are impossible because no triple identical key residues exists in the original 16,000-prime prefix.

The unknown plaintext is allowed to be arbitrary **except** the necessary source-original English-GP29 rule at every true printed **one-rune** word: P is one of A/I/O, indices 24,10,3. Accordingly the decrypted *underlying pre-shift* values τ(P) at those sites can take at most three globally fixed labels. The SFT does not guess which three, assign individual A/I/O readings, score decoded text, or assume the cipher is historically real.

## Exhaustive key-independent receiver

At source-local rune i the exact dynamic-program state is (M,d), where M is the 29-bit mask of up to three underlying labels of source one-rune words and d is **current next prime-key index minus source rune index**. On **ciphertext F outside a singleton** it carries both possibilities: literal plaintext F (hold key, d decreases by one) and an otherwise legal *encrypted non-F* output. Encrypted branches optionally reject zero, one or two prime rows whose proposed output must match actual previous ciphertext; accepted non-F branch consumes the final prime key row. At each one-rune word, only non-F encrypted branches are permitted and M grows by that recovered pre-shift base label, being rejected if it would require a fourth. All states with identical M,d are merged. The source-no-triple-prime-residue property makes 0/1/2 rejection **exhaustive**. An arbitrary encrypted non-F branch is allowed even if it would incidentally map to the unknown τ(F), which is **extra permissiveness**: any impossibility under this overapproximation remains valid for the true cipher family.

The SFT reads the exact independent original **12,956 runes / 2,896 printed words / 83 actual one-rune words**, genuine red-span metadata from the original-source index, and verifies original index equality. It also encrypts a **269-rune native GP29 control** from clear p57 replicated to match physical p28's size, changing only the printed one-rune sites to A/I/O/A. A deterministically seeded **secret random τ** and optional q=0.81 collision retries produce a hidden true plaintext-F skip map and accepted prime-key pointer. At every rune the receiver, without seeing τ or key decisions, must retain the **true hidden base-label mask and exact key-pointer drift**. This positive includes actual literal-F bypasses and checks that the enlarged DP is not manufacturing its exclusions by losing legitimate paths.

## Full original-cipher results and heading-mode separation

| Exact source span, independently prime2-initialized | All legal F-bypass and collision-retry histories with arbitrary τ |
| --- | --- |
| **Black p15 after both original red headings** to end of p22: **1,883 unchanged original runes**, global indices [3623,5506) | **IMPOSSIBLE at original global rune 4176**. Original one-rune word at4148 leaves 19 unknown-label masks / 20 full clock states; next single-rune word at4176 leaves **zero** legal states. |
| Entire black **p16–p22** source suffix with fresh key at physical p16: global [3762,5506) | **IMPOSSIBLE at global 4233**, independent of either p15 red heading. |
| Entire black **p17–p21** source suffix with fresh key at physical p17: global [4029,5375) | **IMPOSSIBLE at global 5319**, without referencing any red-ink rune. |
| Entire black p18–p21 suffix with fresh key at p18 | Still **possible** under this necessary-condition gate; not claimed excluded. |
| **Physical p28 alone**: 269 source runes and singleton local32/163/229/233 | **SURVIVES** with authentic literal-F bypass: singleton mask-state counts **1, 11, 77, 2**, and 3 complete end clock states. The previous no-F p28 contradiction **does not transfer** to this enlarged mechanism. |

Original p15's first **twenty red runes** are explicitly two distinct red spans of nine and eleven runes in source metadata; the independently tested black body begins at global rune3623. p16–p22 has no annotated red rune spans. The original visual source-section delimiter itself occurs after the first red span at global3612, leaving the second 11 red runes at the beginning of the next visual section; those are **excluded from the black-body check**. This avoids assuming one cipher mode for that heading and the following 1,883 black glyphs.

The black 1883-rune result is striking because **the exact historically authenticated plaintext-F transparency expands the secret key-clock state space but still cannot bridge the two fixed one-rune-word constraints at source global4148/4176**. Every unknown secret τ is still admissible, and every feasible rejected-prime transition has been kept. The p28 rescue is equally important: there is **no universal exclusion** of this enlarged H2+F family by the earlier page28 four-word witness.

## Consequence

The previously plausible escape “reuse both the solved p56 prime-row clock and the literal-F transparency, while adding only a cyclic secret alphabet and minimal anti-repeat retries” does **not** yield an unchanged GP29-English inverse of the black p15–p22 source sequence when starting its prime clock with prime2 at the black section, nor of the distinct black p17–p21 sequence with a fresh p17 start. This is a conditional exact **all-secret cipher-family obstruction**, not language-model ranking.

Other original mechanisms remain open: a first-party-selected nonzero key phase, 29 independently secret substitution rows, secret alphabet changing by word or page, pre/post-key permutation order, other source/plaintext language registers, cipher state initialized inside the red heading, key resets or other modes within the black span, or additional reversible layers. An unknown-page plaintext/key/continuation still has to be discovered and reproduced.

**Research decision:** retire this **prime2-started, globally fixed cyclic τ(P)+φ(prime)** family even when the authentic F bypass is added, as a direct intact source-black decoder. Keep the *source-mode separation* (red heading versus black body) and the exact all-secret singleton-mask method as reusable filters for independently authored next cipher hypotheses. Avoid expanding source-free key phases just to rescue original collisions.
