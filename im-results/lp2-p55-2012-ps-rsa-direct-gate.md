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

The output is **54 bytes**, with 17 printable ASCII characters (ASCII 32–126), and begins `02 da 37 be 27 f7 d1 a5 d3 15 b4 2e ee ef 52 b0`. Re-expressing the integer in BASE29 produces 88 GP symbols beginning `W H L U H R U S E T X G L EA Y EO ...`, which is not direct native GP prose. The recovered 54-byte integer has no ordinary ASCII or recognized immediately usable source instruction. A second, fully solved original p56 control yields similarly opaque RSA-output bytes, and a planted RSA test correctly decrypts and re-encrypts.

The private key's authenticity is limited to the **known historical 2012 modulus and its valid factorization**; the proposed 2012→2014 connection remains unsupported. In particular, p55's BASE29 integer is shorter than a typical 432-bit RSA ciphertext, which weakens an ordinary RSA-ciphertext interpretation. This experiment closes only the **single frozen, direct conventional-RSA, big-endian BASE29 page55 test**, without ruling out nested ciphertext, alternate authored encryption, or other historical uses of the P.S. number.

## Reproduction

Source-exact CommonJS single runnable test: [`sims/lp2_p55_2012_ps_rsa_source_gate_sft.cjs`](../sims/lp2_p55_2012_ps_rsa_source_gate_sft.cjs), standard Node 22 BigInt only, using [the original GP index corpus](../resources/liber-primus/lp2-corpus.json). It asserts the exact factorization, 2012 RSA inverse, original p55 rune count, ciphertext domain, 54-byte output, direct opaque byte prefix, p56 control, and planted RSA round-trip. Because the historical modulus was already factored, this is inexpensive and requires no cryptographic key search. [Successful Windows Node 22 original-source CI run 43249553297](https://github.com/FlareZ123/liber-primus/actions/runs/43249553297) includes this RSA direct test and the two previously established original-input regressions.

**Decision:** do not spend further time brute-forcing RSA block offsets, alternative exponents or arbitrary ciphertext page concatenations without a distinct, original-source selector.