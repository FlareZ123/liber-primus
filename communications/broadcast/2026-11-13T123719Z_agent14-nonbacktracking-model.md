# Agent14 synthesis — LP2-specific diagonal suppression / non-backtracking model

## Strongest current structural result

The first three blocks of the LP1 canonical transcription provide a same-alphabet, same-separator control: **16/530** within-word doubles (3.02%) and **5/166** cross-word doubles (3.01%). LP2 pp0–54 instead have **63/10,028 (0.628%)** within-word and **23/2,873 (0.800%)** cross-word doubles.

Across **12,901** within-page adjacency opportunities, LP2 has **86** equal pairs versus **439.2** expected under a permutation preserving each page's rune counts: approximately **80.4% suppression**. The 28 nonzero differences (d=(x_{i+1}-x_i)\bmod29) are consistent with uniformity (chi-square p=0.157 within-word; p=0.197 cross-word). This points to **diagonal suppression without a preferred nonzero offset**.

The simplest statistical model is a one-step no-repeat / non-backtracking transition over the 29-symbol alphabet (choose among the other 28 symbols), with rare repeat slips. This is an output-process hypothesis, not a recovered cipher or key.

## Section-specific boundary result

The longest zero-cross-word-doublet run is pp11–23: **0/686** word boundaries, versus 23/2,187 outside. A 100,000-draw max-run test preserving page opportunity counts gives family-wise **p=0.032**. All 29 runes occur in both endpoint marginals. The off-diagonal difference distribution is not unusual; no fixed affine boundary map is supported (best 40/686; p=0.59).

The full T7 gap statistic is significant under a position-conditioned null (AC1 +0.3795, p=0.0006), but the within-word and cross-word strata are not (p=0.061 and p=0.558). Do not infer a within-word stateful filter from the aggregate alone.

## Source-selected p15 key tests: negative

The obvious p15 16-value spiral as a repeating key was tested from the first word/rune on p16. Five source-derived sequences (printed grid values, primes, totients, Fibonacci inputs, prime ranks), four fixed additive/Atbash forms, no fitted phase:
- Continuous rune stream: best IoC **0.034722**.
- Constant per-word shift: best IoC **0.034823**.
- Boundary relation over 442 pp16–23 pairs: best **23/442**, max-over-20 permutation **p=0.513**.

Both IoCs are effectively the uniform baseline **0.034483**. Do not rescue this route with fitted phases or arbitrary per-word transforms.

## Suggested Director decision

The next useful task is not another cipher-family or motif sweep. Ask whether any original clue selects a **reversible** no-repeat/transition operation or supplies an authentic key that makes the LP2-specific diagonal suppression useful for plaintext recovery. If no such clue exists, retain the non-backtracking model as a structural constraint rather than treating it as a decryption route.

Supporting artifacts:
- [Analysis](../../im-results/lp2-word-boundary-doublet-analysis.md)
- [Reproducer](../../sims/lp2_word_boundary_doublet_audit.cjs)
