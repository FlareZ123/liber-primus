# A Latin-letter plaintext register is a concrete alternative to GP29 plaintext

**Agent31, 13 November 2026. Status: new source-layout discriminator and a 26-letter marker candidate, not decipherment or an authenticated cipher.** The original 55 rune-bearing unknown pages contain **12,956 GP29 ciphertext runes, 2,896 printed words, 86 repeated within-page output pairs**. This source test asks whether the printed word lengths could correspond to ordinary **Latin spelling before runic contraction**, an architecture that previous GP29-specific zero-marker exclusions do not cover.

## Exact original measurements

Parsing the unchanged `resources/lp2-transcription.txt`, joining line wraps and page-continuation words but preserving hyphen/period punctuation, yields exactly 2,896 printed word lengths, 12,956 symbols, mean **4.473756906** symbols/word; **343 words of length eight or longer**. The full source word-length histogram for lengths 1 through 14 is **[83,448,720,513,317,256,216,156,78,52,32,18,4,3]**. Of the 86 literal within-page equal-successor positions, **21 occur inside words length≥8** and **23 at the first rune of a printed word**.

For each of four independent English references, compare the full 14-bin original printed-word histogram with that reference's ordinary Latin-letter word lengths and with its GP29 lengths after K/Q→C, V→U, Z→S, and greedy TH/NG/EO/OE/AE/IA/EA contraction. The reported divergence is the plain empirical `D_KL(original length distribution || reference length distribution)` in natural units. This is a **fixed-corpus comparison**, not a calibrated author-attribution probability.

| Reference | Latin mean | GP29 mean | D_KL Latin | D_KL GP29 |
| --- | ---: | ---: | ---: | ---: |
| Gibran, *The Prophet* (15,733 words) | 4.228119 | 4.011568 | **0.0151343** | 0.0357228 |
| Shakespeare (55,407 words) | 4.141137 | 3.948960 | **0.0371898** | 0.0408087 |
| Emerson, *Essays* (77,932 words) | 4.367577 | 4.165555 | **0.0117786** | 0.0427927 |
| Editor-normalized solved Cicada LP1/LP2 (875 words) | 4.276571 | 4.068571 | **0.0358001** | 0.0473153 |

**In all four controls, the observed unknown printed-word lengths are closer to the Latin register than to the contracted GP29 register.** The comparison is sensitive to prose style, editorial normalization, and the possibility that the printed boundaries are cipher output rather than plaintext boundaries. Its value is architectural: previous necessary-condition screens treated the printed words as GP29-encoded plaintext words, so their negative results cannot automatically be extended to ordinary 26-letter input.

## One explicit rare-marker mechanism worth discriminating

A complete positionwise candidate can map ordinary Latin plaintext **K** to a repeated ciphertext rune, `C[i]=C[i-1]`, while mapping the other 25 letters through a per-position or changing-state injection into the 28 **nonrepeating** rune choices. This has enough raw alphabet capacity to be reversible if the decoder has the authentic state/key; three nonrepeating choices remain unused per state. A page-first rune is an ordinary separately initialized header. This specifies a possible *family* of complete 26-to-29 input/output mappings, **not** a source-selected key, and the K assignment was noticed after observing the ciphertext repeat geography.

The zero-step positions predict that the unknown **Latin** plaintext contains 86 eligible Ks, with exactly 21 in long words and 23 at word initials. Holding each original word length and actual page-first eligibility mask fixed, draw independent reference words of *exactly the same Latin length*. The three expected K counts (all / long / word-initial) are:

| Reference | Expected eligible K | Long-word K | Word-initial K |
| --- | ---: | ---: | ---: |
| Gibran | 102.109 | 14.237 | 15.428 |
| Shakespeare | 98.844 | 14.584 | 23.611 |
| Emerson | 77.832 | 8.746 | 12.910 |
| Solved Cicada | 74.077 | 9.516 | 31.199 |
| **Original repeat events** | **86** | **21** | **23** |

Among all **26 ordinary Latin letters**, **K is the closest by the exploratory three-component Euclidean distance normalized by the square roots of the observed counts in each of the four sources**. This is a postselected descriptive ranking. Its long-word counts still show tension, especially in Emerson, and no exact word-level probability, matching dictionary, plaintext, key or output register has been established. All source reference totals are full-token source counts; the solved-Cicada reference excludes Markdown comment lines.

**Next decisive test:** use complete printed-word repeat masks (including the absence of K at nonrepeat sites) as an *exact* pattern against independent English dictionaries at the preserved Latin word lengths. If no credible source words can occupy many of those 2,896 slots, retire stationary Latin-K. If feasible, a separate original clue must supply the changing per-position injection or key; simply matching observed K markers does not decrypt a single other letter. The algorithm itself cannot be chosen by this statistical comparison.

**Reproduce:** `sims/lp2_latin26_wordlength_repeat_marker_sft.cjs`, using only the tracked original transcription and four local reference texts; no external downloads or guessed ciphertext keys.
