# Ciphertext-only recovery of an arbitrary shared Hill4-CBC inverse on original p16–22

Agent 5, 24 November 2026. Independent recovery experiment, not a claimed source-authenticated p15 decoder. Direct p15 matrix/ordinal/CBC variants (#2334), original fixed-block equality theorem (#2326), and fixed 2014 3301-square Hill5-CBC (#2504) are prior negatives. This experiment instead **recovers the entire unknown 4×4 inverse matrix**, without a source-prescribed matrix or orientation sweep, under one fixed block-chaining hypothesis.

## Model

The original p15 numeric 4×4 square motivates testing four-rune blocks in the immediately following complete p16–22 text (1,744 runes =436 blocks). It does not authenticate this cipher or key. Fix continuous phase zero from p16 and no page resets. Let C_b=M(P_b+C_(b-1)) over GF29 for an arbitrary invertible 4×4 secret M. The complete inverse is P_b=R C_b−C_(b-1), R=M^-1. Every block after the first is independent of unknown IV. The experiment excludes the first block from key scoring and assumes zero IV only to provide a complete exact replay; no F bypass or length changes.

## Exact optimization and proof

Train on p16–20 only (1,340 runes,335 blocks; score 1,336 after first block). Freeze the key for p21–22 (404 runes). Original printed word roles (singleton, first, last, interior) are inputs. A fixed unary log-likelihood model is derived from the independently pinned TextBlob dictionary with 29,060 GP-normalized forms, square-root frequency weights and unit pseudocounts.

For each output coordinate j, exhaust all 707,280 nonzero possible inverse rows r. The score of a row is the sum of native word-role log probabilities of r·C_b−C_(b−1),j mod29. All four row objectives are evaluated in one pass using precomputed two-coordinate dot products. Retain the exact top 64 rows for each coordinate and greedily select a maximum-weight linearly independent basis from each list. All four lists span the full field, which certifies completeness: for any span of three other rows, at least one of the greedy basis rows lies outside it and scores at least as high as any other row outside that span. Otherwise a higher-scoring outside row would have been rejected despite not lying in the preceding greedy span. Consequently one can replace each row of an arbitrary globally optimal invertible matrix by a corresponding basis row without decreasing score or losing rank. Exhaust the 4^4=256 combinations. The result is a **globally optimal invertible inverse under the fixed additive score**, not a heuristic key search. This says nothing about optimality for different language objectives.

## Real recovery controls

Two 1,744-rune authentic solved-Cicada source windows beginning at donor offsets0 and1235, encrypted using independently generated invertible private matrices. Lexical prior is independently pinned; no true matrix or donor plaintext enters recovery. Both exact 16-coefficient inverse keys recovered, all 3,488 source runes correct, all 808 withheld runes correct. Training/heldout average log probabilities (nats/rune): -2.95144/-2.90178 and -2.90067/-2.88810. True best row margin over runner-up ranges .9173–1.0763 nats per block.

## Original outcome

Globally optimal R on original training region:
```
 8  5 20 11
11 28 16 16
22  9 13  2
19  0 25 21
```

Training score -3.909040039, exactly the sum of independent per-coordinate maxima. Frozen heldout -4.240309171. Margins .00842–.02941, unlike both solved-source positives. Original complete-word lexical results: training 29/317 known, **0/114** long (>=5 runes); heldout 5/82 known, **0/36** long. No coherent text. Exact full original reencryption, which is a consistency check not authenticating evidence. Original candidate first words IATEAIATHEIAC IA OEDGWH HEAOWW EOM; heldout AEMS POF NGNR XTHAYWOECD PY.

## All-secret affine and alphabet extension, all continuous phases

A unary language objective alone cannot exclude an alternative lower-scoring key. Use the exact per-coordinate collision count Q_j=sum_v choose(n_j(v),2) instead. For each fixed phase 0..3, omit the first block (arbitrary IV) and any incomplete fringe, and exhaust all 707,280 nonzero rows r. For each coordinate j, compute Q_j for the actual residue tape r·C_b−C_(b−1),j. Its maximum is an exact original-input bound; the sum of the four independently achieved maxima upper-bounds every invertible matrix even if the four maximizing rows are not independent. An arbitrary constant affine translation in any output coordinate, or even an arbitrary fixed bijective relabeling of its 29 symbols, preserves these collision counts. Thus the same bound applies to every such extended shared inverse.

| Continuous phase | Blocks scored per lane | Max lane counts | Upper sum | Native minimum over all equal-length solved-source windows |
|---:|---:|---|---:|---:|
|0|435|3704,3638,3672,3681|14695|22749 (1240 windows)|
|1|434|3664,3718,3595,3624|14601|22651 (1244 windows)|
|2|434|3665,3618,3627,3621|14531|22651|
|3|434|3644,3634,3599,3625|14502|22651|

The exact upper bounds on the average of the four lane IoCs are .03891890, .03884856, .03866232, .03858516; the corresponding authentic GP29 source minima are .06024948 and .06026703. Native windows cover every starting offset in the full 2,979-rune solved donor. No word boundaries or particular symbol frequencies are assumed by this collision invariant. Phase zero was executed directly in connected JS; all four phases also executed locally in optimized C++ on the exact canonical 1,744-digit p16–22 tape (phase zero independently reproduces every lane maximum). The source-driven CJS independently reproduces all phases using exact integers, prints winning rows, and checks each winner. It requires no external program. [All-row collision SFT](../sims/lp2_unknown_hill4_cbc_allrow_collision_sft.cjs), code 4c4dabe3423d550942876c9be47abb87af15385c.

This is an **all-key finite native-source conditional exclusion** for the shared four-coordinate CBC architecture, including arbitrary IV and independent fixed coordinate-wise alphabet relabelings, at all four continuous phases. It does not exclude page-private changing matrices, other nonlinear interblock transitions or a plaintext register outside the tested native collision range. No original plaintext. Do not pursue another fixed affine key, output-label or phase sweep on this exact receiver.

## Disposition

No unknown original plaintext or authentic key. Retire this precise common Hill4-CBC recovery hypothesis at every continuous phase, including fixed affine offsets and coordinate-wise alphabet relabelings under the tested native collision condition. The actual source does not select block size/clock or CBC. It remains logically possible that a different model or language yields a distinct solution. Reuse the row-recovery engine only when independent evidence warrants its architecture; do not sweep arbitrary p15 matrix/key variants.

[Executable SFT](../sims/lp2_unknown_hill4_cbc_key_recovery_sft.cjs), code commit d8b30fb35bf30e64360bee2d461ae054a6f66617. Actual connected JavaScript execution on repository source data; no CI claim.
