# p15 Wythoff-column prime-clock receiver

Status: scoped negative; no recovered plaintext or authenticated key.

## Hypothesis and fixed registration

The solved 4×4 numerical grid on p15 lists absolute differences from 3301 of primes at ranks given by the distinct Fibonacci sequence plus one. Its 16 values reproduce exactly. A distinct mathematical extension is the orthogonal first column of the Wythoff array, whose first row is Fibonacci (Clark Kimberling, [The Wythoff Array and the Zeckendorf Array, 1995](https://www.fq.math.ca/Scanned/33-1/kimberling.pdf); upper Wythoff sequence [A001950](https://oeis.org/A001950)). This is an exploratory mathematical association, not a source-selected instruction. In particular, the zero prefix is an explicit modeling decision to mirror the p15 distinct Fibonacci sequence.

Set one-based prime ranks to 1 followed by floor(nφ)+n for n=1,2,...; the first sixteen ranks are 1,2,5,7,10,13,15,18,20,23,26,28,31,34,36,39. Two fixed candidate key streams are abs(3301-prime(rank)) mod 29 and (prime(rank)-1) mod 29. Both signs, ordinary consumption and literal-F hold are evaluated from the p15 black-text start (rune offset 20), continuously through p22, without phase, alignment or column searches.

## Original input and result

1,883 original runes; p15–21 1,752, p22 131. The corpus and native control blob IDs are recorded in the machine output. Under literal-F hold, a ciphertext zero may be a held F; consumption is also allowed whenever the inferred plaintext is nonzero. Propagating every legal cursor yields the following maximum legal prefix lengths, before the reachable set becomes empty. Ordinary consumption gives deterministic inverses and exact forward replay; mean trigram log scores are in nats per rune.

| Stream/sign | F-hold prefix | Ordinary p15–21 | Ordinary p22 |
|---|---:|---:|---:|
| Grid + | 28 | -5.33029 | -5.16554 |
| Grid − | 18 | -5.29543 | -5.50112 |
| Totient + | 2 | -5.47876 | -5.74148 |
| Totient − | 96 | -5.40022 | -5.43678 |

All F-hold cases fail on the first black-text page. The ordinary inverses are nonprose in both sections. No parameters were tuned using p22; it is only a within-invocation holdout, not independently unseen ciphertext.

## Controls

The native p56 consecutive prime-minus-one rule reproduces 85/85 original ciphertext runes. Six positive-sign literal-F-hold plants (two candidate streams × native p57, WELCOME and KOAN1) recover 2,780/2,780 plaintext runes by exact cursor/context MAP with each donor excluded from training. Final reachability sets can contain multiple cursors; exact MAP recovery on these controls is not proof of unique inversion generally. Native held scores for p56 and p57 are −2.51143 and −2.52853. The controls are overlapping Cicada-style material, not independent literary samples.

## Disposition

Reject the four fixed F-hold registrations by exact reachability; no positive language evidence supports their ordinary counterparts. This does not reject arbitrary Wythoff schedules, but no independent source selects such a schedule or warrants more variants. Keep the solved p15 number-grid result intact. No change to the authoritative plaintext frontier.

Reproducer: [CommonJS SFT](../sims/lp2_p15_wythoff_column_prime_clock_sft.cjs). [Raw output and pinned inputs](lp2-p15-wythoff-column-prime-clock-output.json). Core executed in connected V8; standalone Node wrapper was not separately run. No CI required.
