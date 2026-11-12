# Original-word constraint on a fixed variable-length GP29 codebook

**Classification: exact conditional length lower bound, not a decryption.** This result closes a concrete escape from the existing fixed one-rune/one-letter homophonic exclusions: replacing each GP29 ciphertext rune with an independently fixed, nonempty *English alphabetic string of arbitrary length*, while preserving the original printed spaces/word boundaries and requiring a uniquely invertible per-rune codebook.

## Why this branch is source-plausible, and its missing selector

The authentic 2013 \`gematria.jpg\` publishes 29 rune classes with letter and multigraph labels (TH, EO, NG/ING, OE, AE, IA/IO, EA). A human might therefore try a *variable-length* reading, especially because some original glyphs already spell multiple Latin letters. The original solved LP2 p57 is an orthographic positive control: 95 GP runes correspond to 101 edited alphabetic letters. [Original 2013 GP source and solved-page controls](../results/2013-original-gp29-source-map.md).

This clue determines a visible *transliteration convention*, not a different unknown-page codebook, a secret set of English words, or permission to move/erase original word boundaries. Thus a proposed new static codebook still needs an independent source selector. The following original-input theorem makes its simplest version quantitatively implausible before fitting 29 arbitrary words.

## Exact original-source observation

The canonical physical p0–55 source has **12,956 runes and 2,896 printed words**. Reading the original transcription requires joining \`/\` line breaks and \`%\` page breaks *within words*, retaining \`-\` and \`.\` as true word delimiters. The frozen reproducer checks all 12,956 resulting rune indices position by position against \`lp2-corpus.json\`, then checks the 2,896 words.

There are **83 one-rune whole-word tokens from 28 distinct rune classes**. The only GP rune never appearing as an entire one-rune word is source index 5, **C/K**, which appears 443 times globally. All 29 ciphertext runes are frequent, with 399–492 occurrences in the unknown corpus. Even a variable-length codebook must handle these actual standalone symbols as complete plaintext words if the original word boundaries are literal and preserved.

## Tight combinatorial lower bound

Let \`f\` map each of the 29 ciphertext rune types to a fixed **nonempty Latin alphabetic string**, injectively. Assume that whenever a source rune is a complete printed cipher word, its decoded \`f(r)\` must itself be a complete ordinary English word. Standard contemporary English has only two ordinary alphabetic one-letter whole words, \`A\` and \`I\`.

Because 28 *different* cipher runes occur as entire one-rune words and \`f\` is injective, at most two of those 28 types can have one-letter decoded strings. Every other standalone rune class must produce **at least two letters at every occurrence**. The 29th, nonstandalone rune can be one letter.

For minimum total decoded length, assign the two available one-letter slots to the *most frequent* standalone cipher classes. These are source indices 22 and 24, labeled **OE** (492 occurrences) and **A** (482 occurrences). This assignment is an optimization witness only, **not a proposed plaintext substitution**. The 26 remaining standalone types contribute a mandatory extra 11,539 letters, so:

\[
L_{\mathrm{plaintext}}\ \ge\ 12,956+11,539
=\mathbf{24,495\ alphabetic\ letters}.
\]

Since the 2,896 printed words remain fixed, their **minimum average decoded word length is 8.458218 letters**. This is a **1.8906×** lower-bound expansion from original runes. The source currently has 4.473757 runes per printed word. These word lengths are far above the roughly four-to-five-letter prose of the already solved LP1 material, although English itself has no universal maximum average word length. This is an exact *conditional* lower bound, not an unconditional language impossibility proof.

Treating archaic \`O\` as an additional permissible one-letter word gives **24,024 letters** and average **8.295580 letters/word**. The conclusion survives this more generous convention.

### Implication for a short-output, noninjective homophonic rescue

Suppose instead a proposed fixed codebook must produce at most **six alphabetic letters per original printed word on average**, with no deletions or word-boundary changes. Even when the most frequent types are granted shorter codewords, **at least 18 of the 28 standalone rune types must each map to one-letter output**; with only \`A\` and \`I\` as English one-letter words, **at least 16 rune-type distinctions would collide**. Under an ordinary memoryless whole-rune substitution this cannot be reversed uniquely. Such a branch needs a source-defined changing state, side information, or a nonliteral whitespace interpretation, and must specify how original glyph identities are recovered.

More generally, for any allowance of \`m\` distinct one-letter whole words, sort the 28 standalone rune classes by descending original-corpus frequency, then take

\[
L_{\min}(m)=12,956+\sum_{j=m+1}^{28} c_{(j)},
\]

where \`c_(j)\` are those sorted class counts. This is an exact lower bound on output length without key enumeration, dictionary tuning, or unknown-plaintext scoring. The published CJS reproducer enumerates all 29 empirical counts and checks the ordering.

### Source-visible nine-chapter reset sensitivity

The original red-heading chapter cuts are independently visible at global GP rune offsets **0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956** ([original-image chapter map](lp2-global-original-visual-section-map.md)). All eight internal cuts fall exactly between complete printed words.

Granting a separately injective, entirely unknown static English codebook in each of those nine chapters weakens the length bound sharply:

| Original chapter | Pages | Rune positions | Printed words | Standalone rune types | Minimum alphabetic letters |
|---|---|---:|---:|---:|---:|
| 1 | 0–2 | 729 | 158 | 5 | 801 |
| 2 | 3–7 | 1,145 | 255 | 7 | 1,328 |
| 3 | 8–14 | 1,729 | 383 | 9 | 2,127 |
| 4 | 15–22 | 1,903 | 437 | 12 | 2,530 |
| 5 | 23–26 | 1,021 | 224 | 5 | 1,120 |
| 6 | 27–32 | 1,433 | 326 | 8 | 1,726 |
| 7 | 33–39 | 1,680 | 378 | 9 | 2,060 |
| 8 | 40–53 | 3,008 | 669 | 11 | 3,915 |
| 9 | 54–55 | 308 | 66 | 2 | 308 |
| **Total** | **0–55** | **12,956** | **2,896** | **chapter-specific** | **15,915** |

Thus independently rekeying at those nine *visually attested* cuts reduces the best-case necessary mean to **5.495511 letters/printed word**. This does not exclude ordinary-English-like length output by itself. The cuts are genuine reading boundaries, **not authenticated cryptographic codebook resets**. This sensitivity is a counterexample to transferring the global 24,495-letter lower bound to arbitrary chapter-local mappings.

## Correctness control and reproduction

- [CommonJS original-input SFT](../sims/lp2_static_codeword_wordlength_bound.cjs) parses the canonical source's actual word boundaries; asserts **12,956**, **2,896**, **83**, **28**, and the absent lone C/K; derives both language-register sensitivities, the nine original-chapter conditional bound, and the six-letter collision threshold; and compares every source glyph with the independent canonical page-index arrays.
- As a constructive *mathematical* positive control, it chooses \`A\` and \`I\` for the two most frequent standalone types, \`Z\` for the nonstandalone type, and 26 distinct \`BA\`–\`BZ\` strings for the remaining standalone types. These strings form a prefix-free, bijective synthetic codebook, exactly attain the **24,495** lower bound, and reconstruct **all 2,896 source words**. This does **not** claim they form English plaintext or authentic Cicada key material.
- All counts are calculated from [the canonical corpus](../resources/liber-primus/lp2-corpus.json) and [page/line/word transcription](../resources/liber-primus/lp2-transcription.txt). Existing separate fixed *one-letter* information bounds are in [homophonic information](homophonic-information-bound.md) and [surjection entropy](homophonic-downward-surjection-ioc-bound.md); this test concerns nonempty variable-length output strings and so does not duplicate those theorems.

## Decision for Director #525

The original 2013 source selects rune names, letters/digraphs and prime weights; solved p57 supports orthographic use. **No original source inspected here selects a new fixed GP29→English-word codebook or a unique inverse for unknown LP2.** The simplest word-preserving injective variable-length alternative has a 24,495-letter output floor; the short-output noninjective rescue loses many original rune distinctions. This sharply demotes the **globally constant** static architecture. A codebook that resets by original-image chapter is not length-excluded, though the source does not prescribe such resets. Explicitly source-selected stateful codebooks, different plaintext languages, altered word boundaries, or an independently recoverable restoration channel remain open. There is **no new unknown-page plaintext, key or destination**.
