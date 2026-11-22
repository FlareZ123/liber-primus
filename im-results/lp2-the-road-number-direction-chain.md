# THE ROAD number-direction chain

**Agent11, 19 November 2026. Classification: strong retrospective source-number mechanism and downstream structural consequence. It materially constrains THE/ROAD while remaining post-discovery rather than blind plaintext recovery.**

## Result

The authenticated 2016 message says: “Its words are the map, their meaning is the road, and their numbers are the direction.”

Candidate `THE` is GP `[2,18]`. Read as a base29 numeral it is **76**. The immediately following p0 word23 ciphertext is `[16,8,25,27]`, whose GP0 is also **76**.

A frozen family charges every canonical unknown-manuscript 2-rune→4-rune adjacency (**72**), every ordered pair of distinct fixed DH fields, both additive signs, and every authenticated two-rune 2016 target `THE/IS/BE`: **6,048 trials**. A hit requires the first word to decrypt to the target and the target's base29 numeral to equal GP0 of the following ciphertext word. There are exactly two hits, residue-equivalent descriptions of the same p0 words22→23 event:

```text
[p,a] with addition      -> THE
[a,p] with subtraction   -> THE
base29(THE) = 76 = GP0(p0 word23)
```

Thus THE's number selects the ROAD ciphertext independently of the later ROAD key.

The HERE-derived ROAD key decrypts word23 to `ROAD=[4,3,24,23]`. As a base29 numeral:

```text
ROAD = 100798
100798 mod 256 = 190
```

The p50 table has exactly one intrinsic drop-f-base59 self-pointer: zero-based cell189, token `3C`, with base59(`3C`)=189. Charging all eight authenticated four-rune 2016 targets under both ordinary receiver origins gives exactly one self-pointer hit: **ROAD / one-based**, where residue190 denotes zero-based cell189. No other target lands on a self-pointer under either origin.

There is also an operation-name bridge. Across all42 adjacent word pairs in the signed 2016 message, the sole pair whose concatenated GP0 equals any authenticated 2013 command address is:

```text
GP0(THE ROAD) = 20 + 54 = 74 = GP0(BASE29)
```

Here `GP0(BASE29)` uses the alphabetic GP spelling `BASE`; the decimal suffix has no GP rune digits. This provides source context for reading THE and ROAD as base29 numerals.

## Interpretation

The compact chain is:

1. decrypt THE at p0 word22;
2. base29(THE)=76 selects the following word by GP0=76;
3. decrypt ROAD at that word using the source-derived HERE descriptor key;
4. base29(ROAD)=100798; modulo the 256-cell p50 table gives residue190;
5. one-based reception lands on p50's unique intrinsic self-pointer, cell189.

This is substantially more constrained than an isolated phrase fit. The chronology remains retrospective: THE ROAD was already a candidate when this continuation was recognized. Treat it as strong intended-route evidence and a concrete downstream consumer, while reserving blind-plaintext status for a consequence frozen before its target is inspected.

## Prospective ordinal-consumer gate

The new ROAD→p50 cell189 consequence permits an untouched test of a separate operation that has since gained solved-page support: interpret p50 token `nX` as “at the same zero-based rune address on the current page, require X and prefix ordinal n.”

Cell189 is `3C`. If that consumer transferred to current page p0, zero-based p0 rune189 would have to be the third `C` through that address.

It is not:

```text
p0[189] = F
prefix F occurrence through p0[189] = 11
expected from 3C = third C
```

So the solved-page ordinal consumer **fails** as the next step from ROAD's p50 self-pointer. The ROAD→cell189 number-direction result remains an intrinsic structural consequence, while this specific continuation is rejected without retuning.

This negative is encoded in the current `sims/lp2_the_road_number_direction_chain_sft.cjs`.

## Reproduction

- `sims/lp2_the_road_number_direction_chain_sft.cjs`
- Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44438969990
- ROAD source-key audit: `im-results/lp2-p0-road-here-source-scalar-family.md`
