# Recovered 2012 P.S. RSA private key as a frozen p55 BASE29 inverse

**Result:** no unknown Liber Primus plaintext. This investigates one exact use of an authentic, independently published earlier Cicada number as key material, without arbitrary key fitting.

## Historical input

The signed 2012 Valēte! message ends with a multiline 131-digit decimal **P.S. number**. Participants previously factored it into two 216-bit primes and published a recreated RSA private key. This is a historically known factorization, **not a new cryptanalytic factorization**. See the original-source-oriented [2012 archive](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2012/011-valete/README.md) and [Cicada wiki's factored 2012 P.S.](https://uncovering-cicada.fandom.com/wiki/The_Final_Puzzle).

The public decimal number is

```text
1041279065891998535982789873959431895640
442510695567564373922695237268242385295908173
9834390370374475764863415203423499357108713631
```

It is exactly the product of

```text
p =  99554414790940424414351515490472769096534141749790794321708050837
q = 104593961812606247801193807142122161186583731774511103180935025763
```

Both have 216 bits, so the RSA modulus has 432 bits. An exponent of **65,537** is conventional RSA practice; Cicada's signed P.S. does **not** declare an exponent or ask readers to apply it to Liber Primus. With the conventional exponent, `d=e^(-1) mod ((p−1)(q−1))` is directly computable.

## Original-source operation and outcome

The original terminal encrypted LP2 physical page **55** contains **76 Gematria Primus runes**. Under the authentically demonstrated 2013 BASE29 convention, interpret their **original printed rune indices, first rune most significant**, as one integer `C`. This source-derived input is 369 bits, below the 432-bit signed-2012 modulus, and therefore eligible for literal RSA private exponentiation. One precise test is `M=C^d mod N`, without ciphertext rearrangements, guessing data offsets or adding salt/nonce/key searches.

The output is **54 bytes**, with 17 printable ASCII characters (ASCII 32–126), and begins `02 da 37 be 27 f7 d1 a5 d3 15 b4 2e ee ef 52 b0`. Re-expressing the integer in BASE29 produces 88 GP symbols beginning `W H L U H R U S E T X G L EA Y EO ...`, which is not direct native GP prose. The recovered 54-byte integer has no ordinary ASCII or recognized immediately usable source instruction. The recovered **first octet 0x02** also violates the mandatory `Y=0x00` leading-octet invariant of standard RSAES-OAEP encoding, the scheme explicitly used in Cicada's authenticated 2014 RSA challenge. Thus this exact p55/2012-key transfer is **cryptographically incompatible with ordinary RSAES-OAEP**, independent of an English recognizer. [RSAES-OAEP decoding specification](https://www.rfc-editor.org/rfc/rfc8017.html#section-7.1.2). A second, fully solved original p56 control yields similarly opaque RSA-output bytes, and a planted RSA test correctly decrypts and re-encrypts.

The private key's authenticity is limited to the **known historical 2012 modulus and its valid factorization**; the proposed 2012→2014 connection remains unsupported. In particular, p55's BASE29 integer is only 369 bits. For an ordinary *uniform residue* `C mod N`, the probability that it fits within 76 BASE29 digits is exactly `29^76/N ≈ 1.3325413761581×10^-19`, with `N` the historical 432-bit modulus. This is a **conditional bit-length mismatch for an ordinary full-width RSA ciphertext**, not a discovery-wide hypothesis probability; a nonuniform or deliberately truncated representation remains possible but would require a source-specified codec. This experiment closes only the **single frozen, direct conventional-RSA, big-endian BASE29 page55 test**, without ruling out nested ciphertext, alternate authored encryption, or other historical uses of the P.S. number.

**Cross-round RSA key check:** The distinct 2014 Cicada OutGuess RSA-OAEP modulus printed beside explicit `e=65537` is `7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639`. Its greatest common divisor with the 2012 P.S. modulus is **1**. Therefore no 2012 RSA private factor is reused by that known 2014 key; the community independently factored both, and this relation supplies no LP2 plaintext. [Source of 2014 RSA modulus and exponent](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282014%29).

## Reproduction

Source-exact CommonJS single runnable test: [`sims/lp2_p55_2012_ps_rsa_source_gate_sft.cjs`](../sims/lp2_p55_2012_ps_rsa_source_gate_sft.cjs), standard Node 22 BigInt only, using [the original GP index corpus](../resources/liber-primus/lp2-corpus.json). It asserts the exact factorization, 2012 RSA inverse, original p55 rune count, ciphertext domain, 54-byte output, direct opaque byte prefix, p56 control, and planted RSA round-trip. Because the historical modulus was already factored, this is inexpensive and requires no cryptographic key search. [Successful Windows Node 22 original-source CI run 43249553297](https://github.com/FlareZ123/liber-primus/actions/runs/43249553297) includes this RSA direct test and the two previously established original-input regressions.

**Decision:** do not spend further time brute-forcing RSA block offsets, alternative exponents or arbitrary ciphertext page concatenations without a distinct, original-source selector.