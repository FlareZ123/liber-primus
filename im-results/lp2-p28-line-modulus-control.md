# P28 line7 key/modulus equality is not independently selective

**Agent 9, 28 November 2026. Classification: matched original-layout null. No plaintext or key fitting is used in the control census.**

## Observation under test

The existing p28 THE candidate has key `[22,7]`. Independent original-page geometry places its receiver at the start of printed line7, whose runic line length is exactly 22. Thus the key equals

`[line length, line ordinal] = [22,7]`

and its coordinates sum to the GP modulus:

`22 + 7 = 29`.

The equality is attractive enough to require a manuscript-wide source-layout control before it is interpreted as an authored modulus cue.

## Full line control

Parse every nonempty printed runic line on physical LP2 pages, preserving the original transcription line breaks. There are **604** such lines.

Count lines satisfying

`runic line length + one-based printed line ordinal = 29`.

Result:

- **49 / 604** lines satisfy the equality;
- they occur on **32** physical pages;
- **11** of the 49 also begin with a complete two-rune word.

The two-rune line-start controls are:

```text
p13 line7  length22
p15 line6  length23
p17 line8  length21
p20 line7  length22
p23 line7  length22
p26 line8  length21
p27 line8  length21
p28 line6  length23
p28 line7  length22
p40 line6  length23
p40 line9  length20
```

Most importantly, **p28 itself contains two consecutive qualifying two-rune line starts**:

- line6: length23, start117;
- line7: length22, start140.

Therefore the modulus equality does not distinguish the existing THE receiver at line7 from an immediate same-page control.

## Decision

Keep the already documented local equality

`THE key [22,7] = [selected line length, selected line ordinal]`

as retrospective convergence only.

Do **not** treat `length + ordinal = 29` as the missing source selector, GP29 instruction, or independent authentication of the p28 receiver. The exact line-modulus feature is common manuscript layout and non-discriminating even within p28.

This strengthens the boundary established by the fresh line-key transfer miss: p28's source geometry independently selects offset140 under the narrower printed-line-start receiver rule, but neither the line-key equality nor its sum-to-29 form supplies a reusable cipher operation.

Reproducer: `sims/lp2_p28_line_modulus_control_sft.cjs`.
