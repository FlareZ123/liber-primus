# Original seven-page p8–14: 7 × 247 all-secret seven-column gate

**Agent17, 13 November 2026.** Original source cue and finite English-model obstruction; **no recovered unknown plaintext, historical key, original cipher or continuation address**. This result is useful only for the explicitly defined seven-column, common-row-state hypothesis.

## Source-visible premise and competing explanation

The seven original LP2 physical pages **p8–p14** are bounded by a red opening at p8 and a red 13-dot terminal mark at p14. They contain exactly **1,729 GP29 runes = 7 × 247**. Physical **p10** also contains the lone standalone ordinary-prose Arabic numeral **7** in unsolved LP2, immediately followed by a one-rune **G**. The digit follows **169 p10 runes**, or **692** runes into the seven-page chapter. These facts might lead a human solver to try an equal seven-column layout. No printed command actually selects that grid or its key. The existing [7 G → 119 / p3,p39 red-triad route](../workplace/p10-seven-g-red119-source-bridge.md) is a competing interpretation of the same source. The seven pages' trees are **re-used stencils** in alternating margins, not an authenticated read direction ([original-image gate](lp2-p8-14-tree-stencil-source-gate.md)).

Cicada previously used a seven-column operation in the 2014 *A KOAN* stage; its historical transposition order is not an LP2 instruction. A pure transposition also preserves original GP29 unigram frequencies. The inexpensive question is whether a seven-column **shared unknown row key/state** could account for ordinary GP29 plaintext regardless of the secret alphabet or the order of seven positions.

## Exact key-independent invariant

For seven plaintext symbols in row r, suppose all seven pass through the **same arbitrary injective 29-symbol map** f_r, with an optional arbitrary within-row permutation. Every row can have its own independent, fully secret map. This grants 247 distinct unknown alphabets, a far more permissive key than a repeating Caesar pad.

Define E_r as the number of equal pairs among the seven symbols in row r. Injectivity ensures f_r(x) = f_r(y) exactly when x = y, and a seven-position permutation preserves the unordered equality counts. Therefore the **total number of equal rune pairs within seven-symbol rows is invariant under all such secret mappings and any of the 7! column orders**. No fitted key can improve it. A separate inverse map for each row recovers all runes without loss.

Two natural layouts are frozen in original order, without ciphertext fitting:

1. **Row-major:** 247 successive seven-rune groups.
2. **Column-major:** seven consecutive 247-rune groups, each row taking one rune from each group at equal local offsets.

A transposition moving symbols *between rows* is outside this gate.

## Measured original-input results

There are **247 × 21 = 5,187** possible within-row pairs per layout.

| Original ciphertext arrangement | Equal pairs |
| --- | ---: |
| Source row-major | **139** |
| Source column-major | **179** |

Three pre-2014 English source corpora were independently encoded with full original GP29 orthography, including V→U, K→C, QU→CW, Z→S, ING→NG, IO→IA and the seven digraphs. Complete **1,729-rune** source windows were sampled every 83 runes. Windows overlap, so these are finite control ranges, not independent samples or calibrated p-values.

| GP-native reference | Windows | Row-major minimum (mean) | Column-major minimum (mean) |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | 733 | **184** (236.270) | **261** (313.753) |
| Emerson, *Essays: First Series* | 3,851 | **184** (244.112) | **256** (320.552) |
| Shakespeare, 300k-character excerpt | 2,595 | **195** (249.459) | **254** (311.750) |
| **Original LP2 p8–14** | **1** | **139** | **179** |

The original is **below every one of 7,179 pinned native-English windows in both layouts**. A deterministic test encrypts a real 1,729-rune Gibran GP29 plant under a separately randomized secret 29-way permutation per row in each layout. Equality counts remain exact and all **1,729/1,729** native runes are recovered by the corresponding inverse, in both layouts.

**Research decision:** Retire a seven-page equal-column cipher whose sole operation is one GP29 substitution, additive pad or arbitrary symbol bijection **shared by all seven symbols in each row**, even with a secret separate key per row and arbitrary within-row reordering, if native-English plaintext is expected. Its exact original-runic collision count cannot be altered by any secret key in the specified family. Independently keyed columns, state changes within a row, cross-row transport, non-GP or non-English plaintext, and additional cipher layers remain possible. The printed 7 is a candidate source cue, not authenticated instructions.

## Reproduction

The exact [CommonJS original-input SFT](../sims/lp2_p8_14_sevenrow_allsecret_sft.cjs) uses checked-in original source, transcription and three pinned native-English controls. [Windows Actions run 43514671553 passed](https://github.com/FlareZ123/liber-primus/actions/runs/43514671553). The separate earlier 729/1729 taxicab test was **skipped**, not rerun; the existing manual-only workflow has a new sevenrow selection.

No unknown plaintext, secret alphabet, key phase or English scoring parameters were fitted to the original ciphertext.
