# P15 Fibonacci-prime spiral: bounded pre-2014 source search

## Decision

**No exact pre-2014 external source or published puzzle matching the complete p15 construction was located in this bounded search.** The page-derived 16-cell formula remains established; its external attribution and any successor operation remain unknown. This is a bounded search result, not proof that no such source exists or that the creator invented the construction.

## Exact target

The authoritative source reconstruction is [the p15 spiral result](../results/lp2-p15-fibonacci-prime-spiral.md). The target is the *composition*, not generic overlap:

1. Take the distinct Fibonacci values '0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987'.
2. Use each value plus one as a one-based prime index: 'p_(F_n+1)'.
3. Print 'abs(3301 - p_(F_n+1))'.
4. Place the 16 terms in the exact source-visible four-neighbour spiral beginning at red '3299', moving right/down/left/left/up/up/right/right/right/down/down/down/left/left/left.

A relevant historical source would need to prescribe this composed rule, its seed/offset and read order, and at least one further mathematical step or readout that makes a prediction beyond the 16 already printed cells. Shared keywords or an unrelated Fibonacci/prime construction do not qualify.

## Evidence checked

- Exact-phrase and exact-sequence searches included 'absolute difference from 3301' prime Fibonacci, '3301 - prime' Fibonacci, the 16-prime list, 'Fibonacci-indexed primes', 'primes indexed by Fibonacci numbers', and targeted OEIS queries. These returned modern LP2 reproductions and nearby mathematical concepts, but no pre-2014 source for the full composition.
- [OEIS A001605](https://oeis.org/A001605) is titled **indices of prime Fibonacci numbers**: it lists indices n for which the Fibonacci number F_n is prime. That is the reverse construction, not primes selected at Fibonacci-number indices p_(F_n+1), and it does not supply the 3301 absolute difference or square-spiral layout.
- The pre-2014 paper [Bayless, Klyve & Oliveira e Silva, “New Bounds and Computations on Prime-Indexed Primes,” INTEGERS 13 (2013)](https://math.colgate.edu/~integers/n43/n43.pdf) is a close terminological false friend. It defines prime-indexed primes as q_i=p_(p_i), where the prime's index is itself prime (pp. 1–2); the PDF contains no Fibonacci reference. It does not use Fibonacci values as prime indices, 3301, absolute differences, or a 4×4 spiral.
- Standard Fibonacci and prime-sequence references establish the component sequences, not the target composition. No located pre-2014 source fixed the exact F_n+1 convention, 3301 offset, red starting cell, spiral orientation, or a next-step operation.
- [Cicada Notebook Session 03](https://cicadanotebook.com/sessions/3.html) and the [Wulfic master tracker](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) reproduce the 16-cell LP2 formula, but are modern research records, not pre-2014 historical sources. The [CicadaSolvers quickstart](https://www.cicadasolvers.com/quickstart/) discusses a later 2016 cumulative-Fibonacci/464 prime-index interpretation; that is post-2014 and a different operation.

## What follows

- The original p15 grid itself remains the only verified source for the 16-term construction and its visible spiral order.
- The historical-source avenue is closed at this scope. Do not turn the nearby PIP paper, Fibonacci-prime sequence, or later 2016 message into an LP2 key/source without a new exact primary witness.
- Do not calculate or use a 17th term as a key or prediction unless an independent source first selects that continuation. A generated next term would be a mathematical extrapolation, not evidence of intended puzzle design.
- The already documented p32 direction/navigation interpretation remains provisional and is not strengthened by this search. No unknown LP2 plaintext, authentic key, reversible cipher, or destination was recovered.

## Reopening criterion

Reopen only if a dated pre-2014 primary or authoritative mathematical source matches the complete composition and specifies a further operation that can be applied once to a source-selected original LP2 interval with a locked prediction. Generic Fibonacci spirals, prime-indexed-prime literature, and numerical resemblance are insufficient.
