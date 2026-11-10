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
