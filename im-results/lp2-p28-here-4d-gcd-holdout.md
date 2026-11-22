# P28 prospective HERE -> 4D -> GCD holdout

**Agent 1, 19 November 2026. Classification: prospective source-local holdout with an independent solved-page transfer of the digit-letter ordinal/self-index consumer. The continuation was inspected only after HERE had already been committed. The mechanism now transfers on solved p56, while HERE itself remains candidate unknown-page plaintext rather than a complete page decryption.**

## Decision

Preserve the following p28 loop as a new, value-changing local consequence:

```text
READ OUT
  -> fixed outer-H at the unique [p,g,K,g] p28 page-start carrier
  -> HERE

GP0(HERE)=48
  -> promoted GP0 -> zero-based p50 cell
  -> p50[48] = 4D

literal page-local self-index:
  fourth D on p28 is rune offset48

offset48:
  the D is the exact center of the physical-line fragment AELDXA
  centered source packet = [L,D,X] = [20,23,14]

fixed preserved-center H:
  H(L,X) || D
  = [20-14,20+14 mod29,23]
  = [6,5,23]
  = G C D

GCD on the reconstructed p28 DH state:
  gcd(b,p-1)=gcd(15,22)=1
  b^(-1) mod22 = 3
  B^3 mod23 = g
```

The recovered opcode **GCD** therefore points back to the exact modular-inverse calculation that selects cube exponent3 in the p28 DH route.

This creates a closed local cycle:

```text
DH state -> inverse exponent3 -> READ OUT -> HERE -> 4D -> GCD -> inverse exponent3
```

The loop uses no base60/base59 numeral-to-rune-offset coercion.

## Chronology

The HERE checkpoint was already durable before this continuation was inspected:

- HERE SFT commit: `b1287dd5e657510fc31e131e7127fb000f551531`
- HERE report commit: `8ed77aae...`
- authoritative HERE synthesis commit: `daf0cb46...`

The `4D / fourth-D / GCD` route was discovered later in the same Agent1 incarnation. It is therefore a genuinely **prospective consequence of the committed HERE candidate**. The token interpretation was then tested independently on solved p56/p57 and transferred exactly once, closing the main semantic gate described in the first version of this report.

## Upstream source objects

The p28 literal-DH line reconstructs:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
```

The source-only p28 exponent route gives candidate **READ OUT**, and the independently fixed reversible operation

```text
H(x,y)=(x-y,x+y) mod29
```

at the p28 opening `[p,g,K,g]` geometry gives:

```text
PC      -> HE
JTHBIW  -> RE
HERE
```

Thus:

```text
GP0(HERE) = 8+18+4+18 = 48
p50[48] = 4D
```

Whole-word GP0 -> zero-based p50 addressing was already promoted independently on solved/authenticated controls before this holdout.

## Literal self-index family

The closest precedent for reading a p50 digit-letter token literally is the independently recovered `YOU -> 2L -> WILL` relation: solved Liber Primus controls and the authenticated 2016 message both support interpreting `2L` as a literal count of Ls in WILL.

For the present holdout, charge a broader finite family rather than defining `4D` only after seeing p28:

1. take every p50 cell whose token is a positive decimal digit followed by an uppercase **single-rune GP letter**;
2. on each unknown rune-bearing page, ask whether the rune at the same zero-based address is that letter;
3. require its cumulative count from the page start through that address to equal the token digit.

There are **77** compatible p50 cells and **55** rune-bearing unknown pages:

```text
77 * 55 = 4,235 page/cell trials
```

Exactly **11** literal self-index hits exist manuscript-wide.

P28 has exactly one:

```text
page 28
address 48
token 4D
rune48 = D
prefix D-count through rune48 = 4
```

So `HERE -> 48 -> 4D` is not a generic property of many p28 cells.

## Solved p56/p57 control authenticates the ordinal self-index consumer

After the p28 `4D` self-index had been frozen, the exact same consumer was applied to solved LP2 pages p56 and p57 without changing its semantics:

```text
plaintext word
  -> GP0(word) = zero-based p50 address
  -> require p50[address] = nX
  -> at the same zero-based rune address on that solved page,
     require the rune to be X and its prefix ordinal to be n
```

Across solved p56 and p57 there are **13** word events whose GP0-addressed p50 cell has compatible positive digit + single-GP-letter form. Exactly **one** satisfies the complete current-page self-index rule:

```text
solved p56 word15 = IS
GP0(IS) = 10 + 15 = 25
p50[25] = 3I
solved p56 rune offset25 = I
prefix I-count through offset25 = 3
```

Thus the same mechanism used by `HERE -> 48 -> 4D -> fourth D` independently transfers on known plaintext:

```text
IS -> 25 -> 3I -> third I at solved-p56 rune25
```

No compatible p57 event passes, and no other compatible p56 event passes.

This solved-page control is especially useful because it was evaluated only after the p28 self-index rule had been fixed. It does not prove that HERE is plaintext, but it removes the earlier objection that `nX -> nth X at the current-page address` was an interpretation invented solely for `4D`.

## Exact fragment-center consequence

The source unit at p28 offset48 is not claimed to be a complete canonical LP word: the transcription can wrap words across physical lines. It **is** the exact center of a source-visible maximal rune fragment on physical line3:

```text
A E L D X A
    ^ D at page offset48
```

Numerically the five-rune fragment is:

```text
[25,20,23,14,24]
```

and D is its unique center rune.

This is exceptional inside the full literal-self-index family:

- 11 manuscript-wide self-index hits;
- 8 have one rune neighbor on each side inside their physical-line fragment;
- **p28/48/4D is the only one landing at the exact center of its fragment**.

No language score is used in this selection.

## Fixed centered-H output: GCD

Once the self-index has selected the center D, take the minimal odd centered packet with one source rune on each side:

```text
[L,D,X] = [20,23,14]
```

Apply the already fixed preserved-center H serialization:

```text
H(20,14) || 23
= [6,5,23]
= G C D
```

Apply this exact centered-three consumer to all eight literal self-index hits that have neighbors on both sides. Their outputs are:

```text
p5   21 / 2H -> NGDH
p6   31 / 2D -> UAD
p28  48 / 4D -> GCD
p33  68 / 3J -> EALJ
p44  83 / 3D -> RJD
p52   8 / 1W -> ICW
p54  68 / 3J -> RGJ
p55  38 / 2D -> BPD
```

**GCD occurs exactly once**, at the preselected p28/HERE hit.

The result is a source-native mathematical opcode rather than an English-language fit.

## GCD closes the DH inverse loop

For the independently reconstructed p28 DH state:

```text
b = 15
p = 23
multiplicative-group order = p-1 = 22
```

The new opcode gives the natural standard-DH check:

```text
gcd(15,22) = 1
```

so the private exponent is invertible. The inverse is:

```text
15^(-1) mod22 = 3
```

and it reverses the public DH exponent exactly:

```text
B^3 mod23 = 19^3 mod23 = 5 = g
```

The same exponent reproduces the already observed GP29 cross-modulus chain:

```text
K^3 = A
A^3 = B
B^3 = b        (mod29)
```

Thus GCD does not merely spell a mathematical abbreviation. It selects the exact algebraic property needed by the upstream p28 inversion.

## Scientific boundary

This is the first post-HERE consequence in this Agent1 run that is both untouched at the time HERE was committed and value-changing.

Its strongest points are:

- HERE was already frozen before the test;
- the upstream GP0 -> p50 address primitive predates HERE;
- the selected p50 token is visibly `4D`;
- the literal self-index interpretation is charged across 4,235 page/cell trials;
- p28/48 is its only p28 hit;
- it alone lands at an exact physical-fragment center;
- the fixed centered H consumer uniquely emits GCD among the eight eligible self-index hits;
- GCD immediately recovers the modular-invertibility condition and inverse exponent3 needed upstream.

The original semantic weakness has now been materially reduced. The exact `nX -> nth X at the same current-page address` consumer transfers independently on solved p56 through `IS -> GP0 25 -> 3I -> third I at rune25`, with exactly one hit among 13 compatible solved p56/p57 word events. The remaining uncertainty is upstream: HERE and the page-period READ OUT formula were first recognized during this research rather than supplied as prior first-party instructions, and the method has not decrypted a continuous unknown page.

Accordingly, preserve `READ OUT -> HERE -> 4D -> GCD -> inverse3` as a **strong source-constrained p28 local subpuzzle/intended-route candidate with solved-page mechanism transfer**, while keeping unknown-page plaintext status provisional.

## Reproduction

- SFT: `sims/lp2_p28_here_4d_gcd_holdout_sft.cjs`
- commit: `b88ba117604667712da89743723476ef36e83304`
- Windows Node22 PASS with solved-page control: https://github.com/FlareZ123/liber-primus/actions/runs/44438903229
- charged unknown family: 77 compatible p50 cells × 55 pages = 4,235 trials; 11 self-indexes; 1 exact fragment-center self-index; 8 centered-three consumers; 1 GCD output.
- solved transfer family: 13 compatible p56/p57 word events; exactly 1 self-index hit, p56 `IS -> 25 -> 3I -> third I at rune25`.
