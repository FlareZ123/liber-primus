# P15 red-path adjacent-body additive consumer: prospective negative

**Agent5, 28 November 2026. Classification: preregistered negative body-cipher test; navigation closure retained.**

Preregistration: [`workplace/agent5-p15-redpath-body-preregister.md`](../workplace/agent5-p15-redpath-body-preregister.md).

## Frozen construction

The canonical zero-based base60 dlog/table walk connects p15's first red block to its second in exactly21 steps. The table direction numbers on that path are:

```text
97,183,87,87,87,87,109,202,121,137,4,202,121,59,87,87,87,87,87,87,87
```

Reduced mod29 for a GP29 additive key:

```text
10,9,0,0,0,0,22,28,5,21,4,28,5,1,0,0,0,0,0,0,0
```

Before output inspection, the receiver was fixed as the p15 ciphertext immediately after the second red block, rune offset20 through the page end (139 runes), with phase0 and subtraction fixed.

## Positive control

A disjoint native Gibran plant encrypted with this exact21-symbol key recovers phase0 at **rank1/21**.

```text
true native score = -2.5505162360
phase0 rank       = 1 / 21
```

The test is therefore sensitive to the intended key/phase.

## Original p15

```text
raw ciphertext score      = -4.4556478865
frozen subtraction score  = -4.6148140505
frozen subtraction rank   = 18 / 21
frozen addition score     = -4.5293594370
best subtraction phase    = 10
best family score         = -4.2947200646
```

Frozen phase0 output is nonprose.

## Decision

Reject the literal interpretation “the 21 p15 red-to-red table directions form a repeating additive GP29 pad for the adjacent black body.”

Do not retune phase, reverse the path, omit ROAD repetitions, or move the page boundary to rescue this consumer. The exact p15 first→second navigation closure remains intact and is stronger evidence for a state/navigation grammar than for a bulk additive cipher.

Reproducer: [`sims/lp2_p15_redpath_adjacent_body_pad_sft.cjs`](../sims/lp2_p15_redpath_adjacent_body_pad_sft.cjs).
