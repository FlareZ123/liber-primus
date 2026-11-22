# Bookend 81²→80² L-strip versus the independently solved p56 key register

**Agent20, 22 November 2026. Original-input, all-secret 29-way known-plaintext exclusion.** No unknown LP2 rune plaintext, key or original author-selected operator is recovered.

## One natural terminal receiver

The unsolved original LP2 rune stream has 12,956 GP29 symbols. Its first **6,561 = 81²** runes end exactly at the first of the two copies of the complete word pair DJU BEI; the other copy ends the unsolved text. Independently, five visually printed red ordinal marks in the remaining part give the conditional 80² second-block capacity discussed in [the existing bookend investigation](bookend-81x81-80x80-ordinal-insertion.md). No Cicada-signed source explicitly instructs square reflow.

An 81×81 square becomes an 80×80 square if one removes its final row of 81 runes and its final column of 80 runes: a uniquely sized **161-rune L-strip**, counting the shared corner once. The manuscript's terminal **p55 is 76 genuinely unknown runes** and **p56 is 85 genuinely solved runes**, also exactly **161**. The next p57 contains 95 clear runes. Since p57 explicitly mentions shedding circumferences, an original-era solver might try the strip as a shared keystream or a code alphabet for the terminal message. This is an *inferred* decoder, not a signed instruction. The 161 equality is partly derivative of the already noted 76+85+95=256 panel capacity; do not multiply the equalities into independent confirmation.

## A decisive check on the authentic, held-known p56 portion

Freeze the first 6,561 original runes in printed order as 81×81. For each of the square's eight dihedral symmetries and each strip direction, take the 81-cell bottom row (left to right) followed by the 80-cell right column (top to bottom; shared corner excluded). These are **16** geometry-fixed 161-symbol strips.

Assume the first76 strip symbols provide a potential reversible decoder for unknown p55 and the last85 provide the *same stationary symbol→key lookup* on the independently known p56. Give this lookup **all 29 outputs as unrestricted secret symbols**; its values need not be affine, prime-derived or even injective.

For each position in the 85-rune known section, form its uniquely required additive key

\[
K_j=(C^{(56)}_j-P^{(56)}_j)\bmod29.
\]

A single-valued secret function on a strip symbol must return the same required key at every repeated input. Count only subsequent occurrences that demand contradictory outputs. For a separate, direct plaintext-label possibility, demand that the strip symbol map straight to the known p56 rune, again allowing an arbitrary 29-way function.

| Original source, 16 exact strip readers | Required result | Actual |
| --- | --- | --- |
| 85-rune p56 authenticated known text re-encrypts under its genuine transparent-F prime-totient cipher | 85/85 | **85/85**, with exactly 84 consumed prime terms |
| An arbitrary secret stationary lookup from source strip rune to authentic p56 additive key | Zero contradictions | **54–59 conflicting known positions in every reader** |
| An arbitrary secret stationary lookup from source strip rune directly to authentic p56 plaintext | Zero contradictions | **51–58 conflicting known positions in every reader** |
| A 29-way nonlinear-key positive plant, learned from synthetic known p56 | Zero contradictions | **Zero**, and **75/76** synthetic p55 plaintext symbols recovered with the learned key |

The planted model uses the fixed nonlinear secret key function \`f(x)=(7x²+3x+11) mod29\`, source symmetry5 and the actual p57 opening as a native GP29 synthetic unknown message. The one unlearned p55 key class genuinely does not occur among that orientation's 85 p56 strip-input symbols; it is reported as unresolved rather than imputed. This demonstrates the all-key contradiction test can distinguish an authentic shared lookup from a random coincidence and can transfer learned key material to an independent original-shaped receiver when one exists.

The original source has **zero** consistent complete terminal lookup readers. This is stronger for the specified family than selecting the best of a menu of affine shifts and judging whether it looks English: even a completely unspecified secret GP29 output table fails *before* any p55 plaintext guess.

### Genuine plaintext-F transparency also fails, without assuming p55's key consumption

The original p55 has exactly **three ciphertext F** rune occurrences. If the unknown page used the already established p56 F-interrupter rule, each F might be a nonconsuming plaintext F or an ordinary consuming non-F rune, so the p56 strip-key start could occur after **73, 74, 75 or 76** consumed p55 runes. The independently solved p56 has exactly one plaintext F, which uses no key symbol, leaving **84 actual consuming rune positions**.

The reproducible SFT therefore additionally enumerates all **16 × 4 = 64** source-geometric choices and authentic p55 F clock occupancies. For each case, allow the same completely unconstrained secret single-valued GP29 strip-symbol→key mapping, requiring the 84 authentic original p56 consuming positions to be consistent. **Every one of the 64 fails, with 51–57 contradictory key demands**. The best (still impossible) model is dihedral variant4, reversed strip, 73 consuming p55 symbols, and 51 contradictions. This removes a potential loophole in the simpler 85-slot check: the real p56 cipher consumes prime-key steps only at non-F plaintext symbols, and the unknown p55 F interpretations have been fully charged.

No general claim is made about an arbitrary unbounded p55 key reset, a per-position changing lookup, or a different terminal symbol alignment. The 64-position result excludes precisely the 161-strip terminal register with the historically demonstrated F clock and arbitrary stationary lookup. It does so before using any unknown plaintext. The original printed pages provide no instruction to select a different register or state update.


## Interpretation

The numerical matching, bookend marker and p57 circumference language could have motivated a real participant to try this compact square-strip method. But a terminal *stationary*, one-rune-to-one-key/one-plaintext mapping is inconsistent with the actual solved p56 register in every unedited orientation. A per-position stream, a stateful fold, a different terminal assignment, or an entirely separate p56 cipher would evade this necessary condition; absent an original instruction, such additions would be new premises, not repairs to a compatible key.

**Decision:** close this exact **81→80 L-strip / same-stationary-lookup / 76+85 terminal** route. Do not derive or optimize a hidden p55 key from its incompatible original p56 equations. The existing 81²/80² source geometry is not thereby disproved, but **no unknown page is decoded**.

[Standalone read-only CommonJS SFT](../sims/lp2_bookend_lstrip161_p56_knownkey_sft.cjs) ([Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45072092477)) reads only \`resources/liber-primus/lp2-corpus.json\` and \`resources/external/relikd-solved-gp29-native-v1.json\`, checks the genuine solved-page prime encryption and every original strip variant, and constructs its independent positive plant.
