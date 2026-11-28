# P8 fragment-length matrix encodes the DH state algebraically

**Agent20, 28 November 2026. Classification: new original-artifact state/layout closure, with two bounded direct-consumer negatives. No unknown plaintext or body key.**

## Decision

The already-known p8 geometry—**49 page-local black fragments** after the red heading—and the already-known p8–p14 chapter length of **1,729 runes** are not merely attractive 7-based counts. When read through the independently reconstructed DH23 state

```text
(p,g,a,b,A,B,K,e,q,F)
= (23,5,6,15,8,19,2,3,4,0),
```

they form a coupled algebraic state packet.

The strongest new result is the characteristic polynomial of the literal **7×7 p8 black-fragment length matrix**. It is exactly predicted by the state and factors entirely into state-derived coefficients:

```text
χ_M(x)
= x^7 + 6x^6 + 11x^5 + 10x^4 + 14x^3 + 10x^2 + 21x + 11

= x^7 + a x^6 + A^-1 x^5 + Kg x^4 - b x^3
    + Kg x^2 - A x + A^-1

= (x+g)
  (x^3 + g x^2 - q x + a)
  (x^3 - q x^2 + x + A^-1)            (mod 29).
```

Consequently

```text
trace(M) = -a = 23 = p
det(M)   = -A^-1 = 18 = p-g.
```

The matrix has exact multiplicative order

```text
ord(M) = 29^3 - 1 = 24,388
```

in `GL(7,29)`: direct exponentiation gives `M^24388=I`, while division of the exponent by each prime factor `2,7,13,67` breaks identity.

The two cubic factors have exact root orders **469=7×67** and **24,388=29³−1**, respectively; the second is a primitive cubic over GF(29).

This is substantially stronger than assigning familiar names to isolated residues. The complete degree-seven polynomial, its compact factorization, trace, determinant, and order all belong to one exact source matrix.

## Source path to the 7×7 matrix

P8's two red heading words reconstruct the DH state under the canonical outside-in H transform in the companion [p8 red-state circuit](lp2-p8-red-h-state-circuit.md).

The **page composition itself** then gives a source-native square instruction:

| p8 object | Exact count | DH-state expression |
|---|---:|---|
| red page-local fragments | **2** | **K** |
| red runes | **12** | **aK** |
| all page-local fragments | **51** | **e(b+K)** |
| all runes | **255** | **ge(b+K)** |
| black page-local fragments | **49** | **(g+K)^2 = 7^2** |
| black runes | **243** | **e^g = 3^5** |

Thus the red mean fragment length is exactly **a=6**, the whole-page mean fragment length is exactly **g=5**, and the black fragment count literally supplies the square **(g+K)^2**. The black-rune identity `243=e^g` was known before this report; the coupled fragment/rune count table and `49=(g+K)^2` link are new.

Across all rune-bearing p0–p55 pages, p8 is uniquely selected by each complete pair:

- `(red fragments, red runes)=(K,aK)=(2,12)`;
- `(all fragments, all runes)=(e(b+K),ge(b+K))=(51,255)`;
- `(black fragments, black runes)=((g+K)^2,e^g)=(49,243)`.

This gives a concrete human reason to take the 49 black fragment lengths as a **7×7 square**.

**Visual limitation:** original physical p8 ([archive 25.jpg](../resources/liber-primus/25.jpg)) does **not** draw those 49 fragments as a 7×7 grid. They are ordinary text beside the rooted-tree illustration. The square is inferred from the exact count `49=(g+K)^2`, the seven-page p8–p14 chapter, and the separately visible/state-derived seven cues; it is not a direct typographic grid.

The 49 page-local black fragments give this literal row-major length matrix:

```text
3  2  3  9  4  3  4
2  2  6  3  7  3  4
3  8  4  3  4  5  5
2  3  4  4  7  5 10
6 12  4  5  3  2  6
10 4  9  6  5  6  8
8  3  2  9  6  6  1
```

These are **page-local fragments**, not 49 complete words: the last one-rune p8 fragment is the beginning of a six-rune printed word that continues onto p9. The matrix preserves the physically visible p8 page-local segmentation established by the earlier seam audit.

### Row/column state checks

The raw row sums are

```text
[28,27,32,35,38,48,35]
```

and modulo29

```text
[28,27,3,6,9,19,6]
= [-1,-K,e,a,q+g,B,a].
```

The column sums reduce to

```text
[5,5,3,10,7,1,9]
= [g,g,e,Kg,g+K,1,q+g].
```

Canonical H7 then gives

```text
H7(rows)
= [22,8,23,6,12,17,5]
= [p-1,A,p,a,aK,b+K,g]

H7(columns)
= [25,4,25,10,10,6,14]
= [-q,q,-q,Kg,Kg,a,-b].
```

These checks are supporting evidence. The characteristic polynomial is the more discriminating algebraic closure.

## Adjacent p7→p8 operation: orbit-weighted fragment square

The preceding p7 page already supplied an independently frozen quartic from its five complete red-word products:

```text
P(x)=11+26x+8x^2+15x^3+2x^4.
```

The older p7 report established the source-motivated zero path

```text
0 -> 11 -> 23 -> 17 -> 18 -> 5
```

where exactly **five** iterations match the five marked red words. Thus the next seven states are not an arbitrary rotation of the cycle:

```text
v = [5,15,28,9,10,24,7]
  = [g,b,-1,q+g,Kg,-g,g+K].
```

Use that already-frozen seven-state vector as the column weights of the newly identified p8 7×7 fragment-length matrix. The result is

```text
M v
= [2,28,5,28,23,28,27]
= [K,-1,g,-1,p,-1,-K].
```

The repeated odd-position value and antisymmetric endpoints are visible **before** state naming: the output has the form

```text
[u,s,v,s,w,s,-u].
```

Across all **479** same-page 49-fragment windows, p8 is the **only** window whose p7-orbit-weighted rows have even this unlabeled shape. It is also the only window matching the exact state packet above.

A stricter orientation charge tests **all 14 cyclic/reversal presentations** of the same seven-cycle against all 479 windows: **6,706** source-window/orientation pairs. Exactly one pair has the unlabeled shape `[u,s,v,s,w,s,-u]`: **p8 black start, unreversed, zero rotation**, i.e. the source-fixed orbit orientation produced by the five-step p7 warmup. Thus neither a retrospective cycle rotation nor reversal is needed to manufacture the checksum.

The transpose gives a second exact cross-check:

```text
M^T v
= [10,6,1,3,28,16,18]
= [Kg,a,1,e,-1,K-b,p-g],
```

again unique across the same 479 windows.

This is the strongest new page-to-page operation in this report: p7 supplies an executable polynomial and a source-fixed seven-state orbit; p8 supplies a state-motivated square of literal source lengths; ordinary GF29 dot products produce a compact DH-state checksum.

### Source-selected seven-page dual fragment receiver

The weighted-row packet is more than a checksum. It has **two source-native index readings** that independently select 28-rune operands.

First, in ordinary signed state notation it is

```text
[K,-1,g,-1,p,-1,-K]
=
[2,-1,5,-1,23,-1,-2].
```

Because the packet was produced from **page-local fragment lengths**, apply those seven values as one signed GP0 **fragment index** on the seven physical pages p8–p14: nonnegative values count from the beginning, `-1` is the final fragment, and `-K=-2` is the penultimate fragment. No selected fragment contents or descriptors participate in constructing this schedule.

The frozen receiver selects:

| page | signed fragment index | selected length | selected SUM | selected PRODUCT |
|---|---:|---:|---:|---:|
| p8 | `K=2` | **3=e** | **23=p** | **2=K** |
| p9 | `-1` | **10=Kg** | **0=F** | **8=A** |
| p10 | `g=5` | **2=K** | **2=K** | **24=-g** |
| p11 | `-1` | **3=e** | **10=Kg** | **17=b+K** |
| p12 | `p=23` | **2=K** | **27=-K** | **17=b+K** |
| p13 | `-1` | **6=a** | **16=K-b** | **7=g+K** |
| p14 | `-K=-2` | **2=K** | **13=b-K** | **5=g** |

Thus the **held-out** descriptor rows are

```text
lengths  = [e,Kg,K,e,K,a,K]
sums     = [p,F,K,Kg,-K,K-b,b-K]
products = [K,A,-g,b+K,b+K,g+K,g].
```

The seven fragments concatenate to an exact **28-rune** source operand with

```text
(length, SUM, PRODUCT)
=
(28,4,16)
=
(-1,q,K-b) mod29.
```

Canonical H7 continues to close on the state:

```text
H7(lengths)  = [1,q,F,e,q,K-b,g]
H7(sums)     = [Kg,b-K,q,Kg,F,K-b,g+K]
H7(products) = [B^-1,1,g+K,b+K,aK,b,g+K].
```

This is a downstream object whose **contents were not inspected to choose it**. The schedule came entirely from the preceding p7 polynomial, the p8 fragment-length square, and their ordinary GF29 product.

Second, keep the exact GF29 residues without signed lifting:

```text
[2,28,5,28,23,28,27].
```

Use those directly as GP0 page-local fragment indices. This independently selects **28 runes** with held-out descriptor rows

```text
lengths  = [e,e,K,q+g,K,e,a]
sums     = [p,F,K,p-g,-K,b,b+K]
products = [K,-K,-g,F,b+K,q+g,-A],
```

and aggregate

```text
(length,SUM,PRODUCT)=(-1,b,F)=(28,15,0).
```

The signed and raw-GP0 operands are different but have equal length, so coordinate-wise combination is also fixed without reindexing:

```text
raw - signed: (length,SUM,PRODUCT)=(-1,A^-1,F)
raw + signed: (length,SUM,PRODUCT)=(-1,B,a).
```

This **dual receiver** is stronger than the earlier signed-only interpretation: the direct GP0 reading needs no residue-to-negative convention, while the signed reading follows the state expression `[K,-1,g,-1,p,-1,-K]`; both independently land on 28-rune state-bearing operands.

Neither 28-rune sequence is readable native-GP plaintext on inspection. Their current status is **source-derived key/operand material**, not a decryption.

### Immediate p15 boundary consumer

The next physical page supplies an exact boundary relation that was not used to build the operand. P15 has 20 red runes followed by 139 black runes. Its final red rune, at offset19, is

```text
21 = -A.
```

Taking that one boundary rune together with the entire black body gives

```text
140 runes
= g * 28
= 5 exact repeats of the new operand length.
```

That is a source-motivated p15 consumer, so freeze the simplest reversible use immediately: phase-zero repeating additive/subtractive application of each 28-rune branch to the exact `-A | black` slice. Both directions on both branches fail the pinned native-GP language gate. For the signed branch:

```text
raw receiver score: -1.32044
subtract operand:   -1.57149
add operand:        -1.53448
solved-native min:  +0.70997
```

The raw-GP0 branch is worse still (scores **−1.73073** and **−1.68045**). The signed subtract direction does turn the first boundary rune into `p`, but the complete 140-rune output becomes less language-like. A separately checked multiplicative/divisive use of the nonzero signed operand is also negative. Do not rescue this consumer with phase searches or transformed variants. Preserve the exact tiling as a structural continuation; ordinary repeating SUM/PRODUCT stream use is rejected.


### The p7 polynomial acting on the p8 matrix

The same adjacent-page objects also compose without selecting a vector. Evaluate the p7 polynomial directly on the p8 matrix:

```text
N = P(M).
```

Its characteristic polynomial is

```text
χ_N(x)
= (x-(g+K))
  (x^3 + Kx^2 - x + A^-1)
  (x^3 + Kg x^2 - (q+g)x + B)

= x^7 + 5x^6 + 13x^5 + 19x^4 + 27x^3
    + x^2 + 20x + 16.
```

Thus `det(N)=b-K=13`; both cubic factors are primitive over GF(29). No other 49-fragment source window has this transformed characteristic polynomial. That last absence means `P(M)` does not by itself identify a second fragment-window recipient; it is an algebraic page-to-page closure, not yet a decoder.

## Manuscript-wide finite charge

Freeze the source rule: on every same-page window of 49 consecutive page-local fragments, reshape literal fragment lengths row-major to 7×7 and compute its characteristic polynomial over GF29.

There are **479** such windows on p0–p55, excluding the rune-free p50 representation. Exactly **one** has

```text
χ(x)
= (x+g)
  (x^3 + g x^2 - q x + a)
  (x^3 - q x^2 + x + A^-1):
```

**p8, beginning at black local rune offset12.**

The same p8 window is also the sole window matching both state-predicted H7 row- and column-sum vectors.

This is a finite post-discovery discriminator, not a discovery-wide probability. The factorization was recognized after the p8 matrix was inspected, so it must not be reported as a blind 1/479 authorship probability.

## Seven physical page lengths serialize the same state in base29

The source-visible p8–p14 page rune counts are

```text
[255,268,263,273,261,272,137].
```

Writing each length as `29·quotient + remainder` gives

```text
quotients:
[8,9,9,9,9,9,4]
= [A,q+g,q+g,q+g,q+g,q+g,q]

remainders:
[23,7,2,12,0,11,21]
= [p,g+K,K,aK,F,A^-1,-A].
```

Canonical H7 gives

```text
H7(quotients)
= [4,0,0,9,18,18,12]
= [q,F,F,q+g,p-g,p-g,aK]

H7(remainders)
= [2,25,2,12,2,18,15]
= [K,-q,K,aK,K,p-g,b].
```

Across all **50** contiguous seven-page intervals p0–p55, p8–p14 is uniquely selected by the complete quotient/remainder packet, by the complete pair of H7 images, and by the total **1,729**.

The known chapter total also has the state-native factorization

```text
1729
= 7 * 13 * 19
= (g+K)(b-K)B.
```

The integer 1,729 and the factorization 7×13×19 were already documented in the older taxicab/Onion7 branch. The new evidence is the coupling to the independently reconstructed local state and the individual base29 page-length packet.

## Rooted-tree native-field root and a prospectively rejected local receiver

Issue #3409 asked whether p8's original rooted-tree artwork can type a matrix operation beyond the already fixed p7→p8 orientation. The smallest literal interpretation is **rooted tree → take a characteristic root**. This is unusually constrained in the native field: of the established factorization, only the linear factor has a root in GF(29),

```text
lambda = -g = 24.
```

The right eigenspace of the literal fragment matrix at 24 is one-dimensional. With its final coordinate normalized to one it is

```text
[18,9,9,8,28,0,1].
```

The original p8 image supplies a source-visible scale anchor at the same top/heading origin: its enlarged first red rune is GP0 **14**. On the 2400×3600 original JPEG its red component occupies x=602..884, y=667..1164 inclusive. Normalizing the right eigenvector's first coordinate to 14 therefore fixes

```text
[14,7,7,3,25,0,4]
= [-b,g+K,g+K,e,-q,F,q].
```

The left eigenspace, top/bottom anchoring, exact reversal and both additive signs were charged before any body decode. The exact pretarget contract is commit `8765e07d6b4ce2fce310aec9618ab5a6c5452f53`; no cyclic rotation, fitted phase, F exception or rescaling was allowed afterward.

A complete matched census sharpens the structural observation without turning it into an authorship probability. Among all **479** same-page 49-fragment windows, **24** have eigenvalue 24 and all 24 corresponding right eigenspaces are one-dimensional. Normalize each available first coordinate to 14. Only **one** resulting vector simultaneously has coordinate 2 = coordinate 3 and coordinate 6 = 0: **p8 black start, fragment 2 / rune offset 12**, exactly `[14,7,7,3,25,0,4]`. The same p8 window is the sole exact-vector hit. This is post-discovery specificity: the root/eigenvector rule was motivated after the p8 matrix factorization was already known.

The prospective cipher prediction fails decisively. Freeze the p8 black body (243 runes), phase-zero repetition, the four top/bottom × right/left anchored vectors and their reversals, then test both additive signs: all **16** exact reversible outputs score below the solved-native GP29 floor **+0.709965**. The source-selected primary right/top vector scores **−1.585376** and **−1.745856**; the best charged alternative is still only **−1.323336**. Thus the artwork supplies a compact root/eigenvector **state closure**, but the simplest local periodic use is rejected and must not be rescued by phase or transform tuning.

Reproducer: `sims/lp2_p8_tree_root_eigenvector_receiver_sft.cjs`. It independently reconstructs the eigenspaces, the 479-window census, exact forward replay, and all 16 frozen receiver scores.

## Direct cipher consumers: two bounded negatives

There is now also a source-complete **autonomous generator** trial, distinct from moving Hill blocks: seed M with the already fixed p7 seven-cycle `v`, advance the field state per rune or printed fragment, and sample GP29 key coordinate `K=2` from the actual first black-word product. The [12 original p8 and continuous p8–p14 additive inverses](lp2-p7-p8-sourcevector-matrix-stream-original-gate.md) all remain below solved-native IoC (best p8 **0.036425** vs native 243-rune minimum **0.054450**), despite the state running its exact **24,388**-step orbit. This eliminates the simplest p7→p8 source-seeded keystream consumer without altering the previously established algebraic source packet. Do not repeat this by fitting generator phase or output coordinate.

The matrix structure suggests an immediate stateful cipher that the earlier fixed-Hill7 exclusions do **not** cover: use successive powers of `M` on the chapter's **247 consecutive seven-rune blocks**.

Freeze the eight conventional variants only:

- column-vector or row-vector/transposed convention;
- `M^t` or `M^-t`;
- clock origin `t=0` or `t=1`.

Every model is exactly reversible. All eight original outputs remain ciphertext-like:

```text
native-GP score range:  -1.64223 .. -1.48481
IoC range:               0.03436 .. 0.03456
raw chapter score:      -1.57409
solved-native minimum:  +0.70997
```

No variant recovers coherent GP-native prose.

The cubic factorization gives a second new stateful consumer: use one cubic's ordered three nonleading coefficients as the initial state of the other cubic's recurrence, then add/subtract that LFSR stream. The primitive factor is tested cross-seeded by the 469-order factor and vice versa, on both the **243-rune p8 black body** and the **1,729-rune chapter**. All eight exact reversible tests remain ciphertext-like; the best score is **−1.47981**, still far below the solved-native minimum **+0.70997**. No phase, decimation, F-hold, or fitted seed is introduced.

A second literal consumer treats each page length itself as a per-page affine key. If

```text
length = 29a+b,
```

decode that page as

```text
P = a^-1(C-b) mod29.
```

For p8–p14 this deterministic inverse scores **−1.57381** with IoC **0.03463**, again far below the same solved-native register. Its exact forward map recovers every ciphertext rune.

These negatives retire the two most direct uses of the new state serialization. They do not invalidate the structural packet.

The repository's stronger [seven-row all-secret gate](lp2-p8-14-sevenrow-allsecret-gate.md) already excludes every **fixed** invertible affine Hill7 matrix in the two natural seven-channel layouts, so no additional fixed-matrix Hill search is warranted.

## Research implication

P8 now contains five mutually adjacent/contained representations of the same state:

1. the red H packet reconstructs the DH23 state;
2. the page composition itself closes as `K/aK`, `e(b+K)/ge(b+K)`, and `(g+K)^2/e^g`;
3. the immediately following first black word has `(length,sum,product)=[e,p,K]` and `H3=[A^-1,q+g,-b]`;
4. the 49 black page-local fragment lengths form a 7×7 matrix whose **entire characteristic polynomial factors in DH-state coefficients**;
5. the seven physical page lengths p8–p14 serialize the state in base29.

This materially changes the route ranking. The p7 orbit-weighted square supplies an actual adjacent-page operation, and its signed output selects a seven-page fragment receiver whose held-out lengths/SUMs/PRODUCTs close on the same state. The evidence points to deliberate **state/layout metadata, a p7→p8 state-transfer step, and a source-derived 28-rune operand** rather than a direct mono-layer Hill cipher.

The next decisive question is not which extra matrix phase improves language. It is what source-visible operation uses this state packet to select an **untouched receiver or external object**. A successor should predict that recipient or a key coordinate before inspecting its ciphertext outcome.

## Reproduction

Run:

```text
node sims/lp2_p8_fragment7_chapter_state_sft.cjs
```

The SFT reconstructs the state from original p15 material, rebuilds the p8 fragment-length matrix, proves the characteristic polynomial/factorization/order, scans all 479 49-fragment windows, verifies the seven-page base29 packet over all 50 intervals, and executes/reverses both direct consumer families.
