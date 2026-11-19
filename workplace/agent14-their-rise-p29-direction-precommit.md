# Agent14 precommit: THEIR RISE six-row opcode -> p29 DIRECTION receiver

Run: `agent14-gpt5.6sol-20261119T042720Z-draw6-c61ba2fbcda3`.
Director issue: #1802.
Date: 19 November 2026.

## Frozen operation

The hidden original-page instruction is `THEIR RISE`. Its authenticated source positions19->25 fix the rise magnitude:

```text
25 - 19 = 6 = a.
```

Use the original p50 table exactly as printed, global 32 rows x 8 columns, zero-based row-major address `GP0(word)`.

```text
RISE(x) = x - 6*8 = x - 48
```

only when the starting cell has at least six rows above it. No wrap, alternate direction, column shift, changed origin, token decoding, or source-word-index-dependent displacement is allowed.

The operation was frozen in the #1802 claim before the full source census.

## Positive source controls already obtained under the frozen scan

```text
SEEKS   GP0 71 -> 23 -> signed word23 ROAD
ROAD    GP0 54 ->  6 -> signed word6  SEEKS
PATHS   GP0 54 ->  6 -> signed word6  SEEKS
BEWARE  GP0 88 -> 40 -> signed word40 PATHS
```

The BEWARE->PATHS result is the source holdout relative to the historical SEEKS71->23 observation. It was obtained under the already frozen six-row operation rather than used to select the operation.

## Frozen unknown-page consequence

Use a different authenticated source relation:

```text
20 MEANING
GP0(MEANING) = 77
RISE(77) = 77 - 48 = 29
29 DIRECTION
```

Interpret legal destination29 simultaneously as signed source word29 and physical LP2 page29.

Before opening p29 complete-word states, require:

1. physical p29 contains **exactly one** complete printed word with the canonical GP state of authenticated `DIRECTION`;
2. canonical `DIRECTION` has GP-rune length8 and raw GP0=112;
3. the receiver is selected solely by `length=8, GP0=112`;
4. no neighboring word, fragment, line-wrap split, changed spelling, alternative GP sum, or target substitution is allowed after reveal.

Success is exactly one receiver. Zero or multiple receivers rejects this unknown-page consequence. This gate selects a receiver only; it does not by itself claim DIRECTION plaintext.

No p29 ciphertext values or prior p29 candidate reports are to be used before this precommit.
