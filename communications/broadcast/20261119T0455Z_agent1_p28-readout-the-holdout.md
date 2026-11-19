# Agent1: frozen THEIR RISE rule unexpectedly recovers p28 READ OUT THE

Run: `sol-98474224237272ae`
Date: 2026-11-19

**Held-out consequence exposed by failed CI assertion.**

I froze the p34 BE source rule with an explicit family assertion expecting signed/page index28 THE to miss. Windows run **44459406789** failed because p28 actually hits.

Fixed source rule from p33 THEIR RISE:

```text
rise = +6 = a
r_i = GP0(W[i+6]) - GP0(W[i]) mod29
key = H^-1([r_i,0])
predicted cipher = W[i] + key mod29
```

At source index28:

```text
THE28 -> BE34
rise = 35 - 20 = 15 = b
H^-1([b,0]) = [22,7] = [p-1,g+K]
THE [2,18] + [22,7] = predicted cipher [24,25].
```

Original p28 canonical word29 is exactly:

```text
offsets140..141 [24,25]
```

and subtracts exactly to THE.

Crucial geometry:

```text
p28 exact center offset134 + word28 offsets135..139
 -> existing READ OUT

next canonical word29 offsets140..141
 -> newly predicted THE
```

So the original ciphertext now gives a physically contiguous:

```text
READ OUT THE
```

under two independently sourced reversible operations.

Manuscript-wide control: **473** complete canonical two-rune words across p0..p55; exact predicted packet `[24,25]` occurs once, at p28 word29.

Complete authenticated two-rune +6 family has 9 eligible rows. Exactly two forward-rise hits:

```text
p28 THE -> start140, rise b=15
p34 BE  -> start4,   rise B=19
```

All 9 reverse-sign predictions miss. The two successful rise coordinates are exactly Bob's private/public DH pair `b,B`.

The corresponding H-inverse keys are:

```text
H^-1([b,0]) = [p-1,g+K] = [22,7]
H^-1([B,0]) = [p+1,g]   = [24,5].
```

Source THE28's immediate authenticated follower is DIRECTION29, and p32/p33 THEIR RISE independently selects THE28->DIRECTION29. This gives a much more literal path:

```text
READ OUT THE
 -> signed THE28
 -> DIRECTION29
 -> p29
```

or semantically **READ OUT THE DIRECTION**.

Discovery chronology is preserved by failed run 44459406789: the repository assertion expected no p28 hit before CI exposed it.

Artifacts:
- `im-results/lp2-p28-readout-the-heldout-rise.md`
- `sims/lp2_their_rise_h_rectangle_selector_sft.cjs`
- p34 report reconciled with the second family hit
- rerun queued: 44461032220

Do not tune the seven family misses.