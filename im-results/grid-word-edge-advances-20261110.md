# LP2 base60 grid with word-edge key advances: a controlled negative

**Agent 6 · 2026-11-10 · no recovered LP2 plaintext.**

## Mechanism under test

The preceding \`im-results/grid-keyskip-viterbi-20261110.md\` investigated the 256-byte base60 grid of LP2 pages 49–51 as a modulo-29 additive key stream with self-avoiding collision skips. This extension tests a specific missing synchronization mechanism: consume **one extra key byte before the first rune of a new word**, independently of the previous ciphertext symbol, with prior probability 0.42. This is motivated by, and conditional on, published word-length expansion hypotheses. The model does not insert ciphertext runes or infer a new alphabet.

For each rune with previous consumed key position \`j\`, the Viterbi state tries advances \`d=1,2,3\`. A skipped intermediate key is otherwise legal only if decoding that key would have produced an immediate ciphertext repeat. At a genuine word boundary, **one first skipped key may be an additional unconditional advance**, carrying penalty \`-ln(0.42/0.58)\` versus no edge advance. Any later skipped keys must still be collision-justified, with a further 3.5 log-score units per rejection.

Other retained alternatives: either sign of additive mod29 encryption, the grid forward or reversed, one of 256 initial offsets **per page**, and English-GP smoothed trigram likelihood from \`resources/control/shakespeare_first300k.txt\`. The start positions are free parameters, so short-page scores require permutation controls. Punctuation was parsed from \`resources/lp2-transcription.txt\` with exact rune-by-rune assertions against the \`resources/liber-primus/lp2-corpus.json\` pages; a physical linewrap \`/\` is not a word boundary.

## Positive control and real test

Executable: \`node sims/grid_boundary_advance.cjs\`, extending \`sims/grid_keyskip_viterbi.cjs\`. Successful [manual GitHub Actions run 42744751416](https://github.com/FlareZ123/liber-primus/actions/runs/42744751416).

The positive planted control enciphers a **179-rune, 43-word** solved-English paragraph under the *real grid key*, starting at position **37**, adding **17 word-edge key advances** under fixed seed \`0x33014321\` and **3 collision-justified advances**. The exact Viterbi decoder recovers the original initial offset, the **20 total key skips**, and **178/179 runes (99.44%)**. This establishes substantial sensitivity when the named mechanism is truly present in the known-English register.

The 55 rune-bearing unsolved LP2 pages yield no recognizably decoded paragraph or a common key schedule. The best-scoring per-page strings contain isolated English-looking fragments mixed with illegible GP transliterations, as an optimized trigram decoder of otherwise random text can. The lower (more negative) per-rune negative log likelihood strongly separates the real pages from the planted English model: positive control score **-2.414** versus the best page 55 score **-4.198** (short page) and p0 score **-4.647** (262 runes). No section-level held-out confirmation is possible because no candidate plaintext survives.

Matched null: independently shuffle all 256 key bytes while preserving their values, score both orientations, both additive signs, every initial offset, 60 shuffles per selected page:

| LP2 page | Best actual-table log score per rune | Mean shuffled-table score | SD shuffled | Empirical upper-tail p |
| ---: | ---: | ---: | ---: | ---: |
| 0 | -4.64656 | -4.68588 | 0.04593 | 0.1639 |
| 20 | -4.65382 | -4.66357 | 0.04449 | 0.3770 |
| 49 | -4.38494 | -4.20005 | 0.10163 | 1.0000 |
| 51 | -4.47036 | -4.44557 | 0.09988 | 0.5410 |

None of these exploratory small nulls gives credible preference to the actual grid order. The constraint was evaluated on *all 55 pages* but nulls only on four named pages. The value 0.42 and English model are hypothesis choices, not recovered parameters.

## Inference

The specific **grid-as-key, page-reset, add/subtract GP, collision and one-word-edge-key-advance** family has no positive LP2 evidence. The test leaves other keys, non-GP or multi-layer plaintext, other pointer-advance policies, multiple consecutive edge advances, and different word boundary encoding untouched.

Do not interpret the increasingly readable-looking **short-page** fragments as partial solutions: the decoder optimizes over hundreds of key starts and optional steps, and shuffled grids perform equally well or better.
