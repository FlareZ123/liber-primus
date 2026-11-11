# DH3301 six-representative φ(e) mod 29 Wisdom-square selector audit

**Classification: positive, discriminating page-selector evidence; not a decryption.** Under the proposed one-based row-major rule, exactly one of the six DH3301 exponent representatives selects a prime-valued cell in the 5×5 Wisdom square: e=1661 → φ(e) mod29 = 21 → cell 21 = 151 → 36th prime → p36.

## Evidence and provenance

- The GPG-verified signed 26-Jan-2013 TCP-server source authenticates the general BASE29/DH/NEXT protocol. It does **not** authenticate the specific DH3301 participant exchange.
- The client share / server base data used here (base=2757, modulus=3301, client public share=2800, server secret=331) come from the separately archived **unsigned participant transcript**, summarized in [the DH11 field report](lp2-2013-base29-dh11-field-power-gate.md). This distinction is material.
- The 5×5 Wisdom square is the derived row-major transcription [05-square.txt](../resources/external/derived/2014-stage04/05-square.txt), also discussed in [the 2013 Wisdom / 2014 Stage04 source-bound report](2013-wisdom-2014-stage04-256bytes-lp2-bound.md). The Wisdom source foregrounds primes and the totient function, motivating—but not proving—the proposed operation.
- Canonical LP2 page lengths come from [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json).

Pinned Git blob SHA-1 values:

| Input | Git blob SHA-1 |
|---|---|
| Signed 2013 TCP source note | 75fb7d95e90e4a920328ed645de930f68b71c22a |
| Unsigned DH3301 arithmetic report | 1e7218c8a51673a22544283e28dde923b013ff10 |
| 5×5 square transcription | f081bf3bd3cb45b55359fa0e8961b1f033aa10c7 |
| LP2 corpus | 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 |
| Wisdom / Stage04 source-bound report | db39dc4d7d19b2567c1145ecbf0349e6df5ef843 |

## Frozen DH and selector calculation

The six ordinary-range representatives are e=11+550k, k=0,…,5. Modular arithmetic verifies 2757^e mod 3301 = 2800 for every representative. The base has order 550: 2757^550 mod3301 = 1, while exponents 275, 110 and 50 do not produce 1. The server-side checks also reproduce public share 1264 and shared secret 1067 using server secret 331.

For each representative, compute Euler's totient φ(e), reduce it modulo 29, and use that residue as a **one-based** row-major cell number in the 25-cell square:

| DH exponent e | φ(e) | φ(e) mod29 | One-based cell | Cell value | Prime? | Prime rank |
|---:|---:|---:|---:|---:|---|---:|
| 11 | 10 | 10 | 10 | 18 | No | — |
| 561 | 320 | 1 | 1 | 272 | No | — |
| 1111 | 1000 | 14 | 14 | 245 | No | — |
| **1661** | **1500** | **21** | **21** | **151** | **Yes** | **36** |
| 2211 | 1320 | 15 | 15 | 226 | No | — |
| 2761 | 2500 | 6 | 6 | 366 | No | — |

The selected value 151 is the 36th prime. Physical page 36 contains exactly 238 runes, matching the degree of the unique monic irreducible factor R238 of the original p50 table polynomial. The same 151 also appears at the square's symmetric cell 5; cells 5 and 21 are the endpoints of its anti-diagonal.

## Indexing sensitivity and limits

The one-based convention is natural for a human reading a printed grid, but it is still an assumption. If the residue is treated as a zero-based array index instead, the six values become 226, 138, 226, 131, 18 and 199. Two are prime (131 and 199, prime ranks 32 and 46), so the selector is no longer unique. The proposed rule therefore depends materially on ordinary one-based cell numbering.

This test strengthens the proposed **page selector** but does not establish a cipher, key, or recovered plaintext. The specific DH3301 exchange is unsigned, and no authenticated instruction explicitly says to apply φ(e) mod29 as a cell address. The existing p36 direct field, phase and stream tests remain negative; the selector must not be used to rescue those mechanisms or justify unconstrained phase/key searches.

## Human solve-path hypothesis and next decision

A plausible player-visible path is: recover the DH3301 client exponent class; encounter the Wisdom page's prime/totient clue and its 5×5 square; test the six exponent representatives under φ(e) mod29; notice that only one-based cell 21 yields a prime; then use 151's prime ordinal to identify p36. This path is substantially more discriminating than selecting 1661 by inspection, but its key dependency remains the unsigned participant transcript and the inferred cell-address rule.

**Next:** seek an independent original-source clue that specifies how the selected p36 / R238 material acts on unknown LP2 ciphertext. Do not extend the already-negative p36 phase, power-11, or field-stream searches without such a selector.

**Reproducer:** node sims/dh3301_phi29_wisdom_square_selector_sft.cjs.