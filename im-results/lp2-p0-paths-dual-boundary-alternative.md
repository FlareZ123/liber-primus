# Alternative p0 PATHS candidate at offsets 192..195

**Agent 1, 19 November 2026. Classification: independently source-constrained alternative PATHS candidate, weaker than the existing p0 word30 / offsets131..134 PATHS route after reconciliation. Preserve as a useful ambiguity/counterexample to target-family overconfidence rather than replacing the existing PATHS candidate.**

## Result

A separate p0 receiver was selected without using the existing PATHS receiver:

```text
p0 word43
offsets 192..195
cipher [19,12,20,9]
outer H difference = 10 = K*g
```

Two authenticated signed-message words independently hit its boundaries under already charged p50 numeric semantics:

```text
NUMBERS:
  GP0 = 83
  p50[83] = 3D
  base60 = 193
  one-based receiver origin -> 192 = exact word start

IS:
  GP0 = 25
  p50[25] = 3I
  base59 = 195
  zero-based receiver origin -> 195 = exact word end
```

The same end is also reached by authenticated `ARE` through `3J`, so this receiver is a real node in the existing boundary graph.

## Target class fixed before exact key construction

The preceding FOUND / GOOD / LUCK exact keys have H-shells

```text
FOUND key -> [4,20,27,0,10]
GOOD  key -> [27,9,24,12]
LUCK  key -> [24,10,12,20]
```

The observed shell transition gives

```text
FOUND shell[2] = GOOD shell[0] = 27 = -K
GOOD  shell[2] = LUCK shell[0] = 24 = p+1
```

If the same transition is continued one step, the next key-shell first coordinate is `12`.

The selected ciphertext has outer H difference10, so a subtraction key with first shell coordinate12 predicts plaintext outer difference

```text
10 - 12 = 27 mod29.
```

Among authenticated four-rune signed-message words, only three distinct targets have outer difference27:

```text
THEIR   [2,18,10,4]
MEANING [19,28,9,21]
PATHS   [13,24,2,15]
```

Thus the target class was narrowed before the exact packet key was chosen.

## Charged p28 DH packet family

A compact key for PATHS is

```text
[a, H(K,b).sum, H(A,B).diff, p]
= [6,17,18,23].
```

Charge a symmetric family before accepting that member:

- Alice/Bob role swap;
- either coordinate from `H(K, second-private)`;
- either coordinate from the corresponding public-pair H;
- endpoint order `[private,p]` or reversed;
- inner-coordinate order normal or reversed.

This gives **32 unique keys**.

Apply all 32 keys, both additive signs, to **all 11 complete four-rune p0 words**, and compare against all authenticated four-rune target types.

There is exactly **one** hit:

```text
p0 192..195 [19,12,20,9]
- [6,17,18,23]
= [13,24,2,15]
= PATHS.
```

Forward replay is exact.

Windows Node22 reproduction passed in run **44440729198**.

## Reconciliation with the existing PATHS candidate

While this test was running, Agent3 independently committed an earlier PATHS candidate at a **different p0 receiver**:

```text
existing candidate:
  p0 word30, offsets131..134
  cipher [23,14,21,7]
  key [10,19,19,21]
  -> PATHS
```

That route is driven from recovered LUCK:

```text
GP0(LUCK)=31
p50[31]=2D
base59=131
```

and uses a broader 2,842-key shell family with one numeric target hit. Its receiver chronology is weaker because the receiver values had already been exposed before PATHS was selected.

However, the existing word30 candidate has a stronger independent **raw-cipher return**:

```text
raw GP0([23,14,21,7]) = 65
p50[65] = 4F
base60 = 255
```

Position255 lies inside the already recovered p0 YOU receiver at254..256.

For the alternative word43 candidate:

```text
raw GP0([19,12,20,9]) = 60
p50[60] = 1k
base59 = 104
base60 = 106
```

Base59 position104 is merely the end of an otherwise untyped two-rune p0 word, and base60 position106 lies inside the following four-rune word. No existing recovered checkpoint is selected.

The full authenticated boundary graph also prevents overclaiming the dual boundary. Of 59 p0 words, 32 receive at least one charged signed-message boundary edge and 21 receive multiple edges. Within the ciphertext class `outerDiff=K*g=10`, four words have multiple boundary edges: the known GOOD, FOUND, LUCK receivers and this alternative word43.

## Decision

Do **not** replace the existing word30 PATHS candidate with word43.

The alternative is valuable for two reasons:

1. it is a reproducible counterexample showing that narrow source-state key families can recover the same authenticated label at a second source-constrained receiver;
2. it identifies a stronger promotion requirement for PATHS: a decisive receiver-specific consequence must distinguish word30 from word43 before either can be treated as established plaintext.

Current ranking:

- **word30 / 131..134 PATHS:** stronger overall because of the raw-cipher return to recovered YOU;
- **word43 / 192..195 PATHS:** stronger receiver preselection and smaller charged key family, but no comparable independent return.

This ambiguity is evidence against promoting PATHS solely from familywise target uniqueness.

## Reproduction

- SFT: `sims/lp2_p0_paths_dual_boundary_dh_packet_sft.cjs`
- commit: `39b78930775b146f3782f5d41e660a0450b93165`
- Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44440729198
- existing Agent3 PATHS extension: commit `e6fa104863e0cec880755c8805e94d7d12ec9842`, Windows PASS **44440260092**.
