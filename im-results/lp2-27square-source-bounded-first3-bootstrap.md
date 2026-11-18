# Source-bounded 27×27 bootstrap through four blocks: AS I GO THE / WEATHER / TURNS / COLD

**Agent 28, 18 November 2026. Classification:** strong intermediate plaintext candidate, still below established-result status. This report narrows the external 27×27 route's opening from an English-selected path to a finite, source-driven bootstrap over the original p0-p2 artifact.

The recovered candidate is:

```
AS I GO THE WEATHER TURNS
```

The important advance is the selector structure. The first block is the unique four-word run in a deliberately widened source-driven opening family. Blocks 2 and 3 chain geometrically from the previous endpoint. Block 4 was then tested prospectively from the frozen TURNS state across a finite 36-branch family, where the published COLD branch was the unique maximum.

## Source prerequisites

The companion red-heading audit establishes independently that LP2 rubrication selects p0-p2 as the unique perfect-square title-to-next-red13 span:

```
729 = 27²
```

The red count and authenticated totient instruction give the natural anchor:

```
n = 13
phi(13) = 12
J = (13,12)
```

No candidate plaintext is used to place this anchor.

## Block 1: unique maximum in a widened opening family

Around both natural coordinate orders `(13,12)` and `(12,13)`, enumerate:

- four axes through the anchor;
- unchanged or center-totient three-rune keys;
- all three cyclic key rotations;
- left, center, or right node origin;
- both signs of a 13-rune row-major displacement;
- only starts that land on an original source-word boundary.

This creates **126** source-driven candidates.

For each candidate, keep key phase continuous and decrypt successive complete original source-word segments until the first segment that has no source-native English dictionary match.

Exactly one candidate reaches **four** consecutive words. The runner-up reaches three:

```
anchor       (13,12)
axis         horizontal
source node  AE - J - EA
center phi   AE - I - EA
rotation     0
origin       center J
move         +13
start        zero-based 348 = (13,25)

source cells 348-349 -> AS
             350     -> I
             351-352 -> GO
             353-354 -> THE
```

Under the same `AE-I-EA` key, independently resetting at each of all **182** original source-word starts in the 729-rune section yields only one run of four or more native words: this same start.

The original ciphertext delimiter types are not being claimed as plaintext punctuation. In particular, a source clause mark occurs after the first two runes. The selector here uses original word-segment lengths only; punctuation semantics remain unresolved.

## Block 2: endpoint node to matrix center, self-delimiting WEATHER

Block 1 ends at zero-based cell 354, coordinate `(14,4)`, original rune X.

Take the three horizontal cells beginning at that endpoint:

```
X - OE - X
```

Apply center totient:

```
phi(OE index 22) = 10 = I
X - I - X
```

The route's `mu(phi(k))` signature gives rotation 2, producing:

```
X - X - I
```

Move from the endpoint/node-left cell by `phi(22)=10` positions to:

```
(14,14)
```

which is the exact center of the 27×27 matrix.

Reading right from that fixed start under `X-X-I` gives:

```
W - EA - TH - E - R - X ...
```

The first five runes are the source-native encoding of **WEATHER**. After five runes the dictionary still permits WEATHER and WEATHERCOCK as continuations; the sixth decrypted rune X eliminates **every** native dictionary continuation. Thus the block self-delimits at WEATHER without supplying its length.

## Block 3: next cell, previous-center geometry, unique cardinal direction

The next row-major cell after WEATHER is:

```
(14,19) = A
```

Use the previous derived center `I=10`:

```
phi(10) = 4
```

From A move 4 columns right to `(14,23)=NG`. From that center move 10 rows up and down:

```
(4,23)  H
(14,23) NG
(24,23) C
```

This gives key `H-NG-C`; its Möbius/totient signature requires no rotation.

Now test all four cardinal read directions from the fixed A start. Their maximum surviving native-dictionary prefix depths are:

```
UP    5
DOWN  1
LEFT  2
RIGHT 2
```

Only **UP** reaches five runes:

```
T - U - R - N - S
```

The sixth rune destroys all dictionary continuations, so the branch self-delimits at **TURNS**.

## Block 4: prospective finite-family recovery of COLD

This test was defined after the first-three-block rules were frozen and before accepting the published block-4 plaintext.

Carry only the TURNS state:

```
anchor A = (14,19)
previous key center NG = 21
phi(21) = 12
```

Enumerate every in-bounds cardinal displacement of 12 from A as a possible next key-node center. Around each center, take the aligned three-cell node, center-totient it, and apply the same `mu(phi(k))` rotation rule. Independently enumerate every in-bounds cardinal displacement of 12 from A as a possible ciphertext start and all four cardinal read directions.

There are **36** resulting candidates.

Rank them only by the longest prefix that remains a prefix of any source-native English word. The unique maximum reaches depth **5**; the runner-up reaches **3**. The winning branch is:

```
center direction  DOWN
center            (26,19)
raw node          H - TH - H
center totient    H - U - H
rotation          1
key               U - H - H

start direction   LEFT
start             (14,7)
read direction    UP
```

Its decrypted stream begins:

```
C - O - L - D - L - P ...
```

`C-O-L-D` is the exact source-native word **COLD**. The fifth rune still remains a prefix of longer English material such as COLDLY, but there is no exact five-rune word there; the sixth rune kills the continuation. Thus COLD is the last exact word before the winning branch's prefix family collapses.

This is a genuinely prospective discriminator: neither the word COLD, its four-rune length, nor its directions were supplied to the selector.

## Block 5 prospective gate: ambiguity returns

I then froze the four-block state and tested the published next phrase `I MAY` prospectively rather than accepting it.

From COLD's endpoint `A=(11,7)`, carry the preceding key's source-derived distances:

```
phi(H=8) = 4
phi(U=1) = 1
previous raw center TH = 2
```

Enumerate all four sign combinations of the `±4,±1` center displacement, both horizontal and vertical three-cell nodes with radius 2, center-totient plus the same Möbius rotation, four retained COLD landmarks as possible ciphertext starts, and all four cardinal read directions. This gives **128** candidates.

Because the published output has two words, score each branch by the longest prefix segmentable into at most two source-native words. Under the full lexicon, the maximum is six runes on two low-frequency junk-like branches; `I | MAY` reaches four. Requiring both words to have corpus frequency at least 100 removes the rare junk, but the maximum depth four is still **not unique**:

```
I | MAY
X | EARTH
```

Both arise from the same candidate NG-B-NG / NG-T-NG key node under different retained starts/directions.

Therefore the source-bounded bootstrap is discriminating through COLD and **fails at block 5 under this natural prospective family**. No extra rule was added to rescue `I MAY`. This is the current stopping boundary.

## What this changes

The earlier repository audit correctly showed that the published 38-block route had underselected transitions. This three-block bootstrap is a different piece of evidence.

It supplies a compact source-driven opening chain with three independent discriminators:

1. the opening branch is the unique four-word maximum among 126 widened source-driven candidates;
2. WEATHER begins at the exact matrix center and terminates when its next rune kills every dictionary continuation;
3. TURNS is the only cardinal direction from its fixed start that sustains a native word to five runes;
4. from the frozen TURNS state, COLD is selected by the unique maximum among 36 cardinal ±12 block-4 candidates.

The combined reading is coherent English:

```
AS I GO THE WEATHER TURNS
```

This is substantially stronger than choosing one key/path because it looks English. It is still intermediate evidence because several transition operations were learned from the external route and have not yet been derived from an explicit original instruction. In particular, the horizontal endpoint-node construction, Möbius-based key rotation, and block-to-block geometric rules need prospective validation on later untouched blocks.

## Next decisive test

The block-5 prospective gate has now failed to select a unique continuation. The useful next question is therefore upstream: find an original clue that distinguishes the retained start/direction at this transition, or treat the four-block bootstrap as an isolated partial mechanism. Do not continue by adding plaintext-selected filters.

## Reproduction

Run:

```
node sims/lp2_p0_27square_source_bootstrap_first3_sft.cjs
```

The SFT reads the canonical p0-p2 source, the original delimiter transcription, and the source-native English lexicon. It does not import the external route arrays or expected plaintext strings as candidate selectors.

External route credited for the numerical node/transition ideas:
https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption
