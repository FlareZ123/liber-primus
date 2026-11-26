# Running GP-prime sum Euler-totient receiver (modulo 3301)

**Decision (Agent43, 26 November 2026):** no unknown LP2 plaintext or authentic key. Retire the precise cumulative-totient receiver below. It is distinct from the modulo-29 linear state in #2774, the clause-product prime-origin rule, and the previous-word prime-sum clock. The solved instruction that primes and totients are sacred, the canonical chart, historical F transparency and 3301 motivate the construction; they do not select this combination or the modulus independently.

## Explicit reversible-state model

Let s be the sum of the consumed plaintext GP primes modulo 3301. At each step use k(s)=phi(s if s != 0 else 3301) mod 29, emit C=(P+k(s)) mod 29, and update s=(s+GPprime(P)) mod 3301. State zero represents the positive modulus. The native transparent-F variant instead emits F unchanged and holds s when P=0. For any known incoming state the ordinary inverse is unique; the transparent variant enumerates both allowed branches at C=0 and never consumes plaintext F. No word boundaries, inferred key schedule, private alphabet or tuning of the modulus. Chapter starts are independently free among all 3301 possible states; strip only the corrected contiguous opening red rubric. Physical p50 is runeless. There is no page reset inside a chapter.

Exact reachability merges states only when they have the same future transitions. For language ranking, add-one native unigram likelihood is optimized exactly by Viterbi over all states, with a prefix ending at the first physical page; freeze its state for continuation. Retrospective full-tape optimum and independently free holdout-state optimum are also reported to bound the chosen score. These are unigram diagnostics, not a complete English model or proof about arbitrary language. Every selected decoded sequence is forward-replayed. A correct replay alone is automatic for the model.

## Exact original result

| Body begins p | Runes | F-hold longest legal prefix | Final F states | Ordinary full best unigram | Ordinary frozen holdout | Ordinary all-origin holdout upper score |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 716 | 716 | 6 | -3.9890 | -4.1093 | -3.9591 |
| 3 | 1129 | 528 | 0 | -4.0114 | -4.1163 | -4.0086 |
| 8 | 1717 | 165 | 0 | -3.9965 | -4.1653 | -3.9891 |
| 15 | 1883 | 522 | 0 | -4.0046 | -4.1478 | -4.0049 |
| 23 | 1005 | 486 | 0 | -3.9887 | -4.0426 | -3.9671 |
| 27 | 1414 | 513 | 0 | -3.9769 | -4.1173 | -3.9809 |
| 33 | 1670 | 495 | 0 | -3.9739 | -4.0236 | -3.9599 |
| 40 | 3000 | 681 | 0 | -4.0181 | -4.0661 | -4.0189 |
| 54 | 299 | 172 | 0 | -3.8519 | -4.0457 | -3.5409 |

Eight of nine bodies have **no legal F-hold inverse**, independently of language and initial state. The first body permits six final states, but the prefix-frozen selected state has no continuation and even the exact full optimum is nonprose (score -4.0573). Ordinary consumption is always invertible; neither the exact full best scores nor the frozen continuations yield recognizable prose. The all-origin holdout upper scores are retrospective and cannot identify keys.

## Calibration

The independent known p56 prime-minus-one control reproduces 85/85 ciphertext runes consuming 84 primes; p57 cleartext matches 95/95. Those checks validate the source chart, not this speculative receiver. Nine separate target-excluded native controls per model use hidden states 1033+137*j modulo3301 and half-record holdout. The transparent variant recovers 1490/1493 withheld symbols; ordinary consumption recovers 1493/1493. Each recovers 6/9 exact starting states; other states coalesce. Native heldout unigram scores range -3.2319 to -2.9030. Controls are short native records; language conclusions are conditional. The F impossibility is exact.

## Reproduction and next decision

[CommonJS SFT](../sims/lp2_running_gpprime_totient3301_sft.cjs) and [executed output](lp2-running-gpprime-totient3301-output.json). The exact experiment function executed in connected V8 using source blobs 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and 1b064ef6d85819b7d96adaff31a82d1ec551598f. The filesystem wrapper was not separately run in Node or CI. No new source selector or plaintext; do not expand the modulus or reset menus based on these failures. The result removes one cumulative nonlinear-state alternative, without excluding other totient-based receivers.
