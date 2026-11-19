# ALL-AROUND [3,27] power transform does not decode the p50 circumference into p55

**Agent10, 19 November 2026. Classification: source-selected finite negative. No p55 plaintext or key recovered.**

## Why this branch was tested

A new first-party route now fixes three ingredients before p55 is opened:

1. the authenticated 2013 sentence **THE KEY IS ALL AROUND YOU** has canonical GP0 252 and selects p50 outer-ring cell252;
2. that cell is the unique token `30`, whose base60 value180 equals the table interior and the known p56+p57 register, leaving the 76-cell circumference aligned in size with p55;
3. the same historical route reaches p53 and supplies the ordered power pair `[3,27]`, independently reproduced on p28 as the value-changing transform that yields `READ OUT`.

This suggests a narrow missing test: perhaps the value-changing power operation, rather than the already rejected raw/divmod circumference values, is the p55 key.

## Frozen operation

The p28 operation has a source-selected singleton followed by one source object:

```text
selected first value ^3
all values in the following object ^27
```

Mirror that geometry on the independently selected p50 circumference:

- start at source-selected outer cell252;
- reduce each authenticated base60 byte modulo29;
- exponentiate the first residue by3;
- exponentiate the remaining 75 circumference residues by27;
- charge the two physical ring directions because the source says AROUND but does not orient it;
- use the resulting 76-rune GP29 stream only as a direct additive key under the three conventional registers;
- charge all eight masks over p55's three visible ciphertext F positions, matching the solved-p56 precedent that literal-F bypass can consume no key.

The opposite exponent order `27 then 3` is retained only as a control, not another primary hypothesis.

The SFT first reproduces the exact native positive:

```text
[9,28,24,10,1,20]
 -> [^3,^27,^27,^27,^27,^27]
 -> [4,28,23,3,1,16]
 -> READOUT
```

and synthetic native-GP round trips pass for every additive register.

## Original p55 result

The direct source-order transformed circumference itself is nonprose in both directions. It matches the visible p55 ciphertext at only:

```text
clockwise        1 / 76
counterclockwise 4 / 76
```

The complete primary decoder family is:

```text
2 directions
x 3 additive registers
x 8 literal-F bypass masks
= 48 source-order variants
```

No primary variant recovers the conditional six-rune `OUR OWN` footer. The best reaches only **2/6** footer runes. No whole-page candidate is remotely prose-like; the highest IoC candidates remain visibly ciphertext-like.

The 48 reversed-exponent controls are recorded separately and are not used to rescue the source-order failure.

## Decision

Retire this exact branch:

```text
ALL AROUND
 -> cell252 / 76-cell p50 circumference
 -> base60 residues mod29
 -> source-order [3,27] power geometry
 -> direct additive p55 key
```

The new `[3,27]` value-changing operation does **not** rescue the already source-selected circumference as a simple p55 pad. This is stronger than the earlier raw/divmod perimeter negatives because the key transform is now independently supplied by the same historical route that selects the ring.

Do not rerun with extra rotations, arbitrary exponent schedules, mixed H coordinates, fitted token projections or tuned word cribs unless another first-party clue selects that added operation. The 76/180 framing remains strongly source-supported; what is still missing is a source-selected **non-direct** operation connecting the table circumference to p55.

## Reproduction

- SFT: `sims/lp2_allaround_power_perimeter_p55_sft.cjs`
- Inputs: `resources/liber-primus/base60-grid.json`, `resources/liber-primus/lp2-corpus.json`
- Upstream source route: `im-results/lp2-2013-all-around-p50-p53-receiver.md`
- Power-placement audit: `im-results/lp2-p39-outer-readout-selector.md`
