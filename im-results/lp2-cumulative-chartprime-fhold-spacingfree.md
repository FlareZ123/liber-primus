# Spacing-free cumulative chart-prime feedback: exact original inverse gate

Agent1, 2026-11-24. Intermediate result; no unknown LP2 plaintext, authentic key or destination.

## Mechanism

The solved p56 uses prime-minus-one shifts and the historical Vigenère cipher leaves plaintext F transparent without advancing its key. The hypothesis is a distinct *plaintext-dependent cumulative* shift: for consuming plaintext rune P, C = u P + s (mod 29), s' = s + a (prime(P)-1) + b (mod 29); F emits literal F and holds s. The GP29 chart is the actual source chart. The previous arbitrary-function cumulative model was tested with intact printed word groups; this test removes **all spacing assumptions**, and permits every nonzero emission slope u and chart-prime coefficient a, every offset b and all 29 incoming states. This is a proposed source-motivated receiver, not an authored rule.

The exact inverse tracks a 29-bit set of possible incoming states. On C=0 it retains the transparent-F branch, and at any C it computes the unique candidate consuming P=(C-s)/u; P=0 is forbidden as a consuming rune. Empty support is an algebraic contradiction, independent of English and of any key search heuristic. There are 22,736 coefficient triples per source chapter (659,344 triples-and-start-state combinations). Each of the nine chapters may have independent coefficients and an arbitrary start state. No page or word reset occurs inside a chapter.

## Original result

| Physical chapter | Runes | Complete coefficient triples | Longest feasible prefix |
|---|---:|---:|---:|
| p0–2 | 729 | 0 | 650 |
| p3–7 | 1145 | 0 | 430 |
| p8–14 | 1729 | 0 | 542 |
| p15–22 | 1903 | 0 | 561 |
| p23–26 | 1021 | 0 | 587 |
| p27–32 | 1433 | 0 | 675 |
| p33–39 | 1680 | 0 | 461 |
| p40–53 | 3008 | 0 | 759 |
| p54–55 | 308 | 24 | 308 |

All eight longer chapters fail even with private coefficients. The short p54–55 chapter permits 24 triples. This is genuine complete mathematical reachability, not recovered language. The bigram Viterbi inverse fits p54 alone over 80 feasible triples, selecting [19,5,0], seed 28, -4.219460 nats/rune. Its frozen p55 continuation has no legal path. Retrospective full p54–55 ranking over all 24 triples selects [27,17,14], seed 26, -4.301666 nats/rune. It is nonprose; all 24 full candidates are preserved in the output. The full-support count had already been inspected before ranking, so p55 is a locked algorithmic continuation but **not a new independent global holdout**. The original outputs exactly replay by construction, which does not identify a key.

## Controls

The bigram prior uses a GP-encoded Gibran excerpt and clear native p57. All source delimiters are removed. Literary plants and a short actual-native plaintext plant use the proposed encoder (not authentic Cicada ciphertext). All recover the true key in the exact support set. Top-ranked plaintext/key recovery:
- Shakespeare: 1000 runes, 1 feasible triples; planted [16,1,0], top [16,1,0], 994/1000 plaintext symbols exact, score -2.809814.
- Blake: 1000 runes, 1 feasible triples; planted [7,23,17], top [7,23,17], 1000/1000 plaintext symbols exact, score -2.763476.
- native p57: 95 runes, 13487 feasible triples; planted [5,10,22], top [5,10,22], 93/95 plaintext symbols exact, score -2.557998.
The p57 plant is not source-excluded from the language prior; it is a short feasibility check only. The longer independent literary controls have no target text in the prior. The finite reachability rejection is independent of these scores.

## Decision

Retire the continuous nonzero-affine GP-chart-prime increment plus authentic F-hold architecture on the eight longer chapters. A general arbitrary function, page-internal resets, other state laws, or ordinary consuming F are outside this exact test. Do not treat the 24 final-chapter survivors as key material. No new CI or workflow was required.

Reproducer: [single-file SFT](../sims/lp2_cumulative_chartprime_fhold_spacingfree_sft.cjs). [Raw candidates and source blob IDs](lp2-cumulative-chartprime-fhold-spacingfree-output.json). The core function was executed against the listed GitHub source blobs in the connected JS runtime; the standalone Node wrapper was not separately run.
