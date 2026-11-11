# Claimed external LP2 plaintext: original-input discriminator

**Decision, 11 November 2026.** A public alternative research tracker claims LP2 physical p18 (260 runes) and p19 (271 runes) have recoverable plaintext via respective 53-rune subtractive and 47-rune additive Vigenère keys. Applying its exact published key arrays to all the unchanged original runes reproduces fluent first-period prefixes but yields nonlinguistic text afterward. This is a bounded original-cipher rejection of the stated *periodic key* method. An unconstrained phrase fitted to an equal-length key period cannot authenticate its own key.

**Claimed source:** [Wulfic/Cicada3301-Liber_Primus, MASTER_TRACKER, §3 Pages 18–19](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md). The source lists all 53 and 47 key entries and plain=(cipher-key)%29 for physical p18, plain=(cipher+key)%29 for physical p19. The claimed P19 key contains four author-described [28,28,28,28] filler entries.

**Reproducer:** [sims/wulfic_lp2_claimed_keys_original_gate.cjs](../sims/wulfic_lp2_claimed_keys_original_gate.cjs). Reads the original 58-page [GP corpus](../resources/liber-primus/lp2-corpus.json), applies the two frozen arrays with position modulo their published periods, asserts the published first period and exact second-period outputs, reports IoC on the untouched remainder and checks a separate purported 234-rune page-repeat statement.

| LP2 physical page | Rune count | Published key | Claimed first-period output | First-cycle IoC | Remaining-rune IoC |
| --- | ---: | --- | --- | ---: | ---: |
| p18 | 260 | 53, subtract | BEINGOFALLIWILLASCTHEOATHISSWORNTOTHEONEWITHINTHEABOFETHEWAY | 0.0696661829 | **0.0365367478** (207 runes) |
| p19 | 271 | 47, add | REARRANGINGTHEPRIMESNUMBERSWILLSHOWAPATHTOTHEDEORHEER | 0.0592044403 | **0.0345131326** (224 runes) |

Uniform-GP29 expectation is **0.0344827586**. Raw source p18/p19 IoC are **0.0340065340 / 0.0343856772**. The p18 next cycle is *IAROEAEFPEOIETHIACAYEHRNMYHIAWOEBXCEAJOEBTAYFHAIWTHUTTHSASUAPRGAC*. The p19 next cycle is *NEEOGIAYEOCOEWTHCIRRMGUGNGJXJOAEGEOOHTHEEAEEAJOEAFATIIBTMP*. All outputs count GP runes, so digraphs TH, NG, EO, EA etc. are individual symbols. The index of coincidence of the longer remaining ciphertext-like text stays near uniform and the printed content is unreadable.

For any claimed key length K, one can choose any K-rune plaintext and compute a matching additive or subtractive key from the first K ciphertext runes. Such a construction **necessarily** recovers that invented passage and says nothing about the subsequent ciphertext. Evidence of a real key needs an externally fixed key derivation or independently recovered later plaintext. The printed p19 filler entries underscore the absence of external key provenance.

**A separate supposed duplicate:** The same tracker says "P27 ciphertext = P44 first 234 runes." The original physical LP2 p27 is 234 runes and physical p44 is 273 runes; they have **zero** common leading runes under canonical indexing. This reported 234-rune match must be resolved against the original page numbering before anyone treats it as keystream reuse. The SFT prints the first original GP symbols for both pages.

**Outcome:** Do not promote the p18/p19 English *first periods* into verified unknown plaintext or use the claimed p19 DEOR instruction as a source-selected key for p20. The claimed full-page periodic transformations fail independent original ciphertext beyond their fitted prefixes. A nonperiodic historical operation remains possible if a source genuinely supplies it.
