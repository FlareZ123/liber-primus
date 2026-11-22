# ROAD23 is reached by a conditional RISE / READ OUT / DIRECTION composition

**Agent6, 19 November 2026; Critic reconciliation. Classification: conditional integration of navigation candidates plus an exact state identity. The p23→p25 RISE handoff is source-constrained navigation; the p25→p28 edge depends on unselected GP0→p50 addressing and the low-digit transition rejected as a general opcode by #1787. This is not an established source-selected cycle or unknown-body plaintext.**

The corrected cross-page parser removes the former p32 modulo22 wrap. The SEEK/AND center identity still returns to ROAD23 arithmetically, but the full route through p25 and p28 remains conditional on the p50 pointer edges below.

The proposed composition is:

```text
ROAD23 / project p23
 -> THE ONE RISE
 -> one fixed RISE = +2
 -> p25

p25
 -> unique [K,g] cube-side correspondence
 -> g fixes cut5
 -> candidate p50 low-digit route
 -> p28 READ OUT candidate

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

Under those conditional edges, the arithmetic composition returns:

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

P23's red heading yields **THE ONE RISE**. The same exact RISE object occurs on p23, p33 and p40 and already has the fixed literal displacement `5-3=2`. One application on p23 gives p25. The separate GOOD LUCK→p25 mapping is only a candidate: it uses the unresolved GP0→p50 address grammar (#1903), and the frozen p25 first-word receiver in #1897 misses.

See `im-results/lp2-p23-one-rise-plus2-p25-convergence.md`.

### p25 -> p28

Under the candidate whole-phrase rule, GOOD LUCK has GP0=66 and `p50[66]=0P` gives25, but the GP0→p50 address grammar is not source-selected (#1903). The p25 side object is the unique outer `[K,g]` hit and `g=5` fixes its cut; the continuation `40→20→42→28` uses the candidate low-digit transition, whose generalization failed #1787. The p28 READ OUT object is a separate local plaintext candidate, not proof of this incoming route.

See `im-results/lp2-2013-goodluck-p25-cube-route.md`.

### p28 -> DIRECTION

The held-out THEIR RISE family gives a candidate **THE** immediately after the p28 READ OUT candidate. The following four complete p28 words have a reproducible H-difference correspondence to the authenticated phrase **THEIR NUMBERS ARE THE**, followed by **DIRECTION**. This is a strong structural readout, not independent proof that the preceding low-digit route is selected.

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

If the candidate upstream p50 edges are valid, the SEEK/AND state transition returns to ROAD23 **before** a direct YOU receiver is needed. This is a conditional route consequence, not a reason to treat the full cycle as established.

This does not prove that YOU is a deliberate sentinel. It does mean any proposal that requires a p32 modulo22 receiver must compete against a fully specified pre-YOU return route.

## P23 is now a fork, not a dead end

P23 has two source-visible output candidates, but their downstream navigation paths have different unresolved dependencies:

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

The first branch has a source-constrained p23→p25 handoff but a conditional continuation through the low-digit map. The second has a post-discovery AL=31/state handoff and also uses candidate p50 transitions. P23 may be an operation-sensitive checkpoint, but the current graph does not establish a repeatable source-selected program.

The next high-value test should target the **first receiver after the p33 branch that is not already part of this loop**, using the established state and source order. Re-entering p32 by an invented wrap or opening a broad cipher search is lower value.

## Reproduction

Run:

```text
node sims/lp2_road_rise_readout_direction_cycle_sft.cjs
```

The meta-regression executes five upstream SFTs and checks their arithmetic outputs, source corridor, route coordinates and the exact state identity `q+B=p`. Windows/Node 22 run **44467734125** passes that composition; it does not authenticate the GP0→p50 address grammar or the low-digit transition.
