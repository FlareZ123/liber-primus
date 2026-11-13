# First two LP2 word-prime sums reuse the 2016 tree-image dimensions

**Evidence status (13 November 2026):** exact original-source numerical correspondence and matched-layout randomized control. This is a **source-linked clue hypothesis**, with no original unknown plaintext, key, complete decoder, or route. The 2016 image-size / p32 row-and-column correspondence was previously established; the **first-two-page unique-word alignment** is the new observation.

## Source-controlled finding

The archived January 2016 Cicada 3301 tree JPEG is 563 × 569 pixels. Its accompanying independently verified, extracted signed message says that Liber Primus's words are the map and their numbers are the direction. The dimensions are preserved in [the repository's 2016 source record](../resources/cicada2016-4gq25.md). The same pair is already known to equal **the first row's** and **the first column's** GP-prime sums of the original p32 121-rune 11×11 grid ([original p32 image study](lp2-p32-signed2016-tilepixel-key-gate.md)). Reuse of these same two numbers in another arithmetic view must be treated as correlated evidence, since the source pair was chosen once.

Using the canonical printed page order and glyph-to-prime table, and treating punctuation and printed word separators as word boundaries, the **entire 56-page unsolved LP2 region**, including the runeless p50, contains **12,956 rune symbols in 2,928 page-local segments**. Exactly one segment sums to **563** and exactly one sums to **569**:

| Image axis | Prime sum | LP2 physical page and word (one-based) | Original glyphs | GP values |
| --- | ---: | --- | --- | --- |
| Width | 563 | **p0 word 6** (11 glyphs) | ᚾᛖᚹᛒᚪᛋᛟᛇᛁᛝᚢ | 29+67+19+61+97+53+83+41+31+79+3 |
| Height | 569 | **p1 word 33** (10 glyphs) | ᛄᚠᛁᚾᛡᚳᚣᛠᛁᛡ | 37+2+31+29+107+13+103+109+31+107 |

They occur on the **first two physical pages in the image's width/height order**, and their prime sums are adjacent ordinary primes. The p0 word transliterates as \`NEWBASOEEOINGU\` in the repository's conventional one-token GP output, with no demonstrated plaintext meaning. The p1 word transliterates as \`JFINIACYEAIIA\`. Do not treat the leading English-looking \`NEW\` as recovered plaintext or infer a cipher from it.

The independent archived **2012** first-image dimensions **503 × 509** have only three 503-sum word hits and zero 509-sum word hits in the same unsolved region. This is a limited comparison between two historically available image-size pairs, not a comprehensive multiple-testing correction.

## Matched-layout discriminator

Use the exact original p0/p1 262 and 266 rune histograms, their original word-slot lengths (59 and 63 page-local words), and shuffle rune identities independently *within each page*, without moving boundaries. This null breaks an intended association between printed words and sums while respecting page-specific composition. A deterministic Fisher-Yates generator (unsigned 32-bit LCG seed **0x3301563**) makes **30,000** independent-page pairs.

| Frozen event | Null occurrences | Fraction of 30,000 |
| --- | ---: | ---: |
| Both 563 and 569 anywhere on p0 and/or p1 | 18 | 0.0006000 |
| **563 on p0 and 569 on p1** | **6** | **0.0002000** |
| Both also at observed exact word slots p0#6 and p1#33 | 0 | 0 in finite sample |
| At least one 563, irrespective of 569 | 828 | 0.0276000 |
| At least one 569, irrespective of 563 | 828 | 0.0276000 |

The source-image dimensions and order fix the primary ordered-page event; the exact word-slot numbers were discovered after inspection and must not be assigned a fresh 0/30,000 claim of significance. This finite p≈0.0002 is conditional on the explicit narrow shuffle model; it does not estimate the full research-wide false-discovery rate, compensate for all historically possible image dimensions or show the authors intended this link.

## Direct source-addressed 11+10-key inverse on p32: negative

The **11** runes of p0 word6 and **10** runes of p1 word33 fit the natural p32 **11×11** matrix as one complete horizontal key (11 columns) and keys for its **ten remaining rows** (the first row gets vertical offset zero). This is a stronger potential *consumer* than a numerical collision: the two unique source-addressed words determine all key symbols, and a two-dimensional additive cipher can be executed reversibly on the 121 original p32 runes.

Freeze all keys and p32's natural row-major order. For each original GP29 rune \`C[r,c]\`, compute either:

- an additive separable candidate \`P[r,c] = C[r,c] ± horizontal[c] ± vertical[r]\` modulo29, with \`vertical[0]=0\`; or
- a multiplicative outer-product candidate \`P[r,c] = C[r,c] ± horizontal[c]×vertical[r]\` modulo29, allowing vertical row0 factor 0 or 1.

Read each key rune either as its GP index or its corresponding prime weight modulo29. These form **16** fixed reversible original-cipher candidates with no key search, offsets, word selections or language-fitted exceptions. Both plain↔cipher directions round-trip all original **121/121** runes exactly by construction.

The original p32 output GP29 IoC ranges **0.032369–0.039394** over all 16. The best is GP-index additive \`(+horizontal,+vertical)\`, **IoC 0.039394**, starting **\`FLOALTGISEAOEEAWGENGMOERMAEMJYASEATHAEOIAOIATHWTMOYHJTHC...\`**. The actual untranslated original p57 *native GP English* source has IoC above 0.055 on its 95 runes (standalone reproducer prints its exact score). None of the 16 outputs yields recognizable native GP English. The source provides no further operation warranting rescue by rearranging key coordinates, selecting alternate word slots, or fitting cipher parameters.

**Decision:** the concrete 11+10 two-dimensional additive/multiplicative consumer does **not** decrypt p32. The two uniquely addressed original words remain a provisional numerical link, with no independently fixed use.

## Causal relevance and stop rule

This link supplies two *uniquely source-addressed printed ciphertext words*, and the signed 2016 guidance offers a plausible human reason to inspect word sums. It may be used to **propose a concrete next reversible operation or source-derived key/clock** if an independently readable clue supplies one. The 2016 dimensions already serve as p32 11×11 orientation markers, so there is a real competing explanation: their additional collision with opening-page word sums may be incidental.

The simplest successive-prime word walk has a blocker: after unique word sums 563→569, the next prime 571 hits **two** distinct LP2 words (p12#58 and p43#25); the subsequent prime 599 hits **no** original unknown word. Thus a global unqualified "go to the next prime" route is not supplied by this observation. A source-selected branch rule or independent withheld destination would be required to claim a route. Do not run arbitrary Vigenère variants or promote this to \`results/README.md\` without such a selector.

**Reproducible input and test:** [\`sims/lp2_2016_dimensions_firstwords_sft.cjs\`](../sims/lp2_2016_dimensions_firstwords_sft.cjs) on canonical [transcription](../resources/liber-primus/lp2-transcription.txt), [GP29 corpus](../resources/liber-primus/lp2-corpus.json) and the preserved source image dimensions.
