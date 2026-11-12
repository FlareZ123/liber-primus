# P15 Fibonacci-prime spiral: bounded pre-2014 source search

## Decision

**No exact pre-2014 external source or published puzzle matching the complete p15 construction was located.** A partial cross-round antecedent is now identified: a public extraction of the 2013 CicadaOS prime_echo script prints primes through 3301, with pauses at 1033 and 3301. This supports a historical prime/3301 cue but does not supply the Fibonacci indexing, absolute-difference rule, spiral, or cipher consumer. The original p15 infinity mark may select one continuation term, but it does not specify how to use that term cryptographically. The exact 16-cell formula remains reproducible from the original scan; no key or plaintext is recovered.

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

## Partial Cicada antecedent and one-step continuation (provisional)

A public extraction of the 2013 CicadaOS root filesystem preserves the prime_echo script at https://github.com/neuroretransmit/cicada/blob/main/2013/002-3301/rootfs-contents/usr/local/bin/prime_echo. It prints successive primes through 3301 and pauses at 1033 and 3301. This is a plausible earlier-round prompt to notice the prime sequence and the 3301 anchor on p15, but it does not state the Fibonacci-indexed selection or the spiral construction. The signed TCP BASE29 command is a separate artifact: it defines ordinary integer-to-base-29 text encoding, not the GP rune-to-prime table.

The original p15 image places an infinity symbol beneath the 4×4 grid. If this is read as a one-step continuation cue, the next distinct Fibonacci value after 987 is 1597, so p1598=13477. The exact relation is 13477=29×464+21, where 464=π(3301) and 21=F8. Ordinary BASE29 renders 13477 as G0L. This is a candidate cross-round arithmetic closure, not a plaintext, key, or authenticated cipher instruction.

The possible relative byte offset base+13477 is 8,966,441. It was not part of the completed 17-offset DATA/560.13 R40-B3 test (680 frozen L24 candidates, zero survivors; run 43130781364). The infinity mark can motivate considering one continuation term, but it does not select a byte consumer. Do not add this offset to the failed pad family without a separate Director-approved, source-selected hypothesis.

## What follows

- The original p15 grid itself remains the only verified source for the 16-term construction and its visible spiral order.
- The complete external-source avenue remains negative at this scope. The 2013 prime_echo extraction is only a partial antecedent; do not turn it, the nearby PIP paper, or the later 2016 message into an LP2 key/source without an exact primary instruction.
- The original infinity mark is a source-visible cue for considering one continuation term; it does not authorize an open-ended continuation or use of the term as a key. The 17th distinct Fibonacci input gives p1598=13477 and the candidate relation above, but no cipher consumer or plaintext follows from it.
- The already documented p32 direction/navigation interpretation remains provisional and is not strengthened by this search. No unknown LP2 plaintext, authentic key, reversible cipher, or destination was recovered.

## Reopening criterion

Reopen only if a dated pre-2014 primary or authoritative mathematical source matches the complete composition and specifies a further operation that can be applied once to a source-selected original LP2 interval with a locked prediction. Generic Fibonacci spirals, prime-indexed-prime literature, and numerical resemblance are insufficient.
