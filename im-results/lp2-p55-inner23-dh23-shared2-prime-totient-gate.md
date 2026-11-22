# p55 inner23 / DH(23) and outer52 p56 transfer: no plaintext

**Agent9, 15 November 2026. Classification: source-motivated cross-round transfer; one exact arithmetic match and one bounded negative original-cipher consumer. No unknown plaintext or LP2 key recovered.**

## Fixed original inputs

The solved p57 PARABLE says to “shed our own circumferences” and “find the divinity within.” The existing original-image/transcription study [p55 recursive circumference register](lp2-p55-recursive-circumference-23-register.md) parses the 16 complete words on p55 (excluding the one-rune carry from p54) and removes two runes from each word's ends. Its second peel is the exact 23-rune register:

`G D A B F X I M U C P H NG D IA I G X EO TH TH I M`

The canonical zero-based GP29 indices are:

`[6,23,24,17,0,14,10,19,1,5,13,8,21,23,27,10,6,14,12,2,2,10,19]`

The existing circumference SFT establishes the original 23-symbol input and its uniqueness among the tested 16-word windows. It previously tested direct BASE29-integer-to-14-byte output, which was nonprintable; this note tests a different, narrowly motivated use of the same integer.

## Conditional BASE29 / DH(23) calculation

The authenticated 2013 TCP-server challenge ([source specification](../resources/external/2013-tcp-server-signed-source.md)) defines BASE29 and DH, and includes the worked `DH 23` exchange:

- modulus 23, server base 5, server public share 8;
- client public share 19;
- shared secret 2.

Treat the 23 p55 GP indices as one positional BASE29 integer:

`N = 1015521743086949888934587058926666`

As a conditional DH interpretation, use `x = N mod (23−1)` as the client's private exponent:

- `x = 4`;
- client public share `5^4 mod 23 = 4`;
- with the worked-example server public share 8, shared value `8^4 mod 23 = 2`.

This reproduces the worked example's shared value 2, but **does not independently authenticate the route**. The example's client exponent is 15 because `5^15 mod 23 = 19`; `8^15 mod 23 = 2` as well. Since `8^11 mod 23 = 1`, exponents 4 and 15 necessarily give the same shared value. A uniformly distributed exponent modulo 22 would produce this particular shared value with probability 2/22 = 1/11. More importantly, the signed protocol says the participant's server chooses its own base and secret for each request: the worked-example values 5 and 8 are not an organizer-fixed LP2 key or a source-selected server public key.

The source supports BASE29 and DH as available operations; it does not instruct the solver to treat the p55 register as a DH private exponent, reuse this illustrative server share, or use the shared value as an LP2 cipher key.

## Two frozen direct consumers: the solved p56 prime-totient cipher

A natural direct test is whether the 23-rune register itself is ciphertext under the already verified p56 prime-minus-one cipher, starting at the first prime 2. Use the exact p56 transparent-F rule: literal plaintext F emits F without consuming a prime; a ciphertext F may alternatively be an encrypted non-F and consume the next prime. The 23-rune input has one ciphertext F, so there are exactly two legal masks:

| F interpretation | Prime symbols consumed | Inverse output, GP transliteration |
|---|---:|---|
| F encrypted as non-F | 23 | `C NG L J M TH D U H G EO U I I I T G EO R M B M A` |
| F literal / transparent | 22 | `C NG L J F R IA O EO EO X W X EO X OE EO X I D M AE EA` |

Neither output is a coherent plaintext. The implementation also runs the same inverse against the established 85-rune p56 ciphertext and its independently known plaintext; the original p56 positive control passes exactly (including its five ciphertext-F positions and established literal-F mask).

### The removed circumference52 as ciphertext

The same p55 word peel leaves 52 removed runes: 32 from the first circumference and 20 from the second. Freeze their serialization as **outer layer first, then inner layer**; within each original word read the left edge before the right edge, with a one-rune residual read once. This is the direct layer-by-layer order of the source-visible peel, not a permutation search.

- Outer layer 1 (32): `AE W S B X M S AE F U W R B EO M F B C EO E EA S E S TH OE C X D U B I`
- Outer layer 2 (20): `M I EO TH IA C EA L S P H EO E G S E EA C J E`
- Combined outer52: `AE W S B X M S AE F U W R B EO M F B C EO E EA S E S TH OE C X D U B I M I EO TH IA C EA L S P H EO E G S E EA C J E`

The combined stream has ciphertext-F positions 8 and 15 (zero-based). Under the same p56 inverse, starting at the first prime 2, only **one** of the four F masks is legal: both ciphertext Fs must decode as non-F symbols, consuming all 52 primes. Its output is:

`A C J J R W EA W W TH G Y G EA TH G B O R G X A D X OE N M A TH C W AE EA B N Y T B W OE J W NG D AE J H EA C N J EO`

This is not a coherent plaintext either. The p56 known-plaintext positive control still passes exactly. Thus neither the inner23 nor the source-ordered outer52 directly decodes under the solved p56 prime-totient rule from its first-prime start.


## Decision

This rejects two direct p56-cipher consumers of the p55 circumference split: the inner23 register itself and the layer-ordered outer52 stream. The conditional BASE29→DH(23) calculation still yields shared value 2 with the illustrative server public share 8, but that value is not an independently selected LP2 key. The equality to the signed DH example's shared value is explained by the order-11 subgroup generated by 8; it is not an independently selected key. The worked DH server values are participant examples, and no source fixes the missing DH role/peer or tells how the shared value should consume LP2.

Do not sweep other DH peers, bases, exponent reductions, circumference permutations, F masks, or cipher starts to rescue this branch. Reopen only if a first-party instruction binds the p55 23-rune register to a DH role, fixes the peer/public share, and specifies how the resulting shared secret is used to decrypt an identified LP2 target. No unknown LP2 plaintext, authentic key, or destination follows from this test.

**Reproducer:** [`sims/lp2_p55_inner23_dh23_shared2_gate.cjs`](../sims/lp2_p55_inner23_dh23_shared2_gate.cjs). It reparses the original continuous transcription, asserts the exact p55 inner23 and outer52, reproduces the BASE29/DH arithmetic and all legal F branches for both streams, and checks the p56 positive control.
