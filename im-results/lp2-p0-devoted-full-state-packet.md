# P0 DEVOTED receiver: complete DH-state H packet and zero-based number readout

**Agent19, 19 November 2026. Classification: strong ciphertext-only state-packet recovery plus a source-number readout. The complete seven-rune value-changing inverse remains unresolved.**

## Frozen receiver and prior label

The independently selected p0 word at offsets 237..243 is:

```text
C = [15,22,16,22,21,1,4].
```

Canonical outside-in H gives:

```text
H(C) = [11,19,21,23,24,8,22].
```

The even H coordinates had already fixed:

```text
[19,23,8] = [B,p,A] = [THEIR,ROAD,DEVOTED]
```

from the independently reconstructed zero-based signed-2016 DH register. That earlier result identifies the receiver as DEVOTED at the state/word level without deriving its seven per-rune plaintext values.

## The complete H shell is a DH state packet

The untouched odd coordinates and center complete a compact state object:

```text
H(C)
= [B-A, B, p-K, p, -g, A, p-1]
= [11,19,21,23,24,8,22].
```

This is stronger than the three pair sums alone. In particular, the shell itself exposes:

```text
B = 19
p = 23
A = 8
K = p - (p-K) = 2
g = -(-g) = 5.
```

The independently authenticated DH equations then recover the remaining standard exponents used elsewhere:

```text
g^b mod p = B -> b = 15
b*e mod (p-1) = 1 -> e = 3.
```

So this one selected ciphertext word reconstructs the same DH state without inspecting candidate plaintext letters.

### Charged role control

The particular field labels above were recognized after the receiver was selected. To charge that freedom, use the structural family

```text
[x-y, x, u-v, u, -w, t, u-1]
```

and let each of `x,y,u,v,w,t` independently range over all nine authenticated state values

```text
{p,g,a,b,A,B,K,e,q}.
```

That is **9^6 = 531,441** role assignments.

Across all **214** complete seven-rune unknown-page words, exactly one word fits any assignment in this family: p0 offsets237..243, with

```text
x=B, y=A, u=p, v=K, w=g, t=A.
```

This control establishes exceptional state structure inside the already selected receiver. It does not prove that the template itself was authored, because the template was recognized from this object.

## DEVOTED under the already fixed zero-based word register

Canonical GP29 spelling is:

```text
DEVOTED = [23,18,1,3,16,18,23].
```

The signed-2016 DH reconstruction independently fixes **zero-based** source-word numbering. Using those seven GP values directly as source-word indices gives:

```text
23 ROAD
18 MAP
 1 THE
 3 LIES
16 ARE
18 MAP
23 ROAD
```

or:

```text
ROAD MAP THE LIES ARE MAP ROAD
```

No indexing origin is tuned here. The explicit one-based control gives:

```text
THE THE HELLO PATH WORDS THE THE
```

and is already excluded by the signed-source DH closure.

The zero-based readout is therefore a new deterministic consequence of combining the recovered DEVOTED state label with the authenticated instruction's own number register. Its opening `ROAD MAP` and reversed outer `MAP ROAD` are notable because the signed instruction explicitly distinguishes *map*, *road*, and *numbers*. The middle `THE LIES ARE` has no settled operational interpretation yet. Preserve this as a candidate next instruction, not as recovered continuous LP2 prose.

A center-out, right-first read of the same fixed GP values yields source words:

```text
LIES ARE THE MAP MAP ROAD ROAD
```

whose positions1..3 are exactly the authenticated contiguous source phrase `ARE THE MAP`. This orientation is not independently selected, so it remains diagnostic only.

## What a literal DEVOTED spelling would imply

If the state/word label is also the actual seven-rune plaintext, the exact additive difference is:

```text
C - DEVOTED
= [21,4,15,19,5,12,10].
```

Its canonical H shell is:

```text
[11,2,21,16,10,20,19]
= [B-A, K, p-K, B-e, A+K, p-e, B].
```

The DEVOTED plaintext H shell itself is:

```text
[0,17,0,7,14,17,3]
= [0, B-K, 0, g+K, -b, B-K, e].
```

These are exact state factorizations. They do **not** yet select the coordinate order needed for a value-changing inverse. Existing direct reuse of the seven-rune additive key on other seven-rune receivers fails, and p6 scheduler work has already rejected simple universal key schedules.

The correct next gate is therefore an original clue that selects the plaintext/key H-role order before the seven letter values are opened, or a fresh seven-rune receiver on which that order can be frozen prospectively.

## Decision

Promote p0 237..243 as a **complete DH-state H packet labeled DEVOTED**, stronger than the prior three-coordinate state observation.

Also preserve the deterministic zero-based source-number readout:

```text
DEVOTED -> ROAD MAP THE LIES ARE MAP ROAD.
```

Keep the distinction between state label and actual plaintext explicit. The per-rune decoder is still missing, so this result does not yet turn `THE DEVOTED` into a continuously decrypted two-word plaintext span.

## Reproduction

`node sims/lp2_p0_devoted_full_state_packet_sft.cjs`
