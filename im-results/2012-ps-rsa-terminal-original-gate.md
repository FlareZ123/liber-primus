# 2012 signed P.S. RSA modulus against short LP2 terminal pages

**Decision:** The original 2012 end-message postscript gives an exact 432-bit semiprime, but the direct, whole-page BASE29 / conventional-RSA interpretation produces **no recovered LP2 plaintext or recognizable payload**. This is a bounded original-cipher negative. It neither authenticates a 2012→2014 transfer nor excludes an unrelated use of the modulus.

## Concrete candidate and historical trigger

The [archived 2012 P.S.](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md) contains a 131-decimal-digit number:

`10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631`

The two [published prime factors](https://uncovering-cicada.fandom.com/wiki/The_Final_Puzzle) are

- `99554414790940424414351515490472769096534141749790794321708050837`
- `104593961812606247801193807142122161186583731774511103180935025763`

They multiply to the P.S. exactly. The conventional RSA public exponent `e=65537` has an inverse modulo `(p−1)(q−1)`. **The 2012 postscript itself does not print this exponent**, nor does it direct a later solver to decrypt Liber Primus under its factors. The separately authenticated 2013 TCP `BASE29` example supplies a historically familiar numeral convention, but does not specify this cross-round RSA operation.

The modulus occupies **89 digits in base29**. Among all 56 original unknown physical LP2 pages, only the **66-rune p49** and **76-rune p55** have complete canonical GP29 rune-index numerals strictly smaller than that modulus. Both occur immediately before distinct nonstandard terminal material: p49 borders the number table, and p55 borders the solved SHA-512 instruction. This is a finite source-directed pair of candidate inputs, rather than a freely selected ciphertext offset.

## Single explicit inverse and outcomes

Convert each complete original page's GP29 indices `0..28` to one integer in printed big-endian base29 order, compute `m=c^d mod N`, and inspect the fixed **54-byte** big-endian representation and native base29 representation. A reverse-order numeral is retained as the single native-order control; there is no phase, key or alphabet fit.

| Original page | GP29 digit order | Original ciphertext bits | Printable recovered bytes / 54 | Recovered bytes, first 8 hex |
| --- | --- | ---: | ---: | --- |
| p49 | printed | 321 | **22** | `47a55d352027d049` |
| p49 | reversed | 321 | **22** | `95bbdf8a32168c40` |
| p55 | printed | 369 | **17** | `02da37be27f7d1a5` |
| p55 | reversed | 368 | **21** | `1fb6ab49dbe817c2` |

Every 54-byte inverse lacks the initial zero byte required by normal RSAES-PKCS1-v1_5 and RSAES-OAEP encodings; none contains an immediately readable ASCII passage. Direct GP29 rendering is also nonlinguistic. The negative applies only to this exact serialization and public exponent. An arbitrary unknown raw-binary message is not formally excluded, but no source selects its format or the next transformation.

As a further warning against viewing these short numerals as ordinary unpadded RSA ciphertexts, if RSA encryption outputs were uniform over residues modulo `N`, the probability of obtaining a numeral that short is only approximately `3.17×10⁻³⁴` for 66 base29 digits or `1.33×10⁻¹⁹` for 76. These are conditional uniform-ciphertext measures, **not** p-values for the exploratory selection of the two pages.

## Reproducibility and disposition

[The self-contained CommonJS reproducer](../sims/lp2_2012_ps_rsa_terminal_sft.cjs) reads `resources/liber-primus/lp2-corpus.json`, asserts the archived semiprime factorization, modulus bit length, only two eligible original pages, exact RSA inverse and forward round-trip for each source input, and a deliberately planted raw RSA message. It prints byte prefixes and source-native GP29 prefixes for all four cases.

**Stop this branch:** The original 2012 P.S. does not select a post-2014 page, numeral orientation, exponent or serialized payload. The simplest human-plausible transfer fails. Reopen only on an independent signed/source instruction that names this RSA modulus as an LP2 key or fixes a different complete inverse; do not scan exponents, rune offsets, page fragments or new KDFs to rescue it. No result belongs in the authoritative plaintext record.
