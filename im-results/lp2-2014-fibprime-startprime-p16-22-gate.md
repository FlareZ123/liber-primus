# Fibonacci-prime values as starting primes for the p56 key stream: p16–22 gate

**Agent 42, 18 November 2026. Classification: bounded cross-round negative; no unknown plaintext recovered.**

## Human solve-path hypothesis

The community-archived 2014 secondary Twitter account associated with the p15 Fibonacci material posts twelve Fibonacci primes:
2, 3, 5, 13, 89, 233, 1597, 28657, 514229, 433494437, 2971215073, and 99194853094755497. The account's Cicada attribution is not cryptographically authenticated, so this remains a low-confidence source lead.

Solved p56 establishes a concrete prime-based operation: consume consecutive primes and use \(\phi(p)=p-1\pmod{29}\), with plaintext F transparent and non-consuming. Since the 2014 post supplies actual prime values and p15 is the immediately preceding Fibonacci-themed page, a natural interpretation is that one of the twelve listed primes is the starting prime for this same key stream. The first target is the immediate continuation, physical pp16–22.

**Weakest premise:** no first-party message says to use the tweet's Fibonacci primes as key-stream starting values, and the tweet's account attribution is not authenticated. This is a finite, source-motivated test, not an assertion of author intent.

## Frozen test

- Candidate starts: all twelve listed Fibonacci-prime values, in tweet order.
- For each start \(q\), the key stream is the consecutive prime sequence beginning at \(q\), with \(K_i=(p_i-1)\bmod29\).
- Use the exact p56 inverse: ordinary symbols decode by \(P=(C-K)\bmod29\); plaintext F emits ciphertext F without consuming a prime. Ciphertext F may be either a transparent F or an ordinary encrypted non-F symbol.
- Start at the first rune of p16 and continue without page resets through p22.
- No key offset, sign change, page-specific reset, or fitted parameter.

The largest candidate, 99194853094755497, is below \(2^{64}\). The reproducer generates the next required primes using deterministic 64-bit Miller–Rabin bases and stops each candidate at its first impossible original rune.

## Original result

**All twelve starting primes fail** on the original 1,744-rune pp16–22 ciphertext. Their first impossible positions (zero-based from p16) are:

| Starting prime | First impossible rune |
|---:|---:|
| 2 | 7 |
| 3 | 8 |
| 5 | 4 |
| 13 | 30 |
| 89 | 38 |
| 233 | 12 |
| 1597 | 17 |
| 28657 | 153 |
| 514229 | 12 |
| 433494437 | 2 |
| 2971215073 | 19 |
| 99194853094755497 | 23 |

Every first failure is a non-F ciphertext whose only reachable ordinary inverse would be plaintext F. That is impossible under the p56 rule: plaintext F must bypass the key and emit ciphertext F. The longest candidate survives only 153 runes before contradiction.

## Positive control

The same encoder and inverse were tested on a **1,805-rune synthetic plant** made by repeating the solved p57 plaintext nineteen times and encrypting it with the prime stream beginning at 2. The inverse retains a legal path. This verifies the F-bypass implementation; it does not validate the candidate-start hypothesis.

Reproduce from the repository root with:

    node sims/lp2_2014_fibprime_startprime_p16_22_sft.cjs

## Decision

Reject the exact interpretation that one of the twelve 2014 Fibonacci-prime values starts the p56 prime-totient stream on pp16–22. No unknown plaintext or authentic key is recovered. This does not rule out other uses of the 2014 post or other source-selected mechanisms. Do not add offsets, resets, or extra phases to rescue the failed candidates.
