# Large punctuation counts form a source-number route dictionary

**Agent43, 19 November 2026. Classification: source-index/readout advance.** The complete original large-punctuation size alphabet is `{10,13,23}`. Under the already established zero-based authenticated 2016 numbering, those three visible counts are exactly `PRIMUS, WAY, ROAD`. The four 10-dot glyphs contain 40 dots total, selecting `PATHS`. The two 10-dot glyphs bracketing the p36-p38 numbered block contain 20 dots total, selecting `MEANING`, the independently recovered local p36 target.

This is a navigation/readout result. It does not decrypt unknown body text by itself.

## Source facts

The original-raster punctuation census establishes **36** large compound marks:

```text
10-dot:  4 occurrences
13-dot: 31 occurrences
23-dot:  1 occurrence
```

No other large-dot size occurs.

The four 10-dot marks are:

```text
p36 offset99   red
p38 offset186  red
p49 offset66   red
p56 offset45   red
```

The original-image geometry audit independently fixes the 10-dot shape as column signature `(3,4,3)`, the 13-dot shape as `(4,5,4)`, and the 23-dot family as a distinct larger stencil. This report uses only the visible dot counts for source indexing.

## Complete size alphabet as source indices

The authenticated 2016 source is already used throughout the current route under zero-based word numbering.

Read each member of the complete large-punctuation size alphabet as a source index:

```text
10 -> PRIMUS
13 -> WAY
23 -> ROAD
```

These are three central route words from the authenticated instruction:

```text
LIBER PRIMUS IS THE WAY.
...
THEIR MEANING IS THE ROAD.
```

The mapping is complete over the manuscript's large-punctuation size classes. No size class is discarded and no alternative index origin is introduced.

## Multiplicity gives PATHS

The complete 10-dot class has four members:

```text
4 * 10 = 40
source index40 = PATHS.
```

This adds the warning-route noun:

```text
BEWARE FALSE PATHS.
```

The corresponding class totals for 13-dot and 23-dot marks are 403 and 23. Only 23 remains within the 43-word authenticated source range, so this report does not invent a modulus to force the 13-dot class total back into the source.

## The p36-p38 bracket pair gives MEANING

Two of the four 10-dot marks visibly bracket the authored five-section packet across physical p36-p38:

```text
opening 10-dot mark on p36
sections 1,2,3,4,5
closing 10-dot mark on p38
```

Their visible total is:

```text
10 + 10 = 20
source index20 = MEANING.
```

This freezes the target of the separate p36 local inverse before its ciphertext is scored:

```text
p36 section1 receiver [20,2,12,22]
visible target index20 = MEANING
visible local key alphabet {1,3,4}
unique key/sign in 162 target-frozen operations
[20,2,12,22] - [1,3,3,1]
= MEANING.
```

Thus the same punctuation object participates in two independently reproducible readouts:

```text
one bracket count10 -> PRIMUS
two bracket total20 -> MEANING
```

The existing numbered-section readout already uses the one-bracket anchor:

```text
10 -> PRIMUS
10+1..5 -> IS THE WAY ITS WORDS.
```

The local p36 inverse then consumes the pair total20 and the 10-dot column geometry.

## Compact dictionary

The source-visible punctuation counts now supply:

```text
10  PRIMUS   one 10-dot glyph
13  WAY      one 13-dot glyph
20  MEANING  p36+p38 bracket total
23  ROAD     one 23-dot glyph
40  PATHS    total dots in the complete 10-dot class
```

The first four values are single-glyph or explicitly paired-block operands. The 40 readout is a global class-total observation and should remain one evidence level lower until an independent consumer specifically requests all 10-dot marks.

## Decision

Preserve the direct class-size identities

```text
10 -> PRIMUS
13 -> WAY
23 -> ROAD
```

as a source-number dictionary because they exhaust the complete large-punctuation size alphabet under an already fixed source-index convention.

Preserve

```text
10+10 -> MEANING
```

as a stronger block-local consequence because the two marks visibly bracket one authored object and the result independently predicts the p36 local plaintext target.

Preserve

```text
4*10 -> PATHS
```

as a promising global-class readout that lacks a separate instruction selecting class-total multiplication.

Together these results strengthen the human solve-path model in which visible manuscript counts index the authenticated 2016 words, especially its route vocabulary.

## Reproduction

- `sims/lp2_large_punctuation_source_index_sft.cjs`
- `.github/workflows/agent43-large-punctuation-source-index.yml`
- `resources/liber-primus/lp2-ink-annotations.json`
- `resources/historical/cicada2016-4gq25-outguess.asc`
- original image geometry: `im-results/lp2-original-large-dot-glyph-geometry.md`
- original punctuation census: `im-results/lp2-original-dot-punctuation-physical-census.md`
- numbered bracket readout: `im-results/lp2-numbered-sections-primus-words-readout.md`
- local p36 inverse: `im-results/lp2-p36-section1-meaning-state-inverse.md`
