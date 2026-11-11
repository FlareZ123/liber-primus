# Historical plaintext-guided Vigenere key: exact solved onion control and LP2 terminal-page gate

**Agent 47, 11 November 2026.** A usable, independently historical *key-selection pattern* is reconstructed from a solved 2014 Cicada stage: a previously decrypted text supplies the key to a short subsequent GP29 Vigenere message. The same direct operation tested on the adjacent unsolved LP2 p55 using its actual solved terminal-page neighbors does **not** recover unknown plaintext. This report is a bounded attempt to transfer a concrete historical solve path, not a claim that the unsolved book uses Vigenere.

## Executable original 2014 key-selection precedent

The original 2014 image `03.jpg` carries a default-key OutGuess PGP-signed message beginning **"Let the text guide you."** and containing a hexadecimal JPEG. An independent public extraction is preserved at [pnotisdev payload_03.txt](https://github.com/pnotisdev/cicada3301/blob/main/results/outguess/payload_03.txt); a [contemporaneous-puzzle reconstruction](https://connortumbleson.com/2024/02/05/the-cicada-3301-mystery-puzzle-3-solve-part-2/) reports the same stage and its successfully reached fourth onion destination. Decode the embedded 587×109 JPEG into its original runes:

```text
ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3 ᛠᛗᛇᚠᛡ
```

The text-guided key is the already solved LP1 phrase **WELCOME PILGRIM TO THE GREAT** (greedy GP29 rune spelling). Subtract the corresponding cyclic GP rune indices modulo29 from the 18 embedded ciphertext runes, keeping the two decimal digits and visible space literal and not consuming key steps. The exact direct output is:

```text
AUOWYFGL5LCSFJ3 NONIAN
```

The earlier solver's standard GP ambiguities **U/V, C/K, S/Z, IA/IO** and the previously known 16-character onion-host format allow `AVOWYFGL5LKZFJ3N.ONION`. **The dot is a semantic reconstruction from the onion-address format**, since the printed space occurs before the last group of five runes and the final host character is the first rune in that group. The authentic short-stage operation works on a source-specified earlier plaintext key. It also processes both embedded ciphertext Fehu runes as ordinary Vigenere symbols. The SFT asserts the complete exact unreformatted intermediate and the historical domain readout before testing LP2.

This historic operation makes *solved prose as a next-stage rune key* a genuine creator-used mechanism. It does not identify which LP2 plaintext, if any, is a key, nor any reason to reuse this precise key on an unsolved page.

## Narrow terminal-page transfer and decision

**Tested source selector:** the book's **immediately solved terminal pages p56 (AN END) and p57 (PARABLE)** supply GP-native plaintext key material for the preceding unsolved physical p55, which has **76 ciphertext runes**. A separate exploratory p55 FOLD/word-address route gives the candidate **THE DEEP END** [without proving an instruction to use it as a key](p55-fold-solved-endpoint-phrase.md). These constraints motivate seven exact deterministic keys:

- first or last 76 GP runes of solved p56;
- first or last 76 GP runes of solved p57;
- the last 76 runes of the reverse of concatenated p56+p57;
- the phrase AN END WITHIN THE DEEP WEB;
- the phrase THE DEEP END.

For each key, inverse `P_i=(C_i−K_j) mod 29` starts at zero, cycles only when its source runs out, and enumerates every literal-F/nonconsuming mask for exactly the three original F positions **[15,25,41]**. This finite original-input family has **7 × 8 = 56** candidates. A GP trigram model is frozen from the repository's solved LP1 reference for a modest diagnostic; no unknown text or key parameter is fitted. Every candidate must re-encode the exact original p55 source, and the genuine p56 prime-totient plaintext serves as a language reference.

| Original input or gate | Mean reference GP trigram log-score |
| --- | ---: |
| Original p55 ciphertext, unmodified | −3.401811359 |
| Highest-scoring p55 key of 56: THE DEEP END, mask0 | **−3.385990015** |
| Independently solved p56 plaintext control | **−2.436189913** |

The best candidate opens `MWAENGETHEACAEPDEOCPEOJEUSTWESRILLHUWTAAOJE...`, with no recognizable continuous text. The **0.016** apparent score improvement over p55 raw is negligible compared with the solved-page separation, and the winning key came from an exploratory graph rather than a source instruction. This transfer does not recover LP2 p55 under the stated reversible family. It does not exclude chained plaintext-derived keys selected differently, word-local clocks, another cipher, or absent historical source material.

**Reproduction:** [single runnable CommonJS test](../sims/historical_text_guide_terminal_vigenere_sft.cjs) uses the canonical LP2 corpus and solved-text reference. Its positive control reconstructs the earlier real onion stage, and its original-source p55 inverse tests all 56 fixed keys/masks without fitting a target word. The decisive next lead would be **an original LP2 visible instruction selecting a solved-text region and a key clock**, which could be used on a fresh page to demonstrate unknown plaintext before widening this family. More free phase/skip/key searches would repeat previous exhaustive LP2 Vigenere failures.
