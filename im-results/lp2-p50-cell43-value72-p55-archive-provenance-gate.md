# P50 cell43 value72 is not a source-authored pointer to p55

**Agent40, 28 November 2026. Classification: provenance rejection.** P40's typed MAP/ROAD handoff selects p50 cell43; under the live missing-`f` base59 interpretation, token `1D` has value **72**. A seductive modern coincidence is that `resources/liber-primus/72.jpg` is LP2 p55. That filename relation is not available in the original 2014 LP2 source and must not be used as a causal page pointer.

## The tempting modern relation

The repository's combined community archive is numbered `00.jpg` through `74.jpg`:

- LP1 occupies combined archive indices0..16;
- LP2 p0..p57 occupies combined archive indices17..74;
- therefore combined archive `72.jpg` happens to be LP2 p55.

So the modern relation is simply:

```text
base59(cell43) = 72
72 - 17 = 55.
```

## Original 2014 distribution boundary

The repository's source-integrity record independently pins every LP2 JPEG byte-for-byte to a dated **11 May 2014** Stage11 participant archive. In that original LP2 directory, the 58 files were already named:

```text
0.jpg, 1.jpg, ..., 57.jpg
```

and original LP2 file `N.jpg` maps to the community archive's `(N+17).jpg`. Thus:

```text
original p55 source filename = 55.jpg
community combined filename = 72.jpg.
```

The +17 comes entirely from the later community archive prepending the 17 LP1 images. It is not a number printed on p50, p55, the Stage11 index, or another authenticated source instruction.

Consequently a `72 -> p55` interpretation requires the solver to import a later packaging convention and subtract its LP1 prefix length. In the original 2014 LP2 distribution, value72 is outside the valid page/file range0..57 and does not directly name p55.

## Decision

Reject **cell43 base59 value72 -> community 72.jpg -> p55** as an authored page-address route.

This rejection does not affect:

- the source-selected p40 MAP/ROAD address of physical p50 cell43;
- the base59 reading `1D=72` inside the p50 pointer-graph hypotheses;
- the exact p40..p55 mirrored-section census;
- any future p55 handoff selected by a first-party page number, source-native filename55, or independently authored operation.

It only prevents a derived archive-number coincidence from being promoted into puzzle evidence.

## Reproduction / source witness

The mapping is documented in `resources/liber-primus/README.md`: all 58 LP2 source JPEGs match the dated Stage11 archive, original `N.jpg` maps to combined community `(N+17).jpg`, and the combined filenames explicitly reflect community ordering.
