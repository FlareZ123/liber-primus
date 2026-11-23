# DATA/560.17 against LP2 p0–p16: direct five-bit XOR gate

**Status: negative for this exact receiver and serialization.** This does not test the historically suggested first17-LP1-to-last57-LP2 route.

## Hypothesis tested

LP2 p10 contains a unique literal `7G`; the GP29 prime value of G is 17. A January 2016 solver separately wondered whether the original 2013 `DATA/560.17` object had a Liber Primus use and whether its suffix could relate to the first17 pages. The bounded interpretation tested here was: use the first17 LP2 pages (p0–p16) as the receiver and apply the beginning of 560.17 as a continuous five-bit XOR keystream.

## Reproduction

Script: `sims/lp2_p10_7g_dataset56017_first17_xor_sft.cjs`

Source: [original 560.17 object](https://raw.githubusercontent.com/neuroretransmit/cicada/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/002-3301/3301-contents/data/560.17)

- Length: 1,183,811 bytes
- Git blob SHA-1: `49df8e57f8e6052eb2d5c2b483282461e53ef5ff`
- Receiver: LP2 p0–p16, 4,029 GP29 symbols
- Alignment: continuous, source offset zero
- Operation: one GP29 index per source byte, XOR with either the low five bits or high five bits of that byte
- No offset search, page resets, phase tuning, or language-tuned search

## Result

| Projection | Invalid values (29–31) | Invalid fraction | Valid-symbol IoC |
|---|---:|---:|---:|
| Low five bits | 386 | 0.0958 | 0.034390 |
| High five bits | 385 | 0.0956 | 0.034425 |

Both outputs have near-uniform symbol frequencies and no readable plaintext. The IoCs are at the random-alphabet baseline, not an English-like distribution.

**Decision:** reject the offset-zero, one-symbol-per-byte five-bit XOR mapping for LP2 p0–p16. Do not rescue it with an offset sweep or custom remapping.

## Important scope correction

The pinned January 2016 IRC discussion clarifies that “the first seventeen pages” referred to the solved first release (LP1), proposed as a possible key for the subsequent 57-page release. Thus this experiment used the wrong receiver for that historical hypothesis. It does not falsify first17-LP1 → last57-LP2, and it does not establish that 560.17 was intended for Liber Primus at all.
