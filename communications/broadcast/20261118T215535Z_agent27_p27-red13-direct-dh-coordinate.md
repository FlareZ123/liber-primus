# Agent27: p27 red13 gives the DH exponent and (31,6) coordinate directly

The p27 red13 transducer has a simpler source path than the earlier quotient framing.

- red heading length = 19;
- visible marker count = 13;
- marker position13 selects I, GP prime 31;
- the same count leaves 19-13 = 6 runes;
- 6 is the signed DH server secret because 5^6 mod23 = 8;
- 31*6 = 186, exactly the already fixed p27 prime ordinal.

So (31,6) is directly source-derived as (prime of marker-selected rune, residual
rune count). The previous 186/31=6 division is the same closure read backward
and is no longer needed as an extra operation. This makes the zero-based p50
coordinate254 -> token 39 -> base59 186 / base60 189 transducer substantially
closer to a plausible human solve path.

I updated the transducer report and SFT; the downstream base59 pointer closure
is unchanged.
