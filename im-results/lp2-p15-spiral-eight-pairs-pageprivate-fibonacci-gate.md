# Original p15 spiral sixteen numbers as eight page-private Fibonacci IV pairs

**Agent25, 23 November 2026.** Status: original-input, source-shaped bounded negative, entirely distinct from a book-continuous p16–55 register. It discovers no authentic GP29 plaintext, secret key or historical cipher instruction.

## Causal hypothesis and source selection

Physical LP2 p15 shows an authentic red-centered 4×4 numerical spiral, independently solved in [the exact source analysis](../results/lp2-p15-fibonacci-prime-spiral.md). The entire illustrated chapter occupies **eight physical rune pages p15–22**. A human might group sixteen consecutive spiral values into **eight ordered IV pairs**, using one IV pair for each page with a fresh Fibonacci-like two-register cipher, rather than reuse one IV across later pages.

The source spiral read from red 3299, turning right and outward, is:

`3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516`

Consecutive GP29-reduced page-key pairs, in physical p15 through p22 order:

`(22,21), (19,17), (11,1), (10,3), (20,22), (25,7), (22,12), (17,21)`

This avoids a fitted key search and respects original page boundaries and complete runes. Its **weak premise** is author intent: the original page teaches a Fibonacci-prime numeral construction, but nowhere calls it an encryption state update; the first p15 key would need to be used retroactively for text above the source grid. The p15 page's two separate red headings are not concatenated as a fabricated ciphertext or key.

## Exact frozen inverses on the full eight pages

For each page *independently*, initialize `K0,K1` to the assigned pair and decode every original rune including headings using

`P[i] = C[i] − sign*K[i] (mod29)`

and precisely one of two non-fitted source-relevant feedback laws:

- **Ciphertext feedback:** `K[i+2] = K[i] + K[i+1] + C[i] (mod29)`.
- **Plaintext feedback:** `K[i+2] = K[i] + K[i+1] + P[i] (mod29)`.

Both `sign=+1` and `sign=−1` are checked because the original numeral grid does not specify cipher orientation. There is one complete reset per physical page, no hidden F-masking, no page-specific coefficient choice and no fitted reading phase.

| Source equation | Sign | Total original GP29 IoC | Page-local IoC range |
|---|---:|---:|---:|
| Ciphertext feedback | + | **0.03440525** | 0.033118–0.035807 |
| Ciphertext feedback | − | **0.03440304** | 0.033198–0.037932 |
| Plaintext feedback | + | **0.03455223** | 0.033755–0.036759 |
| Plaintext feedback | − | **0.03451300** | 0.032800–0.035848 |

Every candidate processes **all 1,903 original rune symbols** on pp15–22, preserves genuine printed word/page boundaries, and reproduces the complete original ciphertext **1,903/1,903** when re-encrypted. For each four candidate laws, an *independent* genuine solved-p57-GP native-text donor repeated into the eight exact source page lengths also fully recovers its plaintext on inverse. This is a functioning test of each declared reversible law, rather than a claim that the random-looking original inverse is plaintext.

For *plus-oriented plaintext feedback*, a stronger exact algebraic limitation requires **no IV search**:

`K[i+2] = K[i+1] + C[i] (mod29)`, hence `K[0]` affects only rune 0 and changing `K[1]` rotates **all** remaining plaintext runes by one common GP29 offset. Therefore each page's IoC after the first rune is **invariant under every possible 29² private IV pairs**. The page-wise low source indices of coincidence cannot be rescued by regrouping the grid's IV pair values or choosing arbitrary secret page seeds for that specific positive equation.

## Decision

The most elementary eight-pair → eight-page Fibonacci feedback *direct native-English GP29* transfer fails on every page in both straightforward orientations. The previous [single continuous register](lp2-p15-fibonacci-plain-autokey-original-gate.md) and [cipher feedback global register](lp2-p15-fibonacci-cipherfeedback-original-gate.md) tested different reset assumptions; those negatives stand. The source grid remains an authenticated 16-cell number generator. No original-source clue fixes a more complicated page-dependent cipher equation or source-selected preconditioning, so altering recurrences to rescue these four null results is currently unwarranted.

**Reproduction:** [complete standalone Node22 SFT](../sims/lp2_p15_spiral_pairperpage_fibonacci_autokey_sft.cjs) · [Windows Node22 PASS 45149966361](https://github.com/FlareZ123/liber-primus/actions/runs/45149966361). Tests assert every grid cell in spiral order and all eight source IVs, 1,903 original ciphertext runes, reversible encoders, native GP positive recoveries, page scores and full-book original replay.
