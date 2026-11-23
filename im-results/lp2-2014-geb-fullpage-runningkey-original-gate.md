# The authentic 2014 GEB book is not a literal full-page LP2 p0 running key

**Agent12, 23 November 2026. Original-input cryptanalytic negative; no unknown-page plaintext, authentic key or final puzzle destination recovered.** The complete independent Windows Node22 SFT passed in [GitHub Actions run 45168672298](https://github.com/FlareZ123/liber-primus/actions/runs/45168672298), original-test job 137672178888.

## Historical cause and explicitly bounded cipher

In 2014 the genuine Cicada Fifth Onion gave a book-code whose audiovisual clues selected **Gödel, Escher, Bach** (GEB) by Hofstadter. The following Onion6 material also independently demonstrated original-era GP29 Vigenère and selected-F bypass practice. This makes an original GEB text passage a historically accessible potential **running key**, with a genuine previously used encryption operation. It does not imply the publisher explicitly told solvers to reuse that source for LP2.

The prior [13-rune title-only GEB source gate](lp2-p0-2014geb-contiguous-sourcekey-original-gate.md) checked exactly two *guessed plaintext phrases* against the original p0 title. The present experiment needs **no guessed plaintext at all**, scans **every possible starting position** in the entire exact 2014 GEB text and tests the full unknown p0 page, not a short title.

Reproduce the original source edition, pinned to historical Git commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`, as [the 2014 GEB OCR](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/eternal-golden-braid.txt). It has exactly **1,951,562 UTF-16 characters**, including the historically identifiable `TORTOISE: Your argument is persuasive` at character 87,816. GP29-normalize with Cicada's K/Q→C, V→U, Z→S, QU→CW mapping and seven digraph runes. Because the historical running-key text spelling is a choice, test two **predeclared** alphabets: genuine NG ligature (1,394,375 GP symbols) and explicitly unligated N+G (1,407,029 symbols).

For **every** contiguous GEB substring of 262 GP symbols under either spelling and **both** Vigenère polarities, derive all **262 p0 original runes** from `P_i=C_i±GEB[start+i] mod29`. This produces exactly **5,601,764 different full original-page inverse evaluations**. No key, phase, word boundary, starting offset, or plaintext phrase is fitted before search. Score all candidates by the log-likelihood of single GP symbols trained on the independent, pinned Shakespeare-first-300k native-GP reference. Retain top five offsets per convention and inspect the full 262-rune candidate and its **untouched p1 266-rune continuation** under exactly the same key clock. Same-offset extension supplies a stronger cross-page discriminator than an attractive initial trigram.

## Entire original-source search result

Original p0 is 262 runes; original p1 is 266. The strongest complete p0 candidate under *any* original/source setting has an average GP log probability **−3.62359349**: source `N+G` or `NG` with **addition**, GEB GP offset 21,874 / 21,672 respectively, due to source tokenization. Its exact 262-rune output has **IoC 0.03699804**, compared with an independently solved p57 native GP text control with mean log probability **−2.91905300** and a separate original-era-independent Gibran 262-rune English passage with **−3.01179981** under the same fixed scoring rule. The strongest *subtractive* result is **−3.71341069** (ligated NG, source GP offset 222,013), IoC **0.03667632**. All four candidate groups have top-five GP readouts without a coherent English passage, and the untouched p1 continuations score roughly **−3.95 to −4.37**, still far from readable native GP29 English.

| GEB spelling | Vigenère polarity | Top complete-p0 log score | Top-p0 native-GP IoC | Top same-clock p1 log score |
| --- | --- | ---: | ---: | ---: |
| `NG` ligature | subtract | −3.71341069 | 0.03667632 | −4.19568358 |
| `NG` ligature | add | **−3.62359349** | 0.03699804 | −4.05422558 |
| `N+G` split | subtract | −3.73035363 | 0.03837267 | −4.23909378 |
| `N+G` split | add | **−3.62359349** | 0.03699804 | −4.12802225 |

For context, the original uninterpreted p0 ciphertext scores **−4.24575071** under the same Shakespeare letter model; random keys readily raise this toward −3.6 by maximizing over more than a million offsets. The modest score improvement alone is not plaintext, particularly when the complete decoded outputs and untouched p1 remain unreadable. Exact source offsets and 50-rune readout prefixes for **all top-20 original candidates** are preserved in the successful CI job log. The experiment made no trial translations by a language model and no fitted exceptions.

**Positive control:** A genuinely GP-normalized 262-rune excerpt of Gibran was encrypted with an exact 262-rune contiguous segment of the same pinned historical GEB edition at source GP offset87,816. The independent exact decoder recovered the entire planted **262/262** cleartext; among all 101 neighboring candidate key offsets, the planted offset was top-ranked for both source spellings. The original source values and cipher forward law are separately asserted in the same read-only SFT.

## Mechanism decision

No full original-page native English plaintext appears when the **unaltered original p0 GP29 ciphertext** is inverted with **literal contiguous 2014 GEB GP29 running text**, either polarity, for every original-book offset and two frozen source spellings. The result rejects this specific historically grounded way to reuse the earlier book as a direct additive key. It cannot exclude an independently selected GEB *book-coordinate program*, noncontiguous quotation, unknown F-transparent masks, alternate GP tokenization, changed plaintext boundaries, a separate encryption layer, or an original non-English message. These require evidence beyond the historical fact that GEB was once used as a book code.

**Reproduce:** [source-native Windows Node22 test](../sims/lp2_geb_original_runningkey_fullpage_sft.cjs), which retrieves the historical OCR at execution time for copyright compliance and never writes the book into the project. Its [GitHub Actions job](https://github.com/FlareZ123/liber-primus/actions/runs/45168672298) completed successfully after downloading the exact historical source, proving the independent controls, evaluating the entire source, and printing all original candidates. The next causal advance requires an actual author-selected coordinate/key schedule or deciphered substantial ciphertext.
