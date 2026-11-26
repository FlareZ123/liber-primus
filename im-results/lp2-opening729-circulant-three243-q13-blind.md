# Opening 729 runes: three-stream circulant mixing and common q13 shift, blind inverse

**Agent18, 26 November 2026.** Calibrated original-cipher predictive negative. No authentic unknown plaintext or key.

## Source-selected framing and limitation

The opening illustrated section p0–2 has 729 runes and three-bar cross artwork on each of three pages. Treat the whole section as three consecutive equal 243-rune lanes, including the red title. This reflow is a hypothesis, not a literal page layout (262, 266, 201), and no original author instruction selects circulant mixing. Test a single unknown invertible GF29 circulant matrix and one unknown shared period-13 additive key (historical key width and p0 red-title width motivate 13).

For lane j=0,1,2 and position i=0,...,242, define

    P[j,i] = a*C[j,i] + b*C[(j+1)%3,i] + d*C[(j+2)%3,i] + K[i%13] mod29.

Require det = a³+b³+d³−3abd ≠ 0. Cyclic rotations of (a,b,d) only rotate the three output lanes, so enumerate the lexicographically least representative of each orbit. The inverse is exact. This is not the previously tested three-lane same-pad model: off-diagonal mixing changes equality and allows every invertible circulant matrix. It is also distinct from same-page mirrored pairs.

## Blind constructive recovery

Use lane offsets 0–161 for fit and 162–242 for prediction, independently in each lane. The language model is a smoothed GP29 bigram model from the nine pinned solved native sections plus the first 400 lines of Emerson (excluding first 1000 converted runes). Gibran and Shakespeare are held out of training. Enumerate all 7,840 nonzero-determinant canonical row representatives, optimize unigram likelihood across each key phase for each row, shortlist 64 rows, and maximize the exact cyclic bigram objective over all 29 shifts per phase for each retained row. Select the highest fit score; holdout is never used to change row or key. This is a heuristic row shortlist, not an all-key proof. Bigram gain is measured in nats per within-lane transition relative to uniform; inter-lane boundary terms are not used.

Three distinct independently seeded controls (two disjoint Gibran excerpts, one Shakespeare excerpt), with random canonical row representatives and independent random shift keys, recover all 9 row coefficients, all 39 shifts and all 2,187 plaintext runes. The canonical lane orientation is fixed in plants, rather than independently resolved by the algorithm. General keys remain identifiable only up to cyclic lane rotation in this receiver.

| Tape | Fit gain | Frozen holdout gain | Exact held-out runes |
|---|---:|---:|---:|
| Gibran A | +0.622760 | +0.470476 | 243/243 |
| Shakespeare | +0.724244 | +0.606766 | 243/243 |
| Gibran B | +0.766343 | +0.726509 | 243/243 |
| Original p0–2 | −0.696885 | −1.821904 | unknown |

Original candidate row [7,23,16], key [13,12,20,20,12,21,16,15,0,25,20,23,22]. The three output lanes are nonprose. Their rotations cannot improve within-lane language likelihood. All 729 original symbols round-trip, which is an algebraic invariant rather than evidence of authenticity.

**Decision:** retire this bounded calibrated receiver. It does not exclude arbitrary noncirculant mixing, independently shifted lanes, hidden F holds, changed indexing, or other registers; none is selected by the tested art/count clues. No original key or plaintext.

[SFT](../sims/lp2_opening729_circulant_three243_q13_blind_sft.cjs) · [Raw data](lp2-opening729-circulant-three243-q13-blind-output.json). Actual computational core run in connected V8 on the repository inputs; standalone Node/Windows CI not run. Implementation and data commit 676d71e3717d9b518f8f45dbc8057041beb575b5.
