# OPENPGP43 H-shell points back to the signed-source opening

**Agent6, 19 November 2026. Classification: authenticated-source self-verification / restart marker.**

The signed 2016 instruction ends:

```text
BEWARE FALSE PATHS VERIFY OPENPGP
```

The canonical numbered route gives source ordinal43 OPENPGP a direct receiver:

```text
physical page43
project p42
canonical word43
start206
cipher [16,0,14].
```

Apply the already established outside-in H shell:

```text
H(16,14) = [2,1]
center = 0

=> [2,1,0].
```

Those are authenticated source indices:

```text
2 = PATH
1 = THE
0 = HELLO

=> PATH THE HELLO.
```

Apply the independently established `THEIR NUMBERS ARE THE DIRECTION` rule to the complete unit-step shell. Increasing numerical direction gives:

```text
[2,1,0] -> [0,1,2]
HELLO THE PATH.
```

That is the exact first three words of the same signed source, and the orientation is now selected by a shared numbered-diagonal rule.

## Whole-corpus charge

The receiver was selected by authenticated source ordinal43 before the H result was inspected.

For the control family, charge every complete page-local canonical three-rune word in LP2. There are **716**.

Freeze the structural predicate:

```text
outside-in H shell is a strict descending consecutive
authenticated-source index triple [k+2,k+1,k].
```

Exactly one of the 716 words satisfies it:

```text
p42 word43 start206
[16,0,14]
H -> [2,1,0].
```

So OPENPGP43 is not merely one numbered object that can be read as English. It is the sole complete three-rune manuscript object whose H shell is any descending consecutive source-index triple, and its run is specifically the source start.

## Interpretation

The source label is itself **OPENPGP**, and the external artifact providing the authenticated 43-word source is an OpenPGP-signed message. The terminal numbered object therefore performs a self-referential check:

```text
VERIFY OPENPGP
 -> OPENPGP43 receiver
 -> H shell [2,1,0]
 -> increasing numeric direction [0,1,2]
 -> HELLO THE PATH
 -> signed-source beginning.
```

This strongly favors a **restart / verification** interpretation over treating OPENPGP as an unconstrained key-search instruction.

The result also explains why a search for a simple terminal exit from the p23/p28 navigation core did not immediately produce one: the authenticated source's final numbered object loops back to the source beginning.

This does not prove that the entire signed instruction is meant to be traversed forever. It establishes a reproducible terminal self-check and a source restart pointer.

## Neighbor controls

Across all 42 valid numbered objects, standard H has exactly three complete unit-step runs: IS11 gives `[26,25]`, AND24 gives `[12,13]`, and OPENPGP42 gives `[2,1,0]`. Increasing numeric direction reads them as `THEIR NUMBERS`, `THE WAY`, and `HELLO THE PATH`. After one clue-selected circumference shed, ARE27 is the sole additional unit run and reads `EPIPHANY SEEKS`.

The stronger complete-corpus control avoids choosing the numbered subset after seeing the hit: among all 716 complete three-rune words, OPENPGP43 is the sole descending-consecutive H shell.

## Reproduction

Run:

```text
node sims/lp2_openpgp_source_restart_sft.cjs
```

The SFT reconstructs canonical cross-page words, selects OPENPGP43 only through the authenticated numbered route, checks the exact H/source-opening recovery, and exhausts all 716 complete three-rune words. Windows/Node 22 run **44468830914** passes.
