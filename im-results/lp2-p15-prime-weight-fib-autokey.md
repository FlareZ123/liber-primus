# Prime-weight driven Fibonacci autokey: p16–22 exact receiver

Agent16, 27 November 2026. The source p15 numerical spiral independently combines distinct Fibonacci ordinals with prime numbers. The existing #2374 receiver uses GP **indices** as feedback; this variant uses the source chart's GP prime-minus-one weights, including the historically demonstrated transparent-F convention. This transfer is a hypothesis, not an authored instruction.

For state (a,b), C=P+sign*a mod29; on a consuming symbol update (a,b)→(b,a+b+prime(P)-1 mod29). For transparent F, emit literal zero and hold both registers. Given state and C, all allowed inverses are enumerated: hold if C=0, otherwise or additionally consume with P=C−sign*a; consuming P=0 is forbidden only under transparency. Ordinary consumption is tested separately. Fixed source IV (3299 mod29,3298 mod29)=(22,21); separately grant all 841 possible IVs. The actual receiver begins immediately after p15, p16 training (267 runes), p17–22 frozen continuation; 1744 original runes total. No resets or word-boundary assumptions. Both signs. Exact Viterbi with unigram Gibran likelihood and full reachability: retaining one best path per state is exact for that objective and does not drop reachable states. The frozen fit end-state is the sole permitted continuation seed; all full original candidates and held candidates are forward replayed. Shakespeare controls are independent of the Gibran training text. Greedy GP transliteration as implemented; controls not source-authored cipher evidence.

## Original outcomes

| sign | literal F | IV | full first dead offset (0-based) | full final states | frozen holdout first dead offset | heldout mean log likelihood | heldout IoC |
|---|---|---|---:|---:|---:|---:|---:|
| 1 | false | spiral | none | 1 | none | -4.297271 | 0.034628 |
| 1 | false | all | none | 1 | none | -4.402493 | 0.034407 |
| 1 | true | spiral | 12 | 0 | fit failed | — | — |
| 1 | true | all | 236 | 0 | fit failed | — | — |
| -1 | false | spiral | none | 1 | none | -4.291607 | 0.034451 |
| -1 | false | all | none | 4 | none | -4.304401 | 0.034397 |
| -1 | true | spiral | 7 | 0 | fit failed | — | — |
| -1 | true | all | 418 | 0 | 20 | — | — |

## Positive plants

- sign 1, F false, Shakespeare GP offset 500: held 1477/1477, full 1742/1744, held log likelihood -2.934743.
- sign 1, F false, Shakespeare GP offset 5500: held 1477/1477, full 1733/1744, held log likelihood -2.964758.
- sign 1, F false, Shakespeare GP offset 10500: held 1477/1477, full 1744/1744, held log likelihood -3.011496.
- sign 1, F true, Shakespeare GP offset 500: held 1477/1477, full 1742/1744, held log likelihood -2.934743.
- sign 1, F true, Shakespeare GP offset 5500: held 1473/1477, full 1729/1744, held log likelihood -2.964758.
- sign 1, F true, Shakespeare GP offset 10500: held 1477/1477, full 1744/1744, held log likelihood -3.011496.
- sign -1, F false, Shakespeare GP offset 500: held 1477/1477, full 1744/1744, held log likelihood -2.934743.
- sign -1, F false, Shakespeare GP offset 5500: held 1477/1477, full 1744/1744, held log likelihood -2.964758.
- sign -1, F false, Shakespeare GP offset 10500: held 1477/1477, full 1744/1744, held log likelihood -3.011496.
- sign -1, F true, Shakespeare GP offset 500: held 1473/1477, full 1740/1744, held log likelihood -2.934743.
- sign -1, F true, Shakespeare GP offset 5500: held 1477/1477, full 1744/1744, held log likelihood -2.964758.
- sign -1, F true, Shakespeare GP offset 10500: held 1467/1477, full 1732/1744, held log likelihood -3.009624.

## Decision

Both transparent-F signs are impossible even with arbitrary initial state. Ordinary outputs are determined by the specified state law and are not authenticated plaintext. The held previews and state counts are in the machine-readable result; compare likelihood and coincidence against the independent controls. Do not infer universal failure of Fibonacci feedback, unknown alphabets, or alternative clocks from this exact receiver. No new authenticated key or unknown LP2 plaintext recovered.

Reproduce with [SFT](../sims/lp2_p15_prime_weight_fib_autokey_sft.cjs); [raw results](lp2-p15-prime-weight-fib-autokey.json). Numerical core executed on fetched repository sources in connected JS; standalone wrapper has not been run independently.
