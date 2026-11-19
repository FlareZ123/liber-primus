# ROAD23 closes a source-selected RISE / READ OUT / DIRECTION cycle before YOU

**Agent6, 19 November 2026. Classification: integration of independently reproduced navigation mechanisms plus one new state closure. This is route structure, not unknown-body plaintext.**

The corrected cross-page parser changes the numbered route in a useful way. It removes the former p32 modulo22 wrap while leaving a fully executable branch that returns to **ROAD23 before the source reaches YOU33**.

The closed route is:

```text
ROAD23 / project p23
 -> THE ONE RISE
 -> one fixed RISE = +2
 -> p25

p25
 -> independently selected [K,g] cube object
 -> g fixes cut5
 -> unchanged p50 low-digit route
 -> p28 READ OUT

p28
 -> held-out adjacent THE
 -> source-constrained four-word readout THEIR NUMBERS ARE THE
 -> contiguous authenticated next word DIRECTION

DIRECTION29 / ordinal30
 -> numbered p29 word30 state packet

SEEK30 / ordinal31
 -> numbered p30 word31
 -> THE EMPTY THE

AND31 / ordinal32
 -> numbered p31 word32
 -> THE ROAD THE

center transition EMPTY4 -> ROAD23
 -> project p23
```

So the branch closes:

```text
p23 -> p25 -> p28 -> DIRECTION -> SEEK -> AND -> ROAD23.
```

No p32 word wrap is used.

## The new state identity is q + B = p

The corrected SEEK and AND objects are:

```text
SEEK31  [28,4,12]  -> THE EMPTY THE
AND32   [12,23,1]  -> THE ROAD THE
```

Their lexical wrapper is invariant and only the center changes.

The authenticated state already fixes:

```text
q = EMPTY = 4
B = first THEIR position = 19
p = ROAD = 23.
```

Therefore the center change is exactly:

```text
q + B = p  (mod29)
4 + 19 = 23.
```

This does not add a fitted key. The corrected numbered-route family had already selected SEEK/AND as the sole consecutive three-rune pair whose zero-based lexicalized outer words stay equal while the center changes. The state identity describes that already selected change.

The relation is operationally useful: the AND object produces ROAD as a state destination, and ROAD's authenticated zero-based position is exactly project p23, the checkpoint that supplies THE ONE RISE and THE ORIGINAL.

## Independent edges

Every nontrivial edge predates this composition.

### p23 -> p25

P23's red heading yields **THE ONE RISE**. The same exact RISE object occurs on p23, p33 and p40 and already has the fixed literal displacement `5-3=2`. One application on p23 gives p25. P25 had independently been selected by authenticated GOOD LUCK.

See `im-results/lp2-p23-one-rise-plus2-p25-convergence.md`.

### p25 -> p28

Authenticated GOOD LUCK gives `GP0=66`, and `p50[66]` selects p25. The selected p25 side object is the manuscript-unique outer `[K,g]` hit; `g=5` fixes the previously ambiguous cube cut. The unchanged pointer chain reaches p28, whose independently selected cube receiver emits **READ OUT**.

See `im-results/lp2-2013-goodluck-p25-cube-route.md`.

### p28 -> DIRECTION

The held-out THEIR RISE family recovers exact **THE** immediately after READ OUT. The following four complete p28 words then give a target-free H-difference readout of the contiguous authenticated phrase **THEIR NUMBERS ARE THE**. The next authenticated source word is **DIRECTION**.

See:
- `im-results/lp2-p28-readout-the-heldout-rise.md`
- `im-results/lp2-p28-numbers-direction-readout.md`

### DIRECTION -> SEEK/AND -> ROAD23

DIRECTION's numbered object is unchanged by the canonical parser and recovers the state packet `[p-1,F,b,A]`. The next two authenticated source ordinals select the corrected SEEK and AND objects. Their unique fixed-family lexical transition is:

```text
THE EMPTY THE
THE ROAD  THE
```

The center change returns the route to ROAD23 through `q+B=p`.

See `im-results/lp2-direction-seek-you-numbered-route.md`.

## Why this changes the YOU question

The authenticated source continues:

```text
... DIRECTION SEEK AND YOU WILL BE FOUND ...
```

The direct numbered coordinate for YOU remains uniquely absent because project p32 has only 21 complete canonical words. Earlier work tried to rescue YOU with a modulo22 word wrap. The corrected corpus rejects that wrap.

This cycle supplies a simpler consequence: the SEEK/AND state transition returns to ROAD23 **before** a direct YOU receiver is needed. The absence of YOU therefore no longer creates a blocker for this branch.

This does not prove that YOU is a deliberate sentinel. It does mean any proposal that requires a p32 modulo22 receiver must compete against a fully specified pre-YOU return route.

## P23 is now a fork, not a dead end

P23 has two independently charged source-visible outputs:

```text
THE ONE RISE
 -> +2
 -> p25
 -> p28
 -> DIRECTION / SEEK AND
 -> ROAD23
 -> loop

THE ORIGINAL
 -> authenticated [K,a,e,g,q] state
 -> B=19
 -> existing p50 handoff
 -> p33
 -> THEIR RISE
```

The first branch is the newly consolidated closed loop. The second is the existing p23->p33 state handoff. This makes p23 a plausible program checkpoint with a repeatable route and a distinct onward branch.

The next high-value test should target the **first receiver after the p33 branch that is not already part of this loop**, using the established state and source order. Re-entering p32 by an invented wrap or opening a broad cipher search is lower value.

## Reproduction

Run:

```text
node sims/lp2_road_rise_readout_direction_cycle_sft.cjs
```

The meta-regression executes all five upstream SFTs and then checks the authenticated source corridor, route coordinates and the exact state identity `q+B=p`.
