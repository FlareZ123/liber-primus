# Claimed external LP2 plaintext: original-input discriminator

**Decision, 11 November 2026; all-F-mask extension 14 November 2026.** A public alternative research tracker claims LP2 physical p18 (260 runes) and p19 (271 runes) have recoverable plaintext via respective 53-rune subtractive and 47-rune additive Vigenère keys. Applying its exact published key arrays to all the unchanged original runes reproduces fluent first-period prefixes but yields nonlinguistic text afterward. This is a bounded original-cipher rejection of the stated *periodic key* method. An unconstrained phrase fitted to an equal-length key period cannot authenticate its own key.

**Claimed source:** [Wulfic/Cicada3301-Liber_Primus, MASTER_TRACKER, §3 Pages 18–19](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md). The source lists all 53 and 47 key entries and plain=(cipher-key)%29 for physical p18, plain=(cipher+key)%29 for physical p19. The claimed P19 key contains four author-described [28,28,28,28] filler entries.

**Reproducer:** [sims/wulfic_lp2_claimed_keys_original_gate.cjs](../sims/wulfic_lp2_claimed_keys_original_gate.cjs). Reads the original 58-page [GP corpus](../resources/liber-primus/lp2-corpus.json), applies the two frozen arrays with position modulo their published periods, asserts the published first period and exact second-period outputs, reports IoC on the untouched remainder and checks a separate purported 234-rune page-repeat statement.

| LP2 physical page | Rune count | Published key | Claimed first-period output | First-cycle IoC | Remaining-rune IoC |
| --- | ---: | --- | --- | ---: | ---: |
| p18 | 260 | 53, subtract | BEINGOFALLIWILLASCTHEOATHISSWORNTOTHEONEWITHINTHEABOFETHEWAY | 0.0696661829 | **0.0365367478** (207 runes) |
| p19 | 271 | 47, add | REARRANGINGTHEPRIMESNUMBERSWILLSHOWAPATHTOTHEDEORHEER | 0.0592044403 | **0.0345131326** (224 runes) |

Uniform-GP29 expectation is **0.0344827586**. Raw source p18/p19 IoC are **0.0340065340 / 0.0343856772**. The p18 next cycle is *IAROEAEFPEOIETHIACAYEHRNMYHIAWOEBXCEAJOEBTAYFHAIWTHUTTHSASUAPRGAC*. The p19 next cycle is *NEEOGIAYEOCOEWTHCIRRMGUGNGJXJOAEGEOOHTHEEAEEAJOEAFATIIBTMP*. All outputs count GP runes, so digraphs TH, NG, EO, EA etc. are individual symbols. The index of coincidence of the longer remaining ciphertext-like text stays near uniform and the printed content is unreadable.

For any claimed key length K, one can choose any K-rune plaintext and compute a matching additive or subtractive key from the first K ciphertext runes. Such a construction **necessarily** recovers that invented passage and says nothing about the subsequent ciphertext. Evidence of a real key needs an externally fixed key derivation or independently recovered later plaintext. The printed p19 filler entries underscore the absence of external key provenance.

**A separate supposed duplicate:** The same tracker says "P27 ciphertext = P44 first 234 runes." The original physical LP2 p27 is 234 runes and physical p44 is 273 runes; they have **zero** common leading runes under canonical indexing. This reported 234-rune match must be resolved against the original page numbering before anyone treats it as keystream reuse. The SFT prints the first original GP symbols for both pages.

## Original-page all-F-mask extension (14 November 2026, Agent22)

A separate historically motivated alternative is the **literal plaintext-F bypass** used by the authentically solved LP2 p56: when a plaintext GP rune is F (index0), print ciphertext F without advancing the key. Perhaps adjusting the published 53- or 47-rune clock at ciphertext F sites could rescue the complete-page phrases. The earlier ordinary-period rejection does not itself answer this different cipher rule.

The original source has **10** ciphertext F symbols on p18 and **12** on p19. At every F position, allow the *complete* two-choice interpretation: transparent plaintext F with no key consumption, or an encrypted non-F plaintext with one key consumption. Every non-F ciphertext symbol must consume the next key and decode to non-F; a literal plaintext F cannot be emitted as a non-F source glyph under this rule. An exact dynamic program keeps **all possible consumed-key counts** after each source rune, merging equivalent clock states without sacrificing any F decisions.

Under the exact same externally published source keys and signs, **every legal F assignment fails**:

| Physical page | First impossible original offset (zero-based) | Last viable key clock before that source glyph | Source glyph GP index | Its selected key GP index |
|---|---:|---:|---:|---:|
| p18 | **5** | 5 | **20** | **20** |
| p19 | **114** | 113 | **21** | **8** |

On p18, no earlier F can change the clock, and `C[5]-K[5]=(20-20) mod29=0` forces a plaintext F at non-F ciphertext. On p19, all surviving skip choices collapse to a single clock by offset114; `(21+8) mod29=0` likewise forces a forbidden plaintext F at a non-F source glyph. **Both exact whole-page published keys are impossible under the known solved-p56 F-transparent extension, even granting every candidate skip pattern.** This inference is *conditional*: the unknown page cipher might use a different F rule.

The existing [CJS original-input reproducer](../sims/wulfic_lp2_claimed_keys_original_gate.cjs) now performs this exact finite-state calculation in addition to its previous full-period and original p27/p44 checks. For each fixed key it also plants all **95** source-native clear p57 runes into a synthetic periodic ciphertext and verifies exact **95/95** recovery, preventing a wrong-sign false rejection. Successful [Windows Node.js 22 manual workflow run 43610954734](https://github.com/FlareZ123/liber-primus/actions/runs/43610954734) records the merged test. The first-cycle snippets remain mathematically unconstraining by themselves, as the original report already explained. No new key or authentic unknown plaintext is identified.

**Outcome:** Do not promote the p18/p19 English *first periods* into verified unknown plaintext or use the claimed p19 DEOR instruction as a source-selected key for p20. The claimed full-page periodic transformations fail independent original ciphertext beyond their fitted prefixes. A nonperiodic historical operation remains possible if a source genuinely supplies it.
