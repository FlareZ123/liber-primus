# Agent38 precommit: p29/p50 double-root jet -> signed instruction indices

Date: 2026-11-19
Run: agent38-gpt5.6sol-20261119T015717Z-draw8-73bb85c8419d
Mode: independent fallback while all executable Director tasks are owned.

## Upstream facts frozen before this gate

Use only source objects and operations already independently established:

1. p28 reconstructs DH23 state
   `(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)` and `e=b^-1 mod(p-1)=3`.
2. p28 local THE self-locates at authenticated signed-message zero-based word index28; its immediate follower DIRECTION is index29 and selects project p29 under the same index convention.
3. Physical p39 red triad defines
   `G(X)=15(X-24)^2 mod29`.
4. In printed high-first coefficient order, selected p29 and the p50 numerical table reduced mod29 both have the repeated root24.
5. The already committed root24 Taylor code records, after removing the common two zero coefficients:
   `p29: [27,6,...]`, `p50: [26,6,...]`.

The relation below was noticed after those jet coefficients were already available in the repository, so this is a retrospective source-bridge test, not a blind discovery.

## Frozen packet consumer

For a page polynomial P and table polynomial T, at a shared double root r define the Taylor coefficients of `P(r+X)` and `T(r+X)` as:

```text
[0,0,qP,dP,...]
[0,0,qT,dT,...]
```

No normalization, scaling, fitted sign or key is allowed after this precommit.

Read the four integer indices:

```text
i0 = r
i1 = r + ((qP - qT) mod29)
i2 = qT
i3 = qP
```

A packet is a structural index packet only if `[i0,i1,i2,i3]` is an ordinary non-wrapping run of four consecutive zero-based integers.

For the currently observed high-first p29/table packet this predicts:

```text
r=24, qT=26, qP=27
delta=1
packet=[24,25,26,27]
```

The next two indices are not chosen from the packet. They are already independently fixed by the p28 self-location bridge as:

```text
28 = THE
29 = DIRECTION
```

Thus the combined six-index span is frozen as 24..29 before the family audit.

## Complete orientation/page charge

Charge:

- every one of the 55 unknown rune-bearing pages p0..p55;
- page coefficient order printed high-first or reversed low-first;
- table coefficient order printed high-first or reversed low-first;
- every r in GF29;
- require both the page and table to vanish at r with first derivative also zero;
- apply the exact packet formula above.

Record every shared-double-root event and every four-consecutive packet. No page, root, orientation or packet coordinate may be changed after seeing the signed words.

## Source-message test

Parse the authenticated 2016 natural-language body only, zero-based.

For every consecutive packet, read signed words `i0..i3`.
For the observed packet, append the independently selected indices28 and29 and report the exact six-word span.

Success criterion for a strong human-facing bridge:

- the selected p29/high-high event is unique or orientation-selective in the full charged family;
- its packet is exactly `24,25,26,27`;
- signed indices24..29 read a self-describing instruction whose final THE/DIRECTION pair is the already independent p28 selector.

A failure or comparable rival means preserve only the raw algebraic coincidence.

## State cross-check, secondary only

After the family result is fixed, record without using it as a selector whether the same jets equal the independently reconstructed p28 state:

```text
r=-g
qP=-K
qT=-e
dP=dT=a
```

This cross-check may strengthen coherence but must not be used to choose an orientation or page.
