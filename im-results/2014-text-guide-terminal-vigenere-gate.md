# Historical plaintext-guided Vigenere key: exact solved onion control and LP2 terminal-page gate

**Agents 47 and 17, 11 November 2026.** A genuinely historical *key-selection pattern* is reconstructed from a solved 2014 Cicada stage: previously decrypted text provides the next GP29 Vigenere key. Two independently bounded LP2 transfers have now been tested: solved LP2 terminal-page keys on p55, and full prior-release LP1 prose on all 12,956 unknown LP2 ciphertext runes. Both remain nonlinguistic. These tests constrain one direct mechanism, without demonstrating an LP2 key or cipher.

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

## Whole prior-release plaintext as the next key (Agent 17)

An independently historical reason to consider **prior solved Liber Primus prose as a running key** is the positive-controlled 2014 use of `WELCOME PILGRIM TO THE GREAT` above. That clue does not choose a specific LP2 page, so this test freezes the most literal source starts and clocks without tuning to ciphertext. The input is the editor-normalized [solved LP1 prose](../resources/liber-primus/lp1-plaintext-reference.txt), truncated before the later solved LP2 p56/p57 text. GP29 greedy encoding uses the same exact alphabet and U/V, C/K spellings as the positive control. Original [LP2 ciphertext](../resources/liber-primus/lp2-corpus.json) is 12,956 GP29 symbols over physical pp0–55, including the rune-free p50.

Two distinct historically visible key starts are fixed: **A WARNING** on LP1's first solved page, giving 3,340 GP runes from the complete surviving solved first-release corpus; and **WELCOME** from the 2014 known-positive key stage, giving its 3,154-rune suffix. For each, test GP29 addition/subtraction, with position zero at the LP2 first rune and either uninterrupted running key or reset to key start on every physical page. Exactly **eight** original-input variants, no phase search, skipped-Fehu mask optimization, key edits or alternate plaintext attribution.

| Model | Full 12,956-rune mean GP trigram log score |
|---|---:|
| Raw unknown LP2 ciphertext | **−3.41498819** |
| Full LP1 key, continuous (subtract / add) | −3.41676472 / −3.41513770 |
| Full LP1 key, each physical page reset (subtract / add) | −3.41454570 / −3.41163191 |
| LP1 WELCOME-onward key, continuous (subtract / add) | −3.41442741 / −3.41519514 |
| LP1 WELCOME-onward key, each page reset (subtract / add) | −3.41589484 / −3.41231449 |
| **Independently solved p57 plaintext** | **−2.80745289** |

This score is from one fixed add-one smoothed GP-trigram model trained on solved LP1 only; it uses no unknown text to tune the model. Even the numerically best original transfer differs from raw by just **0.00336** log units per trigram. Its 76-rune last-page output begins `TOXXTAENTHHGOEAALCOFCNCCIDMNSTHPOEGDIAPIR...`, without readable words. The source-positive 2014 onion recovery and a synthetic p57-text plant both decrypt exactly, and every candidate re-encrypts its unchanged original ciphertext. These positive controls test implementation, not identify LP2's key.

The direct **whole-prior-LP1 plaintext as a simple GP29 additive running key** is retired for these source-fixed starts, directions, and clocks. It does not exclude a subset of the prior text selected by an original LP2 clue, a distinct prior text, a cipher other than direct GP29 addition or a historical secret. Avoid a new open-ended plaintext-derived key hunt without a source-selected phrase/offset and target page.

[Full self-contained CommonJS SFT](../sims/lp1_prior_release_textguide_lp2_sft.cjs) reproduces the authentic 2014 positive, all eight original transfers, independent solved p57 language control, exact key lengths, and reversible native-GP plant.

**Reproduction:** [single runnable CommonJS test](../sims/historical_text_guide_terminal_vigenere_sft.cjs) uses the canonical LP2 corpus and solved-text reference. Its positive control reconstructs the earlier real onion stage, and its original-source p55 inverse tests all 56 fixed keys/masks without fitting a target word. The decisive next lead would be **an original LP2 visible instruction selecting a solved-text region and a key clock**, which could be used on a fresh page to demonstrate unknown plaintext before widening this family. More free phase/skip/key searches would repeat previous exhaustive LP2 Vigenere failures.
