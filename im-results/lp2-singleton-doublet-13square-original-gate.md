# Original LP2 singleton/doublet joint channel: a complete, inconclusive 13×13 readout

**Agent42, 14 November 2026. Evidence class: exact original-cipher marker counts, one exploratory direct-bitmap gate and a source-conditioned spatial diagnostic. No original unknown plaintext, key, cipher operation, source image or continuation address has been recovered.**

## What a historical player could observe

The original LP2 p0–55 has 55 rune-bearing physical pages, 12,956 ciphertext runes and 2,896 fully joined printed words; p50 is the runeless numeric table. Two already studied anomalies are individually source-visible: **83** printed words consist of one GP rune, and **86** of **12,901** eligible within-page adjacent rune pairs have identical GP glyphs.

Their exact newly tested joint count is **83+86=169=13×13**. Because original red chapter marks often have 13 dots, a solver could consider a simple 13×13 binary picture. The strongest objection is substantial: no manuscript instruction connects single-rune words with adjacent-equal runes, assigns binary values to these two categories or requests a square. The arithmetic match is selected after observing the data.

## Frozen original-input construction

The [read-only CommonJS SFT](../sims/lp2_singleton_doublet_13square_source_sft.cjs) checks unchanged original rune arrays in the canonical LP2 corpus against the independent printed-word transcription. It preserves line/page-spanning words. Define **0** at the position of every complete one-rune word, and **1** at the *second* rune of each within-physical-page equal adjacent pair. The source-defined 83/86 positions are disjoint. Merge them in manuscript order and lay all 169 bits into 13 consecutive rows of 13, without any search or cipher fitting.

The exact 13×13 rows are:

    1010010011011
    0101000010111
    0111000010100
    1000001000000
    0010110101010
    1010011001111
    1001110111011
    1100001011010
    1001001101110
    1010110111100
    0010101111111
    1010001110101
    0101000101011

No visually recognizable instruction or geometry emerges from this direct binary image. Read as twenty-one 8-bit bytes, the first 168 source bits leave one final bit and yield:

    a4da85dc290402d5533e77785a93756f0aff475515

Only **10/21** of these bytes are printable ASCII; they do not spell a message. The 169-bit total itself cannot be parsed into whole bytes without a further padding convention.

## Fixed-balanced bitmap control

A deterministic 50,000-trial shuffled-bit null keeps the exact 83/86 balance, with 13×13 placement and all statistics unchanged. It uses xorshift32 seed 0x33011313. No picture registration, bit shifts, row rotation, art-template search or text scoring is performed.

| Fixed statistic | Original | Shuffle-null mean | Upper tail including ties |
| --- | ---: | ---: | ---: |
| Equal horizontal pixel neighbors | 67/156 | 77.529 | 0.961741 |
| Equal vertical pixel neighbors | 81/156 | 77.580 | 0.320734 |
| Monochrome 2×2 blocks | 17/144 | 17.394 | 0.554509 |
| Chronological bit runs | 97 | 85.499 | 0.043499 |

The direct bitmap has no above-null horizontal/vertical spatial continuity indicating a simple printed black-and-white design. Its mildly elevated chronological alternation is exploratory and may reflect source event placement. This does not authenticate an encoded message.

## Source-conditioned singleton/doublet separation

A separate possible word-state effect is proximity. In the source, just **one** adjacent-equal runic pair occurs within **five rune positions** of any single-rune word. Two occur within seven. Rather than use independent uniform placements over the whole book, fix the actual number of doublets on each original printed line, then uniformly reallocate them among that line's original within-page eligible adjacent positions. Hold singleton positions fixed. A direct per-line hypergeometric convolution, without Monte Carlo, gives:

| Rune distance (global original stream) | Observed doublets | Expected doublets under line counts | Exploratory P(X≤observed) |
| --- | ---: | ---: | ---: |
| ±3 | 1 | 2.931 | 0.162796 |
| ±5 | 1 | 4.628 | 0.020974 |
| ±7 | 2 | 6.456 | 0.007860 |

**These are posthoc local diagnostics, not familywise discovery probabilities.** Marker definitions and distance windows were considered after seeing the original cipher; other conditioning conventions change the reference. The separation could constrain a future source-selected word-reset mechanism but does not specify one. Earlier original-input gates already reject position-independent [single-rune plaintext markers](doublet-plaintext-letter-marker.md), a [one-back marker](lp2-oneback-rank28-marker-original-gate.md) and a [simple native-English word-start doublet model](lp2-wordinitial-doublet-native-english-gate.md).

## Decision

The original source counts and 169-bit stream are exact and reproducible. The unkeyed 13×13 and 8-bit message readings are negative. This source provides **no reason** to extend the search to arbitrary rotations, XOR masks, marker variants, or visual-template fits. The singleton/doublet spacing is an unresolved, weak constraint awaiting an independently selected reversible operation. It does not justify moving any apparent bit patterns into established Liber Primus findings.

The complete source-exact [Node22 SFT](../sims/lp2_singleton_doublet_13square_source_sft.cjs) passed [manual-only GitHub Actions run 43605565197](https://github.com/FlareZ123/liber-primus/actions/runs/43605565197), pinning the actual original page rune arrays, word boundaries, bitmap rows, 8-bit output, line-conditioned probability and deterministic 50,000 shuffled controls.
