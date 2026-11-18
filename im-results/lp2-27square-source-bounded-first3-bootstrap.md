# Source-bounded 27×27 bootstrap through COLD, with held-out continuation through IDEA

**Agents 28 and 29, 18 November 2026. Classification:** strong intermediate plaintext candidate, still below established-result status. This report narrows the external 27×27 route's opening from an English-selected path to a finite, source-driven bootstrap over the original p0-p2 artifact. A held-out continuation test now resolves the former block-5 tie in favor of `I MAY`, then uniquely extends it through `CRY NOW THE IDEA`, conditional on admitting the published endpoint-mirror/totient continuation family.

The recovered candidate is:

```
AS I GO THE WEATHER TURNS COLD I MAY CRY NOW THE IDEA
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

The original p0, p1, and p2 images also form a conspicuous visual unit: all three repeat the same paired black cross marginalia on left and right, while p2 closes the unit with the cicada illustration and the terminal red 13-dot mark. This visual continuity is independent support for treating the rubrication-selected 729-rune span as one designed section; it does not by itself specify the row-major reshape or transition rules.

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

## Independent p2 artwork discriminator for the block-5 axis

A concurrent original-JPEG census by Agent5 gives independent support for the same branch. Across all 75 scans, the cicada asset occurs only on LP1 p1, p9, p13, p15, p16 and LP2 p2. Its three visual states repeat exactly with the local-page Möbius value:

```
mu=+1  -> two vertical quarter-turn copies
mu= 0  -> one base horizontal left-facing copy
mu=-1  -> one horizontal mirror right-facing copy
```

The source sequence is `+1,0,-1,+1,0,-1`, providing two independent examples of every state. LP2 p2 therefore contributes a horizontal axis and `mu(2)=-1`. If the signed Möbius value is consumed as the ordinary coordinate sign, the p2 clue selects the **negative horizontal direction**, west, which is exactly the `I MAY` block-5 branch `(26,19)->(26,16)` rather than vertical `X EARTH`.

This is important corroboration because it is independent of the dictionary continuation gate below and materially supports Möbius μ as an intended Liber Primus object. The final consumer step, applying this p2 legend specifically at block5, remains conditional until an original instruction links the artwork to that transition.
## Block 5 prospective gate: tie, then held-out continuation discriminator

Freeze the four-block state and enumerate the natural `±4,±1` center family from COLD's endpoint, both horizontal and vertical radius-2 nodes, center totient plus the same Möbius rotation, four retained COLD landmarks as possible ciphertext starts, and all four cardinal read directions. This gives **128** candidates.

With a source-native frequency floor of 100, the maximum two-word depth is four runes and has exactly two serious branches under the same `NG-T-NG` key:

```
I | MAY
X | EARTH
```

Original source delimiters do not distinguish them, and the route's published row-parity and ray-offset predictors also accept both. The direct bootstrap therefore genuinely ties at block 5.

Agent29 then applied the **same frozen next-state family to both endpoints**, using the published block-6 construction as the upstream premise but widening every ray choice:

1. the previous ciphertext endpoint must be an outer cell of a unit-spaced three-cell mirror node;
2. transform the original center by Euler's totient and apply the established `mu(phi(k))` rotation;
3. move from the center by `phi(original center)` on any of the eight grid rays;
4. read from every in-bounds landing point on every grid ray;
5. rank only by the longest exact source-native English prefix with corpus frequency at least 100.

The word `CRY` and its length are not supplied.

For **I MAY**, the family has **40** candidates. Exactly one reaches depth three:

```
endpoint      (26,16) = E
mirror node   E-X-E
center        (25,16) = X
phi(X=14)     6 = G
aligned key   G-E-E
move          6 upward
start         (19,16)
read          upward
output        C-R-Y
```

For **X EARTH**, the same family has **24** candidates. No candidate reaches even a two-rune common word; the maximum depth is one. Thus the branch comparison is a clean held-out discriminator:

```
I MAY    -> unique CRY continuation
X EARTH  -> no two-rune continuation
```

Carry the selected CRY state forward once more without supplying the next plaintext. Reuse the CRY start `(19,16)` as the candidate mirror-node center, retain distance 6, displace the CRY endpoint `(17,16)` by six along every grid ray, enumerate mirror nodes through the center and all read directions, and permit at most two source-native words.

This family has **64** candidates. Exactly one reaches five runes:

```
node          OE-J-OE
derived key   OE-OE-I
move          6 upward from CRY endpoint
start         (11,16)
read          diagonal down-right
output        N-O-W-TH-E
reading       NOW THE
```

No competing candidate reaches the same depth.

Carry the selected `NOW THE` state forward once more. Freeze its five ciphertext cells, enumerate every previous-path cell as a possible symmetric-node center, every in-bounds mirror radius, the same center-totient/Möbius key derivation, and every read ray from the frozen endpoint. This creates **56** candidates. Exactly one reaches a three-rune common word:

```
center        (11,16) = TH
radius        3 diagonal steps
mirror node   A-TH-A
derived key   U-A-A
start         (15,20), the NOW THE endpoint
read          diagonal down-left
output        I-D-EA
reading       IDEA
```

Thus the candidate extends to:

```
AS I GO THE WEATHER TURNS COLD I MAY CRY NOW THE IDEA
```

The continuation evidence is stronger than choosing `I MAY` from grammar. Its caveat is upstream: the endpoint-mirror/totient/move family was learned from the published block-6/7 constructions rather than independently named by an original signed clue. The original p0 artwork's exact 180-degree pairing and the heading's repeated-rune symmetry make mirror operations source-plausible, but they do not uniquely specify this full transition rule.

Detailed branch audit and SFT: `im-results/lp2-p0-block5-branch-continuation-gate.md` and `sims/lp2_p0_block5_branch_continuation_gate_sft.cjs`. Latest continuation CI run **44389737681** completed successfully.
## What this changes

The earlier repository audit correctly showed that the published 38-block route had underselected transitions. This three-block bootstrap is a different piece of evidence.

It supplies a compact source-driven opening chain with three independent discriminators:

1. the opening branch is the unique four-word maximum among 126 widened source-driven candidates;
2. WEATHER begins at the exact matrix center and terminates when its next rune kills every dictionary continuation;
3. TURNS is the only cardinal direction from its fixed start that sustains a native word to five runes;
4. from the frozen TURNS state, COLD is selected by the unique maximum among 36 cardinal ±12 block-4 candidates.

The combined candidate is now:

```
AS I GO THE WEATHER TURNS COLD I MAY CRY NOW THE IDEA
```

The first four blocks are selected directly by the source-bounded bootstrap. The later `I MAY CRY NOW THE IDEA` extension is conditionally selected by a frozen continuation family applied symmetrically to competing branches.

This is substantially stronger than choosing one key/path because it looks English. It is still intermediate evidence because several transition operations were learned from the external route and have not yet been derived from an explicit original instruction. In particular, the horizontal endpoint-node construction, Möbius-based key rotation, and block-to-block geometric rules need prospective validation on later untouched blocks.

## Next decisive test

The former block-5 ambiguity is no longer the immediate blocker. A first attempt to widen the next connected-mirror topology after IDEA does **not** give a unique depth maximum: several two-rune words survive, with the published `OF` branch winning only by corpus frequency. Treat IDEA as the current held-out stopping boundary. The useful next decision is whether the endpoint-mirror/totient/movement family can itself be derived from original visible clues or can make another withheld transition prediction with a genuinely structural selector. Do not add plaintext-selected filters. If that family fails prospective continuation, preserve the source-bounded four-block bootstrap independently.
## Reproduction

Run:

```
node sims/lp2_p0_27square_source_bootstrap_first3_sft.cjs
```

The SFT reads the canonical p0-p2 source, the original delimiter transcription, and the source-native English lexicon. It does not import the external route arrays or expected plaintext strings as candidate selectors.

External route credited for the numerical node/transition ideas:
https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption
