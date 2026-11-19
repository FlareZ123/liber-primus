# P28 page-derived exponent route to READ OUT

**Agent11, 19 November 2026. Classification: post-discovery source-only intended-route hypothesis with an exact familywise control. It simplifies the READ OUT mechanism without independently authenticating the plaintext.**

## Hypothesis

The p28 object is already independently exceptional: one-based word28 is a five-rune word beginning at center+1, and its predecessor is the exact page-center rune.

Read the two power exponents directly from the same source page:

```text
center exponent = count of printed periods on p28 = 3
word exponent   = physical page number - 1 = 27
```

The exact source object is `[9] + [28,24,10,1,20]`. The source-derived exponents give `[4,28,23,3,1,16] = READ OUT`.

Exponent27 is also GP29 multiplicative inversion for nonzero values, so this is equivalent to cubing the center and reciprocal-inverting the word.

## Controls

The dynamic rule was applied to all **314** complete five-rune predecessor objects in unknown p0..p55. Two outputs parse under the finite register already used by the p28 phrase-family audit: p5 word37 `PUT ATT`, and p28 word28 `READ OUT`.

The source geometry further preselects the **page-numbered five-rune** family. There are nine such objects:

| page | periods | word exponent | output | parse |
| ---: | ---: | ---: | --- | --- |
| 7 | 5 | 6 | UOEFTUP | |
| 17 | 5 | 16 | FTDTUU | |
| 19 | 3 | 18 | THAEATPL | |
| 28 | 3 | 27 | READOUT | READ OUT |
| 38 | 4 | 9 | LDBXUA | |
| 41 | 3 | 12 | STDTTU | |
| 46 | 3 | 17 | EASNGBYG | |
| 48 | 7 | 19 | UGOCAB | |
| 52 | 3 | 23 | WMEOXDOE | |

P28 is the sole phrase hit in this pre-existing geometric family.

## Interpretation

This removes the need to model the five-rune word as three cryptographic shells iterated by cubing. A human solver who had already selected p28 and its page-numbered center-adjacent word could obtain the exact exponents from two simple page-local counts.

The route remains post-discovery. The period count and page-minus-one interpretation were recognized after READ OUT had already been recovered, so the familywise result is a selectivity/control result rather than an authorship probability. There is also no explicit local artwork marking the periods as an exponent instruction.

The useful advance is a simpler plausible solve path with fewer special operations. A future prospective clue or untouched consumer must still decide whether this is the creator's intended parameter source.

## Reproduction

- `sims/lp2_p28_pageperiod_exponents_readout_sft.cjs`
- Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44437498443
- Related reciprocal decomposition: `im-results/lp2-p28-cube-reciprocal-decomposition.md`
