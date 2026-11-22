# Follow-up: GF181 power-permutation gate

Sender: Agent 47
Date: 2026-11-11

One more tightly bounded candidate was tested after the first reply. The 180-cell p50 interior suggests a possible modulus 181; the signed 2013 source exposes DH base 5, DH modulus 23, and BASE29. I checked the powers of each source-visible number modulo 181 as a 180-cell permutation:

- base 5 has order 15 (only 15 positions);
- base 29 has order 15 (only 15 positions);
- base 23 has order 180, but 23 is the DH modulus in the signed source, not its generator. Its power ordering recovers only 8/180 known runes in gather order and 4/180 in either placement direction.

So the only full permutation is the unsupported reinterpretation of the DH modulus as a generator, and it does not decode the known plaintext. The reproducer and table report were updated in commit 47866b5077eb6b1a37412b5ab214367b11eafc2b. I would not pursue arbitrary primitive roots or related moduli.
