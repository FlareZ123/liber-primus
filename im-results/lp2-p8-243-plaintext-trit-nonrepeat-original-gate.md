# Page-8 243-cell plaintext-feedback nonrepeat coder on original LP2

**Agent 4, 22 November 2026. Classification: tested source-shaped reversible candidate; direct native-GP prose decoding fails.** No new ciphertext page has been deciphered and the proposed mapping is not an authenticated Cicada instruction.

## Source-selected components and explicitly conjectured operator

Authentic physical p7 has five final red words whose GP29 ordinal products are **11,26,8,15,2**. Their residues modulo3 are **[2,2,2,0,2]**, selecting a literal five-trit initial address **236**. Original physical p8 contains **243 black GP29 runes**, exactly 3^5 possible five-trit addresses, including the final black rune carried as part of the p8→p9 complete printed word. These two concrete source objects motivate testing a 243-cell mutable state table with source seed236.

The **conjectured, currently unauthenticated** inverse is the smallest fully reversible nonrepeat rank scheme we could assign this state:

1. Preserve the last physical p8 ciphertext rune as the predecessor for the first p9 ciphertext rune; read the 243 original p8 black runes in printed order as table values K[0…242].
2. For each actual following ciphertext rune C, compute d=(C−previousC) modulo29. If d=0, emit GP29 rune index28 (the arbitrarily reserved escape); otherwise output P=(d−1 + sign*K[state]) modulo28, with sign either +1 or −1.
3. Update the five-trit plaintext-history state as state=3*(state mod81)+(P mod3). Continue without page resets through the entire original p9–p55 stream.

The forward encoder exactly reconstructs C from P: when P=28 it emits the repeated preceding cipher symbol, and otherwise emits a difference in 1…28. The artificial use of GP index28 as repeat escape is **not supported by a first-party clue**, and the source red trits specify an initial state only if the remaining hypothesized decode grammar were correct. We therefore test all **243 possible initial states × both signs**, including seed236, without claiming this is the historical cipher.

## Original-input result

The [reproducible Windows Node22 SFT](../sims/lp2_p8_243_plaintrit_nonrepeat_sft.cjs) reads the unchanged [original corpus](../resources/liber-primus/lp2-corpus.json). All **486 full 10,827-rune p9–p55 outputs** have GP29 index of coincidence between **0.0352367 and 0.0352885**, i.e. near a uniform alphabet with 28 ordinary output symbols. Actual solved native-GP p57 has **0.06270997** over its 95 genuine source runes. This comparison is descriptive rather than a formal language-source likelihood test, but the model produces no sustained native prose on p9 or independently p16/p40.

For the source-derived initial state236:

| Key sign | Full p9–p55 IoC | Original p9 IoC | Original p16 IoC | Original p40 IoC |
| --- | ---: | ---: | ---: | ---: |
| −1 | 0.03525524 | 0.03471407 | 0.03466531 | 0.03775645 |
| +1 | 0.03525229 | 0.03395942 | 0.03528484 | 0.03406738 |

Every original decoder assigns **73** repeated ciphertext transitions to the reserved escape, regardless of key/seed. All source-seed and representative alternative-seed original outputs exactly forward reencrypt, as demanded by reversibility; this alone is **not evidence of a correct key**. Full source-native solved-p57 **95/95** encryption/decryption plants pass for both signs, as does an artificial inserted index28 exception demonstrating correct repeated-ciphertext handling.

An additional original-input deterministic property eliminates hope that a different initial seed would rescue all distant pages. Across all 243 simultaneous initial states, the plaintext-history readouts **coalesce into a single state after exactly 428 ciphertext runes under sign −1 and 1,512 runes under sign +1**. After those positions, every initial seed produces the same output for a given sign. Thus the shared p16 and p40 outputs above are key-independent over all 243 initial states *within this model*.

## Research decision

The source-shape hypothesis is attractive because it uses exactly the available p7 five-trit and p8 243-rune objects, explicitly specifies a reversible symbol-changing mechanism, handles all 73 repeat exceptions, and makes full original-page predictions. **Its predictions do not recover readable native-GP text.** Initial-state brute force is exhausted and, because of the proven coalescence, additional seed tuning cannot alter more distant output.

Retire this exact printed-order p8 243-cell, plaintext-trit-state, ± rank28 cipher. The original anti-repeat fingerprint still requires an author-selected opcode, a genuine external operand or an independently attested plaintext register. Source ink 242-to-242 and different nonlinear state consumers remain possible, but their mere numeric dimensions cannot select a decryption.
