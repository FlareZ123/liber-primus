# Wordwise deterministic substitution: equality-partition lower bound

**Agent 6, 2026-11-10. Status: reproducible conditional statistical constraint, no LP2 decryption.**

## Key-independent mechanism test

For a plaintext word of rune indices \(P_1,\ldots,P_n\), suppose a ciphertext word is obtained by one deterministic rune map \(f_w\) used at **every character position of that word**:

\[
C_i=f_w(P_i).
\]

The map can change arbitrarily at every word boundary. It need not be bijective; it may merge plaintext symbols. It is allowed to be a different 29-to-29 mapping for each word. However it may not change from one occurrence of a plaintext symbol to the next *inside* the same word, split one input rune into multiple runes, reorder rune positions, or change the displayed word boundary.

Whenever \(P_i=P_j\), one has \(C_i=C_j\). In particular the nonadjacent equality count

\[
T(S)=\sum_{\text{rune words }w,\ 4\leq |w|\leq9}
\sum_{1\leq i<j\leq |w|,\ j-i\geq2}\mathbf 1[S_{w,i}=S_{w,j}]
\]

satisfies the **exact mathematical inequality** \(T(C)\geq T(P)\). A bijective per-word map preserves equality patterns exactly. A non-injective per-word map can only introduce additional coincidences. Thus word-by-word one-alphabet substitution from a natural-language GP plaintext has a necessary repeated-symbol fingerprint, even if every word has a distinct secret cipher alphabet and there is no global statistical letter frequency to recover.

This is a conditional inference about a proposed plaintext language and the fidelity of displayed word boundaries. Without independent plaintext, it is not an absolute cryptographic impossibility claim. A positional keystream, multiple per-rune homophones, extra insertion/deletion, permuted positions, or another language escapes this particular invariant.

## Inputs and parsing

- Canonical \`resources/lp2-transcription.txt\` with 57 rune-bearing segments. The first 55 are unresolved, and the runeless LP2 manuscript page 50 is absent. Join the first 55 segments **without** introducing word boundaries between them. Remove \`/\` line-wraps, retain punctuation/hyphen word splits, map 29 rune glyphs to GP indices from \`resources/liber-primus/lp2-corpus.json\`.
- The correct result is **2,896 rune words** totaling **12,956 runes**. A page-by-page tokenizer would incorrectly create 2,928 words.
- Primary natural-English comparison: \`resources/control/shakespeare_first300k.txt\` (first 300,000 bytes of an available Shakespeare text), split into letter words and encoded into the 29-symbol GP alphabet, including one rune for common \`TH/NG/EO/OE/AE/IA/EA\` two-letter sequences.
- Additional controls: \`resources/liber-primus/lp1-plaintext-reference.txt\` after removal of metadata, and the **set of distinct Shakespeare word spellings** rather than word tokens. The latter avoids excessive weight on frequent repeated thematic words.

Use each control's observed GP word-length distribution to sample exactly the same number of words of length 4, 5, 6, 7, 8 and 9 as LP2. Length-matched Monte Carlo resamples reference words with replacement, 20,000 replicates with predeclared xorshift seeds, recording \(T\). Analytic standard deviations use the same by-length empirical reference distributions, assuming independent sampled words. This independence and the spelling/text register are explicit modeling assumptions.

## Observed outcome

The 1,536 LP2 words of 4–9 runes contain **526 nonadjacent equal-symbol pairs**. Direct word-length-matched control results from [on-demand CI 42742667912](https://github.com/FlareZ123/liber-primus/actions/runs/42742667912):

| Word source | Predicted mean \(T(P)\) | SD | LP2 observed \(T(C)\) | Standardized score | Lower-tail empirical \(p\) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare tokens | 707.879 | 26.442 | 526 | -6.878 | < 0.00005 |
| Solved LP1 reference tokens | 747.604 | 29.760 | 526 | -7.446 | < 0.00005 |
| Unique Shakespeare word spellings | 662.076 | 25.092 | 526 | -5.423 | < 0.00005 |

All 20,000 resamples exceeded 526 for each reference. The recorded +1 empirical p estimator is 1/20,001 ≈ 0.0000499975. This is the Monte Carlo resolution, **not** a precise estimate of the true tail. The test was designed following examination of LP2 statistics, so its p-value should be interpreted as conditional/exploratory rather than a preregistered discovery significance.

Counts by rune-word length in the primary control:

| Runes | LP2 words | LP2 equal pairs | Expected English equal pairs |
| ---: | ---: | ---: | ---: |
| 4 | 513 | 52 | 37.08 |
| 5 | 317 | 72 | 63.66 |
| 6 | 256 | 110 | 110.15 |
| 7 | 216 | 111 | 152.33 |
| 8 | 156 | 113 | 241.55 |
| 9 | 78 | 68 | 103.09 |

Much of the deficit appears at lengths 7–9. The result is not driven by short two- or three-rune words.

## Adjacent-repeat robustness and exact positive control

To eliminate the known anti-doublet effect as the immediate explanation, run a secondary test on *only words without adjacent identical GP runes*, in both the LP2 and the English control. Use the same nonadjacent pair statistic. There are 517 such pairs in the LP2 words of lengths 4–9. The expected controls are:

| Word source conditioned on no adjacent repeats | Expected \(T(P)\) | SD | LP2 \(T(C)\) | z | Resampled lower-tail \(p\) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare tokens | 721.498 | 25.715 | 517 | -7.952 | < 0.00005 |
| Solved LP1 reference tokens | 763.290 | 29.661 | 517 | -8.303 | < 0.00005 |
| Unique Shakespeare spellings | 655.935 | 23.873 | 517 | -5.819 | < 0.00005 |

A deterministic positive control draws 1,200 plaintext GP words and applies an independently randomized **bijection of all 29 rune labels to every word**, using seed \`0x5ee0cafe\`. Every planted word preserves the exact adjacent and nonadjacent equality counts. This verifies the claimed invariance at the granularity being measured, including independent alphabets.

## Interpretation, caveats and next use

**Under a length-matched natural-English GP plaintext model, these 55 LP2 pages do not behave like arbitrary deterministic per-word rune substitutions.** The measured nonadjacent repeated-rune deficit persists despite conditioning out adjacent equal runes and when the English control uses unique word spellings instead of token frequencies. The rigorous key-independent inequality is a constraint that can falsify specific plaintext hypotheses without recovering any key.

It is still possible for the actual source to be a very low-repetition register, unusual language, a code, homophonic random-per-occurrence ciphertext, or an algorithm that inserts/deletes/reorders runes. English source encodings and actual word boundaries remain assumptions; this does not decrypt LP2 or identify its cipher architecture.

**Reproduce:** \`node sims/word_partition_invariant.cjs\` from the repository root; program asserts exact 2,896-word and 12,956-rune invariants, prints full by-length data, bootstrap seeds, positive control, and statistics. Code and all corpus inputs are committed. Successful execution [CI run 42742667912](https://github.com/FlareZ123/liber-primus/actions/runs/42742667912).
