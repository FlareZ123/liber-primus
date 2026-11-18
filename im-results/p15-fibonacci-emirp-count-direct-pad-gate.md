# p15 Fibonacci primes × 2013 reversible-prime classification: direct GP29 gate

**Agent2, 18 November 2026. Classification: bounded negative. No unknown LP2 plaintext or key recovered.**

## Why this cross-source test is finite

The established p15 construction selects exactly sixteen underlying primes in its centre-out spiral order:

```text
2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817
```

Separately, the contemporaneous 7 January 2013 participant COUNT record preserved in
`im-results/cicada2013-count-AfndPJa0-original-response.md` classifies a prime with `*`
when its decimal reversal is also prime and with `+` when the reversal is composite.
That convention is independently corroborated by a period IRC record, although it is
participant-reported rather than a Cicada-signed protocol specification.

Applying that already-established predicate to the sixteen p15 primes gives the fixed bit mask

```text
1111100110000001 = 0xF981
```

The reversible-prime positions are 2, 3, 5, 7, 13, 79, 149 and 7817. Reversing only those
numbers, while retaining the other eight primes unchanged, gives one exact transformed sequence:

```text
2, 3, 5, 7, 31, 23, 43, 97, 941, 263, 463, 829, 1481, 2593, 4507, 7187
```

Reduced modulo the native GP29 alphabet:

```text
2, 3, 5, 7, 2, 23, 14, 10, 13, 2, 28, 17, 2, 12, 12, 24
```

A repository search found the p15 direct-prime/Fibonacci pad, affine, Hill, AES/ChaCha,
Zeckendorf and continuation families already bounded, but no prior use of this exact
2013 reversible-prime transform. The transformation therefore tests a genuinely distinct
cross-source operand while deliberately keeping the consumer minimal.

## Frozen consumer

Target only the immediately following p16–22 chapter, whose original 1,744 runes are the
same target used by the established p15 direct-key studies. Start at the first p16 rune,
phase zero, run continuously through p22, repeat the sixteen residues, and test only the
two ordinary additive GP29 inverses:

```text
P_i = C_i - K_(i mod 16) (mod 29)
P_i = C_i + K_(i mod 16) (mod 29)
```

No phase, reset, F exception, alphabet relabeling, word clock, score-selected key, or
secondary transform is allowed.

## Result

The unchanged p16–22 ciphertext has IoC **0.0345095980**, normalized by 29 to **1.00077834**.

| fixed inverse | IoC | 29×IoC |
| --- | ---: | ---: |
| subtract transformed-prime key | 0.0345471006 | 1.00186592 |
| add transformed-prime key | 0.0344740693 | 0.99974801 |

Both full outputs remain essentially uniform and their openings are nonlinguistic. The
new source-derived transform therefore does not rescue the already-negative direct
sixteen-period p15 key architecture.

## Decision

Preserve **F981** as an exact relationship between the authentic p15 prime schedule and
the period 2013 reversible-prime classification, but do not promote it to an instruction.
The historical `*`/`+` annotations do not themselves tell a 2014 solver to reverse the
p15 primes, and the manuscript does not specify this direct additive receiver. The
cheapest concrete consumer is negative.

Do not extend this result into phase, reset, sign-clock, table, or S-box searches without
a new first-party selector. A useful successor would have to explain what `F981` or the
reversed-prime sequence is *for* before looking at unknown plaintext.

## Reproducible inputs

- `results/fibonacci-prime-spiral.md` — exact p15 source construction.
- `im-results/cicada2013-count-AfndPJa0-original-response.md` — period COUNT classification and provenance limits.
- `resources/liber-primus/lp2-corpus.json` — canonical original p16–22 GP29 indices.
