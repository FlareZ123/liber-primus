# Original p55 versus the factored 2012 and 2014 Cicada RSA moduli

**Decision (13 November 2026, Agent21): negative under four source-fixed, direct GP29→RSA constructions. No unknown LP2 plaintext or key.** This tests both previously factored **432-bit** historical Cicada RSA moduli against physical p55, distinct from the earlier 2048-bit p50-table RSA checks. Neither historical clue selects p55 as its ciphertext.

## Why this is a finite source-motivated test

The [2012 Cicada closing message](https://uncovering-cicada.fandom.com/wiki/The_Final_Puzzle) includes a 132-digit P.S. decimal integer. Its publicly documented factors produce an exact **432-bit** RSA modulus:

- P = `99554414790940424414351515490472769096534141749790794321708050837`
- Q = `104593961812606247801193807142122161186583731774511103180935025763`
- N = `10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631`

`P × Q = N` is checked exactly. The separately documented [2014 RSA-OAEP challenge](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282014%29) used public exponent **65,537**. The source-native LP2 page **p55** has 76 printed GP29 runes, the first being a carry from p54; the following 75 are its complete local body. A simple direct interpretation of either segment as one big-endian base29 integer has a unique byte-independent meaning and requires no fitted symbol table.

**Weakest premise:** neither original 2012 P.S. nor the 2014 challenge instructs a solver to apply RSA to physical p55. This is a cheap historical-key transfer test, **not** an authenticated intended decipherment. The lower-bit-width of its 76-rune integer (369 versus 432 bits) makes the direct RSA-padded interpretation additionally implausible before decryption.

## Frozen inverse and result

For original rune indexes `c[0..L−1]` in canonical GP29 order, define `C = Σ c[i] × 29^(L−1−i)`, `D = 65537⁻¹ mod ((P−1)(Q−1))`, and `M = C^D mod N`. Interpret `M` as one 54-byte big-endian RSA encoded message. Both ciphertext integers are below the modulus. The source segmentation is fixed: either all 76 physical p55 runes, or its final 75 excluding the carried initial rune.

| Original p55 input | C bit length | 54-byte RSA message begins | Printable ASCII bytes | PKCS#1 padding gate |
| --- | ---: | --- | ---: | --- |
| All 76 runes | 369 | `02da37be27f7d1a5d315b42eeeef52b0` | 17/54 | fails |
| Local 75-rune body | 365 | `01150a6938b95e7a401b110e65b836dd` | 16/54 | fails |

Neither message begins with the compulsory **0x00** byte for RSAES-OAEP (the 2014 operation) or for conventional PKCS#1 v1.5 type-1/type-2 encoded blocks. Neither is self-identifying raw plaintext. Exact forward exponentiation recovers each original `C`, as it must for a correctly implemented RSA inverse; it is no evidence of the historical key. An independently constructed valid 54-byte type-2 block also encrypts/decrypts exactly as a positive arithmetic control.

**Reproduction:** [one-file Windows-compatible CommonJS SFT](../sims/lp2_2012_ps_rsa_p55_sft.cjs), using the repository's unchanged [physical LP2 corpus](../resources/liber-primus/lp2-corpus.json). The program asserts both historical factorizations, exact original page length, all four complete decrypted hex outputs, failure of first-octet padding and positive RSA block recovery.

## Independent 2014 first-onion RSA-OAEP modulus: closer historical control

The independent [2014 first-onion OutGuess message](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282014%29), decoded during the same 2014 round that later published LP2, actually specifies **RSAES-OAEP** with exponent **65,537** and a different 432-bit modulus, factored by the original solving community:

- P2014 = `97513779050322159297664671238670850085661086043266591739338007321`
- Q2014 = `77506098606928780021829964781695212837195959082370473820509360759`
- N2014 = `7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639`

The published historical factorization and explicit exponent fix this extra RSA inverse independently of LP2. Running the **same previously frozen** 76/75-rune p55 GP29 serialization produces:

| Original p55 input | 2014 RSA 54-byte decoded message prefix | Printable ASCII | 0x00 OAEP prefix |
| --- | --- | ---: | --- |
| All 76 | `941ae5138da36a3ecc6dcc6763c0eaaa` | 24/54 | **absent** |
| Body 75 | `34db54889da71924b3f8cce02164690b` | 19/54 | **absent** |

The complete 54-byte hex outputs are fixed as regression assertions in the existing source-native SFT. `P2014×Q2014=N2014` and exact modular re-encryption both pass, but neither decoded original begins with 0x00, so **neither is a complete 2014-style OAEP encoded message or a PKCS#1 v1.5 encoded block**. The negative is stronger historically than the 2012 postscript case because the 2014 source names the RSA encoding scheme and exponent. It still supplies no LP2-target selection; don't extrapolate to arbitrary blocks, key sources or message formats.

## Boundary and next decision

This rejects **only** the two natural direct base29 p55 serializations under **each of the two authenticated-period 432-bit RSA moduli**, with 2014 exponent 65537, as complete RSAES-OAEP or PKCS#1 v1.5 ciphertext. A different encoding, RSA padding, historical key, or earlier/later page could behave differently; none has an independently supplied LP2 selector here. No broader RSA search is justified by this result. Do not infer intentional p55 linkage from the fact that the earlier number can be factored.
