# SURFACE exposes OPENPGP and supplies a second prospective mod58 page prediction

**Agent25, 19 November 2026. Status: source-constrained navigation result. No unknown body plaintext is claimed.**


## Radix reconciliation

**Radix reconciliation (Critic, 19 November):** The original p50 images provide no explicit digit legend or byte serialization (#1890). The authenticated 2013 `THE KEY IS ALL AROUND YOU` clue supplies a source-conditioned discriminator: its complete GP0 value fixes cell252, an outer-ring cell; base60 `30→180` matches both the 180-cell interior and the p56+p57 rune total, while base59 gives177 ([report](../im-results/lp2-2013-all-around-p50-p53-receiver.md)). This makes base60 the leading source-selected interpretation, but not a literal byte legend. Base59-only results below remain conditional and, where they imply DIRECTION/CIRCUMFERENCES/EMERGE, conflict with the leading base60 reading until independently reconciled.
## Result

The current p55 -> p22 route already supplies a source-linked 5x5 magic square. Solved p57 commands recursive circumference shedding, which leaves center **809**; the conditional zero-based p50/base59 consumer reads **EMERGE**, and the existing six-rune pointer walk continues to **SURFACE**.

Take that last word literally on the same selected square: inspect its outer surface, with no new square, rotation, traversal, or cipher family. The eight unique perimeter values are:

```text
434 1311 312 278 966 1071 626 204
```

Apply exactly the same frozen consumer used at the square center:

```text
source integer -> source mod 256 -> p50 token -> base59 value
```

The resulting typed hits are:

| square value | p50 address | token | base59 | typed source word |
|---:|---:|---|---:|---|
| 1311 | 31 | 2D | 131 | p57 CIRCUMFERENCES |
| 1071 | 47 | 1G | 75 | signed-2016 OPENPGP |

The remaining six unique surface values hit neither the authenticated signed-2016 GP0 registry nor solved-p57 GP0 registry.

The authenticated source itself then gives the next operand literally:

```text
Beware false paths. Verify OpenPGP 7A35090F.
```

Treat the printed OpenPGP key ID in its conventional representation, hexadecimal integer `0x7A35090F`. The 58-page direction rule was already frozen by the earlier square-center loop and explicitly lacked a second prospective prediction. Before inspecting any p23 consequence:

```text
0x7A35090F mod 58 = 23
```

This prospectively selects **physical p23**.

P23 already had an independent source-visible state/layout construction yielding **THE ORIGINAL** and a unique p23 -> p33 DH-state handoff. The p23 result predates this OPENPGP surface route, so it serves as the requested second independent number-to-page consequence rather than a target chosen after the modulus.

## Controls and charged rivals

The same base59 surface read was applied to all three authenticated 2014 magic squares. **OPENPGP occurs once, on the selected 809-centered square at source value1071.**

The live base60 channel yields typed hits including VERIFY and DIVINITY. This report holds base59 and base60 fixed across the entire perimeter rather than switching by target; however, the authenticated 2013 ALL AROUND clue now favors base60 as the source-conditioned interpretation. The base59 OPENPGP hit remains conditional, while the base60 VERIFY/DIVINITY outputs are the leading channel pending independent adversarial review.

The printed key ID fixes the 32-bit hexadecimal representation. The later full 160-bit fingerprint was tested only as a separate, sealed extension after p23: interpreting THE ORIGINAL as “use the original full fingerprint” predicted p41 because

```text
0x6D854CD7933322A601C3286D181F01E57A35090F mod 58 = 41.
```

That prediction was committed before p41 inspection in
`workplace/20261119-agent25-openpgp-original-fingerprint-p41-precommit.md`.
Physical p41 has genuine source-visible structure, including one of the four preserved internal apostrophe marks and the repeated floral stencil, but it supplies no predeclared typed reversible receiver/operator. Under the sealed acceptance gate this continuation **fails and is retired**. No alternate fingerprint encoding, endianness, modulus, or neighboring page was tried.

## What changes

The earlier p22 loop report ended with:

> modulo58 page wrapping remains inferred pending a second prospective number-to-page prediction.

This experiment supplies that missing prediction:

```text
p22 square
  -> SHED CIRCUMFERENCES
  -> 809
  -> EMERGE
  -> SURFACE
  -> outer square value1071
  -> p50/base59
  -> OPENPGP
  -> printed 7A35090F
  -> hexadecimal integer mod58
  -> physical p23
  -> independently pre-existing THE ORIGINAL / DH-state checkpoint
```

This materially strengthens **58-page wrapping as a candidate implementation of “their numbers are the direction.”** It still does not establish a universal number-jump rule, does not decrypt p23 body text, and does not supply a full LP2 inverse.

## Reproduction

```text
node sims/lp2_p22_surface_openpgp_mod58_p23_sft.cjs
```

Windows Node22 CI: **PASS**, run 44475472469.

The SFT reconstructs the target-square surface, charges all three source-square surfaces under the same base59 consumer, verifies the authenticated `Verify OpenPGP 7A35090F` operand, checks the short key-ID modulo58 destination, retains the base60 rival separately, and records the sealed full-fingerprint p41 failure.
