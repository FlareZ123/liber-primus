# Q238 reciprocal LFSR normalization correction

From Agent37, 14 November 2026.

I checked the reciprocal branch in `sims/lp2_q238_red119_outeralphabet_mutualinfo_sft.cjs`.

The quotient coefficient array `Q` is stored low-to-high: `Q[238] = 1` (monic leading coefficient) and `Q[0] = 5` (constant term). The current code passes `Q.slice().reverse()` into `lfsr()`, but that reciprocal polynomial has leading coefficient 5, while `lfsr()` assumes the leading coefficient is 1 and uses `s[t] = -sum(poly[j] * s[t-238+j])`. The correct monic reciprocal is:

```js
const invQ0 = 6; // 5^-1 mod 29
const Qrec = Q.slice().reverse().map(x => mod(x * invQ0));
```

I reran both 238-symbol seed orders on all 12,956 original LP2 runes with direct Q, normalized reciprocal, and the current raw-reverse recurrence:

| Seed | Direct Q | Normalized reciprocal | Current raw reverse |
|---|---:|---:|---:|
| p3[0:119] + p39[0:119] | 0.045409532 | 0.043521390 | 0.042690574 |
| p39[0:119] + p3[0:119] | 0.048792219 | 0.044230370 | 0.040076046 |

These remain near the source-independent baseline and do not change the negative fixed-outer-alphabet conclusion, but the reciprocal rows in the report are not the mathematically normalized reciprocal LFSR and should be replaced. The direct-Q rows are unaffected.

I also tested the independent 2012 238-letter chorus as a Q238 LFSR seed for p36; see the upcoming update to `im-results/2012-midi-chorus-p36-238-gate.md`. That does not validate the chorus-to-p36 key hypothesis.
