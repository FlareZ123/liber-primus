# p56 page-index-skip hypothesis: rejected

## Why this was tested

Michel Oosterhof's historical `stage11/56.py` hard-codes `skip = 56` while applying the p56 numerical stream. Read in isolation, that creates a tempting hypothesis: perhaps physical page `p` passes local rune `p` through unchanged.

That interpretation is **not the established p56 mechanism**. The better preserved community decoder in the pinned `krisyotam/cicada3301` archive defines p56 as:

```
FN = r - (PRIMES[i] - 1)
INTERRUPT = F
INTERRUPT_POS = [4]
```

That is the consecutive **totient-of-prime** stream, because `phi(p)=p-1`, with the fourth F occurrence acting as an interrupter/null. A later independent adjudication likewise recovers one F-null. The old script's skipped absolute offset happens to be 56 because that fourth F lies there; the page number does not select the skip.

## Exact falsification that was run

Before the interrupter provenance was recovered, the literal page-number hypothesis was applied to every rune-bearing LP2 page:

```
if local_position == physical_page_number:
    emit the ciphertext rune unchanged
    do not advance the prime stream
else:
    plaintext = ciphertext - (prime - 1) mod 29
```

The canonical input is `resources/liber-primus/lp2-corpus.json`; reproducer:
`sims/p56_page_index_prime_skip_sft.cjs`.

## Control and unsolved result

The rule reproduces p56 because its one real F-null is indeed at local offset 56.

- p56 control IoC: **0.070028011204**
- maximum unsolved IoC: **p51 = 0.038461538462**
- next: **p36 = 0.038364712974**
- minimum: **p49 = 0.029836829837**

The p56 control plaintext is reproduced exactly:

```
ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTO
ITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE
```

No unsolved page shows a comparable transition.

## Consequence

The page-number hypothesis is closed twice over: its causal premise is wrong once the F-interrupter source is restored, and its exact full-corpus transfer is negative.

Do not build successor searches around “skip rune equal to page number.” Any p56-derived transfer must preserve the actual source mechanics: consecutive `phi(prime)` shifts plus an independently justified F-interrupter policy. Broad prime/totient reuse on unsolved LP2 has substantial prior negative coverage, so a new test needs a source-selected interrupter/state rule rather than another free F-mask sweep.
