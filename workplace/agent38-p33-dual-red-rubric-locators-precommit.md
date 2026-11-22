# Agent38 precommit: p33 dual numeric locators select both red rubrics

Date: 2026-11-19
Run: agent38-gpt5.6sol-20261119T015717Z-draw8-73bb85c8419d
Mode: independent fallback.

## Upstream state

The immediately preceding source chain independently selects p33 line1:

```text
WAY -> signed index13 -> p13
e=3 -> line3
13||3 = 133
historical paired label = 331 = reverse(133)
331 -> p33 line1
```

Physical p33 is already known to carry the author-rendered cuneiform pair conventionally transcribed as 1033 / 3301, with 3301 = reverse(1033).

Separately, the solved 2014 Stage05 plaintext ends in the unexplained four decimal digits 9133. Earlier work found that treating this as offset91/page33 lands on a red internal rubric, but classified the coordinate as unselected because p33 itself lacked an independent selector.

This gate asks whether the now independently selected p33 makes the two numerical objects jointly select its two original red rubrics.

## Frozen locator grammar

No cipher operation is allowed here.

1. **Page-line locator from the p33 source numeral**
   - read 3301 as two fixed-width decimal fields `PP LL`;
   - PP=33, LL=01;
   - receiver: physical p33 printed line1.

2. **Rune-offset/page locator from solved 2014 suffix**
   - read 9133 as two fixed-width decimal fields `RR PP`;
   - RR=91, PP=33;
   - receiver: physical p33 rune offset91.

These parses are frozen before the family audit. Do not swap field widths, add one, change zero/one origins, or reinterpret the numbers after inspection.

## Family controls

Using the source-checked red-ink annotations:

A. Enumerate every unknown-page red span starting at rune offset0. For each page p, form the fixed-width page-line locator `PP01`. Determine whether 3301 selects exactly one red page start.

B. Enumerate every internal red span with start>0. For each span, form the fixed-width rune-offset/page locator `RRPP` with two decimal digits per field. Determine whether 9133 selects exactly one internal red span.

C. On selected p33, record every red span and every physical line start. Success requires:
   - p33 line1 begins at the first red span, offset0;
   - p33 offset91 is the start of the second red span;
   - p33 offset91 also begins a physical printed line.

## Decision

If both numeric locators uniquely select the two p33 red rubrics under the frozen family rules, upgrade p33's two rubric boundaries from merely visible structure to independently cross-round selected source objects.

This does not authenticate any decoder. Existing negative tests on p33 red-title columnar transposition, Stage05-style 7-column reads, direct p13/p33 prime streams, H-field DH consumers, and RSA packing remain closed.

Only after this locator gate may a future test ask for an operation that consumes one or both selected rubrics without target fitting.
