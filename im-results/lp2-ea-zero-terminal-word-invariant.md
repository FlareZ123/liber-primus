# GP29 EA-zero models imply 19 anomalous terminal words on original LP2

**Finding, 15 November 2026.** Every reversible first-difference or ciphertext-feedback cipher that fixes **zero ciphertext step = plaintext EA (GP29 index28)**, without a separately encoded exception channel, has a **key-independent word-terminal consequence**. The exact printed original LP2 stream contains **19 within-word adjacent equality events at the last rune of an intact printed word**. Thus any such model preserving the authentic printed word boundaries and ordinary GP29 English requires **19 of 2,896 words** to end with the digraph rune EA, including **18 words with at least three GP runes**. On genuine first-party solved GP plaintext and two historical literature corpora actually used by Cicada, that word-ending frequency is drastically lower. This is a targeted, independent original-cipher **orthographic incompatibility**, not a decryption or universal mathematical impossibility theorem.

## Source-locked invariant and exact original sites

Define `D[i]=(C[i]−C[i−1]) mod29`. For every family with the irreversible implication `D[i]=0 ⇒ P[i]=EA`, a terminal ciphertext equality `C[i]=C[i−1]` forces a terminal plaintext EA rune at the same printed word endpoint. Cipher keys, prime streams, GF29 field multiplication, and two-back state updates cannot alter that consequence. The source itself has **86** within-page equal adjacent glyphs, of which **23** begin new printed words, **44** occur inside longer words before their last rune, and **19** occur inside a word **at its final rune**. None of the 19 arise from a page join or single-rune word. The exact 19 source words are enumerated with original word index and GP rune strings in the [CommonJS source-native SFT](../sims/lp2_ea_zero_terminal_word_gate_sft.cjs).

| Printed word length (GP runes) | 2 | 3 | 4 | 5 | 7 | 9 | 12 | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Original forced final EA count | 1 | 7 | 4 | 1 | 3 | 2 | 1 | **19** |

The complete original words and rune sequence derive from `resources/liber-primus/lp2-transcription.txt`, whose 2,896-word, 12,956-rune parser and cross-page word handling are separately controlled by the existing `lp2_lag5_word_boundary_locality_sft.cjs`. The 55 rune-bearing original physical pages are also independently checked against the original GP29 index corpus. The source-locked 19 constraints apply equally to any unknown key of the model with the stated EA-zero implication.

## Independent English controls: original-era Cicada sources

Use only **actual decoded native GP29 solved text** or English prose preserved as original-era Cicada puzzle source material. The same greedy GP29 normalization as existing source word-length work converts literary words: V→U, Q/K→C, Z→S, greedily recognizes ING, then TH/EO/NG/OE/AE/IA/EA as one rune. This maps literary suffix SEA to GP symbols S+EA, and YEA to Y+EA. Only complete ASCII alphabetic words are included in the historical literary corpus; the original solved texts already supply actual GP runes.

| Source | Words | Terminal EA | Words ≥3 GP runes with terminal EA |
|---|---:|---:|---:|
| Nine independently solved GP29 LP1/LP2 texts | 740 | 0 | 0 of 534 |
| Signed-2013-era *Book of the Law*, chapters I–III | 5,867 | 1 (YEA) | 0 of 3,934 |
| 2012-era Blake *Marriage of Heaven and Hell* complete Gutenberg source | 7,778 | 7 (SEA) | 0 of 5,513 |
| **Combined** | **14,385** | **8** | **0 of 9,981** |
| **Original unknown LP2 if zero=EA** | **2,896** | **19** | **18 of 2,365** |

The literary-only terminal-EA rate is **8/13,645 = 0.05863%**; the original forced model would require **19/2,896 = 0.65608%**, **11.19-fold** higher. The precise descriptive independent-binomial right tail under the former rate is **3.6554105×10⁻¹⁴** for 19 or more such words. At GP word length≥3, the original requires 18 final EA and the entire 9,981-word independent positive reference has **zero**. Its one-sided 95% binomial upper bound on that rate is **0.03001%**. These comparisons are linguistic diagnostics rather than cryptographic p-values: literary author/style, document normalization, iid assumptions, and alternative word segmentation may all differ.

## Mechanism decision

This newly identified boundary invariant applies to the previously tested 28-step EA-zero multiplicative model ([source key gate](lp2-ea-zero-differential-source-key-gate.md)), any additive or feedback rotation that treats the **zero step as plaintext EA**, including the [recently source-positively calibrated keyless two-back construction](lp2-28step-chain-keyless-lag2-counterexample.md). The latter already fails the complete original textual language gate (IoC≈1.02355), so the terminal test supplies an independent, key-insensitive obstruction that directly diagnoses why original 86 repeats should **not** be assigned all to plaintext EA in ordinary print-aligned English. A model might instead use a different zero-symbol interpretation, an independently specified escape channel, changed word boundaries, or a different plaintext language. Those are **distinct hypotheses requiring source clues**, not exceptions that can be introduced after observing a failure.

There is also a *clue-grounded cost* to rescuing this family by redefining printed words. The original solved LP1 **A WARNING** passage explicitly directs the reader to preserve the book's words and numbers ([source-native plaintext](../resources/liber-primus/lp1-plaintext-reference.txt)). If a proposed solution refuses all original terminal EA words, it must change the interpretation of **at least 19 distinct printed word ends**, since the 19 affected terminal doublets belong to separate words. The original instruction does not forbid a deliberately indicated recoding of word boundaries, but it makes an unannounced 19-boundary rescue less plausible as the creator's intended first step. This is a human-solve-path interpretation of an exact source requirement, not a new cipher exclusion.

The source-caption and earlier signed material do not explicitly identify zero steps as EA. The fact that the *aggregate* doublet rate equals EA's frequency in solved GP29 prose is insufficient to overcome the exact original positional contradiction. Further EA-zero key scans will not repair these 19 forced endings if word boundaries and EA spelling are retained.

**Result:** bounded word-ending incompatibility applicable to the whole EA-zero family under clearly stated English, separator, and alphabet assumptions. **No LP2 original plaintext, key, or destination recovered.** Exact SFT: [`sims/lp2_ea_zero_terminal_word_gate_sft.cjs`](../sims/lp2_ea_zero_terminal_word_gate_sft.cjs).
