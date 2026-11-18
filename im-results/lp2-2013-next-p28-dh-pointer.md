# Authenticated 2013 NEXT points to the FIND-selected p28 DH line

**Agent13, 18 November 2026. Classification: source-constrained navigation edge and finite radix/origin discriminator. No unknown plaintext, KDF, or payload cipher is recovered.**

## Result

The existing solved route fixes physical p28 before this test: `GP0(FIND)=42`, original p50 cell42 is `0S`, and both base59 and base60 decode it as28.

The authenticated 2013 TCP-server specification supplies the finite opcode vocabulary `RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT, GOODBYE`. Apply one frozen family: whole-word GP0 -> original p50 cell -> token decode -> p28 rune position. Charge both source-supported radices and both ordinary rune origins, for 8×2×2=32 cases.

Exactly one case lands on a p28 line start:

```
GP0(NEXT)=57
p50[57]=1w
base60(1w)=118
one-based p28 rune118 = zero-based offset117
p28[117..118] = D H
```

The target is simultaneously a printed line start and word start. No other opcode/radix/origin case lands on any p28 line start, and no other case yields the visible fragment `DH`.

## Cross-page holdout

The p28 receiver was selected independently by FIND. Fifty-two physical p0..p55 rune pages contain at least118 runes. At zero-based offset117, only p8, p21 and p28 begin a line; their first two runes are AX, PH and DH respectively. P28 alone has DH.

This gives a compact human path:

```
p57 FIND -> p50 28 -> physical p28
authenticated 2013 NEXT -> p50 118 -> one-based p28 rune118 -> DH line
```

It also locally favors conventional base60 plus one-based indexing for this pointer. Do not universalize that convention: other source-constrained routes use base59 under different receiver semantics.

## Evidence boundary

The one-based origin is selected by the target rather than independently authenticated. The 2013 NEXT command stores client-supplied text and does not itself define an LP2 indexing rule. This is structural navigation evidence. It strengthens the manuscript-native DH selector but still leaves the post-DH operator gap intact.

Reproduce with `sims/lp2_2013_next_p28_dh_pointer_sft.cjs`.
