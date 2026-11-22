# External 27×27 / three-rune LP2 claim: held-out audit

**Status: unverified hypothesis; not an established Liber Primus decryption.** This is an independent audit of the public claim at [2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption), retrieved 16 November 2026. It is deliberately kept in \`im-results/\`, not promoted to \`results/\`.

## What reproduces

The external proposal arranges the first 729 LP2 runes as a 27×27 grid, selects three-rune key nodes, applies Euler's totient to some node centres, derives a three-valued Möbius signature, and subtracts a phase-rotated key modulo 29.

The grid size is a real property of the source corpus: pages p0–p2 contain exactly 729 runes. I independently reproduced the proposal's first example. Its seven ciphertext cells at (13,25)–(14,4), decrypted with the stated key AE–I–EA, yield GP symbols:

\`A S I G O TH E\`

which can be segmented as **AS I GO, THE**. This confirms that the first example's coordinates, alphabet and arithmetic can be reproduced against the repository corpus. It does not establish that the chosen node or the later selection rules are intended.

The external repository presents 38 blocks, totalling 115 recovered rune positions, and inserts English word boundaries and punctuation into the output. Its own strongest-evidence discussion acknowledges that the final 3301-based constraints were identified retrospectively. Its method also does not give a deterministic rule for when a node's centre is transformed by \`φ\` versus left unchanged; individual block records use both choices.

## Held-out test of the block-38 forecast

Rather than search for another attractive fragment, I treated the outgoing forecast in the external repository's \`38-i-ask.md\` as a locked prediction. The forecast specifies:

- next derived key signature \`(0,+1,0)\`, hence phase 1;
- next source node horizontal W–E, centre on even row/even column, even radius, non-mirror;
- next ciphertext segment diagonal, read leftmost-first;
- beginning on an odd row/even column, endpoint on an odd row;
- beginning exactly on a diagonal ray through the previous leftmost cell (8,17);
- the current Direct/+1 local-mode and squarefree-GCD compatibility filters.

The transform/no-transform choice for the next source centre is not specified, so both possibilities were included rather than silently selecting whichever gives better text.

Applying those constraints to the original 27×27 grid gives:

| Search stage | Count |
|---|---:|
| admissible three-rune source nodes (both centre-transform choices) | 86 |
| admissible diagonal ciphertext segments | 132 |
| source/segment pairings after the stated squarefree-GCD filters | 10,909 |
| distinct decrypted strings among those pairings | 9,718 |

The best TextBlob unigram-frequency segmentation is \`THE AS\` (three runes, source centre (12,14), radius 10, transformed centre; ciphertext (9,18) to (7,20)). Other top fragments include \`HAD\`, \`HOW\`, \`EARS\`, \`MET IS\`, and \`ME OF\`. None is a convincing continuation of **GO, DO AS I ASK** or an independently meaningful instruction. The forecast therefore does not select a unique next block.

## Null calibration

To estimate how often this search produces English-looking fragments by chance, I shuffled the 729 rune indices while preserving their overall symbol frequencies, then reran the same source-node, segment, phase, parity, ray and GCD filters. The word score used TextBlob 0.19.0's English spelling-frequency table, full-string dynamic-programming segmentation, a 20-character maximum word length, and penalties of 2.0 for one-letter words and 0.35 for two-letter words.

For 100 shuffles with Python seed \`20261116\`:

| Statistic | Original grid | Shuffled grids |
|---|---:|---:|
| admissible source nodes | 86 | mean 74.33, SD 9.65 |
| source/segment pairings | 10,909 | mean 9,470.38, SD 1,227.03 |
| candidates with at least two common (≥2-letter, frequency ≥10) words | 45 | mean 35.46, SD 8.51 |
| best unigram score per character | −1.579 (\`the as\`) | 58/100 shuffles equal or better |
| multi-common count at least as high as original | — | 14/100 shuffles |

The original grid's best word score is ordinary under this null (58% of shuffled grids do at least as well). Its multi-common count is somewhat above the null mean but not exceptional (14% of shuffled grids equal or exceed it). This is a coarse calibration, not a proof: shuffling destroys spatial structure, and unigram segmentation is not a full language model. It is nevertheless enough to show that the reported next-block forecast does not produce a distinctive held-out plaintext signal.

## Assessment

1. **Reproduced:** the 27×27 source arrangement and the first seven-rune example.
2. **Not reproduced as a deterministic cipher:** the method leaves centre-transform selection and later node/segment choices under-specified.
3. **Held-out prediction is weak:** the stated block-38 forecast admits 10,909 pairings and produces no unique, coherent continuation.
4. **No solution claim is warranted:** the 38-block reading remains a candidate interpretation, not recovered LP2 plaintext. The audit does not disprove every possible variant; it rejects treating the published route or its final phrase as independently validated.

Do not spend further compute extending this branch unless its author supplies a deterministic, source-derived rule for the remaining choices or a new pre-registered prediction that distinguishes the original grid from controls.

## Reproduction

From the repository root:

\`\`\`bash
python sims/lp2_external_27x27_nextblock_audit.py
python sims/lp2_external_27x27_nextblock_audit.py --null 100 --seed 20261116
\`\`\`

The second command uses optional \`textblob==0.19.0\` for the stated unigram heuristic. The script independently checks the first-block positive control and emits the exact candidate counts and null statistics. All coordinates are 1-based; GP rune indices are 0-based.
