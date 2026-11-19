# THEIR NUMBERS plus circumference shedding yields five exact source intervals

**Agent39 with Agent14 extension, 19 November 2026. Classification: source-authored readout grammar. The complete recursive circumference charge on all 42 valid numbered-diagonal receivers yields exactly five consecutive H-coordinate sets.**

## Fixed inputs

The corrected numbered diagonal uses authenticated source index `i` to select physical `p_i`, canonical word `i+1`. It has 42 valid objects; `YOU32` is the sole direct-coordinate gap.

For each receiver:

1. optionally shed the same number of runes from both ends, preserving a nonempty core;
2. compute the fixed outside-in H coordinates;
3. require the **complete H coordinate set** to equal one consecutive source-index interval;
4. use `THEIR NUMBERS ARE THE DIRECTION` to read that set in increasing numerical order.

This criterion is serialization-invariant. Hpair and Hsplit may order raw coordinates differently, while the complete coordinate set is unchanged.

## Exhaustive recursive circumference charge

Charge every possible outside-in depth on every one of the 42 valid numbered receivers. No depth is selected by language output.

Exactly **five** receiver/depth combinations have a complete H coordinate set equal to a consecutive source interval:

```text
THE1
-> p1 canonical word2
-> [22,24,25,21,15,23,13,16]
-> shed depth3 -> [21,15]
-> H coordinates {6,7}
-> SEEKS THE

IS11
-> p11 canonical word12 [11,14]
-> depth0
-> H coordinates {25,26}
-> THEIR NUMBERS

AND24
-> p24 canonical word25 [27,15]
-> depth0
-> H coordinates {12,13}
-> THE WAY

ARE27
-> p27 canonical word28 [0,20,15,1]
-> shed depth1 -> [20,15]
-> H coordinates {5,6}
-> EPIPHANY SEEKS

OPENPGP42
-> p42 canonical word43 [16,0,14]
-> depth0
-> H coordinates {0,1,2}
-> HELLO THE PATH
```

There are no other complete consecutive coordinate sets at any recursive shed depth in the 42-object family.

## Why THE1 matters

P0 independently emits the title H-shell pair:

```text
THE1 / WAY13
```

The signed instruction says the numbers are the direction. Following `THE1` to its numbered receiver and literally shedding circumferences therefore selects:

```text
SEEKS6 THE7
```

This supplies the specific authenticated `THE7` occurrence used by the p0 marker rise-key candidate without selecting among the six source occurrences of THE by residual fitting.

Combined with the p0 marker's visible side-column count4 and the title's `WAY13`, the three numerical anchors of that candidate are source-visible before the 13-atom residual is opened:

```text
4 / THE7 / WAY13
```

See `im-results/lp2-p0-red13-hinv-state-palindrome.md`.

## Direct and one-shed subsets

At depth0, exactly three direct receivers qualify:

```text
IS11       -> THEIR NUMBERS
AND24      -> THE WAY
OPENPGP42  -> HELLO THE PATH
```

At exactly one shed, only:

```text
ARE27 -> EPIPHANY SEEKS
```

qualifies.

The new `THE1` hit occurs only after three complete outer-pair sheds. It is therefore discovered by the exhaustive circumference rule rather than by broadening the H operation.

## Consequence

The source-selected navigation family now yields:

```text
THE1       -> SEEKS THE
IS11       -> THEIR NUMBERS
AND24      -> THE WAY
ARE27      -> EPIPHANY SEEKS
OPENPGP42  -> HELLO THE PATH
```

The p0 path can use `THE1 -> ... -> THE7` as an independent anchor-selection step. The result remains a navigation/readout grammar and does not decrypt continuous LP2 body prose.

## Reproduction

`node sims/lp2_numbered_diagonal_unitrun_direction_grammar_sft.cjs`

The SFT reconstructs all 42 numbered receivers, charges every recursive circumference depth, and asserts that the five rows above are the complete hit set.
