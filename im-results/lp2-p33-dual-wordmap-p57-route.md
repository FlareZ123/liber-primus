# P33 dual word maps reconstruct 15/16 slots of the solved p57 terminal instruction

**Agent10, 19 November 2026. Classification: strong source-connected map/navigation result. The reconstruction uses fixed DH-state positions and already established p50/H edges. One lexical slot, SHED, remains without an independently selected edge.**

## Why p33 has two maps

The p33 layout independently fixes:

```text
upper black body: 21 words = p-K = B+K
lower black body: 28 words = p+g
upper rune count: 81 = e^q
lower rune count: 115 = p*g
```

The risen-THEIR route independently recovers **WORDS ARE THE MAP** and `[e,q]=[3,4]`. Treat the two already bounded black bodies as the two word maps and use canonical GP0 word sums as their numbers.

## Upper 21-word map

At fixed state-derived one-based positions:

```text
e = 3                 -> GP0 94  = TUNNELNG
a = 6                 -> GP0 86  = ORIGINAL
H(e,q)[1] = 7         -> GP0 20  = THE
A = 8                 -> GP0 47  = RISE
e² = 9                -> GP0 105 = DIUINITY
A+K = 10              -> GP0 38  = WITHIN
b+K = 17              -> GP0 19  = TO / OWN
```

Several of these nodes have independent, pre-existing consumers:

```text
THE(20)       --p50 low digit--> 42 = FIND
ORIGINAL(86)  --p50 low digit--> 51 = MUST
TUNNELNG(94)  --p50 base60----> 56 = AND
WITHIN(38)    --p50 base59----> 131 = CIRCUMFERENCES
```

The TUNNELNG→AND and WITHIN→CIRCUMFERENCES edges were already established in the p57/p50 word graph; THE→FIND and ORIGINAL→MUST were established independently by the p28/p23 low-digit route.

### Whole-manuscript upper-map control

Charge the exact five direct lexical positions:

```text
position3  = TUNNELNG
position7  = THE
position9  = DIUINITY
position10 = WITHIN
position17 = TO/OWN
```

Across **1,833** 21-word windows on unknown p0–p55, exactly one passes: the p33 upper black body.

## Lower 28-word map

The lower body has 28 words, matching `H(e,q)[0]=28` as well as `p+g`.

Three state-derived positions are:

```text
g = 5       -> GP0 67 = SURFACE
p-e = 20    -> GP0 42 = FIND
p+K = 25    -> GP0 83 = EMERGE
```

The `p-e` FIND hit is corroborative because FIND was already independently recovered from the upper THE node by the fixed low-digit operation.

### Whole-manuscript lower-map control

Charge those three positions over every 28-word manuscript window. There are **1,474** candidates.

Exactly one passes: the p33 lower black body.

## Recovered p57 instruction skeleton

The two maps plus established edges reconstruct the solved p57 terminal sentence almost completely.

### Clause 1

```text
upper[e=3]          = TUNNELNG
upper[b+K=17]       = TO / OWN  -> TO in this clause
upper[H(e,q)[1]=7]  = THE
lower[g=5]          = SURFACE
```

giving:

```text
TUNNELNG TO THE SURFACE
```

### Middle clause

The visible p33 H chain independently gives:

```text
H(B,p) = H(19,23) = [25,13]
25 = GP0(WE)
```

Other independently connected nodes give:

```text
upper[a=6] = ORIGINAL -> p50 low digit -> MUST
A = 8 = GP0(OUR)
B = 19 = GP0(OWN) = GP0(TO)
upper[A+K=10] = WITHIN -> p50 base59 -> CIRCUMFERENCES
```

So the established graph supplies:

```text
WE MUST [SHED unresolved] OUR OWN CIRCUMFERENCES
```

Only **SHED** lacks an independently selected map edge.

There is an exact numerical candidate:

```text
q^e = 4^3 = 64 = GP0(SHED)
```

and the map has already selected **RISE**, while the opposite power `e^q=3^4=81` is the upper-body rune count. This is a natural completion hypothesis, but it was recognized with the known p57 plaintext in hand and therefore remains provisional until another source clue chooses `q^e`.

### Final clause

```text
upper THE -> p50 low digit -> FIND
upper[H(e,q)[1]=7] = THE
upper[e²=9]        = DIUINITY
upper[A+K=10]      = WITHIN
upper TUNNELNG -> p50 base60 -> AND
lower[p+K=25]      = EMERGE
```

giving exactly:

```text
FIND THE DIUINITY WITHIN AND EMERGE
```

## Coverage and interpretation

The solved p57 sentence segment is:

```text
TUNNELNG TO THE SURFACE
WE MUST SHED OUR OWN CIRCUMFERENCES
FIND THE DIUINITY WITHIN AND EMERGE
```

The p33 dual-map/state network independently connects **15 of its 16 lexical slots**. The sole unresolved slot is SHED.

This is much more constrained than noticing individual GP0 coincidences. The upper and lower positional tuples are each unique manuscript-wide, the connecting p50/H operations were already authenticated elsewhere, and the reconstructed text is an already solved Cicada source instruction rather than language-model prose.

The strongest current interpretation is that p33 is a **word-map/navigation page** whose state-numbered nodes reproduce the terminal instruction set and direct the solver into p55/p57 mechanics. It does not imply that every p33 ciphertext rune is plaintext under a simple substitution.

## Relationship to the p55 route

The map node **RISE** yields p50 token `1G` = 75/76 under base59/base60, uniquely selecting p55's local/physical rune counts. The recovered instruction **FIND THE DIUINITY WITHIN** then lands on the unique p55 DH-state interior geometry documented in:

```text
im-results/lp2-p33-p55-divinity-state-geometry.md
```

## Reproduction

```text
node sims/lp2_p33_dual_wordmap_p57_route_sft.cjs
```

The SFT reconstructs both p33 body maps from the original transcription, verifies all state-position identities and established p50/H edges, charges all 1,833 upper and 1,474 lower manuscript windows, and keeps SHED explicitly provisional.
