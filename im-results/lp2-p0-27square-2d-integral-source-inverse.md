# Opening 729-rune 27×27 square: complete keyless two-axis integral inverse

**Agent4, 23 November 2026. Classification: bounded, unfitted negative on intact original ciphertext, with a solved-native GP positive and exact reencryption. No unknown plaintext, original key, or intended decoder recovered.**

## An original-visible route independent of key hunting

The first original LP2 chapter, pp0–2 (JPEGs `17.jpg`–`19.jpg`), is visually distinguished by **two identical three-bar crosses** on each of three pages, with the artwork physically arranged as an exact **180° half-turn** around the image center. Prior independent original-image studies establish that the repeated paired crosses stop at p2, so the 3-page scope is a natural source choice. The chapter has unaltered GP29 source lengths **262+266+201=729=27×27** runes, including the original p0 13-rune red heading. This happens to form a complete two-dimensional 27×27 field without inventing a new ciphertext region.

A 2014 player might therefore try a literal square, and “within” plus the symmetric crosses suggests considering a simple *two-axis* operation. The tested candidate is a standard **two-dimensional cumulative sum**, which can camouflage a nonuniform plaintext as near-uniform GP29 values. Unlike a post-hoc secret key, the operation has an exact, keyless, reversible inverse.

The large unsupported premise is crucial: the manuscript **does not instruct a 27×27 reshaping**, prefix integration, top-left corner choice or byte-less GP29 arithmetic for this illustration. This is one source-constrained conjecture, rather than an author-authenticated cipher.

## Frozen complete reversible operation

Read the intact 729 original runes in published p0→p1→p2 order, row-major, with indices `C[r,c]` on 0≤r,c≤26. Treat indices outside the square as zero, then derive **all 729** plaintext-candidate GP29 values by the unique anchored mixed difference:

```text
P[r,c] = (C[r,c] - C[r-1,c] - C[r,c-1] + C[r-1,c-1]) mod29
```

The exact forward replay is `C[r,c] = sum(P[u,v], 0<=u<=r, 0<=v<=c) mod29`. A second predeclared orientation physically selected by the engraved half-turn rotates the entire 729-rune square **180° before the same inverse**, then rotates the result back. No fitted key, phase, word offset, punctuation change, extra digit source or cipher variation enters either fixed receiver.

## Original and authentic positive

| Test | GP29 IoC over729 symbols | Result |
| --- | ---: | --- |
| Original unchanged ciphertext | 0.034082515563997044 | Source baseline |
| Exact top-left two-axis inverse | **0.034029756251978474** | 729/729 forward replay, nonprose |
| Exact 180°-turned two-axis inverse | **0.03409758965314521** | 729/729 forward replay, nonprose |
| Independently clear native p57 | **0.06270996640537514** (95 runes) | Source-native reference |

The top-left original decoder begins (hyphen-separated GP multigraph transliteration):

```text
S-OE-I-X-O-P-H-TH-S-J-NG-O-P-Y-N-A-M-R-J-J-I-G-OE-W-N-E-I-N-IA-Y-C-A-IA-U-G-U-EA-EO-E-OE-EO-EO-D-AE-F-I-NG-E-X-F-M-AE-EA-OE-EA-EA-IA-M-R-O
```

The 180° receiver likewise remains nonprose and flat. As an independent implementation check, an actual **95-rune solved p57** source is repeated into a complete 729-cell *native positive plant*, forward two-axis integrated and correctly recovered **729/729**. Both original candidates are exactly replayed to the unchanged first three original LP2 pages, so the negative outcome is a plaintext-language gate rather than a coding failure. Complete unchanged original outputs are deterministically regenerable from the source.

**Reproducer and CI:** [standalone read-only Node22 CommonJS SFT](../sims/lp2_p0_27square_2d_integral_source_sft.cjs) with original `resources/liber-primus/lp2-corpus.json`; [successful Windows Node22 action 45246268328](https://github.com/FlareZ123/liber-primus/actions/runs/45246268328).

## Decision

**Retire this complete keyless 27-square two-axis integral receiver, in both source-geometric directions.** Neither recovered native sentence text or an independent clue; both outputs remain virtually uniform. This does not eliminate other 3D, bit-level, 27-grid, 29-rune, or nonperiodic keyed operations, for which the source must provide an executable selector. No new original LP2 plaintext or destination is claimed.

The previously documented raw first-chapter half-turn and 27-grid branches remain intact; this test specifically adds the *mixed two-dimensional derivative* rather than repeating mere reversing, additive prime shifts or symbolic square labeling.
