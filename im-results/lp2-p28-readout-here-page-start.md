# P28 READ OUT -> HERE at the source-selected page start

**Agent 1, 19 November 2026. Classification: source-native local plaintext/checkpoint candidate. This result does not use the rejected p50-numeral -> LP2-rune-offset output type. The downstream object and family controls were recognized after READ OUT, so treat HERE as a strong local checkpoint rather than established unknown-page plaintext.**

## Result

The current p28 route reconstructs the labeled standard DH state directly from the sole unknown-page physical line beginning literal `DH`:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
```

Standard DH inversion gives `b^-1 mod22 = 3`. A concurrent source-only exponent test then removes the remaining layer-count convention from the p28 center/page-word operation. On the original p28 source:

- the page contains exactly **three printed periods**, supplying boundary exponent `3`;
- the physical page number is **28**, the order of the nonzero GP29 multiplicative group, so its reciprocal exponent is `28-1=27`;
- the page-numbered five-rune object is **word28**, immediately after the exact page center.

The fixed rule `boundary exponent = same-page period count`, `five-rune exponent = physical page number-1 mod28` maps the six-rune source object `[9,28,24,10,1,20]` exactly to **READOUT**. Charged unchanged across all **314** five-rune/predecessor objects, only p5 word37 (`PUTATT`) and p28 word28 (`READOUT`) enter the finite one/two-word phrase register; among the **nine page-numbered five-rune objects**, p28 is the sole phrase hit. This is a post-discovery source formula, but it no longer depends on p50 output semantics or an assumed visible-layer count. The reproducer is `sims/lp2_p28_pageperiod_exponents_readout_sft.cjs`; Windows run **44437498443** passed.

Take **READ OUT** literally on the same original page. The reversible shell operation was already fixed independently as

```text
H(x,y) = (x-y, x+y) mod29.
```

At the natural page start, p28 line1 begins with these two printed fragments:

```text
PC       values [13,5]          length 2 = K
JTHBIW   values [11,2,17,10,7] length 5 = g
```

Read the **outer** rune pair of each fragment through the already fixed H orientation:

```text
H(13,5) = [8,18] = HE
H(11,7) = [4,18] = RE
```

The source-selected output is therefore:

```text
HERE
```

No table lookup, radix choice, page-local numeric offset, Caesar shift, language-fitted key, or output reversal is used.

## Why the two fragments are source-selected rather than truncated for HERE

The opening line carries a stronger visible DH geometry before any output letters are read:

```text
[total line runes, fragment count, first length, second length]
= [23,5,2,5]
= [p,g,K,g].
```

Across all unknown physical lines, only **22** have all four of those geometric slots drawn from the seven recovered DH-state values, and HERE is the sole finite-register outer-H output among them. The exact `[p,g,K,g]` geometry occurs twice manuscript-wide, at p28 line1 and p44 line10, but **p28 is the only page-start occurrence**. At page starts, only four lines have all four slots drawn from the DH state at all; p28 is again the sole lexical output.

The first two fragment lengths alone are the ordered pair `[K,g]=[2,5]`. A full census of unknown physical pages p0..p55 gives **exactly one page start** with that ordered pair: **p28**.

To avoid privileging `[K,g]` after seeing the output, charge every ordered pair of distinct labels from the seven recovered DH fields `p,g,a,b,A,B,K`. There are **42** ordered field pairs. Eight page starts have first-two fragment lengths equal to some member of that family:

```text
p0  [A,g] = [8,5]
p1  [g,A] = [5,8]
p4  [K,A] = [2,8]
p19 [g,a] = [5,6]
p23 [K,a] = [2,6]
p28 [K,g] = [2,5]
p31 [A,K] = [8,2]
p33 [K,A] = [2,8]
```

Apply the same fixed outer-H readout to all eight. Under the exact finite English register already used for the p28 phrase-family audit, **p28 is the only lexical output**, and that output is HERE.

This is a post-discovery finite family control, not an authorship probability.

## Broader controls

The canonical unknown-page transcription contains **594 rune-bearing physical lines**.

Among the **41** unknown pages whose first physical line begins with two multi-rune fragments, applying the same outer-H rule to the first two fragments yields exactly one finite-register English word:

```text
p28 -> HERE
```

Relax the page-start restriction completely. Across all **2,347 adjacent pairs of multi-rune printed fragments** on unknown p0..p55, the exact four-rune output `[8,18,4,18]=HERE` occurs **once**:

```text
p28 line1 fragments1-2
```

Thus the result does not depend on choosing p28 after scanning for HERE. P28 was already selected upstream, and its opening `[K,g]` geometry is unique before lexical interpretation.

## Reversibility and limit

H is invertible over GP29 because its determinant is2. The two recovered pairs therefore forward- and inverse-reconstruct the original fragment endpoints exactly. This is a genuine value-changing local inverse on source-selected data.

It is **not** a whole-page decoder. Continuing the same outermost-fragment stream on p28 line1 gives the later pair outputs `OX / XF / MP`, not prose. Do not repair that failure with skipped fragments, alternate H orientations, fitted word breaks, or a new cipher layer.

The useful statement is narrower:

> The source-derived READ OUT instruction, the already fixed outer-H operation, and the recovered DH state jointly select the beginning of p28 and recover the exact local marker **HERE**.

Because HERE was noticed after READ OUT, the next promotion gate should be an untouched consequence selected by the marker itself or by another first-party source cue. GP0(HERE) or arbitrary page-number hopping should not be introduced merely because they produce a convenient continuation.

## Reproduction

- SFT: `sims/lp2_p28_readout_here_page_start_sft.cjs`
- Windows Node22 PASS after the four-slot DH-geometry upgrade: https://github.com/FlareZ123/liber-primus/actions/runs/44437679228
- Source-derived READ OUT exponent SFT: `sims/lp2_p28_pageperiod_exponents_readout_sft.cjs`
- READ OUT exponent Windows PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44437498443
- Tested source family: 594 rune-bearing lines, 41 eligible page starts, 2,347 adjacent multi-rune fragment pairs, 42 ordered DH-field pairs, 22 all-DH four-slot geometry lines.
