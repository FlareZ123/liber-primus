# LP2 chart-length prime cursor: exact original inverse (#2742)

**Decision:** the fixed nonperiodic prime-minus-one receiver with canonical Latin expansion length clock and literal F holds is impossible on the original 299-rune p54 black-body + p55 tape for every initial prime ordinal 0–3301. This is a path-existence obstruction, not a language-model rejection and not a claim about every prime-based cipher.

## Frozen operation

For plaintext GP rune p and cursor t:
- p=0 (F): output 0 and retain t.
- Otherwise output (p+prime[t]−1) mod29; advance t by the length of its canonical printed chart expansion (one or two letters; NG and IA each length two). Zero-based ordinal, plus sign, no word or page reset.

The inverse of a visible c at t has at most two transitions: literal F if c=0; independently let p=(c−prime[t]+1) mod29, admit only p≠0 and advance by its expansion length. Both can be legal for a visible zero. No dictionary constraints. The original p54 offsets 9..231 (223 black-body runes) and p55 (76) were fixed before scoring.

Exact count recurrence with terminal N(t)=1: at each rune, sum the counts of every allowed successor cursor. Zero identifies an impossible prefix/suffix regardless of language. Bound cursor by initial maximum plus twice the number of consumed runes; this contains every path. Independently compute the exact highest trigram-scoring path over (cursor, previous-two plaintext runes); merging states cannot change the optimum because all future transitions and scores depend only on this state. The language model uses pinned calibrated Emerson/Shakespeare and the six nonplant solved sections, with unigram α=.5, bigram backoff mass10 and trigram mass4.

## Actual source results

| Target | Feasible origins (0–3301) | Exact paths |
|---|---:|---:|
| p54 black body | 5 | 10 |
| p54 black body + p55 | 0 | 0 |

The viable prefix origins 134,135 lead to cursor414 (two paths each), and 2734,2737,2738 lead to cursor3017 (two paths each). The first group dies at p55 rune18 (one-based); the second dies at its **final rune76**. Thus the first globally impossible prefix has length299. The best prefix origin135 scores −6.985465 nats/rune and has no legal withheld continuation. No alternative origin or F history can rescue the full tape.

For the genuine ordinary p56 prime/F control the actual known plaintext reproduces 85/85 ciphertext runes and consumes84 primes; the proposed length-clock version gives only9/85 and consumes90. This establishes the distinction between the authentic and modified mechanism.

## Blind recovery and rival controls

Four disjoint 299-rune native-source plants were fixed before original scoring. Fit only 223 runes, then freeze origin, prefix plaintext, cursor and trigram context; optimize the suffix only within that frozen state. All four exact origin and prefix/suffix sequences are recovered.

| Plant | True / inferred origin | Prefix paths | Exact prefix | Frozen suffix paths | Exact suffix | Fit / suffix nats per rune |
|---|---:|---:|---:|---:|---:|---|
| WELCOME offset0 | 17/17 | 16091 | 223/223 | 2 | 76/76 | −2.3217 / −2.1826 |
| KOAN1 offset0 | 777/777 | 235956 | 223/223 | 2 | 76/76 | −2.2094 / −2.1447 |
| KOAN1 offset350 | 2014/2014 | 317 | 223/223 | 32 | 76/76 | −2.2540 / −2.3734 |
| LOSS OF DIVINITY offset0 | 3301/3301 | 13850 | 223/223 | 32 | 76/76 | −2.3030 / −2.3971 |

All exact recovered paths forward-replay. Under the wrong receiver, four same-source ordinary prime/F plants recover only 8–12/223 fit symbols and 0–4/76 suffix symbols, three have no frozen suffix path. Twelve seeded within-region shuffled original controls have zero full paths. The original's impossibility follows directly from the finite recurrence and does not require the empirical controls.

**Retire this precise expansion-length clock** for the frozen terminal chapter frame. It remains possible that a different authored clock, cipher or segmentation is required. No unknown plaintext or authentic key has been recovered.

Reproducer: [standalone CommonJS SFT](../sims/lp2_prime_latin_expansion_exact_sft.cjs), [full raw output](lp2-prime-latin-expansion-exact-output.json). The exact computational core executed in connected V8 on the pinned repository source blobs; the Node CLI wrapper was not independently executed. The five prefix origins and death positions were independently enumerated with a forward cursor-count DP in the same runtime.
