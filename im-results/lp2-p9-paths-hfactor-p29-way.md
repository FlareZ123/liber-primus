# P9 PATHS half reconstructs BASE29 3301, DH state, and p29 WAY parameters

**Agent31, 19 November 2026. Classification: strong cross-artifact parameter packet; W||AY remains a retrospective assembly candidate, not a source-selected decryption.** The independently selected p9 packet is split by the reconstructed state `K=2` into DIRECTION29 and PATHS40. Its four-rune PATHS half `[0,3,16,21]` has two compatible H-structures. A shell-preserving adjacent-pair H read gives `[24,26,3,8]`, whose first three values are exactly the polynomial-order coefficients of the authenticated 2013 `BASE29 3301 = 3QO` token and whose fourth value is DH public state `A=8`. The project's pre-existing outside-in H4 maps the same four runes to `[8,16,19,21] = [A,C(p),B,B+K]`. Both exact signatures occur on only this p9 physical window across the unknown manuscript.

## Fixed upstream packet

The VERIFY route independently selects p9. Its first complete word strictly right of the midpoint plus its outward successor is:

    [25,4,0,3,16,21]

with held-out total69. State `K=2` splits it:

    [25,4] | [0,3,16,21]
       29  |      40
    DIRECTION | PATHS

The four-rune object studied here is therefore fixed before either H interpretation.

## Radial H reconstructs the 2013 BASE29 3301 polynomial

For the PATHS half, pair the first two outward runes as the inner pair and the last two as the outer pair:

    inner H(0,3)   = [26,3] = [-e,e]
    outer H(16,21) = [24,8] = [p+1,A]

Place the outer H coordinates outside the inner H coordinates:

    radialH4([0,3,16,21])
    = [24,26,3,8]
    = [p+1,-e,e,A].

The authenticated 2013 source states `BASE29 3301 = 3QO`. With the canonical base29 alphabet:

    3QO -> [3,26,24]

and polynomial high-degree-first order is its reversal:

    [24,26,3].

Thus the p9 PATHS half reproduces the complete 2013 3301 polynomial coefficient vector followed by `A=8`:

    [24,26,3] | [8]
       3301 H |  A

This is an exact numeric match to an authenticated historical artifact.

## Existing outside-in H4 gives a second DH-state packet

Apply the project's existing outside-in four-rune H transform:

    H4([x0,x1,x2,x3])
    = [x0-x3, x1-x2, x1+x2, x0+x3] mod29.

For the same p9 values:

    H4([0,3,16,21])
    = [8,16,19,21]
    = [A,C(p),B,B+K].

Here `C(p)=23^3 mod29=16`, from the separately authenticated source cube. All four outputs are therefore independently typed by the reconstructed DH/cube state.

## Manuscript-wide controls

Under the fixed radial H serialization, scan every contiguous four-rune window on unknown p0–55:

    12,791 windows
    exact [24,26,3,8] hits: 1
    exact [24,26,3] prefix hits: 1

The only hit is p9 offsets137–140, input `[0,3,16,21]`.

To charge orientation freedom, broaden to 32 natural configurations per window: independently flip each H pair's input direction, independently swap each H output, and reverse the shell read. Across 409,312 configurations:

    full-target configuration hits: 2
    3301-prefix configuration hits: 4
    distinct physical windows for either target: 1

All symmetry-equivalent hits are the same p9 offsets137–140.

Under the independently existing outside-in H4, the target `[A,C(p),B,B+K]=[8,16,19,21]` is also unique in the same 12,791-window corpus, again at p9 offsets137–140.

These controls were designed after the p9 object and historical target were known, so they are descriptive familywise evidence rather than blind discovery probabilities.

## P29 parameters now come directly from the p9 packet

The radial vector gives:

    root r = 24
    middle coefficient = 26 = -e
    derivative order e = 3
    check state A = 8.

On p29 and the printed 256-cell table, `r=24` is the repeated root. Using packet-supplied order `e=3`:

    P29'''(24) = 7 = W
    table'''(24) = 7 = W.

The packet's first two radial coefficients are:

    [24,26] = AY.

So the p9 DIRECTION/PATHS packet supplies p29's page number, repeated root, derivative order, AY tail, and an independent A check. The authenticated 2013 `3QO` token becomes a historical confirmation of a coefficient vector already present inside the selected LP2 ciphertext.

## Assembly consequence

With `W=7` from the left DIRECTION branch and `AY=[24,26]` from the right PATHS block, preserving packet branch order gives:

    W || AY = [7,24,26] = WAY.

Charging the compact six choices formed by the three insertion positions for W and forward/reverse AY order, only `W||AY` is an authenticated signed-source three-rune word.

This substantially narrows the previous 48-member p29 assembly family. The remaining caveat is interpretive: the radial shell serialization and the rule that the left branch result precedes the right branch's AY payload were recognized after WAY was already known. They are now supported by two independent exact H-state signatures and manuscript-wide uniqueness, but should still be described as candidate mechanism selection rather than a blind decryption.

## Research consequence

The productive route can now be stated more compactly:

    VERIFY -> p9
    p9 K-split -> DIRECTION29 | PATHS40
    PATHS-half H -> [3301 polynomial | A]
    DIRECTION29 -> p29
    p29 derivative at packet r=24, order e=3 -> W
    packet AY tail -> AY
    packet order -> WAY
    C^e(WAY13) -> LIBER9 -> p9.

This turns the p9 object from a navigation packet into a plausible parameter packet for the p29 operation and provides an internal LP2 copy of the authenticated 2013 BASE29 3301 coefficient vector.

The later p28 READ OUT THE DIRECTION gate (#1931) does not repair the assembly-order gap: p28's fixed readout yields `READ OUT THE` and `THEIR NUMBERS ARE THE`, while `DIRECTION` is the authenticated 2016 continuation (not p28 body plaintext). It selects page29 at most; it does not specify `W||AY`. Treat this file as a parameter derivation only, not a p29 decryption or authenticated opcode. The bounded [p28 source-order gate](lp2-p29-direction-derivative-way.md) rejected the final W||AY assembly as an authored instruction.

## Reproduction

Run `node sims/lp2_p9_paths_hfactor_p29_way_sft.cjs`.

Windows Node22 PASS: workflow run **44457862429**.
