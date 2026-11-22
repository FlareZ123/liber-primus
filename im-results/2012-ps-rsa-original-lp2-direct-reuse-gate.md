# The factored 2012 P.S. RSA key does not directly unseal the LP2 numerical table or p55

**Evidence class:** finite original-source, standard-framing negative. The 2012 P.S. integer and its factorization are historical public data. Applying that earlier key to the later LP2 artifact is an exploratory reuse premise, with **no original Cicada instruction selecting this transfer**. No unknown LP2 plaintext, private LP2 encryption key, cipher mechanism, or destination was recovered.

## Clue and falsifiable mechanism

The 2012 *Valēte!* closing message includes a P.S. containing the 131-digit integer

`10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631`.

The historically published integer factors into the two **216-bit primes**

- `99554414790940424414351515490472769096534141749790794321708050837`
- `104593961812606247801193807142122161186583731774511103180935025763`

Their product is the exact **432-bit** integer. Cicada used RSA elsewhere in its early puzzles, making a past encrypted RSA channel worth one bounded check. The [original closing-message context](https://github.com/neuroretransmit/cicada/blob/main/2012/011-valete/README.md) already records the factorization. The public exponent **65537 is assumed**, not supplied by the P.S. as an LP2 instruction. There is no source evidence that the 2012 key was deliberately reused in 2014.

A 432-bit RSA modulus accepts **54-byte** ciphertext blocks. The 2014 LP2 p49–51 original artifact presents exactly **256 base60-encoded bytes** in a 32×8 table. The independent p55 source has 76 GP29 runes, which can be interpreted as a single **369-bit** number in printed ordinal order. These two concrete representations permit a cheap, decisive *standard RSA packet* check without guessing plaintext words or RSA keys.

## Complete original-input tests

The [standalone Node.js 22 reproducer](../sims/lp2_2012_ps_rsa_reuse_sft.cjs) consumes the pinned `resources/liber-primus/base60-grid.json` byte rows and `resources/liber-primus/lp2-corpus.json` p55 runes. It asserts the RSA factorization, derives the private exponent with Euler φ, and uses exact BigInt modular exponentiation.

1. Scan all **203** contiguous 54-byte windows in the original 256-byte row-major table, in printed and reversed *byte* order: **406** fixed candidates. **377** of these are strictly less than the RSA modulus and therefore valid 54-byte representatives. For each, apply the private exponent, zero-pad to precisely 54 output bytes and check strict PKCS #1 v1.5 type-1/type-2 framing (zero header, type octet, ≥8 padding octets, zero delimiter, nonempty body). **Zero** pass framing. **Zero** even start with the required two-octet prefix, and **zero** contain ≥38/54 ASCII-printable bytes.
2. Interpret all **76** printed p55 GP tokens as a single base29 big-endian integer, either as GP ordinal digits or as GP prime values mod29. Use printed/reversed rune order; apply public or private RSA exponent, yielding **eight** direct outputs. **All eight** are valid modulus inputs. **Zero** have PKCS #1 v1.5 framing. The printable byte counts are **17, 28, 20, 21, 21, 16, 17, 15** in the frozen iteration order, all on a 54-byte width.
3. A synthetic 54-byte type-2 block with fixed nonzero padding and a known textual payload is RSA-encrypted and exactly RSA-decrypted; its framing is correctly recognized. This checks the private-exponent and framing implementation independently of the original LP2 data.

4. Crypt::RSA 1.99 documents PSS as its default signature scheme. The reproducer now checks the necessary EMSA-PSS structure after applying the public exponent: SHA-1, MGF1-SHA1, 20-byte salt, 12 zero padding octets for this 54-byte modulus, delimiter 0x01, and trailer 0xBC. Across the same 377 valid p49-p51 representatives and the four p55 public-exponent outputs, **zero** PSS structures pass. A synthetic PSS signature positive control is also encoded, signed with the reconstructed private exponent, recovered with the public exponent, and checked against its known message and salt.

The updated script was run successfully by [manual Actions run 44969837833](https://github.com/FlareZ123/liber-primus/actions/runs/44969837833). The cross-round 2013/2014 OAEP and PSS screens are in [the 2012 integer screen](2012-ps-number-integer-screen.md).

## Decision

The old factored RSA modulus does **not** directly yield a PKCS #1 v1.5 payload or the source-default PSS signature structure from any of the 377 valid p49-p51 table representatives or four p55 public-exponent outputs. The cross-round screen also finds no source-default OAEP encryption blocks or PSS signature structures in the named 2013 wisdom/folly blob or 2014 p17/p21/p43 OutGuess artifacts. The PSS structure check is necessary but not full message verification; no candidate reached the latter stage.

**Stop the branch here unless an original source selects the 2012 P.S. key as an LP2 input or supplies a different exact packet extraction.** Arbitrary RSA exponent, byte-order, block-window and encoding hunts would repeat the same unsupported reuse premise. The main LP2 cipher remains unresolved, with the stronger source-selected polynomial/table and signed-2016 map routes still under active study.
