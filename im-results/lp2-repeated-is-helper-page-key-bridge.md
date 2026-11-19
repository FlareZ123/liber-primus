# Repeated IS helper-page key architecture: p11→p25→K and p21→p57→28

> **Scope update:** this two-IS bridge is now a strict subset of the three-case architecture in `im-results/lp2-two-rune-helper-page-hkey-architecture.md`, which adds the independently established p34 `BE -> PATH -> p39 -> B=19` helper route. The derivations below remain the detailed p11/p21 evidence.

**Agent45, 19 November 2026. Classification: retrospective two-route mechanism compression over two independently selected local plaintext candidates.** The two authenticated occurrences of `IS` at signed indices 11 and 21 already select physical p11 and p21 under the established number-direction grammar. Both pages now have source-selected two-rune receivers that recover `IS` under the same H-rectangle key form `H^-1([s,0])`, with different scalars. A new cross-route observation explains where each scalar can be obtained by the same higher-level path: the receiver's own printed-word ordinal selects an authenticated source word, and that word's GP0 selects an independently meaningful helper page.

The two routes are:

```text
p11 receiver word11
 -> signed word11 IS
 -> GP0(IS)=25
 -> physical p25
 -> independently selected unique [K,g]=[2,5] outer-H state
 -> scalar K=2
 -> H^-1([2,0])=[1,28]
 -> p11 IS

p21 receiver word33
 -> signed word33 WILL
 -> GP0(WILL)=57
 -> solved physical p57
 -> FIND, GP0(FIND)=42
 -> p50[42]=0S
 -> low base60 digit S=28
 -> H^-1([28,0])=[14,15]
 -> p21 IS
```

This does not create either plaintext target or receiver. It connects mechanisms that were independently established before the connection was noticed.

## 1. P11 branch

Authenticated `IS` occurs at source indices 11 and 21. The existing number-direction rule selects p11 zero-based printed word11:

```text
p11 word11
offsets49..50
C = [11,14].
```

Its untouched sum-before-difference packet is manuscript-unique among all 465 complete two-rune unknown words:

```text
[11+14, 11-14] mod29
= [25,26]
= source indices [THEIR,NUMBERS].
```

The existing p11 inverse uses the occurrence count of `IS`, `K=2`:

```text
H^-1([K,0])
= H^-1([2,0])
= [1,28]

[11,14] - [1,28]
= [10,15]
= IS.
```

The new observation starts from the receiver's own printed ordinal:

```text
ordinal11
 -> authenticated source word11 IS
 -> GP0(IS)=25
 -> physical p25.
```

Physical p25 was already selected independently by authenticated 2013 `GOOD LUCK`:

```text
GP0(GOOD LUCK)=66
p50[66]=0P
0P=25 in both base59 and base60.
```

Only after that independent page selection, the p25 cube-route audit opened its selected side object and found:

```text
source six-rune object
= [18,3,20,10,11,16]

outer H
= H(18,16)
= [2,5]
= [K,g].
```

This exact `[K,g]` outer state occurs once among all 627 eligible five-rune predecessor/successor side objects. Its first H coordinate is exactly the p11 scalar `K=2`.

Thus p11's key scalar can be recovered through a source-word-GP0 page handoff to a page whose independently audited state object literally exposes `K`.

## 2. P21 branch

Authenticated index21 again targets `IS`. The existing same-index length/GP0 selector fixes:

```text
p21 zero-based word33
offsets170..171
C = [24,1]
H(C) = [23,25] = [p,p+K].
```

Both the raw packet and its H shell occur once among all 465 complete two-rune unknown words.

The receiver's printed ordinal gives:

```text
ordinal33
 -> authenticated source word33 WILL
 -> GP0(WILL)=57
 -> physical p57.
```

Among all valid receiver-ordinal source words in the finite same-index class, p21 alone has GP0 equal to either solved physical LP2 page number 56 or 57.

Solved p57 already supplies the independently audited pointer:

```text
FIND
GP0(FIND)=42
p50[42]=0S
low base60 digit S=28.
```

That output is exactly the p21 H scalar:

```text
H^-1([28,0])
= [14,15]

[24,1] - [14,15]
= [10,15]
= IS.
```

This reproduces the p21 key through an actual solved-page instruction route instead of relying only on the arithmetic shortcut `57 mod29=28`.

## 3. Shared architecture

The two repeated `IS` instances now fit one higher-level grammar:

```text
authenticated source index
 -> physical page
 -> source-selected two-rune receiver
 -> receiver printed ordinal
 -> authenticated source word at that ordinal
 -> GP0(source word) as helper page
 -> helper page exposes scalar s
 -> H^-1([s,0])
 -> IS.
```

The helper-page scalar extraction is page-specific and already authored by the independent route on that page:

- p25 exposes `[K,g]` through a manuscript-unique outer-H state object, so `s=K=2`;
- solved p57 executes `FIND -> p50[42] -> low60 28`, so `s=28`.

This is more constrained than treating `2` and `28` as arbitrary fitted constants. It also explains why the two occurrences of the same authenticated plaintext use different local keys.

## 4. Finite receiver-class context

The valid receiver-ordinal source words in the current same-index length/GP0 family are:

```text
p6  ordinal28 -> THE   GP0=20
p11 ordinal11 -> IS    GP0=25
p21 ordinal33 -> WILL  GP0=57
p33 ordinal34 -> BE    GP0=35
p34 ordinal2  -> PATH  GP0=39
p38 ordinal11 -> IS    GP0=25
p40 ordinal16 -> ARE   GP0=46
```

Only p11 and p21 are the two authenticated `IS` occurrences. The p21 helper is also the sole member whose source-word GP0 is a solved page number.

A stronger general receiver-ordinal page-pointer rule has already failed prospectively: p40 ordinal16 precommitted p16 / source `ARE`, while untouched p16 word16 has length2 instead of ARE's length3. Therefore the architecture above is kept specifically as a helper-page key route for the two `IS` recoveries, not promoted to a universal page-plus-word opcode.

## 5. Evidence boundary

The connection is retrospective. P11 `IS`, the p25 `[K,g]` object, p21 `IS`, and the solved-p57 `FIND -> 28` route were all visible before the helper-page architecture was recognized. There is no third authenticated `IS` occurrence available for a same-type blind holdout.

Preserve the result as **mechanism compression and cross-route corroboration**:

- it joins both authenticated `IS` occurrences under one higher-level source/receiver/helper-page/H-key grammar;
- both helper pages were independently meaningful before the merger;
- each helper supplies exactly the scalar already required by its local inverse;
- the p40 prospective failure prevents an unjustified universal ordinal-navigation interpretation.

Do not extend GP0 helper pages to arbitrary targets or mine helper-page operations until a newly source-selected receiver supplies a prospective test.

## Reproduction

```text
node sims/lp2_repeated_is_helper_page_key_bridge_sft.cjs
```

Upstream reproductions remain:
- `sims/lp2_p11_is_occurrence_hrect_sft.cjs`
- `sims/lp2_2013_goodluck_p25_cube_route_sft.cjs`
- `sims/lp2_p21_is_wordordinal_sourcekey_sft.cjs`
- `sims/lp2_p28_readout_lowdigit_selfclosure_sft.cjs`
