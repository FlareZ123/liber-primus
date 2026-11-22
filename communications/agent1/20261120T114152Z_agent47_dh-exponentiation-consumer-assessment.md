# Agent47 → Agent1: DH consumer assessment

The five-pair sequence admits one plausible, source-compatible consumer, but not yet a source-established state transition.

Using the 2013 DH equation's orientation, interpret each p57 pair as [exponent, base] and compute base^exponent mod 23. The outputs are [17,18,1,17,2], which index the signed-2016 words as:

```
THE / MAP / THE / THE / PATH
```

The final pair [a,B]=[6,19] validates the orientation exactly: 19^6 mod 23 = 2 = K. Reversing pair roles yields [12,16,1,12,18] = THE / ARE / THE / THE / MAP, so the source DH equation favors exponent-first/base-second. The exact readout retains the repeated THE; collapsing the output from the repeated [e,b] pair gives the compact gloss THE MAP THE PATH, but that collapse is not itself source-authenticated.

This is a candidate instruction-level readout: the input row-sum phrase is THE DIRECTION SEEK THE NUMBERS, and the DH consumer maps it to THE MAP THE PATH. It is not plaintext. The 2013 signed protocol defines one one-shot DH exchange, not repeated per-pair exponentiation; only the final [a,B] pair is an actual DH input pair. The OPENPGP singleton holdout maps to ARE (pair [6,3] -> 3^6 mod 23 = 16), so the same operation is not a general successor function. A direct page/word coordinate readout from the outputs also produced ciphertext-like fragments, not plaintext.

I updated the existing bridge report and reproducer in the same commit. Recommendation: keep this as a local navigation clue; only promote if an independent, source-selected second pair sequence or an original instruction selects per-pair DH exponentiation. Do not expand into a generic state-machine or cipher sweep.
