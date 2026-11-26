# Native-prime multiplicative feedback: exact original impossibility

Agent45, 26 November 2026, Director #2929. **No recovered unknown plaintext.** The frozen recurrence is mathematically impossible on original p40–53, even before language scoring.

## Distinct model and exact inverse

For nonzero native GP29 plaintext index P, emit C=P+k mod29 and update k'=k*m(P) mod29, where m(P)=GP-prime(P) mod29 except the unique zero residue at N (index9, prime29) maps to 1. For plaintext F (index0), emit C=0 and retain k. Initial k ranges over 1–28. This is an exploratory recurrence motivated by native GP primes and red-word products, not an authenticated organizer opcode. #2651 is a cycle-index multiplier on plaintext, #2867 a multiplicative output-domain action; neither covers this additive-output plaintext-dependent feedback.

At every (C,k), the only consuming candidate is P=(C-k) mod29; if P=0 that edge is illegal. At C=0 also retain (P=0,k'=k). Thus the 28-state lattice enumerates all legal plaintext paths, including ambiguous F. No key, plaintext frequency, printed word boundary, or beam cap restricts reachability.

## Blind native controls

Leave-one-section-out fixed smoothed trigram LM, using the other native solved sections. For each plant infer initial k and exact maximum-likelihood prefix path from the first floor(2n/3) ciphertext runes alone. Freeze terminal k and last two plaintext runes, then decode the remaining suffix from that state. The full inverse uses exact dynamic programming, not a beam.

| Native section | Initial k | N (zero-prime residue) occurrences | Fit recovered | Held-out recovered | True terminal state |
| --- | ---: | ---: | ---: | ---: | --- |
| WELCOME | 2 | 35 | 343/343 | 172/172 | yes |
| KOAN1 | 17 | 37 | 519/520 | 260/260 | yes |
| LOSS OF DIVINITY | 28 | 48 | 502/503 | 251/252 | yes |
| second KOAN | 11 | 22 | 212/212 | 107/107 | yes |

All four initial keys and fit-terminal states recover exactly; 2,366/2,369 runes overall, 790/791 held-out. All four predicted streams re-encrypt exactly. Two plants have local plaintext ambiguity under the chosen LM, so the predeclared strict all-exact linguistic gate does not pass. It is unnecessary to tune it: the original structural gate below is language-independent.

## Original exact certificate

The fixed chapter consists of 3,008 original p40–53 indices (125 visible F), including p50's empty rune tape. All 28 initial states enter the forward lattice. After the first 40 ciphertext runes, there are zero surviving states or paths. The first 39 runes retain at least one path; at position39 (zero-based) the sole remaining state is rejected by C=1. No original language candidate exists.

Stronger internal witness: the following **ten consecutive nonzero ciphertext runes** occur within physical p47, offsets 126–135 inclusive (zero-based), chapter offsets 1989–1998. This segment has an empty inverse image even if initialized with all 28 nonzero states at its own start. Hence any continuous use of this recurrence spanning the segment is impossible, regardless of initialization at the chapter header or earlier page. This does not exclude a reset inside that ten-rune segment or a different update/zero law.

| Local position | Cipher index | Reachable state count after rune |
| ---: | ---: | ---: |
| 126 | 20 | 18 |
| 127 | 5 | 11 |
| 128 | 17 | 8 |
| 129 | 23 | 7 |
| 130 | 16 | 4 |
| 131 | 13 | 4 |
| 132 | 18 | 2 |
| 133 | 9 | 2 |
| 134 | 13 | 1 |
| 135 | 26 | 0 |

The last surviving state before local135 is k=26, equal to C=26, forcing the forbidden consuming P=0 at a nonzero C. The state sets and actual source rune tape are in the certificate. Since this is an exact impossibility rather than a language-score significance test, selecting a concise contradictory substring does not weaken the proof. The minimum length within the selected chapter was 10.

## Reproduce and decision

- `node sims/lp2_native_prime_multiplicative_feedback_lattice_sft.cjs` — exact forward/inverse control and original reachability.
- [Executed output](lp2-native-prime-multiplicative-feedback-lattice-output.json).
- [Original empty-image certificate](lp2-native-prime-multiplicative-feedback-empty-image-certificate.json).

Executed in connected V8 on the committed canonical corpus and solved GP29 native file. The separate bitmask trace reproduced the 40-rune rejection and exposed the short interior witness. No original scoring performed; no unknown plaintext or key. Retire precisely the stated multiplicative plaintext-feedback law. Do not add alternative residue conventions, state resets, or coefficients after failure.
