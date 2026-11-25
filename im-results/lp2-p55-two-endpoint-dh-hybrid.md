# p55 two-endpoint DH / hybrid ElGamal receivers

**Agent 5, 25 November 2026.** Conditional negative. No unknown plaintext or authenticated key.

## Source and fixed operations

The solved p57 SHED instruction motivates the established page-local p55 split: exclude the incoming NG carry, then remove the first and last rune of each of 16 complete printed groups (32 shell and 43 interior runes). The provisional [base59 fixed point](lp2-p55-base59-elgamal-fixedpoint.md) suggests modulus59; the p28 DH candidate supplies g=5 and a=6. In GF(59), 5 generates the order-29 subgroup. Represent GP29 index i by 5^i.

Two group constructions couple **both** endpoints to the payload, unlike the [one-endpoint vector](lp2-p55-base59-word-elgamal-gate.md), [whole-integer base23 quotient](lp2-p55-base59-elgamal-fixedpoint.md#packed-dh23-continuation-full-quotient-digit-receiver-agent45-25-november-2026), or [interior cube](lp2-p55-dh-cube-43interior-receiver-gate.md):

- DH: first/last indices u,v represent public shares 5^u and 5^v. The agreed element is 5^(uv); divide each interior ciphertext element by it, yielding P=C-k mod29, k=uv mod29.
- Hybrid ElGamal: first/last indices u,v are the two components of an encapsulated key under private exponent6. Recover k=v-6u mod29 and divide each interior ciphertext element by 5^k. Re-encapsulate v=k+6u mod29.

No phase, key, sign or group order was fitted. The equations are independent of the chosen order-29 generator when the same generator defines the exponent coordinates. A common multiplicative pad per packet is an inferred toy receiver, not an authenticated instruction or a secure modern KEM/DEM.

## Original inversion

| Fixed construction | 43-rune interior IoC | 59-rune key+payload IoC |
|---|---:|---:|
| DH | 0.0287929125 | 0.0333138515 |
| Hybrid ElGamal | 0.0343300111 | 0.0379894798 |

```text
DH keys:
U D C IA F EA U F IA P X N S EO D AE
DH interior:
E N X H AE R IA A B C IA EA P N E F R EO W L M S D IA P I X R AE NG F NG G O OE OE N T IA W OE B OE

ElGamal keys:
TH X OE OE U L Y TH M R NG D I P H A
ElGamal interior:
B H M P U N Y D T R TH O B P OE R H T J A D P NG AE J E OE Y E X OE X NG E H H A S Y G NG O D
```

Neither interior nor interleaved key+payload gives sustained intelligible text, without requiring intact printed words. If keys are retained as leading plaintext runes in their respective groups, the five length-two source groups become singletons D,C,EA,P,S or X,OE,L,R,I: zero or one in permissive A/I/O/T. The ElGamal singleton check follows from the earlier all-exponent one-nonce gate and is not independent corroboration.

All 75 local symbols re-encrypt exactly with retained endpoints, plus unchanged NG carry gives 76. This does not recover all 76 as message symbols. In DH, zero exponents can erase a share if only the agreed element is retained; both endpoints are retained here. Two disjoint 43-rune clear p57 slices per construction, framed to original interior lengths, recover 172/172 payload runes over four controls and restore all 300 packet runes. These are constructed algebraic tests, not authentication or key selection.

## Decision

The fixed endpoint-coupled receivers do not turn the provisional 17/59 selector into original plaintext. Do not broaden into arbitrary session-key derivations, encryption modes or transports absent independent source instructions. Issue #41 remains unresolved. The novel operation is coupling both endpoints to a payload key, not another private-exponent sweep.

Reproduce with [the CommonJS SFT](../sims/lp2_p55_two_endpoint_dh_hybrid_sft.cjs). The exact function was executed in connected V8 against the corrected transcription; the Node wrapper has not been run in CI.
