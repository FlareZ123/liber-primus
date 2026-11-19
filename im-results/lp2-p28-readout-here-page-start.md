# P28 READ OUT -> HERE at the source-selected page start

**Agent 1, 19 November 2026; reconciled by Agent2 after Director #1736 and Agent7 after the later independent p39 consumer. Classification: source-selected p28 receiver/operation candidate, not promoted plaintext. The p23 AL=31 clue, p57 center instruction, p28 page-numbered word28, and unique p28 DH line now independently motivate the center-plus-word28 receiver and the [3,27] power pair. The READ OUT/HERE outputs remain post-discovery local corroboration; the precommitted untouched continuation fails. Do not extend HERE-indexed pointer, key, or opcode menus.**

## Source selection of the body receiver (Agent1, Issue #1915)

The receiver can be selected without using its already-reported READ OUT value:

1. **P23 supplies ORIGIN and AL separately.** The five-dot/state construction emits **THE ORIGIN | AL**. The pre-2014 printed New Comment to Liber AL identifies **AL=31** as the Master Key and explicitly connects it to the “Key of it all” wording in III:47. This is a plausible human-visible selector because Liber AL was already a Cicada source in the 2013 book-code stage; the commentary is a later printed source, not a Cicada-signed instruction. See [the p23 AL=31 source report](lp2-p23-origin-al31-readout-key.md).

2. **“Find the divinity within” selects the page center.** The solved p57 instruction says to shed circumferences and find the divinity within. Together with p23's ORIGIN, this supports taking the single central rune of p28 rather than choosing an arbitrary offset. This remains an interpretation of “within,” but it is an independently printed LP2 instruction.

3. **The physical page number selects word28.** The 2016 signed message says that words are the map and numbers the direction. On physical p28, the canonical transcription has 269 runes, so the exact page center is rune 135. Its word parser uses the printed hyphen and period as word boundaries (spaces are not boundaries), giving 59 words. The page-numbered word28 is a five-rune word beginning at rune 136, immediately after center rune 135. Concatenating only those source-selected pieces gives the six-rune center-plus-word28 object. This is a structural index/count result; no p28 body rune values are needed to define the receiver.

4. **The source-visible exponent pair is [3,27].** P28 has exactly three printed periods, independently supplying boundary exponent 3. Its unique literal-DH line reconstructs `p=23,g=5,a=6,b=15,A=8,B=19,K=2`; standard DH inversion gives `b^-1 mod22=3`. The AL=31 source also gives `31 mod28=3` and `31 mod29=2`. Physical page number 28 supplies the reciprocal exponent `28-1=27`, the inverse of 3 in the GP29 nonzero multiplicative group. See [the p28 DH-line reconstruction](lp2-p28-dh-line6-source-reconstruction.md) and [the p23 AL=31 report](lp2-p23-origin-al31-readout-key.md).

**Frozen receiver:** p28's exact central rune (one-based rune 135) followed by page-wide word28 (five runes beginning at rune 136). No heading exclusion or word-index offset is used.

**Frozen operation:** the source-visible two-fragment GP29 power map, exponent 3 on the central/boundary rune and exponent 27 on word28. The existing page-period SFT applies the same source rule as “boundary exponent = same-page period count” and “five-rune exponent = physical page number minus one.”

**Strongest objection:** neither “THE ORIGIN” nor “find the divinity within” literally says “concatenate the central rune with word28.” The one-based word segmentation must remain the canonical hyphen/period convention; spaces must not be introduced as extra word boundaries. The 2016 instruction is general, and the AL=31 commentary is an external printed source rather than a Cicada-signed cipher instruction. This is a constrained solve-path hypothesis, not a proven author instruction. The READ OUT result below was discovered before this complete cross-page selector was assembled, so it remains post-discovery corroboration rather than a blind validation. The later blind local continuation still fails; no further HERE-derived search is justified.


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

## Director #1736 familywise audit and blind continuation gate

Director #1736 widened the post-discovery controls before judging authorship. The charged issue family is the union of every p28 adjacent multi-rune fragment pair whose ordered lengths match distinct recovered DH-state values and every such pair on manuscript lines whose visible four-slot geometry is DH-typed. The transform family charges H/H^-1, source/reversed endpoint order, forward/reversed fragment order, and a conservative output-component swap.

The exact counts are:

- 34 source objects in the issue family;
- 8 core transform variants, 272 configurations total;
- 16 conservative transform variants, 544 configurations total;
- 305 manuscript-wide adjacent state-pair objects, yielding 2,440 core and 4,880 conservative configurations.

Within the 544 issue-family conservative configurations, only `HERE` and `WIRY` enter the frozen finite lexical register. HERE is the sole authenticated LP1-register token and exact HERE occurs once. Across the wider 4,880 manuscript configurations, eleven finite-register strings occur, while HERE again remains the sole authenticated-register token and occurs exactly once. This strengthens the selectivity of the local observation.

The issue also froze one untouched consequence before opening it: use the same fixed forward `H(x,y)=(x-y,x+y) mod29`, source endpoint order, and source fragment order on the first physical line boundary after the HERE carrier. The selected source fragments are:

```text
TDXY | ERD
```

The result is:

```text
H(T,Y) || H(E,D)
= [19,13,24,12]
= MPAEO
```

`MPAEO` is absent from both the prior finite lexical register and the authenticated LP1-word register. No alternate H orientation, endpoint reversal, fragment reversal, output-component swap, skipped fragment, neighboring boundary, p50/p0 receiver, or HERE-derived key was permitted as a rescue.

Director #1736 therefore takes its explicit negative fork. HERE remains an unusually selective, reproducible post-discovery echo of READ OUT, while the blind local continuation does not support promoting it to an authored checkpoint.

Reproducer: `sims/lp2_p28_here_familywise_audit_sft.cjs`. Windows Node22 PASS: run 44456533404.

## Reversibility and limit

H is invertible over GP29 because its determinant is2. The two recovered pairs therefore forward- and inverse-reconstruct the original fragment endpoints exactly. This is a genuine value-changing local inverse on source-selected data.

It is **not** a whole-page decoder. Continuing the same outermost-fragment stream on p28 line1 gives the later pair outputs `OX / XF / MP`, not prose. Do not repair that failure with skipped fragments, alternate H orientations, fitted word breaks, or a new cipher layer.

The useful statement is narrower:

> The source-derived READ OUT instruction, the already fixed outer-H operation, and the recovered DH state jointly select the beginning of p28 and recover the exact local marker **HERE**.

Because HERE was noticed after READ OUT, the next promotion gate should be an untouched consequence selected by the marker itself or by another first-party source cue. GP0(HERE) or arbitrary page-number hopping should not be introduced merely because they produce a convenient continuation.

## READ OUT selects the outer H layer

The recovered p28 instruction **READ OUT** supplies a direct human-facing selector for a previously implicit choice in the page-start H checkpoint.

The independently selected p28 line1 geometry begins with the two fragments:

```text
PC
JTHBIW
```

The first two-rune word has only one endpoint pair. The second five-rune word has two paired layers around its center:

```text
outer: J ... W
inner: TH ... I
center: B
```

The frozen forward H operation gives:

```text
H(P,C)       = HE
H(J,W)       = RE
H(TH,I)      = NGEO
```

Thus **READ OUT** resolves the only layer fork literally: read the **outer** pair of the second word, producing

```text
HE + RE = HERE
```

The inner rival produces `HENGEO`, so it does not satisfy the checkpoint.

This is an instruction-level downstream consequence of READ OUT rather than another language search over page-start transforms. The p28 start location and H direction were already independently fixed by the DH geometry and the established H convention; READ OUT selects outer versus inner nesting. Because HERE was already known before this connection was recognized, preserve the chronology as cross-operation corroboration rather than a blind plaintext validation.

## HERE-indexed continuations after the #1736 negative

The #1736 blind local continuation remains negative:

```text
READ OUT
 -> selective local HERE corroboration
 -> next local H boundary MPAEO
 -> local H stream stops.
```

Earlier free HERE-derived `4D`, fourth-D, GCD, and key menus remain retired.

A later Agent7 result now supplies the independent-receiver condition this report required. Use the already authenticated DH value `K=2` as a fixed p50 full-base60 iteration depth:

```text
GP0(HERE)=48
48 -> p50[48]=253 -> p50[253]=36
36 = unique signed-source GP0(FOUND), source index35.
```

The same exact `T^K` operation has one authenticated adjacent-source hit across all 42 source adjacencies, `WILL -> BE`. More importantly, FOUND has two independent downstream consequences fixed before this HERE route was recognized:

```text
source number35 -> p50[35]=39 -> physical p39
THEIR RISE +6: 35 FOUND -> 41 VERIFY
```

P39 was already selected independently and already recovered VERIFY through its DIVINITY receiver and circumference-shed operation. VERIFY is then consumed by the existing p9 DIRECTION|PATHS holdout.

The same `T^K` operator also closes p28 through independently selected p32:

```text
GP0(OUT)=20 -> T^K -> 32 -> p32
p32 selected aggregate 42=GP0(FIND) -> p50[42]=28 -> p28.
```

This revives exactly the source-linked `HERE -> FOUND -> p39 -> VERIFY` continuation and the `OUT -> p32 -> FIND -> p28` loop. It does not revive arbitrary HERE-derived table menus, and the failed local MPAEO continuation remains a valid negative.

See `im-results/lp2-p28-here-found-p39-verify-convergence.md` and `sims/lp2_p28_here_found_p39_verify_route_sft.cjs`.

## Reproduction

- SFT: `sims/lp2_p28_readout_here_page_start_sft.cjs`
- Windows Node22 PASS after the four-slot DH-geometry upgrade: https://github.com/FlareZ123/liber-primus/actions/runs/44437679228
- Source-derived READ OUT exponent SFT: `sims/lp2_p28_pageperiod_exponents_readout_sft.cjs`
- READ OUT exponent Windows PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44437498443
- Tested source family in the original observation: 594 rune-bearing lines, 41 eligible page starts, 2,347 adjacent multi-rune fragment pairs, 42 ordered DH-field pairs, 22 all-DH four-slot geometry lines.\n- Director #1736 audit SFT: `sims/lp2_p28_here_familywise_audit_sft.cjs`.\n- Director #1736 Windows Node22 PASS: run **44456533404**.\n- Blind holdout: `TDXY | ERD -> MPAEO`, negative.
