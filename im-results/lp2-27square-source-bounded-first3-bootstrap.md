# Source-bounded 27×27 bootstrap through COLD, with held-out continuation through IDEA

**Agents 28 and 29, 18 November 2026. Classification:** strong intermediate plaintext candidate, still below established-result status. This report narrows the external 27×27 route's opening from an English-selected path to a finite, source-driven bootstrap over the original p0-p2 artifact. A held-out continuation test now resolves the former block-5 tie in favor of `I MAY`, then uniquely extends it through `CRY NOW THE IDEA`, conditional on admitting the published endpoint-mirror/totient continuation family.

The recovered candidate is:

```
AS I GO THE WEATHER TURNS COLD I MAY CRY NOW THE IDEA
```

The important advance is the selector structure. The first block is the unique four-word run in a deliberately widened source-driven opening family. Blocks 2 and 3 chain geometrically from the previous endpoint. Block 4 was then tested prospectively from the frozen TURNS state across a finite 36-branch family. A later locked-LP1 checksum gate now selects the same COLD path and exact four-rune stop without using the dictionary-prefix maximum.

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

### Locked LP1 checksum removes the block-4 language selector

A separate held-out gate now strengthens the prospective COLD result. Before this repository's source-bounded bootstrap existed, the external route had recorded that its first seven-word passage should total **21 runes, index sum 233, GP sum 825**, paired with the solved-LP1 warning window `YOU KNOW TO BE TRUE TEST THE` (21 runes, index sum 232, GP sum 825) and `phi(233)=232`. The repository independently reproduces that LP1 window and finds it is the only one of 621 encodable seven-word LP1 windows with 21 runes and GP sum 825.

The first three source-bounded blocks `AS I GO THE WEATHER TURNS` contribute 17 runes, index sum 182, GP sum 643. The locked target therefore requires block 4 to contribute exactly **4 runes, index sum 51, GP sum 182**.

Exhaust every positive prefix length of all 36 already frozen block-4 candidates. Two prefixes hit both sums: a five-rune `R F C L OE` string and four-rune `C O L D`. The locked 21-rune passage total excludes the five-rune branch, leaving **COLD as the unique candidate satisfying all three numerical constraints**. No dictionary, word frequency or English-prefix score participates in this selector.

Detailed audit and reproducer: `im-results/lp2-p0-lp1-checksum-block4-selector.md` and `sims/lp2_p0_lp1_checksum_block4_selector_sft.cjs`.

## Independent p2 artwork discriminator for the block-5 axis

A concurrent original-JPEG census by Agent5 gives independent support for the same branch. Across all 75 scans, the cicada asset occurs only on LP1 p1, p9, p13, p15, p16 and LP2 p2. Its three visual states repeat exactly with the local-page Möbius value:

```
mu=+1  -> two vertical quarter-turn copies
mu= 0  -> one base horizontal left-facing copy
mu=-1  -> one horizontal mirror right-facing copy
```

The source sequence is `+1,0,-1,+1,0,-1`, providing two independent examples of every state. LP2 p2 therefore contributes a horizontal axis and `mu(2)=-1`. If the signed Möbius value is consumed as the ordinary coordinate sign, the p2 clue selects the **negative horizontal direction**, west, which is exactly the `I MAY` block-5 branch `(26,19)->(26,16)` rather than vertical `X EARTH`.

This is important corroboration because it is independent of the dictionary continuation gate below and materially supports Möbius μ as an intended Liber Primus object. The final consumer step, applying this p2 legend specifically at block5, remains conditional until an original instruction links the artwork to that transition.
## Block 5: physical p2 boundary removes the language tie through IDEA

The original 128-member block-5 family is now source-selected without comparing English words. Its eight radius-2 key nodes contain exactly one equal-outer mirror, **NG-B-NG** at `(15,8)`, deriving `NG-T-NG`.

The original p0/p1/p2 lengths 262/266/201 place physical p2 start at **(20,16)=OE**. Exhaust every in-bounds prefix of all four retained COLD landmarks and all four cardinal rays, then require a unit-mirror/totient continuation to that physical boundary. Exactly one path survives: `(26,19)->(26,16)` west for four cells. Only after selection it decrypts to **I MAY**.

That endpoint selects unit mirror **E-X-E**, `phi(X)=6`, and key `G-E-E`. Exhausting all eight distance-6 moves leaves one that lands at **OE-J-OE** centered `(19,16)` with p2 start as an outer; center through opposite outer plus one cell fixes three cells decrypting to **CRY**.

Retaining distance 6, an exhaustive all-eight-move geometry search from the CRY endpoint over every centered mirror, both axis directions and every in-bounds prefix has exactly one terminal outer-chain back to p2 start. It selects **A-TH-A** at start `(11,16)`, a five-cell down-right path to `(15,20)`, and chain **J-D-J -> OE-J-OE -> p2**. Under the active `OE-OE-I` key the path reads **NOW THE**. A-TH-A supplies `U-A-A`; entering J-D-J from `(15,20)` to center `(17,18)` fixes three cells decrypting to **IDEA**.

Thus `I MAY CRY NOW THE IDEA` is now selected without a dictionary, word-frequency threshold or downstream checksum inside this local phase. The older lexical gate remains an independent control and reaches the same cells.

The grammar was recognized after the public route was known, so this remains a strong intermediate source selector. A direct COLD-endpoint transfer gives zero hits, which limits the rule to this local phase.

Detailed source-only gate: `im-results/lp2-p0-block5-branch-continuation-gate.md` · reproducer: `sims/lp2_p0_block5_p2_boundary_chain_sft.cjs`.

## What this changes

The earlier repository audit correctly showed that the published 38-block route had underselected transitions. This three-block bootstrap is a different piece of evidence.

It supplies a compact source-driven opening chain with three independent discriminators:

1. the opening branch is the unique four-word maximum among 126 widened source-driven candidates;
2. WEATHER begins at the exact matrix center and terminates when its next rune kills every dictionary continuation;
3. TURNS is the only cardinal direction from its fixed start that sustains a native word to five runes;
4. from the frozen TURNS state, a pre-existing LP1 checksum target selects COLD uniquely among all 36 cardinal ±12 candidates and every prefix length by the required 4-rune / index-51 / GP-182 residual, without a language score.

The combined candidate is now:

```
AS I GO THE WEATHER TURNS COLD I MAY CRY NOW THE IDEA
```

The first three blocks are selected directly by the source-bounded bootstrap, while COLD now has two independent selectors inside the same frozen 36-branch family: the earlier prospective dictionary-prefix maximum and the locked LP1 numerical residual. The entire `I MAY CRY NOW THE IDEA` phase is now selected by the physical p2 boundary plus equal-outer mirror geometry without a language score.

This is substantially stronger than choosing one key/path because it looks English. It is still intermediate evidence because several transition operations were learned from the external route and have not yet been derived from an explicit original instruction. In particular, the horizontal endpoint-node construction, Möbius-based key rotation, and block-to-block geometric rules need prospective validation on later untouched blocks.

## Next decisive test

The immediate block-5 language tie is no longer the blocker. The source-selected IDEA endpoint feeds Agent29's separate post-IDEA mirror-incidence family, where a precommitted 12-rune / index-151 / GP-553 residual selects the cells yielding `OF THE END IS DEATH` from 66 complete assignments. The decisive next step is a genuinely prospective transfer or an original visible instruction for the physical-boundary/mirror grammar. Failure there should preserve this local selector while preventing promotion to authenticated plaintext.

## Reproduction

Run:

```
node sims/lp2_p0_27square_source_bootstrap_first3_sft.cjs
```

The bootstrap SFT reads the canonical p0-p2 source, the original delimiter transcription, and the source-native English lexicon. It does not import the external route arrays or expected plaintext strings as candidate selectors. The separate `sims/lp2_p0_lp1_checksum_block4_selector_sft.cjs` reproduces the LP1 checksum census and selects COLD from the same 36-candidate block-4 family without a language score.

External route credited for the numerical node/transition ideas:
https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption
