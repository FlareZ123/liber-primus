# P23 THE ONE RISE visually selects the U(1) to O(3) rise, supplying +2 for p33

**Agent50, 19 November 2026. Classification: intended-route candidate from original visual structure plus independently recovered hidden text. The result supplies a source-visible +2 operation that lands on the held-out p35 FOUND receiver. It does not decrypt unknown body text.**

## Result

P23's red heading independently decodes:

```text
THE ONE RISE
```

The same original page contains a large red **U rune**:

```text
ᚢ = U = GP index 1
```

The five-dot stencil links p23 to solved p56 under an exact half-turn relation. Solved p56 contains a corresponding large red **O rune**:

```text
ᚩ = O = GP index 3
```

The hidden phrase therefore has a concrete visual reading:

```text
THE ONE = the visible U rune, whose GP index is 1
RISE    = compare it with the matched p56 rune O, index 3

3 - 1 = 2
```

P33 independently says:

```text
THEIR RISE
```

The pronoun now has a source-visible referent, the p23/p56 matched pair. Their highlighted rune rise is **+2**.

Applying that operation to the page carrying the instruction gives:

```text
p33 + 2 = p35
```

and authenticated signed word35 is:

```text
FOUND
```

The p35 target then supplies a held-out internal validation: its offsets25..29 are the manuscript's unique adjacent mutual p50-low GP0 pair `36 <-> 54`, matching the authenticated FOUND to ROAD/PATHS state and resolving to ROAD through the frozen source direction graph.

## Visual source evidence

Original archive p23 is `40.jpg`. Original solved p56 is `73.jpg`.

A simple red-pixel connected-component measurement on the native 2400×3600 files gives the large-rune bounding boxes:

```text
p23 U: x 601..830, y 1156..1652, width230, height497
p56 O: x 601..749, y  669..1165, width149, height497
```

Both large glyphs therefore begin at the same x-coordinate and have the same pixel height.

Their shapes are the standard runes already present in the repository alphabet:

```text
corpus.runes[1] = ᚢ, translit U
corpus.runes[3] = ᚩ, translit O
```

P23's enlarged `ᚢ` is also visually the same rune form as the first rune of its red heading. The classification does not depend on assigning an arbitrary numeral to an abstract drawing.

## Why ONE matters

Using rune primes would give a different numerical difference. The hidden text explicitly says **THE ONE**, and the visible U rune is index1 in the 29-rune GP ordering.

That wording selects the ordinal/index reading required for:

```text
U = 1
O = 3
rise = 2
```

This removes a major ambiguity that would exist if the two large red runes were compared without the hidden title.

## How the p56 relationship is selected

The p23/p56 comparison is independently motivated by original artwork.

The established stencil census found the same five-dot template on p7, p23, and solved p56. Relative to p7, p23 and p56 are opposite single-axis reflections, so p23 and p56 form the half-turn pair.

P23 and p56 additionally share the large red rune placement and the solved-p56 cardinal mechanism used to decode p23's title. P7 lacks the corresponding large red rune pair and does not produce an English instruction under the small odd-pair H family tested in this invocation.

Thus the U-to-O comparison is selected by multiple source-visible properties before the numerical difference is consumed.

## Two independent RISE measurements converge on +2

The +2 is also present inside p33 itself.

The p33 lower red pair that serializes to RISE has printed lengths:

```text
[3,5]
```

so its local numerical rise is:

```text
5 - 3 = 2
```

The visual p23/p56 pair independently gives:

```text
O - U = 3 - 1 = 2
```

Both source-visible readings therefore agree on the same operation before the p35 target is evaluated.

## Page-number closure supplies a second checksum

The physical page gap between the same p23/p56 pair is:

```text
56 - 23 = 33
```

which points back to p33, the page carrying `THEIR RISE`.

The pair therefore closes in two numerical spaces:

```text
page rise: 56 - 23 = 33 -> p33
rune rise:  O - U = 3 - 1 = 2 -> p33 + 2 = p35
```

The first identifies the instruction page. The second executes the instruction.

## Resulting human solve path

A compact intended route is now plausible:

```text
authenticated source:
"its words are the map, their meaning is the road,
 and their numbers are the direction"

ROAD is signed word23 -> inspect p23

p23 red heading -> THE ONE RISE
p23 five-dot stencil + large U pairs with solved p56 five-dot stencil + large O
THE ONE -> U has GP index1
U -> O rise = 3 - 1 = 2

same visual pair has page rise 56 - 23 = 33 -> inspect p33
p33 red headings -> THEIR RISE
their highlighted-rune rise = 2
p33 + 2 -> p35
signed word35 = FOUND

held-out p35 structure:
unique manuscript adjacent mutual p50-low cycle
36 <-> 54 = FOUND <-> ROAD/PATHS
source direction graph resolves 54 to ROAD
route returns toward p23
```

This is the first route in this branch where the operation, operand, destination, and success check all arise from source-visible material.

## Caveats

The large-rune identification is a direct visual reading of the original scans rather than a machine-classified annotation currently stored in the repository.

The p23/p56 five-dot relation is already independently measured to subpixel precision in `im-results/black-dot-template-reflections.md`.

The p35 receiver remains a navigation/state result. No unknown p35 plaintext has been recovered.

## Reproduction and supporting artifacts

- `im-results/lp2-p33-p35-found-road-map.md`
- `im-results/lp2-p23-p56-p33-their-rise-loop.md`
- `im-results/black-dot-template-reflections.md`
- `sims/black_dot_reflection.py`
- `sims/lp2_p33_p35_found_road_map_sft.cjs`
- original images `resources/liber-primus/40.jpg` and `resources/liber-primus/73.jpg`
