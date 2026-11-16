# Original LP2 word-length source-crib search: two intact sentences and merged sliding windows

**Agent37, 16 November 2026. Status: exact word-length search plus familywise coincidence calibration. No unknown-page plaintext, source-authenticated word order, or decryption key.** The data and results below refer to unchanged original runes; the strongest-looking Shakespeare match is explicitly provisional and does not meet a plaintext claim.

## Intended-route question

The signed 2016 phrase about *words as map* and *numbers as direction*, plus the unresolved disorder of adjacent printed word lengths, suggest a human-solvable source crib: a chosen earlier prose passage might survive as a whole-word **permutation**, hiding ordinary word order while preserving all word lengths. This route could recover a text **without first guessing a 29-symbol keystream**. A copied source with intact words produces a distinctive multiset signature that survives any word permutation.

Two deliberately different source models are tested against fixed source prose and against **all** printed LP2 sentence boundaries:

1. **Intact sentence boundaries:** both original and source have two consecutive sentences, with at least 13 words in each, and words can be permuted freely *within* either sentence; the two original word-length multisets must independently match the source.
2. **Moved sentence boundaries:** take the union of two consecutive original punctuation spans, again at least 13 words each; allow *any* permutation of all these words, including crossing the printed stop. Search **every contiguous source window** with exactly the combined original word count; original-source sentence boundaries are unconstrained.

These are finite, key-independent plaintext-source probes, not assumptions that GP29 is merely a transposition cipher. An alternative encryption that changes word lengths or a source other than the fixed files is outside their scope.

## Fixed original registers and five sources

The read-only code confirms every unchanged rune against \`resources/liber-primus/lp2-corpus.json\` before parsing \`resources/liber-primus/lp2-transcription.txt\`. Hyphens end words; \`.\`, \`&\`, \`$\`, \`§\` end punctuation spans; printed line/page wraps do not split words. Exactly **12,956 ciphertext runes, 2,896 complete printed words, and 175 original punctuation spans** are retained.

Historical and first-party reference text files:

| Corpus | Repository file | Punctuation spans (source model) |
| --- | --- | ---: |
| Gibran, *The Prophet* | \`resources/control/gibran_prophet_58585.txt\` | 1,007 |
| Emerson, *Essays* | \`resources/control/emerson_essays_2944.txt\` | 4,652 |
| Shakespeare excerpt | \`resources/control/shakespeare_first300k.txt\` | 7,110 |
| Solved LP1 plaintext (editor-normalized) | \`resources/liber-primus/lp1-plaintext-reference.txt\` | See executable output |
| Crowley, *The Book of the Law*, chapters I–III | \`resources/external/2013-book-of-law-{I,II,III}.txt\` | 733 |

Reference line breaks are reflowed, sentence punctuation \`[.!?;:]\` split, and each Latin source word has GP-native length, recognizing the multigraphs \`ING\` and \`IO\`, with conventional \`QU→CW\`, \`V→U\`, \`K/Q→C\`, \`Z→S\`. The LP1 textual source includes editorial headings and repetition, which can create extra false-positive windows; retaining it makes a null result stronger and any hit less decisive.

## Gate A: intact adjacent source-sentence bags

For observed/source sentence histograms, define the nonnegative deficit as the larger sentence's word count minus the sum of word-length histogram overlaps. A deficit of zero is necessary and sufficient for that pair of unordered word-length bags to match exactly.

Across the first four frozen reference corpora in the earlier run, the **smallest sum of two sentence deficits** is **6 Gibran, 5 Emerson, 6 Shakespeare, and 11 Crowley**, with **zero exact two-sentence matches**. The later run adds solved LP1 with the same exact-zero exclusion; all five source-positive plants recover after reversing words within two adjacent source sentences. These values do not constitute a probability calculation and do not exclude an unsearched source.

- Script: [\`sims/lp2_two_sentence_sourcebag_crib_sft.cjs\`](../sims/lp2_two_sentence_sourcebag_crib_sft.cjs)
- Original-input Windows Node22 successful execution [43907284289](https://github.com/FlareZ123/liber-primus/actions/runs/43907284289) and previous [43904985511](https://github.com/FlareZ123/liber-primus/actions/runs/43904985511).

## Gate B: arbitrary moved sentence boundaries in contiguous prose

The second test searches **40 eligible original adjacent-span pairs**, combining two printed spans with at least 13 words each, across **30 distinct total word counts**. A commutative double 32-bit rolling hash indexes **every source-word window** with the same number of GP-native word lengths. All candidate hash matches are independently compared as *complete sorted length multisets*, so a hash collision cannot produce a reported hit.

The search evaluates **4,668,330 contiguous word windows** over all five sources. It reports zero exact matches in Gibran, Emerson, solved LP1 or Crowley, and exactly **two overlapping 41-word Shakespeare windows**, both matching the *same original LP2 p19 consecutive span pair*, original punctuation span indices **68–69**. The source-word offsets (zero-based in the flattened Shakespeare file) are **35,571** and **35,572**. One matching window starts: "law renowned Warwick Who cried aloud What scourge for perjury Can this dark monarchy afford false Clarence..." Both complete 41-word length bags match after disregarding all source word order. The separate intact-sentence model **does not** match.

This **is a genuine source-text wordlength multiset coincidence**, verified without changing a rune, although the source does not independently select Shakespeare, its passage, the p19 page, or a cross-sentence permutation. It does **not** identify which plaintext word maps to which ciphertext word; the original runes are unchanged, and no cipher maps them to Shakespeare's letters.

- Script: [\`sims/lp2_sliding_merged_sentence_bag_sft.cjs\`](../sims/lp2_sliding_merged_sentence_bag_sft.cjs)
- Windows Node22 successful execution: [43907734085](https://github.com/FlareZ123/liber-primus/actions/runs/43907734085).
- The test includes independent reversed 44-word source-window plants that cross an invented split and recovers their actual source offsets in **all five** source corpora.

## Familywise calibration of the strongest-looking hit

An observed 41-word bag match after testing millions of candidate windows cannot be treated as the probability of that individual bag occurring at a prespecified source offset. The correct discovery event includes searching **all 40 original span pairs, all 30 eligible window lengths, and all five source corpora**.

The fixed deterministic null holds the original **multiset of all 2,896 complete word lengths** and every original punctuation-span size constant; it shuffles global word order uniformly with an unbiased Fisher–Yates index sampler using seed **\`0x20143301\`**. It repeats the *full same source-window search* for **2,000 independent shuffled original books**, comparing potential hits by exact bags after hash filtering.

| Whole-search score | Original result | Null trials meeting/exceeding original | Add-one null tail |
| --- | ---: | ---: | ---: |
| At least one distinct original span pair has an exact source match | 1 | **526/2,000** | **527/2,001 = 0.26337** |
| At least two matching source windows, including overlapping offsets | 2 | **217/2,000** | **218/2,001 = 0.10895** |

The global-shuffle null is a specified exploratory model; real word-length frequencies can vary by section, and neighboring source windows are dependent. Even under this simple null, the apparent 41-word exact match is **unexceptional after the actual search breadth is accounted for**. The two overlapping hits are one original candidate, not two independently recovered plaintext excerpts. There is no reason to redirect cryptanalysis to Shakespeare on this evidence.

- Script: [\`sims/lp2_sourcebag_global_multiset_null_sft.cjs\`](../sims/lp2_sourcebag_global_multiset_null_sft.cjs)
- Successful independent Windows Node22 run: [43908386002](https://github.com/FlareZ123/liber-primus/actions/runs/43908386002).

## Cryptanalytic decision

Retire the *source copied with unmodified native GP word lengths and scrambled as whole words* route **for these five exact source text files**, under the intact-sentence model. Under the more permissive moved-sentence-boundary model, retain the two exact Shakespeare offsets only as a recorded **likely chance match**, not a key or recovered plaintext. Broadening an undirected prose library risks accumulating numerological coincidences without a new independent clue.

A successor worth investing in would first identify an *original-period source-selecting clue* that chooses a particular author, passage, or word-order permutation before consulting its ciphertext fit. Alternatively, an original visual instruction might supply a reversible operation that changes word lengths, at which point this test is no longer the appropriate decoder. The positive controls show these code paths can recover copied whole-word-source passages if present.