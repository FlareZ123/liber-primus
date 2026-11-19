# THEIR NUMBERS gives one orientation rule for every numbered-diagonal unit run

**Agent39, 19 November 2026. Classification: source-authored readout grammar. This consolidates four previously separate numbered-diagonal checkpoints under the standard outside-in H transform plus one numeric orientation rule. It removes the p11 sum-before-difference exception and supplies the previously missing OPENPGP reversal opcode.**

## Fixed inputs

The corrected numbered diagonal uses authenticated source index `i` to select physical `p_i`, canonical word `i+1`. It has 42 valid objects; YOU32 is the sole direct-coordinate gap.

Use the standard pair-interleaved outside-in transform throughout:

```text
H(x0,...,xn) =
  x0-xn, x0+xn,
  x1-xn-1, x1+xn-1,
  ...
  mod29
```

The authenticated source itself supplies the orientation instruction:

```text
25 THEIR
26 NUMBERS
27 ARE
28 THE
29 DIRECTION
```

The active numerical direction is increasing source order.

## Complete full-H charge

Apply standard H to every one of the 42 valid numbered-diagonal receivers. Ask only whether the **complete** H output is a strict unit-step run in either direction.

Exactly three objects pass:

```text
IS11
-> p11 canonical word12 [11,14]
-> H [26,25]
-> increasing direction [25,26]
-> THEIR NUMBERS

AND24
-> p24 canonical word25 [27,15]
-> H [12,13]
-> increasing direction [12,13]
-> THE WAY

OPENPGP42
-> p42 canonical word43 [16,0,14]
-> H [2,1,0]
-> increasing direction [0,1,2]
-> HELLO THE PATH
```

This resolves two former local conventions.

The p11 report previously serialized the pair as sum before difference to obtain `[25,26]`. Standard H actually gives `[26,25]`; the source-authored numeric direction supplies the ordering.

The corrected OPENPGP report already proved `[2,1,0]` is the unique three-rune diagonal unit run and manuscript-unique exact H shell, but correctly withheld a reversal opcode. The same increasing-number rule now supplies it, giving the exact source prefix `HELLO THE PATH` without a new local exception.

P24 was already in increasing order, so `THE WAY` is unchanged.

## One clue-selected circumference shed

The p27 branch independently supplies `WE MUST SHED`, and the solved p57 text specifies circumferences. Charge every numbered-diagonal object with length at least4 after exactly one outer-rune shed, then apply the same H and complete-unit-run predicate.

There is one hit:

```text
ARE27
-> p27 canonical word28 [0,20,15,1]
-> shed [20,15]
-> H [5,6]
-> increasing direction [5,6]
-> EPIPHANY SEEKS
```

Thus the four checkpoints share one grammar:

```text
source number
-> numbered-diagonal receiver
-> optional clue-selected circumference shed
-> standard H
-> if complete output is a unit run, orient by increasing source numbers
-> read authenticated source tokens
```

## Consequence

The numbered diagonal now has a reusable, source-authored readout convention rather than several page-local orientation choices.

It yields:

```text
THEIR NUMBERS
THE WAY
HELLO THE PATH
EPIPHANY SEEKS
```

The OPENPGP endpoint therefore resets mechanically to the beginning of the authenticated source program, while the ARE27 branch feeds its `EPIPHANY SEEKS THE DEVOTED` p32 route. This strengthens the interpretation of the signed 2016 text as an executable navigation register.

It does not decrypt continuous unknown LP2 body prose.

## Reproduction

`node sims/lp2_numbered_diagonal_unitrun_direction_grammar_sft.cjs`
