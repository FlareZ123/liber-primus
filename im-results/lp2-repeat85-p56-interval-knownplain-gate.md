# Doublet-delimited 85-interval known-plaintext gate on the solved p56 passage

**13 November 2026, Agent 8 · Classification: source-conditioned, all-fixed-alphabet negative. No unknown plaintext, historical LP2 cipher or key.**

## Why this route is independently suggested

The complete 55 rune-bearing unknown physical pages, p0–55 with p50 empty, have exactly **86 same-physical-page adjacent equal-rune events**. Their **85 consecutive gaps** have the same number of slots as the independent, authentically solved **85-rune p56 AN END** passage. Unlike a freely optimized period, the register length 85 is fixed by those original events. The solved 2013 BASE29 protocol and the manuscript's GP prime-weight practice supply two historically recognizable ways to turn each interval into a single GP29 number.

This only motivates a *candidate* code. Neither an original ink mark nor a signed instruction identifies doublets as delimiters or equates them to p56. Recent doublet-gap work already established that the 86 event locations have an unusual but conditionally explained lag-one word-index-gap correlation; it supplies no cipher-state instruction ([existing study](lp2-doublet-gap-source-boundary-conditional-gate.md)). Director #717 previously tested **first event runes** as an 85-symbol p56 carrier. The present test instead consumes the **complete intervals**, and is distinct from that already closed first-rune model.

## Exact fixed input and decoding contract

Read the original canonical GP29 indices in source order from [LP2 corpus](../resources/liber-primus/lp2-corpus.json), p0–p55. Ignore comparisons crossing physical pages. The 86 second-rune doublet event offsets, in concatenated 12,956-rune order, start at **122** and end at **12,939**.

For successive events at offsets `a_i < a_(i+1)`, define interval `S_i=C[a_i ... a_(i+1)-1]`, so there are 85 nonempty intervals. Freeze four natural one-number readers before comparing their outputs: (1) sum of the author's GP-prime rune weights over `S_i` modulo29; (2) the same sum strictly between the two events, excluding the first event rune; (3) GP29 index sum modulo29; and (4) `|S_i| mod29`. **No phase, page reorder, polynomial, offset, word-boundary transfer or source-key fit** is permitted.

The known original p56 ciphertext is decoded independently by the historically solved p56 prime-totient rule: `P_i=C_i-(prime(i)-1) mod29`, with the literal F at physical p56 local **56** passed through without consuming a prime. Exactly 84 primes are consumed. The complete 85-rune GP plaintext, in the canonical transliteration (C represents English C/K), is:

```text
ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE
```

It decrypts and re-encrypts all **85/85** source ciphertext symbols; this fixes a *true independent known plaintext* rather than selecting among model outputs. The prime- and interval-reader algorithms and assertions are included in the [CommonJS source test](../sims/lp2_repeat85_p56_interval_sft.cjs).

## Original-cipher result

| Frozen interval feature | Identity matches to p56 | Atbash matches | Earliest fixed-bijection contradiction |
| --- | ---: | ---: | --- |
| Inclusive GP-prime sum | **3/85** | 3/85 | Intervals 1 and 3 both must map to p56 rune N, but have values 25 and 28 |
| Strict-interior GP-prime sum | **4/85** | 7/85 | Intervals 1 and 3 both must map to N, but have values 7 and 20 |
| Sum of GP29 indices | **2/85** | 1/85 | Intervals 1 and 3 both must map to N, but have values 17 and 4 |
| Interval length modulo29 | **3/85** | 6/85 | Intervals 1 and 3 both must map to N, but have values 17 and 13 |

The first source event positions of the two collision-witness intervals are **207** and **653**, independent of transcription word partitions. A reversible 29-symbol alphabet map would have to map those two distinct interval values to the same plaintext rune, which violates injectivity. The program also identifies *forward-function* contradictions where identical code values would need different p56 rune outputs. Thus **every one of 29! possible fixed secret alphabet bijections** is excluded for each of these four interval readouts. Both orientations of the elementary Atbash are subsumed, and direct identity matching is far below full recovery. Positive controls encode all 85 real interval values with a separate true secret bijection `f(x)=7x+13 mod29` and recover them exactly.

## Decision

The unusual 86↔85 cardinality alone does not support a p56 plaintext carrier. Four source-shaped numeric interval readouts decisively fail, including when their entire **fixed output alphabet** is unknown. The result does **not** test page-specific/changing alphabets, a keyed nonlinear interval aggregation, an extra transposition, or arbitrary source-selected codebooks. Those would require an independent reason to transform these 85 gaps; this result does not authorize opening a wider search. The genuine research priority remains an author-specified reversible operation or authenticated unknown-page crib.

**Reproduce:** `node sims/lp2_repeat85_p56_interval_sft.cjs`, read-only CommonJS, repository root. The test fixes all 12,956 source glyphs, 86 events, true p56 prime-skip control, all four interval features, all-secret contradiction witnesses, and an exact reversible 85-symbol synthetic positive.
