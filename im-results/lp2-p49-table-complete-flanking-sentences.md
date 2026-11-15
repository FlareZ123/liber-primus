# The authentic sentences flanking the LP2 256-cell table

**Agent18, Director #1099, 15 November 2026. Classification:** exact original-ciphertext target correction and one bounded additive-inverse negative. The table-adjacent prose remains encrypted. No recovered original key, unknown-page plaintext or table instruction is claimed.

## The decipherment target selected by printed punctuation

The original LP2 page p49 contains exactly 66 runes above the red ten-dot mark and the first 80 numerical cells. However, physical p49 **begins with one rune belonging to a word carried over from p48**. Its first apparent one-rune word is the continuation of the previous physical page's eight-rune tail, forming a **nine-rune complete word**. The first genuinely complete sentence ending at the p49 full stop starts at the **last printed full stop on p48**. It has **138 GP29 runes in 33 complete printed words**, with 72 runes on p48 and 66 on p49. The full word straddling the page turn transliterates `EOFUDYALFIA` (nine rune indices, not eleven Latin characters).

The original text after the 256 numerical cells begins on p51 with **92 runes and no printed full stop**. Its last three runes continue with the first rune of p52, forming the four-rune word `PLFP`. The first post-grid complete punctuation-delimited sentence ends at the first printed stop on p52. It contains **170 runes in 40 words**, with 92 runes on p51 and 78 on p52.

| Source-fixed segment | Original physical page span | Original GP29 runes | Complete words | Role |
| --- | --- | ---: | ---: | --- |
| Before 10-dot mark and grid | p48 last period → p49 last period | 72 + 66 = **138** | **33** | The **whole preceding sentence** |
| After the grid | p51 initial rune → p52 first period | 92 + 78 = **170** | **40** | The **whole following sentence** |
| Terminal comparison only | p54–p55 | **308** (9 red heading + 299 following) | Not a plaintext crib | Existing independent section |

Both original JPEG page turns (65.jpg→66.jpg, 68.jpg→69.jpg) preserve those printed word continuations, matching the canonical transcription and corpus. The complete before/after input is **308 runes**, precisely the total p54–55 terminal section length. Within the floral chapter, the before/after pair is the only adjacent original full-stop pair whose total is 308 among 43 adjacent pairs. This number equality is **postnoticed and does not supply an author-selected key, pairing order or decoding operation**. Source-direct concern is stronger than the 66-rune isolated-page formulation: a decoder requiring a word/period reset must operate at authentic punctuation, not the p48→p49 or p51→p52 physical turns.

A separate visible candidate state clue: **p51 is the sole one of 55 unknown rune-bearing physical pages whose first two ciphertext signs are identical**, `ᚹᚹ` (`WW`), immediately after the numeric table. All other 54 begin with distinct pairs. This original placement is worth predicting *from* a proposed cipher rule, but one coincident doublet at a preselected page is inadequate to establish a state reset or cipher, and the book has another 85 adjacent doublets elsewhere.

## One frozen original-input decipherment attempt

A narrow reversible bridge treated the full p54–55 **308-runic ciphertext** (including its red nine-rune heading) as a position-aligned additive GP29 key for the original 138+170 source pair:

```text
P[i] = (C[i] + K[i]) mod 29   or   P[i] = (C[i] - K[i]) mod 29
K = original p54[all 232 signs] || p55[all 76 signs]
C = original 138-sign before-table sentence || original 170-sign after-table sentence
```

Both inverses were run without choosing a key from a ciphertext score. The plus case gives **IoC 0.03623249714**; the minus case gives **IoC 0.03369431871**. Both return uniformly scattered GP29 transliteration rather than 100 consecutive meaningful original GP29 plaintext signs. The genuine **clear p57** control has **IoC 0.06270996641**; the original input sentences have IoC **0.03332275468** and **0.03376261747**. Both candidate keys reproduce all 308 original symbols under exact forward reencryption, as every correctly implemented reversible additive key does. This excludes only the two direct aligned additive orientations of this **unselected** terminal-key interpretation; it is not evidence that the author's intended table cipher has been tested.

The original p49 66-rune page fragment has **zero adjacent identical runes** and the following p51 92-rune fragment has one, exactly at its beginning. This is compatible with the manuscript's established rare-doublet phenomenon; it gives no independent plaintext.

## First-party plaintext reuse: direct whole-sentence crib test

The authentic **33-word / 138-rune** antecedent and **40-word / 170-rune** sequel can be matched against source-authored prose **without choosing any cipher key**: if a candidate source provides verbatim plaintext and the author retained printed GP29 word boundaries, each of its word lengths must equal the complete manuscript pattern. The [source-native executable](../sims/lp2_p49_firstparty_textcrib_sft.cjs) holds both authentic original sentence spans fixed, projects the Latin spelling by the solved GP multi-letter conventions (TH, NG, EO, OE, AE, EA, IA, ING), and scans full contiguous source windows. It does not permit omissions, gaps, abbreviations, anagrams, or fitted words.

The original 2012 signed MIDI email text (85 source words), 2013 signed final-stage statement (405), 2014 signed three-squares instruction (38), and 2016 signed Liber Primus guidance (45) provide **four independent creator-era plaintext candidates**. Their smallest summed absolute GP-word-length discrepancies against the 33-word target are **46, 46, 53, 51**, respectively. Against the 40-word sequel they are **74, 57, ineligible (only 38 source words), 74**. The nine preserved, already solved **native GP29** text sections, including original clear p57, also have **no exact 33- or 40-word substring**. These source sections need no Latin projection; original rune word lengths are measured directly. A deliberately planted complete 33-word excerpt of the 2013 authentic signed text is found with **zero difference at its true source offset19**, demonstrating exact-source recall. [Successful original Windows Node22 SFT run 43723592069](https://github.com/FlareZ123/liber-primus/actions/runs/43723592069).

**Decision:** neither full unknown sentence can be a verbatim, word-boundary-preserving excerpt of these particular earlier preserved Cicada texts. The in-band instruction still requires an independently established unknown plaintext or an author-selected operation; altered paraphrases and lost original texts remain open. The first-party source search was a concrete plaintext-crib hypothesis, not a decryption.

## Cryptanalytic consequence

A serious attempt to decrypt the in-band table explanation should freeze the authentic **138-rune / 33-word** preceding sentence as its primary target and the **170-rune / 40-word** following sentence as its untouched test, retaining the GP29 page-carried word states. A method that decrypts only p49's 66 glyphs must explicitly explain why its key or word state begins in the middle of a continuing ciphertext sentence. If the table is an in-band key handoff, seek an *original creator-selected* 256-cell parser, start state and consumer, and use its predictions across both complete sentences. The present numerical equality to terminal p54–55 and the initial `WW` do not decide that rule.

**Reproducer:** [`sims/lp2_p49_table_sentence_pair_sft.cjs`](../sims/lp2_p49_table_sentence_pair_sft.cjs) asserts the complete 57-page rune transcription against the original corpus, both page-carried words, all 138/170 rune counts, 33/40 word counts, the unique p51 leading doublet, both reversible original-terminal-key operations, and source-native IoCs. Original Windows Node22 [successful manual run 43704791851](https://github.com/FlareZ123/liber-primus/actions/runs/43704791851). This uses the repository's original-source mapping and has no synthetic free-key inference.

**Remaining missing operand:** authenticated ciphertext-to-plaintext key material or a fully specified reversible operation that the original LP2 image, original 2014 Cicada sources, or a new surviving contemporaneous artifact selects *independently*. The single source-defined passage boundary improvement does not solve any of the 56 unknown pages.
