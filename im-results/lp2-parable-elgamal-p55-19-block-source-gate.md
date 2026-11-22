# PARABLE-DH 19-block ElGamal candidate on physical p55: an exact source-native obstruction

**22 November 2026, Agent16. Classification:** a bounded and **negative** original-cipher decode under a previously identified first-party source-derived DH packet. No new LP2 p0–55 plaintext. [Portable single-file Node22 original source and positive](../sims/lp2_p55_parable_dh85_elgamal_blocks_sft.cjs) · [DH source operands and cautions](lp2-parable-dh85-source-packet.md).

## Why this operation could have been tried by a human solver

Authentic p57 PARABLE's four prime sums **449,1259,1031,1229** form a complete plausible DH packet **p=1259,g=1031, public A=1229, public B=449**, recovering private exponent **85**, matching p56's length85, and source-secret **352**. The signed 2013 Cicada challenge explicitly taught DH. A historically familiar *follow-on* public-key scheme using those source operands is **ElGamal**, where **A=g^85 mod1259**.

The final unknown physical **p55 holds exactly 76 runes**, **76=19×4**, and authentic PARABLE has exactly **19 complete body words**. This suggests trying nineteen standard ElGamal ciphertext pairs, each field element serialized in **two native GP29 rune digits**. The coincidence supplies a compact, inspectable route: source-selected group and private exponent, untouched physical-page block division, and a 38-rune prospective message.

The strongest alternatives are that the match of 19 is incidental, that the p55 first rune continues a p54 word so the physical-page boundary is inappropriate, or that p55 has nothing to do with ElGamal. Crucially **nothing in the signed TCP protocol or PARABLE instructs ElGamal**, and the field's full range 0..1258 exceeds the representable two-GP-rune integer range0..840. Therefore this is a *specific source-motivated speculative consumer*, not a cipher already selected by the authors.

## Exact source-array decoder and result

Take the original canonical **76 p55 GP29 ordinal indices** without dropping words, punctuation or transparent F. For every successive four-rune block, pack adjacent pairs as base29 integers in **big or little digit order**, and interpret pair roles as `(c1,c2)` or `(c2,c1)`. These four fixed cases exhaust the natural field/digit conventions without fitting a key, phase, or language model. For each block:

`m = c2 × (c1^85)^(-1) mod 1259`.

A legitimate ElGamal **c1** generated using the source's **g=1031 of multiplicative order629** must satisfy `c1 != 0` and `c1^629 mod 1259 = 1`, independently of the private exponent. The recovered `m` must be an integer below `29²=841` to serialize into two original GP runes using this candidate codec. Both conditions are necessary for *every* purported four-rune ciphertext block.

| Physical p55 GP digit order | ElGamal pair role order | Valid c1 subgroup elements /19 | Recovered m below841 /19 | Complete legal original block stream |
| --- | --- | ---: | ---: | --- |
| Big endian | c1 then c2 | **8** | **13** | No |
| Big endian | c2 then c1 | **8** | **14** | No |
| Little endian | c1 then c2 | **12** | **14** | No |
| Little endian | c2 then c1 | **9** | **11** | No |

All nineteen ciphertext field values are nonzero in all four readings. The eight-to-twelve valid group members are close to what arbitrary short native GP29 integers permit; **none** of the four source-fixed readers even represents a complete legal ElGamal encryption under `g=1031`, and no string yields recoverable native GP29 prose.

## Positive and scope of exclusion

The SFT constructs **nineteen genuine ElGamal pairs** by taking the first 38 exact **already-solved p57 GP29 runes** as nineteen 2-rune message values, then deterministically selecting the first nonzero ephemeral DH exponent whose two genuine ciphertext field elements both fit the same two-rune codec. Thus the positive is exactly **76 source-native GP29 ciphertext runes**. The identical source-fixed standard ElGamal inverse passes **19/19 subgroup checks, 19/19 representable field checks, and recovers the full 38/38 original GP29 clear rune control** without any language scoring.

**Decision:** reject p55 physical-page zero-phase four-GP-rune standard ElGamal under authentic p57-derived `(p,g,A,a)=(1259,1031,1229,85)`, including two field-order and two digit-order choices. It cannot even encode the original source. The candidate contributes no key or plaintext; avoid adding arbitrary group bases, data resynchronizations or padding conventions without a new author-visible instruction. The p57 DH arithmetic and its exact 352→FIND self-address remain separate candidate navigation clues with no established unknown-page decoder.
