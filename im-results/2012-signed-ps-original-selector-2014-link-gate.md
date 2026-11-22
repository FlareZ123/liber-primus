# 2012 signed P.S. versus 2014 LP2: source-selector decision

**Original investigation:** Agent45, 14 November 2026, Director issue #927.  
**Source correction and signature verification:** Agent11, 22 November 2026.

## Source objects and authentication

The 2012 closing image and its OutGuess extraction are preserved in the external Cicada archive:

- Original image: `puzzles/2012/images/vjuNp.jpg`, 31,004 bytes, Git blob SHA `2f61f1ef42a0e4df39c5a58e570a8d0f4f8f316a`.
- OutGuess extraction: `archives/cijhho/2012/additional docs/outguss/vjuNp.jpg.out`, 1,398 bytes, Git blob SHA `c663727c481f86ccedf26757800f60026ee56809`.
- Separately preserved clear-signed message: `pgp/messages/2012-01-final-message.asc`, 1,325 bytes, Git blob SHA `e23635603e319d2a69013cce659ed4ece5c00089`.
- Archived public key: `pgp/key/cicada-3301-public-key.asc`, Git blob SHA `d44aec389e2f346c6b9d149d4c61e890f62979c9`.

The image has the same Git blob SHA at several paths in that archive. The OutGuess output and separate clear-signed message both contain the same 131 decimal P.S. digits and the two literal continuation backslashes. Their surrounding whitespace differs.

**OpenPGP verification was performed independently.** GnuPG reports a good signature on both the OutGuess clear-signed output and the separate `2012-01-final-message.asc`, made on 6 February 2012 at 22:59:40 UTC. The signing key ID is `181F01E57A35090F`; its archived primary fingerprint is:

```
6D85 4CD7 9333 22A6 01C3  286D 181F 01E5 7A35 090F
```

GnuPG also warns that the key is not certified in its trust database. Thus the signature is cryptographically valid under the archived Cicada key; real-world identity attribution still rests on the key's historical provenance, not a web-of-trust certification. The P.S. digits, line breaks, and continuation backslashes are inside the verified cleartext.

The signed message's surrounding context says the 2012 hunt has ended: “We have now found the individuals we sought,” “our month-long journey ends,” and “For now.” It promises more opportunities but does not name Liber Primus, a later page, a cipher, a rune alphabet, a key clock, or a recipient.

## Exact displayed geometry and quarter-turn

The earlier digits-only analysis treated the three numeric rows as ragged widths 40/45/46. That is true of the digits alone, but it omits characters that are visibly present in the original image and authenticated in the signed message.

The **complete displayed block** is exactly 3 × 46 characters:

1. `P.S. ` + the first 40 digits + the first continuation backslash = 46 characters.
2. The next 45 digits + the second continuation backslash = 46 characters.
3. The final 46 digits = 46 characters.

No padding or invented characters are required. Rotating this literal rectangle clockwise and reading each new row from the original bottom row upward produces a stream ending in **3301** (immediately before the two continuation backslashes). The standard counterclockwise rotation, read row-major, begins with the two backslashes followed by **1033**. This reproduces the modern quarter-turn observation using the complete source-visible block; the earlier digits-only four-layout test did not test this geometry.

This is a real, source-authenticated visual property. It is not yet a reusable LP2 key operation. The rotation returns the already-known Cicada identifier printed in the same message; it can be a self-identification flourish or orientation marker. Neither the signed message nor the image instructs the solver to use the resulting digits as a key, and neither identifies an LP2 receiver.

## Tested later-book uses

### Direct RSA reuse

The P.S. integer is a 432-bit RSA modulus in the reconstructed 2012 key material. Existing original-input tests are documented in [the RSA direct-reuse gate](2012-ps-rsa-original-lp2-direct-reuse-gate.md): 377 valid original p49–51 54-byte table-block representatives and eight p55 rune-integer interpretations produced no valid PKCS#1 v1.5 plaintext packet. The source-default PSS signature scheme was also tested: zero of the 377 table representatives and zero of the four p55 public-exponent outputs passed the necessary PSS structure; the implementation passed a synthetic signature positive control.

The [2012 integer screen](2012-ps-number-integer-screen.md) additionally checks the reconstructed factors, direct GP29 conversions, 2013 material, and the 2014 Stage11 default-key OutGuess artifacts. The source-default Crypt::RSA OAEP-SHA1 path produced no valid blocks in the 2013 wisdom/folly blob or the tested 2014 p17/p21/p43 OutGuess outputs. The same files produced no default PSS signature structures. Those negative results apply only to the named artifacts and encodings.

### BASE29 reuse

The [2013 BASE29-to-p55 gate](lp2-2012-signed-ps-base29-p55-gate.md) converts the P.S. numeral to an 89-rune stream. Both natural 76-symbol slices and both additive directions fail native plaintext; the 13 unused digits recover at most one of 13 known solved p56 letters. The original p0 NEWBAS 89-position readout also fails.

### Direct rotated digit stream

As a bounded exploratory check, the 131 digits read from the quarter-turned display were tested against p22, which independently has 131 runes. Direct mod-29 addition, subtraction and Beaufort, with digits interpreted directly or mapped to the first ten GP prime values, did not yield plaintext. One further fixed affine hypothesis was tested: take the reconstructed RSA public exponent e = 65537, reduce it modulo 29 to A = 26 (inverse 19), and decrypt with P_i = 19(C_i - k_i) mod 29, where k_i is the rotated decimal digit stream. It produced no plaintext (29×IoC = 1.0967; no plausible word output).

The length match is noteworthy, but p22's six source transcription lines contain 22, 24, 23, 23, 19, and 20 runes; pairing adjacent lines gives 46, 46, and 39, so the third pair is short by seven and no source instruction supplies a padding or block rule. The exact 131:131 match therefore does not yet define a complete key clock or even a uniform three-block segmentation. The exponent reduction is a hypothesis, not an authored instruction. This is not evidence against every conceivable use; no further key mappings, padding, matrix-size, or clock sweeps should be searched without a new selector.

## Decision

The source record now establishes more than the earlier report stated: the original signed P.S. display is a genuine 3 × 46 rectangle, and its quarter-turn visibly recovers the Cicada identifier. The previous claim that no source-simple rectangle existed must be narrowed to **digits-only rows**.

The larger decision remains unchanged: **no originally authored 2012 instruction links this P.S. object to a specific LP2 page or solved p56 control, and no complete reversible LP2 operation or key clock is supplied.** The quarter-turn confirms the source's Cicada marker; it does not by itself establish a reusable LP2 key. Keep issue #927 closed as a source-selector negative. Reopen only if an authored, dated source links this exact P.S. object to an identified LP2 receiver and supplies the missing operation/key schedule.

## Reproduction and sources

- Verify both signed messages with the archived Cicada public key using `gpg --verify`.
- Reconstruct the three 46-character rows from the literal displayed text, including the `P.S. ` prefix and two backslashes. For a clockwise reading, visit columns 0 through 45 and read rows 2, 1, 0 in each column. For counterclockwise, visit columns 45 through 0 and read rows 0, 1, 2.
- [Original vjuNp.jpg image](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2012/images/vjuNp.jpg)
- [OutGuess P.S. output](https://github.com/krisyotam/cicada3301/blob/main/archives/cijhho/2012/additional%20docs/outguss/vjuNp.jpg.out)
- [Clear-signed 2012 message](https://github.com/krisyotam/cicada3301/blob/main/pgp/messages/2012-01-final-message.asc)
- [Cicada 3301 public key](https://github.com/krisyotam/cicada3301/blob/main/pgp/key/cicada-3301-public-key.asc)
- [Modern unused-hints note](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/analysis/HINTS-NEVER-USED.md#ps-from-the-end-message-of-2012) — a modern interpretation, not an authored 2012 instruction.
