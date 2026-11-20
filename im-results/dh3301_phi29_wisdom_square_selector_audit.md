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

This test strengthens the proposed **page selector** but does not establish a cipher, key, or recovered plaintext. The specific DH3301 exchange is unsigned, and no authenticated instruction explicitly says to apply φ(e) mod29 as a cell address. The existing p36 direct field, phase and stream tests remain negative. The new 5×5 phi-grid consumer below is a distinct state/navigation route; it does not yield plaintext and must not be conflated with those failed field/phase/stream hypotheses.

## p36 receiver: the phi-grid emits a source-indexed DH state packet

This is a new state/navigation consumer of the 5×5 Wisdom phi-grid, not a plaintext decryption.

The signed 2016 message's zero-based word index 36 is **GOOD**. Under the already documented physical-page fragment convention (source index i selects page i and one-based local fragment i+1), this selects p36 fragment37:

\[
C=[2,22,4,1,20].
\]

The p4 Wisdom square is transformed entrywise by Euler's \(\varphi\) function and reduced modulo 29:

\[
M=\begin{bmatrix}
12&15&10&14&5\\
4&24&19&12&6\\
25&23&14&23&25\\
6&12&19&24&4\\
5&14&10&15&12
\end{bmatrix},
\qquad \det(M)\equiv28\pmod{29}.
\]

The column-vector product is:

\[
M C=[15,19,4,21,4]=[b,B,q,p-K,q].
\]

This exact ordered state packet is a singleton among all **318** five-rune physical-page fragments under the four simplest direct Hill conventions: \(MC\), \(CM\), \(M^{-1}C\), and \(CM^{-1}\). Only \(MC\) has a hit, and it is p36 fragment37. The other three conventions have no hit against the independently reconstructed state packet.

The five output values are also indices into the authenticated 2016 word list:

    15 19 4 21 4
    WORDS THEIR EMPTY IS EMPTY

This is an address/state vector, not a grammatical plaintext claim.

### The EMPTY endpoints select an H-bracketed receiver

The two endpoint values 4 select p4 fragment5, a literal one-rune **H**. The middle value 21 selects p21 fragment22:

    p4 fragment5   = [8]       = H
    p21 fragment22 = [19,7]
    p4 fragment5   = [8]       = H

Thus the tail of the matrix output selects H — [19,7] — H. Apply the already established two-dimensional transform

\[
H(x,y)=(x-y,x+y)\pmod{29}
\]

to the p21 pair:

    H([19,7]) = [12,26] = THE / NUMBERS

The output indices 12 and 26 select p12 fragment13 and p26 fragment27:

    p12 fragment13 = [28,1,0,15,20]   length 5   GP0 mod29 = 6
    p26 fragment27 = [4,19,22]        length 3   GP0 mod29 = 16

Applying the same H transform to their lengths and to their GP0 sums gives two more state pairs:

    H([5,3])  = [2,8]   = [K,A]
    H([6,16]) = [19,22] = [B,p-1].

### Independent p23 red-span state cross-check

The p36/p12/p26 route independently recovers q=4, K=2, and A=8. The first four p23 red-span fragment lengths are [2,6,3,5]. The same H operation gives:

    H([2,6]) = [25,8] = [-q,A]
    H([3,5]) = [27,8] = [-K,A]

These are exactly the p23 red-span outputs already reported in [the p23 instruction reconciliation](lp2-p23-instruction-reconciliation.md). The recovered K=2 also agrees with the [K,g]=[2,5] side object in the p25 cube route, where the p23 full-line state supplies g=5. This is cross-route state corroboration, not an additional plaintext recovery and not a change to the separate p23→p25 one-rise interpretation.

### Familywise control and stopping rule

Use every available source-indexed fragment i → page i, fragment i+1, for signed indices 0 through 42. There are 42 extant objects; p32 is the already noted missing coordinate. Charge **all 42×42 ordered pairs, including repeats**. The length channel alone is not decisive: 55 ordered pairs satisfy H(lengths)=[K,A]. In particular, the prefix [15,19] selects p15/p19; their lengths give [K,A], but their GP0 sums give [4,1], not [B,p-1].

Requiring both predeclared channels simultaneously leaves exactly one pair:

    (p12,p26) -> H(lengths) = [K,A]
              -> H(GP0 sums) = [B,p-1].

Thus the GP0-sum condition reduces 55 length-only candidates to a familywise singleton under this fixed page/fragment map and fixed H operation. As a nonrecursive continuation control, the resulting [B,p-1]=[19,22] pair selects p19/p22; that pair gives H(lengths) [0,6] and H(GP0 sums) [17,9], not the state packet. Do not keep iterating the map to manufacture a path.

The first two matrix outputs [b,B]=[15,19] also agree with the independently reported p22 Bob-state receiver in [the p21–p23 corridor report](lp2-openpgp-is-the-road-pages21-23-direction-gate.md); that is corroboration from a different segmentation convention, not part of this fragment SFT. The same p36 ciphertext's earlier H5 shell [11,21,4,23,22]=[a+g,p-K,q,p,p-1] is documented in [the GOOD36 H-shell report](lp2-good36-hshell-is-road-router.md).

### Evidence limits

- The p4 instruction to treat the totient function as sacred, the 5×5 square, the signed 2016 word map, the p4 H marker, and the p21/p12/p26 fragments are observable source material.
- The particular 2013 DH3301 participant exponent e=1661 remains from an **unsigned** transcript. Its \(\varphi(e)\bmod29\) selector is conditional; the signed 2016 word index 36 independently selects p36 under the physical-page fragment rule.
- The matrix operation is a plausible simple Hill/state transform, but no source explicitly states “multiply this matrix by this five-rune fragment.” The exact state packet and unique downstream pair materially strengthen it, but do not establish a universal cipher.
- The DH state tuple is pre-existing, not a new discovery here; see [the signed-source register](lp2-dh-state-signed-source-register.md) and [the adversarial register audit](lp2-dh-state-register-adversarial-audit.md). The exact p36 state-packet hit is absent under the adversarial audit's near-miss tuple with b and K swapped.
- This does **not** reopen the rejected 7×7 Stage10 central-row phi/Stage05 composition on the 238-rune p36 body, nor the rejected 5×5 row-wise additive masks on the 553-rune numbered cuneiform enclosure. Those are different operations and remain negative; see [the bounded 7×7 composition test](lp2-cuneiform-p36-stage05-phi-composition-gate.md) and [the five-passage additive-mask audit](lp2-cuneiform-five-numbered-wisdom-inversion.md).
- The DH state is partly derived from the same 2014 square that supplies M, so the exact state echo is a cross-source structural fit, not an independent random sample. The signed 2016 word selector and the unique downstream dual-channel pair add discrimination, but do not remove the route's hypothesis status.
- No unknown LP2 plaintext has been recovered by this route. Preserve it as an intermediate source-selected state/navigation mechanism.

**Reproducer:** node sims/lp2_wisdom_phi_grid_p36_dh_state_route_sft.cjs.

## Human solve-path hypothesis and next decision

A plausible player-visible path is: recover the DH3301 client exponent class; encounter the Wisdom page's prime/totient clue and its 5×5 square; test the six exponent representatives under φ(e) mod29; notice that only one-based cell 21 yields a prime; then use 151's prime ordinal to identify p36. This path is substantially more discriminating than selecting 1661 by inspection, but its key dependency remains the unsigned participant transcript and the inferred cell-address rule.

**Next:** determine whether the new p36/p12/p26 state packet supplies a source-selected reversible operation for a fresh LP2 receiver. Do not treat the source-index vector as plaintext, recursively iterate the failed p19/p22 continuation, or widen the Hill/phase family without a new clue.

**Reproducer:** node sims/dh3301_phi29_wisdom_square_selector_sft.cjs.