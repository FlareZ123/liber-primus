# Reversible boundary-only historical fourteen-slot transposition (#2770)

**Decision (Agent23, 25 November 2026):** a lossless binary boundary-plane transport can be constructed from genuine author-era mechanisms, and controlled plants distinguish it from a shuffled-word layout. The frozen historical row permutation fails the actual p33–39 chapter: all three source-visible heading/body transitions lose their word boundaries and the recovered length-order score is worse than every matched positive and shuffled negative. Retire the specified mechanism; no new operative key, original plaintext, or authenticated boundary selector.

## Source motivation and independent rival

The reproduced 2013 Gematria JPEG OutGuess payload used whitespace as binary data (space=0, tab=1); it did not demonstrate misleading printed word groups. See [bounded historical evidence](cicada2012-2014-boundary-semantics-precedent.md). The 2014 documented 14-column challenge used the fixed row decryption order [2,8,9,1,12,13,11,4,5,7,3,0,6,10]; see [historical operation and control](lp2-p33-actual-2014-14column-transfer.md). The canonical cuneiform chapter starts at global rune7960 (physical p33 rune0) and has exactly 1680=14×120 runes with 378 carry-aware groups. Its two red rubric spans [0,10) and [91,99) independently mark three internal ink/text transitions. This motivates one concrete receiver different from transposing rune values, length alphabets, ragged group columns, or p15 spiral boundary data. Neither original artifact explicitly instructs transposing boundary bits; the combination is a hypothesis.

## Lossless construction and capacity

Let P be an N-rune tape and B the N−1 internal-gap bits, where 1 denotes a true word end. Encode the rune tape under a separate value cipher if desired; this construction leaves its order untouched. Apply the inverse of the documented row permutation to B, independent rows of width14, omitting unavailable columns in the last partial row. Render 1 as a separator and 0 as no separator. The chapter endpoint is implicit and excluded from B, so no bit is discarded or hidden in an unobservable terminal delimiter. Decode by the historical row map; the last partial row uses the same restricted order. Every input mask has a unique inverse and preserves rune count and number of groups. For N=1680 the mask is 119 complete rows +13 bits; with 377 internal ones the exact fixed-weight capacity is log2 C(1679,377)=1284.668607 bits (unrestricted capacity 1679 bits). This is side-information already represented by placement of separators, not added rune symbols. Both directions replay all bits.

The independent structural prediction is that if the rune tape remains ordered and the physically distinct red headings mark true text divisions, the recovered bits after local rune counts 10,91,99 (zero-based indices9,90,98) must all be one. This is a condition on this precise construction and interpretation of ink, not a general theorem about H-decoy.

## Frozen calibration and original outcome

Use the first 80% of the three pinned Gibran, Shakespeare and Emerson donors to learn a smoothed word-length transition likelihood; reserve the last 20%. Five disjoint constructed controls from each donor concatenate complete-word native excerpts of lengths 10/81/8/1581 to preserve all three independently source-nominated transition anchors. The negative shuffles true word units separately within each excerpt, so the same anchor breaks and complete length inventory remain. The positive uses the exact boundary-plane encoding. No rune values or language model fit the original mask.

| Metric | Boundary-decoy plants | Shuffled-word plants |
| --- | ---: | ---: |
| True boundary masks recovered | 15/15 | 0/15 |
| All three recovered anchors | 15/15 | 0/15 |
| Held transition score range, nats/word transition | −2.090154 to −1.842230 | −2.688924 to −2.359564 |

The nonoverlapping finite controls separate, so freeze midpoint −2.224859 as the score diagnostic before computing original recovered lengths.

The actual source observed anchor bits are [1,1,1]; the fixed inverse returns [0,0,0]. The decoded first ten group lengths are [3,1,3,12,8,4,1,1,3,12] instead of observed [2,8,2,9,6,3,3,5,3,2]. Original observed score −2.154347; decoded −2.730480 (below frozen threshold and every finite control). Maximum recovered word length22, versus training maximum17; this is descriptive only. Exact 1679-bit original replay succeeds, as required for all masks in the bijective family.

The source structural contradiction is the decision; the scores independently support the negative but do not establish an all-language theorem. The calibration is conditional on length/anchor-matched constructed native excerpts, not unrestricted contiguous prose. The initial control count and chapter-start assertions were corrected before any original decoded mask was computed (the actual chapter begins p33:0, not the second heading). No alternative phase, direction, permutation or cipher tested. There is no valid basis for an original key attack under this fixed boundary transform. Other source-selected reversible encodings, H-shuffle and other H-decoy mechanisms remain logically open.

[Reproducer](../sims/lp2_p33_historical14_boundary_plane_sft.cjs), commit `a50f70935ef77a2a4cc44c8bd7206f5bc4cf4e70`. Executed in connected V8 against canonical source and pinned donors. No CI run claimed.
