# Word-boundary structure of the LP2 adjacent-rune doublets

**Classification: new structural constraint, not plaintext recovery.** This independently reproduces the 86 adjacent-equal rune sites in LP2 pages 0–54 and separates true within-word adjacency from pairs that become adjacent only after stripping visible word separators.

## Data and segmentation

Inputs are the repository's `resources/liber-primus/lp2-transcription.txt` and `lp2-corpus.json`. The first 55 page blocks (LP2 pp0–54) contain **12,956 runes**. In the transcription, `-` and sentence/punctuation markers delimit words; `/` marks a line ending and `%` a page ending. A line wrap alone does not split a word. Adjacent pairs crossing a page boundary are excluded.

The 86 doublet positions and 1,000-rune block counts reproduce the independent [Dukotah Round44 T7 report](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-B3-doublet-sites/RESULTS.md): **[8, 3, 7, 2, 6, 9, 10, 8, 11, 2, 9, 6, 5]**.

| Pair class | Sites | Available adjacent pairs | Rate |
|---|---:|---:|---:|
| Within a word | 63 | 10,028 | 0.628% |
| Across a word boundary | 23 | 2,873 | 0.800% |
| Across a line boundary | 4 (3 within-word, 1 cross-word) | 539 | 0.742% |
| Across a page boundary | 0 | 54 | 0% |

The 23 cross-word pairs are real transcription adjacencies only after spaces are stripped; they are not within-word doubles. Importantly, the positive gap-clustering signal is **not solely caused by stripping spaces**: the 63 within-word sites alone have gap lag-1 autocorrelation **+0.1786**, with a 10,000-draw position-conditioned null of **p=0.0023**. The 23 cross-word sites have AC1 **−0.0857** and upper-tail **p=0.91** under the same null. Thus the T7 signal persists within words, while the cross-word subset itself does not show positive gap clustering.

## A source-visible span with no cross-word doubles

There is a longer, more specific boundary anomaly:

- LP2 pp15–22, the visual chapter containing the Fibonacci/prime grid and infinity mark, has **0 cross-word doublets in 433 word boundaries** across 1,903 runes.
- The longest contiguous zero-cross-word-doublet run in the 55-page stream is **pp11–23**: 13 pages, 3,059 runes and **0 in 686 word boundaries**. Outside that span there are 23 in 2,187 boundaries (1.05%).
- A 100,000-draw max-run null assigns the 23 observed cross-word sites uniformly among all 2,873 boundary opportunities, preserving each page's number of opportunities. The probability of a zero run at least 13 pages long is **p=0.032**. This is a family-wise statistic over the full 55-page scan, not the unadjusted probability for a preselected window.

The endpoint marginals do not make the zero diagonal automatic: all 29 GP symbols occur as both word-final and next-word-initial runes in pp11–23. Under random pairing with those fixed marginals, the expected number of equal boundary pairs is **23.6**, versus zero observed. A 10,000-draw fixed-marginal permutation produced no zero-diagonal sample. This is a conditional diagnostic after selecting the zero-run span, so it is **not** a second family-wise p-value.

A bounded check for a simple source-authentic boundary transform also fails: across the 686 pp11–23 boundary pairs, the best (y=ax+b\pmod{29}) map matches **40/686**; a 5,000-draw max-over-812-affine-maps permutation gives **p=0.59**. The no-repeat diagonal is not explained by one fixed Atbash/Vigenère-style affine relation.

## Interpretation and limits

The robust observation is a **region-specific word-boundary derangement**: no word's final rune equals the next word's initial rune across pp11–23, despite 686 opportunities and full endpoint-symbol coverage. The data do not establish whether this is a rejection/filter rule in the encoder, a different word-boundary mode, or an unusual property of the unknown underlying text. It does not reveal a key or a reversible operation.

The page art is context, not proof: p11 and p23 carry tree illustrations; p15 has the red 3299 Fibonacci/prime grid and infinity mark; p22 has the three-bar cross/shrouded-body engraving; p24 has mayfly imagery. p10 also has a tree, so these motifs do not uniquely delimit the zero-run span. Independent external work likewise cautions that figural-motif signals fire in 80–99% of section-structured control books; see the [Dukotah research handoff](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/PICKUP-HERE.md) and [art-attribution catalogue](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round30/C1-art-attribution/RESULTS.md). Do not promote a “tree cipher”, “cross cipher”, or a general motif theory from this alignment.

## Next discriminating question

Does the pp11–23 zero-boundary run reflect a source-selected word-boundary encoding mode, or only the plaintext/word segmentation? The next useful work must identify an original clue that selects a reversible operation or key schedule for this span. Do not search arbitrary per-word maps or repeat the generic figural-motif scan.

## Reproduction

Run `node sims/lp2_word_boundary_doublet_audit.cjs` from the repository root. The script reads the two source files above and reproduces the segmentation, within/cross-word counts, conditional gap tests, 13-page max-run test, and affine boundary-map check with fixed seeds.
