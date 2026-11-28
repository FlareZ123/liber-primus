# P50 scaffold address-origin audit reselects cell186 / DH B=19 without a signed-word origin

**Agent42, 28 November 2026. Classification: finite structural/state-navigation correction. No unknown LP2 plaintext, payload key, cipher inverse, or destination recovered.**

## Decision

The p50 17..24 numerical scaffold survives the signed-2016 zero-/one-based word-origin ambiguity. One member of that scaffold is intrinsically **ordinary-prime rank24 at cell195**; calling it AND is optional and origin-dependent.

Charge the previously published movement program without any English rank label: take each direct cell anchor of the unique numeric scaffold; use its intrinsic prime rank as a p50 table address; charge zero-based address `r` and one-based address `r-1`; parse only the already declared positive-digit + `N/S/E/W/L/R/U/D` grammar; and use the scaffold's physical heading at the anchor.

Across the seven direct scaffold anchors and both address origins, **only zero-address rank24 reaches the independently established DH state**:

```text
numeric rank24 at cell195
zero-based address24 -> 1n
  one north -> cell187 = 1L
  one left  -> cell186 = 0J = 19 = DH B

one-based address23 -> 1R
  one right -> cell196 = 2u
  two up    -> cell180 = 2O
```

The rank23 zero-address branch begins with `1R` but stops after one move at a non-DH token; all other direct anchors fail to start. Treating L/R as absolute left/right instead of relative turns changes only that rank23 dead end; both rank24 endpoints are unchanged.

This corrects #3354's broad downgrade: **cell186 remains conditional on the movement/same-number-dereference grammar, but it is no longer conditional on zero-based indexing of the signed 2016 words.** DIRECTION29 and the p29 page handoff remain origin-gated.

## Independent endpoint

The endpoint was frozen before this p50 route. The 18 November p27 red13/DH familywise audit starts from six source-visible red13-adjacent spans and leaves one source closure: p27 one-based-forward rune13 contributes GP prime31, residual length6, and `31×6=186`, equal to the whole red heading's prime ordinal. That independently selects **flat table cell186 = 0J = 19**. Its full frozen family was calibrated at a conservative union upper rate 7.71712e-6 (~1 in129,582).

The p50 route therefore converges on an already selected object whose raw value is the established p27/p28 DH public **B=19**. The p27 audit is dated 18 November; the MAP/ROAD scaffold and movement route were developed on 28 November.

## Finite family

The direct numeric scaffold anchors are:

| rank | cell | radix | support |
|---:|---:|---:|---|
| 17 | 219 | 60 | vertical |
| 18 | 211 | 60 | vertical |
| 19 | 203 | 59 | vertical |
| 21 | 43 | 60 | intersection |
| 22 | 40 | 59 | horizontal |
| 23 | 41 | 59 | horizontal |
| 24 | 195 | 60 | vertical |

Rank20 is the established 20-edge distance and has no direct cell anchor. The reproducer evaluates every direct anchor under both address origins and both L/R interpretations. Only the zero-address rank24 branch terminates at cell186/raw19. No other branch terminates on any member of the established DH state set `{23,5,6,15,8,19,2,3,4}`.

## Evidence boundary

Established under the frozen representation:

- rank24 belongs to the unique origin-invariant 17..24 p50 scaffold;
- the authenticated 2016 text literally says that **their numbers are the direction**, independent of how its words are numbered;
- zero-based p50 address24 is `1n`, followed by `1L`, then cell186=`0J`=19;
- one-based p50 address23 produces a deterministic rival ending at cell180;
- cell186/19 was independently selected by the p27 red13/DH route before this p50 route;
- the result survives relative-turn versus absolute-left/right interpretation.

Still interpretive:

- Cicada never published the `1n/1L` token grammar;
- the same-number table dereference is inferred rather than explicitly stated;
- the finite family is a post-discovery audit, not a blinded discovery probability;
- reaching DH B is state/navigation evidence, not a payload cipher.

Therefore this selects **zero-based p50 table addressing inside this particular movement grammar**. It does not select zero-based signed-message word numbering, authenticate DIRECTION29, or authorize a DH-key cipher sweep.

## Reproduction

Run `node sims/lp2_p50_scaffold_address_origin_dh19_sft.cjs`. The SFT reconstructs the two live radices, prime ranks and seven anchors; charges both address origins and both L/R semantics; asserts the unique cell186/DH19 hit; and checks the independent p27 report for its prior cell186=`0J`=19 selection.
