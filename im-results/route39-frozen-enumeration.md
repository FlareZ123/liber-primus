# Frozen 27×27 route-39 forecast: no independently determined continuation

**Agent 5, 10 November 2026. Conditional test of an unverified third-party decoding proposal. No authentic LP2 plaintext, key or new cipher mechanism recovered.**

## Source and the forward question

The publicly available repository 2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption proposes to arrange the first 729 unsolved LP2 runes as a 27×27 matrix and obtain 38 short phrase blocks ending "GO DO AS I ASK" by subtracting 3-rune key nodes read from the same matrix. Its candidate route uses Euler-totient transforms, Mobius signatures and 16 progressively introduced geometric selection reports. These 38 proposed plaintext blocks are **not independently authenticated**; the repository admits that selection of the exact next physical cell remains unsolved. We freeze its published reports 00–16 and the last source/ciphertext geometry and ask whether those rules *predict* a next passage without a new fitted choice.

The original matrix is defined **exactly** by the 729 original rune indices on LP2 pages 0, 1 and 2 in resources/liber-primus/lp2-corpus.json. Their physical rune counts are 262, 266 and 201. The external current block 38 has ciphertext cells (5,17),(6,17),(7,17),(8,17), with indices [26,14,14,21] and source triple (11,13),(12,13),(13,13) with indices [16,19,28] (T–M–EA). Current phase p=0, accumulated phase sum S=32 and outer signature a=0. These inputs are directly asserted before search.

## Exact pre-selection forecast for proposed block 39

The original sixteen geometric reports imply the following next-state forecasts by the published arithmetic:

| Feature | Requirement |
| --- | --- |
| Next source-key signature | unrotated (0,+1,0), phase **1**, accumulated S **33** |
| Original source-node geometry | **horizontal**, nonmirrored unequal outer rune values, center **even row/even column**, **even radius** |
| Next ciphertext geometry | **diagonal** (either slope), from leftmost cell first, so progressing to the right |
| Next ciphertext leftmost | **odd row/even column**, directly on an 8-ray from the prior (8,17) leftmost cell |
| Next ciphertext endpoint | odd row |
| Next leftmost-mode | direct, Mobius of 90-degree rotated leftmost cell index is zero or positive |
| Geometric arithmetic pairing | all four source-center/ciphertext start/end/leftmost squarefree-GCD tests |

The forecast is independent of the dictionary and candidate plaintext. Every ordinary key source is either an unchanged three-rune horizontal triple or that source with its center transformed by Euler's totient. Both source reading orders are admitted, along with all physical grid positions and even radii. The derived three-rune key must have the above unrotated Mobius-totient signature; after left rotation by phase1 it is repeated over the selected physical cipher line.

All the source indexing and 00–16 rule formulas are recorded in the external project's Start-reading-here files and in our CommonJS reproducer. The explicit next-state set is asserted exactly in the source.

## Complete original-matrix enumeration

At the actual original rune values, enumerating all eligible next grid lines and key sources before looking for English:

- **172** oriented, derived key candidates.
- **132** distinct permitted ciphertext line placements, each odd length 3–23, limited by physical matrix edges.
- **22,704** raw source/line combinations.
- **21,818** pairs pass all four exact original-source/next-ciphertext squarefree-GCD tests.
- Decoding every eligible pair as a periodic key modulo29 yields **60 matches** to single GP-encoded words in the fixed Shakespeare corpus, **52 distinct spellings**. Examples include OUR, HAD, HOW, WHO, HEAR, NAY, ART, EARTH, SAW and one 5-rune MAKING.

No unique word emerges, and each match is reversible only for its selected source/ciphertext cells. Multiword plaintext chunks and other vocabularies are deliberately absent from the dictionary, so the true number of plausible readings under the author's permissive complete-word criterion would be higher.

## Exact conditional permutation control

To distinguish predetermined decipherment from words obtained by searching geometry, **60 independent uniform permutations of all non-anchor rune identities** preserve the seven previous 38th-block source/ciphertext cells, the full global 729-rune histogram, and the frozen calculated next forecast. Every one is searched in exactly the same manner, with deterministic seed 0x5339c330.

| Measurement | Original | 60 permuted controls mean | Control min–max | Upper-tail add-one p |
| --- | ---: | ---: | ---: | ---: |
| Candidate keys | 172 | 150.37 | 106–186 | 0.16393 |
| Key/line pairs after GCD constraints | 21,818 | 19,155.40 | 13,480–23,858 | 0.18033 |
| Shakespeare word matches | **60** | **50.30** | 31–72 | **0.22951** |
| Distinct matched English words | 52 | 41.50 | 25–56 | 0.14754 |

The control is a *conditional diagnostic* and not an unconditional p-value of the entire manuscript cipher. Random cell permutation does not preserve original ciphertext adjacency, but the test is aimed specifically at how freely a fixed next-step geometry can fit words given its 3-rune source degrees of freedom.

## Independent complete-word segmentation on the same frozen successor set

**Agent 43, 10 November 2026.** A second original-input implementation
[`external_27square_nextblock_fullgate.cjs`](../sims/external_27square_nextblock_fullgate.cjs)
replicates the exact **172 source choices**, **132 mode-compatible line
placements**, and **21,818** source/line assignments surviving Report 10.
It expands the lexical acceptance step to Report 16's own stated criterion
of **one or more complete English words in each independently decoded
block**, using the separately sourced
[`TextBlob spelling lexicon`](../resources/control/english_wordfreq_textblob.txt)
at a frozen frequency threshold of 20. The GP encoder uses longest
two-letter rune tokens with K/Q→C, V→U and Z→S normalization. Both
one-rune words A and I can occur within a longer block, as Report 16
explicitly allows; individual cipher blocks still have at least two
runes.

Of **21,818** original compatible assignments, **116** are fully
segmentable under this lexicon, yielding **95 distinct GP-rune output
sequences**. These comprise **100 assignments at length 3, 14 at length
5, and 2 at length 7**, with no longer complete-word readings. Frequent
candidates include *I THE*, *A TO*, *HE IT I*, *OF I*, and *ON I BY*.
One synthetic `NOW` plaintext plant proves that the independent
source-node/line decoder can recover and re-encrypt its actual planted
key without changing the source node.

**250 deterministic matched permutation controls** (xorshift32 seed
`0x20261110`) hold the seven original cells of block 38's source
and ciphertext fixed and uniformly reshuffle the remaining 722 rune
positions, preserving their complete rune multiset and the forecast.
All original key/segment, geometric and word-segmentation rules are
recomputed for each control. The original **116 lexical assignments**
compare with a null mean of **89.344**, range **38–148**, with
**25/250** controls at least as large (add-one conditional upper tail
**26/251 ≈ 0.10359**). The original **95 distinct decoded GP
sequences** compare with null mean **75.416**, range **35–125**, with
**32/250** controls at least as large (add-one tail
**33/251 ≈ 0.13147**). The total geometric count **21,818**
compares with a control mean **18,866.88** and tail
**44/251 ≈ 0.17530**.

[Completed original and 250-controls CI](https://github.com/FlareZ123/liber-primus/actions/runs/42805518043).
The earlier unanchored shuffle run 42804874542 is superseded; varying
the seven cells from which the outgoing rules were calculated is an
inadequate conditional control. These tests are comparisons within a
postselected third-party model and an independently chosen permissive
English register, not evidence of authentic plaintext. The multiple-word
acceptance here makes explicit why the original 60 single-word matches
understate the permitted readings.

## Coverage of the already published 38-block reading

A source-coordinate census of all 38 documented ciphertext reads
([third-party frozen route](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/tree/main/plaintext-i-found))
adds a separate global-coverage test. The recorded reading uses **115 rune
positions** along 38 chosen line segments, but those positions refer to only
**103 distinct cells** of the original **729-cell** page-0–2 matrix.
It leaves **626 / 729 cells unread** (85.87% of the source grid).
**11 source cells** appear in more than one selected ciphertext segment,
accounting for **12 extra cell uses**; cell (25,16) appears in three
different blocks. Some are adjacent-block endpoint handoffs, while
others recur in nonadjacent blocks.

This is a *complete census of the published 38 selected reads*, rather
than a statistical authenticity test or a claim that a valid cipher cannot
reuse ciphertext cells. It establishes an explicit coverage obligation for
any proposed whole-manuscript recovery: the selected reading currently
assigns plaintext to only 103 of 729 original source positions, and no
independently specified continuation procedure has recovered the other
626. The positions are frozen as 1-based row-major values in
[`publishedRouteCoverage()`](../sims/external_27square_nextblock_fullgate.cjs),
which asserts 38 blocks, 115 uses, 103 distinct positions and 11
reused locations; it has no need for a separate workflow.

## Outcome and next actual solution gate

The existing external report formulas **fail to independently predict any particular block 39**, under either the original Shakespeare single-word check or the independent complete-word lexicon. A future proposed route needs a source-supplied rule fixing the exact next source node and the exact next ciphertext cell sequence **before** learning their English output. It then must produce a substantial held-out plaintext extension and exactly re-encrypt it. Selecting just one aesthetically pleasing decoded word among the 60 already available does not demonstrate a cipher key.

**Reproduction:** run node sims/route39_frozen_constraints.cjs under Node.js 22. Inputs: resources/liber-primus/lp2-corpus.json, resources/control/shakespeare_first300k.txt, and shared rune-word encoder sims/word_partition_invariant.cjs. Manual-only workflow .github/workflows/agent5-route39.yml. Successful Actions run: https://github.com/FlareZ123/liber-primus/actions/runs/42764587718. Third-party source: https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption.
