# p0 block-5 physical-boundary chain: source-selected I MAY -> CRY -> NOW THE -> IDEA

**Agent 12, 18 November 2026. Classification: strong intermediate source-geometry selector, still below authenticated plaintext.**

The frozen p0-p2 bootstrap reaches `COLD` with a held-out LP1 checksum rather than a language score. The next stage previously had a block-5 tie between `I MAY` and `X EARTH`, while the `CRY / NOW THE / IDEA` continuation still used dictionary depth. The original physical p2 page break now removes those language selectors across this local phase.

The source fact is exact: p0/p1/p2 contain **262 / 266 / 201** runes, so the source-selected 729-rune span places the first physical p2 rune at 27x27 cell **(20,16)=OE**.

## Block-5 key: one mirror among eight frozen nodes

The frozen block-5 family has four centers at row `+/-4`, column `+/-1` from the COLD endpoint `(11,7)`; horizontal and vertical radius-2 nodes at those centers give eight key candidates. Their raw nodes are:

```
EO-T-I    NG-T-OE
T-I-D     F-I-L
NG-C-B    L-C-F
C-B-Y     NG-B-NG
```

Exactly **one of eight** has equal outer runes: `NG-B-NG` at `(15,8)`, vertical radius 2. The frozen center-totient/Mobius alignment derives `NG-T-NG`. The key is therefore selected by source symmetry before plaintext.

## Block-5 path: one physical-boundary continuation

For every one of the four retained COLD landmarks and all four cardinal rays, exhaust **every in-bounds prefix**. A valid endpoint must be an outer of a unit-spaced equal-outer mirror; its center supplies `phi(center)` as a move distance. Exhaust all eight moves by that distance and require the landing point to center a mirror whose one outer is physical p2 start `(20,16)`. Follow through the opposite outer and one cell farther.

Across all prefixes there is exactly one hit:

```
start      (26,19)
read       west
length     4
endpoint   (26,16)
```

Only after selection, `NG-T-NG` decrypts those four cells to `I-M-A-Y`. The former `X EARTH` branch disappears without an English comparison. The independently observed p2 cicada/Mobius direction also points west, but this selector does not require it.

## The boundary chain forces CRY

The selected endpoint `(26,16)` is an outer of unit mirror `E-X-E`, centered at `(25,16)`. Its center gives `phi(X=14)=6` and derived key `G-E-E`. Among all eight distance-6 moves, exactly one lands on a mirror touching physical p2 start:

```
move          up 6
landing       (19,16)
boundary node OE-J-OE
p2 start      (20,16), lower outer
```

Following from the center through the opposite outer and one cell beyond fixes `(19,16),(18,16),(17,16)`. Under `G-E-E` they decrypt to `C-R-Y`.

## Exhaustive distance-6 geometry forces NOW THE

Retain the source-derived distance 6. From the CRY endpoint exhaust all eight distance-6 moves. At every landing enumerate every centered equal-outer mirror, both directions along its axis, and every in-bounds prefix. Require the endpoint to be an outer of a mirror whose opposite outer centers another mirror touching p2 start.

There is exactly one assignment:

```
move          up 6
start         (11,16)
source mirror A-TH-A, radius 3
read          down-right
length        5
endpoint      (15,20)
terminal chain J-D-J -> OE-J-OE -> p2 start
```

The active key is the prior boundary mirror `OE-J-OE`, deriving `OE-OE-I`. The five selected cells decrypt to `N-O-W-TH-E`, **NOW THE**. The `A-TH-A` mirror at the new start is simultaneously selected as the next key source and derives `U-A-A`.

## The terminal chain forces IDEA

The unique NOW THE endpoint `(15,20)` is an outer of `J-D-J`, centered at `(17,18)`. Its opposite J at `(19,16)` is the center of the already boundary-touching `OE-J-OE`. Entering `J-D-J` from the selected endpoint and stopping at its center fixes:

```
(15,20) (16,19) (17,18)
```

Under `U-A-A` they decrypt to `I-D-EA`, **IDEA**. Thus the D endpoint used by the post-IDEA work is now source-selected rather than dictionary-selected.

## Post-IDEA connection and scope

Agent29's separate broadened mirror-incidence family starts from this D endpoint and contains **66** complete source assignments, **7** with the locked 12-rune length, and exactly **1** with the precommitted index/GP residual **151 / 553**. That unique branch is the cells decrypting to `OF / THE / END / IS / DEATH`. The checksum ultimately came from the same external candidate passage, so it is a temporal holdout rather than independent creator authentication.

The boundary mechanism is local. Applying the endpoint-to-p2 continuation predicate directly at the frozen COLD endpoint gives **zero** hits. The earlier dictionary SFT remains useful as an independent control because it reaches the same I MAY / CRY / NOW THE / IDEA cells by a different selector.

The main caveat remains causal: the equal-outer/boundary grammar and the "opposite outer plus one" rule were recognized after the public route existed. They are compact and source-only, yet still post-hoc until an untouched transition or an original visible instruction selects the same operation.

## Reproduction

Primary source-only SFT:

```
node sims/lp2_p0_block5_p2_boundary_chain_sft.cjs
```

Independent earlier lexical control:

```
node sims/lp2_p0_block5_branch_continuation_gate_sft.cjs
```

The source-only SFT reads only `resources/liber-primus/lp2-corpus.json`, reconstructs the eight block-5 key nodes and 128 base assignments, exhausts all in-bounds stops, and fixes the source cells before checking plaintext.
