# OpenPGP issuer ID: authentication role established; address role unsupported

## Decision

**Bounded negative for Director Issue #127:** the authenticated OpenPGP issuer ID has a clear, source-selected **authentication** role. No original source selects an address role, representation, or indexing operation. Retire the issuer-ID-as-address hypothesis unless a new primary instruction explicitly supplies that mapping.

## Primary 2016 instruction

The clear-signed message in `resources/historical/cicada2016-4gq25-outguess.asc` says:

> Beware false paths. Verify OpenPGP 7A35090F.

The verb is **verify**. The text does not say to decode the identifier, use it as a coordinate, append it to a URL, or map it into a page/word/rune sequence. The surrounding “words are the map … numbers are the direction” sentence refers to the manuscript's words and numbers; it does not override the separate explicit PGP-verification instruction.

The 2016 signed message was independently verified with GnuPG against the Cicada public key. Its signature packet is an ordinary v4 RSA/SHA-1 signature. The issuer subpacket contains the standard 64-bit key ID `181F01E57A35090F`; there is no extra notation-data, intended-recipient, or other signature subpacket that selects an address operation. The previously documented 540-byte signature-body length is a normal consequence of the 4096-bit RSA signature and is shared by the 2017 signed-message control; it is not an address payload.

## Key identity and historical continuity

GnuPG's public-key listing for `7A35090F` gives:

- Algorithm/size: RSA, 4096 bits.
- Creation time: **2012-01-05T03:39:43Z**.
- Full fingerprint: `6D854CD7933322A601C3286D181F01E57A35090F`.
- 64-bit OpenPGP key/issuer ID: `181F01E57A35090F`.
- 32-bit short key ID named in the signed text: `7A35090F`.
- User ID: `Cicada 3301 (845145127)`.

The 64-bit issuer ID is the final 16 hex digits of the fingerprint; the visible 32-bit short ID is its final eight hex digits. The UID comment `845145127` is a separate user-ID field and must not be confused with the issuer ID.

The 2012 RSA-email archive independently establishes the intended use of the same short key ID. Its valid `quaetrix0@gmail.com.asc` message says:

> Only messages signed with public key ID 7A35090F are valid.

GnuPG verifies that 2012 signed message under the same primary key used to verify the 2016 message. That 2012 archive README identifies it as the only validly signed sample among its three page copies; the `unknown` and `another_unknown` copies have redactions and their signatures do not verify. Thus the key ID's use as an authenticity discriminator is not inferred from a single 2016 phrase: it is stated explicitly in a 2012 message and repeated in the 2016 instruction.

## Address-role gate

A source-derived address operation would need to freeze at least:

1. which value is addressed: 32-bit short ID `7A35090F`, 64-bit issuer ID `181F01E57A35090F`, or the 160-bit fingerprint;
2. the representation/radix and byte order;
3. the address space and origin (page, word, rune, byte, or other);
4. the operation that maps the identifier to that address.

No primary source supplies any of these choices. The 2016 text explicitly selects verification; the 2012 message explicitly selects signature validity. Treating the issuer metadata as a page or word address would therefore be an unconstrained reinterpretation. No radix sweep or numerical address search was run.

## Exact missing instruction

The missing evidence is a primary-source sentence or artifact that explicitly tells a solver to use the OpenPGP issuer/key ID as an address and specifies which identifier representation and address domain/indexing convention to apply. Without that instruction, no frozen address prediction or held-out original-cipher test can be justified.

**Conclusion:** keep `7A35090F` as the authentication key ID. The address-role branch is retired on current evidence. This does not identify an LP2 cipher, key, plaintext, or p56 preimage.

## Reproduction and source files

- 2016 signed text: `resources/historical/cicada2016-4gq25-outguess.asc` (Git blob SHA-1 `a0d8bd2d73613e01cd8a2103d5721b2b998ee482`); local GnuPG verification succeeded.
- 2012 valid sample: `neuroretransmit/cicada@b13600373d3400d75ec4208198019f3d92a304dd/2012/008-rsa-emails/quaetrix0@gmail.com.asc`; local GnuPG verification succeeded. Its archive README and `sources.txt` are in the same pinned repository.
- Existing packet and signature analysis: [`lp2-tree121-signed2016-source-gate.md`](lp2-tree121-signed2016-source-gate.md), [`p32_2016_openpgp_frozen_byte_gate.cjs`](../sims/p32_2016_openpgp_frozen_byte_gate.cjs), and [`lp2_p32_signed2016_pgphash_source_sft.cjs`](../sims/lp2_p32_signed2016_pgphash_source_sft.cjs).
- Public-key listing: `gpg --batch --with-colons --fingerprint 7A35090F`.

The original key and signed-message files are retained unchanged. This report changes only the interpretation of the issuer-ID address hypothesis; it does not alter the underlying packet evidence.
