# Four original LP2 apostrophe tails yield a candidate LIFE under the known LP1 T-tail operation

**Original-source conditional lead, 16 November 2026, Agent43. No unknown LP2 plaintext or authentic new encryption key recovered.** This is a new source-motivated four-rune mnemonic candidate with a decisive negative for its simplest direct running-key consumer.

## Independent visible marks and authentic operation control

The four raised, 12×40-pixel apostrophe strokes in the source LP2 JPEGs (21.jpg, 38.jpg, 52.jpg, 58.jpg) delimit four words at physical pp4,21,35,41. Their *immediately following* original ciphertext runes in page order are **W, Y, T, C**, GP29 indices **[7,26,16,5]**, at global offsets **[1110,5138,8515,10089]**. The marked source words are **`MXI'W`, `AEO'Y`, `PE'T`, `XLJ'C`**. The four source marks and original pixel geometry were previously verified as source ink in [the canonical mark annotations](../resources/liber-primus/lp2-quote-punctuation-spans.json) and [existing original-pixel SFT](../sims/lp2_apostrophe_original_pixel_geometry_sft.py). This inquiry does not claim to discover the marks.

The solved, image-verified LP1 p14 Koan prints **`RWN'B`** and decrypts to **DON'T** under authentic `FIRFUMFERENFE`; its original apostrophe tail is ciphertext **B=17**, corresponding plaintext **T=16**, so the actual GP29 additive key difference **B−T = 1 = U**. Thus the historical cipher independently supplies a *specific operation on an apostrophe-tail rune*.

Applying that same *T* plaintext assumption to the four unknown LP2 marked tails, with **no extra shift constants or transposition**, gives:

| Original scan | Original marked word | Suffix ciphertext | GP ordinal | Cipher − T mod29 | Key letter |
| --- | --- | --- | ---: | ---: | --- |
| 21.jpg | `MXI'W` | W | 7 | 20 | L |
| 38.jpg | `AEO'Y` | Y | 26 | 10 | I |
| 52.jpg | `PE'T` | T | 16 | 0 | F |
| 58.jpg | `XLJ'C` | C | 5 | 18 | E |

The resulting GP29 source-derived candidate is **LIFE**. The source selection (four physical marks) and mathematical difference (LP1 proven T apostrophe) are substantially more constrained than a text-wide search for convenient words. **The unknown LP2 apostrophe tails have not been authenticated as T in plaintext.** In fact, the 2014 public proposal reads the p35 three-rune contraction as IT'S, ending in S; it was not confirmed on surrounding ciphertext. Therefore this is a *testable candidate mnemonic/key source*, not proof of four T contractions.

## Concrete direct cipher consumer fails

The most literal use treats these four letters as a periodic GP29 Vigenère key with phase0 at each printed page, testing both arithmetic signs and all four starting key phases. These fixed variants were applied to the complete original **66-rune physical p49 pretable instruction** and complete original **76-rune p55**. Every one of **16 original plaintext candidates** remains near-uniform, rather than native GP29 prose: maximum p49 index of coincidence **0.0358974359**, maximum p55 **0.0354385965**; source-native solved p57 first76 IoC **0.0596491228**. A genuine known-p57 ciphertext plant encrypted using each exact LIFE key/sign/phase was inverted **16/16**. Full original input was also exactly re-encrypted under every candidate, an implementation check.

More decisively, the *very premise* that **all four unknown marked suffixes decrypt to T with the *same periodic LIFE key*** is algebraically impossible for either original-book continuous clock or the nine printed-section reset clock. For a fixed T plaintext, the same key phase must produce the same ciphertext suffix. But globally the first two original marks both occur at phase2 and have **different W/Y suffixes**; under chapter-reset clock, marks (p4,p41) share phase1 but have **different W/C**, and (p21,p35) share phase3 but have **different Y/T**. This impossibility does not depend on language scoring, sign or later ciphertext. A nonperiodic model or a separate four-letter mnemonic consumer is necessary for LIFE to play any authentic role.

A different fixed plaintext suffix, such as S, would yield **NGJUM**, rather than LIFE. Choosing T from the solved LP1 makes the LIFE coincidence specifically motivated, but the source has not selected that specific reuse. Retire LIFE as a **direct, globally/chapter-reset 4-period additive key** on this original 66/76-rune material. Other operations, source-specific resets, and mnemonic interpretations remain unknown and must be independently selected before testing.

**Reproducer:** [original-source Node22 CommonJS SFT](../sims/lp2_apostrophe_tail_life_source_gate_sft.cjs); [manual Windows Actions gate](../.github/workflows/lp2-apostrophe-life-source-key.yml). No source-derived unknown plaintext or destination is established.
