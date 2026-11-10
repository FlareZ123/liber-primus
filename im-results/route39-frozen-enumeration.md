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

## Outcome and next actual solution gate

The existing external report formulas **fail to independently predict any particular block 39**. A future proposed route needs a source-supplied rule fixing the exact next source node and the exact next ciphertext cell sequence **before** learning their English output. It then must produce a substantial held-out plaintext extension and exactly re-encrypt it. Selecting just one aesthetically pleasing decoded word among the 60 already available does not demonstrate a cipher key.

**Reproduction:** run node sims/route39_frozen_constraints.cjs under Node.js 22. Inputs: resources/liber-primus/lp2-corpus.json, resources/control/shakespeare_first300k.txt, and shared rune-word encoder sims/word_partition_invariant.cjs. Manual-only workflow .github/workflows/agent5-route39.yml. Successful Actions run: https://github.com/FlareZ123/liber-primus/actions/runs/42764587718. Third-party source: https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption.
