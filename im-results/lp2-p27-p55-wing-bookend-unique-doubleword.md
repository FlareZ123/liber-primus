# LP2 p27/p55 wing bookend: one exact repeated two-word ciphertext phrase

**28 November 2026, Agent47. Evidence class: original-scan corroborated, independently repeated literal ciphertext observation with an exact conditional word-order null. It is not decrypted plaintext, a recovered key, proof of a common page cipher, or proof of author intent.**

## The physical clue and exact statement

The first 56 unknown LP2 pages can be partitioned into two 28-page halves, **p0–p27** and **p28–p55**. Their last pages **p27** and **p55** share an illustration theme visible without decipherment: original scan **44.jpg (p27)** has a prominent **veined insect wing** above the writing, while original **72.jpg (p55)** ends with an **entire winged moth/insect** below the writing. This physical association is separate from the numerical ciphertext calculation. It was noticed **after** the exact textual match and must not be treated as a blind registered prediction.

Inspect the exact unmodified 29-rune ciphertext:

| Original page | Printed location | Zero-based rune position | Two literally printed words | Boundary |
| --- | --- | ---: | --- | --- |
| p27 = original image 44.jpg | sixth and seventh visible rune words (word indices 5–6), on the first black-text line after its red opening | **28–33** | `ᛞᛄᚢ-ᛒᛖᛁ` | after a separate red heading (red runes 0–18) |
| p55 = original image 72.jpg | last two printed words, word indices 15–16 | **70–75** | `ᛞᛄᚢ-ᛒᛖᛁ` followed by a red 13-dot mark, transcribed `.` | **the literal last six runes of the page** |

The shared six-rune vector is **`[23,11,1,17,18,10]`**, Gematria Primus transliteration **`DJU BEI`**. The first word `DJU` occurs exactly twice as a *complete* ciphertext word in these original pages, as does `BEI`; in both appearances the words form that **same consecutive pair**. Crucially, the literal hyphen between the two words and the **red 13-dot large punctuation mark immediately after p55's last word** survive in the original scan. The supplied transcription represents the latter as a period delimiter; it is **not an ordinary small Latin full stop**. On p27 another **red 13-dot large mark sits at original rune boundary 19**, immediately after the 19-rune red opening; nine black runes follow before the copied pair begins at rune28. The same red-large-mark convention at these wing-themed pages supplies an additional visible framing fact, although these marks also occur elsewhere and cannot by themselves uniquely identify the pair. These two source-typed marks are recorded at exact positions by [LP2 ink annotations](../resources/liber-primus/lp2-ink-annotations.json). `DJU BEI` is *not readable GP29 plaintext* and no substitution value for it is assumed.

The repository's [original-corrected transcript](../resources/transcriptions/lp2-image-corrected.txt) and [other historical transcript](../resources/lp2-transcription.txt) independently yield this **identical word segmentation and exact rune vector**, each verified against [the page-indexed original numerical corpus](../resources/liber-primus/lp2-corpus.json). Source scans: [44.jpg](../resources/liber-primus/44.jpg), [72.jpg](../resources/liber-primus/72.jpg). The original page numbering here is the **LP2 zero-based physical** page index, not the original JPEG numbering.

## Exhaustive source-wide search (no language fitting)

Read the 55 rune-bearing unknown pages p0–55 (the original numeric panel p50 contains no runes) as source-exact original words: a word ends only at visibly printed `-`, `.`, `$`, `&` or `§`; whitespace and slash are print-line wraps, not automatic word breaks. Under this explicitly declared parser, the unknown original corpus contains:

| Source-wide quantity | Exact count |
| --- | ---: |
| Unknown rune-bearing pages | 55 |
| Unknown GP29 runes | 12,956 |
| Complete printed source words | **2,928** |
| Distinct complete printed word types | 2,744 |
| Adjacent complete-word windows wholly within one physical page | **2,873** |
| Visibly printed 3-rune + 3-rune consecutive-word windows | 182 |
| **Any** duplicated consecutive complete-word type, regardless of length | **1** |
| Duplicated consecutive type with two 3-rune words | **1 — precisely `DJU BEI`** |

The exhaustive **runic substring** census across all 12,956 original unknown runes (allowing windows to cross page boundaries) independently finds **one** repeated length-six type, the same `DJUBEI`, and **zero** repeated length-seven types. This gives two original-structural descriptions of one event, **not two independent confirmations** to multiply.

A different historical parser may count **2,896** book-wide words because of alternate sentence and page delimiting rules (used in the separate p50 transposition gate). That does **not** change this source-defined observation: the report's 2,928 tokens are the full original-punctuation delimited words counted under the exact visible printed separators above. Both printed transcript sources yield 2,928 and the same unique copied pair under this parser. Page/line word carry is not used as a delimiter.

## Conditional selectivity: exact whole-token random-order null

A source artifact could produce sparse repeats naturally if its word inventory is constrained. The appropriate cheap baseline here is **not an independent random 29-rune stream**: hold fixed *each original whole-word token*, all token multiplicities, the 55 physical page word counts and the 2,873 actual adjacent-in-page word slots. Randomly permute these exact 2,928 intact tokens uniformly between those source slots; ask how many *two-word ordered windows* appear at least twice anywhere, regardless of where the repeats fall.

There are `M=2873` valid adjacent-word windows. Exactly `O=2818` pairs of such windows overlap in a common word slot (neighboring windows within the same page); the other `D=4,122,810` window pairs are disjoint. Let `f_t` denote the **fixed original occurrence count** for word type `t`. Define
`S2=Σ f_t(f_t−1)`, `S2sq=Σ[f_t(f_t−1)]²`, `S3=Σ f_t(f_t−1)(f_t−2)`, `S4=Σ f_t(f_t−1)(f_t−2)(f_t−3)`. Counting matching ordered bigram windows under sampling without replacement gives the **exact expected number of collisions**:

`E = D × (S2²−S2sq+S4)/(N(N−1)(N−2)(N−3)) + O × S3/(N(N−1)(N−2))`, where `N=2928`.

This is exact because a nonoverlapping pair match requires four corresponding slots and an overlapping pair match requires three consecutive **identical** word tokens. For any word-type bigram, the observed event is counted irrespective of page selection, motif spelling, location within the page, or copies' word type, so this calculation charges for searching all 2,873 positions.

| Eligible repeated bigram vocabulary | Original multiset `S2` / `S3` | **Expected collision count under whole-word shuffled null** | Implied bound by Markov on at least one |
| --- | --- | ---: | ---: |
| Any two complete words, of any length | 560 / 906 | **0.01746204** | ≤ 1.7463% |
| Both words exactly three runes | 34 / 6 | **0.0000604797** | ≤ 0.006048% |

The smaller number does **not** mean that Cicada intended this link with 99.994% confidence: the source itself need not be an exchangeable bag of word tokens, and the 3+3 restriction was inspected after the discovery. It does establish that the double word is **very non-generic under a transparent null preserving the exact original word vocabulary**. The shared red-13-dot page-boundary punctuation, wing resemblance, position near p27's beginning and at p55's end, and exactly **28 physical page steps** are contextual features **not included** in either bound, and are *not* used to claim an independent adjusted probability. Nor is the earlier structural GF(29²) semilinear `T²=8I` / `T^28=−I` operation a cipher instruction here.

## Research consequence and next discriminating experiment

This is a strong **original-cipher cross-page literal anchor** for a human puzzle route that was missing from our many arithmetic and language-scored inversions. It changes what should be inspected next: p27's red heading and wing, its immediately following `DJU BEI`, and p55's final `DJU BEI.` may be a deliberate *navigation bookend, mark of a recurring cipher state, short encoded phrase, or literal thematic recurrence*. Which, if any, remains unknown.

The next credible source-constrained decision is to ask **what independently visible art or earlier Cicada instruction would lead a human to copy, compare or follow exactly this two-word value**, without choosing an output word or key after seeing the pair. A useful prospective test would freeze a transfer rule derived from p27's red heading or wing framing, then apply it to p55's final 6-rune pair and at least one genuinely **withheld neighboring segment or another page**; successful results must constitute a reproducible authentic plaintext or a confirmed instruction from the original artifact. If a rule needs unconstrained page-dependent keys, arbitrary rune substitutions or language-model selections, discard it.

Do **not** promote `DJU BEI` to plaintext, an onion address, or an authenticated key. The existing all-840-seed Q/T direct body inverses on p54+p55 remain negative; this new copied phrase by itself does not rescue them or pick a field decoder.

## Reproduction

Run [`node sims/agent47_p27_p55_insect_wing_doubleword_sft.cjs`](../sims/agent47_p27_p55_insect_wing_doubleword_sft.cjs) at repository root. The source reads only checked-in original-derived texts and signed-off page rune indices, reconstructs every complete original word on both independent transcripts, exhausts every consecutive word and length-six/seven runic substring, asserts the 28-page bookend, and computes the exact finite-token-multiset null without randomized sampling. The original JPGs must be inspected visually for artwork and rune-position layout; no image classifier or OCR is needed to obtain the reproduced ciphertext claims.
