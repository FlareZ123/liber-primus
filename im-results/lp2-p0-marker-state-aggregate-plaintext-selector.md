# P0 marker-state aggregates uniquely select EPIPHANY SEEKS from the pinned source vocabulary

**Agent24, 19 November 2026. Classification: target-free finite source-vocabulary plaintext selector.** The test does not assume `EPIPHANY SEEKS`. It derives the state target from authenticated 2014 square metadata, uses the original p0 marker's visible `4|5|4` grouping, and charges every canonical unknown-manuscript 8+5 receiver against every solved/authenticated 8+5 source-word pair.

## Independent inputs

The authenticated 2014 square family reconstructs:

```text
(p,g,a,b,A,B,K,e,q)
=
(23,5,6,15,8,19,2,3,4)
```

The original p0 title marker visibly partitions 13 positions as `4|5|4 = q|g|q`.

Use only the already fixed reversible outside-in transform `H(x,y)=(x-y,x+y) mod29` and its exact inverse.

## State-predicted marker aggregates

For any candidate 13-rune plaintext under a 13-rune 8+5 ciphertext receiver, define `R=C-P mod29`. Partition `R`, `H(R)`, and `H^-1(R)` by the original marker's fixed `4|5|4` groups and sum each group modulo29.

The independently recovered state predicts all four charged targets:

```text
raw group sums       = [B,-b,-b]   = [19,14,14]
H group sums         = [A+g,p,a]   = [13,23,6]
H^-1 group sums      = [K,-b,-B]   = [2,14,10]
H^-1 center five     = [q,A,B,A,q] = [4,8,19,8,4]
```

These state expressions are fixed before any candidate word pair is read.

## Exhaustive pinned family

The receiver family is every adjacent page-local 8-rune + 5-rune pair in unknown LP2: 19 receivers. The plaintext vocabulary is pinned to native-GP words from solved LP1 and words from the authenticated 43-word signed 2016 message.

After deduplication the family contains 18 eight-rune words and 38 five-rune words, giving `19 x 18 x 38 = 12,996` receiver/plaintext candidates.

For every candidate, compute `R`, `H(R)`, and `H^-1(R)`, then require all four state conditions above.

```text
survivors: 1 / 12,996

receiver: p0 word1-word2, start0
plaintext: EPIPHANY SEEKS
source: authenticated signed 2016 message
```

The exact residual is:

```text
[26,24,8,19,27,24,18,3,0,8,0,16,19]
```

and:

```text
H^-1(R) =
[25,28,11,25, 4,8,19,8,4, 7,13,20,28]
```

Exact forward replay reproduces the original p0 ciphertext.

## Why this improves the plaintext status

Earlier p0 work already supplied independent source-side selectors for the same phrase. The p22 square / BASE29 source chain contains literal `151=[5,6]=EPIPHANY SEEKS`. The ciphertext-only p0 `THE / WAY` direction route selects the signed source interval beginning `5,6`. The p0 marker residual contains the independently square-derived center `[q,A,B,A,q]` and state-sum packets above.

This test makes the marker route target-free inside a finite source vocabulary. It asks which of 12,996 pinned source candidates satisfies the independently recovered state packets, and obtains one answer.

Preserve `EPIPHANY SEEKS` as a **strong source-selected local plaintext recovery**.

## Remaining decryption gate

The exact local inverse is reversible once the residual is known: `P=C-R mod29`. The unresolved step is a source-authored serializer that emits all 13 residual atoms in order before plaintext inspection.

Aggregate provenance is now strong:

```text
marker counts       = [q,g,q]
raw marker sums     = [B,-b,-b]
H marker sums       = [A+g,p,a]
H^-1 marker sums    = [K,-b,-B]
H^-1 center         = [q,A,B,A,q]
```

The atom-by-atom left/right serialization remains incomplete, so this result does not establish a universal LP2 cipher.

## Reproduction

```text
node sims/lp2_p0_marker_state_aggregate_plaintext_selector_sft.cjs
```

The SFT reconstructs the square state from authenticated square metadata, rebuilds all 19 manuscript 8+5 receivers, constructs the solved/authenticated source vocabulary, charges all 12,996 candidates, and verifies exact forward replay.
