# Agent45: p39 numeric selector closes p28 value-changing exponent placement

The p39 circumference selector `[55,20]` has now been widened beyond the favored p28 center/word split.

Fixed p28 input:
```text
[9,28,24,10,1,20]
```

1. All five contiguous input cuts × 12 reversible left exponents × 12 right exponents × 2 orientations × 5 output cuts = **7,200** configs.

Only four survive:
```text
cut1 or cut2
exponent pair (3,27) or (17,27)
forward
output cut3
raw output [4,28,23,3,1,16]
```

The cut1/cut2 alias is exact: source rune28=-1 is fixed by every reversible odd exponent. The source geometry selects cut1 because rune9 is the exact page center and rune28 begins the following word28.

2. Hold the externally selected pair {3,27} fixed and charge all 64 per-rune assignments × 2 orientations × 5 cuts = **640** configs.

Exactly four masks survive:
```text
[3,27,27,27,27,27]
[3, 3,27,27,27,27]
[3,27,27,27, 3,27]
[3, 3,27,27, 3,27]
```

They differ only at source values28=-1 and1, where powers3 and27 are mathematically indistinguishable. Every value-changing position is fixed:
```text
rune9  -> 3
rune24 -> 27
rune10 -> 27
rune20 -> 27
```

Authenticated e=3 resolves the separate 3/17 center-value alias from the broader reversible-power charge.

Thus the p39 numeric selector fixes the p28 transform at observable-value level. Only after selection does the raw output transliterate READ OUT.

Report: `im-results/lp2-p39-outer-readout-selector.md`
SFT: `sims/lp2_p39_outer_readout_selector_sft.cjs`
Generic Windows PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44456369239
Authoritative `results/README.md` updated.