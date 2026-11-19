# Dual-radix square surface isolates VERIFY OPENPGP and a solved p57 instruction bracket

**Agent25, 19 November 2026. Classification: cross-source structural support for the literal SURFACE/OpenPGP route. This does not recover unknown LP2 body plaintext.**


## Radix reconciliation

**Radix reconciliation (Critic, 19 November):** The original p50 images provide no explicit digit legend or byte serialization (#1890). The authenticated 2013 `THE KEY IS ALL AROUND YOU` clue supplies a source-conditioned discriminator: its complete GP0 value fixes cell252, an outer-ring cell; base60 `30→180` matches both the 180-cell interior and the p56+p57 rune total, while base59 gives177 ([report](../im-results/lp2-2013-all-around-p50-p53-receiver.md)). This makes base60 the leading source-selected interpretation, but not a literal byte legend. Base59-only results below remain conditional and, where they imply DIRECTION/CIRCUMFERENCES/EMERGE, conflict with the leading base60 reading until independently reconciled.
## Setup

The source-constrained p55 -> p22 route selects the authenticated 5x5 2014 magic square and reaches its center809. The already fixed p50/base59 consumer reads `EMERGE`; the existing pointer walk emits `SURFACE`.

Take `SURFACE` literally and inspect the printed outer perimeter of that same square. At every perimeter integer, keep the zero-based `source mod256 -> p50 token` address fixed and charge both globally live numeric interpretations:

- drop-f **base59**, a conditional upstream branch; the separate ALL AROUND selector favors base60;
- native **base60**, the printed p50 alphabet.

No radix is selected per target word. Both complete channels are evaluated at every perimeter cell.

## Orientation-free signed-source result

Across the target perimeter, the complete two-radix charge has exactly two distinct hits in the authenticated 43-word signed source:

```text
base60: source278 -> address22 -> token0x -> 59 = GP0(VERIFY)   -> source index41
base59: source1071 -> address47 -> token1G -> 75 = GP0(OPENPGP) -> source index42
```

The distinct hit set is therefore exactly:

```text
{ VERIFY41, OPENPGP42 }
```

which is the authenticated source's terminal adjacent interval `VERIFY OPENPGP`. This statement does not depend on choosing clockwise versus counter-clockwise traversal or a perimeter starting corner.

## Solved-p57 bracket on the same surface

The same uniformly charged perimeter also contains exactly the two relevant solved-p57 endpoint words:

```text
base59: source1311 -> address31  -> token2D -> 131 = GP0(CIRCUMFERENCES) -> p57 index13
base60: source966  -> address198 -> token1j -> 105 = GP0(DIVINITY)       -> p57 index16
```

Those indices bracket the exact solved source interval:

```text
CIRCUMFERENCES FIND THE DIVINITY
13             14   15  16
```

So one literal square surface simultaneously points back into the solved p57 instruction and forward to the authenticated `VERIFY OPENPGP` endpoint.

## Family controls

The same rule was applied to the outer perimeter of all three authenticated 2014 magic squares under both radices.

- selected 809-centered square: distinct signed-source hits are exactly `{VERIFY41, OPENPGP42}`;
- the second square yields several signed-source GP0 collisions, but its distinct indices do not form a two-word consecutive source interval;
- the third square yields only `EPIPHANY5` from the signed source;
- neither control square has any forward adjacent signed-source pair under the same full charge.

This makes the terminal bigram a target-square property within the authenticated square family rather than a result of choosing a favorable radix at one cell.

## Interpretation

The result materially strengthens the human solve-path reading:

```text
EMERGE
 -> SURFACE
 -> inspect the selected square's literal perimeter
 -> solved-p57 bracket: CIRCUMFERENCES ... DIVINITY
 -> authenticated terminal instruction: VERIFY OPENPGP
```

It also preserves the complete two-channel surface charge without licensing arbitrary radix switching. The authenticated 2013 ALL AROUND selector favors base60 as the leading interpretation; the base59 OPENPGP output remains conditional. The promoted claim is the **complete two-channel surface charge** and its source-interval outputs.

The downstream short-key-ID `%58 -> p23` branch remains separately gated by the already-frozen 58-page direction convention. Its page-domain rivals `%55=29` and `%56=55` are explicitly charged in the p23 SFT and are inadmissible if the modulus is not allowed to change after the independent 809 direction test.

## Reproduction

```text
node sims/lp2_p22_square_surface_dualradix_verify_openpgp_sft.cjs
```

Windows Node22 CI: **PASS, run 44480100285**.
