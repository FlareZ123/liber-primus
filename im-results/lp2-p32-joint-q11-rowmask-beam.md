# p32 joint arbitrary row masks and shared column permutation — calibration failure

## Decision

The first q11 inverse excluded the fixed-column-shift model by an exact row-local score; the present extension additionally grants every row its own additive GP offset. It is not covered by that earlier bound or by fixed-order rowcolumn tests. The final frozen inverse failed two fresh native WELCOME controls (4/121 and 2/121 correct). **No original p32 run was performed**, no exclusion of this full model follows, and no LP2 plaintext or key recovered. The conditional exact order optimizer is reusable; the short-frame blind initialization is not sufficiently reliable.

## Model and receiver

The inferred 11×11 p32 reflow is source-motivated by the 121-rune count and the inferred 563/569 border sums, not printed grid coordinates. Hypothesis C[r,π(j)] = P[r,j]+u[r]+k[j] mod29, gauge k[0]=0. The combination of free row shifts, fixed independent column shifts and arbitrary shared column permutation is exploratory, not an authenticated historical instruction.

Train on 601,854 GP runes of the three literary donors and native sections excluding LOSS OF DIVINITY, KOAN_1 and WELCOME. Use scaled integer unigram/bigram/trigram probabilities (scale 128, add-one unigram, backoff 16/12). Beam width 1024 extends every unused observed column and all 29 shifts; the first column shift fixes the gauge. A beam state retains each row's 29 possible offset likelihoods, and ranks by row-marginalized likelihood. Rerank 64 final states by exact full-stream trigram Viterbi over row offsets, including two seam trigrams per row transition.

The original beam dropped the true prefix at depth two in both LOSS windows but recovered every relative shift and every row offset after gauge registration. It misplaced contiguous column chunks. A local full-score refinement recovered one window; exact conditional order optimization recovered both. For fixed row and column offsets, precompute the sum of trigram scores across rows for each ordered triple of observed columns. Enumerate the first two column identities, then subset DP over used columns and last two identities, with the two seam scores determined by the fixed starting pair and terminal pair. This gives the exact full-stream trigram-optimal permutation **conditional on the supplied offsets**. Alternating this with exact conditional row Viterbi and local shifts is not a globally exact joint inverse.

The first KOAN holdout (freshA) recovered 121/121, the second 2/121, with a one-column rotation and one wrong relative shift. Treat both as development after inspecting the failure. A joint rotation-and-single-shift move plus exact row Viterbi recovers both 121/121, full keys. Freeze that modification, then test WELCOME offsets 0 and 121 with independently seeded keys (freshB).

| Stage | Source | Rune recovery | Full key |
|---|---|---:|---|
| Initial beam | LOSS windows 0,121 | 10,13 /121 | 0/2 |
| Exact conditional order development | same LOSS | 121,121 /121 | 2/2 |
| Before joint rotation/shift | KOAN windows 0,121 | 121,2 /121 | 1/2 |
| After joint rotation/shift development | same KOAN | 121,121 /121 | 2/2 |
| Final fresh frozen test | WELCOME windows 0,121 | 4,2 /121 | 0/2 |

No more control-dependent refinement was undertaken. The original branch in the script is explicitly callable for later work but was never executed in this invocation. The planned freshC windows were not used after the decisive freshB failure. Correct relative masks on the development windows do not validate the architecture or permit original-cipher interpretation.

## Reproduction

[CommonJS code](../sims/lp2_p32_joint_q11_rowmask_beam_sft.cjs). Raw stages: [initial beam](lp2-p32-joint-q11-rowmask-beam-development.json), [local refinement](lp2-p32-joint-q11-rowmask-refine-development.json), [conditional exact order](lp2-p32-joint-q11-rowmask-exactorder-development.json), [first KOAN holdout](lp2-p32-joint-q11-rowmask-freshA.json), [joint rotation/shift development](lp2-p32-joint-q11-rowmask-rotation-shift-development.json), [final WELCOME holdout](lp2-p32-joint-q11-rowmask-freshB.json). For the final frozen code, run node sims/lp2_p32_joint_q11_rowmask_beam_sft.cjs 1024 freshB from checkout. Earlier raw stages correspond to their introducing commits. Core ran in connected V8; Node filesystem wrapper not separately executed. No CI workflow added. A stronger blind initializer or genuine source constraints on at least one axis are needed before reopening.
