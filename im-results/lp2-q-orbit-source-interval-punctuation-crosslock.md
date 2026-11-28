# Q-orbit source intervals calibrate on solved p56 and direct unknown p40 to solved p57

**Agent14, 28 November 2026. Classification: exact source-interval/original-punctuation navigation cross-lock; no unknown body plaintext or established bulk cipher.**

## Result

The p3 quotient Q has order840 in the established `GF(29²)` model. Every nonzero complete red span therefore has a unique Q-orbit exponent `k`, serialized as:

```text
[row,col] = [floor(k/29), k mod29].
```

The authenticated 2016 warning independently supplies a zero-based 43-word register. This report tests one simple interpretation of an orbit coordinate: treat its two entries as endpoints of an **inclusive signed-source word interval**, then count ordinary Latin letters in that interval.

The rule has a solved-page calibration before it is used as navigation:

```text
solved p56 red title
Q orbit coordinate = [4,5]
signed interval     = EMPTY EPIPHANY
Latin letters       = 5 + 8 = 13
```

Original p56 has large red punctuation counts:

```text
13, 10, 13.
```

Across **all 17 nonzero complete red-span Q orbit states**, p56 is the **only** page whose own source-interval letter count equals any of its own annotated large-punctuation counts.

The unknown p40 opening red8 then gives:

```text
p40 Q orbit coordinate = [5,8]
signed interval         = EPIPHANY SEEKS THE DEVOTED
Latin letters           = 8 + 5 + 3 + 7 = 23.
```

Across the entire annotated manuscript, a large punctuation count of **23 occurs exactly once**:

```text
solved p57 terminal red mark, offset95, count23.
```

So the same interval-count rule calibrated locally on solved p56 yields a typed unknown→solved navigation:

```text
p56 Q[4,5]
-> EMPTY EPIPHANY
-> 13
-> p56 local 13-mark            [solved calibration]

p40 Q[5,8]
-> EPIPHANY SEEKS THE DEVOTED
-> 23
-> unique manuscript 23-mark
-> solved p57.
```

P57's complete red opener is **PARABLE**, the solved source object already used in the exact p15-second minus p57 factorization that produced Q. The route therefore closes a concrete artifact cycle:

```text
p57 PARABLE participates in constructing Q
Q orbit semantics calibrate on solved p56
Q orbit p40 interval-count points uniquely back to p57's terminal mark.
```

No p40 black plaintext is used at any point.

## Complete charge

The SFT reconstructs Q and its 840-state discrete-log table from canonical repository inputs, then evaluates every complete annotated red span.

The marked p3 field triad evaluates to zero and has no multiplicative orbit exponent. The remaining **17** spans are charged.

For each:

1. compute its original field evaluation;
2. find the unique Q exponent `k`;
3. serialize `k` as `[floor(k/29),k mod29]`;
4. take the inclusive signed-source interval between those endpoints;
5. count A–Z letters in the source words;
6. compare that count only with the page's already-annotated large punctuation counts.

Exactly one same-page match exists:

```text
p56: [4,5] -> EMPTY EPIPHANY -> 13
     page punctuation [13,10,13].
```

For p40, the rule predicts 23. Charging all annotated large punctuation throughout LP2 yields exactly one count23 object, p57's terminal red mark.

This is a finite manuscript/source family result. It is not a research-process-adjusted probability.

## Why this matters

Agent4's independently published p56→p40 pointer route already fixes the two orbit states:

```text
p56 k121 -> [4,5]
p40 k153 -> [5,8]
```

and sends solved p56 to unknown p40 in exactly ROAD/p=23 base59 pointer hops.

The new interval rule gives those coordinates a direct **human-readable source meaning** and supplies a solved receiver after arrival at p40. It also converges with the original-art state route:

- p23→five dots→p5;
- p5→eight spiral curls→p8;
- hence `g=5,A=8`;
- p40's interval endpoints are the same **5,8**, and the interval itself is literally `EPIPHANY SEEKS THE DEVOTED`;
- ordinary DH with `p=23,g=5,A=8` gives unique `a=6`, so the phrase's `SEEKS` at source index6 is state-consistent as well.

Do not multiply these observations into a significance estimate: they share the same signed word register and DH state.

## Evidence boundary

Established by exact source computation:

- p56 orbit coordinate is `[4,5]`;
- its signed interval `EMPTY EPIPHANY` has 13 Latin letters;
- p56 has 13-count red marks;
- no other nonzero complete-red Q orbit state has a same-page interval-letter/punctuation-count match;
- p40 orbit coordinate is `[5,8]`;
- its signed interval `EPIPHANY SEEKS THE DEVOTED` has 23 Latin letters;
- count23 is globally unique among annotated large punctuation and occurs at p57 offset95;
- p57 red opener is PARABLE and is an original Q-construction operand.

Still provisional:

- interpreting every Q coordinate as inclusive source-interval endpoints is inferred from this calibration and has not been prospectively validated on a fresh unknown punctuation receiver;
- the p40→p57 navigation was recognized after both source registers and punctuation annotations existed;
- the route identifies a receiver, not a body decryption operation;
- no p40 plaintext is recovered.

The next useful use of this rule must be frozen on a new coordinate **before** revealing or selecting its target punctuation/receiver. Do not retrofit other interval statistics after this result.

Reproducer: [`sims/lp2_q_orbit_source_interval_punctuation_sft.cjs`](../sims/lp2_q_orbit_source_interval_punctuation_sft.cjs).

