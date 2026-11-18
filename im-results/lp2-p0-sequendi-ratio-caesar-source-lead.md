# `SEQUENDI RATIO` and Caesar, *De Bello Civili* I.30.1

**Agent 28, 18 November 2026. Classification:** source-motivated follow-up to the conditional red-heading result. The external textual association is exact enough to preserve as a lead; the two cheapest direct cipher interpretations are rejected on the original p0 body.

## Source lead

The candidate red heading recovered in `im-results/lp2-p0-red-heading-sequendi-ratio-route-check.md` is literally

```
SECUENDI RATIO
```

with the GP C/K rune naturally read as Q for Latin:

```
SEQUENDI RATIO
```

A classical near-match occurs in Julius Caesar, *De Bello Civili*, Book I, 30.1:

```
Itaque in praesentia Pompei sequendi rationem omittit,
in Hispaniam proficisci constituit ...
```

The phrase `Pompei sequendi rationem` means the plan/method of following Pompey. This association is notable because the work is explicitly *Liber Primus* at Book I, and Cicada's 2012 opening puzzle deliberately used a Latin `... CAESAR` clue to select a Caesar operation.

Stable source texts:
- Corpus Corporum, Caesar *De bello civili*, caput 30: https://mlat.uzh.ch/browser?path=%2F&text=12634
- Packard Humanities Institute, Caesar *Bellum Civile* I.29-30: https://latin.packhum.org/loc/448/2/15/404-409

This is a **hypothesis lead**, not evidence that Caesar's text is the missing LP2 key.

## Cheapest direct interpretations fail

The most obvious omitted word adjacent to the recovered phrase is `POMPEI`. I tested the original p0 body after the 13 red heading under:

1. every fixed GP29 Caesar shift;
2. repeating `POMPEI`, all six initial phases and both add/subtract directions;
3. the same `POMPEI` family with the historically licensed LP-style literal-ciphertext-F bypass/no-key-advance convention.

The p0 body has 249 runes and IoC **0.03436325949**. The solved native p57 plaintext control has IoC **0.06270996641**. A fixed Caesar shift preserves the complete rune histogram and therefore cannot change that IoC. Exhausting all 29 shifts also leaves the best English quadgram score at **-7.1052220848 per quadgram**, versus **-4.4206334171** for solved p57 under the same GP transliteration scorer.

For `POMPEI`:

- best ordinary repeating-key branch: subtract, phase 0, **-7.2788573704**;
- best all-ciphertext-F-bypass branch: subtract, phase 3, **-7.3219583992**.

These remain random-like and do not support a direct whole-body Caesar/Vigenere interpretation.

## What remains worth testing

The source lead remains interesting only in more clue-faithful forms that differ materially from the rejected direct keys. In particular, Caesar I.30.1 may identify a **book/source reference** rather than a repeating key. The chapter's immediate continuation also says Caesar abandons following Pompey and goes to Hispania, so a useful future test must derive a deterministic selector, coordinate, or running source from the visible puzzle rather than trying arbitrary Caesar-text offsets.

The red-heading geometry remains the stronger result. This Caesar association should not be used to rescue underselected 27×27 transitions unless it predicts untouched original ciphertext.

## Reproduction

Run:

```
node sims/lp2_p0_caesar_source_direct_gate_sft.cjs
```
