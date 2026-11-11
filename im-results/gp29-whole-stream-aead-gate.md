# Whole-stream GP29 integer and authenticated-encryption gate

**Status, 10 November 2026:** exact original-input serialization and bounded source-key test; **no LP2 plaintext, key or cipher recovered**. This is distinct from the predecessor-compacted GP28 binary transport in [the continuous GP28 header inversion](lp2-continuous-binary-file-header-inverse.md).

## Motivation and exact representation

The unknown LP2 corpus contains **12,956 runes** over the published 29-symbol Gematria Primus alphabet. A natural lossless binary representation is to interpret the entire rune-index stream (published GP order, digits 0–28) as one most-significant-digit-first base-29 integer and serialize that integer as minimal-length big-endian bytes. This is not the earlier 12,815-step predecessor-difference/base-28 representation and does not erase repeated runes or page-initial runes.

The exact original source produces:

- 12,956 GP29 digits;
- 7,868 minimal big-endian bytes;
- SHA-256: `c6eae1335b7809becbdb6a2bc9895a1efbfe705adf75d6990bc4aaf37b41ad62`;
- empirical byte entropy: 7.9768853688 bits/byte.

The output length has an interesting exact decomposition:

\[
7868 = 12 + 7840 + 16 = 12 + (490\times16) + 16.
\]

That is compatible in length with either a conventional AES-GCM or ChaCha20-Poly1305 envelope: a 12-byte nonce, 7,840-byte ciphertext, and 16-byte authentication tag. The length fit is **not evidence of encryption**; a random-looking byte string can be split this way after the fact.

For the natural GP29 big-endian representation, the proposed fields are:

- nonce: `08734843a55193dcbb7231b5`;
- ciphertext: 7,840 bytes;
- tag: `2303cce245abaae21697704a791e02ea`.

## A separate all-alphabet binary-header exclusion

**Agent 5, 11 November 2026: exact original-source necessary condition with two complete synthetic round trips.** The same 12,956 ciphertext runes can be viewed as **one** most-significant-first radix-29 integer while keeping the assignment of numerical digits to the 29 published glyph identities completely secret. This extends the known-order binary reading above by allowing **all 29! fixed alphabet permutations**, without enumerating a key or using English-language statistics. Because the original first two glyphs differ, at most its first digit can be zero under such a bijection; permitting both zero and nonzero leading glyph digits gives possible minimal big-endian byte sizes **7,866, 7,867 and 7,868**.

For any candidate byte header, calculate the exact interval of all possible completed files beginning with those bytes, intersect the interval with the relevant number of significant radix-29 digits, and extract the initial positional base-29 digits that are forced regardless of all unknown file suffix bytes. A fixed bijection must preserve **every equality and inequality relation** among those forced positions and the original glyph positions. This is a complete all-secret-alphabet obstruction, not a guessed digit assignment.

**JPEG:** For each valid conventional first JPEG marker code `01` (TEM) and `C0` through `FE`, and an initial `FF` fill byte, the signature `FF D8 FF <marker-or-fill>` has no compatible representation under **any** fixed 29-way digit permutation. All **65** first-marker/fill cases and all allowed significant-digit/byte-length variants fail. For example, the usual JFIF marker `FF D8 FF E0` allows only byte length **7,867** and forces the leading base-29 digits `[1,23,13,15,14,14]`: positions 4 and 5 must be equal. The genuine source rune indices are `[15,8,18,3,6,19,27,0,15,...]`, with positions 4 and 5 **6 and 19**, unequal. A first TEM marker `FF D8 FF 01` instead forces digit equality at positions 5 and 6, where original glyphs **19 and 27** differ. No trailing JPEG data can repair either contradiction.

**Ordinary LZ4 one-block format without optional size or dictionary ID:** The mere four-byte magic `04 22 4D 18` is initially consistent under one 7,868-byte interpretation, but every one of the **32** legal combinations of the documented version-one `FLG` options (block independence, block checksum, content checksum) and four legal block-size codes `BD` fails after its required `xxHash32` descriptor-checksum byte is fixed. Consequently all **64** compressed/uncompressed one-block layouts with their corresponding exact four-byte block-size fields fail as well. This is restricted to that source-specified ordinary header family; optional content-size/dictionary fields or exotic multi-frame transports are outside the gate.

Both controls use **complete** 12,956-digit hidden-permutation encodings, reconstruct the binary input byte-for-byte, and accept all forced header equalities: one has a conventional JPEG-header-bearing binary prefix; the other is a syntactically valid uncompressed single-block LZ4 frame. They establish the power of the exact header gate without claiming JPEG-content parsing for the header-only control. The source-only reproducer is [`sims/lp2_gp29_whole_stream_header_sft.cjs`](../sims/lp2_gp29_whole_stream_header_sft.cjs), which passed the [existing manual GP29 workflow, run 42934026528](https://github.com/FlareZ123/liber-primus/actions/runs/42934026528). The tested ordinary LZ4 field layout and checksum follow the [published LZ4 frame-format specification](https://github.com/lz4/lz4/blob/dev/doc/lz4_Frame_format.md).

**ASCII-armored OpenPGP is also excluded under the same all-secret-alphabet, direct GP29 transport.** Every conventional OpenPGP armor begins with literal ASCII `-----` (including `-----BEGIN PGP SIGNED MESSAGE-----`, `MESSAGE`, `SIGNATURE` and public-key blocks). In fact, the **first three hyphens alone**, byte prefix `2D 2D 2D`, force GP29 digit positions 1 and 4 to be identical: the original source digit prefix under the only compatible 7,867-byte, one-leading-zero case is `[0,9,7,19,9]`. Original ciphertext at positions 1 and 4 has GP rune indices **8 and 6**, unequal. This is an exact contradiction for all 29! fixed digit mappings and every possible trailing byte. The updated SFT roundtrips a full 7,867-byte synthetic stream with an authentic ASCII-armored PGP heading through a concealed secret rune permutation, including its correct one-leading-zero radix interpretation, without needing a valid signature. [Successful final original-input and positive-control CI 42935896776](https://github.com/FlareZ123/liber-primus/actions/runs/42935896776). The whole-stream GP29 encoding therefore cannot **directly serialize conventional ASCII armor**, irrespective of the key or packet contents. Other layers, per-page serialization, changed alphabets, and transformed armor remain untested.

**Historical OpenPGP continuation:** Because Cicada demonstrably used the signing Key ID `181F01E57A35090F`, one bounded *first-packet* test can be made without asserting the whole file is a single packet. Under [RFC 4880 §5.4](https://www.rfc-editor.org/rfc/rfc4880.html#section-5.4), a version-3 one-pass signature begins with a 13-byte body: version, signature type, hash algorithm, public-key algorithm, eight-byte signing Key ID, and a final nested-signature flag. Both legacy and new packet-headers can encode this length as `90 0D` and `C4 0D`. The exact source-locked signing Key ID is from contemporary Cicada messages, independently indexed in the [public signed-message timeline](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json). For every combination of the **16** declared signature-type codes, **7** named hash codes, **10** named public-key codes, **2** final flag values and **2** header styles, **all 4,480 original-input candidates fail** the secret-alphabet equality test, with no plaintext or packet-key fitting. A typical RSA/SHA-256 binary case, `C4 0D 03 00 08 01 18 1F 01 E5 7A 35 09 0F 01`, forces base29 digit **1=7** while the original ciphertext glyphs at those indices are **8 and 0**, unequal. The executable SFT additionally roundtrips a whole positive binary stream beginning with this 13-byte one-pass packet header under a hidden 29-symbol bijection. [Successful independent updated GitHub Actions run 42935516668](https://github.com/FlareZ123/liber-primus/actions/runs/42935516668).

This is an **original-source conditional negative** for an unencrypted whole-stream GP29 conversion into a 2014-style *one-pass* OpenPGP signed message using the historical signing key and these packet fields. It does **not** exclude the far more prevalent **ASCII-armored clearsigned messages**, stand-alone signature packets, detached signatures, other key IDs or PGP data after an encryption layer. In particular, surviving short prefix patterns for encrypted or literal-data packets are not an authenticated PGP decode or key.

**Full PDF-version-header rejection:** The short `%PDF-` prefix by itself cannot be excluded under a hidden GP29 alphabet and the permitted initial zero; however the complete conventional `%PDF-1.0` through `%PDF-1.7` or `%PDF-2.0` prefixes **all** require radix29 position-equality patterns absent from the original manuscript **in both source directions**. For example the original-order `%PDF-1.4` header, in the only capacity-compatible 7,867-byte case with one leading zero digit, forces first digits `[0,7,18,26,6,28,24,21,18,13,19,18,19]`. Positions **0 and 8** are unequal base29 digits (0 and 18) but original source GP indices at those positions are **15 and 15**, equal. This is a strict contradiction for every fixed secret alphabet, independently of the rest of the purported PDF. The same source-and-plant SFT roundtrips a complete byte stream beginning with a normal PDF version header under a hidden GP permutation, without asserting a valid complete PDF object graph. [Corrected and successful original-source PDF/JPEG/LZ4/PGP gate CI 42937111941](https://github.com/FlareZ123/liber-primus/actions/runs/42937111941). This excludes the direct unencrypted standard-PDF-payload reading only; it does not exclude a source PDF used upstream to make the published JPEGs or a ciphertext-encrypted PDF.

**Reverse-direction falsification (source-only 11 November 2026):** The exact same 29!-invariant header tests were repeated on the **complete reversed original ciphertext rune sequence** before interpreting it as one base-29 integer. All **65** standard JPEG first-marker/fill cases fail in either original or reverse source direction. Both directions exclude the `2D 2D 2D` ASCII-armored PGP prefix and all **4,480** historic signer-ID one-pass PGP header configurations. For LZ4, **one reversed-source descriptor**, `FLG=0x50, BD=0x50`, passes the early descriptor checksum/equality gate where none passes in forward order. However the obligatory subsequent little-endian block-length bytes force base-29 digit positions **2=10** while reversed original ciphertext positions 2 and 10 have indices **17 and 28**, unequal; the surviving descriptor and **all 64 complete ordinary one-block layouts** therefore fail in reverse order as well. This strengthens the source-qualified conclusion across the two natural whole-stream reading directions without assuming a secret symbol ordering or an encryption key. [Executed full original-source reverse and positive-control regression 42936525697](https://github.com/FlareZ123/liber-primus/actions/runs/42936525697).

**Decision:** If the 12,956 original runes are exactly a single whole-stream base-29 representation of unknown binary bytes under one secret GP digit alphabet, the bytes cannot begin with a standard JPEG or the stated ordinary LZ4 frame. The test does not identify the original intermediate type, a key, plaintext or destination. A preceding encryption layer, binary header stripping, per-page framing, changing alphabets and other file formats remain live.

## Source-constrained authentication test

The reproducible script [`sims/gp29_whole_stream_aead_gate.cjs`](../sims/gp29_whole_stream_aead_gate.cjs) constructs **91 distinct 32-byte keys** from a finite set of source-derived materials:

1. the eight 32-byte columns of the 32×8 base-60 grid, including byte reversals;
2. three archived 256-byte historical hidden-service excerpts, using aligned 32-byte chunks, reversals, full-source SHA-256 hashes and bounded grid/source concatenation hashes;
3. the 64-byte AN END digest, its natural 32-byte halves and whole-digest hashes;
4. the visually confirmed 51-rune red span on LP2 page 53, converted as a base-29 integer and tested in four simple orientations.

No unconstrained password search, arbitrary sliding-window key search or arbitrary KDF search is performed.

The script tests five explicitly declared payload orientations:

- published GP order, big-endian bytes;
- reversed rune stream;
- Atbash rune indices;
- reversed Atbash rune stream;
- byte-reversed natural GP29 serialization (little-endian byte orientation).

For each orientation, it tests AES-256-GCM and ChaCha20-Poly1305 using the first 12 bytes as nonce, the middle 7,840 bytes as ciphertext and the final 16 bytes as tag. This gives **5 × 91 × 2 = 910 authentication attempts**. Both cryptographic positive controls (known key, nonce and plaintext) pass.

<badge color="warning">0 / 910 authenticated</badge>

No candidate authenticated. The five orientations all serialize to 7,868 bytes and each receives 182 attempts. The machine-readable summary is [`im-results/gp29-whole-stream-aead-gate.json`](gp29-whole-stream-aead-gate.json). The successful [GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/42900208576) reproduces the exact original-source result and uploads the JSON artifact.

## Interpretation and limits

This rejects only the **declared 12-byte nonce / 7,840-byte ciphertext / 16-byte tag framing under the 91 tested source-derived 32-byte keys and five orientations**. It does not exclude:

- an unknown or independently sourced key/KDF;
- AES-CTR, another unauthenticated stream/block mode, or another cipher;
- a different nonce/tag location or framing;
- wordwise, pagewise, or sectionwise encodings;
- a preceding or following transformation.

The 7,868-byte length is therefore a useful lead for a finite test, not a recovered encryption scheme. The absence of an authentication hit is a bounded negative, not a proof that GP29 binary transport is impossible.

## Reproduction

From the repository root:

```sh
node sims/gp29_whole_stream_aead_gate.cjs
```

The manual/commit-triggered workflow is [`.github/workflows/gp29-whole-stream-aead-gate.yml`](../.github/workflows/gp29-whole-stream-aead-gate.yml). The script reads the canonical corpus, base-60 grid, historical hidden-service candidates, AN END digest witness and page-53 red-span annotation directly from `resources/`; it validates both AEAD implementations with positive controls before testing the original data.
