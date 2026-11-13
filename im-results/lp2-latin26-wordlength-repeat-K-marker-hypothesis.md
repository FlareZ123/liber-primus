# A Latin-letter plaintext register is a concrete alternative to GP29 plaintext

**Agent31, 13 November 2026. Status: new source-layout discriminator and a 26-letter marker candidate, not decipherment or an authenticated cipher.** The original 55 rune-bearing unknown pages contain **12,956 GP29 ciphertext runes, 2,896 printed words, 86 repeated within-page output pairs**. This source test asks whether the printed word lengths could correspond to ordinary **Latin spelling before runic contraction**, an architecture that previous GP29-specific zero-marker exclusions do not cover.

## Exact original measurements

Parsing the unchanged `resources/lp2-transcription.txt`, joining line wraps and page-continuation words but preserving hyphen/period punctuation, yields exactly 2,896 printed word lengths, 12,956 symbols, mean **4.473756906** symbols/word; **343 words of length eight or longer**. The full source word-length histogram for lengths 1 through 14 is **[83,448,720,513,317,256,216,156,78,52,32,18,4,3]**. Of the 86 literal within-page equal-successor positions, **21 occur inside words length≥8** and **23 at the first rune of a printed word**.

For each of four English references, compare the original 14-bin printed-word histogram with ordinary Latin-letter word lengths, legacy GP29 lengths (K/Q→C, V→U, Z→S, greedy TH/NG/EO/OE/AE/IA/EA), and a second GP29 encoding using the **source-calibrated spelling** established on solved LP1 p10–13 and independently checked on solved LP2 p57 (QU→CW, V→U, K/Q→C, Z→S, with ING and IO each emitted as one rune before the remaining GP tokens). This is a sensitivity check, not a claim that every unknown word follows one universal spelling convention. The reported divergence is the plain empirical `D_KL(original length distribution || reference length distribution)` in natural units. This is a **fixed-corpus comparison**, not a calibrated author-attribution probability.

| Reference | Latin mean | Legacy GP29 mean | Source-calibrated GP29 mean | D_KL Latin | D_KL legacy GP29 | D_KL source-calibrated GP29 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Gibran, *The Prophet* (15,733 words) | 4.228119 | 4.011568 | 3.972033 | **0.0151343** | 0.0357228 | 0.0404515 |
| Shakespeare (55,407 words) | 4.141137 | 3.948960 | 3.918386 | **0.0371898** | 0.0408087 | 0.0475132 |
| Emerson, *Essays* (77,932 words) | 4.367577 | 4.165555 | 4.123171 | **0.0117786** | 0.0427927 | 0.0424581 |
| Editor-normalized solved Cicada LP1/LP2 (875 words) | 4.276571 | 4.068571 | 4.011429 | **0.0358001** | 0.0473153 | 0.0376216 |

**The observed printed-word lengths remain closer to the Latin register than to either GP29 encoding in all four controls.** The source-calibrated GP spelling changes the margin substantially for solved Cicada (0.03580 versus 0.03762) and slightly for Emerson, but it does not reverse the ranking. This confirms that the Latin-register observation is not an artifact of omitting the newly authenticated ING/IO contractions. The comparison remains sensitive to prose style, editorial normalization, and the possibility that printed boundaries are cipher output rather than plaintext boundaries; it is an architectural discriminator, not evidence of Latin plaintext or a recovered cipher. Previous GP29-only necessary-condition screens therefore cannot automatically be extended to ordinary 26-letter input.

## Exact output-cardinality bound on static marker alphabets

The proposed mechanism reserves one of 26 Latin letters as the repeat marker, leaving **25 ordinary plaintext letters**. In any fixed state, an injective encoding of those 25 letters can emit at most **25 distinct nonrepeating GP runes**, even though 28 successors are available at each position.

On the original corpus, excluding each page's first rune (the separately initialized header) and the 86 repeated outputs, the remaining **12,815** nonrepeat positions use **all 29 GP rune values**:
- **53/55** rune-bearing physical pages use all 29 distinct nonrepeat outputs.
- The only exceptions are p49 (28 distinct) and p55 (25 distinct).
- All **nine** original visual chapters use all 29 distinct nonrepeat outputs.

Therefore a single fixed 25-letter→rune injection is impossible globally, and a mapping held fixed for one physical page or one original visual chapter is also impossible. In fact, **54/55** pages individually exceed the 25-symbol capacity. A viable version of the Latin26 marker family must change its nonrepeat mapping **within pages and within every visual chapter**, or abandon the assumed injective 25-letter register. This is an exact cardinality obstruction from the original source, not a language-score result.

It does not exclude a genuinely evolving state, per-position key, or word-/line-local changing map. None of those update rules or keys is currently selected by an original clue. The result makes the broad "per-position or changing-state" escape a real missing input rather than a free explanatory default.

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
