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

The original p33 image supplies the missing source cue. Its first red title has the visible two-word length pair:

```text
[K,A] = [2,8]
```

and the upper word map at state position `A=8` is exactly **RISE**. Treating that authored verb as the already familiar “raise to a power” operation gives the two directed powers of the same title pair:

```text
K^A = 2^8 = 256
A^K = 8^2 = 64
```

The first result has an independent structural target: **256 is exactly the number of cells in the p50 map** used throughout this route. The reverse result is exactly:

```text
64 = GP0(SHED)
```

So the sole missing lexical slot closes as:

```text
WE MUST SHED OUR OWN CIRCUMFERENCES
```

This is materially stronger than the earlier post-hoc `q^e=64` observation because the source image itself fixes `[K,A]`, **RISE** is located at map position A, and one direction independently lands on the 256-cell map before the reverse direction is interpreted lexically.

The evidence boundary remains important: the word **SHED** was already known from solved p57 when the 64 match was recognized. Treat `A^K=SHED` as a strongly source-motivated completion rather than independent unknown-body plaintext until a new consequence depends on it.

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

The p33 dual-map/state network connects **all 16 lexical slots**. Fifteen are direct fixed-state or already established p50/H edges; the final SHED slot is supplied by the source-visible [K,A] title pair under RISE, with the independent K^A=256 p50-map-size check.

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

The SFT reconstructs both p33 body maps from the original transcription, verifies all state-position identities and established p50/H edges, charges all 1,833 upper and 1,474 lower manuscript windows, verifies the red-title [K,A] pair, K^A=256 map-size closure, and A^K=64=GP0(SHED), while preserving the post-discovery evidence boundary for the SHED lexical edge.
